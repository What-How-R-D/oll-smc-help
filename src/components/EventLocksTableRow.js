import React, { Component } from 'react'
// import { Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import { format } from "date-fns";


export default class EventLocksTableRow extends Component {

    constructor(props) {
      super(props)
      this.state = {
        room_name: ""
      };
    }

  async componentDidMount() {
    await axios.get('http://localhost:4000/room/find-id/' + this.props.obj.room)
      .then(res => {
        this.setState({
          room_name: res.data.name
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  setLocks() {
    axios.put('http://localhost:4000/event/update/' + this.props.obj._id, {locksSet: true})
      .then((res) => {
        console.log('User successfully updated')
      }).catch((error) => {
        console.log(error)
      })
    window.location.reload(true);
  }


  buttons() {
    if (!this.props.obj.locksSet) {
      return  <td>
        <Button type="submit" size="sm" onClick={() => { if (window.confirm('Thank you for setting locks')) this.setLocks() } }> Completed </Button>
      </td>
    }
  }

  render() {
    return (
      <tr>
        <td>{this.props.obj.name}</td>
        <td>{this.state.room_name}</td>
        <td>{format(new Date(this.props.obj.lockStartTime), "M/d/yyyy H:mm a")}</td>
        <td>{format(new Date(this.props.obj.lockEndTime), "M/d/yyyy H:mm a")}</td>
          {this.buttons()}
      </tr>
    )
  }
}
