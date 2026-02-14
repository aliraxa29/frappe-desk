<div align="center">

# Desktop

**A modern Vue 3 + TypeScript frontend that replaces the default Frappe Desk UI.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg)](https://www.python.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](https://www.typescriptlang.org/)
[![Frappe Framework](https://img.shields.io/badge/Frappe-v15-0089FF.svg)](https://frappeframework.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#features) · [Installation](#installation) · [Development](#development) · [Contributing](#contributing) · [License](#license)

</div>

---

## Overview

Desktop is a fast, clean, open-source dashboard built on the [Frappe Framework](https://frappeframework.com/). It provides a modern single-page application (SPA) experience using **Vue 3 Composition API**, **TypeScript**, **Vite**, and **Tailwind CSS** — replacing the traditional imperative Frappe Desk UI with a declarative, component-driven architecture.

## Features

- **Dynamic Form & List Views** — Renders any DocType form/list automatically from metadata, no hardcoding required.
- **Vue 3 + TypeScript** — Fully typed, modern reactive UI with Composition API and Pinia state management.
- **Tailwind CSS** — Utility-first CSS for rapid, consistent styling.
- **Vite-Powered** — Lightning-fast HMR (Hot Module Replacement) during development.
- **Runtime DocType Scripts** — Load custom TypeScript/JavaScript business logic per DocType at runtime.
- **App Management** — Install/uninstall Frappe apps through the UI (Odoo-style app grid).
- **Configurable Sidebar** — Admin-configurable sidebar navigation per app via DocType records.
- **Responsive Design** — Works across desktop and tablet screen sizes.

## Tech Stack

| Layer       | Technology                            |
| ----------- | ------------------------------------- |
| Frontend    | Vue 3, TypeScript, Vite, Tailwind CSS |
| Backend     | Python, Frappe Framework v15          |
| Database    | MariaDB                               |
| Cache/Queue | Redis                                 |
| Realtime    | Node.js (Socket.IO)                   |

## Prerequisites

- Python 3.10+
- Node.js 18+
- Yarn 1.x
- MariaDB 10.6+
- Redis 6+
- [Frappe Bench](https://github.com/frappe/bench) CLI

## Installation

### 1. Install via Bench CLI

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app https://github.com/aliraxa29/frappe-desk.git --branch main
bench --site your-site.local install-app desktop
```

### 2. Build Frontend Assets

```bash
cd apps/desktop
yarn install
yarn build
```

## Development

### Start Backend Services

```bash
# Terminal 1 — Web server on port 8000
bench serve

# Terminal 2 — File watcher for auto-reload
bench watch
```

### Start Frontend Dev Server

```bash
# Terminal 3 — Vite dev server on port 5173 (proxies API to :8000)
cd apps/desktop/desk
yarn install
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Project Structure

```
apps/desktop/
├── desk/                      # Vue 3 SPA (frontend)
│   ├── src/
│   │   ├── api/               # RPC client wrappers
│   │   ├── components/        # Reusable UI components
│   │   ├── composables/       # Vue composables (shared logic)
│   │   ├── fields/            # Field-type components (Data, Link, Select, etc.)
│   │   ├── layout/            # Layout wrappers (Navbar, AppLayout)
│   │   ├── metadata/          # DocType metadata stores
│   │   ├── router/            # Vue Router configuration
│   │   ├── runtime/           # Script loader for custom DocType scripts
│   │   ├── stores/            # Pinia state management
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Helpers (desk RPC, formatting)
│   │   └── views/             # Page views (Desk, App, List, Form)
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── desktop/                   # Python backend
│   ├── api/                   # Custom RPC endpoints
│   ├── doctype/               # DocType definitions & controllers
│   ├── doctype_scripts.py     # Runtime script discovery
│   └── hooks.py               # Frappe hooks
├── pyproject.toml
└── package.json
```

### Running Tests

```bash
# Python tests
cd apps/desktop
pytest

# Frontend tests (if configured)
cd apps/desktop/desk
yarn test
```

## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

**Quick start:**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

This project uses `pre-commit` for code quality. Set it up with:

```bash
cd apps/desktop
pip install pre-commit
pre-commit install
```

The following tools run automatically on commit:

- **[Ruff](https://docs.astral.sh/ruff/)** — Python linting & formatting
- **[ESLint](https://eslint.org/)** — JavaScript/TypeScript linting
- **[Prettier](https://prettier.io/)** — JS/Vue/SCSS formatting

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md). **Do not open a public issue for security vulnerabilities.**

## License

This project is licensed under the [MIT License](LICENSE).

**Note:** This project is not yet production ready. It is under maintenance and we are adding features to it.

---

<div align="center">

**[Report Bug](https://github.com/aliraxa29/frappe-desk/issues/new?template=bug_report.md)** · **[Request Feature](https://github.com/aliraxa29/frappe-desk/issues/new?template=feature_request.md)** · **[Discussions](https://github.com/aliraxa29/frappe-desk/discussions)**

</div>
