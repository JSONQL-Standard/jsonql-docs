---
title: Query Language
description: The JSONQL grammar, operators, and execution rules.
---

JSONQL queries are JSON objects. Common fields include:

- `from`: source collection or table
- `select`: array of fields
- `where`: filter object
- `limit` / `offset`: pagination
- `orderBy`: sorting
- `include`: nested relationships

## Filters

Filters are expressed as JSON conditions:

```json
{
  "where": {
    "and": [
      { "status": "active" },
      { "age": { "gte": 21 } }
    ]
  }
}
```

## Relationships

Use `include` to request nested results:

```json
{
  "from": "users",
  "select": ["id", "email"],
  "include": {
    "orders": {
      "select": ["id", "total"],
      "limit": 3
    }
  }
}
```

For full detail, see the [Specification](/spec/overview/).
