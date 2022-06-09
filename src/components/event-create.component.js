import React, { Component } from "react";
import { Link } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import DatePicker from 'react-date-picker';

import dates from 'react-big-calendar/lib/utils/dates';

import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

export default class CreateEventRequest extends Component {

  constructor(props) {
    super(props)

    // Setting up functions
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeAttendance = this.onChangeAttendance.bind(this);
    this.onChangeRoom = this.onChangeRoom.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Setting up state
    this.state = {
      rooms: [],
      //
      name: '',
      room: '',
      attendance: 0,
      startTime: '',
      endTime: '',
      //
      events: [],
    }
  }

  OptionList() {
    return this.state.rooms.map((option) => {
      return <option value={option._id}>{option.name}</option>
    })
  }

  GetCalendarEvents(date, view) {
    let start, end;
    start = moment(date).startOf('month')._d
    end = moment(date).endOf('month')._d

    axios.get('http://localhost:4000/event/find-all')
      .then(res => {
        
        var room_events = res.data.filter(item => item.room === this.state.room)

        var events = room_events.map((
          { startTime, endTime, name} ) => ({
            start: new Date(startTime),
            end: new Date(endTime),
            title: "Reserved",
            description: '',
            allDay: false,
          }))

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
          events: events
        });
      })
      .catch((error) => {
        console.log(error);
      })


  }

  handleCalendarSelect = (event, e) => {
    const { start, end } = event;
    const data = { title: this.state.name, subject: '', start, end, allDay: false };

    this.setState({ startTime: start })
    this.setState({ endTime: end })

    
    this.GetCalendarEvents()
  };

  Scheduler() {
    const localizer = momentLocalizer(moment)
    const DnDCalendar = withDragAndDrop(Calendar);

    return <DnDCalendar
          localizer={localizer}
          selectable={true}
          events={this.state.events}
          startAccessor="start"
          endAccessor="end"
          defaultView={"week"}
          style={{ height: '70vh' }}
          onSelectSlot={this.handleCalendarSelect}
          onNavigate={this.GetCalendarEvents}
          onView={this.GetCalendarEvents}
          views={['month', 'week', 'day']}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.title === "Reserved" ? '#FF0000' : '#3174ad',
            },
          })}
          />
  }

  onChangeName(e) {
    this.setState({ name: e.target.value })
  }

  async onChangeAttendance(e) {
    await axios.get('http://localhost:4000/room/find-all')
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

  async onSubmit(e) {
    e.preventDefault()

    const eventRequestObject = {
      name: this.state.name,
      room: this.state.room,
      attendance: this.state.attendance,
      startTime: this.state.startTime,
      endTime: this.state.endTime
    };
    await axios.post('http://localhost:4000/event/create', eventRequestObject)
      .then(res => console.log(res.data));

    window.confirm('Thank you for your event request')
    window.location.reload(true);
  }

  render() {
    let html
    if (localStorage.getItem("token")) {
      html = <div className="form-wrapper">
      <Form onSubmit={this.onSubmit}>
        <Form.Group controlId="Name">
          <Form.Label>Event Name</Form.Label>
          <Form.Control type="text" value={this.state.name} onChange={this.onChangeName} />
        </Form.Group>

        <Form.Group controlId="Attendance">
          <Form.Label>Attendance</Form.Label>
          <Form.Control type="text" value={this.state.attendance} onChange={this.onChangeAttendance} />
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
        
        <Button variant="danger" size="lg" block="block" type="submit" className="mt-4">
          Submit Room Request
        </Button>
      </Form>
    </div>
    } else {
      html = <div>
          <p> Please login</p>
          <Link to="/login">Login</Link>
        </div>
    }
    return (html);
  }
}