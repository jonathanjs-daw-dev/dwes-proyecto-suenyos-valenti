//importacion de modulos (dependencias)
const express = require("express"); // framework express para la creacion de servidores web
const path = require("path"); // modulo path, utilidad nativa de node.js para trabajar con rutas de archivos independientemente del OS
const session = require("express-session");
const cookieParser = require("cookie-parser");

//inicializamos la aplicacion express
const app = express();
//configuracion del puerto donde escuchara el servidor
const PORT = 3001;

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

app.get("/", (req, res) => {
  const user = req.session.user;
  res.render("index", {
    user,
  });
});

app.get("/signup", (req, res) => {
  const user = req.session.user;
  res.render("signup", {
    name: "",
    age: "",
    city: "",
    email: "",
    interests: [],
    user,
  });
});

app.post("/signup", (req, res) => {
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
      user
    });
  }
  //C) exito
  //si estamos en este punto es que todo ha salido a pedir de Milhouse
  //por lo tanto lo que debemos hacer es:
  //- guardamos los datos JSON con un redirect a la home "/"
  //TODO
});

// GET /login - Muestra el formulario de login
app.get("/login", (req, res) => {
  const user = req.session.user;
  res.render("login", {
    user,
    password: "",
    errors: [],
  });
});

// POST /login - Procesa los datos del formulario
app.post("/login", (req, res) => {
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
  res.redirect("/profile"); // Redirige a la página profile
});

app.get("/profile", authRequired, (req, res) => {
  const user = req.session.user;
  res.render("profile", { user });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

app.get("/theme/:mode", (req, res) => {
  const themeColor = req.params.mode;
  res.cookie("theme", themeColor, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias de vida del cookie
  });
  res.redirect("/preferences");
});

app.get("/preferences", (req, res) => {
  const user = req.session.user;
  res.render("preferences", {
    user,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
