/**
 * Validation utilities
 */

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePassword(password) {
  // At least 8 characters
  return password.length >= 8;
}

export function validateName(name) {
  // At least 2 characters, only letters and spaces
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
  return regex.test(name);
}

export function validateDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

export function validateBirthdate(birthdate) {
  const birth = new Date(birthdate);
  const today = new Date();
  
  // Must be in the past
  if (birth >= today) return false;
  
  // Must be reasonable (not more than 150 years ago)
  const age = today.getFullYear() - birth.getFullYear();
  return age >= 0 && age <= 150;
}

export function validatePhone(phone) {
  // Simple phone validation (can be extended)
  const regex = /^[\d\s\-\+\(\)]{8,}$/;
  return regex.test(phone);
}

export function validateRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

export function validateNumber(value, min = null, max = null) {
  const num = Number(value);
  
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  
  return true;
}

export function validateScore(score) {
  return validateNumber(score, 0, 10);
}

export function validateFileType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file, maxSizeBytes) {
  return file.size <= maxSizeBytes;
}
