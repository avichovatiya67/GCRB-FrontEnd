import React, { useContext, useEffect, useState } from "react";
// import r2 from "../assets/rooms/conference-room-2.jpg";
// import r3 from "../assets/rooms/conference-room-3.jpg";
// import r4 from "../assets/rooms/conference-room-4.jpg";
// import r5 from "../assets/rooms/conference-room-5.jpg";
// import r6 from "../assets/rooms/conference-room-6.jpg";
// import r7 from "../assets/rooms/conference-room-7.jpg";
import "./style.css";
import { theme_color, black, white } from "../theme/colors";
import HistoryCard from "./HistoryCard";
import {
  bookingHistoryContext,
  currentLocationContext,
  filterEventsContext,
  myResourcesContext,
  // creatingEventContext,
  // isBookingFormOpenContext,
} from "../context/ContextProvider";
import { Box, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const History = () => {
  const [filterUpcomingEvents, filterCompletedEvents] =
    useContext(filterEventsContext);
  const [currentLocation] = useContext(currentLocationContext);
  const [bookingHistory] = useContext(bookingHistoryContext);
  const [myResources] = useContext(myResourcesContext);
  // const [, setCreatingEvent] = useContext(creatingEventContext);
  // const [isBookingFormOpen, setIsBookingFormOpen] = useContext(
  //   isBookingFormOpenContext
  // );
  const [isViewMore, setIsViewMore] = useState(0);

  // const events = bookingHistory;
  const [upcomingEvents, setUpcomingEvents] = useState(
    filterUpcomingEvents(
      bookingHistory.filter((h) =>
        myResources.map((r) => r._id).includes(h.resourceId)
      )
    )
  );
  const [completedEvents, setCompletedEvents] = useState(
    filterCompletedEvents(
      bookingHistory.filter((h) =>
        myResources.map((r) => r._id).includes(h.resourceId)
      )
    )
  );

  useEffect(() => {
    setUpcomingEvents(() =>
      filterUpcomingEvents(
        bookingHistory.filter((h) =>
          myResources.map((r) => r._id).includes(h.resourceId)
        )
      )
    );
    setCompletedEvents(() =>
      filterCompletedEvents(
        bookingHistory.filter((h) =>
          myResources.map((r) => r._id).includes(h.resourceId)
        )
      )
    );
  }, [bookingHistory, currentLocation, myResources]);

  return (
    <div>
      {bookingHistory?.length !== 0 && (
        <div
          className="gap-3 d-flex flex-column"
          // style={{ fontFamily: "Noto Sans" }}
        >
          {/* start upcoming */}
          {upcomingEvents?.length !== 0 && (
            <div
              className="py-2"
              style={{
                background: theme_color,
                borderRadius: "15px",
              }}
            >
              <div className="d-flex justify-content-center">
                <label
                  className="large"
                  style={{
                    // fontFamily: "Inter",
                    fontWeight: 600,
                    fontStyle: "normal",
                    color: white,
                  }}
                >
                  My Upcoming Events
                </label>
              </div>

              <Box className="px-3 gap-2 d-flex flex-column my-1">
                {upcomingEvents?.slice(0, 4).map((event, index) => (
                  <HistoryCard
                    key={event._id}
                    id={index}
                    event={event}
                    upcoming={true}
                    isEditable={true}
                  />
                ))}
              </Box>

              {upcomingEvents?.length > 4 && (
                <div className="d-flex justify-content-center">
                  <label
                    className="small"
                    style={{
                      color: white,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setIsViewMore(1);
                    }}
                  >
                    View More
                  </label>
                </div>
              )}
            </div>
          )}
          {/* end upcoming */}

          {/* start completed */}
          {completedEvents?.length !== 0 ? (
            <div className="px-0" style={{ background: white }}>
              <div className="d-flex justify-content-center">
                <label
                  className="large"
                  style={{
                    // fontFamily: "Inter",
                    fontWeight: 600,
                    fontStyle: "normal",
                    color: black,
                  }}
                >
                  My Completed Events
                </label>
              </div>

              <Box className="px-3">
                {completedEvents?.slice(0, 4).map((event) => (
                  <HistoryCard
                    key={event._id}
                    id={event._id}
                    event={event}
                    upcoming={false}
                    isEditable={false}
                  />
                ))}
              </Box>

              {completedEvents?.length > 4 && (
                <div className="d-flex justify-content-center">
                  <label
                    className="small"
                    style={{
                      color: black,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setIsViewMore(2);
                    }}
                  >
                    View More
                  </label>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
          {/* end completed */}
        </div>
      )}
      {/* View More Drawer */}
      <Drawer
        open={Boolean(isViewMore)}
        variant="temporary"
        anchor="right"
        onClose={() => {
          setIsViewMore(0);
          // drawerOnClose();
        }}
        PaperProps={{ sx: { width: "20%" } }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5
            className="mx-4 mt-4 mb-3"
            style={{
              // fontFamily: "Inter",
              fontWeight: 600,
              fontStyle: "normal",
              color: black,
            }}
          >
            {isViewMore === 1 ? "Upcoming Events" : "Completed Events"}
          </h5>
          <IconButton onClick={() => setIsViewMore(0)} className="me-3 mt-2">
            <CloseIcon />
          </IconButton>
        </div>
        <hr className="mt-0 mx-3 mb-0" />
        <Box
          className="px-3 my-2"
          sx={{ overflowY: "auto", scrollBehavior: "auto" }}
        >
          {isViewMore === 1
            ? bookingHistory
              ? upcomingEvents
                  // .slice(0, 3)
                  .map((event) => (
                    <HistoryCard
                      event={event}
                      upcoming={false}
                      isEditable={true}
                    />
                  ))
              : ""
            : bookingHistory
            ? upcomingEvents
                // .slice(0, 5)
                ?.map((event) => (
                  <HistoryCard
                    event={event}
                    upcoming={false}
                    isEditable={false}
                  />
                ))
            : ""}
        </Box>
      </Drawer>
    </div>
  );
};

export default History;
