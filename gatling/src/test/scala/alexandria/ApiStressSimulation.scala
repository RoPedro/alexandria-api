package alexandria

import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.concurrent.duration._

class ApiStressSimulation extends Simulation {

  private val baseUrl = System.getProperty("baseUrl", "http://localhost:8000")
  private val rps = System.getProperty("rps", "100").toDouble
  private val durationSeconds = System.getProperty("duration", "30").toInt
  private val listShare = System.getProperty("listShare", "0.3").toDouble

  private val listRps = math.max(1, math.round(rps * listShare).toInt)
  private val entityRps = math.max(1, rps - listRps)

  private val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .userAgentHeader("alexandria-gatling-stress")
    .disableCaching
    .shareConnections

  private def pathEncode(raw: String): String =
    java.net.URLEncoder.encode(raw, "UTF-8").replace("+", "%20")

  private val listScn = scenario("getAll routes")
    .feed(csv("datafeeders/list_routes.csv").circular)
    .exec(
      http("GET /api/v1/#{entity}/")
        .get("/api/v1/#{entity}/")
        .check(status.in(200)),
    )

  private val entityScn = scenario("getEntity routes")
    .feed(csv("datafeeders/entity_params.csv").circular)
    .exec(session => {
      val raw = session("idValue").as[String]
      val encode = session("encode").as[Boolean]
      session.set("idPath", if (encode) pathEncode(raw) else raw)
    })
    .exec(
      http("GET /api/v1/#{entity}/#{idPath}")
        .get("/api/v1/#{entity}/#{idPath}")
        .check(status.in(200, 404, 422)),
    )

  setUp(
    listScn
      .inject(constantUsersPerSec(listRps.toDouble).during(durationSeconds.seconds))
      .protocols(httpProtocol),
    entityScn
      .inject(constantUsersPerSec(entityRps.toDouble).during(durationSeconds.seconds))
      .protocols(httpProtocol),
  ).protocols(httpProtocol)
    .assertions(
      global.failedRequests.percent.lt(1.0),
      global.responseTime.percentile3.lt(2000),
      global.requestsPerSec.gt(rps * 0.9),
    )
}
