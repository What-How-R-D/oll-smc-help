import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import {findUser, checkLogin} from "../api/user"

import EventUserTableRow from './EventUserTableRow.js'


export default class EventList extends Component {
  constructor(props) {
    super(props)    
    this.state = {
      approved_events: [],
      pending_events: [],
      canceled_events: [],
      loggedIn: checkLogin(),
    };
  }
  
  async componentDidMount() {
    const isLoggedIn = await checkLogin()
    if (isLoggedIn){
      this.setState({ loggedIn: true })
    } else {
      this.setState({ loggedIn: false })
    }

    const user = await findUser()

    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-user-sorted/${user._id}/${new Date().getTime()}/999`
    var all_events = await axios.get(url)
      .then(res => {
        return res.data;
      })
      .catch((error) => {
        console.log(error);
      })

      var pending_events = all_events.filter(event => event.status === "Pending")
      pending_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
      
      var approved_events = all_events.filter(event => event.status === "Approved")
      approved_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )

      var canceled_events = all_events.filter(event => ["Canceled", "Rejected"].includes(event.status) )
      canceled_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )
      
      this.setState({
        pending_events: pending_events,
        approved_events: approved_events,
        canceled_events: canceled_events,
      });


  }

  // DataTable() {
  //   return this.state.events.map((res, i) => {
  //     return <EventUserTableRow obj={res} key={i} />;
  //   });
  // }

  DataTable(kind) {
    if (kind === "pending") {
      return this.state.pending_events.map((res, i) => {
        return <EventUserTableRow obj={res} key={i} />;
      });
    } else if (kind === "approved"){
      return this.state.approved_events.map((res, i) => {
        return <EventUserTableRow obj={res} key={i} />;
      });
    } else if (kind === "canceled"){
      return this.state.canceled_events.map((res, i) => {
        return <EventUserTableRow obj={res} key={i} />;
      });
    }
  }



  render() {
    let html
    if (this.state.loggedIn) {
      html = <div className="table-wrapper">
        <h1> Your upcoming pending event requests </h1>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.DataTable("pending")}
          </tbody>
        </Table>
        <h1> Your upcoming approved event requests  </h1>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.DataTable("approved")}
          </tbody>
        </Table>
        <h1> Your upcoming canceled/rejected event requests  </h1>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.DataTable("canceled")}
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