interface PasswordOptions {
  /** Longitud deseada de la contraseña. */
  length: number;
  /** Incluir caracteres en minúscula. */
  useLowercase?: boolean;
  /** Incluir caracteres en mayúscula. */
  useUppercase?: boolean;
  /** Incluir números. */
  useNumbers?: boolean;
  /** Incluir un conjunto de símbolos comunes. */
  useSymbols?: boolean;
}

const CHAR_SETS = {
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export function generarPasswordUnica(options: PasswordOptions): string {
  const {
    length,
    useLowercase = true,
    useUppercase = true,
    useNumbers = true,
    useSymbols = true,
  } = options;

  if (length <= 0) {
    throw new Error('La longitud de la contraseña debe ser mayor a 0.');
  }

  let charPool = '';
  if (useLowercase) charPool += CHAR_SETS.LOWERCASE;
  if (useUppercase) charPool += CHAR_SETS.UPPERCASE;
  if (useNumbers) charPool += CHAR_SETS.NUMBERS;
  if (useSymbols) charPool += CHAR_SETS.SYMBOLS;

  if (charPool === '') {
    console.warn(
      'Todas las opciones de caracteres estaban deshabilitadas. Usando pool por defecto (minúsculas y números).'
    );
    charPool = CHAR_SETS.LOWERCASE + CHAR_SETS.NUMBERS;
  }
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  let password = '';
  const poolSize = charPool.length;

  for (let i = 0; i < length; i++) {
    const charIndex = randomValues[i] % poolSize;
    password += charPool[charIndex];
  }

  return password;
}