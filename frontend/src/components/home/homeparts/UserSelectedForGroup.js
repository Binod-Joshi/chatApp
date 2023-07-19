import React from 'react'
import './UserSelectedForGroup.css'
import {RxCross2} from 'react-icons/rx'

const UserSelectedForGroup = ({user,handleFunction}) => {
  return (
    <div className='selectedUsers' >
      <div className='username'>{user.username} <div className='cross' onClick={handleFunction}><RxCross2 /></div></div>
    </div>
  )
}

export default UserSelectedForGroup;
