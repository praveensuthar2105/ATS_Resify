# ATS Resify Architecture

Status: migration in progress

Decision date: 2026-06-15

## Architecture Decision

ATS Resify uses three coarse-grained domain services behind an API gateway:

```text
React Frontend
      |
API Gateway :8080
      |
      +-- Identity Service :8081
      +-- Resume Service :8082
      +-- Intelligence Service :8083
```

This replaces the previous eight-service topology. The objective is to retain independent scaling for authentication, document processing, and AI workloads without splitting small domains into operationally expensive services.

## Service Ownership

### Identity Service

Responsibilities:

- OAuth2 login and token issuance
- Users, roles, and account lifecycle
- User preferences that are not specific to AI conversations
- Contact and feedback endpoints
- Administrative identity and support operations

Routes:

```text
/oauth2/**
/login/**
/auth/**
/api/auth/**
/api/user/**
/api/admin/**
/api/public/**
```

Owned data:

- Users and roles
- OAuth identities and refresh sessions
- Authentication and administrative audit records
- Contact and feedback records

### Resume Service

Responsibilities:

- Resume editing and persistence
- Resume revisions and conflict resolution
- Templates and LaTeX generation
- PDF compilation
- Real-time resume synchronization

Routes:

```text
/api/resume/**
/api/latex/**
/api/resume-sync/**
/ws-resume/**
```

Owned data:

- Resumes and revisions
- Template metadata
- Compilation jobs and generated document metadata

LaTeX compilation should eventually run in an isolated worker owned by this domain:

```text
Resume API -> Redis job queue -> sandboxed compiler worker -> object storage
```

### Intelligence Service

Responsibilities:

- ATS analysis
- Resume import and semantic parsing
- AI chat
- Content and bullet generation
- Job matching
- AI conversation history and usage accounting

Routes:

```text
/api/resume/ats-score
/api/resume/import/**
/api/agent/**
```

Owned data:

- ATS reports
- AI conversations and messages
- Prompt/model versions
- AI usage and cost records

## Boundary Rules

1. A service must not import another service's repository or JPA entity.
2. User identity must come from the verified JWT `sub` claim, never a request-provided `userId`.
3. `common-lib` may contain stable security primitives, error contracts, and infrastructure helpers. It must not own domain repositories or business services.
4. Cross-service requests use DTO contracts, short timeouts, correlation IDs, and service authentication.
5. Expensive operations return a job ID when they cannot reliably complete within a normal HTTP request.
6. Each service owns its schema or database. Cross-service relationships store IDs rather than foreign JPA associations.
7. The gateway performs routing, CORS, rate limiting, and request tracing only. It contains no business logic.

## Data Topology

Target databases or schemas:

```text
identity_db
resume_db
intelligence_db
```

Redis is shared infrastructure but keys must be namespaced:

```text
identity:*
resume:*
intelligence:*
```

Database separation can happen after the service consolidation builds and passes integration tests. Until then, service-owned repositories are mandatory even if the physical MySQL instance remains shared.

## Service Communication

Prefer synchronous HTTP only when the caller needs an immediate answer. Use events or jobs for:

- User deletion cleanup
- ATS analysis
- AI generation
- PDF import
- LaTeX compilation
- Analytics updates

Initial events:

```text
UserDeleted
ResumeDeleted
ResumeSnapshotCreated
AtsAnalysisCompleted
CompilationCompleted
```

Events must include an event ID, timestamp, schema version, correlation ID, and aggregate ID. Consumers must be idempotent.

## Deployment Units

Target production units:

```text
gateway-service
identity-service
resume-service
intelligence-service
resume-compiler-worker
frontend
mysql
redis
```

The compiler worker is a later hardening step. During migration, compilation can remain in Resume Service, but it must have strict concurrency, timeout, upload, CPU, memory, filesystem, and process limits.

## Migration Checklist

### Phase 1: Consolidate

- [x] Add `identity-service` Maven module.
- [x] Add `intelligence-service` Maven module.
- [x] Update the parent Maven module list.
- [x] Consolidate gateway routes into three domains.
- [ ] Make the complete Maven reactor compile and test.
- [ ] Add tests for Identity and Intelligence.
- [ ] Verify component scanning and bean wiring after moving classes.
- [ ] Remove references to deleted service ports and names.

### Phase 2: Deploy

- [ ] Add Dockerfiles for Identity and Intelligence.
- [ ] Replace the old eight-service `docker-compose.yml`.
- [ ] Use Compose DNS names rather than container-local `localhost`.
- [ ] Add health checks and dependency readiness.
- [ ] Add an end-to-end gateway smoke test.
- [ ] Update CI to build all three services and the frontend.

### Phase 3: Enforce Boundaries

- [ ] Move domain entities and repositories out of `common-lib`.
- [ ] Separate service-owned schemas.
- [ ] Remove direct cross-domain repository access from admin endpoints.
- [ ] Add ArchUnit boundary tests.
- [ ] Add service-to-service authentication and timeouts.

### Phase 4: Scale Safely

- [ ] Move LaTeX compilation to a sandboxed worker.
- [ ] Introduce asynchronous ATS and long-running AI jobs.
- [ ] Add per-user quotas, rate limits, and cost accounting.
- [ ] Add OpenTelemetry tracing and Micrometer metrics.
- [ ] Add resilient retries only for idempotent operations.

## Immediate Blockers

The migration is not deployable until these are resolved:

1. `docker-compose.yml` still references deleted services.
2. Identity and Intelligence do not yet have Dockerfiles.
3. All services still default to the same database/schema.
4. `common-lib` still owns domain entities and repositories.
5. Critical authorization, shared resume state, JWT secret, and LaTeX isolation findings in `CODE_REVIEW.md` remain applicable.
6. The new services need security, ownership, integration, and failure-path tests.

