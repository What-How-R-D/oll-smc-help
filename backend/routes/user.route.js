const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { requireLogin } = require("../middleware/auth")

let mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router()

let userSchema = require('../models/user')

const sendNotification = require("../middleware/mailer")

router.get("/auth", requireLogin, async (req, res) => {
	try {
	  const user = await userSchema.findById(req.user._id).select("-password")
	  res.json(user)
	} catch (err) {
	  console.log(err)
	}
  })

router.post("/login", async (req, res) => {
	const email = req.body.email
	const password = req.body.password
	try {
	  let user = await userSchema.findOne({ email })
	  if (!user) {
		return res.status(401).json({ error: "User not registered" })
	  }
	  const isMatched = await bcrypt.compare(password, user.password)
	  if (!isMatched) {
		return res.status(401).json({ error: "Invalid Credentials" })
	  }
	  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "1h",
	  })
	  res.json({ token: token })
	} catch (err) {
	  console.log(err)
	}
  })

router.route('/register').post(async (req, res, next) => {
	const email = req.body.email
	let user = await userSchema.findOne({ email })
	if (user) {
		return res.json({ error: "User already exists" })
	  }

	const name = req.body.name
	const password = req.body.password 
	const hashedPassword = await bcrypt.hash(password, 10);
	
	const userObject = {
		name: name,
		email: email,
		password: hashedPassword
	};

	userSchema.create(userObject, (error, data) => {
	  if (error) {
		return next(error)
	  } else {
		console.log(data)
		res.json(data)
	  }
	})
  })

router.route('/find-all', requireLogin).get((req, res) => {
	userSchema.find((error, data) => {
	  if (error) {
		return next(error)
	  } else {
		res.json(data)
	  }
	})
  })

router.route('/resetpwd/:email').get(async (req, res) => {
	const user_data = await userSchema.findOne({ email: req.params.email})
		.then((data) => { 
			return data
		})
		.catch((err) => { console.log("Error sending reset password:", err); });
	console.log(user_data)
	
	const token = await jwt.sign( { _id: user_data._id } , user_data.password, { expiresIn: "1h", })
	console.log(token)

	userSchema.findByIdAndUpdate(user_data._id,
		{ $set: {reset_token: token},},
		(error, data) => {
		  if (error) { return next(error)
		  } else {console.log('Password reset token set.') }
		},
	  )

	var subject=`OLL-SMC help password reset`
	var body=`To reset your password follow this link http://45.33.18.72:3000//newpassword/${user_data._id}/${token}`
	sendNotification(user_data.email, subject, body)

  })

router.route('/newpassword').post(async (req, res) => {
	console.log(req.body.user_id)

	try {
		const user_pwd = await userSchema.findById(req.body.user_id).select("password")
		jwt.verify(req.body.token, user_pwd.password)

		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		userSchema.findByIdAndUpdate(
			req.body.user_id,
			{ password: hashedPassword },
			(error, data) => {
				if (error) {return next(error)
				} else {
				  res.json(data)
				  console.log('User password updated successfully !')
				}
			  },
		  )
	} catch (err) {
		return res.status(401).json({ error: "Unauthorized" })
	}
  })

router.route('/find-id/:id').get((req, res) => {
	userSchema.findById(req.params.id, (error, data) => {
	  if (error) {
		return next(error)
	  } else {
		res.json(data)
	  }
	})
  })

// Update User
router.route('/update/:id').put((req, res, next) => {
	userSchema.findByIdAndUpdate(
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
		  console.log('User updated successfully !')
		}
	  },
	)
  })

// Delete User
router.route('/delete/:id').delete((req, res, next) => {
	userSchema.findByIdAndRemove(req.params.id, (error, data) => {
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