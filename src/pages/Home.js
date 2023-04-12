import React from "react"

import CreateEventRequest from "../components/event-create.component"
import MyEvents from "../components/event-list-user.component"


const Home = (props) => {
  
  return (
    <div>
      <MyEvents/>
      <CreateEventRequest {...props} /> 
    </div>
  )
}

export default Home