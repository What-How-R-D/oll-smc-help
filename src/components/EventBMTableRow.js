import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import { format } from "date-fns";

import Swal from 'sweetalert2';

export default class RoomTableRow extends Component {

    constructor(props) {
      super(props)
      
      this.approveRequest = this.approveRequest.bind(this);
      this.rejectRequest = this.rejectRequest.bind(this);
      this.requestUpdate = this.requestUpdate.bind(this);
      this.cancelRequest = this.cancelRequest.bind(this);

      this.state = {
        room_name: "",
        user: {name:"", email:"", phone:""},
      };

      console.log(this.props)
    }



  // async componentDidMount() {
  //   var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/find-id/${this.props.obj.requester}`
  //   await axios.get(url)
  //     .then(res => {
  //       this.setState({
  //         user: {name:res.data.name, email:res.data.email, phone:res.data.phone, type: res.data.type}
  //       });
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     })

  //   url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-id/${this.props.obj.room}`
  //   await axios.get(url)
  //     .then(res => {
  //       this.setState({
  //         room_name: res.data.name
  //       });
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     })
  // }

  async approveRequest() {
    if (this.props.obj.repeat){
        Swal.fire({
          title: `${this.props.obj.room}: ${this.props.obj.name}`,
          icon: 'warning',
          html: "Verify event approval",
          showConfirmButton: true,
          confirmButtonText: `Approve all repeating events`,
          showCancelButton: true,
          cancelButtonText: `Cancel`,
          showDenyButton: true,
          denyButtonText: 'Approve this event',
          reverseButtons: true,
        })
        .then((result) => {
          if (result.isDenied) {
            var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/approve/`
            axios.put(url + this.props.obj._id, {status: "Approved"})
              .then((res) => { console.log('Event approved') })
              .catch((error) => { console.log(error) })  
            this.props.refresh()
          } else if (result.isConfirmed) {
            var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/approve-repeating/`
            axios.put(url + this.props.obj.repeat, {status: "Approved"})
              .then((res) => { console.log('Events approved') })
              .catch((error) => { console.log(error) })  
            this.props.refresh()
          }
        });
    } else {
      Swal.fire({
        title: `${this.props.obj.room}: ${this.props.obj.name}`,
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

  }

  rejectRequest() {
    Swal.fire({
      title: `${this.props.obj.room}: ${this.props.obj.name}`,
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

  cancelRequest() {
    Swal.fire({
      title: `${this.props.obj.room}: ${this.props.obj.name}`,
      icon: 'warning',
      html: "Please provide a reason for the forced cancelation",
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
          var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/force-cancel/`
          axios.put(url + this.props.obj._id, {status: "Canceled", reason: result.value})
            .then((res) => { console.log('Event force canceled') })
            .catch((error) => { console.log(error) })
          this.props.refresh()
      }
    })
  }

  requestUpdate() {
    Swal.fire({
      title: this.props.obj.name,
      icon: 'warning',
      html: "What kind of update would you like made?",
      showConfirmButton: true,
      confirmButtonText: `Request Update`,
      showCancelButton: true,
      cancelButtonText: `Cancel`,
      showDenyButton: false,
      reverseButtons: true,
      input: "text",
    })
    .then((result) => {
      if (result.isConfirmed) {
        var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/request-update/`
        axios.put(url + this.props.obj._id, {reason: result.value})
        .then((res) => {
          console.log('Event update request has been sent.')
        }).catch((error) => {
          console.log(error)
        })
      }
    });
  }

  buttons(bm_type) {
    console.log(bm_type)
    if (bm_type === "Admin"){
      if (["Approved"].includes(this.props.obj.status)) {
        return  <td>
          <Link className="edit-link" path={"edit-event/:id/:token"} to={`/edit-event/${this.props.obj._id}/token`} > Edit Event </Link> 
          <Button type="submit" size="sm" variant="danger" onClick={this.cancelRequest}> Force Cancel </Button>
          </td>
      } else if (["Pending"].includes(this.props.obj.status)) {
        return  <td>
          <Link className="edit-link" path={"edit-event/:id/:token"} to={`/edit-event/${this.props.obj._id}/token`} > Edit Event </Link> 
          <Button type="submit" size="sm" onClick={this.approveRequest}> Approve </Button>
          <Button type="submit" size="sm" variant="success" onClick={this.requestUpdate}> Request Update </Button>
          <Button type="submit" size="sm" variant="danger" onClick={this.rejectRequest}> Reject </Button>
          </td>
      }
    } else {
      if (this.props.obj.status === "Pending") {
        return  <td>
          <Button type="submit" size="sm" onClick={this.approveRequest}> Approve </Button>
          <Button type="submit" size="sm" variant="success" onClick={this.requestUpdate}> Request Update </Button>
          <Button type="submit" size="sm" variant="danger" onClick={this.rejectRequest}> Reject </Button>
          </td>
      }
    }
  }

  getUnlockTime(){
    if (new Date(this.props.obj.lockStartTime).getFullYear() > 2000){
      return <td>{format(new Date(this.props.obj.lockStartTime), "M/d/yyyy h:mm a")}</td>
    } else {
      return <td>N/A</td>
    }
  }

  getRelockTime(){
    if (new Date(this.props.obj.lockStartTime).getFullYear() > 2000){
      return <td>{format(new Date(this.props.obj.lockEndTime), "M/d/yyyy h:mm a")}</td>
    } else {
      return <td>N/A</td>
    }
  }


  render() {
    return (
      <tr>
        <td>{this.props.obj.name}</td>
        <td>{this.props.obj.requester}</td>
        <td>{this.props.obj.contact}</td>
        <td>{this.props.obj.email}</td>
        <td>{this.props.obj.phone}</td>
        <td>{this.props.obj.room}</td>
        <td>{format(new Date(this.props.obj.startTime), "M/d/yyyy h:mm a")}</td>
        <td>{format(new Date(this.props.obj.endTime), "M/d/yyyy h:mm a")}</td>
        {this.getUnlockTime()}
        {this.getRelockTime()}
        <td>{this.props.obj.attendance}</td>
        <td>{this.props.obj.status}</td>
        <td>{this.props.obj.notes}</td>
        {this.buttons(this.props.bm_type)}
      </tr>
    )
  }
}
