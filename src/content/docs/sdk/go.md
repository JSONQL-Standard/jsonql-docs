---
title: Go SDK
description: Build JSONQL-powered APIs in Go with Gin, Echo, or net/http.
---

The official Go implementation of the JSONQL Standard. Full v1.1 support with a modular pipeline architecture.

| | |
|---|---|
| **Module** | `github.com/jsonql-standard/jsonql-go` |
| **Go version** | 1.24+ |
| **License** | MIT |
| **Spec** | JSONQL v1.1 |

## Features

- Full JSONQL v1.1: selects, includes (relationships), filtering, sorting, pagination, aggregation, groupBy, distinct
- Database agnostic with pluggable `Driver` interface (PostgreSQL, SQLite, MSSQL, MongoDB drivers included)
- Framework adapters for **Gin**, **Echo**, and **net/http**
- Schema-based validation and SQL injection prevention (parameterized queries)
- Fluent `QueryBuilder` and `MutationBuilder` APIs
- Result hydrator for nested JSON reconstruction from flat SQL rows
- Lifecycle hooks: `BeforeQuery`, `AfterQuery`, `BeforeCreate`/`Update`/`Delete`, `AfterCreate`/`Update`/`Delete`
- Schema introspection and file-based schema loading

## Installation

```bash
go get github.com/jsonql-standard/jsonql-go
```

## Quick Start

```go
package main

import (
	"database/sql"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/jsonql-standard/jsonql-go"
	jsonqlgin "github.com/jsonql-standard/jsonql-go/adapters/gin"
	"github.com/jsonql-standard/jsonql-go/drivers/sqlite"
	_ "modernc.org/sqlite"
)

func main() {
	schema := &jsonql.JSONQLSchema{
		Tables: map[string]*jsonql.JSONQLTable{
			"users": {
				Fields: map[string]*jsonql.JSONQLField{
					"id":    {Type: "number"},
					"name":  {Type: "string"},
					"email": {Type: "string"},
				},
				Relations: map[string]*jsonql.JSONQLRelation{
					"posts": {Type: "hasMany", Table: "posts", Field: "user_id"},
				},
			},
		},
	}

	driver, _ := sqlite.NewDriver("./my.db")

	handler, _ := jsonqlgin.NewHandler(jsonqlgin.HandlerOptions{
		Driver: driver,
		Schema: schema,
	})

	r := gin.Default()
	r.POST("/api/jsonql", handler)
	r.Run(":8080")
}
```

## Architecture

The SDK follows a modular pipeline:

1. **Parser** — validates the incoming JSON query against the schema
2. **Transpiler** — converts the JSONQL query into dialect-specific SQL
3. **Driver** — executes the SQL against the database
4. **Hydrator** — reconstructs nested JSON from flat result rows

## Core API

| Type | Purpose |
|------|---------|
| `JSONQLQuery` | Query struct: fields, where, sort, limit, offset, aggregate, groupBy, include, distinct |
| `JSONQLMutation` | Mutation struct: op, data, patch, where |
| `JSONQLSchema` / `JSONQLTable` / `JSONQLField` | Schema definition types |
| `Parser` | Parse & validate incoming JSON |
| `ParserOptions` | Security limits: `MaxNestingDepth`, `MaxLimit`, `AllowedFields`, `AllowedIncludes` |
| `Transpiler` | Convert parsed query → SQL + args |
| `Hydrator` | Convert flat `sql.Rows` → nested JSON maps |
| `Validator` | Schema-based permission checking |
| `Driver` interface | `Query()`, `Execute()`, `Close()` |
| `SQLDialect` interface | `Placeholder()`, `QuoteIdentifier()`, `SupportsReturning()` |

## Supported Databases

| Database | Import Path | Driver |
|----------|-------------|--------|
| **PostgreSQL** | `github.com/jsonql-standard/jsonql-go/drivers/postgres` | `github.com/lib/pq` |
| **SQLite** | `github.com/jsonql-standard/jsonql-go/drivers/sqlite` | `modernc.org/sqlite` |
| **MySQL** | Dialect supported (`MySQLDialect`) | Bring your own driver |
| **MSSQL** | `github.com/jsonql-standard/jsonql-go/drivers/mssql` | `github.com/denisenkom/go-mssqldb` |
| **MongoDB** | `github.com/jsonql-standard/jsonql-go/drivers/mongodb` | `go.mongodb.org/mongo-driver` |

## Framework Adapters

| Framework | Import Path |
|-----------|-------------|
| **Gin** | `github.com/jsonql-standard/jsonql-go/adapters/gin` |
| **Echo** | `github.com/jsonql-standard/jsonql-go/adapters/echo` |
| **net/http** | `github.com/jsonql-standard/jsonql-go/adapters/http` |

## Query Builder

```go
import "github.com/jsonql-standard/jsonql-go/builder"

q := builder.New().
	From("users").
	Select("id", "name", "email").
	Where("status", "active").
	AndWhere("age", map[string]any{"gte": 18}).
	Sort("-created_at").
	Limit(10).
	Build()
```

## Compliance

All 3 framework adapters × 3 databases = **9 containers** pass **65/65** compliance tests.

| Adapter | PostgreSQL | MySQL | SQLite |
|---------|:----------:|:-----:|:------:|
| **Gin** | ✅ 65/65 | ✅ 65/65 | ✅ 65/65 |
| **Echo** | ✅ 65/65 | ✅ 65/65 | ✅ 65/65 |
| **net/http** | ✅ 65/65 | ✅ 65/65 | ✅ 65/65 |

## Repo

[`github.com/jsonql-standard/jsonql-go`](https://github.com/JSONQL-Standard/jsonql-go)
