const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authentication.controller");
const ReservationController = require("../controllers/reservation.controller");

/*
    Supported routes:
    GET /api/reservation '/list'
    POST /api/reservation '/'
    PUT /api/reservation '/:id'
    DELETE /api/reservation '/:id'
*/

router.get(
  "/list",
  AuthController.validateToken,
  ReservationController.getList
);
router.post("/", AuthController.validateToken, ReservationController.create);
router.put("/:id", AuthController.validateToken, ReservationController.update);
router.delete(
  "/:id",
  AuthController.validateToken,
  ReservationController.delete
);

module.exports = router;
