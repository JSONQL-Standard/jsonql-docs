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
- SQL transpiler with dialect support (Postgres, MySQL, SQLite)
- Result hydrator for nested join reconstruction
- Framework adapters for **Express**, **Fastify**, and **NestJS**
- Database drivers for PostgreSQL, MySQL, SQLite
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
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JsonqlMiddleware } from '@jsonql-standard/jsonql-ts';

@Module({ ... })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JsonqlMiddleware).forRoutes('*');
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

## Framework Adapters

| Framework | Export | Integration style |
|-----------|--------|------------------|
| **Express** | `jsonqlExpress()` | Middleware — sets `req.jsonql` |
| **Fastify** | `jsonqlFastify` | Plugin — sets `req.jsonql` |
| **NestJS** | `JsonqlMiddleware` | NestJS middleware class |

## Compliance

All 3 framework adapters × 3 databases = **9 containers** pass **65/65** compliance tests.

| Adapter | PostgreSQL | MySQL | SQLite |
|---------|:----------:|:-----:|:------:|
| **Express** | ✅ 65/65 | ✅ 65/65 | ✅ 65/65 |
| **Fastify** | ✅ 65/65 | ✅ 65/65 | ✅ 65/65 |
| **NestJS** | ✅ 65/65 | ✅ 65/65 | ✅ 65/65 |

## Repo

[`github.com/jsonql-standard/jsonql-ts`](https://github.com/JSONQL-Standard/jsonql-ts)
