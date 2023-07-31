import React, { useRef, useState } from "react";
import { FcSettings } from "react-icons/fc";
import { IoMdNotifications } from "react-icons/io";
import { BiSearchAlt } from "react-icons/bi";
import "./SideDrawer.css";
import { Link, useNavigate } from "react-router-dom";
import { UseGlobalContext } from "../../context/Context";
import ChatLoading from "../../loading/ChatLoading";
import UserListItem from "./UserListItem";

const SideDrawers = () => {
  const {
    user,
    setSelectedChat,
    chats,
    setchats,
    logouts,
    notification,
    setNotification,
  } = UseGlobalContext();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const [logout, setLogout] = useState(false);
  const [foundUser, setfoundUser] = useState(true);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const inputRef = useRef(null);

  const handleButtonClick = () => {
    inputRef.current.focus();
  };

  const logoutUser = () => {
    localStorage.clear();
    logouts();
    navigate("/login");
    setLogout(false);
  };

  const searchHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setfoundUser(true);
      let data = await fetch(
        `${process.env.REACT_APP_BASE_URL_BACKEND}/api/users?search=${search}`,
        {
          method: "get",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      data = await data.json();
      if (data[0]) {
        setLoading(false);
        setSearchResult(data);
      } else {
        setLoading(false);
        setfoundUser(false);
      }
    } catch (error) {
    }
  };

  // for accessing the chat
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      let data = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/chat`, {
        method: "post",
        body: JSON.stringify({ userId }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      data = await data.json();
      if (!chats.find((c) => c._id === data._id)) {
        setchats([data, ...chats]);
      }
      setLoadingChat(false);
      setSelectedChat(data);
    } catch (error) {
    }
  };

  return (
    <>
      <div className="sidedrawerNav">
        <div className="search">
          <Link
            onClick={handleButtonClick}
            className="btn btn-transparent"
            data-bs-toggle="offcanvas"
            to="#offcanvasExample"
            role="button"
            aria-controls="offcanvasExample"
            style={{fontSize:"17px"}}
          >
            <div style={{display:"flex",flexDirection:"row"}}>
            <div><BiSearchAlt style={{fontSize:"26px",display:"flex",flexDirection:"row",alignItems:"center", justifyContent:"center"}} /> </div>
            <div className="searchLine" >search a user</div>
            </div>
          </Link>

          <div
            className="offcanvas offcanvas-start"
            tabIndex="-1"
            id="offcanvasExample"
            aria-labelledby="offcanvasExampleLabel"
          >
            <div className="offcanvas-header">
              <button
                type="button"
                className="btn-close text-reset"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <div>
                <form className="searchForm" onSubmit={searchHandler}>
                  <input
                    type="text"
                    placeholder="search user.."
                    className="inputSearch"
                    ref={inputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    required
                  />
                  <button type="submit" className="searchicon">
                    <BiSearchAlt />
                  </button>
                </form>
                {loading ? (
                  <ChatLoading />
                ) : foundUser ? (
                  searchResult?.map((searchUser) => (
                    <UserListItem
                      key={searchUser._id}
                      searchedUsers={searchUser}
                      handleFunction={() => accessChat(searchUser._id)}
                    />
                  ))
                ) : (
                  <h1
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {" "}
                    no user found!
                  </h1>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="talk">
          <h1>Let's talk</h1>
        </div>
        <div className="notificationAndSetting">
          <div className={showNotifications?"notification2":"notification1"} onClick={toggleNotifications}>
          <IoMdNotifications className="notification"  />
          {notification.length === 0?"":<p className="notificationLengthCount">{notification.length}</p>}
          </div>
          <button
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="btn btn-transparent"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasRight"
            aria-controls="offcanvasRight"
          >
            <FcSettings style={{fontSize:"larger"}}/>
          </button>

          <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="offcanvasRight"
            aria-labelledby="offcanvasRightLabel"
          >
            <div className="offcanvas-header">
              <ul className="link" style={{ width: "100%" }}>
                <li>
                  <Link to="/profile" className="link profilelink">
                    {" "}
                    <p>Profile</p>
                  </Link>
                </li>
                <li>
                  {/* <Link to="/updateprofile" className="link updateprofilelink">
                    {" "}
                    <p>Update Profile</p>
                  </Link> */}
                </li>
                <li>
                  <button
                    onClick={() => setLogout(true)}
                    className="logoutuser"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  >
                    Logout
                  </button>
                </li>
              </ul>
              <button
                type="button"
                className="btn-close text-reset"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      </div>
      {logout && (
        <div className="logouts">
          <div className="logout">
            <h1>Confirm to logout.</h1>
            <div className="buttons">
              <button className="ok" onClick={logoutUser}>
                Ok
              </button>
              <button className="cancel" onClick={() => setLogout(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {
        showNotifications ? notification.length === 0 ? <p className="notifications">No new messages</p> :<div className="notifications">
        {notification?.map((notif, index) => (
          <div className="notificationList" key={index} onClick={() => {
            setSelectedChat(notif.chat);
            setNotification(notification.filter((n) => n.chat._id !== notif.chat._id));
            setShowNotifications(false)
          }}>
            {notif.chat.isGroupChat
              ? `New Message in ${notif.chat.chatName}`
              : `New Message from ${
                  notif.chat.users[0]._id === (user && user._id)
                    ? notif.chat.users[1].username
                    : notif.chat.users[0].username
                }`}
          </div>
        ))}
      </div> :""
      }
    </>
  );
};

export default SideDrawers;
