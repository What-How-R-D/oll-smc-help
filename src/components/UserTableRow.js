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
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/delete/`
    axios
      .delete(
        url + this.props.obj._id,
      )
      .then((res) => {
        console.log('User successfully deleted!')
        window.location.reload(true);
      })
      .catch((error) => {
        console.log(error)
      })
  }

  sendPwdUpdate() {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/resetpwd/`
    axios
      .get(url + this.props.obj.email)
      .then((res) => {
        console.log('Password reset sent')
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
          <Link className="edit-link" path={"product/:id"} to={'/edit-user/' + this.props.obj._id} > Edit </Link>
        </td>
        <td>
          <Button type="submit" size="sm" onClick={() => { if (window.confirm('Thank you for sending a password reset ?')) this.sendPwdUpdate() } }> Send Password Update </Button>
        </td>
        <td>
          <Button type="submit" size="sm" variant="danger" onClick={() => { if (window.confirm('Are you sure you want to delete this user ?')) this.deleteUser() } }> Delete </Button>
        </td>
      </tr>
    )
  }
}
