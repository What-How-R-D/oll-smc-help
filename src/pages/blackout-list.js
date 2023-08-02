import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import BlackoutTableRow from '../components/BlackoutTableRow';

import { ColorRing } from 'react-loader-spinner'

import {checkLogin} from "../api/user"

export default class BlackoutList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      blackouts: [],
      loggedIn: false,
      isLoading: true,
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: true})
    if (await checkLogin()){
      this.setState({ loggedIn: true })
    } else {
      this.setState({ loggedIn: false })
    }

    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/blackout/find-all`
    await axios.get(url)
      .then(res => {
        this.setState({
          blackouts: res.data
        });
      })
      .catch((error) => {
        console.log(error);
      })
    this.setState({ isLoading: false})
  }

  DataTable() {
    return this.state.blackouts.map((res, i) => {
      return <BlackoutTableRow obj={res} key={i} />;
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