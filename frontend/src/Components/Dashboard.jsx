
import React, { useEffect, useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import axios from 'axios';
import { verifyToken,getUser,verifyMail } from '../services/api.js'; // Assume it returns a promise


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // For loading state
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const fetchUserDetails = async () => {
      const tokenjwt = localStorage.getItem('token');
      console.log(tokenjwt)
      if (!tokenjwt) {
        navigate('/login');
        return;
      }

      try {
  //for first time registered email verification access
  // Parse the query parameters from the location search string
  const queryParams = new URLSearchParams(location.search);

  // Get specific query parameter
  const token = queryParams.get('token'); // example: ?token=1234
if (token){
console.log(token,"---------token of mail")
  const res=await verifyMail({token:token});
  if (!res.verified){
navigate("/verifyMail")
  }
  console.log(res)
}

//for jwt verification
        const isValid = await verifyToken(tokenjwt); 
        console.log(isValid)
        if (!isValid) {
          navigate('/login');
          return;
        }

        // Fetch user details
        const response = await getUser(tokenjwt);
      console.log(response)
        setUser(response); // Update user state
      } catch (error) {
        console.error('Error fetching user details:', error);
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/login');
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchUserDetails();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user information available.</div>;
  }

  return (
    <div className="dashboard">
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      {user.image && (
        <img src={user.image} alt="User Avatar" className="user-avatar" />
      )}
    </div>
  );
};

export default Dashboard;
