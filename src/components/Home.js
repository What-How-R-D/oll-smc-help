import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

// import CreateEvent from './create-event.component'

const Home = (props) => {
  console.log("wat up")
  console.log(props.isLoggedIn)
  console.log(props.user)
  
  if (!localStorage.getItem("token")) {
    props.history.push("/login")
  }
  
  return (
    <div>
      {/* <CreateEvent /> */}
      <p>Welcome {props.user && props.user.name}</p>
      <Link to="/logout">Logout</Link>
    </div>
  )
}

export default Home