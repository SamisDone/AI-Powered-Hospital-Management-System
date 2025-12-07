// Form validation utilities

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/;
  if (!re.test(phone) || phone.replace(/\D/g, '').length < 10) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }
  return { valid: true };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = formData[field];
    
    if (rule.required && !validateRequired(value, field).valid) {
      errors[field] = validateRequired(value, field).error;
      return;
    }
    
    if (value && rule.email && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address';
      return;
    }
    
    if (value && rule.password) {
      const passwordCheck = validatePassword(value);
      if (!passwordCheck.valid) {
        errors[field] = passwordCheck.error;
        return;
      }
    }
    
    if (value && rule.phone) {
      const phoneCheck = validatePhone(value);
      if (!phoneCheck.valid) {
        errors[field] = phoneCheck.error;
        return;
      }
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `Must be at least ${rule.minLength} characters`;
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

