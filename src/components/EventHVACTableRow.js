import React, { Component } from 'react'
// import { Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import { format } from "date-fns";


export default class HVACTableRow extends Component {

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

  setHVAC() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/update/`
    axios.put(url + this.props.obj._id, {hvacSet: true})
      .then((res) => {
        console.log('User successfully updated')
      }).catch((error) => {
        console.log(error)
      })
    window.location.reload(true);
    // this.props.refresh();
  }

  removeHVAC() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/update/`
    axios.put(url + this.props.obj._id, {hvacSet: false})
      .then((res) => {
        console.log('User successfully updated')
      }).catch((error) => {
        console.log(error)
      })
    window.location.reload(true);
    // this.props.refresh();
  }

  buttons() {
    if (this.props.obj.status === "Canceled" && this.props.obj.hvacSet) {
      return <td>
        <Button type="submit" size="sm" onClick={() => { if (window.confirm('Thank you for setting up HVAC')) this.removeHVAC() } }> Canceled </Button>
        </td>
    } else if (this.props.obj.status === "Approved" && !this.props.obj.hvacSet) {
      return <td>
        <Button type="submit" size="sm" onClick={() => { if (window.confirm('Thank you for setting up HVAC')) this.setHVAC() } }> Scheduled </Button>
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
        {this.buttons()}
      </tr>
    )
  }
}
