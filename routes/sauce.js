const express = require("express");
const router = express.Router();
// import des middlewares
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
// import du controller
const sauceCtrl = require("../controllers/sauce");
// creation des routes
router.get("/", auth, sauceCtrl.getSauces);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.get("/:id", auth, sauceCtrl.getSauceById);
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;
