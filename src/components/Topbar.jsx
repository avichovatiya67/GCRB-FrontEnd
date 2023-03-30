import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";
import Select from "@mui/joy/Select";
// import { Select, FormControl, InputLabel, MenuItem } from "@mui/material";
import { Option } from "@mui/joy";
import {
  LocationCityOutlined,
  Logout,
  MoreVert,
  Try,
} from "@mui/icons-material";
import {
  Button,
  Avatar,
  MenuItem,
  ListItemIcon,
  Menu,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import {
  currentLocationContext,
  currentUserContext,
  locationsContext,
} from "../context/ContextProvider";
import axios from "axios";

const Topbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useContext(currentUserContext);
  const [locations] = useContext(locationsContext);
  const [currentLocation, setCurrentLocation] = useContext(
    currentLocationContext
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [feedback, setFeedback] = useState();

  return (
    <>
      <div className="d-flex bg-white">
        <div
          className="px-2 flex-fill d-flex bg-white justify-content-between align-items-center"
          style={{ background: "#fff", width: "" }}
        >
          <div className="logo hover-zoom mx-3">
            <img src={logo} alt="CRB" width="50rem" height="50rem" />
          </div>
          <h4 className="m-0 flex-fill">Conference Room Booking</h4>
          <Select
            className="me-5"
            variant="soft"
            value={currentLocation ? currentLocation : ""}
            // placeholder="Select a pet…"
            startDecorator={<LocationCityOutlined />}
            sx={{ width: 240 }}
            onChange={(e, newValue) => {
              // console.log(newValue);
              setCurrentLocation(newValue);
            }}
          >
            {Boolean(locations?.length) &&
              locations?.map((location) => {
                return (
                  <Option
                    style={{ background: "#fff" }}
                    value={location._id}
                    key={location._id}
                  >
                    {location.city}
                  </Option>
                );
              })}
          </Select>
        </div>

        {/* start user */}
        <div
          id="user"
          className="d-flex align-self-end px-0"
          style={{
            width: "18%",
            borderBottom: "1px solid #ccc",
            boxShadow: "0px 0.6px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="flex-fill p-2 d-flex align-items-center justify-content-between">
            <div className="mx-3 my-1">
              <Avatar>
                {`${
                  currentUser?.userName?.split(" ")[0][0] +
                  currentUser?.userName?.split(" ")[1][0]
                }`}
              </Avatar>
            </div>
            <div className="ms-1 flex-fill d-flex flex-column">
              <label style={{ color: "#1A1919" }}>
                {currentUser?.userName}
              </label>
              <label style={{ color: "#B2B2B2" }}>
                {currentUser?.userRole}
              </label>
            </div>
            <div>
              <Button
                className="py-2 px-0"
                onClick={(event) => {
                  // localStorage.removeItem("currentUser");
                  // axios.get(`/logoutUser/${currentUser?._id}`).then((res) => {
                  //   toast.success(res.data.message, {
                  //     position: toast.POSITION.BOTTOM_CENTER,
                  //   });
                  //   navigate("/login");
                  // });
                  // setCurrentUser({});
                  setAnchorEl(event.currentTarget);
                }}
              >
                <MoreVert
                  sx={{
                    fontWeight: "bold",
                    // mx: 0.5,
                    fontSize: 30,
                    color: "#B2B2B2",
                  }}
                />
              </Button>
            </div>
          </div>
        </div>
        {/* end user */}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{ fontSize: 15 }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,

            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setOpenDialog(true);
          }}
        >
          <ListItemIcon>
            <Try fontSize="small" />
          </ListItemIcon>
          Feedbacks
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            localStorage.removeItem("currentUser");
            axios.get(`/logoutUser/${currentUser?._id}`).then((res) => {
              toast.success(res.data.message, {
                position: toast.POSITION.BOTTOM_CENTER,
              });
              navigate("/login");
            });
            setCurrentUser({});
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Feedback</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>Please provide your feedback.</DialogContentText> */}
          <TextField
            minRows={5}
            multiline
            autoFocus
            margin="dense"
            id="name"
            placeholder="Your feedbacks here..."
            type="email"
            fullWidth
            variant="standard"
            onChange={(e) => setFeedback(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const mailBody = {
                recipients: `avinash.chovatiya@thegatewaycorp.co.in`,
                subject: `CRB feedback from ${currentUser.userName}`,
                message: `<table>
                    <tr>
                      <td>Sender</td>
                      <td>:</td>
                      <td>${currentUser?.userName}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td>${currentUser?.email}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td>
                        ${
                          locations.filter(
                            (l) => l?._id === currentUser?.location
                          )[0]?.city
                        }
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" height="20px"}></td>
                    </tr>
                    <tr>
                      <td valign="top">Description</td>
                      <td valign="top">:</td>
                      <td><pre style="font-family: inherit">${feedback}</pre></td>
                    </tr>
                  </table>`,
              };
              console.log(
                locations.filter((l) => l._id === currentUser.location)[0].city
              );
              axios.post("/sendEmail", mailBody);
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Topbar;
