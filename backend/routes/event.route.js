const {google} = require('googleapis');
const jwt = require("jsonwebtoken")
let mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router()


let eventSchema = require('../models/event')
let roomSchema = require('../models/room')

const sendNotification = require("../middleware/mailer")
const calendarEvent = require("../middleware/calendar_event")

const findRoomData = require("../middleware/find_room")
const check_users = require("../middleware/check_users")
const find_lockers = require("../middleware/find_lockers")
const find_hvacs = require("../middleware/find_hvacs")

const { format } = require('date-fns');

router.route('/create').post(async (req, res, next) => {

	if (!req.body.requester){
		console.log("I'm a guest")
		var id = await check_users(req.body.email)
		if (id !== "") {req.body.requester = id}
	}

	req.body.event_gcal_id = await calendarEvent(req.body, " - PENDING")
		.then((event) => {return event})
		.catch((err) => { console.log("Error Creating Calender Event:", err); });
	try {
		var event_data = await eventSchema.create(req.body)

		const token = await jwt.sign( { id: "verifieduser" }, event_data._id.toString(), { expiresIn: "120h", })
		event_data = await eventSchema.findByIdAndUpdate(
			event_data._id,
			{token: token},
			(error, data) => {
				if (error) { return next(error)
				} else { res.json(data) }
			},
			).clone()

		var startTime = new Date(event_data.startTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })
		var endTime = new Date(event_data.endTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })
		var lockStartTime = new Date(event_data.lockStartTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })
		var lockEndTime = new Date(event_data.lockEndTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })

		var room_data = await findRoomData(event_data.room)
		var subject=`${event_data.name} request has been received`
		var body=`Your event ${event_data.name} has been received.\nThe event details are as follows:
		Room: ${room_data.name}
		Event start time: ${format(new Date(startTime), "M/d/yyyy h:mm a")}
		Event end time: ${format(new Date(endTime), "M/d/yyyy h:mm a")}
		Door unlock time: ${format(new Date(lockStartTime), "M/d/yyyy h:mm a")}
		Door lock time: ${format(new Date(lockEndTime), "M/d/yyyy h:mm a")}\n\nTo update the event request please login or follow this link: http://${process.env.REACT_APP_NODE_IP}/edit-event/${event_data._id}/${token} \n\n You will be contacted via email upon approval.
		`

		sendNotification(event_data.email, subject, body)
	} catch (error) {
		console.log(`Create error--> ${error}`);
		return error;
	}
  })

router.route('/create-multiple').post(async (req, res, next) => {	
	if (!req.body.requester){
		console.log("I'm a guest")
		var id = await check_users(req.body.email)
		if (id !== "") {req.body.requester = id}
	}

	var return_data = []
	var name_temp = req.body.name
	var num_events = req.body.repeatDates.length + 1
	req.body.name = `${name_temp} - (1/${num_events})`

	req.body.event_gcal_id = await calendarEvent(req.body, " - PENDING")
		.then((event) => {return event})
		.catch((err) => { console.log("Error Creating Calender Event:", err); });
	
	try {
		var event_data = await eventSchema.create(req.body)
	} catch (error) {
		console.log(`Create error--> ${error}`);
		return error;
	}

	for (var idx in req.body.repeatDates){
		var dates = req.body.repeatDates[idx]
		let count = req.body.repeatDates.indexOf(dates) + 2
		req.body.name = `${name_temp} - (${count}/${num_events})`
		req.body.startTime = dates[0]
		req.body.endTime = dates[1]

		var start = new Date(dates[0])
		var end = new Date(dates[1])
		var lock_start = new Date(req.body.lockStartTime)
		var lock_end = new Date(req.body.lockEndTime)
		req.body.lockStartTime = new Date(start.getFullYear(), start.getMonth(), start.getDate(), lock_start.getHours(), lock_start.getMinutes())
		req.body.lockEndTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), lock_end.getHours(), lock_end.getMinutes())
		
		req.body.event_gcal_id = await calendarEvent(req.body, " - PENDING")
			.then((event) => {return event})
			.catch((err) => { console.log("Error Creating Calender Event:", err); });
	
		eventSchema.create(req.body, (error, data) => {
			if (error) { return next(error) } 
			else { return_data.push(data) }
		})
	}
	res.json(return_data)


	const token = await jwt.sign( { id: "verifieduser" }, event_data._id.toString(), { expiresIn: "120h", })
	event_data = await eventSchema.findByIdAndUpdate(
		event_data._id,
		{token: token},
		(error, data) => {
			if (error) { return next(error)
			} else { return data }
		},
		).clone()

	var startTime = new Date(event_data.startTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })
	var endTime = new Date(event_data.endTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })
	var lockStartTime = new Date(event_data.lockStartTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })
	var lockEndTime = new Date(event_data.lockEndTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })

	var room_data = await findRoomData(event_data.room)
	var subject=`${event_data.name} repeating request has been received`
	var body=`Your event ${event_data.name} and all repeats have been received.\nThe initial event details are as follows:
	Room: ${room_data.name}
	Event start time: ${format(new Date(startTime), "M/d/yyyy h:mm a")}
	Event end time: ${format(new Date(endTime), "M/d/yyyy h:mm a")}
	Door unlock time: ${format(new Date(lockStartTime), "M/d/yyyy h:mm a")}
	Door lock time: ${format(new Date(lockEndTime), "M/d/yyyy h:mm a")}\n\nTo update the event request please login or follow this link: http://${process.env.REACT_APP_NODE_IP}/edit-event/${event_data._id}/${token} \n\n You will be contacted via email upon approval.
	`

	sendNotification(event_data.email, subject, body)
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

	if (event_data.status === "Pending") {
		const gcal_id = await calendarEvent(event_data, " - PENDING", "update")
		.then((event) => {return event})
		.catch((err) => { console.log("Error approving calender event:", err); });
	} else if (event_data.status === "Approved") {
		const gcal_id = await calendarEvent(event_data, "", "update")
		.then((event) => {return event})
		.catch((err) => { console.log("Error approving calender event:", err); });
	} else if (event_data.status === "Canceled") {
		const gcal_id = await calendarEvent(event_data, "", "delete")
		.then((event) => {return event})
		.catch((err) => { console.log("Error approving calender event:", err); });
	}

  })

router.route('/approve/:id').put(async (req, res, next) => {
	// Update the event by ID
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
	
	// Send the user an email it was approved
	var startTime = new Date(event_data.startTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })
	var endTime = new Date(event_data.endTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })
	var lockStartTime = new Date(event_data.lockStartTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })
	var lockEndTime = new Date(event_data.lockEndTime).toLocaleString('en-US', { timeZone: 'America/Chicago' })

	var room_data = await findRoomData(event_data.room)
	var subject=`${event_data.name} has been APPROVED`
	var body=`Your event ${event_data.name} has been approved.\nThe event details are as follows:
	Room: ${room_data.name}
	Event start time: ${format(new Date(startTime), "M/d/yyyy h:mm a")}
	Event end time: ${format(new Date(endTime), "M/d/yyyy h:mm a")}
	Door unlock time: ${format(new Date(lockStartTime), "M/d/yyyy h:mm a")}
	Door lock time: ${format(new Date(lockEndTime), "M/d/yyyy h:mm a")}
	`
	sendNotification(event_data.email, subject, body)

	//Update the calendar
	const gcal_id = await calendarEvent(event_data, "", "update")
		.then((event) => {return event})
		.catch((err) => { console.log("Error approving calender event:", err); });

	// Send email to locks that something needs done
	var lockers = await find_lockers()
	var subject=`${event_data.name} needs locks to be scheduled`
	var body=`A new event ${event_data.name} has been approved.\nThe event details are as follows:
	Room: ${room_data.name}
	Event start time: ${format(new Date(startTime), "M/d/yyyy h:mm a")}
	Event end time: ${format(new Date(endTime), "M/d/yyyy h:mm a")}
	Door unlock time: ${format(new Date(lockStartTime), "M/d/yyyy h:mm a")}
	Door lock time: ${format(new Date(lockEndTime), "M/d/yyyy h:mm a")}
	
	To set the locks as scheduled please go to http://${process.env.REACT_APP_NODE_IP}/locks-hub
	`
	for (var idx in lockers){
		sendNotification(lockers[idx].email, subject, body)
	}
	
	// Send email to hvacs that something needs done
	var hvacs = await find_hvacs()
	var subject=`${event_data.name} needs HVAC to be scheduled`
	var body=`A new event ${event_data.name} has been approved.\nThe event details are as follows:
	Room: ${room_data.name}
	Event start time: ${format(new Date(startTime), "M/d/yyyy h:mm a")}
	Event end time: ${format(new Date(endTime), "M/d/yyyy h:mm a")}
	Door unlock time: ${format(new Date(lockStartTime), "M/d/yyyy h:mm a")}
	Door lock time: ${format(new Date(lockEndTime), "M/d/yyyy h:mm a")}
	
	To set the HVAC as scheduled please go to http://${process.env.REACT_APP_NODE_IP}/hvac-hub
	`
	for (var idx in hvacs){
		sendNotification(hvacs[idx].email, subject, body)
	}

	
});


router.route('/reject/:id').put(async (req, res, next) => {
		const event_data = await eventSchema.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body, },
			(error, data) => {
			  if (error) { return next(error)
			  } else { res.json(data) }
			},
		  ).clone()

		var subject=`${event_data.name} has been REJECTED`
		var body=`Your event ${event_data.name} building request has been reject for the following reason: ${req.body.reason}. \nFor more information please contact the parish office.`

		sendNotification(event_data.email, subject, body)

		const gcal_id = await calendarEvent(event_data, "", "delete")
		.then((event) => {return event})
		.catch((err) => { console.log("Error approving calender event:", err); });

	})

	router.route('/force-cancel/:id').put(async (req, res, next) => {
		const event_data = await eventSchema.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body, },
			(error, data) => {
			  if (error) { return next(error)
			  } else { res.json(data) }
			},
		  ).clone()

		var subject=`${event_data.name} has been CANCELED by an admin`
		var body=`Your event ${event_data.name} building request has been canceled for the following reason: ${req.body.reason}. \nFor more information please contact the parish office.`

		sendNotification(event_data.email, subject, body)

		const gcal_id = await calendarEvent(event_data, "", "delete")
		.then((event) => {return event})
		.catch((err) => { console.log("Error force canceling event:", err); });

	})

router.route('/request-update/:id').put(async (req, res, next) => {

	const token = await jwt.sign( { id: "verifieduser" }, req.params.id, { expiresIn: "72h", })

	const event_data = await eventSchema.findByIdAndUpdate(
		req.params.id,
		{token: token},
		(error, data) => {
			if (error) { return next(error)
			} else { res.json(data) }
		},
		).clone()

	if (event_data.requester) {
		var subject=`${event_data.name} UPDATE REQUESTED`
		var body=`An update has been requested for your event: ${event_data.name}\n\nThe update is asking for: ${req.body.reason}.\n\nPlease go to: http://${process.env.REACT_APP_NODE_IP}/edit-event/${event_data._id}/${token}`
	}

	sendNotification(event_data.email, subject, body)
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

router.route('/find-hvac/:limit').get((req, res) => {
		eventSchema.find((error, data) => {
			if (error) {
				return next(error)
			} else {
				var approved_events = data.filter(event => event.status === "Approved").filter(event => new Date(event.endTime).getTime() > new Date())
				var canceled_events = data.filter(event => event.status === "Canceled").filter(event => new Date(event.endTime).getTime() > new Date())
				
				var approved_needs_work = approved_events.filter(event => !event.hvacSet).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
				var approved_done = approved_events.filter(event => event.hvacSet)
				var canceled_needs_work = canceled_events.filter(event => event.hvacSet).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
				var canceled_done = canceled_events.filter(event => !event.hvacSet)		

				var completed_events = [...approved_done, ...canceled_done].sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 ).slice(0, req.params.limit)

				res.json([ approved_needs_work, canceled_needs_work, completed_events ])
			}
		})
	})

router.route('/find-paid/:limit').get((req, res) => {
		eventSchema.find((error, data) => {
			if (error) {
				return next(error)
			} else {
				var paid_events = data.filter(event => (event.status === "Approved" && event.paid)).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 ).slice(0, req.params.limit).filter(event => new Date(event.endTime).getTime() > new Date())
				var unpaid_events = data.filter(event => (event.status === "Approved" && !event.paid)).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )

				res.json([ unpaid_events, paid_events ])
			}
		})
	})

router.route('/find-locks/:limit').get((req, res) => {
		eventSchema.find((error, data) => {
			if (error) {
				res.status(400).json({ error: error, })
			} else {
				var approved_events = data.filter(event => event.lockStartTime !== null).filter(event => event.status === "Approved").filter(event => new Date(event.endTime).getTime() > new Date())
				var canceled_events = data.filter(event => event.lockStartTime !== null).filter(event => event.status === "Canceled").filter(event => new Date(event.endTime).getTime() > new Date())
				
				var approved_needs_work = approved_events.filter(event => !event.locksSet).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
				var approved_done = approved_events.filter(event => event.locksSet)
				var canceled_needs_work = canceled_events.filter(event => event.locksSet).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
				var canceled_done = canceled_events.filter(event => !event.locksSet)		

				var completed_events = [...approved_done, ...canceled_done].sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 ).slice(0, req.params.limit)
				
				res.json([ approved_needs_work, canceled_needs_work, completed_events ])
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
			userEvent=data.filter(item => item.requester === req.params.id)
		  	res.json(userEvent)
		}
	  })
	})

router.route('/find-user-sorted/:id/:start/:end').get((req, res) => {
		eventSchema.find((error, data) => {
			if (error) {
			  return next(error)
			} else {
				userEvent=data.filter(item => item.requester === req.params.id)
				  
				var valid_events = userEvent.filter(item => new Date(item.endTime).getTime() > req.params.start)
				valid_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
				
				res.json(valid_events)
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
  
router.route('/find-bm-cal/:id').get((req, res) => {
	eventSchema.find((error, data) => {
		if (error) {
			return next(error)
		} else {
			roomEvent=data.filter(item => item.room === req.params.id).filter(item => ["Pending", "Approved"].includes(item.status))
			res.json(roomEvent)
		}
		})
	})

router.route('/find-bm-list/:id/:limit').get((req, res) => {
	eventSchema.find((error, data) => {
		if (error) {
			res.status(400).json({ error: error, })
		} else {
			// var all_events = []

			var needs_work = data.filter(item => item.room === req.params.id).filter(item => ["Pending"].includes(item.status)).filter(event => new Date(event.endTime).getTime() > new Date())
			var done = data.filter(item => item.room === req.params.id).filter(item => !["Pending"].includes(item.status)).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 ).slice(0, req.params.limit).filter(event => new Date(event.endTime).getTime() > new Date())

			res.json([...needs_work, ...done])
		}
		})
	})

module.exports = router
