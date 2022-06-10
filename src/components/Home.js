import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

import CreateEventRequest from "./event-create.component"
import MyEvents from "./event-list-user.component"

const Home = (props) => {
  
  return (
    <div>
      <MyEvents user={props.user}/>
      <CreateEventRequest user={props.user}/>
    </div>
  )
}

export default Home