# Dirigent

Dirigent runs in GitHub Actions on weekdays and can also be started manually. It needs no model API or paid service.

It considers open issues whose title starts with `[Dirigent]` and, on scheduled runs, that have label `dirigent:ready`. Priority labels are `priority:P0` through `priority:P3`. A maintainer authorizes exact changes with one JSON recipe in the issue body:

```html
<!-- dirigent-task
{"version":1,"changes":[{"path":"tests/example.spec.mjs","find":"exact old text","replace":"exact new text"}],"acceptance":["validation and browser tests pass"]}
-->
```

Only one to three exact replacements in existing allowlisted application or test files are accepted. Workflow, dependency, authentication, secret, service worker, version, deployment and database files are denied. The run creates an isolated branch and draft pull request, then runs the existing validation and browser gate.

Release is deliberately separate. A maintainer marks the PR ready, adds `dirigent:release-approved`, and manually runs `Dirigent controlled release`. That workflow refuses non-Dirigent branches, drafts, unapproved PRs, merge conflicts and failing required checks, then merges and dispatches the existing Pages workflow. Neither dispatch nor a successful upload alone is proof of the hosted user flow; the Pages run and hosted checks remain separate evidence gates.
