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
    };
  }

  async componentDidMount() {
    const user = await findUser()

    await axios.get('http://localhost:4000/event/find-user/' + user._id)
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
    if (localStorage.getItem("token")) {
      html = <div className="table-wrapper">
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