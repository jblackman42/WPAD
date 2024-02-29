import React, { useState, useEffect } from 'react';

const PhoneNumberInput = ({ placeholder = '', required = false, value = '', ...rest }) => {
  // Manage the input value state
  const [inputValue, setInputValue] = useState(value);

  // Effect to update state when prop `value` changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Format the phone number
  const formatPhoneNumber = (value) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue.length <= 3) {
      return numericValue;
    } else if (numericValue.length <= 6) {
      return `${numericValue.slice(0, 3)}-${numericValue.slice(3)}`;
    } else {
      return `${numericValue.slice(0, 3)}-${numericValue.slice(3, 6)}-${numericValue.slice(6, 10)}`;
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setInputValue(formattedValue);
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      required={required}
      value={inputValue}
      onChange={handleChange}
      {...rest} // Spread the rest of the props to the input element
    />
  );
};

export default PhoneNumberInput;