import React, { useEffect, useState } from "react";
import "./MyChats.css";
import { UseGlobalContext } from "../../context/Context";
import { IoAdd } from "react-icons/io5";
import { MdOutlineArrowBack } from "react-icons/md";
import UserListItem from "./UserListItem";
import UserSelectedForGroup from "./UserSelectedForGroup";
import ChatLoading from "../../loading/ChatLoading";
import NotificationInMyChat from "./NotificationInMyChat";


const MyChats = () => {
  const { user, selectedChat, setSelectedChat, chats, setchats,groupName, setGroupName,loadingMyChat,fetchChats,notification,setNotification
     } =
    UseGlobalContext();
  const [loggedUser, setLoggedUser] = useState();
  const [newGroup, setNewGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [checkFields, setCheckFields] = useState(false);
  const [validateOfSelectedUsers, setValidateOfSelectedUsers] = useState(false);


  const clickUser = async(chat) => {
    await new Promise((resolve) => {
      setSelectedChat(chat)
      setNotification(notification.filter((n) => n.chat._id !== chat._id));
      resolve();
    });
  }


  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("user"))); 
    fetchChats(user);
  }, [setchats]);

  //find users to create group
  const handleSearch = async (input) => {
    if (!input) {
      return;
    }
    try {
      setLoading(true);
      let datas = await fetch(
        `${process.env.REACT_APP_BASE_URL_BACKEND}/api/users?search=${input}`,
        {
          method: "get",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      datas = await datas.json();
      setLoading(false);
      setSearchResult(datas);
    } catch (error) {
    }
  };

  // handle selectedusers
  const handleGroup = async (userToAdd) => {
    if(userToAdd._id === user._id){
      return;
    }
    if (selectedUsers.includes(userToAdd)) {
      return <h1>already exist</h1>;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };
  //delete users from selected users.
  const handleDelete = (userToRemove) => {
    setSelectedUsers(
      selectedUsers.filter((sel) => sel._id !== userToRemove._id)
    );
  };
  //used to create new group
  const handleSubmit = async () => {
    if (!groupName || !selectedUsers || selectedUsers.length === 0) {
      setValidateOfSelectedUsers(false);
      setCheckFields(true);
    } else {
      try {
        if (selectedUsers.length < 2) {
          setCheckFields(false);
          setValidateOfSelectedUsers(true);
          return;
        }
        let data = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/chat/group`, {
          method: "post",
          body: JSON.stringify({
            name: groupName,
            users: JSON.stringify(selectedUsers.map((u) => u._id)),
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });
        data = await data.json();
        setCheckFields(false);
        setValidateOfSelectedUsers(false);
        setchats([data, ...chats]);
        setNewGroup(false);
      } catch (error) {
      }
    }
  };


  return (
    <>
      <div className={selectedChat === undefined?"mychats" :`mychats disappear`}>
        <div className="mychatHeader">
          <h1>My Chats</h1>
          <button onClick={() => setNewGroup(true)}>
            New Group <IoAdd />
          </button>
        </div>
        <div className="chatWithUsers">
          {loadingMyChat?<ChatLoading/>:(chats
            ? chats?.map((chat) => (
                <div
                  onClick={() => clickUser(chat)}
                  key={chat._id}
                  className={
                    selectedChat === chat ? "selectedUserChat" : "usersChat"
                  }
                >
                  <div>
                    <img
                      className="searchedUsersImg"
                      src={
                        !chat?.isGroupChat
                          ? chat?.users[0]?._id === (loggedUser && loggedUser?._id)
                            ? chat?.users[1]?.profileDP
                            : chat?.users[0]?.profileDP
                          : "https://cdn-icons-png.flaticon.com/512/166/166258.png"
                      }
                      alt=""
                    />
                  </div>
                  <div className="searchedUsersName">
                    {!chat?.isGroupChat
                      ? chat?.users[0]?._id === (loggedUser && loggedUser?._id)
                        ? chat?.users[1]?.username
                        : chat?.users[0]?.username
                      : chat.chatName}
                      {/* <p style={{fontSize:"15px"}}>{chat?.latestMessage?.sender._id === user._id?"you: ":""}{chat?.latestMessage?.content}</p> */}
                      <div><NotificationInMyChat chat ={chat}/></div>
                  </div>
                </div>
              ))
            : " search user to start chat")}
        </div>
      </div>
      {newGroup && (
        <div className="updateGroup">
        <div className="newgroup">
          <div className="headerGroup">
            <h5>
              {" "}
              <MdOutlineArrowBack
                onClick={() => setNewGroup(false)}
                className="backIcon"
                style={{
                  marginRight: "20px",
                  cursor: "pointer",
                  border: "none",
                  borderRadius: "4px",
                  height: "25px",
                  width: "25px",
                }}
              />
              Create Group Chat
            </h5>
          </div>
          <input
            className="groupName"
            name="groupName"
            type="text"
            placeholder="group name.."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <input
            className="searchusers"
            name="searchUsers"
            type="text"
            placeholder="search and select a users to add.."
            onChange={(e) => handleSearch(e.target.value)}
            required
          />
          <button className="buttonOfGroup" onClick={handleSubmit} type="button" aria-label="Close">
            Create Group
          </button>
          {checkFields && (
            <p style={{ color: "red", fontSize: "large" }}>
              Both field must be field
            </p>
          )}
          {validateOfSelectedUsers && (
            <p style={{ color: "red", fontSize: "large" }}>
              Atleast select 2 users for group
            </p>
          )}
          <div className="selectedUserss">
            {selectedUsers
              ? selectedUsers?.map((u) => (
                  <UserSelectedForGroup
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))
              : ""}
          </div>
          <div>
            {loading ? (
              <h1>Loading...</h1>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    searchedUsers={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </div>
        </div>
        </div>
      )}
    </>
  );
};

export default MyChats;
