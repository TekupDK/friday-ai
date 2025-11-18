# Security Scan

You are acting as a security reviewer.

## TASK

Scan the relevant code for common security issues.

## STEPS

1) Look for:
   - Injection risks (SQL, command, template)
   - Insecure auth or session handling
   - Hard-coded secrets
   - Insecure random or crypto usage
2) Pay attention to:
   - Input validation
   - Output encoding
   - Logging of sensitive data

## OUTPUT

Return:
- Issues found
- Risk level per issue
- Remediation suggestions.

