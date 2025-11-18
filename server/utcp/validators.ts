/**
 * UTCP Schema Validation
 *
 * Validates tool inputs against JSON Schema using Ajv
 */

import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export interface ValidationResult {
  valid: boolean;
  data?: any;
  error?: string;
}

/**
 * Validate UTCP input against schema
 */
export function validateUTCPInput(
  schema: any,
  data: Record<string, any>
): ValidationResult {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = validate.errors
        ?.map(e => {
          const path = e.instancePath || e.schemaPath;
          return `${path}: ${e.message}`;
        })
        .join(", ");

      return {
        valid: false,
        error: errors || "Validation failed",
      };
    }

    return {
      valid: true,
      data,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Validation error",
    };
  }
}
