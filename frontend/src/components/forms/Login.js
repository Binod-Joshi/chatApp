import { useEffect, useState } from 'react'
import './Login.css'
import { Link } from 'react-router-dom'
import { UseGlobalContext } from '../context/Context'
import { useNavigate } from 'react-router-dom'
import { CircularProgress} from '@mui/material';

const Login = () => {
  const {user,loginClicked,error,isLoading} = UseGlobalContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loader, setLoader] = useState("");
  useEffect(() => {
    if(user?.token){
      navigate('/');
      
    }else{
      if(!user || user == null){
      navigate('/login')
      }
    }
  },[])

  useEffect(() => {
    console.log(isLoading);
  },[isLoading]);
  
  return (
    <div className="login">
    <span className="loginTitle">Login</span>
    <form className="loginForm" onSubmit={(e) =>loginClicked({navigate,e,email,password})}>
      <label>Email</label>
      <input className="loginInput" type="email" placeholder="Enter your email..." value={email} onChange={(e)=> setEmail(e.target.value)} required />
      <label>Password</label>
      <input className="loginInput" type="password" placeholder="Enter your password..." value={password} onChange={(e)=> setPassword(e.target.value)} required />
      <button className="loginButton" type='submit' >{isLoading ? "Login" :<CircularProgress size={20} color="inherit" />}</button>
      <p className='errorlogin'>{error}</p>
    </form>
      <button className="loginRegisterButton">
        <Link to= '/register' className='link'>Register</Link>
      </button>
  </div>
  )
}

export default Login
