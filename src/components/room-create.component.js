import React, { Component } from "react";
import { Link } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';

import {findUser} from "../api/user"

export default class CreateRoom extends Component {

  constructor(props) {
    super(props)

    // Setting up functions
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeBuilding = this.onChangeBuilding.bind(this);
    this.onChangeOccupancy = this.onChangeOccupancy.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Setting up state
    this.state = {
      name: '',
      building: '',
      occupancy: '',
      loggedIn: false,
    }
  }

  async componentDidMount() {
    const user = await findUser()

    if (user['error'] === "Unauthorized") {
      this.setState({ loggedIn: false })
		} else {
      this.setState({ loggedIn: true })
		}
  }

  onChangeName(e) {
    this.setState({ name: e.target.value })
  }

  onChangeBuilding(e) {
    this.setState({ building: e.target.value })
  }

  onChangeOccupancy(e) {
    this.setState({ occupancy: e.target.value })
  }

  onSubmit(e) {
    e.preventDefault()

    const roomObject = {
      name: this.state.name,
      building: this.state.building,
      occupancy: this.state.occupancy
    };
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/create`
    axios.post(url, roomObject)
      .then(res => console.log(res.data));

    this.setState({ name: '', building: '', occupancy: '' })
    this.props.history.push('/room-list')
  }

  render() {
    let html
    if (this.state.loggedIn) {
      html = <div className="form-wrapper">
      <Form onSubmit={this.onSubmit}>
        <Form.Group controlId="Name">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" value={this.state.name} onChange={this.onChangeName} />
        </Form.Group>

        <Form.Group controlId="Building">
          <Form.Label>Building</Form.Label>
          <Form.Control type="text" value={this.state.building} onChange={this.onChangeBuilding} />
        </Form.Group>

        <Form.Group controlId="Name">
          <Form.Label>Occupancy</Form.Label>
          <Form.Control type="text" value={this.state.occupancy} onChange={this.onChangeOccupancy} />
        </Form.Group>

        <Button variant="danger" size="lg" block="block" type="submit" className="mt-4">
          Create Room
        </Button>
      </Form>
    </div>;
    } else {
      html = <div>
          <p> Please login</p>
          <Link to="/login">Login</Link>
        </div>
    }
    return (html);
  }
}