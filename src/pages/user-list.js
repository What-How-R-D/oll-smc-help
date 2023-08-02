import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';

import { ColorRing } from 'react-loader-spinner'

import Table from 'react-bootstrap/Table';
import UserTableRow from '../components/UserTableRow';

import {findUser, checkLogin} from "../api/user"

export default class UserList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      users: [],
      loggedIn: false,
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
    
    this.setState({isLoading: false})
  }

  DataTable() {
    return this.state.users.map((res, i) => {
      return <UserTableRow obj={res} key={i} />;
    });
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
                  <th>Can Overlap Events</th>
                </tr>
              </thead>
              <tbody>
                {this.DataTable()}
              </tbody>
            </Table>
          </div>
        }
      } else {
        html = <div>
            <p> Please login</p>
            <Link to="/login">Login</Link>
          </div>
      }
      return (html);
  }
}