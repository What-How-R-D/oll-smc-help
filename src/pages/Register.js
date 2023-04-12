import React, { Component } from "react"
import { Link } from "react-router-dom"

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';

import Swal from 'sweetalert2';

export default class Register extends Component {

	constructor(props) {
	  super(props)
  
	  // Setting up functions
	  this.onChangeName = this.onChangeName.bind(this);
	  this.onChangeEmail = this.onChangeEmail.bind(this);
	  this.onChangePassword = this.onChangePassword.bind(this);
	  this.onChangePhone = this.onChangePhone.bind(this);
	  this.onSubmit = this.onSubmit.bind(this);
  
	  // Setting up state
	  this.state = {
		name: '',
		email: '',
		password: '',
		phone: "",
	  }
	}
  
	onChangeName(e) { this.setState({ name: e.target.value }) }
	onChangeEmail(e) { this.setState({ email: e.target.value }) }
	onChangePassword(e) { this.setState({ password: e.target.value }) }
	onChangePhone(e) { this.setState({ phone: e.target.value }) }
  
	async onSubmit(e) {
		e.preventDefault()
		try {
			var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/register`
			await axios.post(url, this.state)
			.then((res) => {
				console.log(res)
				Swal.fire({
					position: 'top-end',
					icon: 'success',
					title: 'Thank you for registering!',
					html: 'Please check your email to validate your account.',
					showConfirmButton: false,
					timer: 5000
				  })
				this.props.history.push("/login")
			})
			.catch( (err) => {
				Swal.fire({
					position: 'top-end',
					icon: 'error',
					title: 'Email already exists.',
					html: 'Reset password if necessary.',
					showConfirmButton: false,
					timer: 5000
				  })
				this.props.history.push("/login")
			})

		} catch (err) {
			console.log(err)
		}
	}

	render() {
	  return (
	  <div className="form-wrapper">
		<h4>Register</h4>
		<Form onSubmit={this.onSubmit}>
		  <Form.Group controlId="Name">
			<Form.Label>Name</Form.Label>
			<Form.Control type="text" value={this.state.name} onChange={this.onChangeName} required />
		  </Form.Group>
  
		  <Form.Group controlId="Email">
			<Form.Label>Email</Form.Label>
			<Form.Control type="email" value={this.state.email} onChange={this.onChangeEmail} required />
		  </Form.Group>
  
		  <Form.Group controlId="Password">
			<Form.Label>Password</Form.Label>
			<Form.Control type="password" value={this.state.password} onChange={this.onChangePassword} required />
		  </Form.Group>

 		  <Form.Group controlId="phone">
			<Form.Label>Phone Number</Form.Label>
			<Form.Control type="text" value={this.state.phone} onChange={this.onChangePhone} required />
		  </Form.Group>

		  <Button variant="danger" size="lg" block="block" type="submit" className="mt-4">
			Register
		  </Button>
		  </Form>
		<p>
			Already a user? <Link to="/login">Login</Link>
		</p>
	  </div>
	  );
	}
  }