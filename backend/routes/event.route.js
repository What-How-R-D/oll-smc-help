let mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router()

let eventSchema = require('../models/event')

const sendNotification = require("../middleware/mailer")

router.route('/create').post((req, res, next) => {
	eventSchema.create(req.body, (error, data) => {
	  if (error) {
		return next(error)
	  } else {
		console.log(data)
		res.json(data)
	  }
	})
  })

router.route('/update/:id').put((req, res, next) => {
	eventSchema.findByIdAndUpdate(
	  req.params.id,
	  {
		$set: req.body,
	  },
	  (error, data) => {
		if (error) {
		  return next(error)
		  console.log(error)
		} else {
		  res.json(data)
		}
	  },
	)
  })

  router.route('/approve/:id').put((req, res, next) => {
	eventSchema.findByIdAndUpdate(
		req.params.id,
		{
		  $set: req.body,
		},
		(error, data) => {
		  if (error) {
			return next(error)
			console.log(error)
		  } else {
			console.log(data)
			var subject=`${data.name} building request has been approved`
			var body=`Your event ${data.name} building request has been approved.  It is scheduled from ${data.startTime} to ${data.endTime}.  The doors will unlock at ${data.lockStartTime} and the doors will lock at ${data.lockEndTime}.`
			sendNotification(data.email, subject, body)
			res.json(data)
		  }
		},
	  )
	})

router.route('/reject/:id').put((req, res, next) => {
		eventSchema.findByIdAndUpdate(
			req.params.id,
			{
			  $set: req.body,
			},
			(error, data) => {
			  if (error) {
				return next(error)
				console.log(error)
			  } else {
				console.log(data)
				var subject=`${data.name} building request has been rejected`
				var body=`Your event ${data.name} building request has been reject.  For more information please contact the parish office.`
				sendNotification(data.email, subject, body)
				res.json(data)
			  }
			},
		  )
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