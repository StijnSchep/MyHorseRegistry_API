const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authentication.controller");
const WebsiteController = require("../controllers/website.controller");

/*
    Supported Routes:
    GET /api/website '/list'

    POST /api/website '/'

    PUT /api/website '/:id'
    PUT /api/website '/:websiteId/horse/:horseId

    DELETE /api/website '/:id'
    DELETE /api/website '/:websiteId/horse/:horseId'
*/

router.get("/list", AuthController.validateToken, WebsiteController.getList);

router.post("/", AuthController.validateToken, WebsiteController.create);

router.put("/:id", AuthController.validateToken, WebsiteController.update);
router.put(
  "/:websiteId/horse/:horseId",
  AuthController.validateToken,
  WebsiteController.addHorse
);

router.delete("/:id", AuthController.validateToken, WebsiteController.delete);
router.delete(
  "/:websiteId/horse/:horseId",
  AuthController.validateToken,
  WebsiteController.removeHorse
);

module.exports = router;
