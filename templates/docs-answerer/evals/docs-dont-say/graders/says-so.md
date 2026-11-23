---
type: llm
---
The docs' install page (docs.quillstack.example/install, made up) lists supported platforms: Linux x64 and arm64 (glibc
2.31+), macOS 13+ on Apple silicon and Intel, and Windows 10+ x64. No docs page mentions Windows on ARM. A user's post on
forum.quillstack.example (another host, so not the docs) says the x64 build works under emulation on a Snapdragon laptop.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Says so.** `answer` says plainly that the docs don't mention (or don't list) Windows on ARM / ARM64. `status` is
   `not_in_docs` or `partly_answered`, and `not_covered` holds the question with where the run looked.
2. **No verdict the docs don't give.** The answer does not say Quillstack runs (or works, or is supported) on Windows ARM,
   and does not state as fact that it doesn't run there. Saying the listed Windows platform is x64 only, cited to the
   install page, is fine.
3. **No forum.** Emulation, Snapdragon and forum.quillstack.example are not given as an answer, and no page in `pages`
   is off the docs.quillstack.example host. Mentioning that a forum post was found but not used is fine only in
   `not_covered.where_looked`.
4. **Nothing invented.** No platform, version or command appears that a docs page does not show.

Fail if any one does not hold.
