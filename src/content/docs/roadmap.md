---
title: Roadmap
description: What we have shipped and what is coming next.
---

## Shipped

### SDKs
- **Go SDK** — Full v1.1 support with Gin, Echo, and net/http adapters; PostgreSQL, MySQL, SQLite, MSSQL, and MongoDB drivers
- **TypeScript SDK** — Full v1.0+ support with Express, Fastify, and NestJS adapters; PostgreSQL, MySQL, SQLite, MSSQL, and MongoDB drivers
- **Java SDK** — Full engine with transpiler, builder, lifecycle hooks, and framework adapters for Spring Boot and Jakarta EE (SQL + MongoDB variants)
- **Python SDK** — Full engine with Flask, FastAPI, and Django adapters (SQL + MongoDB variants); MSSQL dialect support

### Databases
- PostgreSQL, MySQL, SQLite, MSSQL, and MongoDB support across all SDKs

### Compliance
- 63 adapter configurations × 5 databases = **8,505 total compliance test executions**, all passing
- 135 test cases per configuration across 11 categories
- Lifecycle hook testing for all SDKs
- Automated CI pipeline with GitHub Actions

### Specification
- JSONQL v1.0 (Stable) — core query language
- JSONQL v1.1 (Draft) — aggregation, groupBy, distinct, advanced includes
- JSON Schema for programmatic query validation

## Near Term

- Publish SDKs to package registries (npm, PyPI, Maven Central, Go modules)
- Expand documentation with tutorials and cookbooks
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
