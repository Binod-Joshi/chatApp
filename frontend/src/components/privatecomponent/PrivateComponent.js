import { Navigate, Outlet } from 'react-router-dom';
import { UseGlobalContext } from '../context/Context'
import React, { memo } from 'react';

const PrivateComponent = () => {
    // const {user} = UseGlobalContext();
    const user = JSON.parse(localStorage.getItem("user")); //context bate liye bati kanje login garan jya localstorage ma data save hoigya lai aafui login ma jhan la thyo 
    
    
  return user?.token ? <Outlet/> : <Navigate to='/login' replace/>
}

export default memo(PrivateComponent);


