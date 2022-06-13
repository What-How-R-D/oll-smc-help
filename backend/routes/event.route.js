let mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router()

let eventSchema = require('../models/event')


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
		  console.log('Student updated successfully !')
		}
	  },
	)
  })

router.route('/delete/:id').delete((req, res, next) => {
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
  
  

module.exports = router