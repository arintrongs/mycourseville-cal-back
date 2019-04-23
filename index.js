const functions = require('firebase-functions')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const app = require('./app')
const express = require('express')
const main = express()
main.use('/api', app)
const api = functions.https.onRequest((req, res) => {
  if (!req.path) {
    req.url = `/${req.url}` // prepend '/' to keep query params if any
  }
  return main(req, res)
})

exports.api = api
