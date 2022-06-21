import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import BlackoutTableRow from './BlackoutTableRow';

import {findUser} from "../api/user"

export default class BlackoutList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      blackouts: [],
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

    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/blackout/find-all`
    axios.get(url)
      .then(res => {
        this.setState({
          blackouts: res.data
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  DataTable() {
    return this.state.blackouts.map((res, i) => {
      return <BlackoutTableRow obj={res} key={i} />;
    });
  }


  render() {
    let html
    if (this.state.loggedIn) {
      html = <div className="table-wrapper">
        <Link to="/create-blackout">Create new blackout</Link>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Rooms</th>
              <th>Start time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>
            {this.DataTable()}
          </tbody>
        </Table>
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