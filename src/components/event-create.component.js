import React, { Component } from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';

import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import DateTimePicker from 'react-datetime-picker';

import {findUser, checkLogin} from "../api/user"

Date.prototype.addHours= function(h){
  this.setHours(this.getHours()+h);
  return this;
}

export default class CreateEventRequest extends Component {

  constructor(props) {
  

    super(props)

    // Setting up functions
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeAttendance = this.onChangeAttendance.bind(this);
    this.onChangeRoom = this.onChangeRoom.bind(this);
    this.onChangeLockStartTime = this.onChangeLockStartTime.bind(this);
    this.onChangeLockEndTime = this.onChangeLockEndTime.bind(this);
    this.onChangeRequestorName = this.onChangeRequestorName.bind(this);
    this.onChangeRequestorEmail = this.onChangeRequestorEmail.bind(this);
    this.onChangeRequestorPhone = this.onChangeRequestorPhone.bind(this);
    this.onSubmit = this.onSubmit.bind(this);



    // Setting up state
    this.state = {
      rooms: [],
      //
      name: '',
      room: '',
      attendance: '',
      startTime: '',
      endTime: '',
      lockStartTime: '',
      lockEndTime: '',
      requestorName: '',
      requestorEmail: '',
      requestorPhone: '',
      //
      events: [],
      defaultView: "week",
      defaultDate: "",
      user_id: "",
      user_email: "",
      user_emp_min: false,
      loggedIn: false,
    }
  }
  async componentDidMount() {
    
    if (await checkLogin()){
      this.setState({ loggedIn: true })
    } else {
      this.setState({ loggedIn: false })
    }
    
    var user = await findUser()
    
    if (user['error'] !== "Unauthorized") {
      this.setState({ 
        loggedIn: true, 
        user_id: user._id, 
        user_email: user.email,
        user_emp_min: user.emp_min,
      })
		}
  }
  
  OptionList() {
    return this.state.rooms.map((option) => {
      return <option key={option._id} value={option._id}>{option.name}</option>
    })
  }

  async GetCalendarEvents(date, view) {
    // let start, end;
    // start = moment(date).startOf('month')._d
    // end = moment(date).endOf('month')._d
    
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-all`
    var events = await axios.get(url)
      .then(res => {
        var room_events = res.data.filter(item => item.status !== "Canceled").filter(item => item.room === this.state.room)

        return room_events.map(
          ({ startTime, endTime, name}) => ({
            start: new Date(startTime).addHours(-2),
            end: new Date(endTime).addHours(2),
            title: "Reserved",
            description: '',
            allDay: false,
          })) 
      })
      .catch((error) => {
        console.log(error);
      });

    url = `http://${process.env.REACT_APP_NODE_IP}:4000/blackout/find-all`
    var blackouts = await axios.get(url)
        .then(res => {
          var room_blackouts = res.data.filter(item => item.rooms.includes(this.state.room))
          
          return room_blackouts.map(
            ({ startTime, endTime, name}) => ({
              start: new Date(startTime),
              end: new Date(endTime),
              title: "Reserved",
              description: '',
              allDay: false,
            })) 
        })
        .catch((error) => {
          console.log(error);
        });

    if (this.state.startTime) {
      events.push({
        id: 1,
        start: this.state.startTime,
        end: this.state.endTime,
        title: this.state.name,
        description: '',
        allDay: false,
        color: '#009788'
      })
    }

    this.setState({
      events: [...events, ...blackouts]
    });

  }

  handleCalendarSelect = (event, e) => {
    var { start, end } = event;
    
    var valid_events = this.state.events.filter(
        item => new Date(item.end).getTime() > new Date(start).getTime()
      ).filter(
        item => new Date(item.start).getTime() < new Date(end).getTime()
      ).filter(
        item => item.title === "Reserved"
      )
    
    if (valid_events.length !== 0){
      var blackout_start = valid_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? -1 : 1 )[0].start
      var blackout_end = valid_events.sort((a, b) => new Date(a.endTime).getTime() > new Date(b.endTime).getTime() ? 1 : -1 )[0].end
      
      var start_ok = false
      if (new Date(start).getTime() < new Date(blackout_start).getTime()) {
        start_ok = true
      } else {
        start = new Date(blackout_end)
      }

      if (new Date(end).getTime() > new Date(blackout_end).getTime()) {
        if (start_ok) { end = new Date(blackout_start) }
      } else {
        end = new Date(blackout_start)
      }
    } 

    this.setState({ startTime: start })
    this.setState({ endTime: end })

    this.setState({ lockStartTime: start })
    this.setState({ lockEndTime: end })

    this.GetCalendarEvents()
  };
  
  handleChangeView = (view, date) => {
    this.setState({
        defaultView: view
      })
    this.GetCalendarEvents()
  }

  handleOnNavigate = (date) => {
    this.setState({
        defaultDate: date
      })
    this.GetCalendarEvents()
  }

  Scheduler() {
    const localizer = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(Calendar);

    return <DnDCalendar
          localizer={localizer}
          selectable={true}
          events={this.state.events}
          defaultDate={this.state.defaultDate}
          startAccessor="start"
          endAccessor="end"
          defaultView={this.state.defaultView}
          style={{ height: '70vh' }}
          onSelectSlot={this.handleCalendarSelect}
          onNavigate={this.handleOnNavigate}
          onView={this.handleChangeView}
          views={['month', 'week', 'day']}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.title === "Reserved" ? '#FF0000' : '#3174ad',
            },
          })}
          />
  }

  guest(){
    if (!this.state.loggedIn) {
      return <div>
        <Form.Group controlId="Name">
          <Form.Label>Requestor Name</Form.Label>
          <Form.Control type="text" value={this.state.requestorName} onChange={this.onChangeRequestorName} required />
        </Form.Group>

        <Form.Group controlId="Attendance">
          <Form.Label>Requestor Email</Form.Label>
          <Form.Control type="text" defaultValue={this.state.requestorEmail} onChange={this.onChangeRequestorEmail} required />
        </Form.Group>

        <Form.Group controlId="Attendance">
          <Form.Label>Requestor Phone Number</Form.Label>
          <Form.Control type="text" defaultValue={this.state.requestorPhone} onChange={this.onChangeRequestorPhone} required />
        </Form.Group>
      </div>
    }
  }

  onChangeRequestorName(e) { this.setState({ requestorName: e.target.value }) }
  onChangeRequestorEmail(e) { this.setState({ requestorEmail: e.target.value }) }
  onChangeRequestorPhone(e) { this.setState({ requestorPhone: e.target.value }) }

  onChangeName(e) {
    this.setState({ name: e.target.value })
  }

  async onChangeAttendance(e) {
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-all/${this.state.user_emp_min}/`
    await axios.get(url)
      .then(res => {
        this.setState({
          rooms: res.data.filter(item => item.occupancy > this.state.attendance)
        });
      })
      .catch((error) => {
        console.log(error);
      })

    this.setState({ attendance: e.target.value })
    this.setState({ room: this.state.rooms[0]._id })
    this.GetCalendarEvents()
  }

  onChangeRoom(e) {
    this.setState({ room: e.target.value })
    this.GetCalendarEvents()
  }

  onChangeLockStartTime(e) {
    this.setState({ lockStartTime: e })
  }

  onChangeLockEndTime(e) {
    this.setState({ lockEndTime: e })
  }

  async onSubmit(e) {
    e.preventDefault()
    var eventRequestObject = {}
    if (this.state.loggedIn) {
      eventRequestObject = {
        name: this.state.name,
        requestor: this.state.user_id,
        email: this.state.user_email,
        room: this.state.room,
        attendance: this.state.attendance,
        startTime: this.state.startTime,
        endTime: this.state.endTime,
        lockStartTime: this.state.lockStartTime,
        lockEndTime: this.state.lockEndTime,
      };
    } else {
      eventRequestObject = {
        name: this.state.name,
        room: this.state.room,
        contact: this.state.requestorName,
        email: this.state.requestorEmail,
        phone: this.state.requestorPhone,
        attendance: this.state.attendance,
        startTime: this.state.startTime,
        endTime: this.state.endTime,
        lockStartTime: this.state.lockStartTime,
        lockEndTime: this.state.lockEndTime,
      };
    };

    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/create`
    await axios.post(url, eventRequestObject)
      .then(res => console.log(res.data));

    window.confirm('Thank you for your event request')
    window.location.reload(true);
  }

  render() {
    let html
    html = <div className="form-wrapper">
      <h1> Create a new event request </h1>
      <Form onSubmit={this.onSubmit}>
        {this.guest()}

        <Form.Group controlId="Name">
          <Form.Label>Event Name</Form.Label>
          <Form.Control type="text" value={this.state.name} onChange={this.onChangeName} required />
        </Form.Group>

        <Form.Group controlId="Attendance">
          <Form.Label>Attendance</Form.Label>
          <Form.Control type="text" defaultValue={this.state.attendance} onChange={this.onChangeAttendance} required />
        </Form.Group>

        <Form.Group controlId="Room">
        <Form.Label>Room</Form.Label>
          <Form.Select id="disabledSelect" onChange={this.onChangeRoom}>
            {this.OptionList()}
          </Form.Select>
        </Form.Group>

        <div>
          {this.Scheduler()}
        </div>
        
        <div>
          Door Unlock Time: 
          <DateTimePicker
            onChange={this.onChangeLockStartTime}
            value={this.state.lockStartTime}
            disableClock={true}
            calendarIcon={null}
            clearIcon={null}
          />
        </div>

        <div>
          Door Lock Time:
          <DateTimePicker
            onChange={this.onChangeLockEndTime}
            value={this.state.lockEndTime}
            disableClock={true}
            calendarIcon={null}
            clearIcon={null}
          />
        </div>

        <Button variant="danger" size="lg" block="block" type="submit" className="mt-4">
          Submit Room Request
        </Button>
      </Form>
    </div>
    return (html);
  }
}