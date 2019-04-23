const mongoose = require('mongoose')

const User = new mongoose.Schema({
  uid: { type: String, default: '' },
  selected_courses: { type: [Object], default: [] },
  access_token: String,
  token_type: String,
  last_update: { type: Date, default: new Date() }
})
const UserModel = mongoose.model('User', User)
module.exports = UserModel
