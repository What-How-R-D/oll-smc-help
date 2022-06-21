const {google} = require('googleapis');
let mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router()
let calendar = google.calendar('v3')

let eventSchema = require('../models/event')
let roomSchema = require('../models/room')

const sendNotification = require("../middleware/mailer")
const calendarJWT = require("../middleware/calendar")
const findRoomData = require("../middleware/find_room")

router.route('/create').post(async (req, res, next) => {
	const room_data = await findRoomData(req.body.room)
	
	var event = {
		'summary': `${room_data.name}: ${req.body.name} - PENDING`,
		'start': {
		  'dateTime': req.body.startTime,
		  'timeZone': 'America/Chicago',
		},
		'end': {
		  'dateTime': req.body.endTime,
		  'timeZone': 'America/Chicago',
		},
	  };

	const gcal_id = await calendar.events.insert({
		auth: calendarJWT(),
		calendarId: room_data.calendar_id,
		resource: event,
	  }
	).then((event) => {return event.data.id})
	.catch((err) => { console.log("Error Creating Calender Event:", err); });
	req.body.event_gcal_id = gcal_id
	
	eventSchema.create(req.body, (error, data) => {
	  if (error) {
		return next(error)
	  } else {
		res.json(data)
	  }
	})
  })

router.route('/update/:id').put(async (req, res, next) => {
	const event_data = await eventSchema.findByIdAndUpdate(
	  req.params.id,
	  { $set: req.body, },
	  (error, data) => {
		if (error) {
		  return next(error)
		} else {
		  res.json(data)
		  return data
		}
	  },
	).clone()

	if (req.body.status === "Canceled") {
		const room_data = await findRoomData(event_data.room)

		await calendar.events.delete({
			auth: calendarJWT(),
			calendarId: room_data.calendar_id,
			eventId: event_data.event_gcal_id,
		  }
		).then((event) => { console.log("Deleted from Google calendar") })
		.catch((err) => { console.log("Error Creating Calender Event:", err); });
	}

  })

router.route('/approve/:id').put(async (req, res, next) => {
	console.log(req.params)

	const event_data = await eventSchema.findByIdAndUpdate(
		req.params.id,
		{ $set: req.body, },
		(error, data) => {
		  if (error) {
			return next(error)
			console.log(error)
		  } else {
			res.json(data)
			return data
		  }
		},
	  ).clone()
	console.log('res')
	console.log(event_data)

	var subject=`${event_data.name} building request has been approved`
	var body=`Your event ${event_data.name} building request has been approved.  It is scheduled from ${event_data.startTime} to ${event_data.endTime}.  The doors will unlock at ${event_data.lockStartTime} and the doors will lock at ${event_data.lockEndTime}.`
	sendNotification(event_data.email, subject, body)

	const room_data = await findRoomData(event_data.room)
	var event = {
		'summary': `${room_data.name}: ${event_data.name}`,
		'start': {
			'dateTime': event_data.startTime,
			'timeZone': 'America/Chicago',
		},
		'end': {
			'dateTime': event_data.endTime,
			'timeZone': 'America/Chicago',
		},
		};

	await calendar.events.update({
		auth: calendarJWT(),
		calendarId: room_data.calendar_id,
		eventId: event_data.event_gcal_id,
		resource: event,
		}
	).then((event) => {console.log("Event approved")})
	.catch((err) => { console.log("Error Creating Calender Event:", err); });
	})

router.route('/reject/:id').put(async (req, res, next) => {
		const event_data = await eventSchema.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body, },
			(error, data) => {
			  if (error) { return next(error)
			  } else { res.json(data) }
			},
		  ).clone()

		var subject=`${event_data.name} building request has been rejected`
		var body=`Your event ${event_data.name} building request has been reject.  For more information please contact the parish office.`
		sendNotification(event_data.email, subject, body)

		const room_data = await findRoomData(event_data.room)

		await calendar.events.delete({
			auth: calendarJWT(),
			calendarId: room_data.calendar_id,
			eventId: event_data.event_gcal_id,
			}
		).then((event) => { console.log("Deleted from Google calendar") })
		.catch((err) => { console.log("Error Creating Calender Event:", err); });

	})

router.route('/delete/:id').delete((req, res) => {
	eventSchema.findByIdAndRemove(req.params.id, (error, data) => {
	  if (error) {
		return next(error)
	  } else {
		res.status(200).json({
		  msg: data,
		})
	  }
	})
  })

router.route('/find-all').get((req, res) => {
	eventSchema.find((error, data) => {
	  if (error) {
		return next(error)
	  } else {
		res.json(data)
	  }
	})
  })

router.route('/find-id/:id').get((req, res) => {
	eventSchema.findById(req.params.id, (error, data) => {
	  if (error) {
		return next(error)
	  } else {
		res.json(data)
	  }
	})
  })
  
router.route('/find-user/:id').get((req, res) => {
	eventSchema.find((error, data) => {
		if (error) {
		  return next(error)
		} else {
			userEvent=data.filter(item => item.requestor === req.params.id)
		  	res.json(userEvent)
		}
	  })
	})

router.route('/find-room/:id').get((req, res) => {
	eventSchema.find((error, data) => {
		if (error) {
			return next(error)
		} else {
			roomEvent=data.filter(item => item.room === req.params.id)
			res.json(roomEvent)
		}
		})
	})
  

module.exports = router