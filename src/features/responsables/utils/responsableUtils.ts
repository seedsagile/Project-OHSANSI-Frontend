export function separarNombreCompleto(nombreCompleto: string): {
  nombre: string;
  apellido: string;
} {
  if (!nombreCompleto || typeof nombreCompleto !== 'string') {
    return { nombre: '', apellido: '' };
  }

  const palabras = nombreCompleto
    .trim()
    .split(' ')
    .filter((p) => p);

  if (palabras.length <= 1) {
    return { nombre: palabras[0] || '', apellido: '' };
  }

  if (palabras.length === 2) {
    return { nombre: palabras[0], apellido: palabras[1] };
  }

  // Considera los dos últimos elementos como apellidos
  const apellido = palabras.slice(-2).join(' ');
  const nombre = palabras.slice(0, -2).join(' ');

  return { nombre, apellido };
}

export function generarTelefonoRandom(): string {
  const primerDigito = Math.random() < 0.5 ? '6' : '7';
  let restoNumero = '';
  for (let i = 0; i < 7; i++) {
    restoNumero += Math.floor(Math.random() * 10);
  }
  return primerDigito + restoNumero;
}
