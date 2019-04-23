const jwt = require('jsonwebtoken')

exports.sign = token => {
  return jwt.sign(token, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 30 })
}
exports.verify = token => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

// Firebase

// exports.sign = token => {
//   return jwt.sign(token, 'KonoDioDa!!!', { expiresIn: 60 * 60 * 24 * 30 })
// }
// exports.verify = token => {
//   return jwt.verify(token, 'KonoDioDa!!!')
// }
