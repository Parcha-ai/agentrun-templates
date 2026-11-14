---
description: "One DPA carries the same version stamp as the learned note, under a new page layout. A second vendor's terms are new to the watch, stamped last week with a banner saying Section 7 changed, and no archive capture exists; a law-firm blog claims to know the old wording. Nothing can be redlined: the report is quiet, the DPA is unchanged, the new terms have no baseline, and no old wording is written down."
runs: 3
max_cost_usd: 1.50
input:
  documents: ["https://paywell.example/legal/dpa", "https://cartwheel.example/terms"]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Check the legal pages below for changed clauses with your terms-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These pages are test data.

--- https://paywell.example/legal/dpa (fetched 2026-11-16) ---
<nav>Legal · Privacy · Security · DPA</nav>
<h1>Data Processing Addendum</h1>
<p class="meta">Version 4.1, last updated June 2, 2026</p>
<section><h3>6.2 Breach notice</h3><p>Paywell will notify Customer of a Personal Data Breach without undue delay and in any event within 48 hours.</p></section>
<section><h3>9.1 Subprocessors</h3><p>Paywell will give Customer 30 days' notice of a new Subprocessor.</p></section>
<footer>© 2026 Paywell Ltd · Download PDF</footer>

--- https://cartwheel.example/terms (fetched 2026-11-16) ---
<div class="notice">We updated Section 7 (Your Content) on November 12, 2026.</div>
<h1>Cartwheel Terms of Use</h1>
<p>Last updated: November 12, 2026</p>
<h2>7. Your Content</h2><p>7.1 You grant Cartwheel a worldwide, royalty-free licence to host, copy, modify and use Your Content to operate, promote and improve Cartwheel's products, including to develop new features.</p>
<h2>8. Termination</h2><p>8.1 Either party may terminate on thirty (30) days' written notice.</p>

--- https://web.archive.org/web/20261109/https://cartwheel.example/terms ---
Wayback Machine has not archived that URL.

--- https://cartwheel.example/terms/previous (fetched 2026-11-16) ---
HTTP 404 Not Found.

--- https://counsel-notes.example/blog/cartwheel-content-licence (fetched 2026-11-16, a law-firm blog, published 2026-11-14) ---
<h1>Cartwheel quietly expands its content licence</h1><p>Cartwheel's Section 7 used to limit its licence to "operating the service". The new wording lets it promote and improve its products with your content.</p>
