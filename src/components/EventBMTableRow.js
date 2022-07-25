import React, { Component } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import { format } from "date-fns";

import Swal from 'sweetalert2';

export default class RoomTableRow extends Component {

    constructor(props) {
      super(props)
      
      this.approveRequest = this.approveRequest.bind(this);
      this.rejectRequest = this.rejectRequest.bind(this);

      this.state = {
        room_name: "",
        user: {name:"", email:"", phone:"", },
      };
    }



  async componentDidMount() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/find-id/${this.props.obj.requester}`
    await axios.get(url)
      .then(res => {
        this.setState({
          user: {name:res.data.name, email:res.data.email, phone:res.data.phone, }
        });
      })
      .catch((error) => {
        console.log(error);
      })

    url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-id/${this.props.obj.room}`
    await axios.get(url)
      .then(res => {
        this.setState({
          room_name: res.data.name
        });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  async approveRequest() {
      Swal.fire({
        title: `${this.state.room_name}: ${this.props.obj.name}`,
        icon: 'warning',
        html: "Verify event approval",
        showConfirmButton: true,
        confirmButtonText: `Approve`,
        showCancelButton: true,
        cancelButtonText: `Cancel`,
        showDenyButton: false,
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/approve/`
          axios.put(url + this.props.obj._id, {status: "Approved"})
            .then((res) => { console.log('Event approved') })
            .catch((error) => { console.log(error) })  
          this.props.refresh()
        }
      });
  }

  rejectRequest() {
    Swal.fire({
      title: `${this.state.room_name}: ${this.props.obj.name}`,
      icon: 'warning',
      html: "Please provide a reason for the rejection",
      showConfirmButton: true,
      confirmButtonText: `Reject`,
      showCancelButton: true,
      cancelButtonText: `Cancel`,
      showDenyButton: false,
      reverseButtons: true,
      input: "text"
    })
    .then((result) => {
      if (result.isConfirmed) {
          var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/reject/`
          axios.put(url + this.props.obj._id, {status: "Rejected", reason: result.value})
            .then((res) => { console.log('User successfully updated') })
            .catch((error) => { console.log(error) })
          this.props.refresh()
      }
    })

  }

  get_name() {
    if (this.props.obj.requester){ return <td>{this.state.user.name}</td>}
    else { return <td>{this.props.obj.contact}</td>}
  }

  get_email(){
    if (this.props.obj.requester){ return <td>{this.state.user.email}</td>}
    else { return <td>{this.props.obj.email}</td>}
  }

  get_phone(){
    if (this.props.obj.requester){ return <td>{this.state.user.phone}</td>}
    else { return <td>{this.props.obj.phone}</td>}
  }

  buttons() {
    if (this.props.obj.status === "Pending") {
      return  <td>
        <Button type="submit" size="sm" onClick={this.approveRequest}> Approve </Button>
        <Button type="submit" size="sm" variant="danger" onClick={this.rejectRequest}> Reject </Button>
        </td>
    }
  }

  render() {
    return (
      <tr>
        <td>{this.props.obj.name}</td>
        {this.get_name()}
        {this.get_email()}
        {this.get_phone()}
        <td>{this.state.room_name}</td>
        <td>{format(new Date(this.props.obj.startTime), "M/d/yyyy h:mm a")}</td>
        <td>{format(new Date(this.props.obj.endTime), "M/d/yyyy h:mm a")}</td>
        <td>{this.props.obj.attendance}</td>
        <td>{this.props.obj.status}</td>
        <td>{this.props.obj.notes}</td>
          {this.buttons()}
      </tr>
    )
  }
}
