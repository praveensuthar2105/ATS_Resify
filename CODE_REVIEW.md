# Production Code Review

Review date: 2026-06-14

Scope: all first-party source, configuration, scripts, workflows, tests, SQL/database utilities, and deployment files under the repository. Generated dependencies (`node_modules`, Maven `target` output), compiled `.class` files, images, and PDFs were inventoried but not source-reviewed. `Backend/monolith-src-backup` was compared with the active modules; it substantially duplicates the active implementation and carries the same defects where noted.

## Change Review Update

Updated on 2026-06-14 after reviewing commit `408ae7c9` and the current uncommitted changes.

- Issues #5 and #12 are resolved by the frontend changes.
- Issue #31 is new and is caused by the uncommitted security configuration change.
- The frontend production build now passes.
- Frontend lint now reports 33 errors and 3 warnings, including an undefined retry handler in `AgentChat`.
- The uncommitted gateway CORS configuration does not resolve the existing localhost upstream or missing resume sync/WebSocket route defects.
- Current totals: 29 open findings, 2 resolved findings, 31 historical findings.

Architecture decision update on 2026-06-15:

- The project is migrating to three coarse-grained services: Identity, Resume, and Intelligence.
- This consolidation addresses excessive deployment fragmentation, but does not by itself resolve the security, state isolation, data ownership, or deployment findings below.
- The migration design and remaining blockers are documented in `ARCHITECTURE.md`.

## Issue #1

**Severity:** Critical

**Category:** Security - Stored XSS / Account Compromise

**Location:**

- File: `FrontEnd/frontend/src/components/AgentChat.jsx`
- Component: `AgentChat`
- Method: `formatMessage`, `renderMessage`
- Lines: 20-26, 488-506

**Problem:** Chat content is transformed with regular expressions and injected with `dangerouslySetInnerHTML` without HTML sanitization. Both user-controlled messages and model-generated responses can contain arbitrary HTML/event handlers.

**Impact:** An attacker can persist script-bearing chat content, execute JavaScript in another user's browser through the conversation IDOR described below, and steal the JWT stored in `localStorage`. Even without the IDOR, malicious model output or prompt injection can execute script in the current user's session.

**Evidence:** `formatMessage()` preserves existing HTML and `renderMessage()` assigns its result directly to `__html`. Conversations are persisted in `AgentMessage.content` and can be retrieved by session ID.

**Recommended Fix:** Do not render generated HTML. Render Markdown with a parser configured to reject raw HTML, or sanitize the generated HTML with DOMPurify using a minimal allowlist. Add a restrictive Content Security Policy and move authentication tokens out of JavaScript-readable storage.

**Example Fix:**

```jsx
import DOMPurify from 'dompurify';

const safeHtml = DOMPurify.sanitize(formatMessage(content), {
  ALLOWED_TAGS: ['strong', 'em', 'code', 'br'],
  ALLOWED_ATTR: [],
});
```

## Issue #2

**Severity:** Critical

**Category:** Security - Broken Object-Level Authorization

**Location:**

- File: `Backend/agent-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/agent/AgentController.java`
- Class: `AgentController`
- Methods: `chat`, preference endpoints, conversation endpoints
- Lines: 65-82, 264-307, 315-366
- File: `Backend/agent-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/agent/AgentChatService.java`
- Methods: `getOrCreateConversation`, `getUserConversations`, `getSessionMessages`, `endConversation`
- Lines: 347-359, 532-552

**Problem:** The service trusts request-supplied `userId` and `sessionId` values and never verifies them against the authenticated JWT principal. A supplied existing session is accepted even when it belongs to another user.

**Impact:** Any authenticated user can read, append to, or deactivate another user's conversations and read, overwrite, or delete another user's saved preferences. Resume and career information is sensitive personal data.

**Evidence:** `getOrCreateConversation()` performs only `findBySessionId`; preference and conversation endpoints pass query/path values directly to repositories/services.

**Recommended Fix:** Remove `userId` from public request contracts. Resolve the user exclusively from `Authentication.getName()`. Query sessions using both `sessionId` and `userId`, return 404/403 on mismatch, and enforce ownership in the service layer.

**Example Fix:**

```java
String userId = authentication.getName();
AgentConversation conversation = repository
    .findBySessionIdAndUserId(sessionId, userId)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
```

## Issue #3

**Severity:** Critical

**Category:** Security / Data Corruption / Concurrency

**Location:**

- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/ResumeDataSyncService.java`
- Class: `ResumeDataSyncService`
- Lines: 7-74
- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/UndoRedoService.java`
- Class: `UndoRedoService`
- Lines: 10-100
- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/ResumeSyncController.java`
- Class: `ResumeSyncController`
- Lines: 26-183

**Problem:** Resume state and undo history are mutable fields on singleton Spring services. They are shared by every request and user and are unsynchronized.

**Impact:** Users can receive or overwrite each other's resume data. Concurrent requests can corrupt `ArrayList` history/index state, lose updates, throw runtime exceptions, and broadcast one user's PII to every subscriber.

**Evidence:** `centralModel`, `history`, and `currentIndex` have no user/session key and no synchronization. Every endpoint accesses the same instances.

**Recommended Fix:** Make synchronization state user/session scoped and persistent or store it in Redis/database using an authenticated user/session key and optimistic version. Use atomic operations/transactions. Do not use singleton mutable state for request data.

## Issue #4

**Severity:** Critical

**Category:** Deployment / Integration Failure

**Location:**

- File: `Backend/gateway-service/src/main/resources/application.yml`
- Lines: 13-53
- File: `docker-compose.yml`
- Services: all

**Problem:** Gateway upstreams use `http://localhost:808x`. Inside the gateway container, `localhost` is the gateway container itself, not the other Compose services.

**Impact:** All gateway-routed API calls fail in the documented Docker Compose deployment.

**Evidence:** Compose creates service DNS names such as `auth-service`, while every route targets localhost.

**Recommended Fix:** Parameterize upstream URLs and use Compose service names in containers.

**Example Fix:**

```yaml
uri: ${AUTH_SERVICE_URL:http://auth-service:8081}
```

## Issue #5

**Severity:** Critical

**Category:** Deployment / Build Failure

**Status:** Resolved on 2026-06-14

**Location:**

- File: `FrontEnd/frontend/src/pages/About.jsx`
- File: `FrontEnd/frontend/src/pages/EditResume.jsx`

**Problem:** The reviewed revision imported `About.css` and `EditResume.css`, but neither file existed.

**Impact:** The previous revision could not produce a deployable frontend bundle.

**Evidence:** The imports were removed in commit `408ae7c9`. The current `npm run build` completes successfully.

**Recommended Fix:** Completed. Keep the production build as a required CI check to prevent recurrence.

## Issue #6

**Severity:** High

**Category:** Security - Authentication Secret

**Location:**

- Files: every active service `src/main/resources/application.properties`
- Property: `jwt.secret`
- Typical line: 44

**Problem:** All services have the same committed fallback JWT signing secret. `JwtValidationConfig` only checks length, so the known fallback passes validation.

**Impact:** Any deployment that omits `JWT_SECRET` accepts attacker-forged tokens, including `ADMIN` tokens.

**Evidence:** `${JWT_SECRET:aVeryStrongSecretKeyForJWTThatIsAtLeast256BitsLongAndSecure1234567890}` is repeated across services.

**Recommended Fix:** Remove the fallback entirely and fail startup when the environment/secret manager value is absent. Validate entropy/known placeholders, not only length. Rotate any deployment that may have used the fallback.

## Issue #7

**Severity:** High

**Category:** Security - Authorization / Privilege Management

**Location:**

- File: `Backend/auth-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/auth/OAuth2LoginSuccessHandler.java`
- Method: `onAuthenticationSuccess`
- Lines: 59-67

**Problem:** Administrator privilege is assigned from a hardcoded email allowlist during every login.

**Impact:** Identity-provider/account compromise of one listed mailbox grants permanent application administration. Privilege policy requires a code deployment, is not auditable as a proper role change, and can silently restore a revoked admin.

**Evidence:** Four email addresses unconditionally receive `Role.ADMIN`.

**Recommended Fix:** Manage roles in the database through an audited bootstrap/migration or external identity-group claim. Never upgrade roles in a login handler.

## Issue #8

**Severity:** High

**Category:** Security - OAuth Replay Race

**Location:**

- File: `Backend/auth-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/auth/AuthorizationCodeStore.java`
- Method: `consume`
- Lines: 90-108

**Problem:** One-time code consumption uses separate Redis `GET` and `DELETE` operations.

**Impact:** Concurrent requests can both read and exchange the same authorization code before either delete completes.

**Evidence:** The code explicitly performs `get(key)` followed by `delete(key)` without an atomic transaction/script.

**Recommended Fix:** Use Redis `GETDEL`, a Lua script, or a transaction with appropriate compare/delete semantics.

## Issue #9

**Severity:** High

**Category:** Security / Availability - Untrusted LaTeX Execution

**Location:**

- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/LatexController.java`
- Method: `compileLatex`
- Lines: 130-159
- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/LatexCompileServiceImpl.java`
- Methods: `compileToPdf`, `runCompiler`
- Lines: 40-92, 178-231

**Problem:** Arbitrary user-provided LaTeX is executed by a full TeX distribution in the main service container. TeX can consume extreme CPU/memory/disk and, depending on engine configuration, read local files or invoke dangerous features. The code also reads process output synchronously before applying the timeout; if the process never closes stdout, `transferTo()` blocks and the timeout is never reached.

**Impact:** Authenticated attackers can exhaust all compile permits/threads, hang the service indefinitely, or access container-readable data. The test output also shows `pdflatex` running with elevated privileges locally.

**Evidence:** Raw `latexCode` is written and passed directly to `pdflatex`; output is drained at lines 214-217 before `waitFor(timeout)` at line 219.

**Recommended Fix:** Run compilation in an isolated, non-root sandbox/container with no secrets/network, read-only filesystem, CPU/memory/process/file limits, disabled shell escape, and strict source/package controls. Drain output asynchronously with a bounded buffer and enforce timeout before waiting for stream EOF.

## Issue #10

**Severity:** High

**Category:** Security / Availability - Unauthenticated Cost Amplification

**Location:**

- File: `Backend/common-lib/src/main/java/com/Backend/AI_Resume_Builder_Backend/auth/CommonSecurityConfig.java`
- Lines: 41-44
- Endpoints: resume generation, ATS scoring, resume imports

**Problem:** Expensive Gemini and PDF processing endpoints are explicitly public and have no application-level rate limit, quota, CAPTCHA, or abuse control.

**Impact:** Anonymous clients can exhaust Gemini quota, database/storage, CPU, memory, and outbound API capacity, causing direct cost and denial of service.

**Evidence:** `/api/resume/generate`, `/api/resume/ats-score`, and `/api/resume/import/**` are `permitAll`.

**Recommended Fix:** Require authentication for cost-bearing operations or apply strict per-IP/per-account quotas, body limits, concurrency limits, and abuse detection at the gateway.

## Issue #11

**Severity:** High

**Category:** Security / Runtime - Unbounded PDF Upload

**Location:**

- File: `Backend/ats-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/ats/AtsController.java`
- Method: `getAtsScore`
- Lines: 24-43
- File: `Backend/ats-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/ats/AtsScoreServiceImpl.java`
- Method: `extractFromPdf`
- Lines: 459-528

**Problem:** ATS upload checks only `file.isEmpty()`. It does not validate size, MIME signature, page count, encryption, or decompression complexity, then copies the entire file into a byte array and parses it twice.

**Impact:** Large or malicious PDFs can cause heap exhaustion, long CPU stalls, parser exploitation exposure, and doubled memory/CPU use.

**Evidence:** `file.getBytes()` followed by two `PDDocument.load(pdfBytes)` passes.

**Recommended Fix:** Enforce multipart and application size limits, validate PDF magic bytes, cap pages/extracted text, reject encrypted/suspicious documents, parse once where possible, and process in an isolated worker.

## Issue #12

**Severity:** High

**Category:** API Integration / Authentication

**Status:** Resolved on 2026-06-14

**Location:**

- File: `FrontEnd/frontend/src/services/agentApi.js`
- Lines: 1-30

**Problem:** The reviewed revision used `http://localhost:8081/api` and did not attach the JWT.

**Impact:** The previous revision could not call protected agent endpoints through the normal gateway deployment.

**Evidence:** The current client derives its base from the shared `API_BASE_URL`, targets `/agent`, attaches `Authorization: Bearer <token>` in a request interceptor, and handles 401 responses.

**Recommended Fix:** Completed. Add an integration test that verifies the resolved gateway URL and authorization header.

## Issue #13

**Severity:** High

**Category:** API Gateway Routing

**Location:**

- File: `Backend/gateway-service/src/main/resources/application.yml`
- Resume route lines: 28-31
- File: `FrontEnd/frontend/src/components/ResumeSyncEditor.jsx`
- Calls: `/api/resume-sync/**`, `/ws-resume`

**Problem:** The gateway does not route `/api/resume-sync/**` or `/ws-resume`. It instead lists `/ws-sync/**`, which the backend does not expose.

**Impact:** Resume dashboard/synchronization and WebSocket connections fail when accessed through the gateway.

**Recommended Fix:** Add the actual REST and SockJS/WebSocket paths to the resume route and add integration tests through the gateway.

## Issue #14

**Severity:** High

**Category:** Security - WebSocket Authorization / Data Leakage

**Location:**

- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/WebSocketConfig.java`
- Lines: 21-24
- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/ResumeWebSocketController.java`
- Lines: 11-29

**Problem:** WebSocket origins allow `*`; STOMP messages have no authentication/authorization checks; all clients publish and subscribe to global `/topic/resume...` destinations.

**Impact:** A malicious site/client can connect, inject resume updates, and observe other users' resume PII.

**Recommended Fix:** Restrict origins, authenticate the handshake/STOMP CONNECT frame, authorize destinations, and use per-user/per-session queues such as `/user/queue/resume`.

## Issue #15

**Severity:** High

**Category:** Deployment / CI

**Location:**

- File: `Backend/Dockerfile`
- Lines: 5-13, 29-30
- File: `.github/workflows/backend-cd.yml`
- Lines: 34-36, 49-61
- File: `Backend/buildspec.yml`
- Lines: 8-19

**Problem:** The active backend is a multi-module project, but `Backend/Dockerfile` expects a root `.mvn` directory and `src` tree and copies `/app/target/*.jar`; those paths do not represent this repository. `buildspec.yml` also looks for `Backend/target/*.jar`. The Cloud Run workflow skips tests and builds this invalid Dockerfile.

**Impact:** Cloud deployment fails or produces no deployable artifact. A second pipeline can deploy untested code despite the test workflow.

**Recommended Fix:** Choose a supported topology: one image per service, or use the existing all-service image deliberately. Build module JARs in the Docker build, copy explicit artifacts, run tests once as a required dependency, and add an image smoke test.

## Issue #16

**Severity:** High

**Category:** Security - Sensitive Data Retention

**Location:**

- File: `Backend/ats-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/ats/AtsScoreServiceImpl.java`
- Method: `recordAtsCheck`
- Lines: 1046-1094
- File: `Backend/common-lib/src/main/java/com/Backend/AI_Resume_Builder_Backend/ats/AtsCheck.java`
- Fields: `resumeText`, metadata
- File: `back.sql`

**Problem:** Full extracted resume text is persisted for every ATS check, including guest requests. A database dump is tracked in Git. There is no retention/deletion policy or consent boundary evident in code.

**Impact:** The system accumulates names, emails, phone numbers, addresses, employment history, and potentially other sensitive data. A repository/database leak has a much larger privacy impact.

**Evidence:** `check.setResumeText(resumeText)` is unconditional; `back.sql` is a tracked 272 KB artifact.

**Recommended Fix:** Do not persist full guest resume text by default. Minimize/redact/encrypt retained data, define retention and user deletion, audit access, remove dumps from Git history, and rotate/notify if real production data was included.

## Issue #17

**Severity:** Medium

**Category:** Concurrency / Correctness

**Location:**

- File: `Backend/common-lib/src/main/java/com/Backend/AI_Resume_Builder_Backend/admin/SystemStatsService.java`
- Method: `incrementStat`
- Lines: 27-37

**Problem:** Counters use read-modify-save without locking or an atomic database update.

**Impact:** Concurrent PDF/ATS requests lose increments. First-write races can also trigger duplicate-key failures.

**Recommended Fix:** Use a single atomic SQL update/upsert (`value = value + 1`) or optimistic locking with retry.

## Issue #18

**Severity:** Medium

**Category:** Performance / Redis Availability

**Location:**

- File: `Backend/common-lib/src/main/java/com/Backend/AI_Resume_Builder_Backend/common/RedisCacheService.java`
- Methods: `clearUserCaches`, `countKeys`
- Lines: 164-173, 192-207

**Problem:** Production code uses Redis `KEYS`, which scans the complete keyspace and blocks Redis.

**Impact:** Health/admin/cache-clearing operations can cause latency spikes or outages as the keyspace grows.

**Recommended Fix:** Use `SCAN` with bounded batches, maintain counters/index sets, or use versioned namespaces for bulk invalidation.

## Issue #19

**Severity:** Medium

**Category:** API Reliability / Timeout Handling

**Location:**

- File: `Backend/common-lib/src/main/java/com/Backend/AI_Resume_Builder_Backend/common/GeminiService.java`
- Method: constructor, `generateContent`
- Lines: 25-85
- File: `Backend/admin-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/admin/AdminController.java`
- Field: `restClient`
- Line: 63

**Problem:** Outbound HTTP clients have no explicit connection/read timeout. Gemini retries are implemented in request threads with `Thread.sleep`, and retry policy does not distinguish retryable failures.

**Impact:** Network stalls occupy servlet threads indefinitely; bursts can exhaust the pool. Retrying client errors wastes latency/quota.

**Recommended Fix:** Configure connect/read/response deadlines, bounded retry with jitter only for retryable statuses, circuit breaking, and bulkheads. Avoid sleeping servlet threads.

## Issue #20

**Severity:** Medium

**Category:** Runtime / Input Validation

**Location:**

- File: `Backend/agent-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/agent/AgentController.java`
- Methods: `batchImproveBullets`, `generateSummary`, `generateSkills`
- Lines: 108-119, 195-203, 247-256
- File: `Backend/support-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/support/PublicController.java`
- Lines: 23-55

**Problem:** Controllers cast untyped `Map` values directly to `List<String>`, `String`, and `Number`. Malformed JSON produces `ClassCastException`; strings have no length limits; feedback/contact endpoints have no robust email validation or abuse controls.

**Impact:** Invalid clients receive 500 responses, oversized input drives storage/AI cost, and public forms can be spammed.

**Recommended Fix:** Define validated DTOs with Bean Validation, collection element validation, maximum lengths/counts, normalized email validation, and global 400 error mapping.

## Issue #21

**Severity:** Medium

**Category:** Data Integrity / API Semantics

**Location:**

- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/ResumeController.java`
- Method: `getResumeData`
- Lines: 50-114
- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/ResumeServiceImpl.java`
- Method: `generateResumeResponse`
- Lines: 34-67

**Problem:** Service failures are converted into ordinary maps and the controller normally returns HTTP 200, even when Gemini is unavailable or JSON parsing failed. In some failure maps, a resume record can still be saved.

**Impact:** Clients cannot reliably distinguish success from failure; monitoring reports false success; incomplete/null generation records pollute analytics.

**Recommended Fix:** Return typed results or throw domain exceptions mapped to suitable 4xx/5xx statuses. Persist only after validating a complete successful response.

## Issue #22

**Severity:** Medium

**Category:** Security / Information Leakage

**Location:**

- Files: multiple controllers and `GeminiService`
- Examples: `ResumeController` lines 103-114; `LatexController` lines 147-159; `AtsController` lines 38-43; `GeminiService` lines 75-82

**Problem:** Raw exception messages and upstream response bodies are returned to clients or logged. Gemini errors may include request/provider diagnostics; compiler errors expose commands and filesystem paths.

**Impact:** Attackers gain internal paths, dependency behavior, and provider details. Logs may retain sensitive resume/model content.

**Recommended Fix:** Return stable public error codes/messages, log sanitized correlation IDs, and redact upstream bodies, tokens, resume text, and compiler paths.

## Issue #23

**Severity:** Medium

**Category:** Database / Production Configuration

**Location:**

- Files: active service `application.properties`
- Properties: datasource and JPA block, typically lines 47-57

**Problem:** Production defaults use `ddl-auto=update`, `show-sql=true`, formatted SQL, root username, an unencrypted local JDBC URL, and `allowPublicKeyRetrieval=true`.

**Impact:** Automatic schema mutation can damage or lock production tables; SQL logging can expose sensitive content and create high log volume; insecure defaults are easy to deploy accidentally.

**Recommended Fix:** Use Flyway/Liquibase migrations, `ddl-auto=validate`, disable SQL logging, require TLS, use least-privilege database accounts, and keep production settings in a dedicated validated profile.

## Issue #24

**Severity:** Medium

**Category:** Security - CSV Injection

**Location:**

- File: `Backend/admin-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/admin/AdminController.java`
- Methods: `exportResumesCsv`, user export
- Lines: 755-781 and user export section

**Problem:** User-controlled email/name/candidate/template fields are written to CSV without RFC-compliant quoting or spreadsheet-formula neutralization.

**Impact:** Opening an exported CSV in Excel/Sheets can execute formulas such as `=HYPERLINK(...)` or exfiltration payloads under the administrator's account.

**Recommended Fix:** Use a CSV library, quote fields correctly, and prefix cells beginning with `=`, `+`, `-`, or `@` according to the target spreadsheet policy.

## Issue #25

**Severity:** Medium

**Category:** Functional Bug / Health Monitoring

**Location:**

- File: `Backend/admin-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/admin/HealthController.java`
- Method: `fullHealthCheck`
- Lines: 70-102
- File: `Backend/admin-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/admin/AdminController.java`
- Field: `restClient`
- Line: 63

**Problem:** Health reports hardcode database and AI service as `UP`, and admin service-to-service calls use localhost, which fails in containers.

**Impact:** Monitoring can report healthy while critical dependencies are down; admin system health incorrectly marks the resume service unavailable in Compose.

**Recommended Fix:** Use real bounded dependency checks and container/service-discovery URLs. Return degraded/down status and appropriate health HTTP codes.

## Issue #26

**Severity:** Medium

**Category:** Privacy / Third-Party Data Transfer

**Location:**

- Files: `FrontEnd/frontend/src/context/ResumeContext.jsx`, `pages/EditResume.jsx`, `components/LatexEditor.jsx`
- External endpoint: `https://latex.ytotech.com/builds/sync`

**Problem:** Resume LaTeX, which contains personal data, can be sent to a third-party compilation service. Consent handling is localStorage-based and duplicated; the privacy/security boundary is not enforced server-side.

**Impact:** Sensitive resume data leaves the application's controlled infrastructure, creating privacy, retention, and availability dependencies.

**Recommended Fix:** Prefer the isolated first-party compiler. If external compilation remains, provide explicit informed consent per policy/version, document the processor, enforce data minimization, and avoid silent fallback.

## Issue #27

**Severity:** Medium

**Category:** Maintainability / Functional Divergence

**Location:**

- Files: `FrontEnd/frontend/src/context/ResumeContext.jsx` and `FrontEnd/frontend/src/pages/EditResume.jsx`
- Files: active microservices and `Backend/monolith-src-backup`

**Problem:** Large blocks of resume parsing/compilation state logic and nearly the entire backend implementation are duplicated.

**Impact:** Fixes can land in one copy and not another, as already indicated by mismatched routing/deployment assumptions. This substantially increases regression risk.

**Recommended Fix:** Delete/archive the monolith backup outside deployable source, extract shared frontend logic into tested hooks/services, and establish one authoritative implementation.

## Issue #28

**Severity:** Low

**Category:** Correctness / Character Encoding

**Location:**

- File: `Backend/common-lib/src/main/java/com/Backend/AI_Resume_Builder_Backend/auth/JwtUtil.java`
- Method: `getSigningKey`
- Line: 22

**Problem:** The signing secret uses the platform-default charset.

**Impact:** A non-ASCII secret can produce different key bytes across environments and invalidate tokens.

**Recommended Fix:** Use `secret.getBytes(StandardCharsets.UTF_8)` or a Base64-decoded key with an explicit format.

## Issue #29

**Severity:** Low

**Category:** API Correctness

**Location:**

- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/LatexController.java`
- Method: `generateLatexCode`
- Lines: 47-55

**Problem:** The endpoint accepts both `ats` and `minimal`, but the validation message says only `ats` is allowed. The request default is `professional`, which is immediately rejected.

**Impact:** Omitting `templateType` causes a 400 despite a documented default, and clients receive misleading validation guidance.

**Recommended Fix:** Use a validated enum and make the default one of the accepted values.

## Issue #30

**Severity:** Low

**Category:** Testing / CI Quality Gate

**Location:**

- File: `Backend/resume-service/src/test/java/com/Backend/AI_Resume_Builder_Backend/resume/ResumeApplicationTests.java`
- Entire backend/frontend test tree
- Frontend ESLint configuration and current output

**Problem:** Only two backend tests exist, both in resume-service and focused on context/LaTeX happy paths. Eight modules have no tests. There are no frontend tests. ESLint currently reports 33 errors and 3 warnings, and frontend checks are absent from CI. The new errors include an undefined `loadUserPreferences` retry handler in `AgentChat`, which will throw a `ReferenceError` when preference loading fails and the user clicks Retry.

**Impact:** Authorization, concurrency, routing, malformed input, provider failures, migrations, and frontend workflows can regress undetected. Current CI's green backend result gives false confidence.

**Recommended Fix:** Add security integration tests, ownership tests, concurrent sync/counter tests, gateway route tests, upload limits, provider timeout/failure tests, repository tests against MySQL, and frontend component/e2e tests. Make backend tests, frontend lint, frontend tests, and production build required checks.

## Issue #31

**Severity:** Medium

**Category:** Security / Information Disclosure / Resource Abuse

**Location:**

- File: `Backend/common-lib/src/main/java/com/Backend/AI_Resume_Builder_Backend/auth/CommonSecurityConfig.java`
- Class: `CommonSecurityConfig`
- Method: `filterChain`
- Lines: 45-46
- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/LatexController.java`
- Class: `LatexController`
- Methods: `health`, `queueStatus`
- Lines: 166-187
- File: `Backend/resume-service/src/main/java/com/Backend/AI_Resume_Builder_Backend/resume/LatexCompileServiceImpl.java`
- Class: `LatexCompileServiceImpl`
- Method: `getCompilerStatus`
- Lines: 103-173

**Problem:** The uncommitted security change makes `/api/latex/health` and `/api/latex/queue` anonymous. The health operation is not a lightweight readiness check: each request creates temporary files, starts compiler `--version` subprocesses, and returns the configured executable path, generated command lines, compiler output/version, and raw exception messages. The queue endpoint exposes current compile capacity and usage.

**Impact:** Anonymous callers can fingerprint the host and compiler installation, obtain internal filesystem and error details, monitor workload, and repeatedly create processes and temporary files. Under load, this can consume process, CPU, disk, and I/O capacity without authentication.

**Evidence:** `CommonSecurityConfig` adds both paths to `permitAll()`. `getCompilerStatus()` returns `configuredPath`, candidate command strings, output/errors, and invokes `new ProcessBuilder(executable, "--version").start()` for each candidate.

**Recommended Fix:** Keep detailed diagnostics and queue state authenticated and admin-only or available solely on an internal management port/network. Expose a separate cached readiness endpoint that returns only a boolean/status code and never launches a subprocess per request. Add rate limiting and redact paths, commands, compiler output, and raw exception messages.

**Example Fix:**

```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/diagnostics")
public Map<String, Object> diagnostics() {
    return latexCompileService.getCompilerStatus();
}
```

## Verification Results

| Command | Result |
|---|---|
| `Backend\mvnw.cmd test` | Passed; 2 tests total, all in resume-service |
| `npm run lint` | Failed; 33 errors and 3 warnings |
| `npm run build` | Passed; 1,527 modules transformed |

## Finding Summary

| Severity | Open | Resolved | Historical Total |
|---|---:|---:|---:|
| Critical | 4 | 1 | 5 |
| High | 10 | 1 | 11 |
| Medium | 12 | 0 | 12 |
| Low | 3 | 0 | 3 |
| **Total** | **29** | **2** | **31** |

## Top 10 Priority Fixes

1. Remove unsanitized `dangerouslySetInnerHTML` and address JWT storage/CSP.
2. Enforce authenticated ownership for every agent preference/conversation operation.
3. Replace global resume sync/history with per-user/per-session atomic state and private WebSocket destinations.
4. Remove the fallback JWT secret and rotate potentially affected deployments.
5. Sandbox LaTeX compilation with hard resource/security limits and correct timeout handling.
6. Fix gateway service discovery and missing sync/WebSocket routes.
7. Protect/rate-limit Gemini/PDF endpoints and enforce strict upload limits.
8. Revoke anonymous access to detailed LaTeX diagnostics and replace it with a minimal cached readiness check.
9. Repair the multi-module Docker/Cloud Run pipeline and require tests before deployment.
10. Fix the frontend runtime/lint failures and add authorization, concurrency, gateway, and end-to-end tests.

## Production Readiness Assessment

**Overall status: Not production-ready.**

The current system has multiple independent paths to data exposure and account compromise: stored XSS, caller-controlled object ownership, global cross-user resume state, unauthenticated global WebSockets, and a known fallback JWT secret. The documented container topology still cannot route requests, and the Cloud Run image definition does not match the multi-module repository. The frontend production build now succeeds, but lint has worsened to 33 errors and includes a user-triggerable undefined function. Expensive public AI/PDF endpoints, newly anonymous compiler diagnostics, and unsandboxed LaTeX compilation create serious cost and availability exposure.

Before deployment, the critical/high findings should be resolved and covered by integration tests. In particular, identity must come from the verified principal at every service boundary, all user state must be partitioned, compilation/uploads must be isolated and bounded, and one deployable topology must be proven through an end-to-end smoke test.

## File Coverage

### Reviewed With Findings

- All active backend Java source under `Backend/*-service/src` and `Backend/common-lib/src`
- All active service properties and gateway YAML
- All Maven POMs
- All Dockerfiles, Compose, startup scripts, buildspec, and GitHub workflows
- All frontend JS/JSX, build configuration, package manifests, and route/API code
- SQL/database helper files and tracked `back.sql`
- Existing tests and test properties
- `Backend/monolith-src-backup` as a duplicate implementation set
- Commit `408ae7c9` and current uncommitted changes in `CommonSecurityConfig.java` and gateway `application.yml`

### Reviewed; No Additional Significant Defects Detected

The following files were reviewed and did not add a distinct production-grade issue beyond the cross-cutting findings above:

- Application bootstrap classes (`*Application.java`) apart from duplicated ad-hoc `.env` loading/maintenance risk
- DTO/interface-only files: `AgentChatRequest`, `AgentChatResponse`, `AtsScoreRequest`, `AtsScoreService`, `ResumeRequest`, `ResumeService`, `LatexService`, `LatexCompileService`
- Straightforward JPA entities/repositories not named in a finding, including feedback/contact/audit/stat entities
- Static informational React pages and simple presentational form components
- CSS files, SEO metadata, robots/sitemap/ads files
- LaTeX template resources and prompt text files, apart from the trust-boundary/prompt-injection and compiler risks already reported
- Wrapper scripts and binary/static assets, where no executable first-party logic was present

Generated/vendor files (`node_modules`, Maven output), compiled classes, screenshots, and PDFs were excluded from semantic source review.
