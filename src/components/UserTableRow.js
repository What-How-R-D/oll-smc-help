import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button'

export default class UserTableRow extends Component {
  constructor(props) {
    super(props)
    this.deleteUser = this.deleteUser.bind(this)
  }

  deleteUser() {
    axios
      .delete(
        'http://localhost:4000/users/delete/' + this.props.obj._id,
      )
      .then((res) => {
        console.log('User successfully deleted!')
      })
      .catch((error) => {
        console.log(error)
      })
  }



  render() {
    return (
      <tr>
        <td>{this.props.obj.name}</td>
        <td>{this.props.obj.email}</td>
        <td>{this.props.obj.type}</td>
        <td>{this.props.obj.bm.toString()}</td>
        <td>{this.props.obj.hvac.toString()}</td>
        <td>{this.props.obj.locks.toString()}</td>
        <td>
          <Link
            className="edit-link" path={"product/:id"}
            to={'/edit-user/' + this.props.obj._id}
          >
            Edit
          </Link>
        </td><td>
          {/* <Button onClick={this.deleteUser} size="sm" variant="danger">
            Delete
          </Button> */}
          <Button type="submit" size="sm" variant="danger" onClick={() => { if (window.confirm('Are you sure you want to delete this user ?')) this.deleteUser() } }> Delete </Button>
        </td>
      </tr>
    )
  }
}
