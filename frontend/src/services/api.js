import axios from 'axios'

const api=axios.create(
    {
        baseURL: "http://127.0.0.1:5000/api/v1",
        withCredentials:true,
    }
);

export const googleauth=(code)=>api.get(`/auth/google/callback?code=${code}`);



export const regUser=async(userData)=>{
try{
  const response = await axios.post("http://127.0.0.1:5000/api/regUser",userData);
 
  console.log(response.data)
  return response.data
}
catch (error) {
  console.error('Error during API call:', error.message);
  return null; // Indicate failure
}
}


export const logUser=async(creds)=>{
  try{
    const response=await axios.post("http://127.0.0.1:5000/api/logUser",creds);
    console.log(response.data)
    return response.data
  }
  catch(error){
    console.log('Error during API call:', error.message);
    return null;
  }
}

export const verifyToken = async (token) => {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/verify-token", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Ensure the response status is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON body
    const data = await response.json();

    // Check if the response has `success` field
    if (data.valid) {
      console.log('Success:', data.valid);
      return data.valid; // Or return data.success if you only need the success flag
    } else {
      console.error('Token verification failed:', data);
      return null; // Indicate failure
    }
  } catch (error) {
    console.error('Error during API call:', error.message);
    return null; // Indicate failure
  }
};






export const getUser = async (token) => {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/getUser", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Ensure the response status is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON body
    const data = await response.json();

    // Check if the response has `success` field
    if (data) {
      console.log('data from get user backend', data);
      return data; // Or return data.success if you only need the success flag
    } else {
      console.error('data not found:', data);
      return null; // Indicate failure
    }
  } catch (error) {
    console.error('Error during API call:', error.message);
    return null; // Indicate failure
  }
};

export const sendMail=async(email)=>{
  try{
    const response=await axios.post("http://127.0.0.1:5000/api/sendMail",email);
    console.log(response.data)
    return response.data
  }
  catch(error){
    console.log('Error during API call:', error.message);
    return null;
  }
}



export const verifyMail=async(token)=>{
  try{
    const response=await axios.post("http://127.0.0.1:5000/api/verifyMail",token);
    console.log(response.data)
    return response.data
  }
  catch(error){
    console.log('Error during API call:', error.message);
    return null;
  }
}

