import { createContext, useContext, useReducer, useState } from "react";
import reducer from "./Reducer";

export const Context = createContext();

export const ContextPro = ({ children }) => {
  const [timeoutsId, setTimeoutsId] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("user")); //The ContextPro component runs every time the UseGlobalContext component is used to access the context values.
  const [showPopUp, setShowPopUp] = useState(false);
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setchats] = useState([]);
  const [notification, setNotification] = useState([]);
  const [messages, setMessages] = useState();
  const [groupName, setGroupName] = useState("");
  const [loadingMyChat,setLoadingMyChat] = useState(false);

  const initialState = {
    isLoading: true,
    user: storedUser || null,
    error: "",
    response:"",
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  const registerClicked = async ({
    navigate,
    username,
    email,
    password,
    profileDP,
  }) => {
    let user = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/auth/register`, {
      method: "post",
      body: JSON.stringify({ username, email, password, profileDP }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    user = await user.json();
    if (user._id) {
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "registered", payload: user });
      navigate("/");
    } else{
      dispatch({type: "registeredFailed",payload:user})
    }
  };

  const responseNull = async () => {
    dispatch({type:"registeredFailed", payload:""})
  }

  const loginClicked = async ({ navigate, e, email, password }) => {
    e.preventDefault();
    dispatch({type: "authRequest", payload:""})
    let user = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/auth/login`, {
      method: "post",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    user = await user.json();
    if (user._id) {
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "login", payload: user });
      navigate("/");
    } else {
      dispatch({ type: "loginfailed", payload: user.result });
      if (timeoutsId) {
        clearTimeout(timeoutsId); // clear the previous timeout if it exists
      }
      const newTimeoutId = setTimeout(() => {
        setTimeoutsId("");
        dispatch({ type: "loginfailed", payload: "" });
      }, 5000);
      setTimeoutsId(newTimeoutId);
    }
  };

  //logout
  const logouts = () => {
    let currentuser = JSON.parse(localStorage.getItem("user"));
    dispatch({ type: "logout", payload: currentuser });
  };

  const deleteUser = () => {
    let currentuser = JSON.parse(localStorage.getItem("user"));
    dispatch({ type: "logout", payload: currentuser });
  };

    //show chat(people or group to which current user already chat ) of particular user in mychat box
    const fetchChats = async (user) => {
      try {
        setLoadingMyChat(true);
        let data = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/chat`, {
          method: "get",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        data = await data.json();
        setchats(data);
        setLoadingMyChat(false)
      } catch (error) {
      }
    };

  //update user
  const updatehandler = async ({
    navigate,
    id,
    username,
    email,
    password,
    profilePic,
    token,
  }) => {
    const fields = password
      ? { username, email, password, profilePic }
      : { username, email, profilePic };
    let user = await fetch(`${process.env.REACT_APP_BASE_URL_BACKEND}/api/users/updating`, {
      method: "put",
      body: JSON.stringify(fields),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    user = await user.json();
    if (user._id) {
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "update", payload: user });
      navigate("/");
    }
  };

  return (
    <div>
      <Context.Provider
        value={{
          ...state,
          loginClicked,
          registerClicked,
          logouts,
          deleteUser,
          updatehandler,
          showPopUp,
          setShowPopUp,
          selectedChat,
          setSelectedChat,
          chats,
          setchats,
          notification,
          setNotification,
          messages,
          setMessages,
          groupName,
          setGroupName,
          loadingMyChat,
          fetchChats,
          responseNull,
        }}
      >
        {children}
      </Context.Provider>
    </div>
  );
};

export const UseGlobalContext = () => {
  return useContext(Context);
};
