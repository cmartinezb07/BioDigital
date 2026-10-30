# Immersive / 3D web for Bío Digital: the "hover window → zoom into room" effect and lighter wow effects (research as of 30-Oct-2026)

Scope note: about 15 searches and fetches. Many sources are third-party aggregators. Items marked **[UNVERIFIED]** come from a single secondary source or from the researcher's background knowledge with no source fetched this session.

## How is the "hover window lights up → click → fly into a realistic room" effect built, and was it AI-made?

### Takeaway
The effect is almost certainly a standard WebGL pattern rather than one magic "AI 3D tool". A 3D building model (GLB) is rendered with three.js, React Three Fiber or Spline. A raycaster detects the window under the pointer and raises that mesh's emissive or opacity. On click, the camera tweens (lerp or GSAP) to a target, and an interior is then revealed, loaded or crossfaded (a separate GLB, a Gaussian splat or a pre-rendered image or video). An AI coding assistant can write all of that code. AI 3D generators can supply props or a rough building, but a realistic interior usually comes from a phone capture turned into a Gaussian splat, from a 3D artist's render, or from an AI world generator such as Marble. A short video alone cannot show which of these was used.

### Cited Findings
- A documented R3F "interactive property explorer" works like this. A click sets an `isClicked` flag. Inside `useFrame` the camera lerps about 10% per frame toward a close, slightly elevated target, which gives an ease-out, and calls `lookAt`. The other building meshes are traversed and set to opacity 0.05 ("X-ray" focus). Text and cards stay in HTML through drei's `Html`. The scene only re-renders while the camera is moving (`invalidate`). It uses low-poly proxy geometry, and the author plans (not yet tested) to swap in Gaussian splat scans from drone captures. The article mentions no AI tools. — [pmdice Substack, "Greyboxing the Spatial Web"](https://pmdice.substack.com/p/greyboxing-the-spatial-web)
- A Codrops tutorial (Feb 2023) animates a scroll-driven camera fly-through with Theatre.js + React Three Fiber + drei over a GLTF scene, and has a companion repo. — [Codrops](https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/); [GitHub drcmda/codropscameraflythroughtutorial](https://github.com/drcmda/codropscameraflythroughtutorial)
- No open-source GitHub repo was found that matches the exact "building → hover apartment → zoom" demo. The closest hits were a three.js house builder with hover tooltips (ch-bas/threejs-sims-house-builder), Threebox's click and hover on 3D buildings over Mapbox, and a MapTiler "Luxury Apartment" demo with floor hover. Commercial "interactive apartment selector" services exist (Maverickframe). — [GitHub ch-bas wiki](https://github.com/ch-bas/threejs-sims-house-builder/wiki); [Threebox interactions](https://www.mintlify.com/jscastro76/threebox/examples/interactions); [MapTiler 3D model interaction](https://docs.maptiler.com/sdk-js/examples/3d-js-model-interaction/); [Maverickframe](https://maverickframe.com/services/interactive-apartment-selector/)
- AI generators in 2026, from mostly vendor-affiliated blogs:
  - Meshy 6 (Jan 2026) has a low-poly mode and quad retopology. Commercial use requires a paid plan.
  - Tripo v3.1 produces a model in about 20 s with GLB/USDZ export and auto-rigging. Its free tier is non-commercial.
  - Hunyuan3D 2.1 is open source, while 3.0 and 3.1 are not, per one source.
  - TRELLIS.2 (MIT) is the top self-hostable option.
  - These tools target objects or assets, not full interiors. — [Cinevva guide](https://app.cinevva.com/ko/guides/ai-3d-model-generators); [Scenario comparison](https://help.scenario.com/en/articles/comparing-generative-3d-models/)
- World Labs Marble generates explorable 3D worlds from text or images and exports Gaussian splats as SPZ (native) or PLY, each at about 2M and 500k splats. The Free plan cannot export. Plan prices (from press or blogs, verify on marble.worldlabs.ai/pricing):
  - Standard: about $20/mo, includes export.
  - Pro: about $35/mo, adds HQ GLB mesh and commercial rights.
  - Max: about $95/mo.
  - API: about $1.2 per world. — [World Labs docs: Gaussian splat export](https://docs.worldlabs.ai/marble/export/gaussian-splat); [invideo blog](https://invideo.io/blog/world-labs-marble-3d-worlds/)
- World Labs also builds Spark (MIT), a three.js Gaussian splat renderer, so a Marble world or a phone-captured splat can be dropped into a vanilla three.js scene as a `SplatMesh`. — [sparkjs.dev](https://sparkjs.dev/); [GitHub sparkjsdev/spark](https://github.com/sparkjsdev/spark)

### Inferences
- A plausible pipeline for the viral clip:
  1. Building GLB, hand-modelled or AI-generated, then cleaned in Blender.
  2. Windows as separate meshes with names.
  3. A three.js `Raycaster` on `pointermove` switches `material.emissive` / `emissiveIntensity`, or swaps in a lit texture.
  4. On click, GSAP tweens `camera.position` and the `controls.target` toward the window.
  5. At the end of the tween, a fade into an interior scene (a GLB with baked lighting, a splat, or a 360°/pre-rendered video).

  Claude Code can write steps 3–5 in vanilla JS. The realistic interior is the asset-heavy part.
- The "realistic bedroom/bathroom" is most cheaply and credibly delivered as a Gaussian splat captured with a phone (Scaniverse or Polycam) or as a pre-rendered video. Real-time PBR interiors with baked lighting need Blender skills the team likely lacks.
- On touch phones there is no hover. The "lit window" state must come from tap-to-preview, an auto-cycling highlight or scroll.

### Gaps
- Could not identify the specific video the user saw, so it is unknown whether it was made in Spline, R3F or with AI-generated assets.
- No Awwwards case study was fetched that names the tools for a building/room effect. Awwwards "Site of the Day" credits typically list three.js/GSAP **[UNVERIFIED, background knowledge]**.

## Which pipelines and tools can a 5-person student team using Claude Code realistically use with a vanilla static site?

### Takeaway
Best fit: vanilla three.js plus GSAP (now free with all plugins), loaded only on the page or section that needs it, and Spark for any splats. React Three Fiber and drei are the richest ecosystem but require React, which conflicts with the vanilla setup. Spline is fastest for designers, but code export needs a paid plan and its runtime size is undocumented. For most client sites, scroll-driven image sequences, View Transitions and CSS give 80% of the wow for 5% of the cost.

### Cited Findings
- **GSAP:** the official README (v3.15.0) says GSAP is "100% FREE including ALL of the bonus plugins like SplitText, MorphSVG", thanks to Webflow, under the "no charge" Standard License, including commercial use. The `gsap-trial` package is deprecated. — [GSAP README on jsDelivr](https://cdn.jsdelivr.net/npm/gsap@3.15.0/README.md); [gsap-trial README](https://cdn.jsdelivr.net/npm/gsap-trial@3.13.0/README.md)
- **Cross-document View Transitions** (MPA page-to-page morphs, ideal for a static multi-page site). The current Chrome docs list Chrome 123, Edge 123, Firefox 147 and Safari 26.2. Older versions of the same page listed Firefox as unsupported and Safari 18.2. Verify on caniuse; Firefox support is recent. — [Chrome for Developers](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document); a 2026 third-party guide still says Firefox is "in development" (likely stale) — [devtoolbox](https://devtoolbox.dedyn.io/blog/css-view-transitions-complete-guide)
- **Spline:** free (watermark), Starter about $12–15/mo, Professional about $20–25/mo, Enterprise custom. Code export reportedly moved from Enterprise-only to Professional in March 2026. The AI tier reportedly rose to $70/mo in August 2026. All from aggregators, verify at spline.design/pricing. Runtime or viewer size was not found. — [PricingSaaS Spline](https://pricingsaas.com/companies/spline); [CostBench Spline](https://costbench.com/software/ai-3d-generation/spline/); [spline.design/pricing](https://spline.design/pricing)
- **Theatre.js:** the latest release in the docs is v0.7.0 (10 Aug 2023). The docs were last edited Feb 2024. Core is Apache-2.0 and Studio is AGPL-3.0. There is no evidence of 2026 activity, so it is risky to adopt. — [Theatre.js releases](https://www.theatrejs.com/docs/0.5/releases); [npm @theatre/studio](https://npmjs.com/package/@theatre/studio)
- **three.js in 2026:** r183 renamed PostProcessing → RenderPipeline for WebGPURenderer and deprecated `Clock` in favour of `Timer`. Users reported WebGPU slower than WebGL in r182, which a maintainer said was fixed for r183. — [three.js forum](https://discourse.threejs.org/t/webgpu-significant-performance-drop-and-shadow-quality-regression-in-r182-vs-webgl-r170/89322); [Cinevva r183 summary](https://app.cinevva.com/news/2026-03-18-threejs-r183-render-pipeline)
- **Spark** needs three.js r180+, loads from npm or a CDN (vanilla-compatible), reads PLY/SPZ/SPLAT/KSPLAT/SOG, and targets 98%+ of WebGL2 devices. Spark 2.0 (14 Apr 2026) added streamable LOD. — [sparkjs.dev docs](https://sparkjs.dev/docs/overview/); [radiancefields Spark](https://radiancefields.com/platforms/spark)
- **Apple-style scroll sequence:** a `<canvas>` maps scroll progress to a frame index and redraws a pre-rendered image (e.g. a 147-frame AirPods sequence). Apple serves a single fallback image on slow connections. GSAP ScrollTrigger has a known recipe. — [CSS-Tricks](https://css-tricks.com/?p=308477); [GitHub example](https://github.com/Rachit-Pal/Apple-Scroll-Animation/blob/master/app.js); [GSAP forum thread](https://gsap.com/community/forums/topic/25188-airpods-image-sequence-animation-using-scrolltrigger/)

### Inferences
- Recommended tiering for Bío Digital:
  - **Tier 1, every site:** View Transitions + CSS scroll-driven animations + GSAP ScrollTrigger/SplitText/Flip + Lenis.
  - **Tier 2, premium:** a scroll-scrubbed image or video sequence (e.g. a camera walking into the cabaña), rendered once and served as WebP/AVIF frames or a short video.
  - **Tier 3, showcase:** three.js + Spark splat tour, lazy-loaded after a tap.
- Babylon.js and PlayCanvas are both capable and vanilla-friendly. PlayCanvas owns SuperSplat, which has strong splat tooling. three.js still has the largest pool of examples and LLM training data, so Claude Code is likely to be most fluent in it **[inference]**.
- Avoid R3F unless the team adopts React or Astro islands. The `crear-sitio-web` skill mentions an Astro final site, and Astro could host a React island if ever needed.

### Gaps
- Lenis (darkroom.engineering), Rive (interactive vector, runtime pricing) and the Babylon.js and PlayCanvas engine sizes were not researched this session. From background knowledge: Lenis is MIT and small, and Rive has a free editor tier with paid plans for export features **[UNVERIFIED]**.
- Exact current three.js gz size not found (see next section).

## What is the performance cost on mid-range Android phones (USD 150–300, 4G in Chile), and how do you mitigate it?

### Takeaway
three.js plus a model costs roughly hundreds of KB to a few MB. Splats cost several MB to tens of MB, and the GPU is limited by fill rate. Load 3D only after an explicit tap. Keep about 1M splats or fewer on mobile. Lower pixel ratio and render resolution, and always provide a static image or video fallback and a `prefers-reduced-motion` path. Do not put WebGL in the LCP path.

### Cited Findings
- **Bundle size data is old or anecdotal:**
  - Importing the full THREE namespace added about 557 KiB minified to one Webpack bundle.
  - A custom build reached 338 KB (92.5 KB gzipped).
  - The threejs-tree-shake plugin reported 773 kB → 590 kB minified.
  
  The researcher's recommendation is to measure on the current version. — [three.js forum, tree shaking](https://discourse.threejs.org/t/tree-shaking-three-js/1349?page=3); [three.js forum, webpack size](https://discourse.threejs.org/t/three-js-file-size-when-importing-via-npm-and-bundling-with-webpack/8904); [npm threejs-tree-shake](https://npmjs.org/package/threejs-tree-shake)
- **Splat budgets:** PlayCanvas recommends about 1M splats globally for mobile and 3M+ for desktop. Spark's docs list Android phones at 1–2M splats for 60+ FPS and iPhone at 1–3M (likely high-end devices **[inference]**). Fill rate (overlapping quads) is the main cost. SuperSplat's Performance Mode lowers render resolution. — [PlayCanvas splat performance](https://developer.playcanvas.com/user-manual/gaussian-splatting/building/performance); [SuperSplat streaming](https://developer.playcanvas.com/user-manual/supersplat/streaming/); [Spark docs](https://docsearch.algolia.com/mcp/docs/repo/sparkjsdev/spark)
- **PlayCanvas benchmark on iPhone 13 Pro Max** (not Android): WebGL2 38.1 fps at 1M splats falls to 20.4 fps at 4M. WebGPU reaches 78 fps at 4M. — [PlayCanvas blog](https://blog.playcanvas.com/new-in-supersplat-webgpu-and-streaming-bring-huge-performance-wins)
- **SOG compression:** under 1M Gaussians becomes a single `.sog`. Larger scenes become Streamed SOG with a device-dependent budget. — [SuperSplat streaming docs](https://developer.playcanvas.com/user-manual/supersplat/streaming.md)
- **Image sequences:** Apple ships a single fallback image to slow connections or mobile. — [CSS-Tricks](https://css-tricks.com/?p=308477); [setproduct](https://www.setproduct.com/blog/how-to-3d-animate-scroll)

### Inferences
- **Practical budget for a USD 150–300 Android phone on 4G:**
  - JS for 3D: ≤ about 200 KB gz (three core plus a few addons), loaded with dynamic `import()` on tap.
  - Model: GLB ≤ 2–3 MB, using Draco/meshopt and KTX2 textures.
  - Splat: 300k–500k Gaussians (Marble's 500k export, or a cropped capture) in SPZ/SOG, so a few MB.
  - Rendering: `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))` or lower.
  - Frame loop: render on demand, not continuously.
  
  These are researcher estimates, not measured on target devices.
- **Core Web Vitals:**
  - Use a poster image as the LCP element.
  - Mount the canvas after `requestIdleCallback`, IntersectionObserver or a click, which avoids LCP/TBT hits.
  - Reserve the canvas box size to avoid CLS.
  - Check `navigator.connection.saveData` and `prefers-reduced-motion` to skip 3D entirely.
- Test on a real low-end device (e.g. Samsung A-series or Motorola G-series). Desktop Chrome throttling does not emulate a weak mobile GPU.

### Gaps
- No measured FPS table for Chilean mid-range Android models was found. The team needs to test this itself.
- No authoritative current gz size for three.js r18x was found.
- Android WebGPU availability was not covered.

## Can Bío Digital productize a "recorrido 3D / virtual tour" for cabañas and restaurants? (Matterport vs 360° vs splats)

### Takeaway
Yes, and the cheapest credible product is a 360° photo tour: a 360 camera or phone panoramas plus Pannellum or Photo Sphere Viewer hosted on Cloudflare Pages, with no recurring fees. A Gaussian splat walkthrough, captured free with Scaniverse, cleaned in SuperSplat and shown with Spark or SuperSplat, is the differentiated "wow" upsell. Matterport has moved upmarket: Starter is reportedly gone and Pro starts at about $90/mo, which is hard to justify for small Biobío clients.

### Cited Findings
- **Matterport:** Starter and Business plans were reportedly dropped about 12-Oct-2026. Professional is reportedly from $90/mo (10 spaces, annual) or $108 monthly, and a $1,995 Pro3 bundle was added. Earlier Starter was about $9.99/mo. The researcher could not open matterport.com/plans, so verify there. — [PricingSaaS diff 2026W42](https://pricingsaas.com/companies/matterport/diffs/2026W42); [Travvir](https://travvir.com/blog/en/matterport-pricing-explained); [thefuture3d guide](https://thefuture3d.com/blog/matterport-pricing-guide-2026/)
- **360° viewers:** Pannellum is about 56 kB with its own WebGL renderer, hotspots and multi-panorama tours. Photo Sphere Viewer is built on three.js (about 600 kB lazy chunk), with polished UI and a virtual-tour plugin, and suits real-estate-style sites. Marzipano (Google) has the most control and needs more code. — [THETA community comparison](https://community.theta360.guide/t/5-free-360-image-viewers-for-javascript-web-and-mobile/9911); [Ourcodeworld](https://ourcodeworld.com/articles/read/843/top-7-best-360-degrees-equirectangular-image-viewer-javascript-plugins); [Marzipano tutorial](https://community.theta360.guide/t/tutorial-marzipano-getting-started-free-360-image-viewer-from-google/10108/3)
- **Capture apps:**
  - Scaniverse (Niantic): on-device splats free and unlimited in "Classic". New Plus ($20/mo) and Pro ($50/mo) cloud tiers. Exports PLY/SPZ.
  - Polycam: splats on the free tier with limited export. Pro about $26.99/mo.
  - Luma: status conflicting. Scaniverse says Luma's app dropped splat support and suspended splat processing, while another guide describes it as free. — [Scaniverse: which app to choose](https://scaniverse.com/news/creating-splats-which-app-to-choose); [SkyeBrowse Polycam vs Scaniverse (Jul 2026)](https://www.skyebrowse.com/news/posts/polycam-vs-scaniverse); [radiancefields Luma alternatives](https://radiancefields.com/luma-ai-alternatives); [PlayCanvas recommended tools](https://developer.playcanvas.com/user-manual/gaussian-splatting/creating/recommended-tools)
- **Splat viewers for the web:** SuperSplat (PlayCanvas) edits and publishes splats with WebGPU and streamed LOD. Spark renders them inside three.js. — [radiancefields SuperSplat WebGPU](https://radiancefields.com/supersplat-ships-compute-based-webgpu-rendering-and-automatic-streamed-lod); [sparkjs.dev](https://sparkjs.dev/)

### Inferences
- **Suggested offer ladder (effort estimates are the researcher's, unverified):**
  1. **"Tour 360°"**: 6–15 panoramas plus Pannellum hotspots ("pasa al baño", "ver terraza"). About 1 day of capture and setup, no subscription. Fits cabañas best.
  2. **"Recorrido inmersivo"**: one hero room as a splat (Scaniverse, then SuperSplat crop/compress to ≤ 500k, then Spark), tap-to-load, with a video fallback. About 2–3 days the first time.
  3. **"Edificio interactivo"**: a cabaña complex map, or an illustrated or 3D cabin where each unit lights up and links to its tour and booking. This ties into the existing reservation system (unit assignment), which is the real commercial value.
- For restaurants, a 360° or splat walkthrough adds less value than for lodging. Booking.com/Airbnb-style "see the room" intent is where tours drive conversion **[inference]**.
- Hardware: an entry 360 camera (e.g. Insta360 X series or Ricoh Theta) produces much better panoramas than phone stitching. Prices were not researched **[UNVERIFIED]**.

### Gaps
- No Chile-specific pricing benchmark for virtual tours was found.
- No conversion-lift data for tours on lodging sites was found.
- Polycam's and Luma's exact current plan terms are unverified.

## Best learning resources and repos to start from

### Takeaway
Start with Codrops demos and the three.js official examples for raycasting and camera tweening, the Spark examples for splats, and the GSAP docs for ScrollTrigger/Flip. Three.js Journey (Bruno Simon) is the standard paid course. Use the R3F property-explorer write-up as a design reference even though it uses React.

### Cited Findings
- Codrops camera fly-through tutorial and repo. — [Codrops](https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/); [GitHub](https://github.com/drcmda/codropscameraflythroughtutorial)
- R3F property explorer write-up (camera lerp, X-ray fade, HTML overlays, on-demand rendering). — [pmdice Substack](https://pmdice.substack.com/p/greyboxing-the-spatial-web)
- Spark renderer, MIT, with docs and examples. — [GitHub sparkjsdev/spark](https://github.com/sparkjsdev/spark); [sparkjs.dev](https://sparkjs.dev/)
- Gaussian splatting beginner tool lists. — [radiancefields getting started](https://radiancefields.com/getting-started-with-gaussian-splatting-tools-for-beginners); [PlayCanvas recommended tools](https://developer.playcanvas.com/user-manual/gaussian-splatting/creating/recommended-tools)
- Apple scroll sequence implementations. — [CSS-Tricks](https://css-tricks.com/?p=308477); [DEV tutorial](https://dev.to/bekbrace/creating-a-scrolling-animation-for-apple-airpods-1g0m)
- Official GSAP AI agent skills exist (greensock/gsap-skills, e.g. "gsap-plugins"). These could be installed for Claude Code. — [tessl registry greensock/gsap-skills](https://tessl.io/registry/skills/github/greensock/gsap-skills/gsap-plugins)

### Inferences
- **Fastest path to a demo:**
  1. Clone three.js `webgl_interactive_cubes` (the raycaster hover pattern) from threejs.org/examples.
  2. Replace the cubes with a GLB building whose window meshes are named.
  3. Add a GSAP tween on click.
  4. Mount a Spark `SplatMesh` of a Scaniverse capture.
  5. Prompt Claude Code with this exact architecture.

  This needs to be verified against the current examples list.

### Gaps
- Not fetched this session (from background knowledge, **[UNVERIFIED]** for current status and pricing):
  - Three.js Journey (threejs-journey.com)
  - pmndrs repos (drei, react-three-fiber, postprocessing)
  - awesome-threejs lists
  - Awwwards collections
  - Bruno Simon's portfolio
- No open-source "apartment chooser" repo was confirmed.
