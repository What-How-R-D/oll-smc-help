import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import {checkLogin} from "../api/user"

import EventLocksTableRow from './EventLocksTableRow.js'

export default class LocksHub extends Component {
	constructor(props) {
	  super(props)
	  
	  this.getEvents = this.getEvents.bind(this)

	  this.state = {
		completed_events: [],
		canceled_events: [],
		approved_events: [],
		loggedIn: false,
	  };
	}
  
	async componentDidMount() {
		if (await checkLogin()){
			this.setState({ loggedIn: true })
		  } else {
			this.setState({ loggedIn: false })
		  }
		this.getEvents()
	}
	
	async getEvents() {
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-locks/50`
		var new_events = await axios.get(url)
			.then(res => {
				return res.data
			})
				.catch((error) => {
				console.log(error);
			})

		this.setState({
			approved_events: new_events[0],
			canceled_events: new_events[1],
			completed_events: new_events[2]
		});
	}
  
	DataTable(kind) {
	if (kind === "approved") {
		return this.state.approved_events.map((res, i) => {
			return <EventLocksTableRow obj={res} key={i} refresh={this.getEvents} />;
		});
	} else if (kind === "completed"){
		return this.state.completed_events.map((res, i) => {
			return <EventLocksTableRow obj={res} key={i} refresh={this.getEvents} />;
		});
	} else if (kind === "canceled"){
		return this.state.canceled_events.map((res, i) => {
			return <EventLocksTableRow obj={res} key={i} refresh={this.getEvents} />;
		});
	}
	}
  
  
	render() {
	  let html
	  if (this.state.loggedIn) {
		html = <div className="table-wrapper">
		<h1> New Locks Requests </h1>
		  <Table striped bordered hover>
			<thead>
			  <tr>
				<th>Name</th>
				<th>Room</th>
				<th>Start Time</th>
				<th>End Time</th>
			  </tr>
			</thead>
			<tbody>
			  {this.DataTable("approved")}
			</tbody>
		  </Table>
		<h1> Canceled Locks Requests </h1>
		  <Table striped bordered hover>
			<thead>
			  <tr>
				<th>Name</th>
				<th>Room</th>
				<th>Start Time</th>
				<th>End Time</th>
			  </tr>
			</thead>
			<tbody>
			  {this.DataTable("canceled")}
			</tbody>
		  </Table>
		<h1> Completed Locks Requests </h1>
			<Table striped bordered hover>
		 	<thead>
		 		<tr>
		 		<th>Name</th>
		 		<th>Room</th>
		 		<th>Start Time</th>
		 		<th>End Time</th>
		 		</tr>
		 	</thead>
		 	<tbody>
		 		{this.DataTable("completed")}
		 	</tbody>
		 	</Table>
		 </div>
		} else {
		  html = <div>
			  <Link to="/login">Login for more functionality</Link>
			</div>
		}
		return (html);
	}
  }