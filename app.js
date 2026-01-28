//importacion de modulos (dependencias)
const express = require("express"); // framework express para la creacion de servidores web
const path = require("path"); // modulo path, utilidad nativa de node.js para trabajar con rutas de archivos independientemente del OS
const session = require("express-session");
const cookieParser = require("cookie-parser");

const fs = require("fs/promises");

//inicializamos la aplicacion express
const app = express();
//configuracion del puerto donde escuchara el servidor
const PORT = 3001;

//rutas de archivos de datos
//las definimos aqui arriba para reutilizarlas en toda la aplicacion
const dataPath = "./data";
const usersFile = `${dataPath}/usuarios.json`;
const logsFile = `${dataPath}/logs.txt`;

//sesiones disponibles (datos mock)
//estas son las sesiones grupales que ofrece Sueños Valenti
const sessionsList = [
  { id: 1, name: "Meditación Astral Guiada", price: 25, duration: "1h 30min" },
  { id: 2, name: "Conexión con el Yo Superior", price: 35, duration: "2h" },
  { id: 3, name: "Viaje a Vidas Pasadas ", price: 45, duration: "2h 30min" },
  { id: 4, name: "Sanación con Cristales Han Nalhes", price: 30, duration: "1h" },
  { id: 5, name: "Despertar de la Kundalini", price: 50, duration: "3h" },
  { id: 6, name: "Lectura de Registros Akáshicos", price: 40, duration: "1h 30min" },
];

//middleware: funcion que se ejecuta entre la peticion del cliente y la respuesta del servidfor
//app.use() registra un middleware que se ejecutara en todas las peticiones.
//express.static() que sirve archivos estaticos (html, css, js, imagenes)
app.use(express.static(path.join(__dirname, "public")));

//configuracion del motor de plantillas (view engine) ejs para el uso de datos dinamicos en html, iteraciones, bucles, etc...
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//express.urlencoded() que parsea (analiza) datos de formularios que viajan codificados en el body de la peticion cuando el formulario envia con metodo post
//el middleware convierte esos datos en un objeto js accesible mediante req.body
//sin este middleware req.body seria undefined.
app.use(express.urlencoded({ extended: true })); // extended: true permite parsear objetos complejos y arrays. (false solo parsea strings y arrays simples)
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 minutos
    },
  }),
);

// middleware para comprobar que esta autenticado
const authRequired = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};

// Parseo de cookies
app.use(cookieParser());

// middleware para el themeColor
app.use((req, res, next) => {
  res.locals.themeColor = req.cookies.theme || "light"; // res.locals es un objeto que express pasa automaticamente a todas las plantillas ejs
  next();
});

//funcion helper para registrar logs de acciones del usuario
//usamos fs.appendFile para añadir lineas al final del archivo sin borrar lo anterior
//esto es util para tener un historial de todo lo que pasa en la aplicacion
const writeLog = async (action, user) => {
  const date = new Date().toISOString(); // fecha en formato ISO (ej: 2026-01-28T10:15:30.123Z)
  const username = user || "anonimo"; // si no hay usuario, ponemos "anonimo"
  const line = `[${date}] ${action}: ${username}\n`; // formato de cada linea del log

  try {
    //nos aseguramos de que la carpeta data existe antes de escribir el log
    //si ya existe no pasa nada gracias a recursive: true
    await fs.mkdir(dataPath, { recursive: true });

    //appendFile añade al final del archivo, si no existe lo crea
    await fs.appendFile(logsFile, line, "utf-8");
    console.log("Log registrado:", line.trim());
  } catch (error) {
    //si hay error al escribir el log, lo mostramos en consola pero no paramos la app
    console.error("Error al escribir en el log:", error);
  }
};

app.get("/", async (req, res) => {
  const user = req.session.user;
  await writeLog("VISITA_HOME", user);
  res.render("index", {
    user,
  });
});

app.get("/signup", async (req, res) => {
  const user = req.session.user;
  await writeLog("VISITA_REGISTRO", user);
  res.render("signup", {
    name: "",
    age: "",
    city: "",
    email: "",
    interests: [],
    user,
  });
});

app.post("/signup", async (req, res) => {
  const user = req.session.user;
  //A) Captura de datos que vienen del formulario
  const name = req.body.name; //-
  const age = req.body.age;
  const email = req.body.email;
  const city = req.body.city; //-
  let interests = req.body.interests || [];

  console.log("name::", name);
  console.log("age::", age);
  console.log("email::", email);
  console.log("city::", city);
  console.log("interests::", interests);

  if (!Array.isArray(interests)) interests = [interests];

  let errors = []; // cada error sera un mensaje almacedao en este array para mostrar al usuario cuando aplique.

  //B) validacion de datos
  //- validar que el nombre exista y que tenga 2 caracteres o mas.
  if (!name || name.trim().length < 2) {
    errors.push("El nombre tiene que tener mínimo 2 caracteres.");
  }
  //- validar que la edad sea mayor que 0
  if (!age || Number(age) <= 0) {
    errors.push("La edad debe ser mayor a 0.");
  }
  //- validar que el email sea valido.
  if (!email || !email.includes("@")) {
    errors.push("El email no es válido, debe contener @.");
  }
  //- validar que la ciudad tenga algun valor
  if (!city) {
    errors.push("La ciudad tiene que tener algún valor.");
  }

  //B) manejo de errores
  //  Si hay errores, NO procesamos el formulario
  //  En su lugar, volvemos a mostrar el formulario con:
  //  1. Los mensajes de error
  //  2. Los datos que el usuario había escrito (para que no los pierda)
  if (errors.length) {
    //si hay errores enviamos con un nuevo codigo de estado mas acorde (400 Bad Request) y renderizamos el formulario otra vez con los datos
    return res.status(400).render("signup", {
      name,
      age,
      email,
      city,
      interests,
      errors, //ademas pasamos el array de errores para mostrar al usuario.
      user,
    });
  }
  //C) exito
  //si estamos en este punto es que todo ha salido a pedir de Milhouse
  //por lo tanto lo que debemos hacer es:
  //- guardamos los datos JSON con un redirect a la home "/"
  try {
    //nos aseguramos de que la carpeta data existe
    await fs.mkdir(dataPath, { recursive: true });
    console.log(`Carpeta ${dataPath} lista`);

    //escribir en la carpeta creada los datos json
    let users = [];
    //si ya existe el fichero con datos de usuarios, vamos a pillar y parsear el contenido y despues hacer push del usuario al array
    //si no existe el fichero, simplemente hacemos push del nuevo usuario al array
    try {
      const content = await fs.readFile(usersFile, "utf-8");
      users = JSON.parse(content);
    } catch (error) {
      // Si el archivo no existe, users queda como array vacío []
      console.error("El archivo no existe aun.");
    }

    users.push({ name, age, email, city, interests });

    //hacemos json.stringify de los datos
    const usersJSON = JSON.stringify(users, null, 2);
    console.log(`JSON generado de los usuarios ${usersJSON}`);

    //los datos json van a ser un array de usuarios
    await fs.writeFile(usersFile, usersJSON, "utf-8");
    console.log(`Fichero ${usersFile} guardado`);

    //registramos en el log que un nuevo usuario se ha registrado
    await writeLog("REGISTRO", email);

    //final
    res.redirect("/");
  } catch (error) {
    console.error("Error trabajando con ficheros: ", error);
    res.status(500).send("Error al guardar usuario");
  }
});

// GET /login - Muestra el formulario de login
app.get("/login", async (req, res) => {
  const user = req.session.user;
  await writeLog("VISITA_LOGIN", user);
  res.render("login", {
    user,
    password: "",
    errors: [],
  });
});

// POST /login - Procesa los datos del formulario
app.post("/login", async (req, res) => {
  const user = req.body.user;
  const password = req.body.password;
  let errors = [];

  if (!user || !user.includes("@")) {
    errors.push(
      "El email de usuario no es válido, no debe estar vacio y debe contener @.",
    );
  }
  if (!password || password.trim() === "") {
    errors.push("La contraseña no puede estar vacia.");
  }

  if (errors.length) {
    return res.status(401).render("login", { user, password: "", errors });
  }

  // Login exitoso - guardar en sesión
  req.session.user = user;

  //registramos en el log que el usuario ha iniciado sesion
  await writeLog("LOGIN", user);

  res.redirect("/profile"); // Redirige a la página profile
});

app.get("/profile", authRequired, async (req, res) => {
  const user = req.session.user;
  await writeLog("VISITA_PERFIL", user);
  res.render("profile", { user });
});

app.post("/logout", async (req, res) => {
  const user = req.session.user; //guardamos el usuario antes de destruir la sesion

  //registramos en el log que el usuario ha cerrado sesion
  await writeLog("LOGOUT", user);

  //destruimos la sesion y redirigimos a la home
  req.session.destroy(() => res.redirect("/"));
});

app.get("/theme/:mode", async (req, res) => {
  const user = req.session.user;
  const themeColor = req.params.mode;
  //registramos en el log el cambio de tema y a que color
  await writeLog(`CAMBIO_TEMA_${themeColor.toUpperCase()}`, user);
  res.cookie("theme", themeColor, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias de vida del cookie
  });
  res.redirect("/preferences");
});

app.get("/preferences", async (req, res) => {
  const user = req.session.user;
  await writeLog("VISITA_PREFERENCIAS", user);
  res.render("preferences", {
    user,
  });
});

app.get("/sessions", async (req, res) => {
  const user = req.session.user;
  await writeLog("VISITA_SESIONES", user);
  res.render("sessions", {
    user,
    sessions: sessionsList, //pasamos la lista de sesiones a la vista
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
