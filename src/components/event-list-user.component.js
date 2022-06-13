import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button'
import EventUserTableRow from './EventUserTableRow.js'


export default class EventList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      events: []
    };
    console.log(this.props.user)
  }

  async componentWillMount() {
    await axios.get('http://localhost:4000/event/find-user/' + this.props.user._id)
      .then(res => {
        this.setState({
          events: res.data
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