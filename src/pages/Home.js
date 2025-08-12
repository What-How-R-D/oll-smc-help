import React, { useState } from "react";
import { Link } from "react-router-dom";

import EventRequest from "../components/event-details.component";
import MyEvents from "../components/event-list-user.component";

const Home = (props) => {
	if (!props.isLoggedIn) {
		props.isLoggedIn = useState(false);
	}
	const [loggedIn] = props.isLoggedIn;
	console.log("Home component rendered, loggedIn:", loggedIn);

	let html;
	if (loggedIn) {
		html = (
			<div>
				<MyEvents />
				<h1> Create a new event request </h1>
				<EventRequest {...props} />
			</div>
		);
	} else {
		html = html = (
			<div>
				<Link to="/login">
					Please login or create an account to reserve a room
				</Link>
			</div>
		);
	}
	return html;
};

export default Home;
