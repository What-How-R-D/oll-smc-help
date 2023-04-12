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

import Help from "./components/help.component"

import Register from "./pages/Register"
import Validate from "./pages/Validate"
import ResetPassword from "./pages/ResetPassword"
import NewPassword from "./pages/NewPassword"
import Login from "./pages/Login"
import Logout from "./pages/Logout"
import Home from "./pages/Home"

import UserList from './pages/user-list'
import EditUser from './pages/user-edit'

import RoomList from './pages/room-list'
import CreateRoom from './pages/room-create'
import EditRoom from './pages/room-edit'

import BMhub from './pages/bm-hub'

import HVAChub from './pages/hvac-hub'

import LocksHub from './pages/locks-hub'

import PaymentsHub from './pages/payments-hub.'

import BlackoutList from './pages/blackout-list'
import CreateBlackout from './pages/blackout-create'

import EditEvent from "./pages/event-edit"

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
          <Navbar className="colored-nav" variant="dark">
            <Container>
              <Navbar.Brand>
                <Link to={'/'} className="nav-link"> OLL/SMC Room Reservations </Link>
              </Navbar.Brand>

              <Nav className="justify-content-end">
                {!isLoggedIn && ( <Nav> <Link to={'/login'} className="nav-link"> Login </Link> </Nav>)}
                {isLoggedIn && user && ["Admin"].includes(user.type) && ( <Nav> <Link to={'/user-list'} className="nav-link"> Users </Link> </Nav> )}
                {isLoggedIn && user && ["Admin"].includes(user.type) && ( <Nav> <Link to={'/room-list'} className="nav-link"> Rooms </Link> </Nav> )}
                {isLoggedIn && user && (user.bm || ["Admin"].includes(user.type))  && ( <Nav> <Link to={'/blackout-list'} className="nav-link"> Block rooms </Link> </Nav> )}
                {isLoggedIn && user && user.bm && ( <Nav> <Link to={'/bm-hub'} className="nav-link"> Approve Events </Link> </Nav> )}
                {isLoggedIn && user && user.hvac && ( <Nav> <Link to={'/hvac-hub'} className="nav-link"> HVAC requests </Link> </Nav> )}
                {isLoggedIn && user && user.locks && ( <Nav> <Link to={'/locks-hub'} className="nav-link"> Locks requests </Link> </Nav> )}
                {isLoggedIn && user && user.payments && ( <Nav> <Link to={'/payments-hub'} className="nav-link"> Payments </Link> </Nav> )}
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
                  <Route exact path="/validate/:id/:token" component={Validate} />
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
                  <Route exact path="/payments-hub" component={(props) => <PaymentsHub {...props} />} />

                  <Route exact path="/blackout-list" component={(props) => <BlackoutList {...props} />} />
                  <Route exact path="/create-blackout" component={(props) => <CreateBlackout {...props} />} />

                  <Route exact path="/edit-event/:id/:token" component={(props) => <EditEvent {...props} />} />

                </Switch>
              </div>
            </Col>
          </Row>
        </Container>
      </Router>
      <Help/>
    </div>
  );
}

export default App;
