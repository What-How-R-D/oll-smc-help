import React from "react"

import CreateEventRequest from "./event-create.component"
import MyEvents from "./event-list-user.component"

const Home = (props) => {
  
  let int_user = props.user

  return (
    <div>
      { int_user ? <MyEvents user={int_user}/> : null }
      { int_user ? <CreateEventRequest user={int_user}/> : null }
    </div>
  )
}

export default Home