import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

import CreateEventRequest from "./event-create.component"

const Home = (props) => {
  console.log("wat up")
  console.log(props.isLoggedIn)
  console.log(props.user)
  
  if (!localStorage.getItem("token")) {
    props.history.push("/login")
  }
  
  return (
    <div>
      <p>Logged in as: {props.user && props.user.name}</p>
      <CreateEventRequest />
      <Link to="/logout">Logout</Link>
    </div>
  )
}

export default Home