---
title: Getting Started
description: Spin up JSONQL quickly and run your first query.
---

JSONQL lets you describe queries in JSON, execute them through SDKs, and keep your data contract consistent across systems.

## 1. Pick an SDK

Choose the SDK for your runtime:

| SDK | Install | Frameworks |
|-----|---------|-----------|
| [Go](/sdk/go/) | `go get github.com/jsonql-standard/jsonql-go` | Gin, Echo, net/http |
| [TypeScript](/sdk/typescript/) | `npm install @jsonql-standard/jsonql-ts` | Express, Fastify, NestJS |
| [Python](/sdk/python/) | `pip install jsonql` | Flask, FastAPI, Django |
| [Java](/sdk/java/) | Maven dependency | Spring Boot, Jakarta EE |

## 2. Define a Query

JSONQL queries are JSON documents. A minimal example:

```json
{
  "version": "1.0",
  "fields": ["id", "name", "email"],
  "where": {
    "status": { "eq": "active" }
  },
  "sort": "-created_at",
  "limit": 20
}
```

## 3. Send It

Post the query to any JSONQL-powered endpoint:

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"fields": ["id", "name"], "where": {"status": {"eq": "active"}}, "limit": 10}'
```

Response:

```json
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```

## 4. Include Relationships

Fetch nested data with `include`:

```json
{
  "fields": ["id", "name"],
  "include": {
    "posts": {
      "fields": ["id", "title"],
      "sort": "-created_at",
      "limit": 3
    }
  }
}
```

## 5. Use the Query Builder

Each SDK provides a fluent builder for constructing queries programmatically. For example, in Python:

```python
from jsonql import QueryBuilder
from jsonql.conditions import eq, gt, field, and_

query = (
    QueryBuilder()
    .from_table("users")
    .select("id", "name")
    .where(and_(field("status", eq("active")), field("age", gt(18))))
    .order_by("-created_at")
    .limit(10)
    .build()
)
```

Or in Go:

```go
q := builder.New().
    From("users").
    Select("id", "name").
    Where("status", "active").
    AndWhere("age", map[string]any{"gte": 18}).
    Sort("-created_at").
    Limit(10).
    Build()
```

## 6. Run Compliance Tests

Verify your adapter works correctly by running the compliance suite:

```bash
cd jsonql-tests
./run_tests.sh --target your-adapter
```

All 33 official containers pass 65/65 tests. See [Compliance Testing](/spec/compliance/) for details.

## Next Steps

- Dive into the [Developer Guide](/guides/overview/)
- Explore the [Query Language](/guides/query-language/) reference
- Read the [Specification](/spec/overview/)
