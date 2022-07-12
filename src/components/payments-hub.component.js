import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import {checkLogin} from "../api/user"

import EventPaymentsTableRow from './EventPaymentsTableRow.js'

export default class PaymentsHub extends Component {
	constructor(props) {
	  super(props)
	  this.state = {
		paid_events: [],
		unpaid_events: [],
		loggedIn: false,
	  };
	}
  
	async componentDidMount() {
		if (await checkLogin()){
			this.setState({ loggedIn: true })
		  } else {
			this.setState({ loggedIn: false })
		  }
		
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-paid/50`
		var new_events = await axios.get(url)
			.then(res => {
				return res.data
			})
				.catch((error) => {
				console.log(error);
			})

		this.setState({
			unpaid_events: new_events[0],
			paid_events: new_events[1],
		});
	}
  
	DataTable(kind) {
	if (kind === "unpaid") {
		return this.state.unpaid_events.map((res, i) => {
			return <EventPaymentsTableRow obj={res} key={i} />;
		});
	} else if (kind === "paid"){
		return this.state.paid_events.map((res, i) => {
			return <EventPaymentsTableRow obj={res} key={i} />;
		});
	}
	}
  
  
	render() {
	  let html
	  if (this.state.loggedIn) {
		html = <div className="table-wrapper">
		<h1> Unpaid Requests </h1>
			<Table striped bordered hover>
				<thead>
				<tr>
					<th>Name</th>
					<th>Room</th>
					<th>Start Time</th>
					<th>End Time</th>
					<th>Requester</th>
					<th>Email</th>
					<th>Phone</th>
				</tr>
				</thead>
				<tbody>
				{this.DataTable("unpaid")}
				</tbody>
			</Table>
		<h1> Paid Requests </h1>
			<Table striped bordered hover>
				<thead>
				<tr>
					<th>Name</th>
					<th>Room</th>
					<th>Start Time</th>
					<th>End Time</th>
					<th>Requester</th>
					<th>Email</th>
					<th>Phone</th>
				</tr>
				</thead>
				<tbody>
				{this.DataTable("paid")}
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