---
title: Integration Testing
description: How to build adapter servers, configure databases, and run the JSONQL compliance suite.
---

The JSONQL ecosystem validates every SDK through a language-agnostic integration test harness. A single Python-based test runner sends HTTP requests to adapter servers in any language and asserts consistent behavior across all combinations of SDK, framework, and database.

## Architecture

```mermaid
graph TD
    Runner["pytest runner<br/>(Python)"]
    Provision["Provisioner<br/>DDL + seed data"]
    Server["Adapter Server<br/>(any language)"]
    SDK["JSONQL SDK"]
    DB["Database"]

    Runner -->|1. provision| Provision
    Provision -->|2. DDL + seed| DB
    Runner -->|3. HTTP request| Server
    Server -->|4. parse + transpile| SDK
    SDK -->|5. execute| DB
    DB -->|6. result| SDK
    SDK -->|7. hydrate| Server
    Server -->|8. JSON response| Runner
    Runner -->|9. assert| Runner
```

The test runner is completely decoupled from the SDK — it only speaks HTTP. This means any language can be tested by implementing a thin adapter server that delegates to the SDK.

## Adapter Server Contract

Every adapter server must implement the following HTTP contract.

### Health Check

```
GET /health → 200 {"status": "ok"}
```

Used by Docker health checks and `run_tests.sh` readiness polling.

### Query (Read)

```
POST /{table}
Content-Type: application/json

{
  "fields": ["id", "name"],
  "where": { "status": { "eq": "active" } },
  "sort": "-created_at",
  "limit": 10
}
```

Response:

```json
{ "data": [{ "id": 1, "name": "Alice" }] }
```

### Mutations (Lifecycle Servers Only)

| Method | Path | Body | Status | Operation |
|--------|------|------|--------|-----------|
| `POST` | `/{table}` | `{"data": {"name": "Alice"}}` | `201` | Create |
| `PATCH` | `/{table}?id=X` | `{"data": {"name": "Updated"}}` | `200` | Update |
| `DELETE` | `/{table}?id=X` | — | `200` | Delete |

### Error Responses

```json
{ "error": "Invalid query", "details": "Unknown field: foo" }
```

Status codes: `400` (bad request), `403` (forbidden by hook), `500` (server error).

### Test Headers

The test runner injects headers to control server behavior. Servers must read and honor these:

| Header | Purpose | Used By |
|--------|---------|---------|
| `X-JSONQL-Test-Path` | Points to the test suite directory for schema resolution | All servers |
| `X-Test-Role` | Simulates RLS — `user` restricts results to `role = "user"` | Lifecycle |
| `X-Test-Transform` | Response transform — `upper` uppercases all `name` fields | Lifecycle |
| `X-Test-Hook-Fail` | Forces a hook to fail — `beforeCreate`, `beforeUpdate`, `beforeDelete` | Lifecycle |
| `X-Test-Hook-Modify` | Forces a hook to modify data — `beforeCreate`, `beforeUpdate` | Lifecycle |
| `X-Test-Hook-AfterUpdate` | `mark` → adds `updated: true` to response | Lifecycle |
| `X-Test-Hook-AfterDelete` | `confirm` → returns `{"deleted": true, "id": X}` | Lifecycle |
| `X-Test-Parser-MaxLimit` | Enforces maximum query limit | Simple |
| `X-Test-Parser-AllowedFields` | Restricts selectable fields (comma-separated) | Simple |
| `X-Test-Parser-AllowedIncludes` | Restricts includeable relations (comma-separated) | Simple |
| `X-Test-Validate` | `strict` → rejects unknown fields in query | Simple |

## Server Types

### Simple Servers

- Test query parsing, filtering, sorting, pagination, includes, aggregation, field permissions, and error handling
- Use the full 8-table schema with field-level access control
- Support all 5 databases (PostgreSQL, MySQL, SQLite, MSSQL, MongoDB)
- Wire minimal hooks: `schemaResolver` for per-suite schema overrides, `beforeQuery` for parser option enforcement
- Run test suites: `basic/`, `advanced/`, `errors/`, `validation/`, `parsing/`, `parser-options/`, `features-v1-1/`, `misc/`

### Lifecycle Servers

- Test mutation hooks, RLS simulation, response transformation, and CUD operations
- Use a minimal inline schema — only `users` table with `id`, `name`, `role`, `score`
- PostgreSQL only
- Wire all 8 lifecycle hooks (`before/afterQuery`, `before/afterCreate`, `before/afterUpdate`, `before/afterDelete`)
- Run test suite: `lifecycle/` exclusively

## Environment Variables

### Common

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP listen port | `8080` |
| `DB_TYPE` | Database dialect: `postgres`, `mysql`, `sqlite`, `mssql`, `mongodb` | `postgres` |
| `DB_DSN` | Connection string (URI format) | varies |
| `JSONQL_SCHEMA_PATH` | Path to schema JSON file | `../../fixtures/standard/schema.json` |

### Database-Specific

| Variable | Database | Description |
|----------|----------|-------------|
| `DB_DSN` | PostgreSQL | `postgresql://jsonql:password@localhost:5432/jsonql_test` |
| `DB_DSN` | MySQL | `mysql://jsonql:password@localhost:3306/jsonql_test` |
| `DB_FILENAME` | SQLite | Path to `.db` file (e.g., `data/sqlite.db`) |
| `DB_DSN` | MongoDB | `mongodb://localhost:27017` |
| `DB_NAME` | MongoDB | Database name (default: `jsonql_test`) |

### Java-Specific

Java Spring Boot servers additionally use standard Spring properties:

| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |

## Schema Resolution

All servers implement a two-tier schema resolution pattern:

1. **Startup**: Load the default schema from `JSONQL_SCHEMA_PATH`
2. **Per-request**: Check the `X-JSONQL-Test-Path` header
   - If set, look for `schema.json` in that directory
   - If found, use the suite-specific schema (results are cached)
   - If not found, fall back to the default schema

Lifecycle servers skip schema resolution — they use a hardcoded inline schema.

### Standard Schema

The default schema ([fixtures/standard/schema.json](https://github.com/JSONQL-Standard/jsonql-tests/blob/main/fixtures/standard/schema.json)) defines 8 tables:

| Table | Purpose |
|-------|---------|
| `users` | Primary entity with `id`, `name`, `email`, `role`, `age` |
| `posts` | Has `user_id` FK → users (hasMany relationship) |
| `comments` | Has `post_id` FK → posts (hasMany relationship) |
| `products` | Standalone catalog entity |
| `orders` | Has `user_id` FK → users |
| `widgets` | Has JSONB `metadata` field (PostgreSQL-specific) |
| `restricted_users` | Field-level access control (`allowSelect`, `allowFilter`, `allowSort`) |
| `secrets` | Restricted relation testing |

## Lifecycle Hooks

Lifecycle servers implement 8 hooks that modify query/mutation behavior based on test headers:

### beforeQuery

```
X-Test-Role: user → Inject WHERE role = "user" (RLS simulation)
```

### afterQuery

```
X-Test-Transform: upper → Uppercase all "name" fields in response
```

### beforeCreate

- `X-Test-Hook-Fail: beforeCreate` → Return `400`
- `X-Test-Hook-Modify: beforeCreate` → Rename `OriginalName` to `ModifiedName`
- Auto-generates `id` if not provided

### afterCreate

- If modified, returns `{"data": {"name": "ModifiedName"}}`

### beforeUpdate

- `X-Test-Hook-Fail: beforeUpdate` → Return `403`
- `X-Test-Hook-Modify: beforeUpdate` → Set `score = 999`

### afterUpdate

- If modified, returns patched score
- `X-Test-Hook-AfterUpdate: mark` → Adds `updated: true` to response

### beforeDelete

- `X-Test-Hook-Fail: beforeDelete` → Return `403`

### afterDelete

- `X-Test-Hook-AfterDelete: confirm` → Returns `{"deleted": true, "id": X}`

## Shared Code

Each language has shared helpers that centralize compliance boilerplate:

| Language | Location | Key Exports |
|----------|----------|-------------|
| **TypeScript** | `integration-tests/shared/` | `loadDefaultSchema()`, `createSchemaResolver()`, `enforceTestHeaders()`, `lifecycleHooks` |
| **Go** | `integration-tests/gohelpers/` | `NewSimpleEnv()`, `NewLifecycleEnv()`, `LifecycleHandler()`, `HealthHandler()` |
| **Python** | `integration-tests/py-shared/` | `build_simple_options()`, `build_simple_mongo_options()`, `build_lifecycle_options()`, `enforce_parser_options()` |
| **Java** | `integration-tests/java-shared/` | `ComplianceRequestHandler`, `ComplianceHelpers`, `SimpleComplianceLifecycle`, `FullComplianceLifecycle` |

### Typical Server Size

Thanks to the shared helpers, adapter servers are very small:

| Server | Lines of Code |
|--------|:------------:|
| TypeScript Express (simple) | ~40 |
| Go Gin (simple) | ~35 |
| Python Flask (simple) | ~35 |
| Java Spring Boot (simple) | ~60 |
| TypeScript Express (lifecycle) | ~70 |
| Go Gin (lifecycle) | ~25 |
| Python Flask (lifecycle) | ~30 |
| Java Spring Boot (lifecycle) | ~60 |

## Docker Setup

### Database Services

The base `docker-compose.yml` defines four database services:

| Service | Image | Port |
|---------|-------|------|
| `postgres` | `postgres:15` | 5432 |
| `mysql_db` | `mysql:8.0` | 3306 |
| `mssql_db` | `mcr.microsoft.com/azure-sql-edge:latest` | 1433 |
| `mongodb` | `mongo:7` | 27017 |

All databases have health checks. SQLite uses a local file (no container needed).

### Per-Language Compose Files

Each language has its own Docker Compose overlay:

| File | Language | Base Image | Start Command |
|------|----------|------------|---------------|
| `docker-compose.ts.yml` | TypeScript | `node:18` | `npm install && npm start` |
| `docker-compose.go.yml` | Go | `golang:1.24` | `go mod tidy && go run main.go` |
| `docker-compose.java.yml` | Java | `maven:3.9-eclipse-temurin-17` | `mvn spring-boot:run` or `mvn package && java -jar …-microbundle.jar` |
| `docker-compose.py.yml` | Python | `python:3.12-slim` | `pip install -r requirements.txt && python server.py` |

### Port Allocation

| Port Range | Language | Type |
|-----------|----------|------|
| 8080–8089 | TypeScript | Express / Fastify / NestJS — simple |
| 8090–8098 | Go | net/http / Gin / Echo — simple |
| 8099–8105 | Java | Spring Boot / Jakarta EE — simple |
| 8106–8114 | Python | Flask / FastAPI / Django — simple |
| 8115–8125 | All languages | MSSQL variants |
| 8127–8128 | TypeScript | Lifecycle servers |
| 8129–8136 | Go / Java / Python | MongoDB variants |
| 8137–8139 | Go | Lifecycle servers |
| 8140–8141 | Java | Lifecycle servers |
| 8142–8144 | Python | Lifecycle servers |

### Naming Convention

Docker service names follow the pattern:

```
{lang}-{framework}-{type}-{db}
```

Examples: `ts-express-simple-pg`, `go-gin-lifecycle-pg`, `java-spring-boot-simple-mssql`, `py-flask-simple-mongodb`

## Fixture Data

### Standard Fixtures

Located in `fixtures/standard/`:

| File | Content |
|------|---------|
| `schema.json` | 8-table schema with relationships and field permissions |
| `data.json` | Seed data: 3 users, 3 posts, 3 comments, 4 products, 2 orders, 3 widgets, 2 restricted_users, 2 secrets |
| `ddl/postgres.sql` | PostgreSQL DDL (`SERIAL`, `VARCHAR`, `DECIMAL`, `JSONB`, `BOOLEAN`) |
| `ddl/mysql.sql` | MySQL DDL equivalent |
| `ddl/sqlite.sql` | SQLite DDL equivalent |
| `ddl/mssql.sql` | MSSQL DDL (`NVARCHAR`, `BIT`, `IDENTITY`) |
| `ddl/mongo_seed.js` | MongoDB collection creation + indexes |

### Lifecycle Fixtures

Located in `tests/unified/lifecycle/fixtures/`:

- Only the `users` table — 2 rows: `Alice/admin/100`, `Bob/user/50`
- Each test case modifies this data through hooks

## Database Provisioner

The provisioner (`runners/provisioner.py`) is a CLI tool that resets databases before each test batch:

1. **Drop** all existing tables
2. **Apply** DDL from the suite-specific SQL file
3. **Seed** data from JSON
4. **Reset** sequences (PostgreSQL `setval`, MySQL auto-increment, MSSQL `IDENTITY_INSERT`)

Supports all 5 database types with retry logic (10–15 attempts) for connection establishment.

```bash
python3 runners/provisioner.py \
  --type postgres \
  --db-dsn "postgresql://jsonql:password@localhost:5432/jsonql_test" \
  --ddl fixtures/standard/ddl/postgres.sql \
  --data fixtures/standard/data.json
```

## Adding a New Adapter

To add compliance testing for a new framework:

### 1. Create the Server Directory

```
integration-tests/{lang}-{framework}-simple/
├── server.{ext}       # Main entry point
├── package.json       # (TS) or go.mod (Go) or requirements.txt (Py) or pom.xml (Java)
└── ...
```

### 2. Implement the HTTP Contract

Your server must:

1. Read `PORT`, `DB_TYPE`, `DB_DSN`, and `JSONQL_SCHEMA_PATH` from environment
2. Expose `GET /health` → `{"status": "ok"}`
3. Expose `POST /{table}` that:
   - Reads the JSON body as a JSONQL query
   - Reads the `X-JSONQL-Test-Path` header for schema resolution
   - Parses, validates, transpiles, executes, and hydrates via the SDK
   - Returns `{"data": [...]}` on success
   - Returns `{"error": "...", "details": "..."}` on failure
4. Honor the `X-Test-Parser-*` and `X-Test-Validate` headers

Use the language-specific shared helpers to minimize boilerplate.

### 3. Add Docker Compose Service

Add a service to the appropriate `docker-compose.{lang}.yml`:

```yaml
{lang}-{framework}-simple-pg:
  build:
    context: ../jsonql-{lang}
  working_dir: /app/integration-tests/{lang}-{framework}-simple
  ports:
    - "{port}:8080"
  environment:
    DB_TYPE: postgres
    DB_DSN: postgresql://jsonql:password@postgres:5432/jsonql_test
    JSONQL_SCHEMA_PATH: ../../fixtures/standard/schema.json
  depends_on:
    postgres:
      condition: service_healthy
```

### 4. Register in run_tests.sh

Add an entry to the appropriate `*_TESTS` array:

```bash
"{lang}-{framework}-simple-pg:{port}:postgres:--db-dsn postgresql://jsonql:password@localhost:5432/jsonql_test"
```

### 5. Run and Verify

```bash
./run_tests.sh --filter {framework}
```

All 135 tests must pass.

## Repo

[`github.com/jsonql-standard/jsonql-tests`](https://github.com/JSONQL-Standard/jsonql-tests)
