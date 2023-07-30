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

  render() {
    let html
    html = <div className="form-wrapper">
      <h1> Edit your event request </h1>

      <EventRequest edit={true} id={this.props.match.params.id} /> 

    </div>
    return (html);
  }
}