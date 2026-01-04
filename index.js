const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");

//env
require("dotenv").config();

//database
const database = require("./config/database");
database.connect();

//express + port
const app = express();
const port = process.env.PORT;

//set pug
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

//set public
app.use(express.static(`${__dirname}/public`));

//method override
app.use(methodOverride("_method"));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// cookieParser
app.use(cookieParser("keyboard cat"));

// session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);

// flash
app.use(flash());

//tinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

//Route
const routerClient = require("./routes/client/index.route");
const routerAdmin = require("./routes/admin/index.route");
routerClient(app);
routerAdmin(app);

//variable local
const systemConfig = require("./config/system");
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.listen(port, () => {
  console.log(`App listening on port ${port} http://localhost:${port}/`);
});
