import React, { Component } from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { format } from "date-fns";


import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import DateTimePicker from 'react-datetime-picker';

import Swal from 'sweetalert2';

import {findUser, checkLogin} from "../api/user"

import EventRequest from "../components/event-details.component"

const jwt = require("jsonwebtoken")

/*eslint no-extend-native: ["error", { "exceptions": ["Date"] }]*/
// Date.prototype.addHours= function(h){
//   this.setHours(this.getHours()+h);
//   return this;
// }

// Date.prototype.addMins= function(m){
//   this.setMinutes(this.getMinutes()+m);
//   return this;
// }

export default class CreateEventRequest extends Component {

  constructor(props) {
    super(props)

    // Setting up state
    this.state = {
      id: "",
    }
  }

  async componentDidMount() {
    this.setState({  id: this.props.match.params.id })
  }
  //   if (await checkLogin()){
  //     this.setState({ loggedIn: true })
  //   } else {
  //     this.setState({ loggedIn: false })
  //   }
    
  //   var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-id/${this.state.id}`
  //   var event = await axios.get(url)
  //     .then(res => {
  //       this.setState({
  //         name: res.data.name,
  //         room: res.data.room,
  //         status: res.data.status,
  //         attendance: res.data.attendance,
  //         startTime: new Date(res.data.startTime),
  //         endTime: new Date(res.data.endTime),
  //         lockStartTime: res.data.lockStartTime,
  //         lockEndTime: res.data.lockEndTime,
  //         requester: res.data.requester,
  //         requesterName: res.data.requesterName,
  //         requesterEmail: res.data.requesterEmail,
  //         requesterPhone: res.data.requesterPhone,
  //         defaultDate: new Date(res.data.startTime),
  //         token: res.data.token,
  //         notes: res.data.notes,
  //       })
  //       return res.data
  //     })
  //     .catch((error) => { console.log(error); });
    
  //   var valid_user = false
  //   var user = await findUser()
  //   if (user['error'] !== "Unauthorized") {
  //     this.setState({ 
  //       loggedIn: true, 
  //       user_id: user._id, 
  //       user_email: user.email,
  //       user_type: user.type,
  //       user_emp_min: user.emp_min,
  //     })
  //     if (this.state.user_id.toString() === this.state.requester) { valid_user = true }
  //   }

  //   try { if (await jwt.verify(this.props.match.params.token, this.state.id)) { valid_user = true } } 
  //   catch (e) { console.log("token failed"); }

  //   if (!valid_user) {
  //       await Swal.fire({
  //         title: "Unauthenticated",
  //         icon: 'warning',
  //         html: "You do not have permission to edit this event.",
  //         showConfirmButton: false,
  //         showCancelButton: true,
  //         cancelButtonText: `Return to home`,
  //         showDenyButton: false,
  //       }).then(
  //         this.props.history.push("/")
  //       )
  //     }
    
  //   if (event.status !== "Pending") {
  //     await Swal.fire({
  //       title: "Error",
  //       icon: 'warning',
  //       html: "Only pending events can be updated.",
  //       showConfirmButton: false,
  //       showCancelButton: true,
  //       cancelButtonText: `Return to home`,
  //       showDenyButton: false,
  //     }).then(
  //       this.props.history.push("/")
  //     )
  //   }
    
    
  //   url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-all/${this.state.user_emp_min}/`
  //   await axios.get(url)
  //     .then(res => {
  //       this.setState({
  //         rooms: res.data.filter(item => item.occupancy >= this.state.attendance)
  //       });
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     })
    
  //   this.GetCalendarEvents()
  // }
  
  // OptionList() {
  //   return this.state.rooms.map((option) => {
  //     // if (option._id === this.state.room) {
  //     //   return <option key={option._id} value={option._id} selected>{option.name}</option>
  //     // } else {
  //       return <option key={option._id} value={option._id}>{option.name}</option>
  //     // }
      
  //   })
  // }

  // async GetCalendarEvents(date, view) {
  //   // let start, end;
  //   // start = moment(date).startOf('month')._d
  //   // end = moment(date).endOf('month')._d
    
  //   var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-all`
  //   var events = await axios.get(url)
  //     .then(res => {
  //       var room_events = res.data.filter(item => item.status !== "Canceled").filter(item => item.room === this.state.room).filter(item => item._id !== this.state.id)

  //       return room_events.map(
  //         ({ startTime, endTime, name}) => ({
  //           start: new Date(Math.max(new Date(startTime).addHours(-2), new Date(endTime).setHours(0,0,0,1))),
  //           end: new Date(Math.min(new Date(endTime).addHours(2), new Date(endTime).setHours(23,59,59,999))),
  //           title: "Reserved",
  //           description: '',
  //           allDay: false,
  //         })) 
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });

  //   url = `http://${process.env.REACT_APP_NODE_IP}:4000/blackout/find-all`
  //   var blackouts = await axios.get(url)
  //       .then(res => {
  //         var room_blackouts = res.data.filter(item => item.rooms.includes(this.state.room))
          
  //         return room_blackouts.map(
  //           ({ startTime, endTime, name}) => ({
  //             start: new Date(startTime),
  //             end: new Date(endTime),
  //             title: "Reserved",
  //             description: '',
  //             allDay: false,
  //           })) 
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
    
  //   if (this.state.startTime) {
  //     events.push({
  //       id: 1,
  //       start: this.state.startTime,
  //       end: this.state.endTime,
  //       title: this.state.name,
  //       description: '',
  //       allDay: false,
  //       color: '#009788'
  //     })
  //   }

  //   this.setState({
  //     events: [...events, ...blackouts]
  //   });

  // }

  // handleCalendarSelect = (event, e) => {
  //   var { start, end } = event;
    
  //   var valid_events = this.state.events.filter(
  //       item => new Date(item.end).getTime() > new Date(start).getTime()
  //     ).filter(
  //       item => new Date(item.start).getTime() < new Date(end).getTime()
  //     ).filter(
  //       item => item.title === "Reserved"
  //     )
    
  //   if (valid_events.length !== 0){
  //     if (this.state.user_type !== "Admin") {
  //       var blackout_start = valid_events.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime() ? -1 : 1 )[0].start
  //       var blackout_end = valid_events.sort((a, b) => new Date(a.endTime).getTime() > new Date(b.endTime).getTime() ? 1 : -1 )[0].end
        
  //       var start_ok = false
  //       if (new Date(start).getTime() < new Date(blackout_start).getTime()) {
  //         start_ok = true
  //       } else {
  //         start = new Date(blackout_end)
  //       }

  //       if (new Date(end).getTime() > new Date(blackout_end).getTime()) {
  //         if (start_ok) { end = new Date(blackout_start) }
  //       } else {
  //         end = new Date(blackout_start)
  //       }

  //       Swal.fire({
  //         icon: 'warning',
  //         title: 'Event conflict detected',
  //         html: `Due to scheduling conflicts you event has been changed to:<br> Event Start: ${format(new Date(start), "M/d/yyyy h:mm a")}<br> Event End: ${format(new Date(end), "M/d/yyyy h:mm a")}`,
  //         showConfirmButton: false,
  //         timer: 3500,
  //       }) 
  //     } else {
  //       Swal.fire({
  //         icon: 'warning',
  //         title: 'Event conflict detected',
  //         html: `Be careful creating overlapping events.`,
  //         showConfirmButton: false,
  //         timer: 3500,
  //       })
  //     }
  //   }

  //   this.setState({ startTime: start })
  //   this.setState({ endTime: end })

  //   this.setState({ lockStartTime: new Date(start).addMins(-15) })
  //   this.setState({ lockEndTime: end })

  //   this.GetCalendarEvents()
  // };
  
  // handleChangeView = (view, date) => {
  //   this.setState({
  //       defaultView: view
  //     })
  //   this.GetCalendarEvents()
  // }

  // handleOnNavigate = (date) => {
  //   this.setState({
  //       defaultDate: date
  //     })
  //   this.GetCalendarEvents()
  // }

  // Scheduler() {
  //   const localizer = momentLocalizer(moment);
  //   const DnDCalendar = withDragAndDrop(Calendar);

  //   return <DnDCalendar
  //         localizer={localizer}
  //         selectable={true}
  //         events={this.state.events}
  //         defaultDate={this.state.defaultDate}
  //         startAccessor="start"
  //         endAccessor="end"
  //         defaultView={this.state.defaultView}
  //         style={{ height: '85vh' }}
  //         onSelectSlot={this.handleCalendarSelect}
  //         onNavigate={this.handleOnNavigate}
  //         onView={this.handleChangeView}
  //         views={['month', 'week', 'day']}
  //         eventPropGetter={(event) => ({
  //           style: {
  //             backgroundColor: event.title === "Reserved" ? '#FF0000' : '#3174ad',
  //           },
  //         })}
  //         />
  // }

  // onChangeRequesterName(e) { this.setState({ requesterName: e.target.value }) }
  // onChangeRequesterEmail(e) { this.setState({ requesterEmail: e.target.value }) }
  // onChangeRequesterPhone(e) { this.setState({ requesterPhone: e.target.value }) }
  // onChangeNotes(e) { this.setState({ notes: e.target.value }) }
  // onChangeWillBePresent(e) { this.setState(({ willBePresent }) => ({ willBePresent: !willBePresent })) }
  // onChangeName(e) { this.setState({ name: e.target.value }) }

  // async onChangeAttendance(e) {
  //   var url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-all/${this.state.user_emp_min}/`
  //   await axios.get(url)
  //     .then(res => {
  //       this.setState({
  //         rooms: res.data.filter(item => item.occupancy > this.state.attendance)
  //       });
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     })

  //   this.setState({ attendance: e.target.value })
  //   this.setState({ room: this.state.rooms[0]._id })
  //   this.GetCalendarEvents()
  // }

  // onChangeRoom(e) {
  //   this.setState({ room: e.target.value })
  //   this.GetCalendarEvents()
  // }

  // onChangeLockStartTime(e) {
  //   this.setState({ lockStartTime: e })
  // }

  // onChangeLockEndTime(e) {
  //   this.setState({ lockEndTime: e })
  // }

  // onChangeStartTime(e) { 
  //   this.setState({defaultDate: e})
  //   if (this.state.endTime){
  //     var forcedEnd = new Date(e)

  //     forcedEnd.setYear(e.getFullYear())
  //     forcedEnd.setMonth(e.getMonth())
  //     forcedEnd.setDate(e.getDate())
  //     forcedEnd.setHours(this.state.endTime.getHours())
  //     forcedEnd.setMinutes(this.state.endTime.getMinutes())
  //     if (
  //       (this.state.endTime.getFullYear() !== e.getFullYear()) || 
  //       (this.state.endTime.getMonth() !== e.getMonth()) || 
  //       (this.state.endTime.getDate() !== e.getDate())) {
  //       Swal.fire({
  //           icon: 'warning',
  //           title: 'Multi-day events not allowed',
  //           html: `Event end date set to: ${format(new Date(forcedEnd), "M/d/yyyy h:mm a")}`,
  //           showConfirmButton: false,
  //           timer: 3500,
  //       })
  //     }

  //     this.setState({endTime: forcedEnd})

  //     this.handleCalendarSelect({start: e, end:forcedEnd}, e)
  //   } else {
  //     this.handleCalendarSelect({start: e, end:this.state.endTime}, e)
  //   }
  // }

  // onChangeEndTime(e) { 
  //   this.setState({defaultDate: e})
  //   if (this.state.startTime) {
  //     var forcedStart = new Date(e)

  //     forcedStart.setYear(e.getFullYear())
  //     forcedStart.setMonth(e.getMonth())
  //     forcedStart.setDate(e.getDate())
  //     forcedStart.setHours(this.state.startTime.getHours())
  //     forcedStart.setMinutes(this.state.startTime.getMinutes())
  //     if (
  //       (this.state.startTime.getFullYear() !== e.getFullYear()) || 
  //       (this.state.startTime.getMonth() !== e.getMonth()) || 
  //       (this.state.startTime.getDate() !== e.getDate())) {
  //       Swal.fire({
  //           icon: 'warning',
  //           title: 'Multi-day events not allowed',
  //           html: `Event start date set to: ${format(new Date(forcedStart), "M/d/yyyy h:mm a")}`,
  //           showConfirmButton: false,
  //           timer: 3500,
  //       })
  //     }

  //     this.setState({startTime: forcedStart})

  //     this.handleCalendarSelect({start: forcedStart, end:e}, e)
  //   } else {
  //     this.setState({ endTime: e })
  //   }
  // }

  // async onSubmit(e) {
  //   e.preventDefault()
  //   var eventRequestObject = {}
  //   if (this.state.loggedIn) {
  //     var paid = false
  //     if (this.state.user_emp_min) { paid=true }
  //     eventRequestObject = {
  //       name: this.state.name,
  //       requester: this.state.user_id,
  //       email: this.state.user_email,
  //       room: this.state.room,
  //       attendance: this.state.attendance,
  //       startTime: this.state.startTime,
  //       endTime: this.state.endTime,
  //       lockStartTime: this.state.lockStartTime,
  //       lockEndTime: this.state.lockEndTime,
  //       paid: paid,
  //       notes: this.state.notes,
  //     };
  //   } else {
  //     eventRequestObject = {
  //       name: this.state.requesterName,
  //       room: this.state.room,
  //       contact: this.state.requesterName,
  //       email: this.state.requesterEmail,
  //       phone: this.state.requesterPhone,
  //       attendance: this.state.attendance,
  //       startTime: this.state.startTime,
  //       endTime: this.state.endTime,
  //       lockStartTime: this.state.lockStartTime,
  //       lockEndTime: this.state.lockEndTime,
  //       notes: this.state.notes,
  //     };
  //   };

  //   var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/update/${this.state.id}`
  //   await axios.put(url, eventRequestObject)
  //     .then(res => console.log(res.data));

  //     Swal.fire({
  //       icon: 'success',
  //       title: 'Event updated successfully',
  //       html: 'You will receive an email when the building manager approves or rejects your request(s)',
  //       showConfirmButton: false,
  //       timer: 5000,
  //     }).then((result) => {
  //       if (result.isDismissed) {this.props.history.push("/");}
  //     })
  // }

  render() {
    let html
    html = <div className="form-wrapper">
      <h1> Edit your event request </h1>

      <EventRequest edit={true} id={this.props.match.params.id} /> 


      {/* <Form onSubmit={this.onSubmit}>

        <div>
          <h4>Please update your event details.</h4>
        </div>


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
          <Form.Select id="disabledSelect" onChange={this.onChangeRoom} value={this.state.room}>
            {this.OptionList()}
          </Form.Select>
        </Form.Group>

        <div>
          <h4>Select event times with the following dialog boxes or click and drag in the calendar below </h4>
        </div>

        <div>
          Event start time: 
          <DateTimePicker
            onChange={this.onChangeStartTime}
            value={this.state.startTime}
            disableClock={true}
            calendarIcon={null}
            clearIcon={null}
            calendarType="US"
          />
        </div>

        <div>
          Event end time:
          <DateTimePicker
            onChange={this.onChangeEndTime}
            value={this.state.endTime}
            disableClock={true}
            calendarIcon={null}
            clearIcon={null}
            calendarType="US"
          />
        </div>

        <div>
          <p>Times in the calendar are the official times, those shown above in the drop downs do not reflect time changes due to previously scheduled events.</p>
        </div>

        <div>
          {this.Scheduler()}
        </div>
        
        <div>
          <h4>Please select the times when you would like the doors to unlock and lock.</h4>
        </div>

        <div>
          Door Unlock Time: 
          <DateTimePicker
            onChange={this.onChangeLockStartTime}
            value={this.state.lockStartTime}
            disableClock={true}
            calendarIcon={null}
            clearIcon={null}
            calendarType="US"
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
            calendarType="US"
          />
        </div>

        <div><h4>Notes</h4> (including any audio/video requests*)</div>
        <textarea value={this.state.notes} onChange={this.onChangeNotes} />

        <Form.Check 
          type="switch"
          id="willBePresent"
          label="By checking this box I verify that someone will be present at all times when the doors are unlocked."
          checked={this.state.willBePresent}
          onChange={this.onChangeWillBePresent}
        />

        <Button disabled={!this.state.willBePresent} variant="danger" size="lg" block="block" type="submit" className="mt-4">
          Submit Room Request
        </Button>
        <div>*Audio/video requests are subject to limited equipment and man power.</div>
      </Form> */}
    </div>
    return (html);
  }
}