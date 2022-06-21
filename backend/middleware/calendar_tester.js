const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

let privatekey = require("./ollsmc.json");

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

let calendar = google.calendar('v3');
calendar.events.list({
   auth: jwtClient,
   calendarId: privatekey.calendarId
}, function (err, response) {
   if (err) {
       console.log('The API returned an error: ' + err);
       return;
   }

   var events = response.data.items;
   if (events.length == 0) {
       console.log('No events found.');
   } else {
       console.log('Event from Google Calendar:');
       for (let event of events) {
           console.log('Event name: %s, Creator name: %s, Create date: %s', event.summary, event.creator.displayName, event.start.date);
       }
   }
});



var event = {
	'summary': 'Test event name',
	// 'location': '800 Howard St., San Francisco, CA 94103',
	'description': 'A chance to hear more about Google\'s developer products.',
	'start': {
	  'dateTime': '2022-06-28T09:00:00-07:00',
	  'timeZone': 'America/Los_Angeles',
	},
	'end': {
	  'dateTime': '2022-06-28T17:00:00-07:00',
	  'timeZone': 'America/Los_Angeles',
	},
	// 'recurrence': [
	//   'RRULE:FREQ=DAILY;COUNT=2'
	// ],
	// 'attendees': [
	//   {'email': 'lpage@example.com'},
	//   {'email': 'sbrin@example.com'},
	// ],
	// 'reminders': {
	//   'useDefault': false,
	//   'overrides': [
	// 	{'method': 'email', 'minutes': 24 * 60},
	// 	{'method': 'popup', 'minutes': 10},
	//   ],
	// },
  };

  
calendar.events.insert({
	auth: jwtClient,
	calendarId: privatekey.calendarId,
	resource: event,
  }, function(err, event) {
	if (err) {
	  console.log('There was an error contacting the Calendar service: ' + err);
	  return;
	}
	console.log('Event created: %s', event.data.id);
	return event.data.id
  });



var new_event = {
	'summary': 'New test event name',
	// 'location': '800 Howard St., San Francisco, CA 94103',
	'description': 'Its updated',
	'start': {
	  'dateTime': '2022-06-29T09:00:00-07:00',
	  'timeZone': 'America/Chicago',
	},
	'end': {
	  'dateTime': '2022-06-29T17:00:00-07:00',
	  'timeZone': 'America/Chicago',
	},
  };

calendar.events.update({
	auth: jwtClient,
	calendarId: privatekey.calendarId,
	eventId: "leghbqvbsffcngvct5k64c9828",
	resource: new_event,
  }, function(err, event) {
	if (err) {
	  console.log('There was an error contacting the Calendar service: ' + err);
	  return;
	}
	const id = event.data.id
	console.log('Event updated: %s', event.data.id);
  });


// calendar.events.list({
//    auth: jwtClient,
//    calendarId: privatekey.calendarId
// }, function (err, response) {
//    if (err) {
//        console.log('The API returned an error: ' + err);
//        return;
//    }

//    var events = response.data.items;
//    if (events.length == 0) {
//        console.log('No events found.');
//    } else {
//        console.log('Event from Google Calendar:');
//        for (let event of events) {
//            console.log('Event name: %s, Creator name: %s, Create date: %s', event.summary, event.creator.displayName, event.start.date);
//        }
//    }
// });