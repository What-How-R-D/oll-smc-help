import React, { Component, useState} from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';


export default class EditUser extends Component {
  constructor(props) {
    super(props)

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeBM = this.onChangeBM.bind(this);
    this.onChangeHVAC = this.onChangeHVAC.bind(this);
    this.onChangeLocks = this.onChangeLocks.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // State
    this.state = {    
      name: '',
      email: '',
      bm: false,
      hvac: false,
      locks: false,
    }
  }

  componentDidMount() {
    axios.get('http://localhost:4000/users/find-id/' + this.props.match.params.id)
      .then(res => {
        this.setState({
          name: res.data.name,
          email: res.data.email,
          type: res.data.type,
          bm: res.data.bm,
          hvac: res.data.hvac,
          locks: res.data.locks
        });
        console.log(this.state)
      })
      .catch((error) => {
        console.log(error);
      })
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
      locks: this.state.locks
    };
    
    axios.put('http://localhost:4000/users/update/' + this.props.match.params.id, UserObject)
      .then((res) => {
        console.log('User successfully updated')
      }).catch((error) => {
        console.log(error)
      })

    this.props.history.push('/user-list')
  }


  render() {
    return (<div className="form-wrapper">
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
          id="Building Manager"
          label="Building Manager"
          checked={this.state.bm}
          onChange={this.onChangeBM}
        />

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

        <Button variant="danger" size="lg" block="block" type="submit">
          Update User
        </Button>
      </Form>
    </div>);
  }
}