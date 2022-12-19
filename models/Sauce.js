const mongoose = require("mongoose");

// creation du model pour les sauces
const sauceSchema = mongoose.Schema({
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  imageUrl: { type: String, required: true },
  mainPepper: { type: String, required: true },
  usersLiked: { type: [String] },
  usersDisliked: { type: [String] },
  userId: { type: String, required: true },
});

module.exports = mongoose.model("Sauce", sauceSchema);
