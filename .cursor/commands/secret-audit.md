# Secret Audit

You are auditing for secrets and sensitive data.

## TASK

Ensure no secrets or sensitive tokens are checked into code or logged incorrectly.

## STEPS

1) Search for:
   - API keys
   - Tokens
   - Passwords
   - Private keys
2) Inspect config files and environment variable usage.
3) Check logs for sensitive information leaks.

## OUTPUT

Provide:
- Any hard-coded secrets found
- Risk assessment
- Recommended remediation steps (rotation, removal, masking).

