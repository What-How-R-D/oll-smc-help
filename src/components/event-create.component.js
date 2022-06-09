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
    // this.onChangeDate = this.onChangeDate.bind(this);
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
      // view: "week",
      // defaultView: "month"
    }
  }

  OptionList() {
    return this.state.rooms.map((option) => {
      return <option value={option._id}>{option.name}</option>
    })
  }

  GetCalendarEvents(date, view) {
    console.log("Hi from events")
    console.log(date)
    console.log(view)

    let start, end;
    start = moment(date).startOf('month')._d
    end = moment(date).endOf('month')._d

    // console.log(start, end)
    // this.setState({view: view, defaultView: view})
    // console.log(dates.firstVisibleDay(date), dates.lastVisibleDay(date));

    axios.get('http://localhost:4000/event/find-all')
      .then(res => {
        console.log("finding events")
        
        var room_events = res.data.filter(item => item.room === this.state.room)
        console.log(room_events)

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
            // free: true,
            color: '#009788'
          })
        }
        console.log(events)
        this.setState({
          events: events
        });
      })
      .catch((error) => {
        console.log(error);
      })


  }

  handleCalendarSelect = (event, e) => {
    console.log("done selecting")
    console.log(event)
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
          // resources={resources}
          selectable={true}
          events={this.state.events}
          startAccessor="start"
          endAccessor="end"
          defaultView={"week"}
          // view={this.state.view}
          // defaultDate={ this.defaultDate}
          // selectable={true}
          // resizable={true}
          // onEventDrop={handleDragEvent}
          style={{ height: '70vh' }}
          onSelectSlot={this.handleCalendarSelect}
          onNavigate={this.GetCalendarEvents}
          onView={this.GetCalendarEvents}
          // onSelectEvent={handleSelectEvent}
          // min={
          //   new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8)
          // }
          // max={
          //   new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23)
          // }
          // messages={{
          //   month: 'mois',
          //   week: 'semaine',
          //   day: 'jour',
          //   today: "aujourd'hui",
          //   next: 'suiv.',
          //   previous: 'préc.',
          // }}
          // resource="Test ressource"
          // views={['month']}
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
        console.log(res.data)
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

  // onChangeDate(e) {
  //   this.setState({ date: e })
  // }

  onSubmit(e) {
    e.preventDefault()

    const roomRequestObject = {
      name: this.state.name,
      room: this.state.room,
      attendance: this.state.attendance,
      startTime: this.state.startTime,
      endTime: this.state.endTime
    };
    axios.post('http://localhost:4000/event/create', roomRequestObject)
      .then(res => console.log(res.data));

    this.setState({ name: '', room: '', attendance: '' })
    this.props.history.push('/')
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

        {/* <div>
          Event date 
          <DatePicker calendarType="US" onChange={this.onChangeDate} value={this.state.date} />
        </div> */}

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