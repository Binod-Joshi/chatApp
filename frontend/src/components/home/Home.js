import React from "react";
import "./Home.css";
import MyChats from "./homeparts/MyChats";
import ChatBox from "./homeparts/ChatBox";
import SideDrawers from "./homeparts/SideDrawers";
const Home = () => {


  return (
    <div className="home">
      <SideDrawers />
      <div className="box">
        <MyChats  />
        <ChatBox  />
      </div>
    </div>
  );
};

export default Home;
