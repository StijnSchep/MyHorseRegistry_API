const UserRepository = require("../data/repository-factory").user_repository;

module.exports.getList = async function(req, res, next) {
  if (req.role != 1) {
    const errorBody = {
      error: {
        message: "Unauthorized to view users",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const users = await UserRepository.getUsers();
  res.status(200).json(users);
};

module.exports.delete = async function(req, res, next) {
  if (req.role != 1) {
    const errorBody = {
      error: {
        message: "Unauthorized to delete users",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const userId = req.params.id;
  await UserRepository.deleteUser(userId);

  res.status(200).json({
    message: "User has been removed",
    code: 200
  });
};
