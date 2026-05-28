'use client';

import { useState, useCallback } from 'react';

export function useForm(initialValues, validationSchema = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Handle input blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur if validation schema exists
    if (validationSchema && validationSchema[name]) {
      const error = validationSchema[name](values[name]);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }
  }, [values, validationSchema]);

  // Handle form reset
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set specific value
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set multiple values
  const setValuesBulk = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    if (!validationSchema) return true;

    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
      const error = validationSchema[field](values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationSchema]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    // Mark all fields as touched
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    // Validate form
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    resetForm,
    setValue,
    setValuesBulk,
    validateForm,
    handleSubmit
  };
}
