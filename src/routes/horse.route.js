const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authentication.controller");
const HorseController = require("../controllers/horse.controller");

/*
    Supported routes:
    POST /api/horse '/'
    GET /api/horse '/list'
    PUT /api/horse '/:id'
    DELETE /api/horse '/:id'
*/

router.post("/", AuthController.validateToken, HorseController.create);
router.get("/list", AuthController.validateToken, HorseController.getList);
router.put("/:id", AuthController.validateToken, HorseController.update);
router.delete("/:id", AuthController.validateToken, HorseController.delete);

module.exports = router;
