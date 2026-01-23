---
title: Getting Started
description: Spin up JSONQL quickly and run your first query.
---

JSONQL lets you describe queries in JSON, execute them through SDKs, and keep your data contract consistent across systems.

## 1. Pick an SDK

Choose the SDK for your runtime:

- [Go SDK](/sdk/go/)
- [TypeScript SDK](/sdk/typescript/)
- [Python SDK](/sdk/python/)
- [Java SDK](/sdk/java/)

## 2. Define a Query

JSONQL queries are JSON documents. A minimal example:

```json
{
  "from": "users",
  "select": ["id", "email"],
  "where": {
    "status": "active"
  },
  "limit": 20
}
```

## 3. Execute

Use your SDK to validate and execute the query against a supported adapter (Postgres, MySQL, SQLite, etc.).

## 4. Validate

Run the compliance suite to verify your adapter and SDK behavior aligns with the spec.

Next: dive into the [Developer Guide](/guides/overview/).
