require('dotenv').config()
require('./db')
const port = process.env.PORT || 3003
const app = require('./app')

app.listen(port, () => {
  console.log('Express server listening on port ' + port)
})
