const HorseRepository = require("../data/repository-factory").horse_repository;
const uuid = require("uuid/v1");

function validateHorse(data) {
  if (!data.officialName || data.officialName === "") {
    return {
      valid: false,
      message: "A horse requires a valid official name"
    };
  }

  if (!data.commonName || data.commonName === "") {
    return {
      valid: false,
      message: "A horse requires a valid common name"
    };
  }

  if (!data.category || data.category === "") {
    return {
      valid: false,
      message: "A horse requires a valid category"
    };
  }

  if (!data.yearOfBirth || data.yearOfBirth > new Date().getFullYear) {
    return {
      valid: false,
      message: "A horse requires a valid year of birth"
    };
  }

  if (!data.gender || data.gender === "") {
    return {
      valid: false,
      message: "A horse requires a valid gender"
    };
  }

  if (!data.color || data.color === "") {
    return {
      valid: false,
      message: "A horse requires a valid color"
    };
  }

  if (!data.height) {
    return {
      valid: false,
      message: "A horse requires a valid height"
    };
  }

  if (!data.price) {
    return {
      valid: false,
      message: "A horse requires a price"
    };
  }

  if (!data.title || data.title === "") {
    return {
      valid: false,
      message: "A horse requires a valid title"
    };
  }

  if (!data.description || data.description === "") {
    return {
      valid: false,
      message: "A horse requires a valid description"
    };
  }

  return {
    valid: true
  };
}

module.exports.create = async function(req, res, next) {
  if (req.role === 3) {
    const errorBody = {
      error: {
        message: "Not authorized to add a horse",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const validationResult = validateHorse(req.body);
  if (!validationResult.valid) {
    const errorBody = {
      error: {
        message: validationResult.message,
        code: 400
      }
    };

    next(errorBody);
    return;
  }

  const horse = req.body;
  horse._id = uuid();
  horse.date_added = new Date();
  horse.date_sold = new Date();
  horse.status = "Actief";

  const err = await HorseRepository.create(horse);
  if (err) {
    if (err.code === "ServiceUnavailable") {
      const errorBody = {
        details: err,
        error: {
          message: "Unable to connect to Neo4j Database",
          code: 500
        }
      };
      next(errorBody);
      return;
    }

    const errorBody = {
      details: err,
      error: {
        message: "Something went wrong while connecting to Neo4J",
        code: 500
      }
    };
    next(errorBody);
    return;
  }

  res.status(200).send(horse);
};

module.exports.update = async function(req, res, next) {
  if (req.role === 3) {
    const errorBody = {
      error: {
        message: "Not authorized to update a horse",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  req.body._id = req.params.id;

  const validationResult = validateHorse(req.body);
  if (!validationResult.valid) {
    const errorBody = {
      error: {
        message: validationResult.message,
        code: 400
      }
    };

    next(errorBody);
    return;
  }

  const horse = req.body;
  if (horse.status === "Verkocht") {
    horse.date_sold = new Date();
  }

  const err = await HorseRepository.update(horse);
  if (err) {
    if (err.code === "ServiceUnavailable") {
      const errorBody = {
        details: err,
        error: {
          message: "Unable to connect to Neo4j Database",
          code: 500
        }
      };
      next(errorBody);
      return;
    }

    const errorBody = {
      details: err,
      error: {
        message: "Something went wrong while connecting to Neo4J",
        code: 500
      }
    };
    next(errorBody);
    return;
  }

  res.status(200).send(horse);
};

module.exports.delete = async function(req, res, next) {
  if (req.role === 3) {
    const errorBody = {
      error: {
        message: "Not authorized to update a horse",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const err = await HorseRepository.delete(req.params.id);
  if (err) {
    if (err === "WebsiteAttached") {
      const errorBody = {
        error: {
          message: "This horse is still attached to a website!",
          code: 400
        }
      };
      next(errorBody);
      return;
    }

    if (err.code === "ServiceUnavailable") {
      const errorBody = {
        details: err,
        error: {
          message: "Unable to connect to Neo4j Database",
          code: 500
        }
      };
      next(errorBody);
      return;
    }

    const errorBody = {
      details: err,
      error: {
        message: "Something went wrong while connecting to Neo4J",
        code: 500
      }
    };
    next(errorBody);
    return;
  }

  res.status(200).send({
    message: "Horse has been deleted",
    code: 200
  });
};

module.exports.getList = async function(req, res, next) {
  const resBody = await HorseRepository.getList();

  if (resBody.err) {
    const errorBody = {
      details: resBody.err,
      error: {
        message: "Something went wrong while connecting to Neo4J",
        code: 500
      }
    };
    next(errorBody);
    return;
  }

  res.status(200).send(resBody.result);
};
