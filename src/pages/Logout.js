import React from "react"
import { Link } from "react-router-dom"

const Logout = props => {

  localStorage.removeItem("token")
  return (
    <div>
      <p>You are logged out</p>
      <p>Log back in <Link to="/login">Login</Link></p>
    </div>
  )
}

export default Logout