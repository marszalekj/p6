const bcrypt = require("bcrypt");

const User = require("../models/User");

const jwt = require("jsonwebtoken");

require("dotenv").config();

// fonction d'inscription
exports.signup = (req, res, next) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; // creation d'un regex pour avoir un mot de passe securise
  if (passwordRegex.test(req.body.password)) {
    bcrypt
      .hash(req.body.password, 10) // cryptage du mdp et 10 hashage pour securise le mdp
      .then((hash) => {
        const user = new User({
          // utilisation du model User pour creer nouvel utilisateur
          email: req.body.email,
          password: hash,
        });

        user
          .save() // sauvegarde du nouvel user dans la bdd
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    res.status(400).json({
      message:
        "Le mot de passe doit contenir au moins 8caractères, une lettre majuscule, une lettre minuscule et un chiffre",
    });
    alert(
      "Le mot de passe doit contenir au moins 8caractères, 1 lettre majuscule, une 1 minuscule et 1 chiffre"
    );
  }
};

// fonction de login
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) // recherche du mail dans la bdd
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password) //comparaison du mdp envoye par le user avec celui hashe dans la bdd
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id }, // si mail et mdp corrects, encodage de l'userid via un token, avec duree de validite de 24h
              process.env.RANDOM_TOKEN_SECRET,
              {
                expiresIn: "24h",
              }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
