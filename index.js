const express = require("express");

//env
require("dotenv").config();

//database
const database = require("./config/database");
database.connect();

//express + port
const app = express();
const port = process.env.PORT;

//set pug
app.set("views", "./views");
app.set("view engine", "pug");

//set public
app.use(express.static("public"));

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
