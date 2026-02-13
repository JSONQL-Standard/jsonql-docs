---
title: Java SDK
description: Integrate JSONQL into JVM stacks with Spring Boot or Jakarta EE.
---

The official Java SDK for JSONQL. A unified engine for transpiling and executing JSONQL queries, with first-class support for Spring Boot and Jakarta EE.

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
- Built-in dialects: Postgres, MySQL, SQLite

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

### Spring Boot

```java
@Configuration
public class JsonqlConfig {
    @Bean
    public JsonQLEngine engine(JSONQLSchema schema) {
        return JsonQLEngine.builder().postgres().schema(schema).build();
    }
}

@RestController
public class QueryController {
    @Autowired JsonQLEngine engine;
    @Autowired JdbcTemplate jdbc;

    @RequestMapping("/{table}")
    public ResponseEntity<Object> handle(HttpMethod method,
            @PathVariable String table,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false) Map<String, String> params) {
        var req = JsonQLRequestNormalizer.normalize(
            method.name(), table, body, params
        );
        try (var conn = jdbc.getDataSource().getConnection()) {
            var result = engine.executeRequest(conn, req);
            return ResponseEntity.ok(result.toResponseBody());
        }
    }
}
```

### Jakarta EE / JAX-RS

```java
@Path("/{table}")
public Response handle(@PathParam("table") String table,
        Map<String, Object> body, @Context UriInfo uriInfo) {
    var params = flattenQueryParams(uriInfo);
    var req = JsonQLRequestNormalizer.normalize(
        "POST", table, body, params
    );
    try (var conn = dataSource.getConnection()) {
        var result = engine.executeRequest(conn, req);
        return Response.ok(result.toResponseBody()).build();
    }
}
```

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

## Compliance

2 framework adapters × 3 databases = **6 containers** pass **65/65** compliance tests.

| Adapter | PostgreSQL | MySQL | SQLite |
|---------|:----------:|:-----:|:------:|
| **Spring Boot** | ✅ 65/65 | ✅ 65/65 | ✅ 65/65 |
| **Jakarta EE** | ✅ 65/65 | ✅ 65/65 | ✅ 65/65 |

## Repo

[`github.com/jsonql-standard/jsonql-java`](https://github.com/JSONQL-Standard/jsonql-java)
