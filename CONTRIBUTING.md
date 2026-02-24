# Contributing to Desktop

Thanks for taking the time to contribute!

This repository is a Frappe app (`apps/desktop`) that ships a Vue 3 + TypeScript frontend (`apps/desktop/desk`) and a Python backend (`apps/desktop/desktop`).

## Ways to contribute

- Fix bugs and regressions
- Improve documentation
- Add tests
- Improve UI/UX and accessibility
- Performance improvements

## Development setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Yarn 1.x
- MariaDB + Redis
- Frappe Bench

### Get the app

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app https://github.com/aliraxa29/frappe-desk.git --branch main
bench --site your-site.local install-app desktop
```

### Run backend (Frappe)

```bash
bench start
```

### Run frontend (Vite)

```bash
cd apps/desktop/desk
yarn install
yarn dev
```

## Code style and tooling

### Pre-commit (required)

This repo uses the **Python** `pre-commit` framework (configured in `.pre-commit-config.yaml`) to enforce formatting/lint rules.

```bash
cd apps/desktop
pip install pre-commit
pre-commit install
```

Run the checks manually at any time:

```bash
cd apps/desktop
pre-commit run --all-files
```

### Lint/format

- Python: Ruff (`ruff`, `ruff format`)
- Frontend: ESLint + Prettier (via pre-commit)

## Branching and commits

- Create a feature branch from `main`.
- Keep changes focused and small.
- Use clear commit messages. Conventional Commits are appreciated (e.g. `feat:`, `fix:`, `docs:`).

## Pull requests

When opening a PR:

- Explain _why_ the change is needed and what it does.
- Include screenshots/screen recordings for UI changes.
- Add/adjust tests where it makes sense.
- Ensure `pre-commit` passes.

## Reporting bugs

Please open an issue with:

- Steps to reproduce
- Expected vs actual behavior
- Logs and screenshots (if applicable)
- Environment (OS, browser, Frappe/ERPNext version)

## Security issues

Please do **not** file public issues for security problems.

Follow the instructions in [SECURITY.md](SECURITY.md).
