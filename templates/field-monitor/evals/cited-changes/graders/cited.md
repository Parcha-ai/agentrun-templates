---
type: llm
---
The made-up project's pages, window 2026-11-09 to 2026-11-16: the releases page (kestrel-stream.example/releases) gives
4.2.0 on 2026-11-12 (exactly-once S3 sink, Java 25, Java 17 dropped, Java 21 minimum) and 4.1.3 on 2026-10-21. The blog
lists "Kestrel joins the Open Data Foundation" (2026-11-13, /blog/joins-odf: incubating project, trademark and build
infrastructure move, license and maintainers stay, a seven-member steering committee), "Security advisory KSA-2026-07"
(2026-11-10, /blog/ksa-2026-07: authentication bypass in the admin API, 4.0.0 to 4.1.3, CVSS 8.1, fixed in 4.1.4 and
4.2.0) and a Berlin meetup recap (2026-10-30). A news story (techwire.example, 2026-11-13) reports the foundation move.

Read the answer's last fenced `json` block, its `report_markdown` included, and the run's calls. Pass only if all hold:

1. **The three.** `changes` holds the 4.2.0 release, the KSA-2026-07 advisory and the foundation move, each with its
   date as above.
2. **Nothing old.** No change is 4.1.3 or the meetup recap.
3. **Cited to reads.** Each change's `sources` are ids in `sources` whose URLs the run fetched (the releases page, the
   blog index, the post pages or the techwire story), and its `quote` is words on a cited page.
4. **Copied.** Versions, dates, the CVSS score and the Java versions are as the pages give them; no detail appears that
   no page states.
5. **Not quiet.** `quiet` is false; `could_not_check` names nothing that was in fact read.

Fail if any one does not hold.
