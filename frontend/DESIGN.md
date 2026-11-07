Admin Console Design Guidelines
Purpose: A framework-agnostic visual and interaction specification for building a reliable, high-density administrative console. Use this file as the default design authority unless a product requirement explicitly overrides it.

Design direction: Borrow the operational clarity and information hierarchy of Red Hat Cockpit, the resource-oriented navigation and explicit workflows of Oracle SuperCluster Virtual Assistant, and the connection/tool model and familiar administration patterns of Windows Admin Center. Do not copy their branding or reproduce legacy visual details.

1. Product character
The interface is an operational workspace, not a marketing site. It should feel calm, precise, predictable, and trustworthy.
- Prioritize clarity, status visibility, and task completion over decoration.
- Keep information density high enough for professional administration, but preserve readable spacing and clear grouping.
- Make the current scope obvious: which environment, account, workspace, host, cluster, or resource is being viewed and modified.
- Prefer stable, repeatable page patterns over one-off layouts.
- Use neutral surfaces and restrained blue accents. Reserve saturated colors for actions, links, focus, and meaningful status.
- Do not assume a specific infrastructure domain. Use the product's actual domain language for resources, navigation labels, and actions; do not invent entities or metrics.
2. Application shell and page structure
2.1 Desktop shell
Use a persistent application shell with three main regions:
1. Global header — fixed or sticky at the top; contains product identity, current scope/context, global utilities, and account controls.
2. Primary navigation — a persistent left sidebar for top-level resource areas and tools.
3. Main workspace — page title, optional breadcrumb and contextual actions, followed by the page content.
Recommended desktop dimensions:
Region	Target	Guidance
Global header	56 px high	Keep controls vertically centered. Avoid a second decorative header row.
Primary sidebar	248 px wide	Allow collapse to an icon rail around 64 px. Keep labels visible in the expanded state.
Main content inset	24 px	Reduce to 16 px on narrower viewports.
Page title area	64–88 px typical	Breadcrumb, title, optional description, and page actions.
Content max width	1,600 px	Use fluid width for wide tables and operational dashboards; constrain long-form text separately.


The shell should use a consistent stacking order: global header above navigation and content; overlays and dialogs above the shell. Do not let page content scroll beneath a modal or obscure keyboard focus.
2.2 Global header placement
Recommended left-to-right order:
- Product mark or product name.
- Optional environment/resource-scope selector, when multiple scopes exist.
- Flexible empty space.
- Optional global search.
- Notifications or activity center.
- Help/documentation.
- User/account menu.
Keep the header utility area compact. Do not place page-specific actions in the global header. Show the active environment or target prominently enough to prevent accidental changes in the wrong scope.
2.3 Primary navigation
- Use a left vertical sidebar for the primary navigation on desktop.
- Group related destinations with short section labels only when the list is long enough to benefit from grouping.
- Use a consistent icon set. Icons should clarify the label, not replace it in the expanded navigation.
- Show the active destination with a restrained background, accent marker, and accessible text contrast. Do not rely on color alone.
- Keep navigation labels short and noun-based where possible: Overview, Resources, Network, Storage, Users, Security, Activity, Settings.
- Keep nesting to two levels. Use page tabs or local navigation for deeper sections rather than creating a deeply nested sidebar.
- Separate global destinations from actions that belong to a selected resource.
- Do not hide a destination merely because the user lacks permission if the product needs to explain its availability; use a disabled state with a clear permission explanation. Otherwise, follow the product's access-control model consistently.
2.4 Main page layout
Use this page structure by default:
┌─────────────────────────────────────────────────────────────────┐
│ Global header                                                   │
├───────────────┬─────────────────────────────────────────────────┤
│ Primary       │ Breadcrumb (optional)                           │
│ navigation    │ Page title                         Page actions  │
│               │ Short description / scope (optional)            │
│               ├─────────────────────────────────────────────────┤
│               │ Local tabs or page-level toolbar (optional)     │
│               ├─────────────────────────────────────────────────┤
│               │ Main content                                    │
│               │                                                 │
└───────────────┴─────────────────────────────────────────────────┘
- Place breadcrumbs above the page title, not below it.
- Align the page title to the left and page-level actions to the right on wide screens.
- Use sentence case for headings and navigation.
- Keep the page title area consistent across routes, including list, detail, and settings pages.
- Put filters and actions directly above the table, chart, or card collection they control.
- Use tabs only for closely related views of the same resource or workflow.
- Do not wrap every content section in a card. Use cards when a group needs a visible boundary, independent actions, or a distinct surface.
2.5 Responsive behavior
Viewport	Behavior
1,200 px and wider	Full sidebar, multi-column dashboards, full table controls.
768–1,199 px	Collapsible sidebar, reduced page insets, fewer dashboard columns.
Below 768 px	Sidebar becomes a drawer; stack page actions; use single-column content; allow table overflow or switch to a deliberate compact row/detail pattern.


Never solve a narrow layout by shrinking text below readable sizes. On smaller screens, prioritize the primary task and progressively reveal secondary information.
3. Color system
Use semantic tokens rather than hard-coded colors inside components. The palette below is a neutral starting point; maintain the semantic roles if the product later adopts a different brand accent.
3.1 Light theme
Token	Hex	Intended use
--color-bg	#F4F6F8	Application canvas and page background
--color-surface	#FFFFFF	Cards, menus, dialogs, input backgrounds
--color-surface-subtle	#F8FAFC	Secondary sections, alternating regions
--color-surface-muted	#EEF2F6	Hover rows, selected neutral regions, disabled surfaces
--color-border	#D7DFE8	Dividers, card and input borders
--color-border-strong	#AAB7C6	Emphasized boundaries and control outlines
--color-text	#17212F	Primary text and headings
--color-text-secondary	#536273	Supporting text, descriptions, metadata
--color-text-muted	#626F80	Timestamps and low-priority metadata; verify contrast in context
--color-accent	#0B5CAD	Links, selected navigation, primary action background
--color-accent-hover	#084B8A	Hover state for accent controls
--color-accent-soft	#EAF2FB	Selected states and quiet accent backgrounds
--color-focus	#1677D2	Keyboard focus ring


3.2 Dark theme
Use dark slate surfaces rather than pure black. Maintain visible separation between the application canvas, panels, and raised overlays.
Token	Hex	Intended use
--color-bg	#101820	Application canvas and page background
--color-surface	#17212B	Cards, menus, dialogs, input backgrounds
--color-surface-subtle	#1C2833	Secondary sections and subtle grouping
--color-surface-muted	#22303D	Hover rows, selected neutral regions, disabled surfaces
--color-border	#334252	Dividers, card and input borders
--color-border-strong	#526376	Emphasized boundaries and control outlines
--color-text	#EDF2F7	Primary text and headings
--color-text-secondary	#B5C0CC	Supporting text and descriptions
--color-text-muted	#8C9AAA	Timestamps and low-priority metadata
--color-accent	#77B7FF	Links, selected navigation, focus-adjacent accents
--color-accent-hover	#A1CEFF	Hover state for accent text and links
--color-accent-soft	#1D3B57	Selected states and quiet accent backgrounds
--color-focus	#9BCBFF	Keyboard focus ring
--color-primary-action	#2675BE	Primary action background; use white text


3.3 Status colors
Status colors must communicate meaning consistently across the product. Always pair color with a text label and, where useful, an icon.
State	Light text	Light background	Dark text	Dark background
Success / healthy	#216E45	#E8F5EE	#7DD3A5	#143427
Warning / attention	#825800	#FFF4D6	#FFCE73	#3D3017
Danger / failed	#B42318	#FDECEC	#FF938A	#451C1C
Information	#155E9A	#E8F2FC	#8CCBFF	#17334B


Use status colors only for states, alerts, validation, and relevant chart series. Do not color entire cards or large page regions with saturated status colors. A warning should not look like an error, and a neutral or unknown state must not be styled as healthy.
3.4 Color usage rules
- The interface should be predominantly neutral. Use the accent color sparingly for actions, links, current navigation, and selected controls.
- Do not use brand/accent color as a large page background.
- Do not use color as the only way to communicate status, selection, or validation.
- Avoid pure black and pure white as the only surface layers; use the palette's subtle surface and border tokens to establish hierarchy.
- Use the same semantic token for the same meaning in both themes. Only the resolved color value changes.
- Check all text and interactive states against their actual rendered backgrounds, including hover, selected, disabled, and error states.
4. Typography
4.1 Font families
Use a neutral, highly legible sans-serif stack. Do not require a proprietary or vendor-specific typeface.
:root {
  --font-ui: Inter, "Segoe UI", Roboto, system-ui, -apple-system,
    BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}
Use --font-mono for code, command output, identifiers, hashes, IP addresses, logs, and other values where fixed-width alignment helps. Do not render ordinary interface labels in monospace.
4.2 Type scale
Use the following scale as the default. Avoid introducing arbitrary font sizes for individual screens.
Role	Size	Weight	Line height	Typical use
Page title	24–28 px	600	1.2	Main page heading
Section heading	18–20 px	600	1.25	Major content sections
Subsection heading	16 px	600	1.3	Card and form section titles
Body	14 px	400	1.45	Default interface text
Control / table text	13–14 px	400–500	1.35–1.4	Table cells, buttons, inputs
Label	12–13 px	500–600	1.3	Form labels, field metadata
Caption / metadata	12 px	400	1.35	Timestamps and secondary metadata
Metric value	24–32 px	600	1.1	Key dashboard measurements


Rules:
- Use 14 px as the default body size for desktop administration screens. Do not reduce core content to 11 px to fit more information.
- Use sentence case. Avoid all-caps navigation, headings, and labels.
- Prefer weight and spacing to excessive color changes for hierarchy.
- Use tabular numerals for metrics and numeric table columns so values align when they update.
- Keep paragraphs to a comfortable reading width; allow tables and structured data to use the full content width.
- Do not use more than three distinct text treatments in a compact component or content block.
5. Spacing, sizing, and shape
Use a 4 px base spacing system. Apply the same spacing tokens throughout the application.
Token	Value	Common use
space-1	4 px	Icon/text gap, tight internal spacing
space-2	8 px	Compact control padding, related elements
space-3	12 px	Field gaps, compact card padding
space-4	16 px	Standard component padding
space-5	20 px	Form group spacing
space-6	24 px	Page inset, section spacing
space-8	32 px	Major section separation
space-10	40 px	Large page-level separation
space-12	48 px	Rare, major layout separation


Recommended component dimensions:
- Standard button and input height: 36–40 px.
- Compact table row: 40–44 px; increase when rows contain multiple lines or supporting content.
- Table header: 36–40 px.
- Standard icon: 16 px; use 20 px for prominent navigation or header controls.
- Card padding: 16–20 px.
- Card radius: 8 px.
- Button and input radius: 4–6 px.
- Dialog radius: 8 px.
Use borders as the primary way to define component boundaries. Shadows should be subtle and reserved for elements that float above the page, such as menus, popovers, drawers, and dialogs. Avoid decorative gradients, oversized rounded cards, and pill-shaped controls unless the component is semantically a chip or tag.
6. Core component patterns and placement
6.1 Page header and actions
- Place the page title at the top-left of the workspace.
- Place the primary page action at the top-right. Keep one visually primary action per page header where possible.
- Put secondary actions beside the primary action or inside an overflow menu.
- Place destructive actions away from routine actions and style them as destructive only when the action is actually destructive.
- For detail pages, show the resource identity and current status near the title.
6.2 Dashboard and overview
An overview should answer, quickly: What is this thing? Is it healthy? What needs attention? What can I do next?

Recommended order:
1. Resource or environment identity and overall status.
2. Key health or availability summary.
3. A small set of high-value metrics or utilization indicators.
4. Recent events, alerts, or queued operations.
5. Links to the relevant management areas.
Use a responsive card grid for summary information. Each card should express one metric or one closely related group. Keep metric labels explicit, show units, and provide a time range for trends. Do not use charts when a simple value or table is clearer.
6.3 Tables and resource lists
Tables are the default for managing collections of operational resources.
- Place the table title and count above the table when useful.
- Place search, filters, view controls, and bulk actions in a toolbar immediately above the data set they control.
- Align numeric values consistently; use tabular numerals.
- Keep status, name, and key identifying fields near the left. Put row actions at the far right.
- Use clear column headings and explicit units. Do not rely on icons as column labels.
- Support sorting only where the sort order is meaningful. Indicate the active sort direction.
- Provide pagination or virtualization for large collections; keep the current result count visible.
- Use a restrained hover state. If a row is selectable, provide a checkbox and a distinct selected state.
- Put secondary row actions in an overflow menu. Keep the most common safe action visible only when it is genuinely frequent.
- On narrow screens, preserve essential columns and allow horizontal scrolling or open a row-detail view. Do not silently remove critical data.
Use cards for a small number of summary entities or when visual comparison matters. Do not turn a large administrative data set into a decorative card grid.
6.4 Detail views
For a selected resource, use a consistent detail structure:
- Identity, type, and current status at the top.
- High-value facts in a compact definition list or summary row.
- Tabs for distinct areas such as Overview, Configuration, Metrics, Activity, and Access when there are several substantial areas.
- Related resources and recent events below the primary details.
Use a side drawer for quick inspection when the user must preserve their position in a collection. Use a full detail page for complex configuration or multi-step work.
6.5 Forms and configuration
- Use a visible label above every input. Placeholders are examples, not labels.
- Keep labels, inputs, helper text, validation messages, and units consistently aligned.
- Group related fields under short section headings. Use a two-column form only when fields are short and logically paired; otherwise use one column.
- Explain non-obvious defaults and constraints before the user submits.
- Put Save or the main submit action at the end of the form, with a clear Cancel action nearby.
- Preserve entered values when validation fails. Place validation messages next to the affected field and summarize multiple errors when useful.
- For settings that take effect immediately, state that clearly and provide feedback after the change.
6.6 Long-running operations and activity
Administrative actions may take time or affect multiple resources. Model them explicitly.
- Show a confirmation or impact summary before consequential operations.
- After submission, show that the request was accepted and expose its state: queued, running, completed, failed, or cancelled.
- Provide progress only when it is meaningful and measurable. Do not invent percentage progress for an operation that cannot report it.
- Keep long-running work visible in an activity or queue view, including the target, initiating user when available, start time, current state, and result.
- Preserve a useful error message and recovery path after failure. Do not display only Something went wrong.
6.7 Dialogs, drawers, and notifications
- Use dialogs for short, focused decisions that block the current task, such as confirming a destructive action.
- Use drawers for contextual inspection or editing when maintaining the current page context matters.
- Avoid dialogs for long forms, complex configuration, or information that users need to compare while working.
- Notifications should be brief and tied to a meaningful event. Persistent failures belong in the page or activity center, not only in a disappearing toast.
- Do not use a toast as the only confirmation for a security-sensitive or destructive operation.
7. Interaction and action hierarchy
Use consistent action priority:
1. Primary — the main task on the current page, such as Create, Save, or Apply.
2. Secondary — safe alternatives or supporting actions, such as Refresh, Export, or Cancel.
3. Tertiary — contextual links or low-emphasis actions.
4. Destructive — delete, revoke, disable, reset, or similarly consequential actions.
Rules:
- Use verbs that describe the result: Create resource, Restart service, Export configuration.
- Do not label a button Submit when a more specific verb is available.
- Disable an action only when it is genuinely unavailable; explain why through nearby text or a tooltip.
- Do not make a non-interactive card look clickable.
- Make clickable rows and cards keyboard accessible and give them an obvious hover/focus state.
- Require confirmation when an action is destructive, difficult to reverse, security-sensitive, or affects multiple resources. Include the resource name and the consequence in the confirmation.
- Do not ask for confirmation for routine, reversible actions without a meaningful risk.
8. Status, empty, loading, and error states
Every data-driven view must account for these states:
- Loading: use a restrained skeleton for known content structure or a spinner for a local operation. Avoid flashing the entire page during background refresh.
- Empty: explain why the view is empty and provide the next relevant action when one exists. Distinguish No resources yet from No results match these filters.
- Success: confirm the completed action and identify the affected resource where useful.
- Warning: explain what requires attention and whether the system remains operational.
- Error: state what failed, what was affected, and what the user can do next. Preserve context and entered form data.
- Unknown / unavailable: use a neutral state. Never present missing or stale data as healthy.
Show timestamps and freshness for operational data where the age of the information matters. Use a consistent time format and timezone strategy across the product.
9. Icons, charts, and visual decoration
- Use one consistent outline or filled icon family; do not mix unrelated icon styles.
- Prefer familiar, conventional symbols for navigation and common actions.
- Keep icons at 16 px for most controls. Add a text label to ambiguous or high-impact icon-only actions.
- Use charts to answer a specific operational question. Include metric name, unit, time range, and useful axis labels.
- Use a limited chart palette with consistent meaning. Do not rely on red/green alone to distinguish series.
- Avoid illustrations, ornamental backgrounds, decorative gradients, and marketing-style hero sections in the operational workspace.
10. Accessibility and usability requirements
Target WCAG 2.2 AA for all core workflows.
- Normal text must meet at least 4.5:1 contrast; large text must meet at least 3:1.
- Important component boundaries, icons, and focus indicators should have sufficient non-text contrast; target 3:1 where the WCAG criterion applies.
- Never use color as the only status, selection, or error indicator.
- All functionality must be operable by keyboard. Preserve a visible focus ring and a logical tab order.
- Use semantic headings, labels, buttons, tables, and landmarks. Give icon-only controls accessible names.
- Ensure dialogs manage focus correctly and return focus to the invoking control when closed.
- Support browser zoom and text resizing without clipping essential information or actions.
- Do not encode meaning only in hover states. Provide equivalent keyboard and touch affordances.
- Do not rely on hover to reveal critical information or actions.
11. Theme behavior and implementation tokens
Implement light and dark themes through semantic tokens. Components should consume tokens such as --color-surface and --color-text, not raw palette values.
:root,
[data-theme="light"] {
  color-scheme: light;
  --color-bg: #F4F6F8;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F8FAFC;
  --color-surface-muted: #EEF2F6;
  --color-border: #D7DFE8;
  --color-border-strong: #AAB7C6;
  --color-text: #17212F;
  --color-text-secondary: #536273;
  --color-text-muted: #626F80;
  --color-accent: #0B5CAD;
  --color-accent-hover: #084B8A;
  --color-accent-soft: #EAF2FB;
  --color-focus: #1677D2;
}

[data-theme="dark"] {
  color-scheme: dark;
  --color-bg: #101820;
  --color-surface: #17212B;
  --color-surface-subtle: #1C2833;
  --color-surface-muted: #22303D;
  --color-border: #334252;
  --color-border-strong: #526376;
  --color-text: #EDF2F7;
  --color-text-secondary: #B5C0CC;
  --color-text-muted: #8C9AAA;
  --color-accent: #77B7FF;
  --color-accent-hover: #A1CEFF;
  --color-accent-soft: #1D3B57;
  --color-focus: #9BCBFF;
  --color-primary-action: #2675BE;
}
- Respect the operating-system theme on first visit unless the product has a documented default.
- If a theme control exists, provide Light, Dark, and System options.
- Keep status semantics consistent across themes.
- Test the actual rendered contrast of text, controls, borders, focus rings, and status badges in both themes. The token values are a starting palette, not a substitute for contrast testing in every component state.
12. Agent implementation rules
When creating or modifying screens, agents must:
1. Reuse the application shell, spacing scale, typography, and semantic color tokens defined here.
2. Prefer established components and page patterns over custom one-off controls.
3. Keep global navigation, page actions, local toolbars, and row actions in their designated locations.
4. Use tables for large resource collections and cards for summaries or small, meaningful groups.
5. Implement loading, empty, error, disabled, selected, and success states—not just the happy path.
6. Keep light and dark themes functionally and visually equivalent.
7. Use realistic domain labels only when they are known from requirements or data. Do not invent backend capabilities, operational states, or metrics.
8. Keep the interface responsive and keyboard accessible.
9. Use the existing icon and component libraries when available. Do not introduce a new visual language for a single screen.
10. If a requirement conflicts with this file, follow the explicit product requirement and update this file when the exception is intended to become a standard.
Before considering a screen complete, verify:
- [ ] The current environment or resource scope is clear.
- [ ] The page title, breadcrumb, and actions follow the shared layout.
- [ ] Spacing, typography, and colors use semantic tokens.
- [ ] The page works in light and dark themes.
- [ ] Loading, empty, error, and success states are covered.
- [ ] Destructive and long-running actions explain their impact and outcome.
- [ ] Tables, forms, and controls remain usable at narrower widths.
- [ ] Keyboard focus, labels, and contrast are accessible.
13. Reference products and source material
Use these references for the principles identified below, not as pixel-perfect templates:
- Red Hat Cockpit: operational overview, direct access to common administration areas, modular task navigation, and the ability to inspect system health and activity. Cockpit Project · RHEL web console overview
- Red Hat design system / PatternFly: foundations for color, spacing, typography, page structure, dashboards, and component consistency. Foundations · Typography guidelines · PatternFly dashboard guidelines · PatternFly page component
- Oracle SuperCluster Virtual Assistant: role-aware navigation, resource lifecycle management, configuration screens, health monitoring, system logs, and explicit queues for long-running deployments. SuperCluster Virtual Assistant overview · Administrator navigation panel
- Windows Admin Center: connection-oriented administration, a left-side tool list with a focused workspace, extensible task areas, and consistent UI text/status conventions. Develop a tool extension · UI text and design style guide
- Accessibility: WCAG 2.2 requirements for text contrast and use of color. WCAG 2.2
Interpretation note: Oracle SuperCluster Virtual Assistant is a legacy enterprise interface. Its information architecture and operational workflow patterns are useful references; its older visual treatment, dense legacy controls, and dated styling are not the target aesthetic.
