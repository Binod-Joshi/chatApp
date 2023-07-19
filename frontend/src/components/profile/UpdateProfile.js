import React, { useEffect, useState } from 'react'
import './UpdateProfile.css'
import { UseGlobalContext } from '../context/Context';
import { Link, useNavigate } from 'react-router-dom';
import {RiDeleteBin6Fill} from 'react-icons/ri'
import {BiUserCircle} from 'react-icons/bi'

const UpdateProfile = () => {
  const { user, updatehandler } = UseGlobalContext();
  const id = user?._id;
  const token = user?.token;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileDP, setProfileDP] = useState("");
  
  const navigate = useNavigate();
  useEffect(() => {
    getCuser();
  }, []);
  const getCuser = async () => {
    setUsername(user?.username);
    setEmail(user?.email);
    setProfileDP(user?.profileDP);
  };

  const updatehandlers = async (e) => {
    e.preventDefault();
    updatehandler({ navigate, id, username, email, password,profileDP,token });
  };

  const imageUpload = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setProfileDP(base64);
  };

  const convertToBase64 = (file) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    return new Promise((resolve, reject) => {
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div className="settings">
      <div className="settingsWrapper">
        <div className="settingsTitle">
          <span className="settingsTitleUpdate">Update Your Account</span>
          <span className="settingsTitleDelete">
            <Link className="link" to={`/delete`}>
            <RiDeleteBin6Fill className="deleteAccount"/>
            </Link>
          </span>
        </div>
        <form className="settingsForm" onSubmit={updatehandlers}>
          <label>Profile Picture</label>

          <div className="settingsPP">
            <img src={profileDP} alt="" />
            <label htmlFor="fileInput">
              <BiUserCircle className="settingsPPIcon" />
            </label>
            <input
              id="fileInput"
              type="file"
              style={{ display: "none" }}
              className="settingsPPInput" accept="image/*"
              onChange={imageUpload}
            />
          </div>
          <label>Username</label>
          <input
            style={{ color: "black" }}
            type="text"
            placeholder="username"
            name="name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Email</label>
          <input
            style={{ color: "black" }}
            type="email"
            placeholder="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            style={{ color: "black" }}
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="settingsSubmitButton" type="submit">
            Update
          </button>
        </form>
      </div>
      <div className="display">
      {/* <Sidebar  /> */}
      </div>
    </div>
  );
}

export default UpdateProfile
