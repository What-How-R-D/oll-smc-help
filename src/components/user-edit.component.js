import React, { Component} from "react";
import { Link } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';

import {checkLogin} from "../api/user"

export default class EditUser extends Component {
  constructor(props) {
    super(props)

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeBM = this.onChangeBM.bind(this);
    this.onChangeHVAC = this.onChangeHVAC.bind(this);
    this.onChangeLocks = this.onChangeLocks.bind(this);
    this.onChangeRooms = this.onChangeRooms.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // State
    this.state = {    
      name: '',
      email: '',
      bm: false,
      hvac: false,
      locks: false,
      rooms_available: [],
      rooms_responsible: [],
      loggedIn: false,
    }
  }

  async componentDidMount() {
    if (await checkLogin()){
      this.setState({ loggedIn: true })
    } else {
      this.setState({ loggedIn: false })
    }

    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/find-id/`
    await axios.get(url + this.props.match.params.id)
      .then(res => {
        this.setState({
          name: res.data.name,
          email: res.data.email,
          type: res.data.type,
          bm: res.data.bm,
          hvac: res.data.hvac,
          locks: res.data.locks,
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

  OptionList() {
    return this.state.rooms_available.map((option) => {
      return <Form.Check 
          type="checkbox"
          key={option._id}
          id={option._id}
          label={option.name}
          checked={this.state.rooms_responsible.includes(option._id)}
          onChange={this.onChangeRooms}
        />
    })
  }

  ifBM() {
    if (this.state.bm) {
      return <Form.Group>
          <Form.Label>Rooms managed</Form.Label>
          {this.OptionList()}
        </Form.Group>
    }
  }

  onChangeRooms(e) {
    if (this.state.rooms_responsible.includes(e.target.id)) {
      this.setState({ 
        rooms_responsible: this.state.rooms_responsible.filter(
          function(room) {return room !== e.target.id}
          )})
    } else {
      this.state.rooms_responsible.push(e.target.id)
    }
    this.forceUpdate();
    }


  onChangeName(e) { this.setState({ name: e.target.value }) }
  onChangeEmail(e) { this.setState({ email: e.target.value }) }
  onChangeType(e) { this.setState({ type: e.target.value }) }


  onChangeBM(e) {
    this.setState(({ bm }) => ({ bm: !bm }));
    }
  
  onChangeHVAC(e) {
    this.setState(({ hvac }) => ({ hvac: !hvac }));
    }
  onChangeLocks(e) {
    this.setState(({ locks }) => ({ locks: !locks }));
    }

  onSubmit(e) {
    e.preventDefault()
    console.log("wat")
    console.log(this.state)
    const UserObject = {
      name: this.state.name,
      email: this.state.email,
      type: this.state.type,
      bm: this.state.bm,
      hvac: this.state.hvac,
      locks: this.state.locks,
      rooms: this.state.rooms_responsible
    };
    
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/update/`
    axios.put(url + this.props.match.params.id, UserObject)
      .then((res) => {
        console.log('User successfully updated')
      }).catch((error) => {
        console.log(error)
      })

    this.props.history.push('/user-list')
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

        <Form.Group controlId="Email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={this.state.email} onChange={this.onChangeEmail} />
        </Form.Group>
 
        <Form.Group controlId="Account type">
          <Form.Label>Account type</Form.Label>
          <select 
            value={this.state.type} 
            onChange={this.onChangeType}
            defaultValue={this.state.type}>
              <option value="Basic">Basic</option>
              <option value="Admin">Admin</option>
          </select>
        </Form.Group>

        <Form.Check 
          type="switch"
          id="HVAC"
          label="HVAC"
          checked={this.state.hvac}
          onChange={this.onChangeHVAC}
        />
        
        <Form.Check 
          type="switch"
          id="Locks"
          label="Locks"
          checked={this.state.locks}
          onChange={this.onChangeLocks}
        />

        <Form.Check 
          type="switch"
          id="Building Manager"
          label="Building Manager"
          checked={this.state.bm}
          onChange={this.onChangeBM}
        />
        
        {this.ifBM()}

        <Button variant="danger" size="lg" block="block" type="submit">
          Update User
        </Button>
      </Form>
      </div>
      } else {
        html = <div>
            <Link to="/login">Login for more functionality</Link>
          </div>
      }
      return (html);
  }
}