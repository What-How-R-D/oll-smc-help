import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';

export default class Register extends Component {

	constructor(props) {
	  super(props)

	  // Setting up functions
	  this.onChangePassword = this.onChangePassword.bind(this);
	  this.onSubmit = this.onSubmit.bind(this);
  
	  // Setting up state
	  this.state = {
		password: '',
		user_id: props.match.params.id,
		token: props.match.params.token,
	  }
	}
  
	onChangePassword(e) {
	  this.setState({ password: e.target.value })
	}

	async onSubmit(e) {
		e.preventDefault()
		try {
			var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/newpassword`
			await axios.post(url, this.state)
				.then((data) => {
					window.confirm('Thank you for resetting your password. Please login with this new password')
					this.props.history.push("/login")
					window.location.reload(true)
				})
				.catch((err) => {
					window.confirm('Error resetting password. Please reset password again.')
					this.props.history.push("/resetpwd")
					window.location.reload(true)
				})
		} catch (err) {
			console.log(err)
		}
	}

	render() {
	  return (
	  <div className="form-wrapper">
    <h4>Reset password</h4>
		<Form onSubmit={this.onSubmit}>
			<Form.Group controlId="Password">
				<Form.Label>New Password</Form.Label>
				<Form.Control type="password" value={this.state.password} onChange={this.onChangePassword} />
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