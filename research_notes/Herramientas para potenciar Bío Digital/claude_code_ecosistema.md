# Ecosistema Claude Code (late 2026): herramientas que ahorran tokens y mejoran la investigación, para un estudiante-fundador en Windows

Research date: 2026-10-30. Budget: about 17 tool calls. Star counts come from the GitHub pages fetched on that date unless marked otherwise. GitHub pages fetched with WebFetch did NOT show last-commit dates, so the "last commit" field is UNVERIFIED for every repo below.

## 1. Which tools and practices reduce token/context use in practice, and which suit an Obsidian/LLM-Wiki setup on Windows?

### Takeaway
The biggest official levers are built-in and free: `/clear` between tasks, CLAUDE.md under 200 lines with specialized content moved into on-demand skills, deferred MCP tools, CLI over MCP, preprocessing hooks, subagents for verbose work, and `/usage` attribution to find what costs the most. For the Obsidian/LLM-Wiki vault, **qmd** (Tobi Lütke, recommended in Karpathy's gist) is the strongest retrieval add-on: local hybrid BM25 + vector + rerank, with an MCP server and a Claude Code plugin. It needs about 2 GB of models and Node 22+, and Windows support is not explicitly documented. **Serena** fits code projects, not the wiki. **Basic Memory** overlaps with the wiki pattern the user already runs.

### Cited Findings
**Official Anthropic practices (code.claude.com "Manage costs effectively")**
- "Use `/clear` to start fresh when switching to unrelated work. Stale context wastes tokens on every subsequent message." `/compact <focus>` and a "# Compact instructions" section in CLAUDE.md customize compaction. — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)
- "Aim to keep CLAUDE.md under 200 lines by including only essentials." Skills "load on-demand only when invoked, so moving specialized instructions into skills keeps your base context smaller." — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)
- "MCP tool definitions are deferred by default, so only tool names and server instructions enter context until Claude uses a specific tool." Also: "Prefer CLI tools when available: Tools like `gh`… are still more context-efficient than MCP servers"; "Disable unused servers" via `/mcp`; `/context` shows what consumes space. — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)
- Hooks can preprocess data, for example grepping a 10,000-line log, "reducing context from tens of thousands of tokens to hundreds." Subagents keep verbose output (tests, docs fetches, logs) out of the main context. — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)
- Code intelligence (LSP) plugins: "A single 'go to definition' call replaces what might otherwise be a grep followed by reading multiple candidate files." — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)
- `/usage` on Pro/Max shows usage attributed to skills, subagents, plugins, and individual MCP servers, plus recommendations such as "Trim … CLAUDE.md · 49k tokens per request". Pressing `f` applies them (v2.1.305+). `/insights` writes an HTML report on friction points. — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)
- Hidden token drains in long sessions include cache misses after idle, `/loop` scheduled tasks, goal check-ins, and the cost of compaction itself. "When you want a fresh start instead of continuity, `/clear` costs nothing." — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)
- `claude plugin details <name>` shows an "Always-on" token cost per plugin. The official marketplace shows "Every turn" and "When invoked" context-cost estimates, and `/plugin` lists "Not used recently" plugins. — [Claude Code docs: discover plugins](https://code.claude.com/docs/en/discover-plugins)

**Karpathy LLM Wiki (gist, created 2026-04-04)**
- Three layers: raw sources (immutable), the wiki (LLM-written markdown), and a schema (CLAUDE.md/AGENTS.md). `index.md` is a catalog the LLM reads first. `log.md` is an append-only record. Operations are ingest, query, and lint. — [Karpathy gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- The gist describes qmd as "a local search engine for markdown files with hybrid BM25/vector search and LLM re-ranking, all on-device", with a CLI and an MCP server. It also says "Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase." It mentions Obsidian Web Clipper, Marp, and Dataview. — [Karpathy gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

**qmd: [github.com/tobi/qmd](https://github.com/tobi/qmd)**
- Pipeline: SQLite FTS5 BM25, embeddings (embeddinggemma-300M), query expansion with a fine-tuned 1.7B model, RRF fusion, and a qwen3-reranker-0.6b rerank, all local via node-llama-cpp (GGUF). — [qmd README](https://github.com/tobi/qmd)
- MCP tools: `query`, `get`, `multi_get`, `status`, `metadata`. Runs over stdio or `qmd mcp --http`, which avoids reloading models. "Claude Code users can install it as a plugin." — [qmd README](https://github.com/tobi/qmd)
- Requirements: Node 22+ or Bun 1.0+, and about 2 GB of model downloads (≈300 MB + 640 MB + 1.1 GB). Install with `npm install -g @tobilu/qmd`. — [qmd README](https://github.com/tobi/qmd)
- Windows: the README does not state support explicitly. It only mentions Windows CUDA tweaks (embedding parallelism defaults to 1 "because of crashes"; Vulkan suggested). — [qmd README](https://github.com/tobi/qmd)
- Maturity: 30.7k stars, 1.9k forks, 784 commits, MIT. No releases listed; last commit date not shown. — [qmd README](https://github.com/tobi/qmd)

**Basic Memory: [github.com/basicmachines-co/basic-memory](https://github.com/basicmachines-co/basic-memory)**
- Persistent AI memory as Markdown files over MCP. Tools include `bm_write/read/edit/search/context`. Obsidian-compatible: point Obsidian at the folder and the graph view and wikilinks work. — [Basic Memory README](https://github.com/basicmachines-co/basic-memory)
- Local use is free (Python + uv). Cloud costs $15/mo (regular $19) or $12.50/mo yearly. AGPL-3.0, about 4.4k stars. Windows is not documented explicitly; the test suite has a `windows` marker. — [Basic Memory README](https://github.com/basicmachines-co/basic-memory)

**Serena: [github.com/oraios/serena](https://github.com/oraios/serena)**
- Symbol-level (LSP-based) retrieval, editing, and refactoring MCP, described as "the IDE for your agent". It claims its symbolic tools are "much more token-efficient than typical alternatives" but gives no figures. 30.9k stars. Licensed MIT (SolidLSP) and GPL-3.0 (rest). Install with `uv tool install -p 3.13 serena-agent`, then `serena init`. In Claude Code its basic file/shell tools are disabled by default. Some refactorings need a paid JetBrains plugin. Windows is not mentioned. — [Serena README](https://github.com/oraios/serena)
- A third-party blog (July 2026) puts Serena at 26k+ stars, Context7 at 58.5k+, and the official GitHub MCP at 31.1k+. These figures are secondhand. — [Claude Market blog](https://claudemarket.ai/blog/best-mcp-servers-for-claude-code)

**Obsidian MCP servers**
- A September 2026 Glama roundup ("20 Best Obsidian MCP Servers") reportedly recommends starting with obsidian-local-rest-api–based servers. I saw this only in a search snippet; the page returned 404 on fetch. — [Glama (search snippet only)](https://images.glama.ai/mcp/best/obsidian)

### Inferences
- The user already runs the LLM-Wiki pattern with index.md/log.md, so Claude Code's own Read/Grep tools already work on the vault without any MCP. Each MCP adds tool names and instructions to every session. qmd only pays off once the wiki outgrows index.md navigation (rough guess: hundreds of pages), or for semantic queries across raw sources. Its CLI can be called via Bash, which per Anthropic's CLI-over-MCP guidance is cheaper than the MCP.
- An Obsidian MCP server (Local REST API) adds little, because Claude Code has direct filesystem access to the vault. It only matters for Obsidian-specific operations such as running Dataview queries or acting on the open note.
- Basic Memory duplicates what the user's own `wiki` skill and vault already do, and adds an AGPL server. It is low priority.
- Serena helps code navigation in larger typed codebases. Bío Digital is a static HTML/JS generator, so Serena's value is probably modest. An official LSP code-intelligence plugin (for example TypeScript) from `claude-plugins-official` is the lighter alternative.
- The user's 24 KB `contexto_biodigital` skill: Anthropic recommends keeping the SKILL.md body under 500 lines and splitting the rest into reference files loaded on demand. Splitting it into `SKILL.md` plus `reference/*.md` would likely cut per-invocation tokens. Measure with `/usage` attribution or `claude plugin details`.
- Highest-ROI, zero-cost action: run `/usage` (7-day view) and `/context` to see which MCPs, skills, and CLAUDE.md files actually consume tokens before adding anything. The user has many connected MCPs (Supabase, Vercel, Canva, Gmail, Calendar, Drive, draw.io, context7, two browsers), and disabling the unused ones per project via `/mcp` is free savings.

### Gaps
- No verified Windows install reports for qmd. My search for qmd Windows issues returned nothing relevant. Treat it as "likely works via npm/Node, untested on Windows; possible node-llama-cpp/GPU friction".
- Last-commit dates for qmd, Serena, and Basic Memory were not visible.
- No independent benchmark found that quantifies qmd or Serena token savings.
- I could not fetch a working Obsidian MCP comparison page (404), so the specific Obsidian MCP repos (for example mcp-obsidian, obsidian-claude-code-mcp) are unverified.

## 2. Which research-enhancing MCPs are best, and what do they cost?

### Takeaway
Several web search MCPs now have keyless or free remote endpoints: Exa (`mcp.exa.ai/mcp`), Parallel (`mcp.parallel.ai/mcp`), and Firecrawl keyless (`mcp.firecrawl.dev/v2/mcp`). Tavily offers 1,000 free credits/month, and Firecrawl 1,000 credits/month. Brave's free tier is disputed. Claude Code already has built-in WebSearch/WebFetch plus two browsers, so a search MCP is an upgrade in quality and clean extraction, not a new capability. For GitHub, Anthropic's own guidance prefers the `gh` CLI over an MCP.

### Cited Findings
- Tavily: 1,000 credits/month free, no card required. Reportedly acquired by Nebius in 2026. — [search summary of parallel.ai/costbench articles](https://costbench.com/compare/exa-vs-tavily/) (secondary; verify on tavily.com)
- Exa free tier: sources conflict. One says $10/month in credits; another says $20 starting credits plus $10/month; a July 2026 source says up to 20,000 free requests/month. — [costbench Exa vs Tavily](https://costbench.com/compare/exa-vs-tavily/); [parallel.ai free search APIs](https://parallel.ai/articles/best-free-web-search-api) (conflicting, unverified)
- Brave Search API: one source says $5 free credits monthly; another says the hobbyist free tier "no longer exists". — [geekflare](https://geekflare.com/guides/brave-search-api-alternatives/); [beri.net](https://www.beri.net/article/tavily-vs-exa-vs-brave-vs-perplexity-search-api-agent-cost-2026) (conflicting)
- Firecrawl: 1,000 credits/month free. Its keyless MCP tier shares daily limits across a public IP; crawl, map, and agent need a key. — [parallel.ai best web search MCP](https://parallel.ai/articles/best-web-search-mcp)
- MCP endpoints (from a vendor-written comparison, Parallel ranks itself first): Parallel is free with no key at individual rate limits. Exa's open-source MCP covers casual use, with an optional key. Tavily needs a key for real use. Brave needs `BRAVE_API_KEY`. Jina and Perplexity are not covered. — [parallel.ai best web search MCP](https://parallel.ai/articles/best-web-search-mcp) (vendor bias)
- One competitor table cites Artificial Analysis scores: Firecrawl 73, Tavily 66, Brave 65. — via search summary of [parallel.ai Exa alternatives](https://parallel.ai/articles/exa-alternatives) (vendor-sourced, treat cautiously)
- Anthropic: "Prefer CLI tools when available: Tools like `gh`… are still more context-efficient than MCP servers." — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)
- The official GitHub MCP server has 31.1k+ stars per a July 2026 blog (secondhand). — [Claude Market blog](https://claudemarket.ai/blog/best-mcp-servers-for-claude-code)

### Inferences
- Best fit for "few but excellent" and free: add **Exa MCP** (remote, keyless for casual use; semantic search good for papers and docs) OR **Firecrawl** (clean page-to-markdown extraction that cuts tokens versus raw HTML from WebFetch). Pick one, not both. Combined with the built-in deep-research skill, this improves source quality.
- For GitHub, install `gh` CLI (`winget install GitHub.cli`) instead of the GitHub MCP. This aligns with Anthropic's CLI-first guidance and suits the hito of uploading Programación Aplicada code to GitHub.
- context7 (already connected) covers library docs; nothing else is needed there.

### Gaps
- No primary-source pricing pages fetched for Exa, Tavily, Brave, Firecrawl, or Jina, so all free-tier figures are secondary and some conflict. Verify on each pricing page before relying on them.
- Jina Reader/Search MCP: not researched (no tool calls left).
- No independent (non-vendor) quality benchmark found.

## 3. Official Anthropic guidance on skills: progressive disclosure, consolidation, skills vs CLAUDE.md vs MCP, and the "skills become unnecessary as models improve" statement

### Takeaway
Anthropic's official line is "Claude is already very smart. Only add context Claude doesn't already have", along with "don't state the obvious", "give Claude flexibility", and evaluating against a no-skill baseline. **I could NOT find an Anthropic statement that skills become unnecessary or limiting as models improve.** That claim appears in third-party commentary (MindStudio, Oct 2026) and in an unverified secondhand LinkedIn claim about Boris Cherny cutting more than 80% of Claude Code's system prompt.

### Cited Findings
- Progressive disclosure: "At startup, the agent pre-loads the `name` and `description` of every installed skill into its system prompt", then reads the full SKILL.md when relevant, then bundled files only as needed. "Progressive disclosure is the core design principle." Published 2025-10-16. — [Anthropic Engineering: Equipping agents… with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- That article does NOT say skills will become less necessary. Its forward-looking line is "As model capabilities improve, we can now build general-purpose agents…". — [Anthropic Engineering](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- "The context window is a public good." "**Default assumption:** Claude is already very smart. Only add context Claude doesn't already have." It also asks "Does this paragraph justify its token cost?" — [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- "Skills act as additions to models, so effectiveness depends on the underlying model… Claude Opus (powerful reasoning): Does the Skill avoid over-explaining?" — [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- Evaluation-first: "Run Claude on representative tasks without a Skill… Establish baseline… Write minimal instructions." Also: "Keep the SKILL.md body under 500 lines"; keep references one level deep; descriptions are capped at 1,024 characters; "Avoid offering too many options." — [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- Thariq Shihipar (Anthropic), "Lessons from Building Claude Code: How We Use Skills", dated Jun 03, 2026 on the page (mirrors date it 17 Mar 2026):
  - "A skill that restates what Claude would do by default adds context without adding value… focus on information that pushes Claude out of its normal way of thinking."
  - "The highest-signal content in any skill is the Gotchas section."
  - "be careful of being too specific in your instructions… give it the flexibility to adapt to the situation." Figure caption: "State the goal and the constraints, not every step."
  - "every skill that is checked in also adds a little bit to the context of the model."
  - Anthropic uses a PreToolUse hook to log skill usage and find skills that are "undertriggering". [Example code](https://gist.github.com/ThariqS/24defad423d701746e23dc19aace4de5).
  - The article does NOT address removing skills as models improve. — [claude.dev blog (Thariq)](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/)
- Skills vs CLAUDE.md: CLAUDE.md is loaded every session; move workflow-specific instructions into skills, which load on demand. Hooks cover deterministic preprocessing. MCP tools are deferred, and CLI is preferred over MCP when available. — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)
- Third-party (not Anthropic), MindStudio, 2026-10-18: "Claude's base models have absorbed most of the instructions those skills used to spell out." It reports an informal test in which 7 of 9 popular skill packs did no better than a same-length dummy file, and advises "try to complete the job with no skill at all." It cites no specific Anthropic documents. — [MindStudio](https://www.mindstudio.ai/blog/claude-skills-still-needed-2026/)
- Secondhand and UNVERIFIED: a LinkedIn post claims Boris Cherny said Anthropic removed more than 80% of Claude Code's system prompt for a new release because newer models no longer needed the corrective instructions. — via [search result (LinkedIn, "I Deleted All My Claude Skills… And Claude Got Smarter")](https://de.linkedin.com/in/sobolev1); I did not find a primary Anthropic source.

### Inferences
- The idea the user recalls is best supported officially by: "Claude is already very smart"; "A skill that restates what Claude would do by default adds context without adding value"; "State the goal and the constraints, not every step"; and baseline-first evals. Together these imply pruning skills that only restate defaults. That makes design/animation instruction packs (impeccable, apple-design, emil-design-eng, improve-animations, review-animations; five overlapping ones) the main candidates to consolidate or disable when not doing UI work. Their descriptions still load every session.
- Practical test: run the same UI task with and without one design skill, as the official eval approach suggests. The `skill-creator` skill (already available) has eval tooling.

### Gaps
- No primary Anthropic quote found that explicitly says skills become unnecessary, limiting, or constraining as models improve. The Boris Cherny 80% claim is unverified.
- The Thariq post's date conflicts between the page (Jun 03, 2026) and mirrors (17 Mar 2026), possibly a republish.

## 4. Curated lists and official marketplaces: which entries stand out?

### Takeaway
The official marketplace `claude-plugins-official` (anthropics/claude-plugins-official) is the safe default. It auto-updates and shows per-plugin context-cost estimates. The community list awesome-claude-code (hesreallyhim) is large (about 56.9k stars), but I could not extract standout entries from it in this pass.

### Cited Findings
- Official marketplace: `claude-plugins-official`, added automatically on first interactive session. Example plugin: `commit-commands`. The plugin details pane shows "Will install" components, "Last updated", and a "Context cost" with "Every turn" and "When invoked" estimates. A separate community marketplace exists. — [Claude Code docs: discover plugins](https://code.claude.com/docs/en/discover-plugins)
- Auto-update is on by default for official marketplaces and off for community and third-party ones. "A plugin can run hooks and MCP servers, so read the pane before you install." — [Claude Code docs: discover plugins](https://code.claude.com/docs/en/discover-plugins)
- Desktop app: **+** next to the prompt → **Add plugins** to browse and install. — [Claude Code docs: discover plugins](https://code.claude.com/docs/en/discover-plugins)
- awesome-claude-code: 56.9k stars, 4.9k forks, 2,270 commits, maintained by `hesreallyhim`. Entries live in the README and `THE_RESOURCES_TABLE_NEW.csv`, which were not parsed. — [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- Code intelligence plugins (LSP) are an official category recommended for token savings. — [Claude Code docs: costs](https://code.claude.com/docs/en/costs)

### Inferences
- Plugins worth checking in the official marketplace, by name: a TypeScript/JS code-intelligence (LSP) plugin for Bío Digital's Node generator, and qmd's own plugin if the vault grows. Check the "Context cost" field before installing anything.

### Gaps
- No standout awesome-claude-code entries extracted; the README/CSV was not fetched.
- anthropics/skills repo contents and stars not fetched this session.
- The full list of official marketplace plugins was not retrieved.

## 5. Obsidian plugins that help an LLM-maintained wiki

### Takeaway
Karpathy's gist explicitly names Dataview (queries over frontmatter), Obsidian Web Clipper (web pages to markdown into raw/), Marp (slides), and graph view. I did not verify Smart Connections, Obsidian Git, or Local REST API this session.

### Cited Findings
- The gist names Obsidian Web Clipper, Dataview ("queries over page frontmatter"), Marp, and graph view ("the best way to see the shape of your wiki"). — [Karpathy gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- Basic Memory notes open directly in Obsidian (graph view, wikilinks). — [Basic Memory README](https://github.com/basicmachines-co/basic-memory)

### Inferences
- Minimal useful set: **Web Clipper** to feed raw/ cheaply (clean markdown means fewer tokens at ingest); **Dataview**, so the LLM writes frontmatter and the user gets dashboards for free with zero token cost; **Obsidian Git** for versioning LLM edits (UNVERIFIED this session, from general knowledge); and the built-in graph view for lint (orphan pages).
- Smart Connections (local embeddings inside Obsidian) overlaps with qmd. Pick one retrieval layer, and qmd is the one Claude Code can call.

### Gaps
- Smart Connections, Obsidian Git, and Local REST API: features, maintenance status, and Windows behavior were not verified (no tool calls left). Treat any claims about them as unverified.
