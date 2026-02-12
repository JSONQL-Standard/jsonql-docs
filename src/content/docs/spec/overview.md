---
title: Specification Overview
description: Canonical JSONQL specification and compliance.
---

The JSONQL spec defines the query grammar, adapters, and compliance expectations to ensure interoperability across all supported SDKs and databases.

## The Standard

**JSONQL** is a secure, lightweight, and polyglot JSON-based query language for filtering, sorting, pagination, and field selection.

It is designed to be:
- **Framework-agnostic** (Express, Spring, Gin, Actix, etc.)
- **Database-agnostic** (PostgreSQL, MySQL, SQLite, etc.)
- **Secure by design** (parameterized, no eval)

### Versioning

| Version | Status | Description |
| :--- | :--- | :--- |
| **v1.0** | Stable | The current standard for all production SDKs. |
| **v1.1** | Draft | Upcoming features including deep relationship filtering and aggregation. |

## Query Structure

A valid JSONQL query object follows this structure:

```json
{
  "version": "1.0",
  "where": { /* conditions */ },
  "sort": "created_at",
  "limit": 50,
  "offset": 0,
  "fields": ["id", "name", "email"]
}
```
