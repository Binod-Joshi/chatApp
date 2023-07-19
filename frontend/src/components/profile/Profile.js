import React from 'react'
import './Profile.css'
import {FaFacebookSquare} from 'react-icons/fa'
import {FaTwitterSquare} from 'react-icons/fa'
import {FaInstagramSquare} from 'react-icons/fa'
import { UseGlobalContext } from '../context/Context';

const Profile = () => {
  const {user} = UseGlobalContext();
  return (
    <div className='divofsidebar'>
    <div className='sidebar'>
      <div className="sidebarItem">
        <span className="sidebarTitle">About me</span>
        <img src={user?.profileDP} alt="" />
        <p>{user?.username}</p>
      </div>
      <div className="sidebarItem">
        <span className="sidebarTitle">Follow us</span>
        <div className="sidebarSocial">
        <FaFacebookSquare className='sidebarIcon'/>
        <FaTwitterSquare className='sidebarIcon'/>
        <FaInstagramSquare className='sidebarIcon'/>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Profile
