# Práctica UD1: Sistema de inscripción a talleres y actividades

Aplicación web desarrollada con **Node.js**, **Express** y **EJS** para la gestión de talleres y registros en unas jornadas tecnológicas, aplicando arquitectura cliente-servidor, funciones puras, validaciones en servidor y el patrón Post-Redirect-Get (PRG).

## Explicación de las Funcionalidades

### 1. Consulta y Filtros de Talleres (`GET /talleres`)

* **Cómo se ha realizado:** La ruta procesa los parámetros de consulta (`req.query`) para filtrar las colecciones en memoria mediante el método `filter()`. Permite filtrar simultáneamente por categoría, nivel y disponibilidad de plazas.

* **Cálculo de plazas:** Se utiliza una función pura auxiliar (`obtenerPlazasRestantes`) independiente de `req` y `res`, la cual emplea `filter()` sobre las inscripciones para calcular el cupo libre en tiempo real. Finalmente, se utiliza `map()` para adjuntar las plazas restantes a cada objeto taller sin mutar la colección original.

### 2. Ficha Detallada Dinámica (`GET /talleres/:id`)

* **Cómo se ha realizado:** Convierte el parámetro de ruta a número asegurando validación de enteros (`Number.isInteger`). Utiliza `find()` para localizar el taller correspondiente.

* **Estados:** Evalúa las plazas restantes para renderizar condicionalmente en la plantilla EJS los distintos estados requeridos: `"plazas disponibles"`, `"Última plaza disponible"` o `"Completo"`. Si el identificador no existe o está malformado, responde con código 400 o 404 y una vista de error.

### 3. Alta de Inscripciones (`GET/POST /talleres/:id/inscripcion`)

* **Cómo se ha realizado:**

  * `GET`: Comprueba que el taller existe y cuenta con plazas libres antes de renderizar el formulario de alta.

  * `POST`: Procesa los datos recibidos mediante el middleware `express.urlencoded`. Valida la integridad del nombre y el formato del correo electrónico en una función pura (`validarInscripcion`).

  * **Validaciones de negocio:** Verifica mediante el método `some()` que el correo no esté ya inscrito en ese taller (`estaInscrito`) y que queden plazas disponibles.

  * **Patrón PRG:** Si hay errores, responde con estado 400 devolviendo el formulario con los campos correctos conservados. Si el registro es exitoso, almacena la inscripción y responde con una redirección HTTP 303 (Post-Redirect-Get) hacia la ficha del taller para evitar reenvíos duplicados al recargar.

## Enlace al Chat de Apoyo

* https://share.gemini.google/L8X5TbS7fzFx

## Ejemplos de Llamadas con `curl` y Equivalentes HTML

### 1. Consultar todos los talleres

* **Llamada con curl:**

  ```
  curl -i http://localhost:3000/talleres
  
  ```

* **Equivalente HTML:**

  ```
  <form action="http://localhost:3000/talleres" method="get">
    <button type="submit">Consultar Todos los Talleres</button>
  </form>
  
  ```

### 2. Filtrar talleres por categoría y disponibilidad

* **Llamada con curl:**

  ```
  curl -i "http://localhost:3000/talleres?categoria=web&disponibles=true"
  
  ```

* **Equivalente HTML:**

  ```
  <form action="http://localhost:3000/talleres" method="get">
    <input type="hidden" name="categoria" value="web">
    <input type="hidden" name="disponibles" value="true">
    <button type="submit">Filtrar Talleres Web Disponibles</button>
  </form>
  
  ```

### 3. Consultar la ficha detallada de un taller

* **Llamada con curl:**

  ```
  curl -i http://localhost:3000/talleres/1
  
  ```

* **Equivalente HTML:**

  ```
  <a href="http://localhost:3000/talleres/1">Ver Ficha del Taller 1</a>
  
  ```

### 4. Solicitar el formulario de inscripción (GET)

* **Llamada con curl:**

  ```
  curl -i http://localhost:3000/talleres/1/inscripcion
  
  ```

* **Equivalente HTML:**

  ```
  <a href="http://localhost:3000/talleres/1/inscripcion">Ir al Formulario de Inscripción (Taller 1)</a>
  
  ```

### 5. Enviar una inscripción mediante POST (Alta)

* **Llamada con curl:**

  ```
  curl -i -X POST -d "nombre=Curro+Ximénez&email=currox@example.com" http://localhost:3000/talleres/1/inscripcion
  
  ```

* **Equivalente HTML:**

  ```
  <form action="http://localhost:3000/talleres/1/inscripcion" method="post">
    <input type="text" name="nombre" value="Curro Ximénez">
    <input type="email" name="email" value="currox@example.com">
    <button type="submit">Inscribirse al Taller</button>
  </form>
  
  ```

