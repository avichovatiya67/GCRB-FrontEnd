import { React, useState, useRef, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import otpIcon from "../../assets/otp-icon.png";
import PhoneInput from "react-phone-number-input";
import $ from "jquery";
import "react-phone-number-input/style.css";
import "./Login.css";
import { currentUserContext } from "../../context/ContextProvider";

// import firebase for login
import app from "./firebase";
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import axios from "axios";
import { toast } from "react-toastify";
const auth = getAuth(app);

function Login() {
  useEffect(() => {}, []);
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState();
  const [error, setError] = useState("");
  const [, setCurrentUser] = useContext(currentUserContext);
  const [resendBtnDisabled, setResendBtnDisabled] = useState(false);
  const [countDown, setCountDown] = useState(30);
  const confirmationResultt = useRef(null);
  const appVerifier = useRef(null);

  // Counter for resend otp
  useEffect(() => {
    let intervalId;
    if (resendBtnDisabled && countDown > 0) {
      intervalId = setInterval(() => {
        setCountDown(countDown - 1);
      }, 1000);
    } else {
      clearInterval(intervalId);
      setResendBtnDisabled(false);
      setCountDown(30);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [resendBtnDisabled, countDown]);

  // Send OTP
  const sendOtp = () => {
    appVerifier.current = new RecaptchaVerifier("recap", {}, auth);
    signInWithPhoneNumber(auth, phone, appVerifier.current)
      .then((response) => {
        $("#recap").css("display", "none");
        setOtpSent(true);
        setResendBtnDisabled(true);
        confirmationResultt.current = response;
      })
      .catch((error) => {
        setError("Something went wrong, please try again!");
        console.log("plaese try again", error);
      });
  };

  // Validate OTP
  const validateOtp = () => {
    confirmationResultt.current
      .confirm(otp)
      .then((result) => {
        // User signed in successfully.
        const user = result.user;
        axios
          .get(`/authenticateUser?phone=${user?.phoneNumber.slice(-10)}`)
          .then((res) => {
            if (res.data.data.length === 1) {
              localStorage.setItem(
                "currentUser",
                JSON.stringify(res.data.data[0])
              );

              setCurrentUser(res.data.data[0]);
              navigate("/");
              toast.success(res.data.message, {
                position: toast.POSITION.BOTTOM_CENTER,
              });
              // window.location.replace("/")
            } else {
              setError("");
            }
          })
          .catch((err) => {
            console.log(err);
          });
        // ...
      })
      .catch((error) => {
        // User couldn't sign in (bad verification code?)
        // ...
        // alert("sorry => " + error);
        if (error.message.includes("invalid-verification-code")) {
          setError("Invalid OTP");
        }
        // console.log("sorry => " + error);
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
    if (!otpSent) {
      return (
        <div id="send-otp">
          <p>
            <img className="img-fluid" src={otpIcon} alt="verification" />
          </p>
          <p className="text-muted">
            Enter your phone number to recieve OTP <br />
          </p>
          <div
            id="otp-screen"
            className="form-border d-flex flex-column align-items-center"
          >
            <PhoneInput
              id="phone"
              style={{ width: "60%" }}
              className="form-control"
              international
              defaultCountry="IN"
              value={phone}
              onChange={(e) => Boolean(e) && setPhone(e)}
            />
            <br />
            {/* </div> */}
            {/* <div className="my-4 text-center"> */}
            <button
              className="btn btn-warning text-uppercase col-md-5 my-4"
              type="button"
              onClick={() => {
                if (phone.length < 13) {
                  setError("Phone number is too short");
                } else if (phone.length > 15) {
                  setError("Phone number is too long");
                } else {
                  axios
                    .get(`/checkUser?phone=${phone.slice(-10)}`)
                    .then((res) => {
                      if (res.data.data.length !== 1) {
                        setError("You are not a registered user!");
                      } else {
                        setError("");
                        sendOtp();
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }
                // $("#recap").html(<p className="">Please try again</p>);
              }}
            >
              Send Otp
            </button>
            <p id="recap" className="text-2 mb-0"></p>
            <p id="error" style={{ color: "red" }}>
              {error}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div id="recieve-otp">
          <p>
            <img className="img-fluid" src={otpIcon} alt="verification" />
          </p>
          <p className="text-muted">
            Enter the verification code we sent to <br />
            <span className="text-dark text-4">
              {phone.slice(0, -10)}*******{phone.slice(-3)}
            </span>
          </p>
          <div
            id="otp-screen"
            className="form-border d-flex flex-column justify-content-center align-items-center"
          >
            <div className="divOuter">
              <div className="divInner">
                <input
                  id=""
                  type="text"
                  minLength={6}
                  maxLength={6}
                  onInput={(e) =>
                    (e.target.value = e.target.value.replace(/[^0-9]/gi, ""))
                  }
                  onChange={(e) => {
                    setOtp(e.target.value);
                  }}
                  className="partitioned form-control "
                  autoComplete="off"
                />
              </div>
            </div>
            {/* <br /> */}
            {/* </div>
          <div className="my-4 justify-content-center"> */}
            <button
              className="btn btn-warning text-uppercase col-md-5 my-4"
              type="button"
              onClick={() => {
                // setChangeClass(!changeClass);
                validateOtp();
              }}
            >
              Verify Otp
            </button>
            <div>
              <p className="text-2 ">
                Didn't get the code?
                <button
                  style={{
                    color: resendBtnDisabled ? "grey" : "blue",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: "transparent",
                  }}
                  disabled={resendBtnDisabled}
                  onClick={() => {
                    sendOtp();
                  }}
                >
                  Resend it
                </button>
                {countDown > 0 && countDown < 30 && `(after ${countDown}s)`}
              </p>
              <p id="recap" className="text-2 mb-0"></p>
              <p id="error" style={{ color: "red" }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="d-flex" style={{ height: "100%" }}>
      {/* <!-- Login Form ========================= --> */}
      <div
        id="a"
        style={{ minWidth: "30%" }}
        className={
          (!otpSent ? "order-1 " : "order-2 ") +
          " d-flex flex-column justify-content-center bg-light shadow-lg transition duration-1000"
        }
      >
        <div className="container text-center">
          {/* <div className="col-10 col-md-9 mx-auto text-center"> */}
          <div className="logo mb-4">
            <img src={logo} alt="CRB" height="100" />
            {/* <a href="/" title="CRB"></a> */}
          </div>
          <h4 className="mb-4">Login in to CRB</h4>
          {screen()}
          {/* </div> */}
        </div>
      </div>
      {/* <!-- Login Form End --> */}

      {/* <!-- Welcome Text ========================= --> */}
      <div
        id="b"
        style={{ width: "70%", overflow: "hidden" }}
        className={(otpSent ? "order-2 " : "order-1 ") + " flex-fill"}
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
