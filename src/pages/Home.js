import React from "react"

import EventRequest from "../components/event-details.component"
import MyEvents from "../components/event-list-user.component"


const Home = (props) => {
  
  return (
    <div>
      <MyEvents/>
      <h1> Create a new event request </h1>

      <EventRequest {...props} /> 
    </div>
  )
}

export default Home