# Herramientas para desarrollo web, QA, despliegue, SEO local y analítica — Bío Digital (research notes, 30-10-2026)

Scope: tools/MCPs/skills/repos for a vanilla HTML/CSS/JS + Node generator + Cloudflare Pages/Functions + Supabase + Mercado Pago stack, run mostly through Claude Code. Budget ~CLP 80.000. Items marked **[UNVERIFIED]** come from training knowledge or a single third-party source and were not confirmed against a primary source in this session. Star counts are snapshots from GitHub pages fetched 30-10-2026.

## Testing/QA: which browser MCP, visual regression, Lighthouse/PSI and accessibility tools give Claude the best free feedback loop?

### Takeaway
Chrome DevTools MCP (Google, Apache-2.0, ~54.5k stars) is the best free addition for this team: it gives Claude performance traces, a `lighthouse_audit` tool (a11y/SEO/best practices), and network/CPU/viewport emulation that can mimic a mid-range Android on Slow 4G. Playwright stays the engine for the existing check.mjs/e2e suite (and Microsoft itself now recommends Playwright CLI + skills over the MCP for coding agents to save tokens). For visual regression use Playwright's built-in screenshot assertions; Lost Pixel is dead (archived Apr 2026) and BackstopJS is seeking a maintainer.

### Cited Findings
**Chrome DevTools MCP (official, Google)** — https://github.com/ChromeDevTools/chrome-devtools-mcp
- 54.5k stars, 5.9k forks, Apache-2.0; recommends `chrome-devtools-mcp@latest`; has a `--slim` mode with a reduced tool set — [GitHub README](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- 60 tools, including `performance_start_trace` / `performance_stop_trace` / `performance_analyze_insight`, `lighthouse_audit` (accessibility, SEO, best practices, agentic browsing — explicitly excludes performance; use the trace tools for perf), `list_network_requests`, `list_console_messages`, `take_screenshot`, `take_snapshot`, `evaluate_script` — [Tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md)
- `emulate` supports network presets ("Slow 3G", "Fast 3G", "Slow 4G", "Fast 4G", "Offline"), `cpuThrottlingRate`, and viewport `<w>x<h>x<dpr>` with mobile/touch flags; each call replaces previous emulation settings — [Tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md)
- Risks: usage statistics are **enabled by default** (opt out `--no-usage-statistics`, or env `CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS` / `CI`); performance tools may send trace URLs to Google's CrUX API (`--no-performance-crux`); exposes browser content to the MCP client — [GitHub README](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- Chromium-only, vs Playwright MCP's Chromium/Firefox/WebKit; comparison blogs position DevTools MCP for perf/debugging and Playwright for functional testing — [mcp.directory](https://mcp.directory/blog/chrome-devtools-mcp-vs-playwright-mcp-2026); [qaskills.sh](https://qaskills.sh/blog/chrome-devtools-mcp-performance-testing-guide) (secondary, qualitative; no head-to-head benchmarks found)
- Claim that DevTools MCP uses fewer tokens than Playwright MCP — [lilys.ai (RU)](https://lilys.ai/ru/notes/claude-chrome-extension-20251224/chrome-mcp-beats-playwright-tools-tokens) **[UNVERIFIED, single secondary source]**

**Playwright MCP (official, Microsoft)** — https://github.com/microsoft/playwright-mcp
- 38.8k stars; works on the accessibility tree (no vision model needed); optional capability groups via `--caps`; install `claude mcp add playwright npx @playwright/mcp@latest` — [GitHub README](https://github.com/microsoft/playwright-mcp)
- README: "If you are using a coding agent, you might benefit from using the CLI+SKILLS instead" — CLI is more token-efficient because it avoids loading large tool schemas and accessibility trees; MCP is for loops needing persistent state — [GitHub README](https://github.com/microsoft/playwright-mcp)

**Visual regression**
- Lost Pixel: "archived by the owner on Apr 22, 2026. It is now read-only." (1.7k stars, MIT) — **do not adopt** — [GitHub](https://github.com/lost-pixel/lost-pixel)
- Blog claims the Lost Pixel team joined Figma and left no migration path — [Cloudzy](https://cloudzy.com/blog/argos-vs-lost-pixel-vs-backstopjs-compared/) **[UNVERIFIED reason; archive date confirmed]**
- BackstopJS: 7.2k stars, MIT, Puppeteer default with `"engine": "playwright"` option; README says the project "needs a new maintainer/owner" — maintenance risk — [GitHub](https://github.com/garris/BackstopJS)
- Note: the Cloudzy post attributes "collaborative reviews with pinned comments (June 2026)" to BackstopJS; this looks like a SaaS (Argos-like) feature and conflicts with the maintainer-wanted README — treat as **unreliable** — [Cloudzy](https://cloudzy.com/blog/argos-vs-lost-pixel-vs-backstopjs-compared/) vs [BackstopJS README](https://github.com/garris/BackstopJS)
- Playwright Test's built-in `expect(page).toHaveScreenshot()` covers visual diffs with no extra dependency — https://playwright.dev/docs/test-snapshots **[not fetched this session; well-established feature]**

**Lighthouse CI / PageSpeed Insights API**
- `treosh/lighthouse-ci-action` (community, built with the Lighthouse team), ~1.3k stars, last push Mar 2026; usage `uses: treosh/lighthouse-ci-action@v12` with `budgetPath`, `configPath`, `uploadArtifacts` — [gittrend.io](https://gittrend.io/repo/treosh/lighthouse-ci-action); [unlighthouse.dev](https://unlighthouse.dev/learn-lighthouse/lighthouse-ci/github-actions)
- PSI API: free quota 25,000 requests/day per Google Cloud project, no billing required; per-minute limits reported inconsistently (60/100 s per user vs ~240/min vs 400/100 s) — [unlighthouse.dev](https://unlighthouse.dev/learn-lighthouse/pagespeed-insights-api/rate-limits); [unlighthouse.dev API key](https://unlighthouse.dev/learn-lighthouse/pagespeed-insights-api/get-api-key) (secondary; confirm in Cloud Console)
- A community "google-psi-mcp" server exists — [devleader.ca](https://www.devleader.ca/projects/google-psi-mcp/getting-started/) **[UNVERIFIED maturity]**

**Accessibility**
- Lighthouse accessibility category runs a subset of axe-core rules — [skillselion.com](https://skillselion.com/skills/community-access/accessibility-agents/lighthouse-scanner) (secondary)
- One project dropped Lighthouse CI (too slow in CI) in favor of axe-core already running via Playwright — [db-ui/mono issue #2582](https://github.com/db-ui/mono/issues/2582) (anecdotal)

### Inferences
- Best free loop: keep check.mjs/e2e in Playwright; add `@axe-core/playwright` assertions and `toHaveScreenshot()` to the same suite (zero new services); add Chrome DevTools MCP for on-demand "diagnose this page on Slow 4G + 4x CPU" sessions; run PSI API (field + lab data from Google) on deployed client URLs for monthly reports. This avoids paying for Percy/Chromatic/Argos.
- Since the team already has a browser-automation MCP and the built-in browser, Playwright MCP adds little; the Playwright CLI/skills path is cheaper in tokens per Microsoft's own README.
- Set `CI=1` or `--no-usage-statistics` and consider `--no-performance-crux` for client staging URLs to avoid leaking unpublished URLs to Google.
- A 20-minute check.mjs suggests splitting into a fast smoke tier (per commit) and full tier (pre-deploy); visual snapshots should only run on a few key templates to stay fast.

### Gaps
- No primary-source documentation fetched for `@axe-core/playwright` (API, current version) — search returned no direct result.
- No quantitative token/speed benchmark between Chrome DevTools MCP and Playwright MCP found.
- Latest release dates for chrome-devtools-mcp, playwright-mcp, BackstopJS not visible on fetched pages.

## Deployment: what do official Cloudflare MCP servers and wrangler add over the CLI?

### Takeaway
Cloudflare now centers on one "Cloudflare API MCP server" (`https://mcp.cloudflare.com/mcp`, Code Mode: search + execute over the full API in ~1,000 tokens) plus a Docs server and a Workers Observability server. For a Pages + Functions shop the real value over wrangler is (a) docs lookup that is current, and (b) log/observability querying from Claude; deploys should stay on wrangler/git for reproducibility.

### Cited Findings
- Official list: Cloudflare API MCP (`https://mcp.cloudflare.com/mcp`, tools `search()`, `execute()`, `docs()`), Documentation (`https://docs.mcp.cloudflare.com/mcp`), Container (`containers.mcp…`), Browser Run (`browser.mcp…` — fetch pages to markdown, screenshots), DEX, CASB, Agents SDK docs — [Cloudflare docs](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/)
- API server uses a "search-and-execute Code Mode pattern" running model-written JS in a Dynamic Worker sandbox: ~1,000 tokens vs >1M for exposing every endpoint as a tool; Cloudflare calls it the only server you need — [Cloudflare docs](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/)
- Page does not mention paid-plan requirements — [Cloudflare docs](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/)
- Repo `cloudflare/mcp-server-cloudflare` hosts Workers Observability (`https://observability.mcp.cloudflare.com/mcp`), Bindings, Builds, GraphQL servers; API server is in `github.com/cloudflare/mcp`; OAuth auth; install e.g. `claude mcp add --transport http cf-observability https://observability.mcp.cloudflare.com/mcp`; wiki warns the observability server can hit client context limits through chained calls; some features may need Workers Paid — [Cloudflare repo wiki](https://github.com/cloudflare/mcp-server-cloudflare/wiki); [developertoolkit.ai](https://developertoolkit.ai/en/shared-workflows/mcp-ecosystem/cloudflare-mcp/) (secondary for install line)
- Note: the newer official docs page lists the API/Docs servers but the fetched version did not list Observability/Bindings separately; the repo still documents them — possible consolidation into the API server — [Cloudflare docs](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/) vs [repo wiki](https://github.com/cloudflare/mcp-server-cloudflare/wiki)

### Inferences
- Add the Docs MCP (free, read-only, low risk) immediately; it overlaps context7 but is authoritative for Pages Functions/wrangler config.
- Add the API MCP with a **scoped API token** (Pages + Analytics read, DNS edit only if needed); an `execute()` tool with an account-wide token is a real blast-radius risk for client zones.
- The Vercel MCP they already have is irrelevant to their Cloudflare deployment and costs context; consider disabling it.
- Browser Run MCP could fetch/screenshot client competitor sites, but the local Chrome DevTools MCP does that for free.

### Gaps
- Pages-specific MCP tooling (deploy previews, Pages Functions logs) not confirmed; Workers Observability coverage of Pages Functions not verified.
- No wrangler-specific "tips" source fetched this session (e.g., `wrangler pages deploy`, `wrangler pages dev` with local Functions) — **[UNVERIFIED, from training]**.

## Local SEO for Chilean SMBs: structured data, validation, audit MCPs, Search Console

### Takeaway
Google's LocalBusiness docs (updated 2026-09-08) require only `name` + `address` and recommend `geo`, `openingHoursSpecification`, `telephone`, `url`, `priceRange`, `servesCuisine` and `menu` (a URL to the menu). There is no official on-page "menu rich result"; full structured menus in Google Business Profile come via Reservations End-to-End partner feeds, not JSON-LD. Search Console MCPs exist but are all community-built and tiny.

### Cited Findings
- LocalBusiness required: `address`, `name`; recommended: `aggregateRating`, `department`, `geo`, `menu`, `openingHoursSpecification`, `priceRange` (hidden if ≥100 chars), `review`, `servesCuisine`, `telephone`, `url`; `menu` = "fully-qualified URL of the menu"; `acceptsReservations` not mentioned; `additionalType` unsupported; review markup only for sites reviewing *other* businesses (no self-serving reviews); Restaurant carousel restricted to a small group of providers; page updated 2026-09-08 — [Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- schema.org `hasMenu` → `Menu` → `MenuSection` → `MenuItem` is valid vocabulary — [schema.org hasMenu](https://alt112012.schema.org/hasMenu); [jsonld.com sample](https://jsonld.com/restaurant-menu-json-ld-sample/)
- Google's structured menu ingestion for Business Profile is via Reservations End-to-End partners using a FoodMenuFeed; one menu per restaurant, with sections — [Google Actions Center](https://developers.google.com/actions-center/verticals/reservations/e2e/add-ons/add-menus/overview)
- No current official statement that on-page Menu markup yields a menu rich result; vendor CTR uplift claims (+34% clicks) are unsourced — [befoundonline](https://befoundonline.com/blog/why-schema-markup-is-crucial-for-restaurant-seo-in-2025); [kolonell](https://kolonell.com/en/blog/schema-restaurant-menu-rich-snippet-dakar-2026) **[UNVERIFIED claims]**
- Search Console MCPs (all community, none official from Google): `harisnadeem/searchconsole-mcp` (Python, PyPI, analytics/sitemaps/URL inspection) — [PyPI](https://pypi.org/project/searchconsole-mcp/); `acamolese/google-search-console-mcp` (MIT, read-only, HTML audit reports, ~3 stars) and `lionkiii/google-searchconsole-mcp` (~1 star) — [Enterprise DNA](https://enterprisedna.co/directories/mcp/acamolese-google-search-console-mcp); `pijusz/mcp-gsc`, `crunchtools/mcp-google-search-console`, `@sarahpark/google-search-console-mcp` — [mcpplaygroundonline](https://mcpplaygroundonline.com/mcp-servers/io-github-pijusz-mcp-gsc); [getdrio](https://www.getdrio.com/mcp/io-github-sarahpark-google-search-console/md). All need Google Cloud OAuth; maturity low.

### Inferences
- Have generar.mjs emit `Restaurant`/`LocalBusiness` JSON-LD with `menu` pointing to the Bío Digital menu URL, `openingHoursSpecification`, `geo`, `telephone` (+56 format), `priceRange` in CLP short form; adding `hasMenu` is harmless but should be sold as "machine-readable for AI/answer engines", not as a guaranteed rich result.
- Google Business Profile completeness (categories, hours, photos, menu link, reservation link) almost certainly matters more for "cerca de mí" searches in Concepción than on-site schema; Bío Digital's deliverable should include GBP setup.
- Validate with Google's Rich Results Test and validator.schema.org (manual) — Claude can't call Rich Results Test via API **[UNVERIFIED that no API exists]**; a local check in check.mjs can at least parse JSON-LD and assert required fields.
- Given low maturity of GSC MCPs, a small Node script against the official Search Console API (service account added as a user per client property) is lower-risk than installing an unknown MCP with OAuth scopes over client data.

### Gaps
- Ahrefs/Semrush MCPs: not researched this session (both are paid products; out of budget either way) — **[UNVERIFIED existence/pricing]**.
- Open-source SEO crawlers (e.g., Unlighthouse, SEOnaut) not evaluated with sources.
- Google Business Profile API access requirements for small agencies not researched.

## Analytics: privacy-friendly and free, suitable for monthly client reports

### Takeaway
Cloudflare Web Analytics is the natural default (free, cookieless, one-click on Pages, queryable via GraphQL for automated reports). PostHog's free tier (~1M events/mo) fits only if they need funnels/events (e.g., menu-order conversions). Plausible has no free cloud tier; Umami Cloud free is small but self-host is free.

### Cited Findings
- Pages: enable under project > Metrics > Web Analytics; snippet injected on next deployment — [Cloudflare docs](https://developers.cloudflare.com/pages/how-to/web-analytics); [positioniseverything](https://www.positioniseverything.net/cloudflare-web-analytics-api-site-management-graphql-data-and-setup/) (secondary)
- Auto-injection fails when responses have `Cache-Control: public, no-transform` — [Cloudflare docs llms-full](https://developers.cloudflare.com/web-analytics/llms-full.txt)
- Data extractable via GraphQL Analytics API (`rumPageloadEventsAdaptiveGroups`), default quota 300 queries / 5 min — [Cloudflare GraphQL limits](https://developers.cloudflare.com/analytics/graphql-api/limits/index.md); [Nexla connector doc](https://docs.nexla.com/user-guides/connectors/cloudflare_analytics_api) (secondary for dataset name)
- Reported cap of 10 non-proxied sites per account — [positioniseverything](https://www.positioniseverything.net/cloudflare-web-analytics-api-site-management-graphql-data-and-setup/) **[UNVERIFIED; check https://developers.cloudflare.com/web-analytics/limits/]**
- PostHog: forever-free ~1M events/mo (+ ~5K session recordings), metered beyond — [agentdeals.dev](https://agentdeals.dev/analytics-free-tier-comparison-2026); [costbench](https://costbench.com/software/product-analytics/posthog/free-plan/) (secondary)
- Umami Cloud Hobby ~100K events/mo, 1 site, 6-month retention; self-host unlimited/free — [toolpick.dev](https://www.toolpick.dev/pricing/umami) **[UNVERIFIED vs vendor page]**
- Plausible: cloud from $9/mo, 30-day trial, free self-hosted Community Edition; one source says ~$69 entry — conflicting — [getpulsesignal](https://getpulsesignal.com/compare/plausible-vs-posthog); [agentdeals.dev](https://agentdeals.dev/alternative-to/plausible-analytics)

### Inferences
- For monthly client reports: Node script → Cloudflare GraphQL (visits, top pages, referrers, Core Web Vitals) + Supabase counts (orders, reservations, loyalty stamps) → HTML/PDF. Business KPIs from Supabase are what SMB owners actually care about; pageviews are secondary.
- If per-account site caps bite (many client domains not proxied), proxying client DNS through the Bío Digital Cloudflare account or using one account per client avoids it — verify the limit first.
- GA4 MCP not evaluated; GA4 requires a cookie banner discussion under Chilean Ley 21.719 (data protection, in force Dec 2026) **[UNVERIFIED legal detail]** — cookieless Cloudflare analytics sidesteps it.

### Gaps
- No official GA4 MCP researched.
- Umami/Plausible prices not confirmed on vendor pages.

## Component/design resources usable with vanilla HTML; Figma MCP

### Takeaway
Most popular "component" sources (21st.dev, shadcn, Magic UI, Aceternity) are React/Tailwind-first; with a vanilla stack they are inspiration to be ported by Claude, not drop-in. Figma's remote MCP is free only at 6 tool calls/month on Starter — not worth it for this team.

### Cited Findings
- 21st.dev Magic MCP: npm `@21st-dev/magic@latest`; reported 5 free requests for new users then paid — [Cline blog](https://cline.bot/blog/building-the-mcp-economy-lessons-from-21st-dev-and-the-future-of-plugin-monetization); [mcpservers.org](https://mcpservers.org/en/servers/21st-dev/magic-mcp) **[pricing UNVERIFIED on 21st.dev]**
- Figma remote MCP available on all plans/seats, but Starter or View/Collab seats limited to 6 tool calls/month; Dev/Full seats on Professional reportedly ~200 calls/day — [Figma help](https://help.figma.com/hc/en-us/articles/35794667554839); [Figma forum](https://forum.figma.com/report-a-problem-6/figma-desktop-mcp-server-daily-limit-57323) (staff reply, secondary)

### Inferences
- With impeccable/apple-design/emil-design-eng skills already installed, the marginal value of 21st.dev Magic is low and it pushes React output; copy patterns from UIverse (plain HTML/CSS snippets) and Codrops demos (vanilla JS) instead **[UVERSE/Codrops licensing and vanilla-ness UNVERIFIED this session]**.
- Canva MCP (already installed) covers client-facing graphics; skip Figma until a paid seat is justified.

### Gaps
- shadcn, Magic UI, Aceternity, UIverse, Codrops: no sources fetched this session (licenses, vanilla compatibility).

## Supabase best-practice tooling

### Takeaway
Supabase publishes official agent skills (`supabase/agent-skills`, MIT) including a Postgres best-practices skill installable as a Claude Code plugin; combined with the Supabase MCP's `get_advisors` (security/performance advisors, already available to them) this is the free RLS/perf review loop.

### Cited Findings
- Repo `github.com/supabase/agent-skills`; install `npx skills add supabase/agent-skills` or `/plugin install postgres-best-practices@supabase-agent-skills`; 8 rule categories by impact (query performance & connection management = critical; schema design = high; also concurrency/locking, security & RLS, data access, monitoring, advanced); MIT; ~2.1k–2.6k stars depending on snapshot — [GitHub](https://github.com/supabase/agent-skills); [skills.cat](https://skills.cat/skills/supabase/agent-skills/supabase-postgres-best-practices)
- The Supabase MCP connected in this environment exposes `get_advisors` (observed in the session tool list, not a web source).

### Inferences
- Make "run `get_advisors` (security + performance) after every migration" a step in their deploy checklist; RLS gaps on menus/reservations/loyalty tables are the highest-impact risk for a multi-tenant SMB product.
- Use Supabase branches only if the plan allows; otherwise a separate free staging project.

### Gaps
- Official Supabase docs page on advisors/security lints not fetched this session.

## Image/media optimization for mid-range Android in Chile

### Takeaway
Do it at build time in generar.mjs with Sharp (free, Node-native) producing AVIF/WebP at 2–3 widths with `srcset`; Cloudflare Images transformations are free up to 5,000 unique transforms/month, then $0.50/1,000, with storage/delivery paid-only — useful only for client-uploaded images (menu photos from the panel).

### Cited Findings
- Free plan: up to 5,000 unique transformations/month (for images stored outside Cloudflare Images, e.g., R2); over the limit, cached transforms keep serving but new ones are blocked; paid: first 5,000 included + $0.50 / 1,000 unique transformations — [Cloudflare Images pricing](https://developers.cloudflare.com/images/pricing)
- Over-limit error code 9422 and storage $5/100k images, delivery $1/100k — [mecanik.dev](https://mecanik.dev/en/posts/cloudflare-image-transformations-resize-and-optimize-on-the-fly/); [flarecalc](https://flarecalc.com/calculators/images) **[secondary]**
- Chrome DevTools MCP can emulate Slow 4G + CPU throttling + mobile viewport to test the real target device class — [Tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md)

### Inferences
- Static sites: Sharp in the generator → zero runtime cost, deterministic output, works offline. Menu photos uploaded via the panel to Supabase Storage: either resize client-side before upload (canvas → WebP) or use Supabase Storage image transforms (paid feature on Supabase **[UNVERIFIED]**) or Cloudflare transforms (free ≤5,000/mo) — the latter fits the budget for a handful of clients.
- Squoosh is a good manual tool; its CLI was reportedly abandoned **[UNVERIFIED]** — prefer Sharp in scripts.

### Gaps
- Sharp current version/maintenance not fetched; Chilean mobile network/device stats (e.g., typical device class, 4G speeds) not researched.
