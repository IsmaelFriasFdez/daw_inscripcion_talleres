export let talleres = [
  {
    id: 1,
    titulo: "Introducción a Docker",
    categoria: "sistemas",
    plazas: 20,
    nivel: "inicial"
  },
  {
    id: 2,
    titulo: "Desarrollo Web con Express",
    categoria: "web",
    plazas: 15,
    nivel: "avanzado"
  },
  {
    id: 3,
    titulo: "Bases de Datos Relacionales",
    categoria: "datos",
    plazas: 25,
    nivel: "inicial"
  }
];

export let inscripciones = [
  {
    id: 1,
    tallerId: 1,
    nombre: "Curro Ximénez",
    email: "currox@example.com"
  },
  {
    id: 2,
    tallerId: 1,
    nombre: "Ana Gómez",
    email: "ana@example.com"
  },
  {
    id: 3,
    tallerId: 2,
    nombre: "Luis Pérez",
    email: "luis@example.com"
  }
];