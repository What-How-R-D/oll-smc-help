let express = require('express');
let mongoose = require('mongoose');
let cors = require('cors');
let bodyParser = require('body-parser');
const createError = require('http-errors');

require('dotenv').config()

const requireLogin = require("../backend/middleware/auth")
const sendNotification = require("../backend/middleware/mailer")
const { processEvents } = require('../backend/middleware/force_calendar_push'); 


// Express Route
const userRoute = require('../backend/routes/user.route')
const roomRoute = require('../backend/routes/room.route')
const eventRoute = require('../backend/routes/event.route')
const blackoutRoute = require('../backend/routes/blackout.route')

// Connecting mongoDB Database
mongoose
  .connect(process.env.MONGO_URI)
  .then((x) => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err)
  })

const app = express();
app.use(express.json())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());
app.use('/users', userRoute)
app.use('/room', roomRoute)
app.use('/event', eventRoute)
app.use('/blackout', blackoutRoute)

// PORT
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})

// 404 Error
app.use((req, res, next) => {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});

setInterval(processEvents, 1.0 * 60 * 1000); 


// sendNotification("aaronjflood@gmail.com", "Another Test email", "It worked")