import React from "react"

import CreateEventRequest from "./event-create.component"
import MyEvents from "./event-list-user.component"
import Help from "./help.component"

const Home = (props) => {

  return (
    <div>
      <MyEvents/>
      <CreateEventRequest/> 
      <Help/>
    </div>
  )
}

export default Home