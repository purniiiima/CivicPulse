/**
 * Validation utilities for CivicPulse (India-focused)
 */

export interface ValidationResult {
  valid: boolean;
  isValid?: boolean;
  error?: string;
  message?: string;
}

const makeResult = (valid: boolean, error?: string): ValidationResult => ({
  valid,
  isValid: valid,
  error,
  message: error,
});

/**
 * Trims leading and trailing whitespace safely
 */
export const trimString = (val?: string | null): string => {
  return typeof val === 'string' ? val.trim() : '';
};

/**
 * Full Name Validation:
 * - Required
 * - Length between 2 and 60 characters
 * - No numbers
 * - No random special symbols (allows letters, spaces, hyphens, apostrophes, periods)
 * - Must contain at least 2 alphabetic characters
 */
export const validateFullName = (name: string): ValidationResult => {
  const trimmed = trimString(name);
  if (!trimmed) {
    return makeResult(false, 'Full name is required.');
  }

  if (trimmed.length < 2) {
    return makeResult(false, 'Full name must be at least 2 characters long.');
  }

  if (trimmed.length > 60) {
    return makeResult(false, 'Full name must not exceed 60 characters.');
  }

  // Check for digits
  if (/\d/.test(trimmed)) {
    return makeResult(false, 'Please enter a valid full name. Numbers are not allowed.');
  }

  // Valid characters: letters, spaces, hyphens, apostrophes, dots
  const validCharsRegex = /^[a-zA-Z\u00C0-\u024F\s'.-]+$/;
  if (!validCharsRegex.test(trimmed)) {
    return makeResult(false, 'Please enter a valid full name.');
  }

  // Count alphabetic characters
  const alphaMatch = trimmed.match(/[a-zA-Z\u00C0-\u024F]/g);
  if (!alphaMatch || alphaMatch.length < 2) {
    return makeResult(false, 'Please enter a valid full name.');
  }

  return makeResult(true);
};

/**
 * Email Address Validation:
 * - Standard RFC-compliant email pattern
 * - Normalized to lowercase and trimmed
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmed = trimString(email).toLowerCase();
  if (!trimmed) {
    return makeResult(false, 'Email address is required.');
  }

  // Strict email regex rejecting double @, spaces, missing domain TLD
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed) || trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return makeResult(false, 'Enter a valid email address.');
  }

  return makeResult(true);
};

/**
 * Indian Mobile Phone Number Validation:
 * - Exactly 10 digits
 * - First digit must be 6, 7, 8, or 9
 * - Handles optional +91 prefix
 * - If required === false and empty, returns valid
 */
export const validateIndianPhone = (phone?: string | null, required = true): ValidationResult => {
  const raw = trimString(phone);
  if (!raw) {
    if (required) {
      return makeResult(false, 'Phone number is required.');
    }
    return makeResult(true);
  }

  // Extract digits only
  let digits = raw.replace(/\D/g, '');

  // If user entered +91 or 91 with 12 digits, strip country code
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.substring(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  if (digits.length !== 10) {
    return makeResult(false, 'Enter a valid 10-digit Indian mobile number.');
  }

  // Must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(digits)) {
    return makeResult(false, 'Indian mobile numbers must start with 6, 7, 8, or 9.');
  }

  return makeResult(true);
};

/**
 * Normalizes Indian phone number to format: +919876543210 (or 10 digits)
 */
export const normalizeIndianPhone = (phone?: string | null): string => {
  const raw = trimString(phone);
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.substring(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }
  return raw;
};

/**
 * Password Strength & Format Validation:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return makeResult(false, 'Password is required.');
  }

  if (password.length < 8) {
    return makeResult(
      false,
      'Password must contain at least 8 characters, including uppercase, lowercase, and a number.'
    );
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber) {
    return makeResult(
      false,
      'Password must contain at least 8 characters, including uppercase, lowercase, and a number.'
    );
  }

  return makeResult(true);
};

/**
 * Confirm Password Validation
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return makeResult(false, 'Please confirm your password.');
  }
  if (password !== confirmPassword) {
    return makeResult(false, 'Passwords do not match.');
  }
  return makeResult(true);
};

/**
 * Indian Pincode Validation:
 * - Exactly 6 digits
 * - First digit cannot be 0 (1-9)
 * - No alphabetic or special characters
 */
export const validateIndianPincode = (pincode: string): ValidationResult => {
  const trimmed = trimString(pincode);
  if (!trimmed) {
    return makeResult(false, 'Pincode is required.');
  }

  // Exactly 6 digits, first digit 1-9
  const pincodeRegex = /^[1-9]\d{5}$/;
  if (!pincodeRegex.test(trimmed)) {
    return makeResult(false, 'Enter a valid 6-digit Indian PIN code.');
  }

  return makeResult(true);
};

/**
 * Report Title Validation
 */
export const validateReportTitle = (title: string): ValidationResult => {
  const trimmed = trimString(title);
  if (!trimmed) {
    return { valid: false, error: 'Issue title is required.' };
  }
  if (trimmed.length < 5) {
    return { valid: false, error: 'Please enter a descriptive title (at least 5 characters).' };
  }
  if (trimmed.length > 150) {
    return { valid: false, error: 'Title cannot exceed 150 characters.' };
  }
  return { valid: true };
};

/**
 * Report Description Validation
 */
export const validateReportDescription = (description: string): ValidationResult => {
  const trimmed = trimString(description);
  if (!trimmed) {
    return { valid: false, error: 'Issue description is required.' };
  }
  if (trimmed.length < 10) {
    return { valid: false, error: 'Please provide a detailed description (at least 10 characters).' };
  }
  return { valid: true };
};
