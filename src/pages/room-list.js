import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import RoomTableRow from '../components/RoomTableRow';

import { ColorRing } from 'react-loader-spinner'

import {checkLogin} from "../api/user"

export default class RoomList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      rooms: [],
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

    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-all/true`
    await axios.get(url)
      .then(res => {
        this.setState({
          rooms: res.data
        });
      })
      .catch((error) => {
        console.log(error);
      })
    this.setState({isLoading: false})
  }

  DataTable() {
    return this.state.rooms.map((res, i) => {
      return <RoomTableRow obj={res} key={i} />;
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
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Building</th>
                  <th>Occupancy</th>
                  <th>Emp/Min Only</th>
                </tr>
              </thead>
              <tbody>
                {this.DataTable()}
              </tbody>
            </Table>
            <Link to="/create-room">Create new room</Link>
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