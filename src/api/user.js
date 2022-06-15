import axios from "axios"

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
	})
		.catch((error) => {
		console.log(error);
	})
	
	return user
}
