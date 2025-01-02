import React ,{useState ,useEffect}from 'react'
import '../Css/Auth.css'
import { useGoogleLogin} from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import {googleauth,regUser,sendMail} from '../services/api.js'  


const Register = ({ setUser }) => {
  
const navigate=useNavigate()
const [username,setUsername]=useState('');
const [email,setEmail]=useState('');
 const [pwd,setPwd]=useState('')
 const [repeatPwd,setRepeatpwd]=useState('')
 const [error,setError]=useState('')
const [loading,setLoading]=useState(false)

useEffect(() => {
  //Runs only on the first render
  const tokenjwt = localStorage.getItem('token');
  if(tokenjwt){
    navigate("/dashboard")
  }
}, []);


  const handleSignUp=async(e)=>{
      e.preventDefault();
if (pwd!=repeatPwd){
  setError("Passwords do not match");
  return;
}
const userData={name:username,email:email,pwd:pwd}
setLoading(true)
try{



const reg=await regUser(userData)
await sendMail({email:email})
const user=reg.data.user
const token=reg.token
// console.log(token,"=========================")
localStorage.setItem('token', token);
setUser(user)

navigate("/verifyMail")
// console.log(reg.data.user)
}
catch(error){
  console.error("Registration failed",error.message)}
finally{
  setLoading(false);
}
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
      setUser(result.data.data.user)
      
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
    <>
    <div className='auth'>
        <div className='loginBox'>
        <h1>SIGN UP FORM</h1>
        <form onSubmit={handleSignUp}>
        <label>ENTER USERNAME</label>
            <input type="text"  value={username} placeholder="enter your username" onChange={(e)=>setUsername(e.target.value)}></input>
            <label>ENTER EMAIL</label>
            <input type="email" value={email} placeholder="enter your email" onChange={(e)=>setEmail(e.target.value)}></input>
            <label>ENTER PASSWORD</label>
        <input type="password" value={pwd} placeholder="enter your password" onChange={(e)=>setPwd(e.target.value)}></input>
        <label>REPEAT PASSWORD</label>
        <input type="password" value={repeatPwd} placeholder="repeat password" onChange={(e)=>setRepeatpwd(e.target.value)}></input>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button className="loginbtn" disabled={loading}>{loading ? 'Please wait...' : 'SIGN UP'}</button>
        {/* <button className="loginbtn" >SIGN UP</button> */}
        </form>
        <button type="button" className="login-with-google-btn" onClick={googleLogin}>
  Sign in with Google</button>
{/*   googleLogin is the function returned by the hook useGoogleLogin */}
     
    </div>
    </div>

  
    </>
  )
}

export default Register