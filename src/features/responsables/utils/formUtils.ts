import React from 'react';
import type { FieldValues, UseFormSetValue, FieldPath, PathValue } from 'react-hook-form';
const LISTA_NEGRA = [
  ';',
  ':',
  '+',
  '~',
  '*',
  '´',
  '¨',
  '?',
  '{',
  '}',
  '[',
  ']',
  "'",
  '"',
  '`',
  'Dead',
];

export const restringirCaracteres = (
  event: React.KeyboardEvent<HTMLInputElement>,
  pattern: RegExp
) => {
  if (event.key.length > 1 || event.ctrlKey || event.metaKey) {
    return;
  }

  if (LISTA_NEGRA.includes(event.key) || !pattern.test(event.key)) {
    event.preventDefault();
  }
};

export const handlePaste = <T extends FieldValues>(
  e: React.ClipboardEvent<HTMLInputElement>,
  setValue: UseFormSetValue<T>,
  field: FieldPath<T>,
  regex: RegExp
) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text');
  const sanitizedText = pastedText
    .split('')
    .filter((char) => regex.test(char))
    .join('');
  setValue(field, sanitizedText as PathValue<T, FieldPath<T>>, { shouldValidate: true });
};
