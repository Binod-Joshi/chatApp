
import { UseGlobalContext } from "./components/context/Context";
import Home from "./components/home/Home";
import Login from "./components/forms/Login";
import Register from "./components/forms/Register";
import PrivateComponent from "./components/privatecomponent/PrivateComponent";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import UpdateProfile from "./components/profile/UpdateProfile";
import Profile from "./components/profile/Profile";
import DeleteAccount from "./components/profile/DeleteAccount";
import ChatLoading from "./components/loading/ChatLoading";

function App() {
  const {user} = UseGlobalContext();
  return (
    <Router>
      <Routes>
        <Route element={<PrivateComponent />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile/>} />
          {/* <Route path="/updateprofile" element={<UpdateProfile/>} /> */}
          <Route path="/delete" element = {<DeleteAccount/>} />
        </Route>
        <Route path={user?.token ? "/" : "/register"} element={ <Register />} />
        <Route path={user?.token ? "/" : "/login"} element={ user?.token ? <Home/>: <Login />}/>  
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
