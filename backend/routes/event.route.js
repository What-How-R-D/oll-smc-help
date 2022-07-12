const {google} = require('googleapis');
const jwt = require("jsonwebtoken")
let mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router()


let eventSchema = require('../models/event')
let roomSchema = require('../models/room')

const sendNotification = require("../middleware/mailer")
const calendarEvent = require("../middleware/calendar")


router.route('/create').post(async (req, res, next) => {
	
	req.body.event_gcal_id = await calendarEvent(req.body, " - PENDING")
		.then((event) => {return event})
		.catch((err) => { console.log("Error Creating Calender Event:", err); });
	
	eventSchema.create(req.body, (error, data) => {
	  if (error) {
		return next(error)
	  } else {
		res.json(data)
	  }
	})
  })

router.route('/create-multiple').post(async (req, res, next) => {	
	var return_data = []
	var name_temp = req.body.name
	var num_events = req.body.repeatDates.length + 1
	req.body.name = `${name_temp} - (1/${num_events})`

	req.body.event_gcal_id = await calendarEvent(req.body, " - PENDING")
		.then((event) => {return event})
		.catch((err) => { console.log("Error Creating Calender Event:", err); });
	
	eventSchema.create(req.body, (error, data) => {
	  if (error) { return next(error) } 
	  else { return_data.push(data) }
	})

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
		const gcal_id = await calendarEvent(event_data, "", "delete")
		.then((event) => {return event})
		.catch((err) => { console.log("Error approving calender event:", err); });
	}

  })

router.route('/approve/:id').put(async (req, res, next) => {
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
	
	var subject=`${event_data.name} building request has been approved`
	var body=`Your event ${event_data.name} building request has been approved.  It is scheduled from ${event_data.startTime} to ${event_data.endTime}.  The doors will unlock at ${event_data.lockStartTime} and the doors will lock at ${event_data.lockEndTime}.`
	sendNotification(event_data.email, subject, body)

	const gcal_id = await calendarEvent(event_data, "", "update")
		.then((event) => {return event})
		.catch((err) => { console.log("Error approving calender event:", err); });
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

		var subject=`${event_data.name} building request has been rejected`
		var body=`Your event ${event_data.name} building request has been reject for the following reason: ${req.body.reason}. \nFor more information please contact the parish office.`
		sendNotification(event_data.email, subject, body)

		const gcal_id = await calendarEvent(event_data, "", "delete")
		.then((event) => {return event})
		.catch((err) => { console.log("Error approving calender event:", err); });

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
	
	console.log(event_data)
	console.log(req.body.reason)

	if (event_data.requestor) {
		var subject=`${event_data.name} building update has been requested`
		var body=`An update has been requested for your event ${event_data.name}\n
		The update is asking for: ${req.body.reason}.\n
		Please go to: http://${process.env.REACT_APP_NODE_IP}:3000/edit-event/${event_data._id}/${token}`
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
				var approved_events = data.filter(event => event.status === "Approved")
				var canceled_events = data.filter(event => event.status === "Canceled")
				
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
				var paid_events = data.filter(event => (event.status === "Approved" && event.paid)).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 ).slice(0, req.params.limit)
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
				var approved_events = data.filter(event => event.status === "Approved")
				var canceled_events = data.filter(event => event.status === "Canceled")
				
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
			userEvent=data.filter(item => item.requestor === req.params.id)
		  	res.json(userEvent)
		}
	  })
	})

router.route('/find-user-sorted/:id/:start/:end').get((req, res) => {
		eventSchema.find((error, data) => {
			if (error) {
			  return next(error)
			} else {
				userEvent=data.filter(item => item.requestor === req.params.id)
				  
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

			var needs_work = data.filter(item => item.room === req.params.id).filter(item => ["Pending"].includes(item.status))
			var done = data.filter(item => item.room === req.params.id).filter(item => !["Pending"].includes(item.status)).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 ).slice(0, req.params.limit)

			res.json([...needs_work, ...done])
		}
		})
	})

module.exports = router
