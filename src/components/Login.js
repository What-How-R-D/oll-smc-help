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

		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/login`
		// var res = await axios.post(url, this.state)
		axios.post(url, this.state)
			.then((res) => {
				localStorage.setItem("token", res.data.token)
				this.props.history.push("/")
				window.location.reload(true)
			})
			.catch((err) => {
				window.confirm('Error logging in password. Please try again or reset password.')
				this.setState({ email: '', password: '' })
				this.props.history.push("/login")
				window.location.reload(true)
			})

	}

	render() {
	  return (
	  <div className="form-wrapper">
    <h4>Log into your account</h4>
		<Form onSubmit={this.onSubmit}>
		  <Form.Group controlId="Email">
			<Form.Label>Email</Form.Label>
			<Form.Control type="email" value={this.state.email} onChange={this.onChangeEmail} required />
		  </Form.Group>
  
		  <Form.Group controlId="Password">
			<Form.Label>Password</Form.Label>
			<Form.Control type="password" value={this.state.password} onChange={this.onChangePassword} required />
		  </Form.Group>
  
		  <Button variant="danger" size="lg" block="block" type="submit" className="mt-4">
			Log in
		  </Button>
		  </Form>
		<p>
		Forgot password? <Link to="/resetpwd">Reset Password</Link>
		</p>
		<p>
		Not a user? <Link to="/register">Register</Link>
		</p>
	  </div>
	  );
	}
  }