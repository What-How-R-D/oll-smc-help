import React, { useEffect, useState } from 'react'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import 'bootstrap/dist/css/bootstrap.min.css'
import "./App.css"
import axios from "axios"

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import Register from "./components/Register"
import ResetPassword from "./components/ResetPassword"
import NewPassword from "./components/NewPassword"
import Login from "./components/Login"
import Logout from "./components/Logout"
import Home from "./components/Home"

import UserList from './components/user-list.component'
import EditUser from './components/user-edit.component'

import RoomList from './components/room-list.component'
import CreateRoom from './components/room-create.component'
import EditRoom from './components/room-edit.component'

import BMhub from './components/bm-hub.component'

import HVAChub from './components/hvac-hub.component'

import LocksHub from './components/locks-hub.component'

require('dotenv').config()

function App() {
  const isLoggedIn = localStorage.getItem("token")
  
  const [user, setUser] = useState(null)

  const getUser = async () => {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/auth`
    const res = await axios.get(
      url, 
      {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    setUser(res.data)
  }

  useEffect(() => {
    getUser()
  }, [])

  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <Navbar bg="dark" variant="dark">
            <Container>
              <Navbar.Brand>
                <Link to={'/'} className="nav-link"> OLL SMC </Link>
              </Navbar.Brand>

              <Nav className="justify-content-end">
                {!isLoggedIn && ( <Nav> <Link to={'/login'} className="nav-link"> Login </Link> </Nav>)}
                {isLoggedIn && user && ["Admin"].includes(user.type) && ( <Nav> <Link to={'/user-list'} className="nav-link"> Users </Link> </Nav> )}
                {isLoggedIn && user && ["Admin"].includes(user.type) && ( <Nav> <Link to={'/room-list'} className="nav-link"> Rooms </Link> </Nav> )}
                {isLoggedIn && user && user.bm && ( <Nav> <Link to={'/bm-hub'} className="nav-link"> Approve Events </Link> </Nav> )}
                {isLoggedIn && user && user.hvac && ( <Nav> <Link to={'/hvac-hub'} className="nav-link"> HVAC requests </Link> </Nav> )}
                {isLoggedIn && user && user.locks && ( <Nav> <Link to={'/locks-hub'} className="nav-link"> Locks requests </Link> </Nav> )}
                {isLoggedIn && ( <Nav> <Link to={'/logout'} className="nav-link"> Logout </Link> </Nav>)}
              </Nav>
            </Container>
          </Navbar>
        </header>
        
        <Container>
          <Row>
            <Col md={12}>
              <div className="wrapper">
                <Switch>
                  <Route exact path="/login" component={Login} />
                  <Route exact path="/logout" component={Logout} />
                  <Route exact path="/register" component={Register} />
                  <Route exact path="/resetpwd" component={ResetPassword} />
                  <Route exact path="/newpassword/:id/:token" component={NewPassword} />
                  <Route exact path="/" component={(props) => <Home {...props} isLoggedIn={isLoggedIn} />} />

                  <Route exact path="/user-list" component={(props) => <UserList {...props} />} />
                  <Route exact path="/edit-user/:id" component={(props) => <EditUser {...props} />} />
                  
                  <Route exact path="/room-list" component={(props) => <RoomList {...props} />} />
                  <Route exact path="/create-room" component={(props) => <CreateRoom {...props} />} />
                  <Route exact path="/edit-room/:id" component={(props) => <EditRoom {...props} />} />

                  <Route exact path="/bm-hub" component={(props) => <BMhub {...props} />} />
                  <Route exact path="/hvac-hub" component={(props) => <HVAChub {...props} />} />
                  <Route exact path="/locks-hub" component={(props) => <LocksHub {...props} />} />

                </Switch>
              </div>
            </Col>
          </Row>
        </Container>
      </Router>
    </div>
  );
}

export default App;
