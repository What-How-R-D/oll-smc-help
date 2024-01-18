import React, { Component } from "react";
import { Link } from "react-router-dom"
import axios from 'axios';
import update from 'immutability-helper';

import { ColorRing } from 'react-loader-spinner'

import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";

import Swal from 'sweetalert2';
import { dateTimeOptions } from './dateTimeFormat'; 

import {findUser, checkLogin} from "../api/user"


export default class BMhubList extends Component {
	constructor(props) {
	  
	  super(props)
	  
	  this.mapBlackoutRooms = this.mapBlackoutRooms.bind(this);

	  this.state = {
		events: [],
		pending_events: [],
		loggedIn: false,
		defaultView: "week",
     	defaultDate: "",
		user: {},
		isLoading: true,
	  };
	}
  
	async componentDidMount() {
		this.setState({isLoading: true})
		if (await checkLogin()){
			this.setState({ loggedIn: true })
		  } else {
			this.setState({ loggedIn: false })
		  }

		var user = await findUser()
		this.setState({user: user})
		
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/room/find-all/true`
		var rooms_map = await axios.get(url)
		  .then(res => {
			return new Map(res.data.map(i => [i._id, i.name]))
		  })
		  .catch((error) => {
			console.log(error);
		  })

		var all_events = []
		var all_blackouts = []
		var eventPromises = [];
		var blackoutPromises = [];

		for (let room in user.rooms) {
			let room_id = user.rooms[room]
			url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/find-bm-cal/`
			const eventPromise = axios.get(url + room_id)
			.then(res => {
				var new_events = res.data
				all_events.push(...new_events)
			})
				.catch((error) => {
					console.log(error);
			})
			eventPromises.push(eventPromise);


			url = `http://${process.env.REACT_APP_NODE_IP}:4000/blackout/find-all`
			const blackoutPromise = axios.get(url)
				.then(res => {
					var room_blackouts = res.data.filter(item => item.rooms.includes(room_id))
					all_blackouts.push(...room_blackouts)
				})
				.catch((error) => {
					console.log(error);
				});
			blackoutPromises.push(blackoutPromise);

		}
		await Promise.all([...eventPromises, ...blackoutPromises])
			.then(() => {
				
				var filtered_blackouts = all_blackouts.map(e => e["_id"])
				// store the keys of the unique objects
				.map((e, i, final) => final.indexOf(e) === i && i)
				// eliminate the dead keys & store unique objects
				.filter(e => all_blackouts[e]).map(e => all_blackouts[e]);
					
				this.setState({
					all_events: [...all_events.map(
						({ startTime, endTime, name, room, status, _id, requester, notes, contact, email, phone, lockStartTime, lockEndTime, repeat }) => ({
						start: new Date(startTime),
						end: new Date(endTime),
						title: rooms_map.get(room) + ": " + name,
						status: status,
						allDay: false,
						id: _id,
						requester: requester,
						notes: notes,
						contact: contact,
						email: email,
						phone: phone,
						lockStartTime: new Date(lockStartTime),
						lockEndTime: new Date(lockEndTime),
						repeat:repeat,
						})), 
						...filtered_blackouts.map(
							({ startTime, endTime, name, rooms, status, _id, requester, notes}) => ({
							start: new Date(startTime),
							end: new Date(endTime),
							title: "ADMIN RESERVED - " + this.mapBlackoutRooms(rooms_map, rooms) + ": " + name,
							status: "Blackout",
							allDay: false,
							requester: requester,
							notes: notes,
						})) ]
				});

			})
			.catch((error) => {
				console.log("An error occurred during requests:", error);
			});
		this.setState({isLoading: false})
	}

	mapBlackoutRooms(map, rooms){		
		return rooms.map( (room) => {
			return map.get(room)
		})
	}
  
	handleChangeView = (view, date) => {
		this.setState({
			defaultView: view
		  })
		// this.GetCalendarEvents()
	  }

	handleOnNavigate = (date) => {
		this.setState({
			defaultDate: date
		  })
		// this.GetCalendarEvents()
	  }

	approveRequest(id) {
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/approve/`
		axios.put(url + id, {status: "Approved"})
		  .then((res) => {
			console.log('Event successfully approved')
		  }).catch((error) => {
			console.log(error)
		  })
	  }

	approveRepeatingRequest(id) {
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/approve-repeating/`
		axios.put(url + id, {status: "Approved"})
		  .then((res) => {
			console.log('Events successfully approved')
		  }).catch((error) => {
			console.log(error)
		  })
	  }

	rejectRequest(id, reason) {
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/reject/`
		axios.put(url + id, {status: "Rejected", reason: reason})
		.then((res) => {
		  console.log('Event successfully rejected')
		}).catch((error) => {
		  console.log(error)
		})
	  }

	cancelRequest(id, reason) {
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/force-cancel/`
		axios.put(url + id, {status: "Canceled", reason: reason})
		.then((res) => {
		  console.log('Event successfully rejected')
		}).catch((error) => {
		  console.log(error)
		})
	  }

	requestUpdate(id, reason) {
		var url = `http://${process.env.REACT_APP_NODE_IP}:4000/event/request-update/`
		axios.put(url + id, {reason: reason})
		.then((res) => {
		  console.log('Event update request has been sent.')
		}).catch((error) => {
		  console.log(error)
		})
	  }


	swalTrigger = async (event) => {
		if (event.status !== "Blackout") {
			var req_owner = ""
			var contact = ""
			var email = ""
			var phone = ""

			console.log(event)
			if (event.requester){ 
				var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/find-id/`
				var user = await axios.get(url + event.requester)
				.then(res => {
					return res.data
					})
				.catch((error) => {
					console.log(error);
				})
				req_owner = user.name
				contact = user.name
				email = user.email
				phone = user.phone
			} else {
				req_owner = "Guest"
			}
			if (event.contact) {
				contact = event.contact
				email = event.email
				phone = event.phone
			}

			var text = `Requester: ${req_owner}<br>Event Contact: ${contact}<br>Email: ${email}<br>Phone: ${phone}`

			const formattedStart = event.start.toLocaleString('en-US', dateTimeOptions);
			const formattedEnd = event.end.toLocaleString('en-US', dateTimeOptions);
			text += `<br><br>Start Time: ${formattedStart}<br>End Time: ${formattedEnd}`
			
			if (event.lockStartTime > 1) {
				const formattedUnlock = event.lockStartTime.toLocaleString('en-US', dateTimeOptions);
				const formattedLock = event.lockEndTime.toLocaleString('en-US', dateTimeOptions);
				text += `<br>Doors Unlock Time: ${formattedUnlock}<br>Doors Re-lock Time: ${formattedLock}<br>`
			} else {
				text += '<br><br>No locks requested'
			}

			text += `<br><br>Requester notes: ${event.notes}`
		}
		
		if (event.status === "Approved" && this.state.user.type === "Admin") {
			Swal.fire({
				title: event.title,
				html: text,
				showConfirmButton: true,
				confirmButtonText: "Edit",
				showCancelButton: true,
				cancelButtonText: `Cancel`,
				showDenyButton: true,
				denyButtonText: `Force Cancel`,
			})
			.then((result) => {
				if (result.isDenied) {
					Swal.fire({
						title: event.title,
						icon: 'warning',
						html: "Please provide a reason for the rejection",
						showConfirmButton: true,
						confirmButtonText: `Reject`,
						showCancelButton: true,
						cancelButtonText: `Cancel`,
						showDenyButton: false,
						reverseButtons: true,
						input: "text",
						required: 'true'
					})
					.then((result) => {
						if (result.isConfirmed) {
							this.cancelRequest(event.id, result.value)
							event.status = "Canceled"

							const index = this.state.all_events.findIndex((aEvent) => aEvent.id === event.id);
							const updated_all_events = update(this.state.all_events, {$splice: [[index, 1]]});
							this.setState({all_events: updated_all_events});
						}
					});
				} else if (result.isConfirmed) {
					window.location.href = `/edit-event/${event.id}/token`;
				}
				})
		} else if (event.status === "Approved") {
				Swal.fire({
					title: event.title,
					html: text,
					showConfirmButton: false,
					showCancelButton: true,
					cancelButtonText: `Cancel`,
					showDenyButton: false,
				})				
		} else if (event.status === "Blackout") {
			Swal.fire({
				title: event.title,
				showConfirmButton: false,
				showCancelButton: true,
				cancelButtonText: `Cancel`,
				showDenyButton: false,
			})
		} else {
			var cancelTxt = "Request Update"
			if (this.state.user.type === "Admin") {  cancelTxt += "/Edit" }
			Swal.fire({
				title: event.title,
				html: text,
				showConfirmButton: true,
				confirmButtonText: `Approve`,
				showCancelButton: true,
				cancelButtonText: cancelTxt,
				showDenyButton: true,
				denyButtonText: `Reject`,
			})
			.then((result) => {
				if (result.isConfirmed) {
					console.log(event)
					if (event.repeat){
						Swal.fire({
							title: event.title,	
							icon: 'warning',
							html: "Verify event approval",
							showConfirmButton: true,
							confirmButtonText: `Approve all repeating events`,
							showCancelButton: true,
							cancelButtonText: `Cancel`,
							showDenyButton: true,
							denyButtonText: 'Approve this event',
							reverseButtons: true,
						})
						.then((result) => {
						  if (result.isDenied) {
							this.approveRequest(event.id)
							event.status = "Approved"

							const index = this.state.all_events.findIndex((aEvent) => aEvent.id === event.id);

							const updated_all_events = update(this.state.all_events, {$splice: [[index, 1, event]]});
							this.setState({all_events: updated_all_events});
						  } else if (result.isConfirmed) {
							this.approveRepeatingRequest(event.repeat)
							window.location.reload()
						  }
						});
					} else {
						Swal.fire({
							title: event.title,
							icon: 'warning',
							html: "Verify event approval",
							showConfirmButton: true,
							confirmButtonText: `Approve`,
							showCancelButton: true,
							cancelButtonText: `Cancel`,
							showDenyButton: false,
							reverseButtons: true,
						})
						.then((result) => {
							if (result.isConfirmed) {
								this.approveRequest(event.id)
								event.status = "Approved"
	
								const index = this.state.all_events.findIndex((aEvent) => aEvent.id === event.id);
	
								const updated_all_events = update(this.state.all_events, {$splice: [[index, 1, event]]});
								this.setState({all_events: updated_all_events});
							}
						});
					}
				} else if (result.isDenied) {
					Swal.fire({
						title: event.title,
						icon: 'warning',
						html: "Please provide a reason for the rejection",
						showConfirmButton: true,
						confirmButtonText: `Reject`,
						showCancelButton: true,
						cancelButtonText: `Cancel`,
						showDenyButton: false,
						reverseButtons: true,
						input: "text",
						required: 'true'
					})
					.then((result) => {
						if (result.isConfirmed) {
							this.rejectRequest(event.id, result.value)
							event.status = "Rejected"

							const index = this.state.all_events.findIndex((aEvent) => aEvent.id === event.id);
							const updated_all_events = update(this.state.all_events, {$splice: [[index, 1]]});
							this.setState({all_events: updated_all_events});
						}
					});
				} else if (result.isDismissed && result.dismiss==="cancel") {
					if (this.state.user.type === "Admin") {
						Swal.fire({
							title: event.title,
							// icon: 'warning',
							html: "Request update or edit?",
							showConfirmButton: true,
							confirmButtonText: `Request Update`,
							showCancelButton: false,
							denyButtonText: `Edit`,
							showDenyButton: true,
							reverseButtons: true,
						})
						.then((result) => {
							console.log(result)
							if (result.isConfirmed) {
								Swal.fire({
									title: event.title,
									icon: 'warning',
									html: "What kind of update would you like made?",
									showConfirmButton: true,
									confirmButtonText: `Request Update`,
									showCancelButton: true,
									cancelButtonText: `Cancel`,
									showDenyButton: false,
									reverseButtons: true,
									input: "text",
								})
								.then((result) => {
									if (result.isConfirmed) {
										this.requestUpdate(event.id, result.value)
									}
								});
							} else if (result.isDenied) {
								window.location.href = `/edit-event/${event.id}/token`;
							}
						});
					 } else {
						Swal.fire({
							title: event.title,
							icon: 'warning',
							html: "What kind of update would you like made?",
							showConfirmButton: true,
							confirmButtonText: `Request Update`,
							showCancelButton: true,
							cancelButtonText: `Cancel`,
							showDenyButton: false,
							reverseButtons: true,
							input: "text",
						})
						.then((result) => {
							if (result.isConfirmed) {
								this.requestUpdate(event.id, result.value)
							}
						});
					}
				}
			});
		}
	}



	Scheduler() {
		const localizer = momentLocalizer(moment);
		// const DnDCalendar = withDragAndDrop(Calendar);
		


		return <Calendar
				localizer={localizer}
				selectable={false}
				events={this.state.all_events}
				defaultDate={this.state.defaultDate}
				startAccessor="start"
				endAccessor="end"
				defaultView={this.state.defaultView}
				style={{ height: '85vh' }}
				onSelectEvent={this.swalTrigger}
				onNavigate={this.handleOnNavigate}
				onView={this.handleChangeView}
				views={['month', 'week', 'day']}
				eventPropGetter={(event) => ({
					style: {
					backgroundColor: ["Approved", "Blackout"].includes(event.status)  ? '#3174ad' : '#FF0000' ,
					},
				})}
				/>
	  }

	  
  
	render() {
	  let html
	  if (this.state.loggedIn) {
			if (this.state.isLoading){
				html = <div style={{display: 'flex', justifyContent: 'center'}}>
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
				html = <div> {this.Scheduler()} </div>
			}
		} else {
		  html = <div>
			  <Link to="/login">Login for more functionality</Link>
			</div>
		}
		return (html);
	}
  }