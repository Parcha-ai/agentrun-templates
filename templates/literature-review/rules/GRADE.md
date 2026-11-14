# Extracting and rating

## Extract, per study

Design; sample size (total, and per arm for a trial); population and setting; outcome measure; effect size with its 95%
interval and the metric; follow-up length; funding; preregistration where known.

Report effect sizes exactly as published, with the metric: SMD (standardized mean difference), MD (mean difference), OR,
RR, HR. Say the direction ("lower is better"). If you convert (OR to RR, SMD to a raw scale) or pool numbers yourself,
write "my calculation" and the method in `finding`.

## One sample, once

A protocol, a primary paper, a secondary analysis and a follow-up of one trial are one sample. Keep one primary row; the
others carry `same_trial_as`. A meta-analysis's included studies are not extra studies when you also list them.

## Flags

`preprint`, `retracted`, `expression_of_concern`, `small_sample` (under about 50 per arm), `industry_funded`,
`vendor_run` (the vendor ran the study of its own product), `abstract_only`, `same_trial_as_other`,
`out_of_scope_seminal`.

## Rate each outcome (GRADE style)

Start from the design: randomized trials start high, observational studies start low. Then move down for:

- **Risk of bias**: unblinded outcome assessment, high attrition, selective reporting, dropped registered outcomes.
- **Inconsistency**: results differ across studies without an explanation.
- **Indirectness**: the population, dose or outcome is not the one the question or context asks about.
- **Imprecision**: small samples, wide intervals that cross no effect and a meaningful effect.
- **Publication bias**: a funnel of small positive studies, unpublished registered trials.

Move up, for observational evidence only, for a large effect or a clear dose-response. Rate the outcome `high`,
`moderate`, `low` or `very_low`; `insufficient` when no usable study reports it. Give the reason in a sentence naming
the domains that moved it. The overall `certainty` comes from the outcomes that matter most for the question.

## Never

- Cite a paper you did not open.
- Describe a paper's methods or results from its abstract alone.
- Present one study as a consensus.
- Add effect sizes from different outcomes or scales.
- Turn the evidence into clinical, legal or financial advice.
