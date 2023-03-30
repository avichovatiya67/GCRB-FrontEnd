import { useContext, useEffect, useState } from "react";
import "./style.css";
import { AutoDelete, NoteAlt, MoreVert } from "@mui/icons-material";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import {
  creatingEventContext,
  isBookingFormOpenContext,
  allResourcesContext,
  updatingEventContext,
  viewOnlyFormContext,
  bookingHistoryContext,
  openCancelConfirmContext,
} from "../context/ContextProvider";
// import r2 from "../assets/rooms/conference-room-2.jpg";

import { Menu, MenuItem } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

const HistoryCard = (props) => {
  const [isBookingFormOpen, setIsBookingFormOpen] = useContext(
    isBookingFormOpenContext
  );
  const [, setUpdatingEvent] = useContext(updatingEventContext);
  const [, setCreatingEvent] = useContext(creatingEventContext);
  const [bookingHistory] = useContext(bookingHistoryContext);
  const [, setViewOnlyForm] = useContext(viewOnlyFormContext);
  const [allResources] = useContext(allResourcesContext);

  // const [imageSrc, setImageSrc] = useState(r2);
  const [anchorEl, setAnchorEl] = useState(null);
  const [eventToRebook, setEventToRebook] = useState(props.event);
  const [, setOpenCancelConfirm] = useContext(openCancelConfirmContext);
  useEffect(() => {
    setEventToRebook(props.event);
  }, [bookingHistory]);
  return (
    // <div className="">
    <div
      className="p-2 d-flex justify-content-between"
      key={props.id}
      style={
        props.upcoming
          ? {
              background: "rgba(255, 255, 255, 0.13)",
              borderRadius: "15px",
              boxShadow: "0px 0.5px 0px rgba(0, 0, 0, 0.25)",
            }
          : { borderBottom: "0.5px solid rgba(0, 0, 0, 0.09)" }
      }
    >
      <div
        className="d-flex"
        style={{ cursor: "pointer" }}
        onClick={() => {
          setCreatingEvent(props.event);
          setIsBookingFormOpen(!isBookingFormOpen);
        }}
      >
        {/* <div className="me-2">
          <img
            src={imageSrc}
            alt="img"
            onError={() => setImageSrc(r2)}
            height={70}
            width={70}
            style={{ borderRadius: "15px" }}
          />
        </div> */}

        <div className="flex-fill ms-1">
          <label
            className="small"
            style={{
              // fontFamily: "Inter",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.8rem",
              fontStyle: "normal",
              color: props.upcoming ? "#FFFFFF" : "#000000",
            }}
          >
            {props.event.title}
          </label>
          <div
            style={{
              // fontFamily: "Inter",
              fontWeight: 450,
              fontSize: "0.75rem",
              fontStyle: "normal",
              color: props.upcoming ? "#D7D7D7" : "#818181",
            }}
          >
            <label style={{ cursor: "pointer" }}>
              {new Date(props.event.start).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              }) +
                " - " +
                new Date(props.event.end).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }) +
                `  |  `}
              {/* <br /> */}
              {new Date(props.event.startDate).toDateString().slice(0, -4)}
            </label>
            <br />
            <label style={{ cursor: "pointer" }}>
              {allResources.length &&
                allResources
                  ?.filter((resource) => {
                    return resource._id === props.event.resourceId
                      ? true
                      : false;
                  })
                  .map((resource) => {
                    return resource.roomName;
                  })}
            </label>
          </div>
        </div>
      </div>

      <Tooltip placement="bottom-end" title="Options">
        <MoreVert
          variant="contained"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          className="mt-1"
          fontSize="13px"
          sx={{
            color: props.upcoming ? "#FFFFFF" : "#818181",
            cursor: "pointer",
          }}
        />
      </Tooltip>

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
        {props.isEditable ? (
          <MenuItem
            onClose={() => setAnchorEl(null)}
            onClick={() => {
              setAnchorEl(null);
              setOpenCancelConfirm(
                `${props?.event._id}$${props?.event?.title}`
              );
              // const confirm = window.confirm(
              //   "You are about to cancel your booking... " +
              //     `\n` +
              //     props.event.title
              // );
              // if (confirm) {
              //   return axios
              //     .patch(`/cancelBooking/${props.event._id}`)
              //     .then((res) => {
              //       console.log(res);
              //       toast.success(res.data.message, {
              //         position: toast.POSITION.TOP_RIGHT,
              //       });
              //       window.location.reload();
              //     })
              //     .catch((err) => {
              //       // alert(err)
              //       toast.error(err.data.message, {
              //         position: toast.POSITION.TOP_RIGHT,
              //       });
              //     });
              // }
            }}
            sx={{ fontSize: 15 }}
          >
            <AutoDelete
              sx={{
                fontSize: 20,
              }}
            />
            &nbsp;Cancel
          </MenuItem>
        ) : (
          ""
        )}
        {!props.isEditable ? (
          <MenuItem
            onClose={() => setAnchorEl(null)}
            sx={{ fontSize: 15 }}
            onClick={() => {
              setAnchorEl(null);

              // Gives Current Time with Date 01/01/19770
              const startTime = new Date();
              startTime.setFullYear(1970);
              startTime.setMonth(0);
              startTime.setDate(1);
              const endTime = new Date(startTime);
              // Event to be Rebokedhow to
              // const eventToRebook = props.event;
              eventToRebook.startDate = new Date(new Date().toDateString());
              eventToRebook.endDate = new Date(new Date().toDateString());
              eventToRebook.start = startTime;
              eventToRebook.end = endTime.setMinutes(endTime.getMinutes() + 30);
              setCreatingEvent(eventToRebook);
              setViewOnlyForm(true);
              setIsBookingFormOpen(!isBookingFormOpen);
            }}
          >
            <EventRepeatIcon
              sx={{
                fontSize: 20,
              }}
            />
            &nbsp;Rebook
          </MenuItem>
        ) : (
          ""
        )}
        {props.isEditable ? (
          <MenuItem
            onClose={() => setAnchorEl(null)}
            onClick={() => {
              setAnchorEl(null);
              setViewOnlyForm(true);
              setUpdatingEvent(props.event);
              setIsBookingFormOpen(!isBookingFormOpen);
            }}
            sx={{ fontSize: 15 }}
          >
            <NoteAlt
              sx={{
                fontSize: 20,
              }}
            />
            &nbsp;Update
          </MenuItem>
        ) : (
          ""
        )}
      </Menu>
    </div>
    // </div>
  );
};

export default HistoryCard;
