let mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router()

let roomSchema = require('../models/room')

router.route('/create').post((req, res, next) => {
	roomSchema.create(req.body, (error, data, next) => {
	  if (error) {
		return next(error)
	  } else {
		console.log(data)
		res.json(data)
	  }
	})
  })

router.route('/find-all/:emp_min').get((req, res) => {
	// console.log("Finding all rooms ", req.params)
	roomSchema.find((error, data, next) => {
	  if (error) {
		return next(error)
	  } else {
		if ( req.params.emp_min === "true" ) {
			res.json(data)
		} else {
			var emp_min = data.filter(item => !item.emp_min)
			res.json( emp_min )
		}
	  }
	})
  })

router.route('/find-id/:id').get((req, res) => {
	// console.log("Finding room by id of ", req.params.id)
	// console.log("All parameters of, ", req.params)
	roomSchema.findById(req.params.id, (error, data, next) => {
	  if (error) {
		return next(error)
	  } else {
		res.json(data)
	  }
	})
  })

router.route('/update/:id').put((req, res, next) => {
	roomSchema.findByIdAndUpdate(
	  req.params.id,
	  {
		$set: req.body,
	  },
	  (error, data) => {
		if (error) {
		  return next(error)
		} else {
		  res.json(data)
		  console.log('Student updated successfully !')
		}
	  },
	)
  })

router.route('/delete/:id').delete((req, res, next) => {
	roomSchema.findByIdAndRemove(req.params.id, (error, data) => {
	  if (error) {
		return next(error)
	  } else {
		res.status(200).json({
		  msg: data,
		})
	  }
	})
  })


module.exports = router