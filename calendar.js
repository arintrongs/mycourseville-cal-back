const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const moment = require('moment')

const UserModel = require('./user')
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/calendar/:uid', async (req, res) => {
  const uid = req.params.uid
  const user = await UserModel.findById(uid).lean()
  const access_token = user.access_token
  const token_type = user.token_type
  try {
    let calendar = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:https://mycoursevillecal.firebasehosting.com\n'
    const selected_courses = user.selected_courses
    const now = moment()
    for (var course of selected_courses) {
      const { data } = await axios.get(
        `https://mycourseville.com/api/v1/public/get/course/assignments?cv_cid=${course.cv_cid}&detail=1`,
        {
          headers: { Authorization: `${token_type} ${access_token}` }
        }
      )
      const assigments = data.data
      for (var assignment of assigments) {
        const due_date_timestamp = moment(assignment.duetime * 1000)
        const start_date = `${due_date_timestamp.format('YYYYMMDD')}T000000`
        const due_date = `${due_date_timestamp.format('YYYYMMDD')}T${due_date_timestamp.format('HHmmss')}`
        calendar += `BEGIN:VEVENT\n`
        calendar += `DTSTAMP:${now.format('YYYYMMDD')}T${now.format(
          'HHmmss'
        )}\nDTSTART:${start_date}\nDTEND:${due_date}\nSUMMARY:[${course.course_no}] : ${assignment.title}\n`
        calendar += `BEGIN:VALARM\nTRIGGER:-PT24H\nDESCRIPTION:${assignment.title}\nACTION:DISPLAY\nEND:VALARM\n`
        calendar += `END:VEVENT\n`
      }
    }
    return res.status(200).send(calendar + 'END:VCALENDAR')
  } catch (e) {
    console.log(e.message)
    return res.status(400).send({ result: 'failed' })
  }
})
module.exports = app
