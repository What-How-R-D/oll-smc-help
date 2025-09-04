const mongoose = require('mongoose');

let eventSchema = require('../models/event')
const calendarEvent = require("../middleware/calendar_event")

async function processEvents() {
    console.log(
		"Processing all events missing gcal id and deleting canceled/rejected with gcal id"
	);
    // eventSchema.find((error, data) => {
	// 	if (error) {
    //         console.log(error)
	// 		return next(error)
	// 	} else {
            
	// 		eventsWithoutGCalId=data.filter(event => !event.event_gcal_id);

    //         // Process each event
    //         for (const event of eventsWithoutGCalId) {
    //             // Call calendarEvent function for each event
    //             console.log("Updateing event", event.name)
    //             const event_gcal_id = calendarEvent(event);
    //             event.event_gcal_id = event_gcal_id
    //             event.save();
    //         }
	// 	}
    // })
    const data = await eventSchema.find().exec();
    eventsWithoutGCalId = data.filter(event => !event.event_gcal_id);

    // Process each event
    for (const event of eventsWithoutGCalId) {
        // Call calendarEvent function for each event
        console.log("Updating event", event.name, event.status);
        let event_gcal_id;
		if (event.status === "Pending") {
			event_gcal_id = await calendarEvent(event, " - PENDING");
		} else if (event.status === "Approved") {
			event_gcal_id = await calendarEvent(event, "");
		}
        console.log(event_gcal_id);
        event.event_gcal_id = event_gcal_id;
        await event.save();
    }

    const eventsToProcess = await eventSchema
		.find({
			event_gcal_id: { $exists: true, $ne: null },
			status: { $in: ["Rejected", "Canceled"] },
		})
		.exec();
	for (const event of eventsToProcess) {
		console.log("Processing event for removal", event.name, event.status);
		// Call calendarEvent function for each event (pass a flag or handle as needed)
		event_gcal_id = await calendarEvent(event, (kind = "delete"));
		event.event_gcal_id = event_gcal_id;
		await event.save();
	}

    console.log('Processing complete');
}

module.exports = { processEvents };
