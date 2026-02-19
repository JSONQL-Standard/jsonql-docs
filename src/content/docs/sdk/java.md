---
title: Java SDK
description: Integrate JSONQL into JVM applications.
---

The official Java SDK for JSONQL. A unified engine for transpiling and executing JSONQL queries, with lifecycle hooks and a builder API.

| | |
|---|---|
| **Group ID** | `org.jsonql` |
| **Artifact ID** | `jsonql-java` |
| **Version** | 1.0-SNAPSHOT |
| **Java** | 17+ |
| **License** | MIT |

## Features

- `JsonQLEngine` — unified transpile-and-execute pipeline with builder pattern
- `JsonQLRequestNormalizer` — converts HTTP method + body + params → unified JSONQL query (auto-detects SELECT/INSERT/UPDATE/DELETE)
- `JsonQLResult` — wraps results with `getData()`, `toResponseBody()`, `isMutation()`
- `SQLTranspiler` — generates SQL from JSONQL with dialect support
- `JSONQLValidator` — schema-based field and relation permission checking
- `JsonQLLifecycle` hooks — `beforeTranspile`, `beforeExecute`, `afterExecute`
- `QueryBuilder` and `MutationBuilder` for programmatic query construction
- `ResultHydrator` for nested JSON reconstruction
- Built-in dialects: Postgres, MySQL, SQLite, MSSQL, Generic
- `MongoTranspiler` for MongoDB aggregation pipeline generation

## Installation

```xml
<dependency>
    <groupId>org.jsonql</groupId>
    <artifactId>jsonql-java</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

## Quick Start

```java
// 1. Create an engine
JsonQLEngine engine = JsonQLEngine.builder()
    .postgres()             // or .mysql(), .sqlite()
    .schema(schema)         // optional: enables validation & relationships
    .build();

// 2. Normalize an HTTP request into a JSONQL query
var request = JsonQLRequestNormalizer.normalize(
    "POST", "users",
    Map.of("fields", List.of("id", "name"),
           "where", Map.of("status", "active")),
    queryParams
);

// 3. Execute
try (Connection conn = dataSource.getConnection()) {
    JsonQLResult result = engine.executeRequest(conn, request);
    result.getData();          // List<Map<String, Object>>
    result.toResponseBody();   // {"data": [...]}
    result.isMutation();       // false (this was a SELECT)
}
```

## HTTP Request Normalization

`JsonQLRequestNormalizer.normalize()` converts HTTP semantics into a unified JSONQL query map:

| HTTP Method | Behavior |
|-------------|----------|
| **GET** | Always SELECT |
| **POST** | Auto-detected: SELECT (if body has `fields`, `where`, etc.) or INSERT |
| **PATCH / PUT** | UPDATE — non-keyword body keys → `patch` |
| **DELETE** | DELETE — non-keyword body keys → `where` |

Query params `?q={...}` or `?query={...}` are parsed and merged with the body.

## Lifecycle Hooks

```java
engine.execute(conn, "users", query, new JsonQLLifecycle() {
    @Override
    public void beforeTranspile(Map<String, Object> query, String commandType) {
        // Modify query, add RLS filters, validate permissions
    }

    @Override
    public void beforeExecute(String sql, List<Object> params) {
        // Log SQL, audit queries
    }

    @Override
    public void afterExecute(List<Map<String, Object>> results) {
        // Transform results, trigger side effects
    }
});
```

## Framework Integration

The Java SDK currently provides a **core engine** without framework adapters. You can integrate it into any Java web framework by calling the engine directly:

```java
// In any HTTP handler (Spring Boot, Javalin, Vert.x, etc.)
var request = JsonQLRequestNormalizer.normalize(
    httpMethod, tableName, requestBody, queryParams
);
try (var conn = dataSource.getConnection()) {
    JsonQLResult result = engine.executeRequest(conn, request);
    return result.toResponseBody();
}
```

Framework-specific adapters (Spring Boot, Jakarta EE, etc.) are planned for future releases.

## Core API

| Class | Purpose |
|-------|---------|
| `JsonQLEngine` | Transpiles and executes JSONQL queries |
| `JsonQLRequestNormalizer` | Converts HTTP requests to JSONQL query maps |
| `JsonQLResult` | Wraps execution results with response helpers |
| `SQLTranspiler` | Generates SQL from JSONQL |
| `JSONQLValidator` | Schema-based field and relation permission checking |
| `JsonQLLifecycle` | Hook interface for the execution pipeline |
| `QueryBuilder` | Fluent query construction |
| `MutationBuilder` | Fluent mutation construction |
| `ResultHydrator` | Nested JSON reconstruction |

## Supported Databases

| Database | Dialect Class | Placeholder | Quoting |
|----------|---------------|-------------|---------|
| **PostgreSQL** | `PostgresDialect` | `$1, $2` | `"col"` |
| **MySQL** | `MySQLDialect` | `?, ?` | `` `col` `` |
| **SQLite** | `SQLiteDialect` | `?, ?` | `"col"` |
| **MSSQL** | `MSSQLDialect` | `@p1, @p2` | `[col]` |
| **Generic** | `GenericDialect` | `?, ?` | `"col"` |

## Compliance

The Java SDK does not yet have framework adapters, so it is not included in the `jsonql-tests` E2E compliance matrix. Core logic is verified via unit tests (JUnit 5 + H2 in-memory database).

## Repo

[`github.com/jsonql-standard/jsonql-java`](https://github.com/JSONQL-Standard/jsonql-java)
