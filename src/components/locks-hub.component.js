import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import {findUser} from "../api/user"

import EventLocksTableRow from './EventLocksTableRow.js'

export default class LocksHub extends Component {
	constructor(props) {
	  super(props)
	  this.state = {
		completed_events: [],
		canceled_events: [],
		approved_events: [],
		loggedIn: false,
	  };
	}
  
	async componentDidMount() {
		const user = await findUser()

		if (user['error'] === "Unauthorized") {
		  this.setState({ loggedIn: false })
			} else {
		  this.setState({ loggedIn: true })
			}


		var all_events = []
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-all`
		await axios.get(url)
			.then(res => {
				var new_events = res.data.filter(item => ["Approved", "Canceled"].includes(item.status))
				all_events.push(...new_events)
			})
				.catch((error) => {
				console.log(error);
			})

		var approved_events = all_events.filter(event => event.status === "Approved")
		var canceled_events = all_events.filter(event => event.status === "Canceled")
		
		var approved_needs_work = approved_events.filter(event => !event.locksSet).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
		var approved_done = approved_events.filter(event => event.locksSet)
		var canceled_needs_work = canceled_events.filter(event => event.locksSet).sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
		var canceled_done = canceled_events.filter(event => !event.locksSet)		

		var completed_events = [...approved_done, ...canceled_done].sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )

		this.setState({
			approved_events: approved_needs_work,
			canceled_events: canceled_needs_work,
			completed_events: completed_events
		});
	}
  
	DataTable(kind) {
	if (kind === "approved") {
		return this.state.approved_events.map((res, i) => {
			return <EventLocksTableRow obj={res} key={i} />;
		});
	} else if (kind === "completed"){
		return this.state.completed_events.map((res, i) => {
			return <EventLocksTableRow obj={res} key={i} />;
		});
	} else if (kind === "canceled"){
		return this.state.canceled_events.map((res, i) => {
			return <EventLocksTableRow obj={res} key={i} />;
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