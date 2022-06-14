// import React, {useEffect, useState} from 'react'
import axios from "axios"

export const checkLogin = function()  {
	return localStorage.getItem("token")
}

export const findUser = async function()  {
	var user = ""
	await axios.get(
		"http://localhost:4000/users/auth", 
		{
			headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	}).then(res => {
		// console.log("user")
		// console.log(res.data)
		user = res.data
	})
		.catch((error) => {
		console.log(error);
	})
	
	return user
}
