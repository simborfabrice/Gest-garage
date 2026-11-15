import React, { useState, useEffect } from 'react';
import { roundCentimes } from '../services/storage';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  title?: string;
  allowEmptyZero?: boolean;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '0.00',
  disabled = false,
  required = false,
  min = 0,
  max,
  title,
  allowEmptyZero = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState<string>('');

  const safeValue = roundCentimes(Number.isFinite(value) ? value : 0);

  useEffect(() => {
    if (!isFocused) {
      setDraft(allowEmptyZero && safeValue === 0 ? '' : safeValue.toFixed(2));
    }
  }, [safeValue, isFocused, allowEmptyZero]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    const initial = safeValue === 0 ? '' : safeValue.toFixed(2);
    setDraft(initial);
    // Select text after state update so user can overwrite easily
    requestAnimationFrame(() => {
      e.target.select();
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '.');

    if (raw === '') {
      setDraft('');
      onChange(0);
      return;
    }

    // Keep only digits and a single decimal point, with at most 2 digits after the decimal point
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    let normalized = parts[0];
    if (parts.length > 1) {
      normalized += '.' + parts.slice(1).join('').slice(0, 2);
    }

    setDraft(normalized);

    const parsed = parseFloat(normalized);
    if (!Number.isNaN(parsed)) {
      let clamped = roundCentimes(parsed);
      if (max !== undefined && clamped > max) clamped = max;
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = draft === '' ? 0 : parseFloat(draft);
    let finalVal = Number.isNaN(parsed) ? 0 : roundCentimes(parsed);
    if (min !== undefined && finalVal < min) finalVal = min;
    if (max !== undefined && finalVal > max) finalVal = max;
    onChange(finalVal);
    setDraft(allowEmptyZero && finalVal === 0 ? '' : finalVal.toFixed(2));
  };

  const displayValue = isFocused
    ? draft
    : allowEmptyZero && safeValue === 0
      ? ''
      : safeValue.toFixed(2);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      title={title}
      className={className}
    />
  );
};
