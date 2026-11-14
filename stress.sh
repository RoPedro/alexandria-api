#!/usr/bin/env bash
#
# Alexandria API stress test runner.
#
#   ./stress.sh          brings the stack up (detached), seeds the database and
#                        leaves it running
#   ./stress.sh -g       brings the stack up, seeds the database, runs Gatling,
#                        writes stress-report.md and finally removes the
#                        containers
#
# Environment overrides:
#   STRESS_RPS          requests per second (default 100)
#   STRESS_DURATION     test duration in seconds (default 30)
#   STRESS_API_URL      API base url (default http://localhost:8000)
#   STRESS_REPORT       report path (default ./stress-report.md)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

RPS="${STRESS_RPS:-100}"
DURATION="${STRESS_DURATION:-30}"
API_URL="${STRESS_API_URL:-http://localhost:8000}"
REPORT="${STRESS_REPORT:-$ROOT_DIR/stress-report.md}"
GATLING_DIR="$ROOT_DIR/gatling"
GATLING_LOG="$ROOT_DIR/gatling/target/gatling-console.log"
SIMULATION="alexandria.ApiStressSimulation"

RUN_GATLING=0
CLEANUP_ON_EXIT=0

usage() {
    sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

log() {
    printf '\033[1;34m[stress]\033[0m %s\n' "$*"
}

warn() {
    printf '\033[1;33m[stress]\033[0m %s\n' "$*" >&2
}

fail() {
    printf '\033[1;31m[stress]\033[0m %s\n' "$*" >&2
    exit 1
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -g|--gatling)
            RUN_GATLING=1
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            usage >&2
            fail "Unknown option: $1"
            ;;
    esac
done

resolve_compose() {
    if docker compose version >/dev/null 2>&1; then
        COMPOSE=(docker compose)
    elif command -v docker-compose >/dev/null 2>&1; then
        COMPOSE=(docker-compose)
    else
        fail "docker compose is not available (install the compose plugin or the docker-compose binary)"
    fi
}

resolve_maven() {
    if command -v mise >/dev/null 2>&1 && mise which mvn >/dev/null 2>&1; then
        MAVEN=(mise exec -- mvn)
    elif command -v mvn >/dev/null 2>&1; then
        MAVEN=(mvn)
    else
        fail "maven is not available (install it, or let mise provide it: mise install maven)"
    fi
}

port_in_use() {
    local port="$1"
    if command -v ss >/dev/null 2>&1; then
        ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]${port}\$"
    elif command -v lsof >/dev/null 2>&1; then
        lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    else
        return 1
    fi
}

cleanup() {
    local exit_code=$?
    if [[ $CLEANUP_ON_EXIT -eq 1 ]]; then
        log "removing containers"
        "${COMPOSE[@]}" down --remove-orphans >/dev/null 2>&1 || true
    fi
    exit "$exit_code"
}

write_report() {
    local log_file="$1" report="$2" status="$3"
    local result="PASS"
    if [[ "$status" -ne 0 ]]; then
        result="FAIL"
    fi

    local html_report=""
    if [[ -d "$GATLING_DIR/target/gatling" ]]; then
        html_report="$(find "$GATLING_DIR/target/gatling" -mindepth 2 -maxdepth 2 -name index.html -printf '%T@ %h\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)"
    fi

    {
        echo "# Alexandria API — Gatling stress report"
        echo
        echo "- Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
        echo "- Target: \`$API_URL\`"
        echo "- Load: $RPS requests/second for ${DURATION}s"
        echo "- Simulation: \`$SIMULATION\`"
        echo "- Result: **$result**"
        echo
        awk '
            function trim(s) { gsub(/^[ \t]+|[ \t]+$/, "", s); return s }
            function num(s) { gsub(/[ ,]/, "", s); return s + 0 }

            /^---- Requests/ {
                delete g_total; delete g_ok; delete g_ko; delete g_order; g_order_n = 0
                next
            }
            /^> GET \/api\/v1\// {
                n = split($0, f, "|")
                path = trim(f[1]); sub(/^> /, "", path)
                m = split(path, seg, "/")
                entity = seg[4]
                group = (seg[5] != "" ? "getEntity" : "getAll") " /api/v1/" entity "/"
                if (!(group in g_total)) g_order[++g_order_n] = group
                g_total[group] += num(trim(f[2]))
                g_ok[group] += num(trim(f[3]))
                g_ko[group] += num(trim(f[4]))
                next
            }
            /^---- getAll routes/ { scen = "getAll routes"; next }
            /^---- getEntity routes/ { scen = "getEntity routes"; next }
            scen != "" && /done:/ {
                if (match($0, /done:[ ]*[0-9,]+/)) s_done[scen] = num(substr($0, RSTART + 5, RLENGTH - 5))
                scen = ""
                next
            }
            /^---- Global Information/ { in_global = 1; next }
            /^---- Response Time Distribution/ { in_global = 0; in_dist = 1; next }
            in_global && /^> / {
                split($0, f, "|")
                name = trim(f[1]); sub(/^> /, "", name)
                g_rows[++g_n] = "| " name " | " trim(f[2]) " | " trim(f[3]) " | " trim(f[4]) " |"
                next
            }
            /^---- Response Time Distribution/ { in_global = 0; in_dist = 1; next }
            /^---- Errors/ { in_dist = 0; in_errors = 1; next }
            in_dist && /^> / {
                line = $0; sub(/^> /, "", line)
                label = line; sub(/[[:space:]]+[0-9,]+[[:space:]]*\([0-9.]+%\)$/, "", label)
                count = line; sub(/[[:space:]]+[0-9,]+[[:space:]]*\([0-9.]+%\)$/, "", count)
                pct = line
                if (match(pct, /\([0-9.]+%\)/)) pct = substr(pct, RSTART + 1, RLENGTH - 2)
                d_rows[++d_n] = "| " trim(label) " | " trim(count) " | " pct "% |"
                next
            }
            in_errors && /^> / {
                line = $0; sub(/^> /, "", line)
                count = line; sub(/[[:space:]]+\([0-9.]+%\)$/, "", count)
                pct = line
                if (match(pct, /\([0-9.]+%\)/)) pct = substr(pct, RSTART + 1, RLENGTH - 2)
                e_rows[++e_n] = "| " trim(count) " | " pct "% | " trim(line)
                next
            }
            /^====/ { in_dist = 0; in_errors = 0; next }
            /^Global: / {
                line = $0; sub(/^Global: /, "", line)
                actual = ""
                if (match(line, /\(actual : [^)]*\)/)) actual = substr(line, RSTART + 10, RLENGTH - 11)
                passed = (line ~ / : true/) ? "PASS" : "FAIL"
                desc = line; sub(/ : (true|false)[ ]*\(actual : [^)]*\)$/, "", desc)
                a_rows[++a_n] = "- **" passed "** — " desc " (actual: " actual ")"
                next
            }
            END {
                print "## Global metrics"
                print ""
                print "| Metric | Total | OK | KO |"
                print "|---|---:|---:|---:|"
                for (i = 1; i <= g_n; i++) print g_rows[i]
                print ""
                print "## Response time distribution"
                print ""
                print "| Bucket | Requests | Share |"
                print "|---|---:|---:|"
                for (i = 1; i <= d_n; i++) print d_rows[i]
                if (e_n > 0) {
                    print ""
                    print "## Errors"
                    print ""
                    print "| Count | Share | Error |"
                    print "|---:|---:|---|"
                    for (i = 1; i <= e_n; i++) print e_rows[i]
                }
                print ""
                print "## Scenarios"
                print ""
                print "| Scenario | Requests |"
                print "|---|---:|"
                split("getAll routes|getEntity routes", order, "|")
                for (i = 1; i <= 2; i++) {
                    if (order[i] in s_done) print "| " order[i] " | " s_done[order[i]] " |"
                }
                print ""
                print "## Route coverage"
                print ""
                print "| Route group | Requests | OK | KO |"
                print "|---|---:|---:|---:|"
                for (i = 1; i <= g_order_n; i++) {
                    group = g_order[i]
                    print "| " group " | " g_total[group] " | " g_ok[group] " | " g_ko[group] " |"
                }
                print ""
                print "## Assertions"
                print ""
                for (i = 1; i <= a_n; i++) print a_rows[i]
            }
        ' "$log_file"
        if [[ -n "$html_report" ]]; then
            echo
            echo "## Full report"
            echo
            echo "HTML report: \`${html_report#"$ROOT_DIR/"}/index.html\`"
        fi
    } > "$report"
}

trap cleanup EXIT

resolve_compose
resolve_maven

# ---------------------------------------------------------------------------
# 1. stack up (detached), recreating any container left from a previous run
# ---------------------------------------------------------------------------
if port_in_use 8000 && ! docker ps --filter "name=api_service" --format '{{.Names}}' | grep -q api_service; then
    fail "port 8000 is already taken by another process; stop it or set STRESS_API_URL to a free port"
fi

log "starting the stack (detached, recreating existing containers)"
"${COMPOSE[@]}" up --build --force-recreate --remove-orphans -d

log "waiting for the API to answer on $API_URL"
for _ in $(seq 1 90); do
    if curl -fsS --max-time 3 "$API_URL/api/v1/authors/" >/dev/null 2>&1; then
        break
    fi
    sleep 2
done
if ! curl -fsS --max-time 3 "$API_URL/api/v1/authors/" >/dev/null 2>&1; then
    "${COMPOSE[@]}" logs --tail=40 api_service || true
    fail "the API did not become ready on $API_URL"
fi

# ---------------------------------------------------------------------------
# 2. seed the database
# ---------------------------------------------------------------------------
log "seeding the database"
"${COMPOSE[@]}" exec -T api_service python -m db.seeds

if [[ $RUN_GATLING -eq 0 ]]; then
    log "stack is up and seeded:"
    "${COMPOSE[@]}" ps
    log "API      : $API_URL"
    log "frontend : http://localhost:5173"
    log "run './stress.sh -g' to run the stress test and tear the stack down"
    exit 0
fi

# ---------------------------------------------------------------------------
# 3. run Gatling
# ---------------------------------------------------------------------------
log "running Gatling: ${RPS} requests/second for ${DURATION}s against $API_URL"
mkdir -p "$(dirname "$GATLING_LOG")"
set +e
(
    cd "$GATLING_DIR" &&
        "${MAVEN[@]}" -B gatling:test \
            -Dgatling.simulationClass="$SIMULATION" \
            -Drps="$RPS" \
            -Dduration="$DURATION" \
            -DbaseUrl="$API_URL"
) 2>&1 | tee "$GATLING_LOG"
GATLING_STATUS=${PIPESTATUS[0]}
set -e

# ---------------------------------------------------------------------------
# 4. write the markdown report
# ---------------------------------------------------------------------------
log "writing $REPORT"
write_report "$GATLING_LOG" "$REPORT" "$GATLING_STATUS"

# ---------------------------------------------------------------------------
# 5. remove the containers
# ---------------------------------------------------------------------------
CLEANUP_ON_EXIT=1
log "done, containers removed (volumes kept; use 'docker compose down -v' to wipe the database)"
