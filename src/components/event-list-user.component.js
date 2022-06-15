import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import {findUser} from "../api/user"

import EventUserTableRow from './EventUserTableRow.js'


export default class EventList extends Component {
  constructor(props) {
    super(props)    
    this.state = {
      events: [],
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

    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-user/`
    await axios.get(url + user._id)
      .then(res => {
        var valid_events = res.data.filter(item => new Date(item.endTime).getTime() > new Date().getTime())
        valid_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? 1 : -1 )

        this.setState({
          events: valid_events
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  DataTable() {
    return this.state.events.map((res, i) => {
      return <EventUserTableRow obj={res} key={i} />;
    });
  }



  render() {
    let html
    if (this.state.loggedIn) {
      html = <div className="table-wrapper">
        <h1> Your upcoming event request </h1>
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
            {this.DataTable()}
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