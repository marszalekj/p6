// importation
const express = require("express");

const mongoose = require("mongoose");

const path = require("path");

const dotenv = require("dotenv");
// routes
const userRoutes = require("./routes/user");

const sauceRoutes = require("./routes/sauce");
// demarage de l'app
const app = express();

// header permettant d'eviter les erreurs CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

mongoose
  .connect(
    "mongodb+srv://marza:marzamarza@cluster0.zp9vkju.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());
// import des routes
app.use("/api/auth", userRoutes);

app.use("/api/sauces", sauceRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
