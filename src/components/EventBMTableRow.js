import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import { format } from "date-fns";


export default class RoomTableRow extends Component {

    constructor(props) {
      super(props)
      this.state = {
        room_name: "",
        user: {name:"", email:"", phone:"", },
      };
    }

  async componentDidMount() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/find-id/${this.props.obj.requestor}`
    await axios.get(url)
      .then(res => {
        this.setState({
          user: {name:res.data.name, email:res.data.email, phone:res.data.phone, }
        });
      })
      .catch((error) => {
        console.log(error);
      })

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

  approveRequest() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/approve/`
    axios.put(url + this.props.obj._id, {status: "Approved"})
      .then((res) => {
        console.log('User successfully updated')
      }).catch((error) => {
        console.log(error)
      })
    window.location.reload(true);
  }

  rejectRequest() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/reject/`
    axios.put(url + this.props.obj._id, {status: "Rejected"})
    .then((res) => {
      console.log('User successfully updated')
    }).catch((error) => {
      console.log(error)
    })
    window.location.reload(true);
  }

  buttons() {
    if (this.props.obj.status === "Pending") {
      return  <td>
        <Button type="submit" size="sm" onClick={() => { if (window.confirm('Are you sure you want to approve this request ?')) this.approveRequest() } }> Approve </Button>
        <Link  className="edit-link" path={"reject-event/:id"} to={'/reject-event/' + this.props.obj._id} > Reject </Link>
        </td>
    }
  }

  render() {
    return (
      <tr>
        <td>{this.props.obj.name}</td>
        <td>{this.state.user.name}</td>
        <td>{this.state.user.email}</td>
        <td>{this.state.user.phone}</td>
        <td>{this.state.room_name}</td>
        <td>{format(new Date(this.props.obj.startTime), "M/d/yyyy H:mm a")}</td>
        <td>{format(new Date(this.props.obj.endTime), "M/d/yyyy H:mm a")}</td>
        <td>{this.props.obj.attendance}</td>
        <td>{this.props.obj.status}</td>
        <td>{this.props.obj.notes}</td>
          {this.buttons()}
      </tr>
    )
  }
}
