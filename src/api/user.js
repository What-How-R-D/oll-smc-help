import axios from "axios"

export const findUser = async function()  {
	var user = ""
	await axios.get(
		"http://localhost:4000/users/auth", 
		{
			headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	}).then(res => {
		user = res.data
	})
		.catch((error) => {
		console.log(error);
	})
	
	return user
}
