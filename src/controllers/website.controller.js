const WebsiteRepository = require("../data/repository-factory")
  .website_repository;
const uuid = require("uuid/v1");
const uuid_validate = require("uuid-validate");

function validateWebsite(data) {
  /*
        data: {
            name,
            URL,
            monthlyPrice,
            pricePerAd
        }
    */

  if (!data.name || data.name === "") {
    return {
      valid: false,
      message: "A website requires a valid name"
    };
  }

  if (!data.URL || data.URL === "") {
    return {
      valid: false,
      message: "A website requires a valid URL"
    };
  }

  if (!(data.monthlyPrice >= 0)) {
    return {
      valid: false,
      message: "A website requires a monthly price that is not less than 0"
    };
  }

  if (!(data.pricePerAd >= 0)) {
    return {
      valid: false,
      message: "A website requires a price per ad that is not less than 0"
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
        message: "Not authorized to add a website",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const validationResult = validateWebsite(req.body);
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

  const website = req.body;

  website._id = uuid();

  const err = await WebsiteRepository.create(website);
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

  res.status(200).send(website);
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
  if (!uuid_validate(req.params.id, 1)) {
    const errorBody = {
      error: {
        message: "Invalid website ID in URL",
        code: 400
      }
    };

    next(errorBody);
    return;
  }

  const validationResult = validateWebsite(req.body);
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

  const website = req.body;
  const err = await WebsiteRepository.update(website);
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

  res.status(200).send(website);
};

module.exports.addHorse = async function(req, res, next) {
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

  if (!uuid_validate(req.params.websiteId, 1)) {
    const errorBody = {
      error: {
        message: "Invalid website ID in URL",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  if (!uuid_validate(req.params.horseId, 1)) {
    const errorBody = {
      error: {
        message: "Invalid website ID in URL",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  const err = await WebsiteRepository.addHorse(
    req.params.websiteId,
    req.params.horseId
  );
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

  res.status(200).send({
    message: "Horse has been added to website",
    code: 200
  });
};

module.exports.removeHorse = async function(req, res, next) {
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

  if (!uuid_validate(req.params.websiteId, 1)) {
    const errorBody = {
      error: {
        message: "Invalid website ID in URL",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  if (!uuid_validate(req.params.horseId, 1)) {
    const errorBody = {
      error: {
        message: "Invalid website ID in URL",
        code: 400
      }
    };
    next(errorBody);
    return;
  }

  const err = await WebsiteRepository.removeHorse(
    req.params.websiteId,
    req.params.horseId
  );
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

  res.status(200).send({
    message: "Horse has been removed from website",
    code: 200
  });
};

module.exports.getList = async function(req, res, next) {
  const resBody = await WebsiteRepository.getList();

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

  const err = await WebsiteRepository.delete(req.params.id);
  if (err) {
    if (err === "HorseAttached") {
      const errorBody = {
        error: {
          message: "This website still advertises horses!",
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
    message: "Website has been deleted",
    code: 200
  });
};
