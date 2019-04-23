require('dotenv').config()
require('./db')
const port = process.env.PORT || 3003
const app = require('./app')
const fs = require('fs')
const https = require('https')

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(port, function () {
  console.log(`app is listening to port ${port} on https`)
})
