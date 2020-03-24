const ReservationRepository = require("../data/repository-factory")
  .reservation_repository;
const uuid = require("uuid/v1");
const uuid_validate = require("uuid-validate");

function validateReservation(data) {
  if (!data.horseId || !uuid_validate(data.horseId)) {
    return {
      valid: false,
      message: "A reservation requires a valid horse ID"
    };
  }

  if (!data.customerName || !data.customerName === "") {
    return {
      valid: false,
      message: "A reservation requires a valid customer name"
    };
  }

  if (!data.customerCountry || !data.customerCountry === "") {
    return {
      valid: false,
      message: "A reservation requires a valid customer country"
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
        message: "Not authorized to add a reservation",
        code: 401
      }
    };
    next(errorBody);
    return;
  }

  const validationResult = validateReservation(req.body);
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

  const reservation = req.body;
  reservation._id = uuid();
  reservation.active = "true";
  reservation.activated_on = new Date();
  reservation.deactivated_on = new Date();

  const err = await ReservationRepository.create(reservation);
  if (err) {
    if (err === "ActiveReservation") {
      const errorBody = {
        details: err,
        error: {
          message: "Horse already has an active reservation",
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

  res.status(200).send(reservation);
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

  const validationResult = validateReservation(req.body);
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

  const reservation = req.body;
  if (reservation.active === false) {
    reservation.deactivated_on = new Date();
  }

  const err = await ReservationRepository.update(reservation);
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

  res.status(200).json(reservation);
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

  const err = await ReservationRepository.delete(req.params.id);
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
    message: "Reservation has been deleted",
    code: 200
  });
};

module.exports.getList = async function(req, res, next) {
  const resBody = await ReservationRepository.getList();

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
