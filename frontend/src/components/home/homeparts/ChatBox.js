import React, { useEffect, useState } from "react";
import "./ChatBox.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { UseGlobalContext } from "../../context/Context";
import ScrollableMessages from "./scrollablemessages/ScrollableMessages";
import { IoArrowBackCircle } from "react-icons/io5";
import { MdOutlineArrowBack } from "react-icons/md";
import {AiOutlineSend} from "react-icons/ai"
import io from "socket.io-client";
import UserSelectedForGroup from "./UserSelectedForGroup";
import UserListItem from "./UserListItem";
const ENDPOINT = `${process.env.REACT_APP_BASE_URL_BACKEND}`;
let socket, selectedChatCompare;

const ChatBox = () => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    fetchChats,
    messages,
    setMessages,
    chats,
    setchats,
  } = UseGlobalContext();
  const token = user?.token;
  console.log(token);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [updatedChatName, setUpdatedChatName] = useState();
  const [checkFields, setCheckFields] = useState(false);
  const [validateOfSelectedUsers, setValidateOfSelectedUsers] = useState(false);
  const [checkAdmin, setCheckAdmin] = useState(false);
  const [alreadySelectedUsers, setAlreadySelectedUsers] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loadings, setLoadings] = useState(false);
  const [groupNotExist,setGroupNotExist] = useState(false);

  // to fetch all of the messages of people or group
  const fetchMessages = async () => {
    setUpdatedChatName(selectedChat?.chatName);
    setAlreadySelectedUsers(selectedChat?.users);
    if (!selectedChat) return;
    try {
      setLoading(true);
      let data = await fetch(
        `${process.env.REACT_APP_BASE_URL_BACKEND}/api/message/${selectedChat?._id}`,
        {
          method: "get",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      data = await data.json();
      if(Array.isArray(data) && data?.length>=0){
        setMessages(data);
        setLoading(false);
        socket.emit("join chat", selectedChat?._id);
      }else{
        console.log(data);
        // setGroupNotExist(true)
      }
    } catch (error) {
      console.log(error);
      // setGroupNotExist(true)
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      // for selectedchat and one chatsid messages(group messages or one to one messages) are not seen in another chatid.
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // give notification
        if (!notification.includes(newMessageReceived)) {
          
         new Promise((resolve) => {
            setNotification([newMessageReceived, ...notification]);
            resolve();
          });
          
        }
        // now notification saves in mongoose but how to do it ..

      } else {
        if (!messages) {
        } else {
          setMessages([...messages, newMessageReceived]);
        }
      }
    });
  });

  const insideSendMessage = async() =>{
    if(newMessage){
    socket.emit("stop typing", selectedChat?._id);
    try {
      setNewMessage("");
      let data = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/message`, {
        method: "post",
        body: JSON.stringify({
          content: newMessage,
          chatId: selectedChat._id,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      data = await data.json();
      if(data.sender){
        await setMessages([...messages, data]);
        socket.emit("new message", data);

      }else{
        setGroupNotExist(true);
      }
    } catch (error) {
      setGroupNotExist(true);
    }
  }else{
  }
  }

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      await insideSendMessage();
    } else {
    }
  };


  // for typing
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    //typing indicator logic here
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  const nameHandler = async () => {
    if(!updatedChatName || updatedChatName == null || undefined) {
      setCheckFields(true);
      return;
    }
    try {
      let data = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/chat/rename`, {
        method: "put",
        body: JSON.stringify({
          chatId: selectedChat._id,
          chatName: updatedChatName,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      data = await data.json();
      setSelectedChat(data);
      let updatechats = chats.map((chat) => {
        if (chat._id === selectedChat?._id) {
          return { ...chat, chatName: updatedChatName };
        } else {
          return chat;
        }
      });
      setchats(updatechats);
    } catch (error) {
    }
  };

  //find users to add into group
  const handleSearch = async (input) => {
    if (!input) {
      return;
    }
    try {
      setLoadings(true);
      let datas = await fetch(
        `${process.env.REACT_APP_BASE_URL_BACKEND}/api/users?search=${input}`,
        {
          method: "get",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      datas = await datas.json();
      setLoadings(false);
      setSearchResult(datas);
    } catch (error) {
    }
  };

  //delete users from selected users.
  const handleDelete = async (userToRemove) => {
    if (
      selectedChat?.groupAdmin?._id !== user?._id &&
      userToRemove?._id !== user?._id
    ) {
      return;
    }
    // it is for if user remove themself from the group it call fetchchats.
    if(userToRemove?._id === user?._id){
      try {
        let data = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/chat/groupremove`, {
          method: "put",
          body: JSON.stringify({
            chatId: selectedChat?._id,
            userId: userToRemove?._id,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        data = await data.json();
        userToRemove?._id === user?._id ? setSelectedChat() : setSelectedChat(data);
        setAlreadySelectedUsers(
          alreadySelectedUsers.filter((u) => u?._id !== userToRemove?._id)
        );
        let updatechats = chats.map((chat) => {
          if (chat?._id === selectedChat?._id) {
            let userr = chat?.users;
            return {
              ...chat,
              users: userr.filter((u) => u?._id !== userToRemove?._id),
            };
          } else {
            return chat;
          }
        });
        setchats(updatechats);
        fetchChats(user);
        return;
      } catch (error) {
        return;
      }
    }

    try {
      let data = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/chat/groupremove`, {
        method: "put",
        body: JSON.stringify({
          chatId: selectedChat?._id,
          userId: userToRemove?._id,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      data = await data.json();
      userToRemove._id === user?._id ? setSelectedChat() : setSelectedChat(data);
      setAlreadySelectedUsers(
        alreadySelectedUsers?.filter((u) => u?._id === userToRemove?._id)
      );
      let updatechats = chats.map((chat) => {
        if (chat?._id === selectedChat?._id) {
          let userr = chat?.users;
          return {
            ...chat,
            users: userr.filter((u) => u?._id !== userToRemove?._id),
          };
        } else {
          return chat;
        }
      });
      setchats(updatechats);
    } catch (error) {
    }
  };

  // to add into group
  const handleGroup = async (userToAdd) => {
    if (selectedChat?.users.find((u) => u?._id === userToAdd?._id)) {
      return <h1>user already exist</h1>;
    }
    if (alreadySelectedUsers.includes(userToAdd)) {
      return <h1>user already exist</h1>;
    }
    if (selectedChat?.groupAdmin?._id !== user?._id) {
      return;
    }
    try {
      let data = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/chat/groupadd`, {
        method: "put",
        body: JSON.stringify({
          chatId: selectedChat?._id,
          userId: userToAdd?._id,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      data = await data.json();
      setSelectedChat(data);
      setAlreadySelectedUsers([...alreadySelectedUsers, userToAdd]);

      let updatechats = chats.map((chat) => {
        if (chat?._id === selectedChat?._id) {
          let userr = chat?.users;
          return {
            ...chat,
            users: [...userr, userToAdd], // add new user to existing users
          };
        } else {
          return chat;
        }
      });
      setchats(updatechats);
    } catch (error) {
    }
  };

  const threeDot = () => {
    setShowPopUp(!showPopUp);
  };
 
  const deleteGroup = async () => {
    if (selectedChat?.groupAdmin?._id !== user?._id){
      setCheckAdmin(true);
      return;
    }
    try {
      await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/chat/groupdelete/${selectedChat?._id}`,{
        method:"delete",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setCheckAdmin(false)
      setSelectedChat();
      fetchChats(user);
      setShowPopUp(!showPopUp);
      
    } catch (error) {
    }
  }
  return (
    <>
      <div className={selectedChat ? "chatBox" : `chatBox disappear`}>
        <div className="headerOfChatBox">
          <div className="backArrow" onClick={() => setSelectedChat()}>
            <IoArrowBackCircle />
          </div>
          <div className="usernameOfReceiver">
            <h1 className="chatBoxUserName">
              {selectedChat
                ? !selectedChat?.isGroupChat
                  ? selectedChat?.users && selectedChat?.users?.length > 0
                    ? selectedChat?.users[0]._id === user?._id
                      ? selectedChat?.users[1]?.username
                      : selectedChat?.users[0]?.username
                    : null
                  : selectedChat?.chatName
                : "ChatBox"}
            </h1>
          </div>

          <div className="menuOfChat" onClick={threeDot}>
            <BsThreeDotsVertical />
          </div>
        </div>
        <div className="chatShowed">
          {selectedChat ? (
            loading ? (
              <h1>Loading...</h1>
            ) : (
              <div className="singleChat">
                <div className="messages">
                  <ScrollableMessages messages={messages} />
                </div>
                {isTyping ? (
                  <>
                    <div className="typing">typing...</div>
                  </>
                ) : (
                  <></>
                )}
                <div className="inputToSendMessage">
                  <input
                    type="text"
                    autoFocus={true}
                    onKeyDown={sendMessage}
                    value={newMessage}
                    onChange={typingHandler}
                  />
                  <div onClick={insideSendMessage}><AiOutlineSend style={{fontSize:"larger",marginTop:"10px",cursor:"pointer",marginLeft:"4px",color:"green",fontWeight:"bolder"} }/></div>
                </div>
              </div>
            )
          ) : (
            <div style={{ fontSize: "larger" }}>
              Select the user to start the chat..
            </div>
          )}
        </div>
      </div>
      {showPopUp && selectedChat?.isGroupChat ? (
        <div className="updateGroup">
        <div className="newgroup">
          <div className="headerGroup">
            <h5>
              {" "}
              <MdOutlineArrowBack
                onClick={() => setShowPopUp(false)}
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
              Update Group Chat
            </h5>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              className="groupName"
              name="groupName"
              type="text"
              style={{ width: "130px" }}
              autoFocus={true}
              placeholder="group name.."
              value={updatedChatName}
              onChange={(e) => setUpdatedChatName(e.target.value)}
              required
            />
            <button className="buttonOfGroup" onClick={nameHandler}>
              update name
            </button>
          </div>
          <input
            className="searchusers"
            name="searchUsers"
            type="text"
            placeholder="search and select a users to add.."
            onChange={(e) => handleSearch(e.target.value)}
            required
          />
          <div className="selectedUserss">
            {alreadySelectedUsers
              ? alreadySelectedUsers?.map((u) => (
                  <UserSelectedForGroup
                    key={u?._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))
              : ""}
          </div>
          {checkFields && (
            <p style={{ color: "red", fontSize: "large" }}>
              ChatName is mandatory.
            </p>
          )}
          {validateOfSelectedUsers && (
            <p style={{ color: "red", fontSize: "large" }}>
              Atleast select 2 users for group
            </p>
          )}
          <button
            className="buttonOfGroup"
            onClick={() => handleDelete(user)}
            type="button"
            aria-label="Close"
          >
            Leave Group
          </button>
          <button
            className="buttonOfGroup"
            onClick={deleteGroup}
            type="button"
            aria-label="Close"
          >
            Delete Group
          </button>
          {checkAdmin && <p>only admin can delete group</p>}

          <div>
            {loadings ? (
              <h1>Loading...</h1>
            ) : (
              searchResult
                ?.slice(0, 4)
                ?.map((user) => (
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
      ) : (
        ""
      )}
      {
        groupNotExist && <div className="groupNotExist">
          <div className="contentOfgroupNotExist">
          <div> This group was deleted by the Admin. </div>
          <div> So,refresh it.</div>
          <button className="okReferesh" onClick={() => { fetchChats(user); setSelectedChat(); setGroupNotExist(false) }}>Ok</button>
          </div>
        </div>
      }
    </>
  );
};

export default ChatBox;
