import React, { Component } from 'react'
// import { Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import { format } from "date-fns";


export default class PaymentsTableRow extends Component {

    constructor(props) {
      super(props)
      this.state = {
        room_name: "",
        requestor: "",
        user: {},
      };
    }

  async componentDidMount() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-id/`
    await axios.get(url + this.props.obj.room)
      .then(res => {
        this.setState({ room_name: res.data.name });
      })
      .catch((error) => {
        console.log(error);
      })

      
      var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/find-id/`
      var user = await axios.get(url + this.props.obj.requestor)
        .then(res => {
          return res.data
          })
        .catch((error) => {
          console.log(error);
        })
      this.setState({ user:user });
  }

  recordPayment() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/update/`
    axios.put(url + this.props.obj._id, {paid: true})
      .then((res) => {
        console.log('Payment successfully recorded')
      }).catch((error) => {
        console.log(error)
      })
    window.location.reload(true);
  }

  buttons() {
    if (this.props.obj.status === "Approved" && !this.props.obj.paid) {
      return <td>
        <Button type="submit" size="sm" onClick={() => { if (window.confirm('Thank you for recording payment')) this.recordPayment() } }> Record Payment </Button>
        </td>
    }     
  }

  render() {
    return (
      <tr>
        <td>{this.props.obj.name}</td>
        <td>{this.state.room_name}</td>
        <td>{format(new Date(this.props.obj.startTime), "M/d/yyyy h:mm a")}</td>
        <td>{format(new Date(this.props.obj.endTime), "M/d/yyyy h:mm a")}</td>
        <td>{this.state.user.name}</td>
        <td>{this.state.user.email}</td>
        <td>{this.state.user.phone}</td>
        {this.buttons()}
      </tr>
    )
  }
}
