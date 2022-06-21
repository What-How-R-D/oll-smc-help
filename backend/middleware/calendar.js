const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
let privatekey = require("./ollsmc.json");
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

module.exports = function () {
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

	return jwtClient
};