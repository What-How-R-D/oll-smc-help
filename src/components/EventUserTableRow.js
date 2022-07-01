import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import { format } from "date-fns";


export default class RoomTableRow extends Component {

    constructor(props) {
      super(props)
      this.state = {
        room_name: ""
      };
    }

  async componentDidMount() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-id/`
    await axios.get(url + this.props.obj.room)
      .then(res => {
        this.setState({
          room_name: res.data.name
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  cancelEvent() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/update/`
    axios.put(url + this.props.obj._id, {status: "Canceled"})
      .then((res) => {
        console.log('User successfully updated')
      }).catch((error) => {
        console.log(error)
      })
    window.location.reload(true);
  }

  buttons() {
      if ( ["Pending"].includes(this.props.obj.status) ) {
      return <td>
          <Link className="edit-link" path={"edit-event/:id/:token"} to={`/edit-event/${this.props.obj._id}/token`} > Edit Event </Link> 
          <Button type="submit" size="sm" variant="danger" onClick={() => { if (window.confirm('Are you sure you want to cancel this event?')) this.cancelEvent() } }> Request Cancelation </Button> 
        </td>
    } else if ( ["Approved"].includes(this.props.obj.status) ) {
      return <td> 
          <Button type="submit" size="sm" variant="danger" onClick={() => { if (window.confirm('Are you sure you want to cancel this event?')) this.cancelEvent() } }> Request Cancelation </Button> 
        </td>
    }
  }

  render() {
    return (
      <tr>
        <td>{this.props.obj.name}</td>
        <td>{this.state.room_name}</td>
        <td>{format(new Date(this.props.obj.startTime), "M/d/yyyy H:mm a")}</td>
        <td>{format(new Date(this.props.obj.endTime), "M/d/yyyy H:mm a")}</td>
        <td>{this.props.obj.status}</td>
        {this.buttons()}
      </tr>
    )
  }
}
