import React from "react"

import CreateEventRequest from "./event-create.component"
import MyEvents from "./event-list-user.component"


const Home = (props) => {
  
  return (
    <div>
      <MyEvents/>
      <CreateEventRequest {...props} /> 
    </div>
  )
}

export default Home