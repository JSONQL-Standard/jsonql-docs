---
title: Query Language
description: The JSONQL grammar, operators, and execution rules.
---

JSONQL queries are JSON objects sent to the server via POST body or `?q=` query parameter. This page covers the full grammar.

## Basic Query

```json
{
  "version": "1.0",
  "fields": ["id", "name", "email"],
  "where": { "status": { "eq": "active" } },
  "sort": ["-created_at"],
  "limit": 20,
  "skip": 0
}
```

| Key | Type | Description |
|-----|------|-------------|
| `version` | `"1.0"` or `"1.1"` | Spec version. Defaults to latest if omitted. |
| `fields` | `string[]` | Columns to return. Omit for all columns. |
| `where` | `object` | Filter conditions |
| `sort` | `string` or `string[]` | Prefix `-` for descending |
| `limit` | `integer` | Maximum rows to return |
| `skip` | `integer` | Number of rows to skip (offset). Alias: `offset`. |
| `include` | `string[]` or `object` | Eager-load related resources |

## Filters

### Comparison Operators

```json
{
  "where": {
    "age": { "gte": 21 },
    "status": { "eq": "active" },
    "score": { "lt": 100 }
  }
}
```

All comparison operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`.

Multiple conditions at the same level are combined with implicit AND.

### Implicit Equality

You can use a bare value as shorthand for `eq`:

```json
{
  "where": { "id": 1 }
}
```

This is equivalent to `{ "id": { "eq": 1 } }`.

### Null Filtering

Use `eq` and `ne` with `null` to filter for NULL/NOT NULL:

```json
{
  "where": {
    "deleted_at": { "eq": null }
  }
}
```

| Pattern | SQL |
|---------|-----|
| `{"eq": null}` | `IS NULL` |
| `{"ne": null}` | `IS NOT NULL` |

### Set Operators

```json
{
  "where": {
    "role": { "in": ["admin", "editor"] },
    "status": { "nin": ["banned", "suspended"] }
  }
}
```

### String Operators

```json
{
  "where": {
    "name": { "contains": "john" },
    "email": { "ends": "@company.com" },
    "title": { "starts": "How to" }
  }
}
```

String operators are case-insensitive by default.

### Logical Operators

Use `and`, `or`, and `not` to compose complex filters:

```json
{
  "where": {
    "and": [
      { "age": { "gte": 18 } },
      {
        "or": [
          { "role": { "eq": "admin" } },
          { "email": { "ends": "@company.com" } }
        ]
      }
    ]
  }
}
```

The `not` operator negates a condition:

```json
{
  "where": {
    "not": { "status": { "eq": "active" } }
  }
}
```

### Field-to-Field Comparison

Compare one field against another using the `field` wrapper:

```json
{
  "where": {
    "salePrice": { "gt": { "field": "basePrice" } }
  }
}
```

## Sorting

Sort by one or more fields. Prefix with `-` for descending order:

```json
{
  "sort": ["-created_at", "name"]
}
```

Single-field shorthand:

```json
{
  "sort": "-created_at"
}
```

## Pagination

```json
{
  "limit": 25,
  "skip": 50
}
```

SDKs enforce a configurable `maxLimit` (default 1000) to prevent unbounded queries.

## Query Delivery

JSONQL queries can be sent in two ways:

### POST Body (Primary)

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"fields": ["id", "name"], "where": {"status": {"eq": "active"}}}'
```

### GET with Query Parameter

URL-encode the JSON and pass it as the `q` parameter:

```bash
curl "http://localhost:8080/users?q=%7B%22fields%22%3A%5B%22id%22%2C%22name%22%5D%7D"
```

Equivalent to:

```
GET /users?q={"fields":["id","name"]}
```

## Relationships (Include)

### Simple Include (v1.0)

Request related resources as a flat list of relation names:

```json
{
  "from": "users",
  "fields": ["id", "name"],
  "include": ["posts", "profile"]
}
```

### Advanced Include with Sub-Queries (v1.1)

Apply filters, sorting, field selection, and limits to included relations:

```json
{
  "include": {
    "posts": {
      "fields": ["id", "title", "slug"],
      "where": { "published": { "eq": true } },
      "sort": "-created_at",
      "limit": 5
    },
    "profile": {
      "fields": ["bio", "avatar_url"]
    }
  }
}
```

## Aggregations (v1.1)

Perform calculations on datasets:

```json
{
  "aggregate": {
    "total_users": { "count": "id" },
    "average_age": { "avg": "age" },
    "max_score": { "max": "score" },
    "total_revenue": { "sum": "amount" },
    "oldest": { "min": "birth_date" }
  }
}
```

Supported functions: `count`, `sum`, `avg`, `min`, `max`.

## Grouping (v1.1)

Group results by specific fields, typically combined with aggregations:

```json
{
  "groupBy": ["role"],
  "aggregate": {
    "count": { "count": "id" },
    "avg_age": { "avg": "age" }
  }
}
```

## Distinct (v1.1)

Select unique values:

```json
{
  "fields": ["category"],
  "distinct": true
}
```

Or specify which fields should be distinct:

```json
{
  "distinct": ["category", "status"]
}
```

## Mutations

JSONQL also supports data mutations through the same JSON interface:

### Create (INSERT)

```json
{
  "data": { "name": "Alice", "email": "alice@example.com" }
}
```

### Update (PATCH)

```json
{
  "patch": { "name": "Bob" },
  "where": { "id": { "eq": 1 } }
}
```

### Delete (DELETE)

```json
{
  "where": { "id": { "eq": 1 } }
}
```

The HTTP method determines the operation type: `POST` for create, `PATCH`/`PUT` for update, `DELETE` for delete.

## Parser Options

SDKs support server-side security limits to control what clients can query:

| Option | Description |
|--------|-------------|
| `maxLimit` | Maximum allowed `limit` value (default: 1000) |
| `maxNestingDepth` | Maximum depth for nested `where` conditions |
| `allowedFields` | Whitelist of fields clients can select |
| `allowedIncludes` | Whitelist of relations clients can include |

These are configured server-side per adapter, not in the query itself. See the [Architecture](/guides/architecture/) page for security details.

## Full Reference

For the complete specification, see:
- [JSONQL v1.0 Specification](https://github.com/JSONQL-Standard/jsonql-spec/blob/main/v1.md)
- [JSONQL v1.1 Specification](https://github.com/JSONQL-Standard/jsonql-spec/blob/main/v1.1.md)
- [JSON Schema](https://github.com/JSONQL-Standard/jsonql-spec/blob/main/schema.json)
