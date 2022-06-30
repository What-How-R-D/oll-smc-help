import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import {findUser, checkLogin} from "../api/user"

import EventBMTableRow from './EventBMTableRow.js'

export default class BMhubList extends Component {
	constructor(props) {
	  super(props)
	 
	  this.getEvents = this.getEvents.bind(this);

	  this.state = {
		user: {},
		events: [],
		pending_events: [],
		loggedIn: false,
	  };
	}

	async componentDidMount() {
		if (await checkLogin()){
			this.setState({ loggedIn: true })
		  } else {
			this.setState({ loggedIn: false })
		  }

		var user = await findUser()
		this.setState({ user: user })
		console.log(this.state.user)
		this.getEvents()
	}

	async getEvents() {
		console.log(this.state.user)
		var all_events = []
		for (let room in this.state.user.rooms) {
			var room_id = this.state.user.rooms[room]
			var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-bm-list/${room_id}/20`
			await axios.get(url)
			.then(res => {
				var new_events = res.data
				all_events.push(...new_events)
			})
				.catch((error) => {
				console.log(error);
			})
		}

		var pending_events = all_events.filter(event => event.status === "Pending")
		pending_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
		
		var complete_events = all_events.filter(event => event.status !== "Pending")
		complete_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
		
		this.setState({
			pending_events: pending_events,
			events: complete_events
		});
	}
  
	DataTable(kind) {
		if (kind === "pending") {
			return this.state.pending_events.map((res, i) => {
				return <EventBMTableRow obj={res} key={i} refresh={this.getEvents} />;
			});
		} else if (kind === "completed"){
			return this.state.events.map((res, i) => {
				return <EventBMTableRow obj={res} key={i} />;
			});
		}
	}
  
  
	render() {
	  let html
	//   if (this.state.reload) {this.setState( {reload: false} ); console.log("refreshing")}
	  if (this.state.loggedIn && !this.state.reload) {
		html = <div className="table-wrapper">
			<h1> Pending Requests </h1>
		  <Table striped bordered hover>
			<thead>
			  <tr>
				<th>Event Name</th>
				<th>Requestor</th>
				<th>Email</th>
				<th>Phone</th>
				<th>Room</th>
				<th>Start Time</th>
				<th>End Time</th>
				<th>Attendance</th>
				<th>Status</th>
				<th>Notes</th>
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
				<th>Event Name</th>
				<th>Requestor</th>
				<th>Email</th>
				<th>Phone</th>
				<th>Room</th>
				<th>Start Time</th>
				<th>End Time</th>
				<th>Attendance</th>
				<th>Status</th>
				<th>Notes</th>
		 		</tr>
		 	</thead>
		 	<tbody>
		 		{this.DataTable("completed")}
		 	</tbody>
		 	</Table>
		 </div>
		} else if (this.state.reload) {
			this.setState( {reload: false} ); console.log("refreshing")
		} else {
		  html = <div>
			  <Link to="/login">Login for more functionality</Link>
			</div>
		}
		return (html);
	}
  }