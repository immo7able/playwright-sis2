# AI usage — SIS 2 CI pipeline

## Tool and model

- **Tool:** Claude Code (Anthropic), desktop app
- **Model:** Claude Opus 5.5
- **Used for:** the CI part of SIS 2 only. The tests were written earlier (see [Prompt.md](Prompt.md) and [Review.md](Review.md)).

## How I used it

Q&A while following the assignment guide. Questions were like:

- what I need to prepare before starting;
- how to adapt the guide's config to my project, which already has a `setup` project for login;
- does sharding still work with that `setup` dependency;
- how to check `forbidOnly`, the reporters and the report merge locally before pushing;
- how to measure the runtime before/after sharding.

## Where AI helped

- Explained the steps of the guide and how they fit my project.
- Suggested how to check that sharding works with the `setup` project (`--list --shard=1/4`).
- Helped with `playwright.config.ts`: added some CI-only settings and reporters, changed a few lines
  (for example `BASE_URL ??` → `BASE_URL ||`, because an empty GitHub variable comes as an empty string).
- Helped with the workflow file: adapted the guide's example and added a couple of lines
  (`if-no-files-found: ignore` for empty `test-results/`).
- Helped write and rephrase parts of the CI section in `README.md`.

## What I did myself

- Chose GitHub Actions (the repository is already on GitHub).
- Ran the CI-mode checks locally (full run, two shards + merge, the `test.only` check).
- Reviewed the changes, committed and pushed, opened the PR, checked the runs, cache and artefacts on GitHub.
- Ran the timing runs and filled in the table and the conclusion.
- Merged into `main` for the badge.
