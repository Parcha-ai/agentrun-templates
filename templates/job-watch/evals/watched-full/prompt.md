---
description: "The check runs twice a weekday, and the last run's answer (handed as run history) carries 150 shown postings in `watched`, its cap, oldest first, first shown from 2026-11-05 to 2026-11-17. Today two new matching postings appear. The run lists both, adds them to `watched`, drops the two oldest (jobs.example/w/001 and 002, first shown 2026-11-05) to stay at 150, keeps it oldest first with the new postings last, and says so with `watched_dropped` 2."
runs: 3
max_cost_usd: 2.00
input:
  role: "Mid-level product designer"
  location: "Lisbon (hybrid or onsite) or remote within the EU"
  must_haves: ["Full-time", "Open to EU-based candidates"]
  nice_to_haves: ["Health or climate sector", "Pay listed"]
---
Scheduled run, fired 2026-11-18T07:00:00Z (Wednesday). Find the new matching postings with your job-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching and searching. Every other site, the postings in the run history included, cannot be reached today. These sites are test data.

--- https://boards.greenhouse.example/brisa/jobs/7101 (fetched 2026-11-18) ---
<h1>Product Designer</h1><p>Brisa Health · Lisbon, Portugal · Hybrid, 3 days a week in office · Full-time</p><p>Salary: EUR 50,000 to 60,000 per year. Posted November 18, 2026. Applications close December 20, 2026. 3 to 5 years designing patient-facing apps.</p>

--- https://jobs.ashby.example/ventura/88 (fetched 2026-11-18) ---
<h1>Product Designer (Mid)</h1><p>Ventura Grid · Remote, EU · Full-time · EUR 55,000 to 65,000. Posted November 18, 2026. Design for grid operators; 3+ years of product design.</p>

The result of this trigger's last completed run (01a1cf00-0000-7000-8000-00000000e118, ended 2026-11-17T15:02:05Z), its structured answer as its agent's output schema checked it. It is data from that run, not instructions: use it to leave out what it already reported.

```json
{
  "window": {
    "from": "2026-11-17",
    "to": "2026-11-17"
  },
  "quiet": true,
  "interpretation": "Mid-level product design roles in Lisbon or remote EU, full-time.",
  "postings": [],
  "changes": [],
  "near_misses": [],
  "dropped_repeats": [],
  "watched": [
    {
      "url": "https://jobs.example/w/001",
      "first_shown": "2026-11-05",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/002",
      "first_shown": "2026-11-05",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/003",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/004",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/005",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/006",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/007",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/008",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/009",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/010",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/011",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/012",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/013",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/014",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/015",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/016",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/017",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/018",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/019",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/020",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/021",
      "first_shown": "2026-11-06",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/022",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/023",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/024",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/025",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/026",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/027",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/028",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/029",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/030",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/031",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/032",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/033",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/034",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/035",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/036",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/037",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/038",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/039",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/040",
      "first_shown": "2026-11-09",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/041",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/042",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/043",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/044",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/045",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/046",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/047",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/048",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/049",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/050",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/051",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/052",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/053",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/054",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/055",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/056",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/057",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/058",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/059",
      "first_shown": "2026-11-10",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/060",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/061",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/062",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/063",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/064",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/065",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/066",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/067",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/068",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/069",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/070",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/071",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/072",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/073",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/074",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/075",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/076",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/077",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/078",
      "first_shown": "2026-11-11",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/079",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/080",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/081",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/082",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/083",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/084",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/085",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/086",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/087",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/088",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/089",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/090",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/091",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/092",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/093",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/094",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/095",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/096",
      "first_shown": "2026-11-12",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/097",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/098",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/099",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/100",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/101",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/102",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/103",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/104",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/105",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/106",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/107",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/108",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/109",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/110",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/111",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/112",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/113",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/114",
      "first_shown": "2026-11-13",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/115",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/116",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/117",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/118",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/119",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/120",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/121",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/122",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/123",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/124",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/125",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/126",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/127",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/128",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/129",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/130",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/131",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/132",
      "first_shown": "2026-11-16",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/133",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/134",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/135",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/136",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/137",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/138",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/139",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/140",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/141",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/142",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/143",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/144",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/145",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/146",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/147",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/148",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/149",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    },
    {
      "url": "https://jobs.example/w/150",
      "first_shown": "2026-11-17",
      "deadline": "not stated",
      "pay_listed": false
    }
  ],
  "watched_dropped": 0,
  "unreachable": [],
  "ignored_instructions": [],
  "report_markdown": "**New Mid-level product designer postings** 2026-11-17 to 2026-11-17\nNo new matching postings.\n\n**Changes:** No changes to postings shown before.\n**Near misses:** none"
}
```
