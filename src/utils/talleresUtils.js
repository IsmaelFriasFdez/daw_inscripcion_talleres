export function obtenerPlazasRestantes(taller, inscripciones) {
  // Empleamos filter para contar las inscripciones asociadas a este taller
  const inscritas = inscripciones.filter((i) => i.tallerId === taller.id);
  return taller.plazas - inscritas.length;
}

export function estaInscrito(tallerId, email, inscripciones) {
  // Empleamos some para verificar si el correo ya está registrado en el taller
  const emailNormalizado = String(email).trim().toLowerCase();
  return inscripciones.some(
    (i) => i.tallerId === Number(tallerId) && i.email.toLowerCase() === emailNormalizado
  );
}

export function validarInscripcion(datos) {
  const errores = {};
  const nombre = String(datos.nombre ?? "").trim();
  const email = String(datos.email ?? "").trim();

  if (nombre.length < 2) {
    errores.nombre = "El nombre debe tener al menos dos caracteres.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errores.email = "El correo electrónico no es válido.";
  }

  return errores;
}