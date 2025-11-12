/**
 * Opciones para la generación de la contraseña.
 * Todas las opciones booleanas por defecto son 'true'.
 */
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

/**
 * Genera una contraseña aleatoria y criptográficamente segura utilizando la API Web Crypto.
 *
 * @param options Opciones de configuración para la contraseña.
 * @returns Una cadena (string) con la contraseña generada.
 */
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

  // 1. Construir el pool de caracteres permitidos
  let charPool = '';
  if (useLowercase) charPool += CHAR_SETS.LOWERCASE;
  if (useUppercase) charPool += CHAR_SETS.UPPERCASE;
  if (useNumbers) charPool += CHAR_SETS.NUMBERS;
  if (useSymbols) charPool += CHAR_SETS.SYMBOLS;

  // 2. Fallback de seguridad: si el usuario desactiva todo, usar un pool por defecto
  if (charPool === '') {
    console.warn(
      'Todas las opciones de caracteres estaban deshabilitadas. Usando pool por defecto (minúsculas y números).'
    );
    charPool = CHAR_SETS.LOWERCASE + CHAR_SETS.NUMBERS;
  }

  // 3. Generar valores aleatorios seguros
  // Creamos un array de bytes (enteros de 0 a 255)
  const randomValues = new Uint8Array(length);
  // Llenamos el array con valores criptográficamente seguros
  window.crypto.getRandomValues(randomValues);

  // 4. Construir la contraseña
  let password = '';
  const poolSize = charPool.length;

  for (let i = 0; i < length; i++) {
    // Usamos el operador de módulo (%) para obtener un índice válido
    // (randomValues[i] % poolSize) nos da un número entre 0 y (poolSize - 1)
    const charIndex = randomValues[i] % poolSize;
    password += charPool[charIndex];
  }

  return password;
}