---
title: Specification Overview
description: Canonical JSONQL specification and compliance.
---

The JSONQL spec defines the query grammar, adapters, and compliance expectations to ensure interoperability across all supported SDKs and databases.

## The Standard

**JSONQL** is a secure, lightweight, and polyglot JSON-based query language for filtering, sorting, pagination, and field selection.

It is designed to be:
- **Framework-agnostic** (Express, Fastify, NestJS, Gin, Echo, net/http, Spring Boot, Jakarta EE, Flask, FastAPI, Django)
- **Database-agnostic** (PostgreSQL, MySQL, SQLite, MSSQL, and MongoDB)
- **Secure by design** (parameterized, no eval, no regex execution)

### Versioning

| Version | Status | Description |
| :--- | :--- | :--- |
| **v1.0** | Stable | Core query language: field selection, filtering, sorting, pagination, eager loading. |
| **v1.1** | Draft | Aggregations, groupBy, distinct, advanced include with sub-queries. |

## Query Structure

### v1.0

```json
{
  "version": "1.0",
  "fields": ["id", "name", "email"],
  "where": {
    "status": { "eq": "active" },
    "age": { "gte": 18 }
  },
  "sort": ["-created_at", "name"],
  "limit": 50,
  "skip": 0,
  "include": ["posts", "profile"]
}
```

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `version` | string | Yes | Must be `"1.0"` |
| `fields` | string[] | No | Field projection |
| `where` | object | No | Filter conditions |
| `sort` | string \| string[] | No | Prefix `-` for descending |
| `limit` | integer | No | Max results (recommended max: 1000) |
| `skip` | integer | No | Offset for pagination |
| `include` | string[] | No | Eager load related resources |

### v1.1 Additions

```json
{
  "version": "1.1",
  "include": {
    "posts": {
      "fields": ["title", "slug"],
      "where": { "published": { "eq": true } },
      "sort": "-created_at",
      "limit": 5
    }
  },
  "aggregate": {
    "total": { "count": "id" },
    "avg_age": { "avg": "age" }
  },
  "groupBy": ["role"],
  "distinct": true
}
```

| Key | Type | Description |
|-----|------|-------------|
| `include` | object | Sub-queries on relationships (where, sort, limit, fields) |
| `aggregate` | object | Aggregation functions: `count`, `sum`, `avg`, `min`, `max` |
| `groupBy` | string[] | Group results by fields |
| `distinct` | boolean \| string[] | Select unique values |

## Filter Operators

### Comparison

| Operator | Example | SQL |
|----------|---------|-----|
| `eq` | `{"status": {"eq": "active"}}` | `= ?` |
| `ne` | `{"status": {"ne": "banned"}}` | `!= ?` |
| `gt` | `{"age": {"gt": 18}}` | `> ?` |
| `gte` | `{"age": {"gte": 21}}` | `>= ?` |
| `lt` | `{"score": {"lt": 50}}` | `< ?` |
| `lte` | `{"score": {"lte": 100}}` | `<= ?` |

### Set

| Operator | Example | SQL |
|----------|---------|-----|
| `in` | `{"id": {"in": [1, 2, 3]}}` | `IN (?, ?, ?)` |
| `nin` | `{"role": {"nin": ["admin"]}}` | `NOT IN (?)` |

### String

| Operator | Example | SQL |
|----------|---------|-----|
| `contains` | `{"name": {"contains": "john"}}` | `LIKE '%john%'` |
| `starts` | `{"name": {"starts": "J"}}` | `LIKE 'J%'` |
| `ends` | `{"email": {"ends": ".com"}}` | `LIKE '%.com'` |

### Logical

```json
{
  "where": {
    "and": [
      { "age": { "gte": 18 } },
      { "or": [
        { "role": { "eq": "admin" } },
        { "email": { "ends": "@company.com" } }
      ]}
    ]
  }
}
```

### Field-to-Field Comparison

Compare a field against another field rather than a literal value:

```json
{
  "where": {
    "salePrice": { "gt": { "field": "basePrice" } }
  }
}
```

## Schema Permissions (v1.1)

Schemas define per-table and per-field permissions to restrict what clients can query:

| Permission | Description |
|------------|-------------|
| `allowSelect` | Fields that can be selected |
| `allowFilter` | Fields that can be filtered |
| `allowSort` | Fields that can be sorted |
| `allowInclude` | Relations that can be included |
| `allowAggregate` | Whether aggregation is allowed |
| `allowCount` / `allowSum` / `allowAvg` / `allowMin` / `allowMax` | Granular aggregate function control |

## JSON Schema Validation

The spec includes a [JSON Schema](https://github.com/JSONQL-Standard/jsonql-spec/blob/main/schema.json) (draft 2020-12) for validating both v1.0 and v1.1 queries programmatically.

## Compliance Testing

The JSONQL ecosystem uses a comprehensive compliance test suite to verify that every SDK and adapter combination produces correct behavior. See the [Compliance Testing](/spec/compliance/) page for the test matrix and configuration reference, and the [Integration Testing](/guides/integration-testing/) guide for details on building adapter servers and running tests.

## Repos

- **Specification**: [`github.com/jsonql-standard/jsonql-spec`](https://github.com/JSONQL-Standard/jsonql-spec)
- **Test suite**: [`github.com/jsonql-standard/jsonql-tests`](https://github.com/JSONQL-Standard/jsonql-tests)
