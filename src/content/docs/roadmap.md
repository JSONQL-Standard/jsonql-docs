---
title: Roadmap
description: What we have shipped and what is coming next.
---

## Shipped

### SDKs
- **Go SDK** — Full v1.1 support with Gin, Echo, and net/http adapters
- **TypeScript SDK** — Full v1.0+ support with Express, Fastify, and NestJS adapters
- **Java SDK** — Core engine with transpiler, builder, engine, lifecycle hooks (no framework adapters yet)
- **Python SDK** — Alpha with Flask, FastAPI, and Django adapters (not yet in compliance suite)

### Databases
- PostgreSQL, MySQL, and SQLite support across all SDKs

### Compliance
- 6 adapter containers × 3 databases = **18 compliance configurations**, all passing
- Automated CI pipeline with GitHub Actions

### Specification
- JSONQL v1.0 (Stable) — core query language
- JSONQL v1.1 (Draft) — aggregation, groupBy, distinct, advanced includes
- JSON Schema for programmatic query validation

## Near Term

- Publish SDKs to package registries (npm, PyPI, Maven Central, Go modules)
- Expand documentation with tutorials and cookbooks
- Add database adapter examples for MongoDB and DynamoDB
- Performance benchmarks across SDKs

## Mid Term

- Build a hosted JSONQL playground
- Add client-side SDKs (browser, mobile)
- Schema introspection improvements (auto-generate from database)
- Rate limiting and query cost analysis
- WebSocket/real-time query subscriptions

## Long Term

- Formalize governance and versioning process
- JSONQL certification program for third-party adapters
- Official VS Code extension for JSONQL query authoring
- Additional language SDKs (Rust, C#, PHP, Ruby)
