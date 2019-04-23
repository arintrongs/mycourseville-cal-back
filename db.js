const mongoose = require('mongoose')

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USERNAME}:${
    process.env.MONGO_PASSWORD
  }@cluster0-bttsk.mongodb.net/test?retryWrites=true`,
  { useNewUrlParser: true }
)

// mongoose.connect(`mongodb+srv://enigmaxz:pantaraT1@cluster0-bttsk.mongodb.net/test?retryWrites=true`, {
//   useNewUrlParser: true
// })
