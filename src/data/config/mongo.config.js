const mongoose = require("mongoose");

module.exports = {
  initDBConnection: function(done) {
    const connString =
      process.env.MONGO_CONN_STRING || "mongodb://localhost/myhorseregistry";

    // connect to the database
    mongoose
      .connect(connString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then(() => done())
      .catch(err => done(err));
  },

  dropData: async function() {
    const { todos, users } = mongoose.connection.collections;
    if (todos && (await todos.findOne())) {
      await todos.drop();
    }

    if (users && (await users.findOne())) {
      await users.drop();
    }
  }
};
