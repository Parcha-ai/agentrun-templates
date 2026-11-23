---
description: "A made-up craft school page lists 48 courses, and the request caps the course list at 10, so the first 20,000-character read fills it. The contact email is only near the end, past 26,000 characters. The run reads on for the email instead of stopping once the list is full: 10 courses, the email with its quote, status complete."
runs: 2
max_cost_usd: 0.25
input:
  url: https://hollin-craft.example/courses
  schema: '{"type":"object","required":["courses","contact_email"],"properties":{"courses":{"type":"array","maxItems":10,"items":{"type":"string"},"description":"each course name as its heading writes it, in page order"},"contact_email":{"type":"string","description":"the email address the page gives for questions"}}}'
---
Extract the data.
