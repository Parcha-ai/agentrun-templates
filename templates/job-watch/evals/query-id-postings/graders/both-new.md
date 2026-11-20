---
type: llm
---
Yesterday's run showed Lumen Health's Product Designer, Patient App (careers.example/careers?jobId=101), still open today
and unchanged. Today the same careers page also lists two new jobs: Product Designer, Clinician Tools (?jobId=102,
posted 2026-11-17, Lisbon hybrid) and Product Designer, Billing (?jobId=103, posted 2026-11-18, remote EU). The three
urls differ only by their jobId.

Read the answer's last fenced `json` block. Pass only if all hold:

1. `postings` holds exactly the Clinician Tools and Billing jobs: neither is dropped as a repeat of the Patient App job.
2. The Patient App job is not in `postings`; it is noted in `dropped_repeats`.
3. `changes` is empty.

Answer pass or fail, and quote what decided it.
