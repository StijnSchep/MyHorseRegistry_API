const TodoRepository = require("../data/repository-factory").todo_repository;

module.exports.getAll = async function(req, res, next) {
  const todos = await TodoRepository.getAllTodos();
  res.status(200).json(todos);
};

module.exports.create = async function(req, res, next) {
  if (req.role === 2) {
    const errorBody = {
      error: {
        message: "Not authorized to create todos",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const props = req.body;
  if (!props.user) {
    const errorBody = {
      error: {
        message: "Todo requires a user",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  if (!props.title) {
    const errorBody = {
      error: {
        message: "Todo requires a title",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  if (!props.content) {
    const errorBody = {
      error: {
        message: "Todo requires content",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  const todo = await TodoRepository.saveTodo(req.body);
  res.status(200).json(todo);
};

module.exports.update = async function(req, res, next) {
  if (req.role === 2) {
    const errorBody = {
      error: {
        message: "Not authorized to update todos",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  let todo = req.body;

  const result = await TodoRepository.updateTodo(todo);

  if (result.status === "Not found" || result.status === "failed") {
    const errorBody = {
      error: {
        message: "No Todo found to update",
        code: 404
      }
    };
    next(errorBody);
    return;
  }

  if (result.status === "done") {
    res.status(200).json(result.todo);
  }
};

module.exports.delete = async function(req, res, next) {
  let todo = {};
  todo._id = req.params.id;

  const result = await TodoRepository.deleteTodo(todo);
  if (result.status === "Not found" || result.status === "failed") {
    const errorBody = {
      error: {
        message: "No Todo found to delete",
        code: 404
      }
    };
    next(errorBody);
    return;
  }

  if (result.status === "done") {
    res.status(200).json(result.todo);
  }
};

module.exports.setDone = async function(req, res, next) {
  if (req.role === 3) {
    const errorBody = {
      error: {
        message: "Not authorized to set todos to done",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const todo = {
    _id: req.params.id
  };

  const result = await TodoRepository.setDone(todo);

  if (result.status === "Not found" || result.status === "failed") {
    const errorBody = {
      error: {
        message: "No Todo found to update",
        code: 404
      }
    };
    next(errorBody);
    return;
  }

  if (result.status === "done") {
    res.status(200).json(result.todo);
  }
};

module.exports.setDeclined = async function(req, res, next) {
  if (req.role === 3) {
    const errorBody = {
      error: {
        message: "Not authorized to set todos to declined",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const todo = {
    _id: req.params.id
  };

  const result = await TodoRepository.setDone(todo);

  if (result.status === "Not found" || result.status === "failed") {
    const errorBody = {
      error: {
        message: "No Todo found to update",
        code: 404
      }
    };
    next(errorBody);
    return;
  }

  if (result.status === "done") {
    res.status(200).json(result.todo);
  }
};
