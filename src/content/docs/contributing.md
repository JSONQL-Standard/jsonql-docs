---
title: Contributing
description: How to contribute to the JSONQL ecosystem.
---

We welcome contributions across SDKs, adapters, tooling, and docs.

## Repositories

| Repo | Description | Language |
|------|-------------|----------|
| [jsonql-spec](https://github.com/JSONQL-Standard/jsonql-spec) | Specification, JSON Schema, compliance scripts | Markdown, JSON |
| [jsonql-go](https://github.com/JSONQL-Standard/jsonql-go) | Go SDK | Go |
| [jsonql-ts](https://github.com/JSONQL-Standard/jsonql-ts) | TypeScript/Node.js SDK | TypeScript |
| [jsonql-java](https://github.com/JSONQL-Standard/jsonql-java) | Java SDK | Java |
| [jsonql-py](https://github.com/JSONQL-Standard/jsonql-py) | Python SDK | Python |
| [jsonql-tests](https://github.com/JSONQL-Standard/jsonql-tests) | Compliance test suite (18 configurations) | Python, Docker |
| [jsonql-docs](https://github.com/JSONQL-Standard/jsonql-docs) | This documentation site | Astro, MDX |

## Ways to Help

- **Report bugs** — file issues with reproduction steps
- **Implement adapters** — add support for new frameworks or databases
- **Expand SDK support** — improve existing SDKs with new features
- **Write tests** — add compliance test cases for edge cases
- **Improve documentation** — tutorials, examples, translations

## Development Workflow

### SDK Development

1. Fork and clone the SDK repo
2. Install dependencies and run existing tests
3. Make your changes
4. Run unit tests to verify

```bash
# Go
make test

# TypeScript
npm test

# Python
pip install -e ".[dev]"
pytest

# Java
mvn test
```

### Compliance Testing

After making SDK changes, verify compliance:

```bash
cd jsonql-tests
./run_tests.sh --target your-adapter
```

All 65 tests must pass before merging.

### Documentation

```bash
cd jsonql-docs
npm install
npm run dev
```

The site runs on `http://localhost:4321`.

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include tests for new functionality
- Run the compliance suite before submitting
- Update documentation if you change public APIs
- Follow existing code style and conventions

## Architecture Decisions

Major design decisions are documented in the [jsonql-idea](https://github.com/JSONQL-Standard/jsonql-idea) repo, which contains:

- Design principles and project scope
- Schema architecture decisions
- Testing strategy
- Framework adapter guidelines
- SDK design principles

If you are proposing a significant change, open an issue first to discuss the approach.
