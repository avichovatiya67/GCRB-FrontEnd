import { React, useState,  useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import logo from "../../assets/GatewayGroup.svg";
import otpIcon from "../../assets/otp-icon.png";
import "./Login.css";
import { currentUserContext } from "../../context/ContextProvider";
import {
  TextField,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  FilledInput,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setCurrentUser] = useContext(currentUserContext);

  const [showPassword, setShowPassword] = useState(false);

  // Validate OTP
  const validateUser = () => {
    setError("");
    axios
      .post(`/validateUser`, {
        password: password,
        username: username,
      })
      .then((res) => {
        console.log("res: ", res.data.data);
        if (res.data.success) {
          localStorage.setItem("currentUser", JSON.stringify(res.data.data));
          setCurrentUser(res.data.data);
          setError("");
          navigate("/");
          toast.success(res.data.message, {
            position: toast.POSITION.BOTTOM_CENTER,
          });
          // window.location.replace("/")
        } else {
          toast.error(res.data.message, {
            position: toast.POSITION.BOTTOM_CENTER,
          });
          setError(res.data.message);
        }
      })
      .catch((err) => {
        setError(err.message);
        console.log("err: ", err);
      });
  };

  // // OTP check
  // const checkOTP = (e) => {
  //   var thisOTP = e.target.value.replace(/[^0-9]/gi, "");
  //   // if(e.target.value.length>1) {
  //   //   console.log(e.target.value.length);
  //   //   thisOTP = (~~e.target.value)
  //   //     ? ""
  //   //     : (e.target.value = e.target.value.substring(
  //   //         0,
  //   //         e.target.value.length - 1
  //   //       ))
  //   // }
  //   return thisOTP;
  // };

  const screen = () => {
    return (
      <div id="login">
        <p>
          <img className="img-fluid" src={otpIcon} alt="verification" />
        </p>
        <p className="text-muted">
          Enter your GIS login details <br />
        </p>
        <div
          id="otp-screen"
          className="form-border d-flex flex-column align-items-center"
        >
          <TextField
            type="text"
            className="col-7"
            label="Username"
            name="username"
            variant="filled"
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <FormControl
            className="col-7"
            size="small"
            variant="filled"
            // sx={{ m: 1, width: "25ch" }}
          >
            <InputLabel>Password</InputLabel>
            <FilledInput
              size="small"
              label="Password"
              name="password"
              onBlur={() => setShowPassword(false)}
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    // className="me-0"
                    onClick={() => setShowPassword((show) => !show)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <br />
          {/* </div> */}
          {/* <div className="my-4 text-center"> */}
          <button
            className="btn btn-warning text-capitalize col-7 "
            type="button"
            onClick={(e) => {
              if (!username.length) {
                setError("Please enter a username!");
              } else if (!password.length) {
                setError("Please enter a password!");
              } else {
                validateUser();
              }
              // if (phone.length < 13) {
              //   setError("Phone number is too short");
              // } else if (phone.length > 15) {
              //   setError("Phone number is too long");
              // } else {
              //   axios
              //     .get(`/checkUser?phone=${phone.slice(-10)}`)
              //     .then((res) => {
              //       if (res.data.data.length !== 1) {
              //         setError("You are not a registered user!");
              //       } else {
              //         setError("");
              //         sendOtp();
              //       }
              //     })
              //     .catch((err) => {
              //       console.log(err);
              //     });
              // }
              // $("#recap").html(<p className="">Please try again</p>);
            }}
          >
            Sign In
          </button>
          <br />
          <p id="recap" className="text-2 mb-0"></p>
          <p id="error" style={{ color: "red" }}>
            {error}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex" style={{ height: "100%" }}>
      {/* <!-- Login Form ========================= --> */}
      <div
        id="a"
        style={{ minWidth: "30%" }}
        className={
          // (!otpSent ? "order-1 " : "order-2 ") +
          " d-flex flex-column justify-content-center bg-light shadow-lg transition duration-1000"
        }
      >
        <div className="container text-center">
          {/* <div className="col-10 col-md-9 mx-auto text-center"> */}
          <div className="logo mb-4 align-items-start">
            <img src={logo} alt="CRB" height="80" />
            {/* <a href="/" title="CRB"></a> */}
            <h5 className="my-3" style={{ letterSpacing: "1px" }}>
              <b>Conference Room Booking</b>
            </h5>
          </div>
          {screen()}
          {/* </div> */}
        </div>
      </div>
      {/* <!-- Login Form End --> */}

      {/* <!-- Welcome Text ========================= --> */}
      <div
        id="b"
        style={{ width: "70%", overflow: "hidden" }}
        // className={(otpSent ? "order-2 " : "order-1 ") + " flex-fill"}
      >
        <div
          className="bgi g-0 text-center py-5 hover-zoom"
          style={{ height: "100%" }}
        >
          {/* <p className="text-6 d-inline-block fw-500">Welcome back!</p>
          <h1 className="text-12 fw-600 mb-2">You can book Your Place here.</h1> */}
        </div>
      </div>
      {/* <!-- Welcome Text End --> */}
    </div>
  );
}

export default Login;
