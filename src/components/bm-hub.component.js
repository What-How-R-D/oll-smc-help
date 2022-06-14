import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import EventBMTableRow from './EventBMTableRow.js'

export default class BMhub extends Component {
	constructor(props) {
	  super(props)
	  this.state = {
		events: [],
		pending_events: [],
		rooms: this.props.user.rooms
	  };
	}
  
	async componentDidMount() {
		console.log(this.props.user)
		var all_events = []
		for (let room in this.state.rooms) {
			var room_id = this.state.rooms[room]
			await axios.get('http://localhost:4000/event/find-room/' + room_id)
			.then(res => {
				var new_events = res.data
				all_events.push(...new_events)
			})
				.catch((error) => {
				console.log(error);
			})
		}

		var pending_events = all_events.filter(event => event.status === "Pending")
		var complete_events = all_events.filter(event => event.status !== "Pending")
		this.setState({
			pending_events: pending_events,
			events: complete_events
		});
	}
  
	DataTable(kind) {
	if (kind === "pending") {
		return this.state.pending_events.map((res, i) => {
			return <EventBMTableRow obj={res} key={i} />;
		});
	} else if (kind === "completed"){
		return this.state.events.map((res, i) => {
			return <EventBMTableRow obj={res} key={i} />;
		});
	}
	}
  
  
	render() {
	  let html
	  if (localStorage.getItem("token")) {
		html = <div className="table-wrapper">
			<h1> Pending Requests </h1>
		  <Table striped bordered hover>
			<thead>
			  <tr>
				<th>Name</th>
				<th>Room</th>
				<th>Start Time</th>
				<th>End Time</th>
				<th>Attendance</th>
				<th>Status</th>
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
		 		<th>Attendance</th>
		 		<th>Status</th>
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