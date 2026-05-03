/**
 * Frontend validation schemas aligned with backend Zod schemas
 * These provide runtime validation for form inputs and API requests
 */

export type ValidationRule<T> = (value: T) => string | true;

export class ValidationSchema<T extends Record<string, unknown>> {
  private rules: Map<keyof T, ValidationRule<unknown>[]> = new Map();

  addRule<K extends keyof T>(field: K, rule: ValidationRule<T[K]>): this {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    this.rules.get(field)!.push(rule as ValidationRule<unknown>);
    return this;
  }

  validate(data: Partial<T>): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const [field, fieldRules] of this.rules) {
      const value = data[field];
      for (const rule of fieldRules) {
        const result = rule(value);
        if (result !== true) {
          errors[String(field)] = result;
          break; // Stop at first error for this field
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

// Common validation rules
export const CommonValidations = {
  required: (fieldName: string): ValidationRule<unknown> => {
    return (value) => {
      if (value === undefined || value === null || value === "") {
        return `${fieldName} is required`;
      }
      return true;
    };
  },

  minLength: (min: number, fieldName: string): ValidationRule<string> => {
    return (value) => {
      if (typeof value === "string" && value.length < min) {
        return `${fieldName} must be at least ${min} characters`;
      }
      return true;
    };
  },

  maxLength: (max: number, fieldName: string): ValidationRule<string> => {
    return (value) => {
      if (typeof value === "string" && value.length > max) {
        return `${fieldName} must not exceed ${max} characters`;
      }
      return true;
    };
  },

  email: (fieldName = "Email"): ValidationRule<string> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (value) => {
      if (typeof value === "string" && value && !emailRegex.test(value)) {
        return `${fieldName} is invalid`;
      }
      return true;
    };
  },

  min: (min: number, fieldName: string): ValidationRule<number> => {
    return (value) => {
      if (typeof value === "number" && value < min) {
        return `${fieldName} must be at least ${min}`;
      }
      return true;
    };
  },

  max: (max: number, fieldName: string): ValidationRule<number> => {
    return (value) => {
      if (typeof value === "number" && value > max) {
        return `${fieldName} must not exceed ${max}`;
      }
      return true;
    };
  },

  pattern: (regex: RegExp, fieldName: string): ValidationRule<string> => {
    return (value) => {
      if (typeof value === "string" && value && !regex.test(value)) {
        return `${fieldName} has invalid format`;
      }
      return true;
    };
  },

  enum: (values: unknown[], fieldName: string): ValidationRule<unknown> => {
    return (value) => {
      if (value !== undefined && value !== null && !values.includes(value)) {
        return `${fieldName} must be one of: ${values.join(", ")}`;
      }
      return true;
    };
  },
};

// Subject validation schema
export const subjectValidationSchema = new ValidationSchema<{
  title: string;
  code: number;
  creditHour: number;
  type?: string;
}>()
  .addRule("title", CommonValidations.required("Subject title"))
  .addRule("title", CommonValidations.minLength(2, "Subject title"))
  .addRule("title", CommonValidations.maxLength(100, "Subject title"))
  .addRule("code", CommonValidations.required("Subject code"))
  .addRule("code", CommonValidations.min(1, "Subject code"))
  .addRule("creditHour", CommonValidations.required("Credit hour"))
  .addRule("creditHour", CommonValidations.min(0, "Credit hour"))
  .addRule("creditHour", CommonValidations.max(10, "Credit hour"));

// Instructor validation schema
export const instructorValidationSchema = new ValidationSchema<{
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}>()
  .addRule("firstName", CommonValidations.required("First name"))
  .addRule("firstName", CommonValidations.minLength(2, "First name"))
  .addRule("lastName", CommonValidations.required("Last name"))
  .addRule("lastName", CommonValidations.minLength(2, "Last name"))
  .addRule("email", CommonValidations.required("Email"))
  .addRule("email", CommonValidations.email("Email"));

// Student validation schema
export const studentValidationSchema = new ValidationSchema<{
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
}>()
  .addRule("firstName", CommonValidations.required("First name"))
  .addRule("firstName", CommonValidations.minLength(2, "First name"))
  .addRule("lastName", CommonValidations.required("Last name"))
  .addRule("lastName", CommonValidations.minLength(2, "Last name"))
  .addRule("email", CommonValidations.required("Email"))
  .addRule("email", CommonValidations.email("Email"))
  .addRule("studentId", CommonValidations.required("Student ID"))
  .addRule("studentId", CommonValidations.minLength(3, "Student ID"));

// Notice validation schema
export const noticeValidationSchema = new ValidationSchema<{
  title: string;
  content: string;
  category?: string;
  priority?: string;
}>()
  .addRule("title", CommonValidations.required("Title"))
  .addRule("title", CommonValidations.minLength(3, "Title"))
  .addRule("title", CommonValidations.maxLength(200, "Title"))
  .addRule("content", CommonValidations.required("Content"))
  .addRule("content", CommonValidations.minLength(10, "Content"));

// Period config validation schema
export const periodConfigValidationSchema = new ValidationSchema<{
  label: string;
  effectiveFrom: string;
}>()
  .addRule("label", CommonValidations.required("Label"))
  .addRule("label", CommonValidations.minLength(2, "Label"))
  .addRule("effectiveFrom", CommonValidations.required("Effective from date"));

export function getValidationSchema<T extends Record<string, unknown>>(
  entityType: string
): ValidationSchema<T> {
  switch (entityType) {
    case "subject":
      return subjectValidationSchema as unknown as ValidationSchema<T>;
    case "instructor":
      return instructorValidationSchema as unknown as ValidationSchema<T>;
    case "student":
      return studentValidationSchema as unknown as ValidationSchema<T>;
    case "notice":
      return noticeValidationSchema as unknown as ValidationSchema<T>;
    case "periodConfig":
      return periodConfigValidationSchema as unknown as ValidationSchema<T>;
    default:
      return new ValidationSchema<T>();
  }
}
