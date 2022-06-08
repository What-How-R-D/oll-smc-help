import React, { Component, useState} from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';


export default class EditRoom extends Component {
  
  constructor(props) {
    super(props)

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeBuilding = this.onChangeBuilding.bind(this);
    this.onChangeOccupancy = this.onChangeOccupancy.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // State
    this.state = {    
      name: '',
      building: '',
      occupancy: '',
    }
  }

  componentDidMount() {
    console.log('here we go')
    axios.get('http://localhost:4000/room/find-id/' + this.props.match.params.id)
      .then(res => {
        this.setState({
          name: res.data.name,
          building: res.data.building,
          occupancy: res.data.occupancy,
        });
        console.log(this.state)
      })
      .catch((error) => {
        console.log(error);
      })
  }

  onChangeName(e) { this.setState({ name: e.target.value }) }
  onChangeBuilding(e) { this.setState({ building: e.target.value }) }
  onChangeOccupancy(e) { this.setState({ occupancy: e.target.value }) }

  onSubmit(e) {
    e.preventDefault()
    
    const UserObject = {
      name: this.state.name,
      building: this.state.building,
      occupancy: this.state.occupancy,
    };
    console.log(UserObject)
    console.log('done')
    
    axios.put('http://localhost:4000/room/update/' + this.props.match.params.id, UserObject)
      .then((res) => {
        console.log('User successfully updated')
      }).catch((error) => {
        console.log(error)
      })
 
    this.props.history.push('/room-list')
  }


  render() {
    return (<div className="form-wrapper">
      <Form onSubmit={this.onSubmit}>
        <Form.Group controlId="Name">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" value={this.state.name} onChange={this.onChangeName} />
        </Form.Group>

        <Form.Group controlId="Building">
          <Form.Label>Building</Form.Label>
          <Form.Control type="text" value={this.state.building} onChange={this.onChangeBuilding} />
        </Form.Group>

        <Form.Group controlId="Occupancy">
          <Form.Label>Occupancy</Form.Label>
          <Form.Control type="text" value={this.state.occupancy} onChange={this.onChangeOccupancy} />
        </Form.Group>


        <Button variant="danger" size="lg" block="block" type="submit">
          Update Room
        </Button>
      </Form>
    </div>);
  }
}