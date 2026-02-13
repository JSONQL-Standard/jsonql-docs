---
title: Developer Guide
description: Learn the core workflow for building with JSONQL.
---

JSONQL is designed to make JSON the first-class query language for APIs and databases. This guide outlines the main concepts and how they fit together.

## Core Concepts

- **Schema-first** — define your data shape, relationships, and access permissions once.
- **Query plans** — JSONQL queries are parsed, validated, and transpiled to parameterized SQL.
- **Portable SDKs** — consistent developer experience across Go, TypeScript, Python, and Java.
- **Compliance-tested** — every SDK × adapter × database combination is verified against the same 65-test suite.

## Typical Workflow

### 1. Define Your Schema

A JSONQL schema describes tables, fields, relationships, and permissions. Here's an example in JSON:

```json
{
  "tables": {
    "users": {
      "fields": {
        "id": { "type": "integer" },
        "name": { "type": "string" },
        "email": { "type": "string" },
        "secret": { "type": "string", "allowSelect": false }
      },
      "relations": {
        "posts": { "type": "hasMany", "table": "posts", "field": "user_id" }
      }
    },
    "posts": {
      "fields": {
        "id": { "type": "integer" },
        "title": { "type": "string" },
        "user_id": { "type": "integer" }
      },
      "relations": {
        "author": { "type": "belongsTo", "table": "users", "field": "user_id" }
      }
    }
  }
}
```

### 2. Choose Your Stack

Pick your language and framework:

| Language | Frameworks |
|----------|-----------|
| **Go** | Gin, Echo, net/http |
| **TypeScript** | Express, Fastify, NestJS |
| **Java** | Spring Boot, Jakarta EE |
| **Python** | Flask, FastAPI, Django |

All combinations work with PostgreSQL, MySQL, and SQLite.

### 3. Wire Up the Adapter

Each SDK provides a framework adapter that handles routing, request parsing, and response formatting. A typical setup:

1. Create a database connection
2. Load or define your schema
3. Initialize the JSONQL engine/handler
4. Mount the adapter on your framework's router

See the individual [SDK pages](/sdk/go/) for language-specific examples.

### 4. Query

Clients send JSONQL queries as JSON:

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "fields": ["id", "name", "email"],
    "where": { "status": { "eq": "active" } },
    "include": { "posts": { "limit": 3 } },
    "sort": "-created_at",
    "limit": 10
  }'
```

The response is always a JSON object with a `data` key:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "posts": [
        { "id": 10, "title": "Hello World" },
        { "id": 11, "title": "Second Post" }
      ]
    }
  ]
}
```

### 5. Validate with Compliance Tests

Run the standard compliance suite to verify your implementation matches the spec:

```bash
cd jsonql-tests
./run_tests.sh --target your-adapter
```

## What's Next

- Explore the [Query Language](/guides/query-language/) reference
- Understand the [Architecture](/guides/architecture/) and pipeline
- Pick your SDK: [Go](/sdk/go/) · [TypeScript](/sdk/typescript/) · [Python](/sdk/python/) · [Java](/sdk/java/)
- Learn about [Compliance Testing](/spec/compliance/)
