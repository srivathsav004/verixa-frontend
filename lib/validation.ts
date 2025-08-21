// Validation rules for registration forms
export const validationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  walletAddress: /^0x[a-fA-F0-9]{40}$/,
  licenseNumber: /^[A-Z0-9]{6,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  postalCode: /^[A-Z0-9\s-]{3,10}$/,
  website: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  idNumber: /^[A-Z0-9]{8,20}$/,
  organizationName: /^[A-Za-z0-9\s&.-]{2,100}$/,
  personName: /^[A-Za-z\s]{2,50}$/,
  streetAddress: /^[A-Za-z0-9\s,.-]{5,100}$/,
  city: /^[A-Za-z\s]{2,50}$/,
  state: /^[A-Za-z\s]{2,50}$/,
  country: /^[A-Za-z\s]{2,50}$/,
  year: /^(19|20)\d{2}$/,
  percentage: /^(100|[1-9]?\d(\.\d{1,2})?)$/,
  number: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/
};

export const validationMessages = {
  required: "This field is required",
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number with country code",
  walletAddress: "Please enter a valid wallet address",
  licenseNumber: "License number must be 6-20 characters (letters and numbers only)",
  password: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
  postalCode: "Please enter a valid postal code",
  website: "Please enter a valid website URL",
  idNumber: "ID number must be 8-20 characters (letters and numbers only)",
  organizationName: "Organization name must be 2-100 characters",
  personName: "Name must be 2-50 characters (letters only)",
  streetAddress: "Address must be 5-100 characters",
  city: "City must be 2-50 characters (letters only)",
  state: "State must be 2-50 characters (letters only)",
  country: "Country must be 2-50 characters (letters only)",
  year: "Please enter a valid year between 1900-2099",
  percentage: "Please enter a valid percentage (0-100)",
  number: "Please enter a valid number",
  decimal: "Please enter a valid decimal number"
};

export const validateField = (value: string, rule: keyof typeof validationRules, required: boolean = true): string | null => {
  if (required && (!value || value.trim() === '')) {
    return validationMessages.required;
  }
  
  if (value && !validationRules[rule].test(value)) {
    return validationMessages[rule];
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return validationMessages.required;
  if (!validationRules.password.test(password)) return validationMessages.password;
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return validationMessages.required;
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}; 