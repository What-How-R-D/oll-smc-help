import React, { Component } from "react";
import { Link } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';

import DateTimePicker from 'react-datetime-picker';

import {findUser, checkLogin} from "../api/user"

export default class CreateRoom extends Component {

  constructor(props) {
    super(props)

    // Setting up functions
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeRooms = this.onChangeRooms.bind(this);
    this.onChangeStartTime = this.onChangeStartTime.bind(this);
    this.onChangeEndTime = this.onChangeEndTime.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Setting up state
    this.state = {
      name: '',
      user_bm: false,
      startTime: '',
      endTime: '',
      loggedIn: false,
      user_type: "",
      rooms_available: [],
      rooms_selected: [],
      rooms_responsible: [],
      requestor: "",
    }
  }

  async componentDidMount() {
    if (await checkLogin()){
      this.setState({ loggedIn: true })
    } else {
      this.setState({ loggedIn: false })
    }

    const user = await findUser()

  var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/find-id/`
  await axios.get(url + user._id)
    .then(res => {
      this.setState({
        requestor: user._id,
        user_type: res.data.type,
        user_bm: res.data.bm,
        rooms_responsible: res.data.rooms,
      });
    })
    .catch((error) => {
      console.log(error);
    })
  
  url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-all`
    await axios.get(url)
      .then(res => {
        this.setState({
          rooms_available: res.data
        });
      })
      .catch((error) => {
        console.log(error);
      })
    
  }

  onChangeName(e) {
    this.setState({ name: e.target.value })
  }

  onChangeStartTime(e) { 
    this.setState({ startTime: e }) 
    if (this.state.endTime === "") {
      let end = new Date(e)
      end.setHours(23,59,59,999)
      this.setState({ endTime: end }) 
    }
  }
  onChangeEndTime(e) { this.setState({ endTime: e }) }
  
  findRooms() {
    if (this.state.user_type === "Admin") {
      return <Form.Group>
          <Form.Label>Select rooms</Form.Label>
          {this.OptionList("admin")}
        </Form.Group>
    } else if (this.state.user_bm) {
      return <Form.Group>
          <Form.Label>Select rooms</Form.Label>
          {this.OptionList("bm")}
        </Form.Group>
    }
  }

  OptionList(kind) {
    if (kind === "admin") {
      return this.state.rooms_available.map((option) => {
        return <Form.Check 
            type="checkbox"
            key={option._id}
            id={option._id}
            label={option.name}
            checked={this.state.rooms_selected.includes(option._id)}
            onChange={this.onChangeRooms}
          />
      })
    } else if (kind === "bm") {
      return this.state.rooms_available.map((option) => {
        if (this.state.rooms_responsible.includes(option._id)) {
          return <Form.Check 
              type="checkbox"
              key={option._id}
              id={option._id}
              label={option.name}
              checked={this.state.rooms_selected.includes(option._id)}
              onChange={this.onChangeRooms}
            />
        }
      })
    }
  }

  onChangeRooms(e) {
    if (this.state.rooms_selected.includes(e.target.id)) {
      this.setState({ 
        rooms_selected: this.state.rooms_selected.filter(
          function(room) {return room !== e.target.id}
          )})
    } else {
      this.state.rooms_selected.push(e.target.id)
    }
    this.forceUpdate();
    }

  onSubmit(e) {
    e.preventDefault()

    const roomObject = {
      name: this.state.name,
      rooms: this.state.rooms_selected,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      requestor: this.state.requestor,
    };
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/blackout/create`
    axios.post(url, roomObject)
      .then(res => console.log(res.data));

    this.props.history.push('/blackout-list')
  }

  render() {
    let html
    if (this.state.loggedIn) {
      html = <div className="form-wrapper">
        <h2> Create new blackout times </h2>
      <Form onSubmit={this.onSubmit}>
        <Form.Group controlId="Name">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" value={this.state.name} onChange={this.onChangeName} />
        </Form.Group>

        {this.findRooms()}

        <div>
          Blackout Start: 
          <DateTimePicker
            onChange={this.onChangeStartTime}
            value={this.state.startTime}
            disableClock={true}
          />
        </div>

        <div>
          Blackout End:
          <DateTimePicker
            onChange={this.onChangeEndTime}
            value={this.state.endTime}
            disableClock={true}
          />
        </div>


        <Button variant="danger" size="lg" block="block" type="submit" className="mt-4">
          Create Blackout
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