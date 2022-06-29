import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';

export default class Register extends Component {

	constructor(props) {
	  super(props)

  
	  // Setting up state
	  this.state = {
		user_id: props.match.params.id,
		token: props.match.params.token,
	  }
	}

	async validate() {
		try {
			var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/validate`
			await axios.post(url, this.state)
				.then((data) => {
					window.confirm('Thank you for validating your email. Please login')
					this.props.history.push("/login")
					window.location.reload(true)
				})
				.catch((err) => {
					window.confirm('Error validating email. Please try and reset your password.')
					this.props.history.push("/resetpwd")
					window.location.reload(true)
				})
		} catch (err) {
			console.log(err)
		}
	}

	render() {
	  return ( this.validate() );
	}
  }