const express = require("express");
const router = express.Router();

const TodoController = require("../controllers/todo.controller");
const AuthController = require("../controllers/authentication.controller");

/*
    Supported routes:
    GET /api/todo '/list'
    POST /api/todo '/'
    PUT /api/todo '/:id/done'
    PUT /api/todo '/:id/declined'
    PUT /api/todo '/:id'
    DELETE /api/todo '/:id'
*/

router.get("/list", AuthController.validateToken, TodoController.getAll);

router.post("/", AuthController.validateToken, TodoController.create);

router.put("/:id/done", AuthController.validateToken, TodoController.setDone);
router.put(
  "/:id/declined",
  AuthController.validateToken,
  TodoController.setDeclined
);
router.put("/:id", AuthController.validateToken, TodoController.update);

router.delete("/:id", AuthController.validateToken, TodoController.delete);

module.exports = router;
