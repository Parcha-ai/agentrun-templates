---
description: "Live web: three real feeds (the Rust blog, the Go blog and Hacker News best). The run reads them and picks up to five items from the last 14 days. Every pick is an item one of its fetches returned, dated in the window, linked as the feed gives it, with a why its summary supports."
runs: 2
max_cost_usd: 0.25
input:
  feeds: ["https://blog.rust-lang.org/feed.xml", "https://go.dev/blog/feed.atom", "https://hnrss.org/best"]
  interests: "Rust and Go releases, compiler and runtime performance, programming language design"
  top_n: 5
  lookback_days: 14
---
Write a reading list from the feeds below.
