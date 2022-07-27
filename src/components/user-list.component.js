import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import UserTableRow from './UserTableRow';

import {findUser, checkLogin} from "../api/user"

export default class UserList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      users: [],
      loggedIn: false,
    };
  }

  async componentDidMount() {
    if (await checkLogin()){
      this.setState({ loggedIn: true })
    } else {
      this.setState({ loggedIn: false })
    }

    const user = await findUser()

    if (user['error'] === "Unauthorized") {
      this.setState({ loggedIn: false })
		} else {
      this.setState({ loggedIn: true })
		}

    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/find-all`
    axios.get(url)
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
      return <UserTableRow obj={res} key={i} />;
    });
  }


  render() {
    let html
    if (this.state.loggedIn) {
      html = <div className="table-wrapper">
        <Table striped bordered>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Emp/Min</th>
              <th>Account Type</th>
              <th>Building Manager</th>
              <th>HVAC</th>
              <th>Locks</th>
              <th>Immediate Emails</th>
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