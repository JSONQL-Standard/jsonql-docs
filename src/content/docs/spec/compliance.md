---
title: Compliance Testing
description: How the JSONQL ecosystem validates correctness across all SDKs, frameworks, and databases.
---

Every JSONQL SDK and adapter is tested against the same compliance suite to guarantee consistent behavior, regardless of language, framework, or database.

## At a Glance

| Metric | Value |
|--------|-------|
| **SDKs** | 4 (Go, TypeScript, Java, Python) |
| **Frameworks** | 11 (Gin, Echo, net/http, Express, Fastify, NestJS, Spring Boot, Jakarta EE, Flask, FastAPI, Django) |
| **Databases** | 5 (PostgreSQL, MySQL, SQLite, MSSQL, MongoDB) |
| **Total configurations** | 66 (18 TS + 18 Go + 12 Java + 18 Python) |
| **Tests per configuration** | 135 |
| **Total test executions** | 8,910 |

## Test Matrix

Every SDK is tested against every combination of its supported frameworks and databases:

### Go SDK (18 configurations)

| Adapter | PostgreSQL | MySQL | SQLite | MSSQL | MongoDB |
|---------|:----------:|:-----:|:------:|:-----:|:-------:|
| **Gin** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |
| **Echo** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |
| **net/http** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |

*+ 3 lifecycle configurations (Gin, Echo, net/http × PostgreSQL)*

### TypeScript SDK (18 configurations)

| Adapter | PostgreSQL | MySQL | SQLite | MSSQL | MongoDB |
|---------|:----------:|:-----:|:------:|:-----:|:-------:|
| **Express** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |
| **Fastify** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |
| **NestJS** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |

*+ 3 lifecycle configurations (Express, Fastify, NestJS × PostgreSQL)*

### Java SDK (12 configurations)

| Adapter | PostgreSQL | MySQL | SQLite | MSSQL | MongoDB |
|---------|:----------:|:-----:|:------:|:-----:|:-------:|
| **Spring Boot** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |
| **Jakarta EE** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |

*+ 2 lifecycle configurations (Spring Boot, Jakarta EE × PostgreSQL)*

### Python SDK (18 configurations)

| Adapter | PostgreSQL | MySQL | SQLite | MSSQL | MongoDB |
|---------|:----------:|:-----:|:------:|:-----:|:-------:|
| **Flask** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |
| **FastAPI** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |
| **Django** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |

*+ 3 lifecycle configurations (Flask, FastAPI, Django × PostgreSQL)*

## Test Categories

The 135 compliance tests are organized into 11 categories:

| Category | Tests | Validates |
|----------|:-----:|-----------|
| **Basic** | 45 | Simple queries, field selection, health endpoints |
| **Execution** | 20 | Query execution, mutation handling |
| **Misc** | 19 | Edge cases, operator coverage, string filters |
| **Lifecycle** | 11 | Hooks, filters, sorting, pagination, relationships |
| **Advanced** | 8 | Complex queries, nested conditions |
| **Parser Options** | 8 | Security limits, max depth, max limit |
| **Errors** | 7 | Error handling, invalid query responses |
| **Features v1.1** | 6 | Aggregation, groupBy, distinct |
| **Validation** | 5 | Schema validation, field permissions, error responses |
| **Parsing** | 4 | Query parameter parsing, body parsing, edge cases |
| **Scenarios** | 2 | End-to-end real-world usage patterns |

## How It Works

### Architecture

```mermaid
graph TD
    Runner["pytest runner"]
    Provision["1. Provision DB<br/>DDL + seed data"]
    Request["2. HTTP Request<br/>POST to adapter server"]
    Assert["3. Assert<br/>Status + body subset match"]

    Runner --> Provision
    Provision --> Request
    Request --> Assert
```

A single parametrized pytest function (`test_ecosystem_compliance`) exercises every test case:

1. **Discover** — Walk `tests/unified/` directories, load `config.json` + `cases/*.json`
2. **Provision** — Drop tables, apply DDL, seed data per database type
3. **Request** — Build HTTP request from test case definition, inject `X-JSONQL-Test-Path` header
4. **Assert** — Verify status code (exact match) and response body (recursive subset match)

The **subset assertion** model means extra keys in the actual response are tolerated — only missing keys, type mismatches, and value differences fail. This allows servers to include engine-specific metadata without breaking tests.

### Test Case Format

Each test case is a JSON object stored in `cases/*.json` files:

```json
{
  "id": "where-eq-001",
  "description": "WHERE eq operator - exact match",
  "request": {
    "method": "POST",
    "path": "/users",
    "headers": { "X-Test-Role": "user" },
    "body": {
      "fields": ["id", "name"],
      "where": { "name": { "eq": "Alice" } }
    },
    "query": "id=1"
  },
  "expected": {
    "status": 200,
    "body": {
      "data": [{ "id": 1, "name": "Alice" }]
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique test identifier (used in pytest parametrization) |
| `description` | string | Human-readable purpose |
| `request.method` | string | HTTP method (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`) |
| `request.path` | string | URL path (e.g., `/users`) |
| `request.headers` | object | Additional headers (merged with `X-JSONQL-Test-Path`) |
| `request.body` | object | JSON body (JSONQL query or mutation data) |
| `request.query` | string or object | Query string parameters |
| `expected.status` | integer | Expected HTTP status code (default `200`) |
| `expected.body` | object | Expected response body (subset match) |

### Suite Configuration

Each test suite directory requires a `config.json`:

```json
{
  "scope": "lifecycle",
  "db_types": ["postgres"],
  "ddl": {
    "postgres": "fixtures/ddl/postgres.sql",
    "mysql": "fixtures/ddl/mysql.sql",
    "sqlite": "fixtures/ddl/sqlite.sql",
    "mssql": "fixtures/ddl/mssql.sql",
    "mongodb": "fixtures/ddl/mongo_seed.js"
  },
  "data": "fixtures/data.json"
}
```

| Field | Description |
|-------|-------------|
| `scope` | Optional — `"lifecycle"` restricts to lifecycle servers only |
| `db_types` | Optional — restrict to specific database types |
| `ddl` | DDL file paths — object (per-DB) or string (shared) |
| `data` | Path to seed data JSON file |

### Test Suite Structure

```
tests/unified/
├── basic/          # Core CRUD, pagination, sort, where operators (45 tests)
├── advanced/       # Includes, aggregation, grouping (8 tests)
├── errors/         # Error responses, invalid queries (7 tests)
├── execution/      # SQL execution behavior (20 tests)
├── features-v1-1/  # v1.1 spec: aggregation, groupBy, distinct (6 tests)
├── lifecycle/      # Mutation hooks, RLS, response shaping (11 tests)
├── misc/           # Edge cases, operator coverage (19 tests)
├── parser-options/ # MaxLimit, AllowedFields, AllowedIncludes (8 tests)
├── parsing/        # Query parsing variations (4 tests)
├── scenarios/      # End-to-end real-world patterns (2 tests)
└── validation/     # Schema validation, field permissions (5 tests)
```

Each suite directory contains:
- `config.json` — required suite configuration
- `cases/*.json` — test case files (or `tests.json` for flat suites)
- `fixtures/` — optional suite-specific DDL and seed data
- `README.md` — optional documentation

### Running Tests

#### Full Suite

```bash
cd jsonql-tests
./run_tests.sh              # All 63 configurations
```

#### By Language

```bash
./run_tests.sh ts           # 15 TypeScript configurations
./run_tests.sh go           # 18 Go configurations
./run_tests.sh java         # 12 Java configurations
./run_tests.sh py           # 18 Python configurations
./run_tests.sh ts go        # TypeScript + Go
```

#### Filtered

```bash
./run_tests.sh --filter gin     # Only services matching "gin"
./run_tests.sh --filter express # Only services matching "express"
./run_tests.sh --filter mssql   # Only MSSQL variants
```

#### Direct pytest

For running tests against a single adapter server already running:

```bash
pytest tests/test_compliance.py \
  --target http://localhost:8080 \
  --db-type postgres \
  --db-dsn "postgresql://jsonql:password@localhost:5432/jsonql_test" \
  -q --tb=short
```

#### Lifecycle Only

```bash
pytest tests/test_compliance.py \
  --target http://localhost:8089 \
  --db-type postgres \
  --db-dsn "postgresql://jsonql:password@localhost:5432/jsonql_test" \
  --test-path tests/unified/lifecycle
```

### CLI Options

| Option | Default | Description |
|--------|---------|-------------|
| `--target` | `http://localhost:8080` | Base URL of the adapter server |
| `--db-type` | `postgres` | Database backend: `postgres`, `mysql`, `sqlite`, `mssql`, `mongodb` |
| `--db-dsn` | — | Database connection string (URI format) |
| `--sqlite-file` | — | Path to SQLite database file |
| `--mongo-dsn` | — | MongoDB connection string (fallback to `--db-dsn`) |
| `--mongo-db` | `jsonql_test` | MongoDB database name |
| `--mssql-host` | `localhost` | MSSQL hostname |
| `--mssql-user` | `sa` | MSSQL username |
| `--mssql-pass` | `JsonQL@123` | MSSQL password |
| `--mssql-db` | `jsonql_test` | MSSQL database name |
| `--mssql-port` | `1433` | MSSQL port |
| `--test-path` | `tests/unified` | Path to test suites root directory |

You can also use standard pytest options like `-k "where-eq"` to filter by test ID.

## CI Pipeline

Four parallel GitHub Actions jobs with a summary step:

| Job | Timeout | Setup |
|-----|---------|-------|
| **test-ts** | 20 min | Node 18 + Python 3.12, runs `./run_tests.sh ts` |
| **test-go** | 20 min | Go 1.24, runs `./run_tests.sh go` |
| **test-java** | 25 min | Java 21 (Temurin), runs `./run_tests.sh java` |
| **test-py** | 20 min | Python 3.12, runs `./run_tests.sh py` |
| **summary** | — | Downloads all artifacts, generates results table |

Each job uploads test results to `results/` as artifacts (30-day retention). The `run_tests.sh` script:

1. Starts databases via Docker Compose
2. Waits for health checks (up to 60s per database)
3. Pre-provisions MSSQL (requires explicit database creation unlike PG/MySQL)
4. Iterates over adapter configs: start container → poll `/health` → run pytest → stop container
5. Reports PASSED/FAILED/SKIPPED summary

## Adding a New Adapter

See the [Integration Testing](/guides/integration-testing/) guide for details on:

- Implementing the adapter server HTTP contract
- Configuring environment variables and schema resolution
- Adding Docker Compose services and port allocation
- Registering in `run_tests.sh`

## Repo

[`github.com/jsonql-standard/jsonql-tests`](https://github.com/JSONQL-Standard/jsonql-tests)
