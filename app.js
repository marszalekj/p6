const express = require("express");

const mongoose = require("mongoose");

const app = express();

app.use((req, res) => {
  res.json({ message: "Votre requête a bien été reçue !" });
});

mongoose
  .connect(
    "mongodb+srv://marza:marzamarza@cluster0.zp9vkju.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

module.exports = app;
