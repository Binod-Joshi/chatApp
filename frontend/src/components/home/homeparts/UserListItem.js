import React from 'react'
import './UserListItem.css'

const UserListItem = ({searchedUsers,handleFunction}) => {
  return (
    <div className='userslist' onClick={handleFunction} data-bs-dismiss="offcanvas"
    aria-label="Close">
      <div><img className='searchedUsersImg' src={searchedUsers.profileDP} alt="" /></div>
      <div className='searchedUsersName'>{searchedUsers.username}</div>
    </div>
  )
}

export default UserListItem
