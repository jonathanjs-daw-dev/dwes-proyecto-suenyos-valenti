# Sueños Valenti – Portal de Sesiones de Supra Conciencia

## Desarrollo en Node.js + Express + EJS

La empresa Sueños Valenti quiere lanzar una página web para gestionar sesiones grupales de conexión con la supra conciencia, donde los usuarios puedan:

- Ver información básica de la empresa.
- Registrarse a través de un formulario.
- Guardar preferencias sobre el modo claro/oscuro.
- Acceder a una zona privada donde gestionar sus sesiones.
- Añadir sesiones a un "carrito espiritual" almacenado en sesión.
- Registrar en un archivo de texto los accesos/acciones del usuario.

Tu tarea como desarrollador/a es crear la primera versión funcional del portal.

## REQUISITOS TÉCNICOS DE LA PRÁCTICA

### 1. Estructura del proyecto (Node + Express + EJS)

El proyecto debe incluir:

- Servidor con Express.
- Motor de plantillas EJS.
- Rutas GET y POST separadas.
- Archivos estáticos (CSS opcional).

### 2. Página de inicio (GET "/")

Debe mostrar:

- Nombre de la web: Sueños Valenti.
- Descripción breve del objetivo ("Sesiones grupales para conectar con tu supra conciencia").
- Enlaces a: login, registro, preferencias, sesiones.

### 3. Formulario de registro (GET /registro – POST /registro)

El formulario debe pedir:

- Nombre
- Email
- Edad
- Ciudad
- Intereses (checkbox múltiple)

La ruta POST debe:

- Validar campos (mínimos: nombre, email válido, edad > 0).
- Si hay errores → devolver el formulario con mensajes.
- Si es correcto → guardarlo en una "base de datos" JSON en /data/usuarios.json.

### 4. Login (GET /login – POST /login)

Debe permitir entrar al sistema mediante:

- Usuario (email)
- Contraseña (falsa o fija, no es importante)

Si el login es correcto:

- Crear una sesión con los datos del usuario.
- Redirigir al perfil.

### 5. Zona privada /perfil

Debe mostrarse solo si hay sesión activa.

Debe incluir:

- Datos del usuario.
- Un enlace para cerrar sesión (POST /logout).

### 6. Preferencias y cookies (GET /preferencias)

Debe permitir:

- Cambiar entre tema claro / oscuro usando cookies.
- La cookie debe modificar visualmente la web (clase CSS aplicada al <body>).

## CRITERIOS DE EVALUACIÓN (10 puntos)

### 1. Rutas, peticiones GET/POST y lógica del servidor (2 puntos)

- 0,5: Rutas GET bien implementadas.
- 0,5: Rutas POST funcionando correctamente.
- 1: Validaciones correctas y gestión del flujo de errores.

### 2. Uso correcto de EJS y paso de parámetros a las vistas (2 puntos)

- 1: Uso de plantillas EJS coherente.
- 1: Paso de variables, renderizado condicional, y uso de bucles.

### 3. Manejo de sesiones (2 puntos)

- 1: Sistema de login funcional.
- 1: Carrito en sesión operando correctamente (añadir, vaciar).

### 4. Manejo de cookies + preferencias visuales (1 punto)

- 1: Tema claro/oscuro almacenado en cookie y aplicado en la web.

### 5. Acceso a ficheros (1 punto)

- 1: Generación y lectura de JSON, uso de appendFile para logs.

### 6. Correcta organización del proyecto (1 punto)

- Carpetas /views, /data, /public, código limpio, modularización básica.

### 7. Funcionamiento general + creatividad (1 punto)

- Interfaz clara, contenido adaptado al tema Sueños Valenti.
- Estética cuidada (no hace falta CSS avanzado).