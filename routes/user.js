const express = require("express");
const router = express.Router();
// import du controller
const userCtrl = require("../controllers/user");
// creation des routes
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
