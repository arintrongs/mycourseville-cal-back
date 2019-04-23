const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const moment = require('moment')
const { sign, verify } = require('./jwt')

const UserModel = require('./user')
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/', async (req, res) => {
  return res.send('Hiiiiiiii')
})
app.use('/auth', async (req, res, next) => {
  try {
    const token = verify(req.body.token)
    req.body = { ...req.body, ...token }
    next()
  } catch (e) {
    return res.status(400).send({ auth: 'failed' })
  }
})
app.post('/auth/verify', async (req, res) => {
  const token_type = req.body.token_type
  const access_token = req.body.access_token
  try {
    const { data } = await axios.get('https://mycourseville.com/api/v1/public/get/user/info', {
      headers: { Authorization: `${token_type} ${access_token}` }
    })
    const user = await UserModel.findById(req.body.uid)
    return res.status(200).send({
      uid: req.body.uid,
      token: req.body.token,
      student_id: data.data.student.id,
      title: data.data.student.title_en,
      firstName: data.data.student.firstname_en,
      lastName: data.data.student.lastname_en,
      selected_courses: user.selected_courses,
      last_update: user.last_update
    })
  } catch (e) {
    console.log(e.message)
    return res.status(400).send({ auth: 'failed' })
  }
})
app.post('/access_token', async (req, res) => {
  const code = req.body.code

  try {
    const { data: auth_obj } = await axios.post('https://mycourseville.com/api/oauth/access_token', {
      grant_type: 'authorization_code',
      client_id: 'K67U5Z58SJ8O1JZJTKCFZKI2GMJH54C39RUFPWRM',
      client_secret: '4RC31EMDK60MXB13D6FVUYTJWBFM8YY9TETW2IYD',
      redirect_uri: `https://mycoursevillecal.firebaseapp.com/`,
      code: code
    })
    const { data } = await axios.get('https://mycourseville.com/api/v1/public/get/user/info', {
      headers: { Authorization: `${auth_obj.token_type} ${auth_obj.access_token}` }
    })
    const user = await UserModel.findOneAndUpdate(
      { uid: data.data.account.uid },
      { ...auth_obj },
      { upsert: true, new: true }
    )
    const token = sign({ ...auth_obj, uid: user._id.toString() })
    return res.status(200).send({ token })
  } catch (e) {
    console.log(e.message)
    return res.status(400).send({ auth: 'failed' })
  }
})
app.post('/refresh_token', async (req, res) => {
  const refresh_token = req.body.refresh_token
  const username = req.body.username
  try {
    const { data: auth_obj } = await axios.post('https://mycourseville.com/api/oauth/access_token', {
      grant_type: 'refresh_token',
      client_id: 'K67U5Z58SJ8O1JZJTKCFZKI2GMJH54C39RUFPWRM',
      client_secret: '4RC31EMDK60MXB13D6FVUYTJWBFM8YY9TETW2IYD',
      redirect_uri: `https://mycoursevillecal.firebaseapp.com/`,
      refresh_token
    })
    const { data } = await axios.get('https://mycourseville.com/api/v1/public/get/user/info', {
      headers: { Authorization: `${auth_obj.token_type} ${auth_obj.access_token}` }
    })
    const user = await UserModel.findOneAndUpdate(
      { uid: data.data.account.uid },
      { ...auth_obj, username },
      { upsert: true }
    )
    const token = sign({ ...auth_obj, uid: user._id.toString() })
    return res.status(200).send(token)
  } catch (e) {
    console.log(e.message)
    return res.status(400).send({ auth: 'failed' })
  }
})
app.post('/auth/userId', async (req, res) => {
  const token_type = req.body.token_type
  const access_token = req.body.access_token
  try {
    const { data } = await axios.get('https://mycourseville.com/api/v1/public/get/user/info', {
      headers: { Authorization: `${token_type} ${access_token}` }
    })
    const user = await UserModel.findOneAndUpdate(
      { uid: data.data.account.uid },
      { ...req.body, uid: data.data.account.uid },
      { upsert: true }
    )
    const token = sign({ ...rest, uid: user._id.toString() })
    return res.status(200).send({ token })
  } catch (e) {
    console.log(e.message)
    return res.status(400).send({ result: 'failed' })
  }
})
app.post('/auth/assignments', async (req, res) => {
  const token_type = req.body.token_type
  const access_token = req.body.access_token
  try {
    const { data } = await axios.get('https://mycourseville.com/api/v1/public/get/course/assignments?cv_cid=11886', {
      headers: { Authorization: `${token_type} ${access_token}` }
    })
    return res.status(200).send(data)
  } catch (e) {
    console.log(e.message)
    return res.status(400).send({ result: 'failed' })
  }
})
app.post('/auth/courses', async (req, res) => {
  const token_type = req.body.token_type
  const access_token = req.body.access_token
  try {
    const { data } = await axios.get('https://mycourseville.com/api/v1/public/get/user/courses?detail=1', {
      headers: { Authorization: `${token_type} ${access_token}` }
    })
    return res.status(200).send(data.data.student.filter(course => course.year === '2018' && course.semester == 2))
  } catch (e) {
    console.log(e.message)
    return res.status(400).send({ result: 'failed' })
  }
})
app.post('/auth/update', async (req, res) => {
  const selected_courses = req.body.selected_courses
  const uid = req.body.uid
  try {
    const user = await UserModel.findByIdAndUpdate(
      uid,
      { selected_courses, last_update: new Date() },
      { new: true, upsert: true }
    ).lean()
    return res.status(200).send({ selected_courses: user.selected_courses, last_update: user.last_update })
  } catch (e) {
    console.log(e.message)
    return res.status(400).send({ result: 'failed' })
  }
})
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
