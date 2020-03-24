const jwt = require("jsonwebtoken");

module.exports.generateToken = function(name, role, callback) {
  const key = process.env.JWTKEY || "SecretKey";
  const payload = {
    name: name,
    role: role
  };

  jwt.sign(payload, key, { expiresIn: 60 * 60 * 6 }, (err, token) => {
    if (err) {
      const errorBody = {
        details: err,
        error: {
          message: "Failed to verify user",
          code: 500
        }
      };
      next(errorBody);
      return;
    }

    if (token) {
      callback(token);
    } else {
      const errorBody = {
        error: {
          message: "Error generating token",
          code: 500
        }
      };
      next(errorBody);
      return;
    }
  });
};
