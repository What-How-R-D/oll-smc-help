import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button'
import RoomTableRow from './RoomTableRow';


export default class RoomList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      users: []
    };
  }

  componentDidMount() {
    axios.get('http://localhost:4000/room/find-all')
      .then(res => {
        this.setState({
          users: res.data
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  DataTable() {
    return this.state.users.map((res, i) => {
      return <RoomTableRow obj={res} key={i} />;
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
              <th>Building</th>
              <th>Occupancy</th>
            </tr>
          </thead>
          <tbody>
            {this.DataTable()}
          </tbody>
        </Table>
        <Link to="/create-room">Create new room</Link>
      </div>
      } else {
        html = <div>
            <p> Please login</p>
            <Link to="/login">Login</Link>
          </div>
      }
      return (html);
  }
}