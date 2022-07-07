const { format } = require("date-fns");
const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
let privatekey = require("./ollsmc.json");
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
let calendar = google.calendar('v3')

const findRoomData = require("./find_room")
const findUserData = require("./find_user")


module.exports = async function (event_data, status, kind="create") {
	
	// configure a JWT auth client
	let jwtClient = new google.auth.JWT(
		privatekey.client_email,
		null,
		privatekey.private_key,
		SCOPES);
	//authenticate request
	jwtClient.authorize(function (err, tokens) {
		if (err) {
			console.log(err);
			return;
		} else {
			console.log("Successfully connected!");
		}
	});

	const room_data = await findRoomData(event_data.room)
	if (event_data.requestor) {
		const user_data = await findUserData(event_data.requestor)
		var req_name = user_data.name
		var req_email = user_data.email
		var phone = user_data.phone
	} else {
		var req_name = event_data.contact
		var req_email = event_data.email
		var req_phone = event_data.phone
	}

	const user_data = await findUserData(event_data.requestor)
	var event = {
		'summary': `${room_data.name}: ${event_data.name}${status}`,
		'start': {
		  'dateTime': event_data.startTime,
		  'timeZone': 'America/Chicago',
		},
		'end': {
		  'dateTime': event_data.endTime,
		  'timeZone': 'America/Chicago',
		},
		'description': `Requestor: ${req_name}\nRequestor email: ${req_email}\nRequestor Phone: ${req_phone}\nRequestor Notes: ${event_data.notes}\nEvent Attendance: ${event_data.attendance}\nUnlock time: ${format(new Date(event_data.lockStartTime), "M/d/yyyy H:mm a")}\nLock time: ${format(new Date(event_data.lockEndTime), "M/d/yyyy H:mm a")}\n`
	  };

	if (kind==='update'){
		var gcal_id = await calendar.events.update({
			auth: jwtClient,
			calendarId: room_data.calendar_id,
			eventId: event_data.event_gcal_id,
			resource: event,
			}
		).then((event) => {return event.data.id})
		.catch((err) => { console.log("Error Updating Calender Event:", err); });
	} else if (kind==='create') {
		var gcal_id = await calendar.events.insert({
			auth: jwtClient,
			calendarId: room_data.calendar_id,
			resource: event,
		}
		).then((event) => {return event.data.id})
		.catch((err) => { console.log("Error Creating Calender Event:", err); });
	} else if (kind==='delete') {
		var gcal_id = await calendar.events.delete({
			auth: jwtClient,
			calendarId: room_data.calendar_id,
			eventId: event_data.event_gcal_id,
		}
		).then((event) => {return event.data.id})
		.catch((err) => { console.log("Error Deleting Calender Event:", err); });
	}

	return gcal_id
};