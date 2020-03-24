const User = require("../../models/user.model");

module.exports.register = async function(data) {
  const user = new User(data);

  try {
    return await user.save();
  } catch (err) {
    return;
  }
};

module.exports.getUserByName = async function(name) {
  return await User.findOne({ name: name });
};

// get users except for admins
module.exports.getUsers = async function() {
  return await User.find({ role: { $ne: 1 } }, { _id: 1, name: 1, role: 1 });
};

module.exports.deleteUser = async function(id) {
  await User.deleteOne({ _id: id });
};
