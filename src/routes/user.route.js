const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");
const AuthController = require("../controllers/authentication.controller");

/*
    Supported routes:
    GET /api/user '/list'
    DELETE /api/user '/:id'
*/

router.get("/list", AuthController.validateToken, UserController.getList);
router.delete("/:id", AuthController.validateToken, UserController.delete);

module.exports = router;
