import React, { Component} from "react";
import { Link } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';

import {checkLogin} from "../api/user"


export default class RejectEvent extends Component {
	constructor(props) {
	  super(props)
  
	  this.onChangeReason = this.onChangeReason.bind(this);
	  this.onSubmit = this.onSubmit.bind(this);
  
	// State
	this.state = { 
		reason: "",
	  }
	}
  
	async componentDidMount() {
	  if (await checkLogin()){
		this.setState({ loggedIn: true })
	  } else {
		this.setState({ loggedIn: false })
	  }
  
	  var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-id/`
	  await axios.get(url + this.props.match.params.id)
		.then(res => {
		  this.setState({
			name: res.data.name,
		  });
		})
		.catch((error) => {
		  console.log(error);
		})
	}
  
  
	onChangeReason(e) { this.setState({ reason: e.target.value }) }
  
	onSubmit(e) {
	  e.preventDefault()
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/reject/`
			axios.put(url + this.props.match.params.id, {status: "Rejected", reason: this.state.reason})
			.then((res) => {
				console.log('User successfully updated')
			}).catch((error) => {
				console.log(error)
			})

		this.props.history.push('/bm-hub')
	}
  
  
	render() {
	  let html
	  if (this.state.loggedIn) {
		html = <div className="form-wrapper">
		<Form onSubmit={this.onSubmit}>

		<div class="mb-3">
			<label for="reason" class="form-label"> Please supply a reason for rejecting {this.state.name} </label>
			<textarea class="form-control" id="reason" rows="3" onChange={this.onChangeReason}></textarea>
		</div>
  
		<Button variant="danger" size="sm" block="block" type="submit">
			Reject event
		</Button>

		  <Link  className="edit-link" path={"bm-hub"} to={'/bm-hub'} > Cancel  </Link>
        {/* </td> */}

		</Form>
		</div>
		} else {
		  html = <div>
			  <Link to="/login">Login for more functionality</Link>
			</div>
		}
		return (html);
	}
  }