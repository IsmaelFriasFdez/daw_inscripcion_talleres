import express from 'express';
import { talleres, inscripciones } from './datos/talleres.js';
import {
  obtenerPlazasRestantes,
  estaInscrito,
  validarInscripcion
} from './utils/talleresUtils.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS y archivos estáticos
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Middleware de registro (Log de peticiones)
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duracion}ms`);
  });
  next();
});

// Ruta raíz
app.get('/', (req, res) => {
  res.redirect('/talleres');
});

// GET /talleres: Consulta con filtros (categoria, nivel, disponibles)
app.get('/talleres', (req, res) => {
  const categoria = String(req.query.categoria ?? '').trim().toLowerCase();
  const nivel = String(req.query.nivel ?? '').trim().toLowerCase();
  const soloDisponibles = req.query.disponibles === 'true';

  let resultado = talleres.filter((taller) => {
    let cumple = true;
    if (categoria && taller.categoria.toLowerCase() !== categoria) {
      cumple = false;
    }
    if (nivel && taller.nivel.toLowerCase() !== nivel) {
      cumple = false;
    }
    if (soloDisponibles) {
      const restantes = obtenerPlazasRestantes(taller, inscripciones);
      if (restantes <= 0) {
        cumple = false;
      }
    }
    return cumple;
  });

  // Mapeamos para incluir las plazas restantes calculadas
  const talleresConPlazas = resultado.map((taller) => {
    return {
      ...taller,
      plazasRestantes: obtenerPlazasRestantes(taller, inscripciones)
    };
  });

  res.status(200).render('talleres/index', {
    tituloPagina: 'Catálogo de Talleres',
    talleres: talleresConPlazas,
    filtros: { categoria, nivel, disponibles: soloDisponibles }
  });
});

// GET /talleres/:id: Ficha detallada con EJS según estado
app.get('/talleres/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).render('talleres/error', {
      tituloPagina: 'Error de Identificador',
      mensaje: 'El identificador proporcionado no es válido.'
    });
  }

  const taller = talleres.find((t) => t.id === id);
  if (!taller) {
    return res.status(404).render('talleres/error', {
      tituloPagina: 'Taller no encontrado',
      mensaje: 'No existe ningún taller con ese identificador.'
    });
  }

  const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);
  let estadoPlazas = '';
  if (plazasRestantes > 1) {
    estadoPlazas = `${plazasRestantes} plazas disponibles`;
  } else if (plazasRestantes === 1) {
    estadoPlazas = 'Última plaza disponible';
  } else {
    estadoPlazas = 'Completo';
  }

  res.status(200).render('talleres/detalle', {
    tituloPagina: taller.titulo,
    taller,
    plazasRestantes,
    estadoPlazas,
    inscripcionesTaller: inscripciones.filter((i) => i.tallerId === taller.id)
  });
});

// GET /talleres/:id/inscripcion: Formulario de alta
app.get('/talleres/:id/inscripcion', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).render('talleres/error', {
      tituloPagina: 'Error',
      mensaje: 'Identificador manipulado o incorrecto.'
    });
  }

  const taller = talleres.find((t) => t.id === id);
  if (!taller) {
    return res.status(404).render('talleres/error', {
      tituloPagina: 'No encontrado',
      mensaje: 'El taller no existe.'
    });
  }

  const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);
  if (plazasRestantes <= 0) {
    return res.status(400).render('talleres/error', {
      tituloPagina: 'Taller Completo',
      mensaje: 'Este taller ya no dispone de plazas libres.'
    });
  }

  res.status(200).render('talleres/inscripcion', {
    tituloPagina: `Inscripción: ${taller.titulo}`,
    taller,
    valores: { nombre: '', email: '' },
    errores: {}
  });
});

// POST /talleres/:id/inscripcion: Procesar inscripción (PRG con código 303)
app.post('/talleres/:id/inscripcion', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).render('talleres/error', {
      tituloPagina: 'Error',
      mensaje: 'Identificador manipulado.'
    });
  }

  const taller = talleres.find((t) => t.id === id);
  if (!taller) {
    return res.status(404).render('talleres/error', {
      tituloPagina: 'No encontrado',
      mensaje: 'El taller no existe.'
    });
  }

  const datosForm = {
    nombre: String(req.body.nombre ?? '').trim(),
    email: String(req.body.email ?? '').trim()
  };

  const errores = validarInscripcion(datosForm);
  const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);

  if (plazasRestantes <= 0) {
    errores.general = 'El taller se ha completado.';
  }

  if (estaInscrito(taller.id, datosForm.email, inscripciones)) {
    errores.email = 'Este correo ya está inscrito en este taller.';
  }

  if (Object.keys(errores).length > 0) {
    return res.status(400).render('talleres/inscripcion', {
      tituloPagina: `Inscripción: ${taller.titulo}`,
      taller,
      valores: datosForm,
      errores
    });
  }

  const nuevaInscripcion = {
    id: inscripciones.length > 0 ? inscripciones[inscripciones.length - 1].id + 1 : 1,
    tallerId: taller.id,
    nombre: datosForm.nombre,
    email: datosForm.email
  };

  inscripciones.push(nuevaInscripcion);

  // Redirección PRG (Post-Redirect-Get) con código 303
  return res.redirect(303, `/talleres/${taller.id}`);
});

// Middleware 404
app.use((req, res) => {
  res.status(404).render('talleres/error', {
    tituloPagina: 'Recurso no encontrado',
    mensaje: 'La página solicitada no existe.'
  });
});

// Middleware de error 500
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('talleres/error', {
    tituloPagina: 'Error Interno',
    mensaje: 'Se ha producido un error interno en el servidor.'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor disponible en http://localhost:${PORT}`);
});