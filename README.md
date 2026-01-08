# Abuse-Resistant Authentication Service

An **authentication service** designed for **hostile and imperfect conditions** - where users are careless, attackers are persistent, and infrastructure is unreliable.

## 📋 Table of Contents

- [Reason for This Project](#reason-for-this-project)
- [Tech Stack](#tech-stack)
- [Libraries Used](#libraries-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [What This Service Does NOT Do](#what-this-service-does-not-do)
- [Development](#development)

## 🎯 Reason for This Project

This project is built on the philosophy that **authentication in the real world** operates under hostile and imperfect conditions. Instead of building yet another feature-complete authentication service, this focuses on:

### Core Problems Solved:
- **User Carelessness**: Users reuse passwords, share devices, and inevitably leak tokens
- **Persistent Attackers**: Automated attacks that exploit edge cases and retries
- **Infrastructure Failures**: Databases slow down, caches disappear, and writes partially succeed

### Design Philosophy:
- **Correctness under failure** over convenience
- **Explicit trade-offs** over hidden assumptions  
- **Defensive defaults** over feature completeness
- **Depth over breadth** - doing few things extremely well

The system assumes **eventual misuse**, not ideal behavior, and is designed to eliminate easy wins for attackers while gracefully handling infrastructure failures.

## 🛠 Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Backend Framework**: [Express.js](https://expressjs.com/) - Web application framework
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Primary data store
- **Cache**: [Redis](https://redis.io/) - Session management and rate limiting
- **ORM**: [Prisma](https://www.prisma.io/) - Database toolkit and ORM
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

## 📚 Libraries Used

### Core Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.2.1 | Web application framework |
| `@prisma/client` | 6 | Database ORM client |
| `jsonwebtoken` | ^9.0.3 | JWT token generation and verification |
| `bcrypt` | ^6.0.0 | Password hashing and verification |
| `zod` | ^4.3.4 | Runtime type validation |
| `uuid` | ^13.0.0 | UUID generation |
| `ua-parser-js` | ^2.0.7 | User agent parsing for device detection |

### Middleware & Utilities
| Library | Purpose |
|---------|---------|
| `cookie-parser` | Cookie parsing middleware |
| `cors` | Cross-Origin Resource Sharing |
| `dotenv` | Environment variable management |
| `pg` | PostgreSQL client |
| `crypto` | Cryptographic utilities |

### Development Dependencies
| Library | Purpose |
|---------|---------|
| `@types/*` | TypeScript type definitions |
| `typescript` | TypeScript compiler |
| `prisma` | Database schema management |

## 🚀 Installation

### Prerequisites
- [Bun](https://bun.sh/) (latest version)
- [PostgreSQL](https://www.postgresql.org/) (v12+)
- [Redis](https://redis.io/) (v6+)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd authentication_express/take_5
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   bunx prisma generate
   
   # Run database migrations
   bunx prisma migrate deploy
   ```

5. **Start the development server**
   ```bash
   bun run dev:watch
   ```

The server will start on `http://localhost:3000` (or your specified PORT).

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Server
PORT=3000
```

### Optional Variables (with defaults)
```env
# Token TTL Configuration
ACCESS_TOKEN_TTL_IN_SECS=300          # 5 minutes
REFRESH_TOKEN_TTL_IN_SECS=604800      # 7 days

# Security Configuration
TOKEN_REUSE_WINDOW_MS=5000            # 5 seconds
COOKIE_ON_SECURE_CONNECTION=true      # Set to false for development
```

## 🌐 API Endpoints

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Create new user account |
| `POST` | `/login` | Authenticate user and create session |
| `POST` | `/refresh` | Refresh access token using refresh token |
| `POST` | `/logout` | Revoke current session |
| `POST` | `/logout-all` | Revoke all user sessions |

### User Routes (`/api/v1/user`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sessions` | List all active sessions |
| `DELETE` | `/sessions/:sessionId` | Revoke specific session |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health status |


## 🔒 Security Features

### Abuse Resistance
- **Rate limiting** on authentication endpoints
- **Refresh token rotation** with family tracking
- **Session-aware design** - every login creates explicit session records
- **Token reuse detection** with configurable grace windows

### Failure Handling
- **Redis unavailability** - Graceful degradation
- **Database partial failures** - Explicit fail-safe behaviors  
- **Duplicate requests** - Idempotency protection
- **Token replay attacks** - Family-based revocation

### Session Management
- **Device metadata tracking** (coarse-grained, not fingerprinting)
- **IP address logging** for session context
- **Bulk session revocation** capability
- **Session listing** for user visibility

## ❌ What This Service Does NOT Do

This project **intentionally excludes** the following features:

- ❌ **OAuth providers** (Google, GitHub, etc.)
- ❌ **Email verification** / magic links  
- ❌ **Password reset flows**
- ❌ **Multi-factor authentication** (2FA)
- ❌ **Role-based authorization** (RBAC/ABAC)
- ❌ **User profile management**
- ❌ **Microservices** or distributed auth

These exclusions are **by design**, not omission. The focus is on **depth over breadth**.

## 🔧 Development

### Available Scripts
```bash
# Development with hot reload
bun run dev:watch

# Development (no hot reload)  
bun run dev

# Database operations
bunx prisma generate          # Generate Prisma client
bunx prisma migrate dev       # Create and apply new migration
bunx prisma studio           # Open Prisma Studio
```

### Project Structure
```
src/
├── controllers/     # Request handlers
├── lib/            # Utility libraries (crypto, jwt, redis, etc.)
├── middlewares/    # Express middlewares
├── routes/         # Route definitions
├── schemas/        # Zod validation schemas
└── services/       # Business logic layer
```

### Core Assumptions
1. **Users are not trusted** - passwords are reused, tokens leak, devices are compromised
2. **Attackers are persistent but boring** - automated attacks exploiting weak defaults  
3. **Infrastructure is unreliable** - databases slow down, caches disappear, writes fail

Every critical flow answers: *"Should this fail open, fail closed, or degrade gracefully?"*
