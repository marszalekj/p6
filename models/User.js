const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// creation du model utilisateur
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//utilisation du plugin unique validator pour ne pouvoir s'inscrire qu'une fois avec un mail
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
