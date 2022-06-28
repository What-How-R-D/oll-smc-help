import axios from "axios"
const jwt = require("jsonwebtoken")

export const findUser = async function()  {
	var user = ""
	var url = `http://${process.env.REACT_APP_NODE_IP}:4000/users/auth`
	await axios.get(
		url, 
		{
			headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	}).then(res => {
		user = res.data
	}).catch((error) => {
		console.log(error);
	})
	
	return user
}


export const checkLogin = async function()  {
	
	if (!localStorage.getItem("token") ) {
		console.log("no token")
		return false
	} else {
		var decodedToken=jwt.decode(localStorage.getItem("token"), {complete: true});
		var now = new Date()

		if( decodedToken.payload.exp*1000 > now.getTime() ) {
			console.log("logged in")
			return true
		} else {
			console.log('logged out')
			return false
		}
	}
}