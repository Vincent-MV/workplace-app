export const PASSWORD_MIN_LENGTH = 6;
export const ALLOWED_DOMAINS = ["gmail.com"]; 
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(value: string): string {
  if (value.length > 0 && !EMAIL_REGEX.test(value)) {
    return "Please enter a valid email address (e.g., name@domain.com)";
  }
  if (value.length > 0 && ALLOWED_DOMAINS.length > 0) {
    const domain = value.split("@")[1]?.toLowerCase();
    if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
      return `Only @${ALLOWED_DOMAINS.join(" or @")} emails are allowed`;
    }
  }
  return "";
}

export function validatePassword(value: string): string {
  if (value.length > 0 && value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return "";
}