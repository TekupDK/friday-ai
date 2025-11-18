/**
 * Template Interpolation Utilities
 * 
 * Interpolates {{variable}} placeholders in strings with actual values
 */

/**
 * Interpolate template string with variables
 * 
 * @example
 * interpolateTemplate("Hello {{name}}", { name: "World" })
 * // Returns: "Hello World"
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, any>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      return match; // Keep placeholder if value not found
    }
    return String(value);
  });
}

/**
 * Interpolate template object recursively
 */
export function interpolateTemplateObject(
  template: any,
  variables: Record<string, any>
): any {
  if (typeof template === "string") {
    return interpolateTemplate(template, variables);
  }
  
  if (Array.isArray(template)) {
    return template.map(item => interpolateTemplateObject(item, variables));
  }
  
  if (template && typeof template === "object") {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(template)) {
      result[key] = interpolateTemplateObject(value, variables);
    }
    return result;
  }
  
  return template;
}

