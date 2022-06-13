import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button'

export default class RoomTableRow extends Component {

    constructor(props) {
      super(props)
      this.state = {
        room_name: ""
      };
      console.log(this.props.user)
    }

  async componentWillMount() {
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


  render() {
    return (
      <tr>
        <td>{this.props.obj.name}</td>
        <td>{this.state.room_name}</td>
        <td>{this.props.obj.approved.toString()}</td>
        {/* <td>
          <Link
            className="edit-link" path={"room/:id"}
            to={'/edit-room/' + this.props.obj._id}
          >
            Edit
          </Link>
          <Button type="submit" size="sm" variant="danger" onClick={() => { if (window.confirm('Are you sure you want to delete this room ?')) this.deleteRoom() } }> Delete </Button>
        </td> */}
      </tr>
    )
  }
}
