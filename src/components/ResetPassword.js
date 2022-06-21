import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';

export default class Register extends Component {

	constructor(props) {
	  super(props)
  
	  // Setting up functions
	  this.onChangeEmail = this.onChangeEmail.bind(this);
	  this.onChangePassword = this.onChangePassword.bind(this);
	  this.onSubmit = this.onSubmit.bind(this);
  
	  // Setting up state
	  this.state = {
		email: '',
		password: ''
	  }
	}
  
	onChangeEmail(e) {
	  this.setState({ email: e.target.value })
	}
  
	onChangePassword(e) {
	  this.setState({ password: e.target.value })
	}

	async onSubmit(e) {
		e.preventDefault()
		try {
			var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/resetpwd/`
		  	await axios.get(url + this.state.email)

			window.confirm('Thank you for requesting a password reset.  An email will be sent shortly to reset your password')
			this.props.history.push("/")
			window.location.reload(true)
		} catch (err) {
			console.log(err)
		}
	}

	render() {
	  return (
	  <div className="form-wrapper">
    <h4>Request password reset</h4>
		<Form onSubmit={this.onSubmit}>
		  <Form.Group controlId="Email">
			<Form.Label>Email</Form.Label>
			<Form.Control type="email" value={this.state.email} onChange={this.onChangeEmail} required />
		  </Form.Group>
  
		  <Button variant="danger" size="lg" block="block" type="submit" className="mt-4">
			Reset Password
		  </Button>
		  </Form>
		<p>
		Login <Link to="/login">Login</Link>
		</p>
		<p>
		Not a user? <Link to="/register">Register</Link>
		</p>
	  </div>
	  );
	}
  }