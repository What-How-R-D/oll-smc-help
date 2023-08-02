import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import { ColorRing } from 'react-loader-spinner'

import {checkLogin} from "../api/user"

import EventHVACTableRow from '../components/EventHVACTableRow.js'

export default class HVAChub extends Component {
	constructor(props) {
	  super(props)

	  this.getEvents = this.getEvents.bind(this)

	  this.state = {
		completed_events: [],
		canceled_events: [],
		approved_events: [],
		loggedIn: false,
		refresh: "",
		isLoading: true,
	  };
	}
	
	async componentDidMount() {
		this.setState({isLoading: true})
		if (await checkLogin()){
			this.setState({ loggedIn: true })
		  } else {
			this.setState({ loggedIn: false })
		  }
		await this.getEvents()
		this.setState({isLoading: false})
	}
  
	async getEvents() {
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-hvac/50`
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
			return <EventHVACTableRow obj={res} key={i} refresh={this.getEvents} />;
		});
	} else if (kind === "completed"){
		return this.state.completed_events.map((res, i) => {
			return <EventHVACTableRow obj={res} key={i} refresh={this.getEvents}  />;
		});
	} else if (kind === "canceled"){
		return this.state.canceled_events.map((res, i) => {
			return <EventHVACTableRow obj={res} key={i} refresh={this.getEvents}  />;
		});
	}
	}
  
	newTable(){
		if (this.state.approved_events.length !== 0 ) {
			return <div> <h1> New HVAC Requests </h1>
			<Table striped bordered hover>
				<thead>
				<tr>
					<th>Name</th>
					<th>Room</th>
					<th>Start Time</th>
					<th>End Time</th>
					<th>Status</th>
					<th>Notes</th>
				</tr>
				</thead>
				<tbody>
				{this.DataTable("approved")}
				</tbody>
			</Table>
			</div>
		} else {
			return <h2> No new requests </h2>
		}
	}
  
	canceledTables(){
		if (this.state.canceled_events.length !== 0 ) {
		return <div><h1> Canceled HVAC Requests </h1>
			<Table striped bordered hover>
				<thead>
				<tr>
					<th>Name</th>
					<th>Room</th>
					<th>Start Time</th>
					<th>End Time</th>
					<th>Status</th>
					<th>Notes</th>
				</tr>
				</thead>
				<tbody>
				{this.DataTable("canceled")}
				</tbody>
			</Table>
			</div>
		} else {
			return <h2> No canceled requests to handle </h2>
		}
	}

	completedTable(){
		if (this.state.completed_events.length !== 0 ) {
			return <div> <h1> Completed HVAC Requests </h1>
		 	<Table striped bordered hover>
		 	<thead>
		 		<tr>
		 		<th>Name</th>
		 		<th>Room</th>
		 		<th>Start Time</th>
		 		<th>End Time</th>
				<th>Status</th>
				<th>Notes</th>
		 		</tr>
		 	</thead>
		 	<tbody>
		 		{this.DataTable("completed")}
		 	</tbody>
		 	</Table>
		 </div>
		} else {
			return <h2> No completed event requests. </h2>
		}
	}

	render() {
	  let html
	  if (this.state.loggedIn) {
			if (this.state.isLoading) {
				html = <div style={{display: 'flex', justifyContent: 'center'}}>
					<ColorRing
					visible={true}
					height="80"
					width="80"
					ariaLabel="blocks-loading"
					wrapperStyle={{}}
					wrapperClass="blocks-wrapper"
					colors={['#014686ff', '#FFFFFF', '#014686ff', '#FFFFFF', '#014686ff']}
					/>
					</div>
			} else {
				html = <div className="table-wrapper">
					{this.newTable()}
					{this.canceledTables()}
					{this.completedTable()}
					</div>
			}
		} else {
		  html = <div>
			  <Link to="/login">Login for more functionality</Link>
			</div>
		}
		return (html);
	}
  }