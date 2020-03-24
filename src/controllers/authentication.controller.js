const UserRepository = require("../data/repository-factory").user_repository;
const logger = require("../config/appconfig").logger;
const bcrypt = require("bcrypt-nodejs");
const tokenGenerator = require("../config/token.generator");
const jwt = require("jsonwebtoken");

module.exports.register = async function(req, res, next) {
  logger.trace("registering a user");

  // { name, password, role }
  const user = req.body;

  if (!user.name) {
    const errorBody = {
      error: {
        message: "A user requires a name",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  if (!user.password) {
    const errorBody = {
      error: {
        message: "A user requires a password",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  if (!user.role || !(user.role === 1 || user.role === 2 || user.role === 3)) {
    const errorBody = {
      error: {
        message: "A user requires a valid role",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  user.password = bcrypt.hashSync(user.password);
  const data = {
    name: user.name,
    password: user.password,
    role: user.role
  };
  const savedUser = await UserRepository.register(data);

  if (!savedUser) {
    const errorBody = {
      error: {
        message: "Username already exists",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  res.status(200).json({
    message: "User was succesfully registered",
    code: 200
  });
};

module.exports.login = async function(req, res, next) {
  logger.trace("User is logging in");

  if (!req.body.name || !req.body.password) {
    const errorBody = {
      error: {
        message: "Incorrect name or password",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  const user = await UserRepository.getUserByName(req.body.name);

  if (!user) {
    const errorBody = {
      error: {
        message: "Incorrect name or password",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  if (bcrypt.compareSync(req.body.password, user.password)) {
    // User provided correct password
    tokenGenerator.generateToken(user.name, user.role, token => {
      res.status(200).json({
        token: token,
        role: user.role
      });
    });
  } else {
    // Password is invalid
    const errorBody = {
      error: {
        message: "Incorrect name or password",
        code: 400
      }
    };
    next(errorBody);
  }
};

module.exports.validateToken = (req, res, next) => {
  logger.trace("Validating token");

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const errorBody = {
      error: {
        message: "Authorization token missing!",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const token = authHeader.substring(7, authHeader.length);
  if (!token || token.length == 0) {
    const errorBody = {
      error: {
        message: "Authorization token missing!",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const key = process.env.JWTKEY || "SecretKey";
  jwt.verify(token, key, (err, payload) => {
    if (err) {
      const errorBody = {
        details: err,
        error: {
          message: "Error validating token",
          code: 401
        }
      };
      next(errorBody);
      return;
    }

    if (payload && payload.name && payload.name) {
      req.role = payload.role;
      next();
    } else {
      const errorBody = {
        error: {
          message: "No username or role found",
          code: 401
        }
      };

      next(errorBody);
    }
  });
};
