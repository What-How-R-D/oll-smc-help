import React, { Component } from "react";
import { Link } from "react-router-dom"
import Form from 'react-bootstrap/Form'

import {checkLogin} from "../api/user"

import BMhubList from './bm-hub-list.component.js'
import BMhubCalendar from './bm-hub-calendar.component.js'

export default class BMhub extends Component {
	constructor(props) {
		super(props)
		this.onChangeView = this.onChangeView.bind(this);

		this.state = {
			loggedIn: false,
			view: true,
		};
	}
  
	async componentDidMount() {
		if (await checkLogin()){
			this.setState({ loggedIn: true })
		  } else {
			this.setState({ loggedIn: false })
		  }
	}
  
	onChangeView(e) { this.setState(({ view }) => ({ view: !view })) }
  
	getView(){
		if (this.state.view){
			return <div> <BMhubCalendar /> </div>
		} else {
			return <div> <BMhubList /> </div>
		}
	}


	render() {
	  let html
	  if (this.state.loggedIn) {
		html = <div>
			<Form>
			<Form.Check 
				type="switch"
				id="CalendarView"
				label="Calendar View"
				checked={this.state.view}
				onChange={this.onChangeView}
				/>
			</Form>
			{this.getView()}
		 </div>
		} else {
		  html = <div>
			  <Link to="/login">Login for more functionality</Link>
			</div>
		}
		return (html);
	}
  }