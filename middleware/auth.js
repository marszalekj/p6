const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
// export du middleware d'authantification
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // recuperation du token après bearer

    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET); // decodage du token via la clef secrete
    const userId = decodedToken.userId; // recuperation de l'userid du token decode, qui sera transmis aux routes via le .auth
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
