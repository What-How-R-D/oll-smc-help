import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import {checkLogin} from "../api/user"

import { ColorRing } from 'react-loader-spinner'

import EventPaymentsTableRow from '../components/EventPaymentsTableRow.js'

export default class PaymentsHub extends Component {
	constructor(props) {
	  super(props)

		this.getEvents = this.getEvents.bind(this);

	  this.state = {
		paid_events: [],
		unpaid_events: [],
		loggedIn: false,
		isLoading: true,
	  };
	}
  
	async componentDidMount() {
		this.setState({ isLoading: true })
		if (await checkLogin()){
			this.setState({ loggedIn: true })
		  } else {
			this.setState({ loggedIn: false })
		  }
		await this.getEvents()
		this.setState({ isLoading: false })
	}
	
	async getEvents() {
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
			return <EventPaymentsTableRow obj={res} key={i} refresh={this.getEvents} />;
		});
	} else if (kind === "paid"){
		return this.state.paid_events.map((res, i) => {
			return <EventPaymentsTableRow obj={res} key={i} refresh={this.getEvents} />;
		});
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
						<th>Event Contact</th>
						<th>Email</th>
						<th>Phone</th>
					</tr>
					</thead>
					<tbody>
					{this.DataTable("paid")}
					</tbody>
				</Table>
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