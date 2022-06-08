let express = require('express');
let mongoose = require('mongoose');
let cors = require('cors');
let bodyParser = require('body-parser');

require('dotenv').config()

const requireLogin = require("../backend/middleware/auth")


// Express Route
const userRoute = require('../backend/routes/user.route')
// const roomRoute = require('../backend/routes/room.route')
// const eventRoute = require('../backend/routes/event.route')

// Connecting mongoDB Database
mongoose
  .connect(process.env.MONGO_URI)
  .then((x) => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err.reason)
  })

const app = express();
app.use(express.json())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());
app.use('/users', userRoute)
// app.use('/room', roomRoute)
// app.use('/event', eventRoute)

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
