# SYSTEM_INTENT.md

## Purpose

This project is an **abuse-resistant authentication service** designed to operate under **hostile and imperfect conditions**.

The goal is **not feature completeness**, but to design authentication as it exists in the real world:
- users are careless
- attackers are persistent
- infrastructure is unreliable
- failures are normal, not exceptional

This service prioritizes **correctness under failure**, **explicit trade-offs**, and **defensive defaults** over convenience.

---

## What This Service DOES

### 1. Authentication Core
- Supports **email + password authentication**
- Issues:
  - **short-lived access tokens** (stateless)
  - **long-lived refresh tokens** (stateful, rotated)
- Maintains **explicit user sessions**, not “pure JWT auth”

### 2. Session-Aware Design
- Every login creates a **session record**
- Sessions are tied to:
  - device metadata (coarse, not fingerprinting)
  - token lineage
- Users can:
  - list active sessions
  - revoke individual sessions
  - revoke all sessions

### 3. Abuse Resistance (First-Class Concern)
The system explicitly defends against:
- credential stuffing
- refresh token replay
- brute-force login attempts
- excessive refresh abuse

Rate limits, rotation, and revocation are **designed first**, implemented second.

### 4. Failure-Conscious Behavior
The system defines behavior for:
- partial database failure
- cache (Redis) unavailability
- duplicate or replayed requests

Every critical flow answers:
> *“Should this fail open, fail closed, or degrade gracefully?”*

---

## What This Service Explicitly DOES NOT Do

This project intentionally avoids the following:

- ❌ OAuth providers (Google, GitHub, etc.)
- ❌ Email verification / magic links
- ❌ Password reset flows
- ❌ Multi-factor authentication (2FA)
- ❌ Role-based authorization (RBAC / ABAC)
- ❌ User profile management
- ❌ Microservices or distributed auth

These are excluded **by design**, not omission.

The objective is **depth over breadth**.

---

## Core Assumptions

### 1. Users Are Not Trusted
- Users reuse passwords
- Tokens will eventually be leaked
- Devices are shared, lost, or compromised

The system assumes **eventual misuse**, not ideal behavior.

---

### 2. Attackers Are Persistent but Boring
- Attacks are automated
- They exploit edge cases and retries
- They do not need sophistication if defaults are weak

Security here focuses on **eliminating easy wins**, not nation-state threats.

---

### 3. Infrastructure Is Unreliable
- Databases slow down
- Caches disappear
- Writes partially succeed

Auth logic is designed assuming:
> *“The happy path is rare under load.”*

---

### 4. Stateless Auth Is a Myth
Pure stateless JWT auth is insufficient for:
- session revocation
- token theft detection
- multi-device control

This system **embraces state where it matters**.

---

## Design Philosophy

- **Explicit over implicit**
- **Revocable over convenient**
- **Boring over clever**
- **Failure-aware over optimistic**

Every mechanism in this service exists to answer one question:

> *“What happens when this goes wrong?”*

---

## Success Criteria

This project is successful if:
- Token reuse is detectable
- Sessions can be revoked deterministically
- Abuse attempts degrade service safely
- Failure behavior is documented and intentional

Feature completeness is **not** a success metric.

---

## Non-Goals

- “Enterprise-ready”
- “Infinitely scalable”
- “Framework-agnostic perfection”

This is a **learning-through-realism** project, not a product pitch.
