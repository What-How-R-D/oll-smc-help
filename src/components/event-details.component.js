import React, { Component } from "react";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { format } from "date-fns";
import { ColorRing } from 'react-loader-spinner'

import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import DateTimePicker from 'react-datetime-picker';
import Swal from 'sweetalert2';

import {findUser, checkLogin} from "../api/user"
import { dateTimeOptions } from './dateTimeFormat'; 

var crypto = require("crypto");
const jwt = require("jsonwebtoken")

/*eslint no-extend-native: ["error", { "exceptions": ["Date"] }]*/
Date.prototype.addHours = function(h) {
    this.setHours(this.getHours()+h);
  return this;
}

Date.prototype.addMins = function(m) {
    this.setMinutes(this.getMinutes()+m);
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
    this.onChangeStartTime = this.onChangeStartTime.bind(this);
    this.onChangeEndTime = this.onChangeEndTime.bind(this);
    this.onChangeRequesterName = this.onChangeRequesterName.bind(this);
    this.onChangeRequesterEmail = this.onChangeRequesterEmail.bind(this);
    this.onChangeRequesterPhone = this.onChangeRequesterPhone.bind(this);
    this.onChangeNeedLocks = this.onChangeNeedLocks.bind(this);
    this.onChangeWillBePresent = this.onChangeWillBePresent.bind(this);
    this.onChangeDoesRepeat = this.onChangeDoesRepeat.bind(this);
    this.onChangeFrequency = this.onChangeFrequency.bind(this);
    this.onChangeFuzzy = this.onChangeFuzzy.bind(this);
    this.onChangeRepeatCount = this.onChangeRepeatCount.bind(this);
    this.onChangeNotes = this.onChangeNotes.bind(this);
    this.onChangeOnBehalfOf = this.onChangeOnBehalfOf.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.GetCalendarEvents = this.GetCalendarEvents.bind(this)
    
    this.onChangeLoading = this.onChangeLoading.bind(this)
    
    // Setting up state
    this.state = {
      isLoading: true,
      //
      valid_user: false,
      //
      rooms: [],
      //
      id: '',
      name: '',
      room: '',
      status: "Pending",
      attendance: 0,
      startTime: '',
      endTime: '',
      lockStartTime: '',
      lockEndTime: '',
      requesterName: '',
      requesterEmail: '',
      requesterPhone: '',
      notes: '',
      //
      events: [],
      database_events: [],
      database_blackouts: [],
      defaultView: "week",
      defaultDate: "",
      user_id: "",
      user_type: "Basic",
      user_email: "",
      user_emp_min: false,
      user_can_overlap: false,
      loggedIn: false,
      willBePresent: false,
      onBehalfOf: false,
      doesRepeat: false,
      needLocks: true,
      repeatFrequency: "monthly",
      repeatFuzzy: "absolute",
      repeatCount: 1,
      repeatDates: [],
      days_map: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      suffix_map: ["st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "st"]
    }
  }

  async componentDidMount() { 
    this.onChangeLoading(true)

    console.log(this.props)
    console.log(this.props.id)

    console.log(this.state.id)
    if (this.props.edit) {
      await this.PullID(this.props.id)
    }
    await this.PullEvents()

    if (await checkLogin()){
      this.setState({ loggedIn: true })
    } else {
      this.setState({ loggedIn: false })
    }
    
    var user = await findUser()
    
    if (user['error'] !== "Unauthorized") {
      console.log(user)
      this.setState({ 
        loggedIn: true, 
        user_id: user._id, 
        user_email: user.email,
        user_type: user.type,
        user_emp_min: user.emp_min,
        user_can_overlap: user.can_overlap,
      })
		}

    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-all/${this.state.user_emp_min}/`
    var first_room = await axios.get(url)
      .then(res => { 
        this.setState({ rooms: res.data });
        return  this.state.rooms[0]._id
      })
      .catch((error) => { console.log(error); })
    this.setState({ room: first_room }, this.GetCalendarEvents)
    this.onChangeLoading(false)
  }

  OptionList() {
    return this.state.rooms.map((option) => {
      if (option.occupancy > this.state.attendance){
          return <option key={option._id} value={option._id}>{option.name}</option>
        }
    })
  }

  async PullID(id) {
    this.setState({  id: id })
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-id/${id}`
    var event = await axios.get(url)
      .then(res => {
        this.setState({
          name: res.data.name,
          room: res.data.room,
          status: res.data.status,
          attendance: res.data.attendance,
          startTime: new Date(res.data.startTime),
          endTime: new Date(res.data.endTime),
          lockStartTime: res.data.lockStartTime,
          lockEndTime: res.data.lockEndTime,
          requester: res.data.requester,
          requesterName: res.data.requesterName,
          requesterEmail: res.data.requesterEmail,
          requesterPhone: res.data.requesterPhone,
          defaultDate: new Date(res.data.startTime),
          token: res.data.token,
          notes: res.data.notes,
        })
        return res.data
      })
      .catch((error) => { console.log(error); });
    
    // var valid_user = false
    var user = await findUser()
    if (user['error'] !== "Unauthorized") {
      this.setState({ 
        loggedIn: true, 
        user_id: user._id, 
        user_email: user.email,
        user_type: user.type,
        user_emp_min: user.emp_min,
        user_can_overlap: user.can_overlap,
      })
      if (this.state.user_id.toString() === this.state.requester) { this.setState({valid_user:true}) }
      if (this.state.user_type === "Admin" ) { this.setState({valid_user:true}) }
    }

    try { if (await jwt.verify(this.props.match.params.token, this.state.id)) { this.setState({valid_user:true}) } } 
    catch (e) { console.log("token failed"); }

  }

  async PullEvents(){
    var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-all`
     var events = await axios.get(url)
      .then(res => {

        if (this.props.edit) {
          var room_events = res.data.filter(item => !["Rejected", "Canceled"].includes(item.status)).filter(item => item._id !== this.state.id)
        } else {
          var room_events = res.data.filter(item => !["Rejected", "Canceled"].includes(item.status))
        }
        
        return room_events.map(
          ({ startTime, endTime, name, room}) => ({
            start: new Date(Math.max(new Date(startTime).addHours(-2), new Date(endTime).setHours(0,0,0,1))),
            end: new Date(Math.min(new Date(endTime).addHours(2), new Date(endTime).setHours(23,59,59,999))),
            title: "Reserved",
            description: '',
            allDay: false,
            room: room,
          })) 
      })
      .catch((error) => {
        console.log(error);
      })
    this.setState({ database_events: events})

    url = `http://${process.env.REACT_APP_NODE_IP}:4000/blackout/find-all`
    var blackouts = await axios.get(url)
        .then(res => {
          var room_blackouts = res.data
          
          return room_blackouts.map(
            ({ startTime, endTime, name, rooms}) => ({
              start: new Date(startTime),
              end: new Date(endTime),
              title: "Reserved",
              description: '',
              allDay: false,
              rooms: rooms,
            })) 
        })
        .catch((error) => {
          console.log(error);
        })
    this.setState({ database_blackouts: blackouts })
  }

  async GetCalendarEvents(date, view) {
    // let start, end;
    // start = moment(date).startOf('month')._d
    // end = moment(date).endOf('month')._d

    var events = this.state.database_events.filter(item => item.room === this.state.room)
    var blackouts = this.state.database_blackouts.filter(item => item.rooms.includes(this.state.room))

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

    var repeats = []
    if (this.state.doesRepeat && this.state.startTime) {        
        this.setState({ repeatDates: [] }, ()=>{
          
          while (this.state.repeatDates.length < this.state.repeatCount) {
            if (this.state.repeatDates.length !== 0){
              var prevStart = new Date(this.state.repeatDates[this.state.repeatDates.length-1][0])
              var prevEnd = new Date(this.state.repeatDates[this.state.repeatDates.length-1][1])
            } else {
              prevStart = new Date(this.state.startTime)
              prevEnd = new Date(this.state.endTime)
            }
  
            if (this.state.repeatFrequency === "monthly") {
              if (this.state.repeatFuzzy === "absolute") {
                var nextStart = new Date(prevStart.setMonth(prevStart.getMonth()+1))
                var nextEnd = new Date(prevEnd.setMonth(prevEnd.getMonth()+1))
              } else if (this.state.repeatFuzzy === "relative") {
                var dow = new Date(prevStart).getDay()
                var wom = Math.min((0 | new Date(prevStart).getDate() / 7)+1, 4)
  
                nextStart = new Date(new Date(prevStart.setMonth(new Date(prevStart).getMonth()+1)).setDate(1))
                nextEnd = new Date(new Date(prevEnd.setMonth(new Date(prevEnd).getMonth()+1)).setDate(1))
  
                nextStart = new Date(nextStart.setDate(
                    nextStart.getDate() + (( 7 + dow - nextStart.getDay()) % 7 ) + ((wom-1)*7)
                  ))
                nextEnd = new Date(nextEnd.setDate(
                    nextEnd.getDate() + (( 7 + dow - nextEnd.getDay()) % 7) + ((wom-1)*7)
                  ))
                  
              } else if (this.state.repeatFuzzy === "last") {
                dow = new Date(prevStart).getDay()
                wom = Math.min((0 | new Date(prevStart).getDate() / 7)+1, 4)
  
                nextStart = new Date(new Date(prevStart.setMonth(new Date(prevStart).getMonth()+2)).setDate(1))
                nextEnd = new Date(new Date(prevEnd.setMonth(new Date(prevEnd).getMonth()+2)).setDate(1))
  
                nextStart = new Date(nextStart.setDate(
                  nextStart.getDate() + (( 7 + dow - nextStart.getDay()) % 7 ) - 7
                  ))
                nextEnd = new Date(nextEnd.setDate(
                  nextEnd.getDate() + (( 7 + dow - nextEnd.getDay()) % 7) - 7
                  ))
              }
            } else if (this.state.repeatFrequency === "weekly") {
              nextStart = new Date(new Date(Number(prevStart)).setDate(prevStart.getDate()+7))
              nextEnd = new Date(new Date(Number(prevEnd)).setDate(prevEnd.getDate()+7))       
            } else if (this.state.repeatFrequency === "daily") {
              nextStart = new Date(new Date(Number(prevStart)).setDate(prevStart.getDate()+1))
              nextEnd = new Date(new Date(Number(prevEnd)).setDate(prevEnd.getDate()+1))
            } else if (this.state.repeatFrequency === "weekdays") {
              if (prevStart.getDay() === 5) {// Friday 
                nextStart = new Date(new Date(Number(prevStart)).setDate(prevStart.getDate()+3))
                nextEnd = new Date(new Date(Number(prevEnd)).setDate(prevEnd.getDate()+3))
              } else if (prevStart.getDay() === 6) {// Saturday
                nextStart = new Date(new Date(Number(prevStart)).setDate(prevStart.getDate()+2))
                nextEnd = new Date(new Date(Number(prevEnd)).setDate(prevEnd.getDate()+2))
              } else {
                nextStart = new Date(new Date(Number(prevStart)).setDate(prevStart.getDate()+1))
                nextEnd = new Date(new Date(Number(prevEnd)).setDate(prevEnd.getDate()+1))
              }
            }
  
            this.state.repeatDates.push([nextStart, nextEnd])
          }
  
          this.state.repeatDates.forEach((element, idx) => {
                    repeats.push({
                      start: element[0],
                      end: element[1],
                      title: this.state.name,
                      description: '',
                      allDay: false,
                      color: '#009788'
                    })
                })

        } )
        
        this.setState({
          events: [...events, ...blackouts, ...repeats]
        });
    } else {
      this.setState({
        events: [...events, ...blackouts, ...repeats]
      });
    }
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
      if (!this.state.user_can_overlap) {
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

        Swal.fire({
          icon: 'warning',
          title: 'Event conflict detected',
          html: `Due to scheduling conflicts you event has been changed to:<br> Event Start: ${format(new Date(start), "M/d/yyyy h:mm a")}<br> Event End: ${format(new Date(end), "M/d/yyyy h:mm a")}`,
          showConfirmButton: false,
          timer: 3500,
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Event conflict detected',
          html: `Be careful creating overlapping events.`,
          showConfirmButton: false,
          timer: 3500,
        })
      }
    } 

    this.setState({ startTime: start })
    this.setState({ endTime: end })
    
    this.setState({ lockStartTime: new Date(start).addMins(-15) })
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
    // 

    if (this.state.isLoading) {
      return <div style={{display: 'flex', justifyContent: 'center'}}>
              <ColorRing
                  visible={true}
                  height='85vh'
                  width='85vw'
                  ariaLabel="blocks-loading"
                  wrapperStyle={{}}
                  wrapperClass="blocks-wrapper"
                  colors={['#014686ff', '#FFFFFF', '#014686ff', '#FFFFFF', '#014686ff']}
                />
              </div>
    } else {

      if (!this.state.valid_user) {
        Swal.fire({
          title: "Unauthenticated",
          icon: 'warning',
          html: "You do not have permission to edit this event.",
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: `Return to home`,
          showDenyButton: false,
        }).then(() => {
          this.props.history.push("/")
        })
      }
      
      if (this.state.status !== "Pending") {
        Swal.fire({
          title: "Error",
          icon: 'warning',
          html: "Only pending events can be updated.",
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: `Return to home`,
          showDenyButton: false,
        }).then(() => {
          this.props.history.push("/")
        })
      }


      return <div>
         <DnDCalendar
            localizer={localizer}
            selectable={true}
            events={this.state.events}
            defaultDate={this.state.defaultDate}
            startAccessor="start"
            endAccessor="end"
            defaultView={this.state.defaultView}
            style={{ height: '85vh' }}
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
          </div>
    }
  }

  guest(){
    if (!this.state.loggedIn || this.state.onBehalfOf) {
      return <div>
        <Form.Group controlId="Name">
          <Form.Label>Requester Name</Form.Label>
          <Form.Control type="text" value={this.state.requesterName} onChange={this.onChangeRequesterName} required />
        </Form.Group>

        <Form.Group controlId="Attendance">
          <Form.Label>Requester Email</Form.Label>
          <Form.Control type="text" defaultValue={this.state.requesterEmail} onChange={this.onChangeRequesterEmail} required />
        </Form.Group>

        <Form.Group controlId="Attendance">
          <Form.Label>Requester Phone Number</Form.Label>
          <Form.Control type="text" defaultValue={this.state.requesterPhone} onChange={this.onChangeRequesterPhone} required />
        </Form.Group>
      </div>
    }
  }

  onBehalfSwitch() {
    if (this.state.loggedIn && !this.props.edit) {
    return <Form.Check 
        type="switch"
        id="onBehalfOf"
        label="Make a request for someone else."
        checked={this.state.onBehalfOf}
        onChange={this.onChangeOnBehalfOf}
      />
    }
  }

  onChangeRequesterName(e) { this.setState({ requesterName: e.target.value }) }
  onChangeRequesterEmail(e) { this.setState({ requesterEmail: e.target.value }) }
  onChangeRequesterPhone(e) { this.setState({ requesterPhone: e.target.value }) }
  onChangeNotes(e) { this.setState({ notes: e.target.value }) }
  onChangeWillBePresent(e) { this.setState(({ willBePresent }) => ({ willBePresent: !willBePresent })); console.log(this.state.repeatDates)}
  onChangeOnBehalfOf(e) { this.setState(({ onBehalfOf }) => ({ onBehalfOf: !onBehalfOf })) }
  onChangeNeedLocks(e) { this.setState(({ needLocks }) => ({ needLocks: !needLocks })) }
  onChangeName(e) { this.setState({ name: e.target.value }) }

  async onChangeAttendance(e) {
    var current_room_occ = this.state.rooms.filter(item => item._id == this.state.room)[0].occupancy
    if (current_room_occ > e.target.value) {
      this.setState({ attendance: e.target.value})
    } else {
      var first_room = this.state.rooms.filter(item => item.occupancy > e.target.value)[0]._id
      if (this.state.room != first_room) {
        var first_room_name = this.state.rooms.filter(item => item._id == first_room)[0].name
        console.log(first_room_name)
          Swal.fire({
            icon: 'info',
            title: 'Room changed based on attendance',
            html: `The room has been set to: ${first_room_name}`,
            showConfirmButton: false,
            timer: 1750,
        }) 
      }
      this.setState({ attendance: e.target.value, room: first_room, events: []  }, this.GetCalendarEvents)
    }
  }

  onChangeRoom(e) {
    this.setState({ room: e.target.value }, this.GetCalendarEvents)
  }

  onChangeLockStartTime(e) { this.setState({ lockStartTime: e }) }
  onChangeLockEndTime(e) { this.setState({ lockEndTime: e }) }

  async onChangeStartTime(e) { 
    this.setState({defaultDate: e})
    if (this.state.endTime){
      var forcedEnd = new Date(e)

      forcedEnd.setYear(e.getFullYear())
      forcedEnd.setMonth(e.getMonth())
      forcedEnd.setDate(e.getDate())
      forcedEnd.setHours(this.state.endTime.getHours())
      forcedEnd.setMinutes(this.state.endTime.getMinutes())
      if (
        (this.state.endTime.getFullYear() !== e.getFullYear()) || 
        (this.state.endTime.getMonth() !== e.getMonth()) || 
        (this.state.endTime.getDate() !== e.getDate())) {
        Swal.fire({
            icon: 'warning',
            title: 'Multi-day events not allowed',
            html: `Event end date set to: ${format(new Date(forcedEnd), "M/d/yyyy h:mm a")}`,
            showConfirmButton: false,
            timer: 3500,
        })
      }

      this.setState({endTime: forcedEnd})

      this.handleCalendarSelect({start: e, end:forcedEnd}, e)
    } else {
      this.handleCalendarSelect({start: e, end:this.state.endTime}, e)
    }
  }

  onChangeEndTime(e) { 
    this.setState({defaultDate: e})
    if (this.state.startTime) {
      var forcedStart = new Date(e)

      forcedStart.setYear(e.getFullYear())
      forcedStart.setMonth(e.getMonth())
      forcedStart.setDate(e.getDate())
      forcedStart.setHours(this.state.startTime.getHours())
      forcedStart.setMinutes(this.state.startTime.getMinutes())
      if (
        (this.state.startTime.getFullYear() !== e.getFullYear()) || 
        (this.state.startTime.getMonth() !== e.getMonth()) || 
        (this.state.startTime.getDate() !== e.getDate())) {
        Swal.fire({
            icon: 'warning',
            title: 'Multi-day events not allowed',
            html: `Event start date set to: ${format(new Date(forcedStart), "M/d/yyyy h:mm a")}`,
            showConfirmButton: false,
            timer: 3500,
        })
      }

      this.setState({startTime: forcedStart})

      this.handleCalendarSelect({start: forcedStart, end:e}, e)
    } else {
      this.setState({ endTime: e })
    }
  }

  onChangeDoesRepeat(e) { 
    this.setState(({ doesRepeat }) => ({ doesRepeat: !doesRepeat }), );
    this.GetCalendarEvents();
   }
  onChangeFrequency(e) { 
    this.setState({ repeatFrequency: e.target.value }, this.GetCalendarEvents);
    this.GetCalendarEvents();
  }
  onChangeFuzzy(e) { 
    this.setState({ repeatFuzzy: e.target.value },);
     this.GetCalendarEvents();
  }
  async onChangeRepeatCount(e) { 
    this.setState({ repeatCount: e.target.value-1 }, this.GetCalendarEvents);
    console.log(this.state.repeatDates)
  }
  onChangeLoading(newState) {
    this.setState({ isLoading: newState})
  }


  Repeater() {
    if (this.state.loggedIn && this.state.user_emp_min) {
      return <div><Form.Check 
                type="switch"
                id="doesRepeat"
                label="Event repeat"
                checked={this.state.doesRepeat}
                onChange={this.onChangeDoesRepeat}
              />
              {this.FindFreq()}
              </div>
  }}

  FindFreq() {
    if (this.state.doesRepeat) {
      return <div>
      <Form.Group controlId="RepeatFrequency">
        <Form.Label>Repeat frequency</Form.Label>
          <Form.Select onChange={this.onChangeFrequency}>
            <option key={"monthly"} value={"monthly"}>Monthly</option>
            <option key={"weekly"} value={"weekly"}>Weekly</option>
            <option key={"weekdays"} value={"weekdays"}>Every Weekday</option>
            <option key={"daily"} value={"daily"}>Daily</option>
          </Form.Select>
        </Form.Group> 
        {this.findFuzzyDates()}
        </div>
    }
  }

  getLast(days_to_end, dow){
      if (days_to_end < 7 ) {
        return <option key={"last"} value={"last"}>{`On the last ${dow} of each month`}</option>
      }
    }

  findFuzzyDates() {
    if (this.state.repeatFrequency === "monthly") {
      if (this.state.startTime) {
        var date = this.state.startTime.getDate()
        var date_suffix = this.state.suffix_map[date-1]
        var dow = this.state.days_map[this.state.startTime.getDay()]
        var wom = Math.min((0 | this.state.startTime.getDate() / 7)+1, 4)
        var wom_suffix = this.state.suffix_map[wom-1]
        var date_holder = new Date(this.state.startTime)
        var days_to_end = new Date(new Date(date_holder.setMonth(new Date(date_holder).getMonth()+1)).setDate(0)).getDate() - date


        var absolute = `On the ${date}${date_suffix} of each month`
        var relative = `On the ${wom}${wom_suffix} ${dow} of each month`
      } else {
        absolute = `On the same date each month`
        relative= 'Relative within the month'
      }
      return <div>
            <Form.Group controlId="RepeatInterval">
              <Form.Label>Repeat Interval</Form.Label>
                <Form.Select onChange={this.onChangeFuzzy}>
                  <option key={"absolute"} value={"absolute"}>{absolute}</option>
                  <option key={"relative"} value={"relative"}>{relative}</option>
                  {this.getLast(days_to_end, dow)}
                </Form.Select>
              </Form.Group> 
              {this.numberRepeats()}
        </div>
    } else if (["weekly", "weekdays", "daily"].includes(this.state.repeatFrequency) ) {
      return <div>
              {this.numberRepeats()}
        </div>
    }
  }

  numberRepeats() {
    if ( ["monthly", ].includes(this.state.repeatFrequency) ) {
      return <div>
      <Form.Group controlId="RepeatFrequency">
        <Form.Label>Total number of events</Form.Label>
          <Form.Select onChange={this.onChangeRepeatCount}>
              {[...Array(12).keys()].map(i => i + 1).map((option) => {
                  return <option key={option} value={option}>{option}</option>
                })}
          </Form.Select>
        </Form.Group> 
        </div>
    } else if ( ["weekly",].includes(this.state.repeatFrequency)) {
              return <div>
              <Form.Group controlId="RepeatFrequency">
                <Form.Label>Total number of events</Form.Label>
                  <Form.Select onChange={this.onChangeRepeatCount}>
                      {[...Array(52).keys()].map(i => i + 1).map((option) => {
                          return <option key={option} value={option}>{option}</option>
                        })}
                  </Form.Select>
                </Form.Group> 
                </div>
    } else if ( ["weekdays",].includes(this.state.repeatFrequency)) {
          return <div>
          <Form.Group controlId="RepeatFrequency">
            <Form.Label>Total number weeks for event</Form.Label>
              <Form.Select onChange={this.onChangeRepeatCount}>
                  {[...Array(52).keys()].map(i => i + 1).map((option) => {
                      return <option key={option} value={5*option}>{option}</option>
                    })}
              </Form.Select>
            </Form.Group> 
            </div>
    } else if ( ["daily",].includes(this.state.repeatFrequency)) {
      return <div>
      <Form.Group controlId="RepeatFrequency">
        <Form.Label>Total number of events</Form.Label>
          <Form.Select onChange={this.onChangeRepeatCount}>
              {[...Array(7).keys()].map(i => i + 1).map((option) => {
                  return <option key={option} value={option}>{option}</option>
                })}
          </Form.Select>
        </Form.Group> 
        </div>
    }
  }
  
  showLocks() {
    if (this.state.needLocks) {
      return <div><div>
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
              </div> </div>
    }
  }

  async onSubmit(e) {
    console.log(this.state.repeatCount)
    console.log(this.state.repeatDates)
    e.preventDefault()
    
    const formattedStart = this.state.startTime.toLocaleString('en-US', dateTimeOptions);
    const formattedEnd = this.state.endTime.toLocaleString('en-US', dateTimeOptions);
    var room_name = this.state.rooms.filter(item => item._id == this.state.room)[0].name
    var confirm_text = `Event Name: ${this.state.name}<br>Room: ${room_name}<br><br>Start Time: ${formattedStart}<br>End Time: ${formattedEnd}`
    if (this.state.needLocks) {
      const formattedUnlock = this.state.lockStartTime.toLocaleString('en-US', dateTimeOptions);
      const formattedEnd = this.state.lockEndTime.toLocaleString('en-US', dateTimeOptions);

      confirm_text += `<br>Doors Unlock Time: ${formattedUnlock}<br>Doors Re-lock Time: ${formattedEnd}<br>`
    }
    if (this.state.doesRepeat) {
      if (this.state.repeatFrequency === "monthly") {
        if (this.state.repeatFuzzy === "absolute") {
          var date = this.state.startTime.getDate()
          var date_suffix = this.state.suffix_map[date-1]
          confirm_text += `<br>Repeats: Monthly on the ${date}${date_suffix} for a total of ${this.state.repeatCount+1} events.<br>`
        } else if (this.state.repeatFuzzy === "relative") {
          var dow = this.state.days_map[this.state.startTime.getDay()]
          var wom = Math.min((0 | this.state.startTime.getDate() / 7)+1, 4)
          var wom_suffix = this.state.suffix_map[wom-1]
          confirm_text += `<br>Repeats: On ${wom}${wom_suffix} ${dow} of each month for a total of ${this.state.repeatCount+1} events.<br>`
        } else if (this.state.repeatFuzzy === "last") {
          var dow = this.state.days_map[this.state.startTime.getDay()]
          confirm_text += `<br>Repeats: On the last ${dow} of each month for a total of ${this.state.repeatCount+1} events.<br>`
        }
      } else if (this.state.repeatFrequency === "weekly") {
        confirm_text += `<br>Repeats: Weekly for a total of ${this.state.repeatCount+1} events.<br>`
      } else if (this.state.repeatFrequency === "daily") {
        confirm_text += `<br>Repeats: Daily for a total of ${this.state.repeatCount+1} events.<br>`
      } else if (this.state.repeatFrequency === "weekdays") {
        confirm_text += `<br>Repeats: Daily, excluding weekends, for a total of ${this.state.repeatCount+1} events.<br>`
      }
    }
    if (this.state.notes != "") {
      confirm_text += `<br>Notes: ${this.state.notes}<br>`
    }

    Swal.fire({
      icon: 'question',
      title: 'Confirm your event details',
      html: confirm_text,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) { 
        var eventRequestObject = {}
        eventRequestObject = {
          name: this.state.name,
          room: this.state.room,
          attendance: this.state.attendance,
          startTime: this.state.startTime,
          endTime: this.state.endTime,
          lockStartTime: this.state.lockStartTime,
          lockEndTime: this.state.lockEndTime,
          paid: false,
          notes: this.state.notes,
          locksSet: false,
          hvacSet: false,
        };
        
        if ( this.state.loggedIn ) {
          eventRequestObject.requester = this.state.user_id;
          eventRequestObject.email = this.state.user_email;
          
          var paid = false
          if (this.state.user_emp_min && !this.state.onBehalfOf) { paid=true }
          eventRequestObject.paid = paid;
        }
        if (this.state.onBehalfOf ) {
          eventRequestObject.contact = this.state.requesterName;
          eventRequestObject.email = this.state.requesterEmail;
          eventRequestObject.phone = this.state.requesterPhone;
        };

        if (!this.state.needLocks) {
            eventRequestObject.lockStartTime = null;
            eventRequestObject.lockEndTime = null;
        }

        if (this.props.edit) {
          var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/update/${this.state.id}`
          axios.put(url, eventRequestObject)
            .then(res => console.log(res.data));
        } else if (this.state.doesRepeat) {
          eventRequestObject.repeat = crypto.randomBytes(20).toString('hex');
          eventRequestObject.repeatDates = this.state.repeatDates;
          var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/create-multiple`
            axios.post(url, eventRequestObject)
              .then(res => console.log(res.data));
        } else {
          url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/create`
            axios.post(url, eventRequestObject)
              .then(res => console.log(res.data));
        }

        if (this.props.edit) {
          Swal.fire({
            icon: 'success',
            title: 'Event request successfully updated',
            html: 'You will receive an email when the building manager approves or rejects your request(s)',
            showConfirmButton: false,
            timer: 5000,
          }).then((result) => {
            if (result.isDismissed) { window.location.href = '/';}
          })
        } else {
            Swal.fire({
            icon: 'success',
            title: 'Event request successfully created',
            html: 'You will receive an email when the building manager approves or rejects your request(s)',
            showConfirmButton: false,
            timer: 5000,
          }).then((result) => {
            if (result.isDismissed) {window.location.reload(true);}
          })    
        }
      }
    })




  }

  render() {
    let html
    html = <div className="form-wrapper">
      <Form onSubmit={this.onSubmit}>
        {this.onBehalfSwitch()}

        <div>
          <h4>Please input your event details.</h4>
        </div>

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
          <h4>Select event times with the following dialog boxes or click and drag in the calendar below </h4>
        </div>

        <div>
          Event start time: 
          <DateTimePicker
            onChange={this.onChangeStartTime}
            value={this.state.startTime}
            selected={this.state.startTime}
            disableClock={true}
            clearIcon={null}
            calendarType="US"
          />
        </div>

        <div>
          Event end time:
          <DateTimePicker
            onChange={this.onChangeEndTime}
            selected={this.state.endTime}
            value={this.state.endTime}
            disableClock={true}
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

        <Form.Check 
          type="switch"
          id="needLocks"
          label="Need doors unlocked"
          checked={this.state.needLocks}
          onChange={this.onChangeNeedLocks}
        />
        {this.showLocks()}

        {this.Repeater()}
        
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
      </Form>
    </div>
    return (html);
  }
}