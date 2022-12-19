const Sauce = require("../models/Sauce");

// Importation du package fs pour gerer les fichiers
const fs = require("fs");

// fonction de creation de la sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({
        message: "Post saved successfully!",
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
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
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
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// fonction de like des sauces

exports.likeSauce = (req, res, next) => {
  const liker = req.body.userId;
  let likeStatus = req.body.like;
  Sauce.findOne({ _id: req.params.id })
    .then((votedSauce) => {
      if (likeStatus === 1) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $push: { usersLiked: liker }, $inc: { likes: 1 } }
        )
          .then(() => res.status(201).json({ message: "you like this sauce" }))
          .catch((error) => res.status(400).json({ error }));
      } else if (likeStatus === -1) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: 1 }, $push: { usersDisliked: liker } }
        )
          .then(() =>
            res.status(201).json({ message: "you dislike this sauce" })
          )
          .catch((error) => res.status(400).json({ error }));
      } else if (likeStatus === 0) {
        if (votedSauce.usersLiked.includes(liker)) {
          Sauce.updateOne({ $inc: { likes: -1 }, $pull: { usersLiked: liker } })
            .then(() =>
              res.status(201).json({ message: "you un-likethis sauce" })
            )
            .catch((error) => res.status(400).json({ error }));
        } else if (votedSauce.usersDisliked.includes(liker)) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { dislikes: -1 }, $pull: { usersDisliked: liker } }
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
