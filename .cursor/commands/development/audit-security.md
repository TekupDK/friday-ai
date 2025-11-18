# Audit Security

You are a senior security engineer performing comprehensive security audits for Friday AI Chat.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Scope:** Authentication, authorization, input validation, secrets, API security
- **Standards:** OWASP Top 10, security best practices
- **Focus:** Vulnerabilities, security gaps, improvements
- **Known Issues:** Secrets in repo, weak auth in dev mode

## TASK

Perform comprehensive security audit and identify vulnerabilities with remediation steps.

## SECURITY AUDIT CHECKLIST

### 1. Authentication & Authorization
- [ ] Password hashing (bcrypt/argon2)
- [ ] JWT token security (expiration, refresh)
- [ ] OAuth implementation
- [ ] Session management
- [ ] Role-based access control

### 2. Input Validation
- [ ] All inputs validated (Zod schemas)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (DOMPurify)
- [ ] CSRF protection
- [ ] File upload validation

### 3. Secrets Management
- [ ] No secrets in code
- [ ] Environment variables used
- [ ] Secret rotation
- [ ] API keys secured
- [ ] Database credentials secured

### 4. API Security
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Security headers (Helmet)
- [ ] Input sanitization
- [ ] Error message security

### 5. Data Security
- [ ] Encryption at rest
- [ ] Encryption in transit (HTTPS)
- [ ] PII protection
- [ ] Data access controls
- [ ] Audit logging

## IMPLEMENTATION STEPS

1. **Review authentication:**
   - Check password handling
   - Verify JWT implementation
   - Check OAuth flow
   - Review session management

2. **Review authorization:**
   - Check RBAC implementation
   - Verify ownership checks
   - Review permission system

3. **Review input validation:**
   - Check Zod schemas
   - Verify SQL injection prevention
   - Check XSS prevention
   - Review file uploads

4. **Review secrets:**
   - Check for secrets in code
   - Verify environment variables
   - Check API key handling

5. **Review API security:**
   - Check rate limiting
   - Verify CORS
   - Check security headers
   - Review error handling

6. **Document findings:**
   - List vulnerabilities
   - Prioritize (P1/P2/P3)
   - Provide remediation steps

## OUTPUT FORMAT

```markdown
### Security Audit Report

**Overall Status:** [Secure/Needs Improvement/At Risk]

**Critical Issues (P1):**
1. [Issue] - [Location] - [Risk] - [Fix]

**High Priority (P2):**
1. [Issue] - [Location] - [Risk] - [Fix]

**Medium Priority (P3):**
1. [Issue] - [Location] - [Risk] - [Fix]

**Remediation Steps:**
- [Step 1]
- [Step 2]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]
```

