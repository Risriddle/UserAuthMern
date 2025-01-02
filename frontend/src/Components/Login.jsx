import React ,{useState,useEffect}from 'react'
import '../Css/Auth.css'
import { useGoogleLogin} from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import {googleauth,logUser} from '../services/api.js'

const Login = () => {
const [user,setUser]=useState('')
  const navigate=useNavigate()
const [email,setEmail]=useState('')
const [pwd,setPwd]=useState('')

useEffect(() => {
  //Runs only on the first render
  const tokenjwt = localStorage.getItem('token');
  if(tokenjwt){
    navigate("/dashboard")
  }
}, []);

 const handleLogin=async(e)=>{
  e.preventDefault();
  const creds={email:email,pwd:pwd}
  try{
const res=await logUser(creds)
const token=res.token
localStorage.setItem('token', token);
setUser(res.data.user)
if (!user){
  navigate("/register")
}
navigate("/dashboard")
console.log(res.data.user)
  }
catch(error){console.log(error)}
 }



  async function  responseGoogle(authResult){
    try{
    if (authResult['code']){
      console.log(authResult['code'])
      const result=await googleauth(authResult.code) //send code to server
      console.log(result.data)
      const token = result.data.token; 
      console.log(token)
      // Store the JWT token in localStorage
      localStorage.setItem('token', token);
      // setUser(result.data.data.user)
      
      navigate("/dashboard")
      
    }
    else{
      console.log(authResult)
      throw new Error(authResult);
    }
  }
  catch(e){
    console.log(e)
  }  
  }



  const googleLogin=
useGoogleLogin({ //returns authResult which onSuccess contains code and onError contains error
  onSuccess: responseGoogle, 
  onError: responseGoogle,
  flow:"auth-code", 
   
})
  return (
    <div className='auth'>
    <div className='loginBox'>
        <h1>LOGIN FORM</h1>
        <form onSubmit={handleLogin}>
            <label>ENTER EMAIL</label>
            <input type="email" value={email} placeholder="enter your email" onChange={(e)=>setEmail(e.target.value)}></input>
            <label>ENTER PASSWORD</label>
        <input type="password" value={pwd} placeholder="enter your password"onChange={(e)=>setPwd(e.target.value)}></input>
        <button className="loginbtn">LOGIN</button>
        </form>
        <button type="button" className="login-with-google-btn" onClick={googleLogin}>
  Sign in with Google
</button>
       
    </div>
    </div>
  )
}

export default Login



