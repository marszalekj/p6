const Sauce = require("../models/Sauce");

// Importation du package fs pour gerer les fichiers
const fs = require("fs");

// fonction de creation de la sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; //supression de l'id de la requête cree par mongo
  delete sauceObject._userId; //suppression de l'userid pour raison de securite et utilisation du token
  const sauce = new Sauce({
    //utilisation du schema Sauce
    ...sauceObject, // parcours de l'objet
    userId: req.auth.userId, //remplacement de l'userid par le token
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({
        message: "Sauce saved successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// fonction d'affichage d'une sauce
exports.getSauceById = (req, res, next) => {
  Sauce.findOne({
    //methode findone pour trouver une sauce avec l'id en parametres
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

// fonction de modification de la sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file // si requete contient un fichier
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename //creation de l'url de l'image
        }`,
      }
    : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        // si userid bdd n'est pas celui du token, requete non authorisee
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Suppression de l'ancienne inage lors de la modification
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Objet modifié!" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// fonction de suppression de la sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// fonction d'affichage de toutes les sauces
exports.getSauces = (req, res, next) => {
  Sauce.find() // methode find pour trouver toutes les auces
    .then((sauces) => {
      res.status(200).json(sauces); //renvoie du tableau de toutes les sauces
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// fonction de like des sauces

exports.likeSauce = (req, res, next) => {
  const liker = req.body.userId; // recuperation de l'utilisateur ayant like/dislike
  let likeStatus = req.body.like; // recuperation de la valeur du like/dislike
  Sauce.findOne({ _id: req.params.id })
    .then((votedSauce) => {
      if (likeStatus === 1) {
        // si un utilisateur like
        Sauce.updateOne(
          { _id: req.params.id },
          { $push: { usersLiked: liker }, $inc: { likes: 1 } } // ajout de l'userid dans la liste usersliked de la bdd et ajout d'un like a la sauce
        )
          .then(() => res.status(201).json({ message: "you like this sauce" }))
          .catch((error) => res.status(400).json({ error }));
      } else if (likeStatus === -1) {
        // si un utilisateur dislike
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: 1 }, $push: { usersDisliked: liker } } // ajout de l'userid dans la liste usersDisliked de la bdd et ajout d'un dislike a la sauce
        )
          .then(() =>
            res.status(201).json({ message: "you dislike this sauce" })
          )
          .catch((error) => res.status(400).json({ error }));
      } else if (likeStatus === 0) {
        // si un utilisateur annule un like ou dislike
        if (votedSauce.usersLiked.includes(liker)) {
          // si l'utilisateur a deja like une sauce
          Sauce.updateOne({ $inc: { likes: -1 }, $pull: { usersLiked: liker } }) // suppression du like de la sauce et de l'userid de la bdd usersliked
            .then(() =>
              res.status(201).json({ message: "you un-likethis sauce" })
            )
            .catch((error) => res.status(400).json({ error }));
        } else if (votedSauce.usersDisliked.includes(liker)) {
          // si l'utilisateur a deja unlike une sauce

          Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { dislikes: -1 }, $pull: { usersDisliked: liker } } // suppression du dislike de la sauce et de l'userid de la bdd usersdisliked
          )
            .then(() =>
              res.status(201).json({ message: "you un-dislike this sauce" })
            )
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
