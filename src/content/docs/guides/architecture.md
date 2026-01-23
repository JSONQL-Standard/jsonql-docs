---
title: Architecture
description: How JSONQL components fit together.
---

JSONQL is built around a few core building blocks:

## Components

- **Query Language**: JSON structure describing selection, filtering, joins, and pagination.
- **Parser & Planner**: Transforms JSONQL into an execution plan.
- **Adapters**: Translate plans into database-specific queries.
- **Hydrators**: Assemble nested responses from relational results.
- **SDKs**: Typed clients and tooling for different languages.

## Data Flow

1. Client builds a JSONQL query.
2. SDK validates the query shape and types.
3. Runtime parses and plans the query.
4. Adapter executes against the datastore.
5. Hydrator builds a JSON result tree.

## Observability

JSONQL encourages deterministic query plans and structured logging to make debugging and performance tuning consistent across environments.
