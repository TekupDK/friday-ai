# Extend Existing Feature

You are extending an existing feature without breaking it.

## TASK

Add new behavior or options to a feature while maintaining backward compatibility.

## STEPS

1. Understand current behavior and consumers.
2. Identify exactly what needs to change or be added.
3. Prefer additive changes over breaking ones:
   - New optional fields
   - New flags
   - New routes/procedures instead of changing old ones
4. Update docs and tests to reflect the new behavior.

## OUTPUT

Return:

- Description of changes
- Compatibility notes
- Tests and docs updated.
