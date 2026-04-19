---
title: TypeScript SDK
description: Build JSONQL-powered APIs in TypeScript with Express, Fastify, or NestJS.
---

The official Node.js/TypeScript SDK for JSONQL. Type-safe query building, SQL transpilation, and framework middleware out of the box.

| | |
|---|---|
| **Package** | `@jsonql-standard/jsonql-ts` |
| **Version** | 1.0.0 |
| **License** | MIT |
| **Runtime** | Node.js 18+ |

## Features

- Type-safe JSONQL parser, validator, and builder
- SQL transpiler with dialect support (Postgres, MySQL, SQLite, MSSQL)
- MongoDB transpiler for aggregation pipelines
- Result hydrator for nested join reconstruction
- Framework adapters for **Express**, **Fastify**, and **NestJS**
- Database drivers for PostgreSQL, MySQL, SQLite, MSSQL, and MongoDB
- Schema introspection and manager
- Mutation support with `RETURNING`
- Fluent `JSONQLQueryBuilder` and `JSONQLMutationBuilder`
- CLI tool (`jsonql-gen-sql`) for SQL generation

## Installation

```bash
npm install @jsonql-standard/jsonql-ts
```

## Quick Start

### Parser

```typescript
import { JSONQLParser } from '@jsonql-standard/jsonql-ts';

const parser = new JSONQLParser();
const query = parser.parse({
  version: '1.0',
  fields: ['id', 'name'],
  where: { status: { eq: 'active' } }
});
```

### Express Adapter

```typescript
import express from 'express';
import { jsonqlExpress } from '@jsonql-standard/jsonql-ts';

const app = express();
app.use('/api', jsonqlExpress());

app.get('/api/users', (req, res) => {
  const query = req.jsonql; // Typed JSONQLQuery
  // ... execute query
});
```

### Fastify Adapter

```typescript
import Fastify from 'fastify';
import { jsonqlFastify } from '@jsonql-standard/jsonql-ts';

const fastify = Fastify();
fastify.register(jsonqlFastify);

fastify.get('/users', (req, reply) => {
  const query = req.jsonql;
  // ...
});
```

### NestJS Adapter

```typescript
import { Controller, All, Req, Res, Module } from '@nestjs/common';
import { Request, Response } from 'express';
import { JsonqlModule, JsonqlService } from '@jsonql-standard/jsonql-ts';

// Register the module
@Module({
  imports: [JsonqlModule.forRoot({ /* AdapterOptions */ })],
})
export class AppModule {}

// Inject JsonqlService in a controller
@Controller()
export class AppController {
  constructor(private readonly jsonql: JsonqlService) {}

  @All(':resource')
  async handle(@Req() req: Request, @Res() res: Response) {
    return this.jsonql.handleRequest(req, req.path, res);
  }
}
```

### SQL Transpilation & Execution

```typescript
import { SQLTranspiler, ResultHydrator } from '@jsonql-standard/jsonql-ts';
import { Client } from 'pg';

const transpiler = new SQLTranspiler('postgres');
const hydrator = new ResultHydrator();
const client = new Client();

async function getUsers(jsonqlQuery) {
  const { sql, parameters } = transpiler.transpile(jsonqlQuery, 'users');
  const result = await client.query(sql, parameters);
  return hydrator.hydrate(result.rows);
}
```

## Core API

| Export | Purpose |
|--------|---------|
| `JSONQLParser` | Parse & validate incoming JSON |
| `JSONQLValidator` | Schema-based permission checking |
| `JSONQLQueryBuilder` | Fluent query construction |
| `JSONQLMutationBuilder` | Fluent mutation construction |
| `SQLTranspiler` | Convert parsed query → SQL + params |
| `ResultHydrator` | Flatten SQL joins → nested JSON |
| `SchemaManager` | Load schemas from introspection + JSON files |

## Supported Databases

| Database | Driver file | Underlying package |
|----------|-------------|-------------------|
| **PostgreSQL** | `drivers/postgres.ts` | `pg` |
| **MySQL** | `drivers/mysql.ts` | `mysql2` |
| **SQLite** | `drivers/sqlite.ts` | `sqlite3` / `sqlite` |
| **MSSQL** | `drivers/mssql.ts` | `mssql` |
| **MongoDB** | `drivers/mongodb.ts` | `mongodb` |

## Framework Adapters

| Framework | Export | Integration style |
|-----------|--------|------------------|
| **Express** | `jsonqlExpress()` | Middleware — sets `req.jsonql` |
| **Fastify** | `jsonqlFastify` | Plugin — sets `req.jsonql` |
| **NestJS** | `JsonqlModule` / `JsonqlService` | Module with injectable service |

## Compliance

All 3 framework adapters × 4 SQL databases + 3 lifecycle containers = **15 configurations** pass **135/135** compliance tests.

> **Note:** The TypeScript SDK includes a MongoDB driver and `MongoTranspiler`, but MongoDB compliance testing is not yet wired into the CI matrix. MongoDB support is functional but not formally validated by the compliance suite.

| Adapter | PostgreSQL | MySQL | SQLite | MSSQL |
|---------|:----------:|:-----:|:------:|:-----:|
| **Express** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |
| **Fastify** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |
| **NestJS** | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 | ✅ 135/135 |

Lifecycle tests (Express, Fastify, NestJS × PostgreSQL) also pass.

## Development

### Build & Test

```bash
npm install           # Install dependencies
npm test              # Run all tests (Jest + ts-jest)
npm run build         # Compile TypeScript
```

### Formatting

The TypeScript SDK uses [Prettier](https://prettier.io/) for code formatting. Configuration: `singleQuote`, `semi`, `trailingComma: "all"`, `printWidth: 100`. Formatting is enforced in CI.

```bash
npx prettier --check .   # Check formatting (CI runs this)
npx prettier --write .   # Auto-format all files
```

### Pre-commit Hook

A pre-commit hook runs Prettier and TypeScript type-checking before each commit. To install:

```bash
cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### CI Pipeline

The GitHub Actions CI runs two jobs:

1. **lint** — `prettier --check` + `tsc --noEmit` (format + type verification)
2. **test** — `npm test` on Node.js 18 and 20 (gated by lint)

## Repo

[`github.com/jsonql-standard/jsonql-ts`](https://github.com/JSONQL-Standard/jsonql-ts)
