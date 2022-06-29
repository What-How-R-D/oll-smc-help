import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import { format } from "date-fns";

import {findUser} from "../api/user"

export default class BlackoutTableRow extends Component {
  constructor(props) {
    super(props)
    this.deleteBlackout = this.deleteBlackout.bind(this)

    // Setting up state
    this.state = {
      loggedIn: false,
      rooms_available: [],
    }
  }

  async componentDidMount() {
    const user = await findUser()

    if (user['error'] === "Unauthorized") {
      this.setState({ loggedIn: false })
		} else {
      this.setState({ loggedIn: true })
		}

  var url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-all/true`
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

  deleteBlackout() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/blackout/delete/`
    axios
      .delete(
        url + this.props.obj._id,
      )
      .then((res) => {
        console.log('Room successfully deleted!')
      })
      .catch((error) => {
        console.log(error)
      })
  }

  getRooms(room_list){
    var room_names = ""
    this.state.rooms_available.forEach(
      function(room) { 
      if (room_list.includes(room._id)) {
          room_names += `${room.name}, `
      }
    })
    return room_names
  }
  
  render() {
    return (
      <tr>
        <td>{this.props.obj.name}</td>
        <td>{this.getRooms(this.props.obj.rooms)}</td>
        <td>{format(new Date(this.props.obj.startTime), "M/d/yyyy H:mm a")}</td>
        <td>{format(new Date(this.props.obj.endTime), "M/d/yyyy H:mm a")}</td>
        <td>
          {/* <Link
            className="edit-link" path={"room/:id"}
            to={'/edit-room/' + this.props.obj._id}
          >
            Edit
          </Link> */}
          <Button type="submit" size="sm" variant="danger" onClick={() => { if (window.confirm(`Are you sure you want to delete: ${this.props.obj.name} ?`)) this.deleteBlackout() } }> Delete </Button>
        </td>
      </tr>
    )
  }
}
