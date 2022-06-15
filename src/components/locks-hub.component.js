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
		events: [],
		pending_events: [],
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
				var new_events = res.data
				all_events.push(...new_events)
			})
				.catch((error) => {
				console.log(error);
			})

		var pending_events = all_events.filter(event => !event.locksSet)
		pending_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
		
		var complete_events = all_events.filter(event => event.locksSet)
		complete_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
		
		this.setState({
			pending_events: pending_events,
			events: complete_events
		});
	}
  
	DataTable(kind) {
	if (kind === "pending") {
		return this.state.pending_events.map((res, i) => {
			return <EventLocksTableRow obj={res} key={i} />;
		});
	} else if (kind === "completed"){
		return this.state.events.map((res, i) => {
			return <EventLocksTableRow obj={res} key={i} />;
		});
	}
	}
  
  
	render() {
	  let html
	  if (this.state.loggedIn) {
		html = <div className="table-wrapper">
			<h1> Pending Requests </h1>
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
			  {this.DataTable("pending")}
			</tbody>
		  </Table>
			<h1> Completed Requests </h1>
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