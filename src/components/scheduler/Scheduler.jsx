import React, { useState, useEffect, useContext } from "react";
import "../style.css";
import {
  theme_color,
  completed_event_1,
  completed_event_3,
  upcoming_event_1,
  upcoming_event_3,
  white,
  passed_time,
} from "../../theme/colors";
import Scheduler, { SchedulerData, ViewTypes } from "react-big-scheduler";
// import EventItemPopover from "react-big-scheduler";
import withDragDropContext from "./withDnDContext";
import { toast } from "react-toastify";
import { Row, Col, Table } from "react-bootstrap";
import "react-big-scheduler/lib/css/style.css";
import {
  allBookingsContext,
  // bookingHistoryContext,
  creatingEventContext,
  currentUserContext,
  filterEventsContext,
  isBookingFormOpenContext,
  myResourcesContext,
  openCancelConfirmContext,
  updatingEventContext,
  viewOnlyFormContext,
} from "../../context/ContextProvider";
import axios from "axios";
import {
  Card,
  Drawer,
  IconButton,
  Button,
  Popover,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import InfoIcon from "@mui/icons-material/Info";
import { RRule } from "rrule";
// import { RRuleSet, rrulestr } from "rrule";
import { AutoDelete, NoteAlt, OpenInNew } from "@mui/icons-material";
// import dayjs from "dayjs";

const Basic = () => {
  const [isBookingFormOpen, setIsBookingFormOpen] = useContext(
    isBookingFormOpenContext
  );
  const [, setOpenCancelConfirm] = useContext(openCancelConfirmContext);
  const [viewOnlyForm, setViewOnlyForm] = useContext(viewOnlyFormContext);
  // const [bookingHistory, setBookingHistory] = useContext(bookingHistoryContext);
  const [allBookings] = useContext(allBookingsContext);
  const [, setCreatingEvent] = useContext(creatingEventContext);
  const [, setUpdatingEvent] = useContext(updatingEventContext);
  const [myResources] = useContext(myResourcesContext);
  const [currentUser] = useContext(currentUserContext);
  const [filterUpcomingEvents] = useContext(filterEventsContext);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [, setUpdate] = useState();
  const [resourceDrawerData, setResourceDrawerData] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedEvent, setSelectedEvent] = useState({});

  const [viewModel, setViewModel] = useState(
    new SchedulerData(
      new Date().toString(),
      ViewTypes.Day,
      false,
      false,
      {
        checkConflict: true,
        endResizable: false,
        startResizable: false,
        movable: false,
        defaultEventBgColor: upcoming_event_3, // "#e98074",
        minuteStep: 15,
        schedulerWidth: "76%",
        eventItemHeight: 40,
        eventItemPopoverEnabled: false,
        eventItemLineHeight: 42,
        resourceName: "Conference Rooms (Capacity)",
        dayStartFrom: 9,
        dayStopTo: 21,
        dayCellWidth: 20,
        // monthCellWidth: 30,
        recurringEventsEnabled: true,
        schedulerMaxHeight: "690",
        // dayResourceTableWidth: "auto",
        // monthResourceTableWidth:"auto",
        nonWorkingTimeHeadBgColor: "transparent",
        nonWorkingTimeBodyBgColor: "transparent",
        nonWorkingTimeHeadColor: "default",
        views: [
          {
            viewName: "Day",
            viewType: 0,
            showAgenda: false,
            isEventPerspective: false,
          },
          {
            viewName: "Week",
            viewType: 1,
            showAgenda: false,
            isEventPerspective: false,
          },
        ],
      },
      {
        getNonAgendaViewBodyCellBgColorFunc: (
          schedulerData,
          slotId,
          header
        ) => {
          if (new Date(header.time) < new Date()) {
            return passed_time;
          }
          return undefined;
        },
      }
    )
  );

  useEffect(() => {
    if (viewModel.resources.length > 0) {
      // console.log(viewModel);
      // const now = new Date();
      // const nowMinuteOfDay = now.getHours() * 60 + now.getMinutes();
      // const modifiedSlots = viewModel.timeSlots.map((timeSlot) => {
      //   const minuteOfDay = viewModel.config.getMinuteOfDay(timeSlot.start);
      //   if (minuteOfDay < nowMinuteOfDay) {
      //     const modifiedSlot = { ...timeSlot };
      //     modifiedSlot.isDisabled = true;
      //     modifiedSlot.renderData = (
      //       <div style={{ color: "gray" }}>{timeSlot.renderData}</div>
      //     );
      //     return modifiedSlot;
      //   }
      //   return timeSlot;
      // });
      // setViewModel((prevViewModel) => ({
      //   ...prevViewModel,
      //   timeSlots: modifiedSlots,
      // }));
      // const myHeaders = viewModel.headers;
      // myHeaders.map((header) => {
      //   if (new Date(header.time) < new Date()) {
      //     header.nonWorkingTime = true;
      //   } else {
      //     header.nonWorkingTime = false;
      //   }
      //   return header;
      // });
      // // setViewModel((prevViewModel) => ({
      // //   ...prevViewModel,
      // //   headers: myHeaders,
      // // }));
      // console.log("myHeaders: ", viewModel);
    }
  }, [myResources]);

  useEffect(() => {
    const fetchResources = async () => {
      if (myResources.length !== 0) {
        const resourcess = await myResources.map((r) => {
          const resource = r;
          return {
            id: resource._id,
            name: (
              <div
                className="d-flex align-items-center gap-1"
                style={{ color: theme_color }}
              >
                <InfoIcon sx={{ fontSize: 20 }} />
                <p className="m-0">
                  {resource.roomName + " (" + resource.capacity + ")"}
                </p>
              </div>
            ),
          };
        });
        setResources(resourcess);
        viewModel.setResources(resourcess);
      }
    };
    fetchResources();
  }, [myResources, viewModel]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (allBookings !== "") {
        const history = await allBookings?.map((e) => {
          const event = e;
          const weekDays = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 };
          const rType = { 2: 3, 3: 2 };
          const rDays = event.rrule?.days?.map((e) =>
            e.slice(0, 2).toUpperCase()
          );
          const options = {
            // freq: rType[event?.rrule?.type],
            // interval: 2,
            // count: 10,
            // byweekday: rDays?.map((day) => weekDays[day]),
            // [
            //   RRule.TU,
            //   RRule.WE,
            //   RRule.TH,
            // ],
            // [1,2,3],
            dtstart: new Date(event?.startDate),
            until: new Date(
              `${new Date(event.endDate).getFullYear()}-${(
                new Date(event.endDate).getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}-${new Date(event.endDate).getDate()}` +
                " " +
                new Date(event.end).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
            ),
          };
          event?.rrule?.type !== 1 &&
            (options.freq = rType[event?.rrule?.type]);
          event?.rrule?.type === 3 &&
            (options.byweekday = rDays?.map((day) => weekDays[day]));

          const rrule = event?.rrule?.type !== 1 ? new RRule(options) : "";
          // const recurrence =
          //   event?.rrule?.type > 0
          //     ? event?.rrule?.type === 1
          //       ? `FREQ=DAILY;DTSTART=${until}`
          //       : rDays
          //       ? `FREQ=WEEKLY;DTSTART=${until};BYDAY=${rDays}`
          //       : ""
          //     : "";

          // console.log(recurrence.length !== 0 ? recurrence : "");
          return {
            id: event._id,
            organizer: event?.organizer?._id,
            title: event.title,
            description: event.description,
            resourceId: event.resourceId,
            start:
              `${new Date(event.startDate).getFullYear()}-${(
                new Date(event.startDate).getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}-${new Date(event.startDate).getDate()}` +
              " " +
              new Date(event.start).toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
            end:
              `${new Date(event.startDate).getFullYear()}-${(
                new Date(event.startDate).getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}-${new Date(event.startDate).getDate()}` +
              " " +
              new Date(event.end).toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
            rrule: rrule.toString(),
            bgColor:
              currentUser?._id === event?.organizer?._id
                ? filterUpcomingEvents([event]).length
                  ? upcoming_event_1
                  : completed_event_1
                : filterUpcomingEvents([event]).length
                ? upcoming_event_3
                : completed_event_3, //14746f
          };
        });
        // history[rrule] = recurrence;
        // console.log(history);
        if (Boolean(history) && history[0]?.id !== undefined) {
          await setEvents(() => history);
          viewModel.setEvents(history);
        }
        setUpdate(viewModel);
      }
    };
    fetchHistory();
  }, [allBookings, currentUser, viewModel]);

  useEffect(() => {
    viewModel.localeMoment.locale("en");
    if (resources.length !== 0) {
      viewModel.setResources(resources);
    }
    if (events.length !== 0) {
      viewModel.setEvents(events);
    }
  }, [events, resources, viewModel]);

  // const filterUpcomingEvents = (events) => {
  //   return events
  //     .filter((item) => {
  //       const startDate = new Date(item.startDate);
  //       const end = new Date(item.end);
  //       const today = new Date();
  //       if (startDate.getMonth() >= today.getMonth()) {
  //         if (startDate.getDate() >= today.getDate()) {
  //           if (
  //             startDate.getDate() === today.getDate() &&
  //             end.getHours() <= today.getHours()
  //           ) {
  //             if (end.getHours() === today.getHours()) {
  //               if (end.getMinutes() > today.getMinutes()) return true;
  //               if (end.getMinutes() <= today.getMinutes()) return false;
  //             }
  //             return false;
  //           }
  //           return true;
  //         }
  //         return false;
  //       }
  //       return false;
  //     })
  //     .sort((a, b) => {
  //       const dateA = new Date(`${a.startDate}T${a.time}`);
  //       const dateB = new Date(b.start);
  //       return dateA.getTime() - dateB.getTime();
  //     });
  // };

  const prevClick = (schedulerData) => {
    schedulerData.prev();
    schedulerData.setEvents(events);
    setUpdate(schedulerData.endDate);
    setViewModel(schedulerData);
  };

  const nextClick = (schedulerData) => {
    schedulerData.next();

    schedulerData.setEvents(events);
    setUpdate(schedulerData.startDate);
    setViewModel(schedulerData);
  };

  const onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(events);
    setUpdate(schedulerData.selectDate);
    setViewModel(schedulerData);
  };

  const onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(
      view.viewType,
      view.showAgenda,
      view.isEventPerspective
    );
    schedulerData.setEvents(events);
    setUpdate(schedulerData.viewType);
    setViewModel(schedulerData);
  };

  // const eventClicked = (schedulerData, event) => {
  //   // alert(
  //   //   `You just clicked an event: {id: ${event.id}, title: ${event.title}}`
  //   // );
  //   setCreatingEvent(
  //     allBookings.filter((e) => e._id === event.id.split("-")[0])[0]
  //   );
  //   // eventItemPopoverTemplateResolver();
  //   setIsBookingFormOpen(true);
  // };

  const cancelEvent = (schedulerData, event) => {
    const confirm = window.confirm(
      `You are about to cancel your booking... \n  ${event.title}`
    );
    if (confirm) {
      return axios
        .patch(`${process.env.REACT_APP_API_URL}/cancelBooking/${event._id}`)
        .then((res) => {
          console.log(res);
          toast.success(res.data.message, {
            position: toast.POSITION.TOP_RIGHT,
          });
          window.location.reload();
        })
        .catch((err) => {
          // alert(err)
          toast.error(err.data.message, {
            position: toast.POSITION.TOP_RIGHT,
          });
        });
    }
  };

  const updateEvent = (schedulerData, event) => {
    setUpdatingEvent(allBookings.filter((e) => e._id === event.id)[0]);
    setViewOnlyForm(true);
    setIsBookingFormOpen(true);
  };

  const newEvent = (
    schedulerData,
    slotId,
    slotName,
    start,
    end,
    type,
    item
  ) => {
    // const newFreshId =
    //   schedulerData.events.reduce(
    //     (maxId, event) => Math.max(maxId, event.id),
    //     0
    //   ) + 1;

    // const handleConfirm = () => {
    //   const newEvent = {
    //     id: newFreshId,
    //     title: "New event you just created",
    //     start: start,
    //     end: end,
    //     resourceId: slotId,
    //     bgColor: "#80C5F6",
    //   };
    //   schedulerData.addEvent(newEvent);
    //   setViewModel(schedulerData);
    //   setEvents({ ...events, newEvent });
    // };

    if (
      new Date() > new Date(start)
      // window.confirm(
      //   `Do you want to create a new event? {slotId: ${slotId}, slotName: ${slotName}, start: ${start}, end: ${end}`
      // )
    ) {
      // toast.error(`Sorry!!! You cannot book in past.`, {
      //   position: toast.POSITION.TOP_RIGHT,
      // });
    } else {
      var startTime = new Date(start);
      startTime.setFullYear(1970);
      startTime.setMonth(0);
      startTime.setDate(1);
      var endTime = new Date(end);
      endTime.setFullYear(1970);
      endTime.setMonth(0);
      endTime.setDate(1);
      setViewOnlyForm(true);
      setIsBookingFormOpen(!isBookingFormOpen);
      setCreatingEvent({
        resourceId: slotId,
        start: startTime,
        end: endTime,
        startDate: new Date(new Date(start).toDateString()),
        endDate: new Date(new Date(end).toDateString()),
      });
      // handleConfirm();
    }
  };

  const conflictOccurred = (
    schedulerData,
    action,
    event,
    type,
    slot,
    slotName
  ) => {
    // alert(`Conflict occurred. {action: ${action}, event: ${event}`);
    const slot_name = myResources.filter(
      (resource) => resource._id === slot
    )[0];
    toast.error(
      `Sorry this slot is not available for ${slot_name["roomName"]}`,
      {
        position: toast.POSITION.TOP_RIGHT,
      }
    );
  };

  const toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    setUpdate(schedulerData.toggleExpandStatus(slotId));
    return {
      viewModel: schedulerData,
    };
  };

  const slotClickedFunc = (schedulerData, slot, slotId) => {
    setResourceDrawerData(
      myResources.filter((resource) => resource._id === slot.slotId)[0]
    );
    const startTime = new Date();
    startTime.setFullYear(1970);
    startTime.setMonth(0);
    startTime.setDate(1);
    const endTime = new Date(startTime);
    setCreatingEvent({
      resourceId: slot.slotId,
      startDate: new Date(new Date().toDateString()),
      endDate: new Date(new Date().toDateString()),
      start: startTime,
      end: endTime.setMinutes(endTime.getMinutes() + 30),
    });
  };

  const eventItemPopoverTemplateResolver = (
    schedulerData,
    eventItem,
    title,
    start,
    end,
    statusColor,
    eventId
  ) => {
    return (
      <div style={{ width: "250px" }}>
        <Row type="flex" align="">
          <Col type="" className="d-flex align-items-center gap-2">
            <div
              className="status-dot"
              style={{ backgroundColor: statusColor }}
            />
            {/* </Col>
          <Col className=""> */}
            <span className="header2-text" title={title}>
              {title}
            </span>
          </Col>
        </Row>
        <Row type="flex" align="">
          {/* <Col span={2}>
            <div />
          </Col> */}
          <Col type="flex">
            <span className="header1-text">{start.format("HH:mm")}</span>
            <span className="header2-text">
              {start.toString().slice(3, 10)}
            </span>
            <span className="header1-text">-{end.format("HH:mm")}</span>
            <span className="header2-text">{end.toString().slice(3, 10)}</span>
          </Col>
        </Row>

        {currentUser?._id ===
          allBookings.filter((e) => e._id === eventItem.id.split("-")[0])[0]
            ?.organizer?._id &&
          (filterUpcomingEvents(allBookings)
            ?.map((e) => e._id)
            .includes(eventItem.id.split("-")[0]) ? (
            <Row type="flex" align="">
              <Col>
                <Button
                  onClick={() => {
                    setOpenCancelConfirm(
                      `${eventItem?.id.split("-")[0]}$${
                        allBookings.filter(
                          (e) => e._id === eventItem.id.split("-")[0]
                        )[0].title
                      }`
                    );
                    // const confirm = window.confirm(
                    //   `You are about to cancel your booking... \n  ${eventItem?.title}`
                    // );
                    // if (confirm) {
                    //   return axios
                    //     .patch(`/cancelBooking/${eventItem?.id.split("-")[0]}`)
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
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // setUpdatingEvent(
                    //   allBookings.filter((e) => e._id === event.id)[0]
                    // );
                    // setViewOnlyForm(true);
                    // setIsBookingFormOpen(true);

                    setUpdatingEvent(
                      allBookings.filter(
                        (e) => e._id === eventItem.id.split("-")[0]
                      )[0]
                    );
                    setViewOnlyForm(true);
                    setIsBookingFormOpen(true);
                  }}
                >
                  Update
                </Button>
              </Col>
            </Row>
          ) : (
            <Row type="flex" align="">
              <Col>
                <Button
                  onClick={() => {
                    // setUpdatingEvent(
                    //   allBookings.filter((e) => e._id === event.id)[0]
                    // );
                    // setViewOnlyForm(true);
                    // setIsBookingFormOpen(true);
                    // Gives Current Time with Date 01/01/19770
                    const startTime = new Date();
                    startTime.setFullYear(1970);
                    startTime.setMonth(0);
                    startTime.setDate(1);
                    const endTime = new Date(startTime);

                    // Event to be Reboked
                    const eventToRebook = eventItem;
                    eventToRebook.startDate = new Date(
                      new Date().toDateString()
                    );
                    eventToRebook.endDate = new Date(new Date().toDateString());
                    eventToRebook.start = startTime;
                    eventToRebook.end = endTime.setMinutes(
                      endTime.getMinutes() + 30
                    );
                    setCreatingEvent(eventToRebook);
                    setViewOnlyForm(true);
                    setIsBookingFormOpen(!isBookingFormOpen);
                  }}
                >
                  Rebook
                </Button>
              </Col>
            </Row>
          ))}
      </div>
    );
  };

  const eventItemTemplateResolver = (
    schedulerData,
    event,
    bgColor,
    isStart,
    isEnd,
    mustAddCssClass,
    mustBeHeight,
    agendaMaxEventWidth
  ) => {
    // let borderWidth = isStart ? "4" : "0";
    // let borderColor = "rgba(0,139,236,1)",
    //   backgroundColor = "#80C5F6";
    // let titleText = schedulerData.behaviors.getEventTextFunc(
    //   schedulerData,
    //   event
    // );
    // if (!!event.type) {
    //   borderColor =
    //     event.type === 1
    //       ? "rgba(0,139,236,1)"
    //       : event.type === 3
    //       ? "rgba(245,60,43,1)"
    //       : "#999";
    //   backgroundColor =
    //     event.type === 1 ? "#80C5F6" : event.type === 3 ? "#FA9E95" : "#D9D9D9";
    // }
    // let divStyle = {
    //   borderLeft: borderWidth + "px solid " + borderColor,
    //   backgroundColor: backgroundColor,
    //   height: mustBeHeight,
    // };
    // if (!!agendaMaxEventWidth)
    //   divStyle = { ...divStyle, maxWidth: agendaMaxEventWidth };

    // const handleMouseMove = (event) => {
    //   setAnchorEl(event.currentTarget);
    //   console.log(event.currentTarget);
    // };
    return (
      <div
        onClick={(e) => {
          const { clientX, clientY } = e;
          setAnchorEl({ top: clientY, left: clientX });
          // setAnchorEl(event.currentTarget);
          setSelectedEvent(
            allBookings.filter((e) => e._id === event.id.split("-")[0])[0]
          );
        }}
        className="px-2"
        style={{
          marginTop: "1px",
          borderRadius: "13px",
          color: white,
          maxHeight: "40px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          backgroundColor:
            currentUser?._id === event?.organizer
              ? new Date(event?.end) > new Date()
                ? upcoming_event_1
                : completed_event_1
              : new Date(event?.end) > new Date()
              ? upcoming_event_3
              : completed_event_3,
        }}
      >
        <span className="m-0 p-0 " style={{ lineHeight: "40px" }}>
          {
            allBookings.filter((e) => e._id === event.id.split("-")[0])[0]
              ?.title
          }
          {/* {titleText} */}
        </span>
      </div>
    );
  };

  return (
    <>
      <Scheduler
        schedulerData={viewModel}
        prevClick={prevClick}
        nextClick={nextClick}
        onSelectDate={onSelectDate}
        onViewChange={onViewChange}
        // eventItemClick={eventClicked}
        // eventItemClick={(e) => eventItemClick(e)}
        viewEventClick={cancelEvent}
        viewEventText={"Cancel"}
        viewEvent2Text={"Update"}
        viewEvent2Click={updateEvent}
        newEvent={newEvent}
        conflictOccurred={conflictOccurred}
        toggleExpandFunc={toggleExpandFunc}
        slotClickedFunc={slotClickedFunc}
        eventItemPopoverTemplateResolver={eventItemPopoverTemplateResolver}
        eventItemTemplateResolver={eventItemTemplateResolver}
        // leftCustomHeader={leftCustomHeader}
        // rightCustomHeader={rightCustomHeader}
      />

      <Popover
        anchorReference="anchorPosition"
        anchorPosition={anchorEl}
        open={Boolean(anchorEl)}
        // anchorEl={anchorEl}
        // anchorOrigin={{
        //   vertical: "bottom",
        //   horizontal: "left",
        // }}
        // transformOrigin={{
        //   vertical: "top",
        //   horizontal: "left",
        // }}
        onClose={() => setAnchorEl(null)}
        disableRestoreFocus
      >
        {/* <Typography sx={{ p: 1 }}>{selectedEvent?.title}</Typography> */}
        <div className="" style={{ width: "250px", fontSize: "14px" }}>
          <Row type="flex" className="m-0 p-0">
            <Col type="" className="d-flex align-items-center">
              <div
                className="status-dot"
                style={{
                  backgroundColor:
                    currentUser?._id === selectedEvent?.organizer?._id
                      ? filterUpcomingEvents([selectedEvent]).length
                        ? upcoming_event_1
                        : completed_event_1
                      : filterUpcomingEvents([selectedEvent]).length
                      ? upcoming_event_3
                      : completed_event_3,
                }}
              />
              <span className="header2-text flex-fill ms-2">
                {selectedEvent?.organizer?.userName}
              </span>

              <IconButton onClick={() => setAnchorEl(null)} className="m-0">
                <Tooltip placement="bottom" title="Close">
                  <CloseIcon sx={{ fontSize: "1.2rem" }} />
                </Tooltip>
              </IconButton>
            </Col>
          </Row>
          <Table borderless={true} responsive="md" className="mx-1 my-0">
            <tbody>
              <tr>
                <td>Title</td>
                <td>:</td>
                <td>{selectedEvent?.title}</td>
              </tr>
              <tr>
                <td>Resource</td>
                <td>:</td>
                <td>
                  {
                    myResources.filter((resource) => {
                      return resource._id === selectedEvent.resourceId;
                    })[0]?.roomName
                  }
                </td>
              </tr>
              <tr>
                <td></td>
              </tr>
            </tbody>
          </Table>

          <div className="d-flex mx-3 align-items-center gap-1">
            <span className="header1-text" style={{ fontSize: "20px" }}>
              {new Date(selectedEvent?.start).toTimeString().slice(0, 5)}
            </span>
            <span className="header2-text">
              {new Date(selectedEvent?.startDate)?.toString().slice(3, 10)}
            </span>
            <span>-</span>
            <span className="header1-text" style={{ fontSize: "20px" }}>
              {new Date(selectedEvent?.end).toTimeString().slice(0, 5)}
            </span>
            <span className="header2-text">
              {new Date(selectedEvent?.endDate)?.toString().slice(3, 10)}
            </span>
          </div>

          <div className="d-flex  mx-2" style={{ fontSize: "14px" }}>
            {currentUser?._id ===
              allBookings?.filter((e) => e._id === selectedEvent?._id)[0]
                ?.organizer?._id &&
              (filterUpcomingEvents(allBookings)
                .map((e) => e._id)
                .includes(selectedEvent?._id) ? (
                <>
                  <IconButton
                    onClick={() => {
                      setAnchorEl(null);
                      setOpenCancelConfirm(
                        `${selectedEvent?._id}$${selectedEvent?.title}`
                      );
                      // const confirm = window.confirm(
                      //   `You are about to cancel your booking... \n  ${selectedEvent?.title}`
                      // );
                      // if (confirm) {
                      //   return axios
                      //     .patch(`/cancelBooking/${selectedEvent?._id}`)
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
                  >
                    <Tooltip placement="bottom" title="Cancel">
                      <AutoDelete
                        color="error"
                        sx={{
                          fontSize: 20,
                        }}
                      />
                    </Tooltip>
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      // setUpdatingEvent(
                      //   allBookings.filter((e) => e._id === event.id)[0]
                      // );
                      // setViewOnlyForm(true);
                      // setIsBookingFormOpen(true);
                      setAnchorEl(null);
                      setUpdatingEvent(
                        allBookings.filter(
                          (e) => e._id === selectedEvent._id
                        )[0]
                      );
                      setViewOnlyForm(true);
                      setIsBookingFormOpen(true);
                    }}
                  >
                    <Tooltip placement="bottom" title="Update">
                      <NoteAlt sx={{ color: theme_color, fontSize: 20 }} />
                    </Tooltip>
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton
                    onClick={() => {
                      setAnchorEl(null);
                      // setUpdatingEvent(
                      //   allBookings.filter((e) => e._id === event.id)[0]
                      // );
                      // setViewOnlyForm(true);
                      // setIsBookingFormOpen(true);
                      // Gives Current Time with Date 01/01/19770
                      const startTime = new Date();
                      startTime.setFullYear(1970);
                      startTime.setMonth(0);
                      startTime.setDate(1);
                      const endTime = new Date(startTime);
                      // Event to be Reboked
                      const eventToRebook = selectedEvent;
                      eventToRebook.startDate = new Date(
                        new Date().toDateString()
                      );
                      eventToRebook.endDate = new Date(
                        new Date().toDateString()
                      );
                      eventToRebook.start = startTime;
                      eventToRebook.end = endTime.setMinutes(
                        endTime.getMinutes() + 30
                      );
                      setCreatingEvent(eventToRebook);
                      setViewOnlyForm(true);
                      setIsBookingFormOpen(!isBookingFormOpen);
                    }}
                  >
                    <Tooltip placement="bottom" title="Rebook">
                      <EventRepeatIcon
                        sx={{
                          color: theme_color,
                          fontSize: 20,
                        }}
                      />
                    </Tooltip>
                  </IconButton>
                </>
              ))}
            <div className="flex-fill"></div>
            <IconButton
              className="m-0"
              onClick={() => {
                setAnchorEl(null);
                setCreatingEvent(
                  allBookings.filter(
                    (e) => e._id === selectedEvent?._id.split("-")[0]
                  )[0]
                );
                setIsBookingFormOpen(true);
              }}
            >
              <Tooltip placement="bottom" title="Expand">
                <OpenInNew
                  className="m-0 p-0"
                  sx={{ fontSize: "1.2rem", color: theme_color }}
                />
              </Tooltip>
            </IconButton>
          </div>
        </div>
      </Popover>

      <Drawer
        open={Boolean(resourceDrawerData)}
        variant="temporary"
        anchor="left"
        onClose={() => {
          setResourceDrawerData("");
          setViewOnlyForm(!viewOnlyForm);
          // drawerOnClose();
        }}
        PaperProps={{ sx: { width: "22%" } }}
      >
        <Card
          className="p-3 "
          variant="standard"
          sx={{
            // "& .MuiTextField-root": { m: 0.5 },
            //   border: ".5px solid grey",
            //   borderRadius: 4,
            justifyContent: "center",
            padding: 5,
            alignItems: "center",
          }}
        >
          <h4 className="ms-2 d-flex align-items-center justify-content-between">
            Room Details
            <IconButton onClick={() => setResourceDrawerData("")}>
              <CloseIcon />
            </IconButton>
          </h4>
          <div
            className="table-borderless table mt-4"
            style={{ fontFamily: "inherit", fontSize: "1rem" }}
          >
            <table className="align-top table-condensed  m-0">
              <tbody>
                <tr>
                  <td height={10} colSpan={3}></td>
                </tr>

                <tr>
                  <td colSpan={3}>
                    <h6>{resourceDrawerData?.roomName}</h6>
                  </td>
                </tr>

                <tr>
                  <td colSpan={3} className="p-0">
                    <hr className="mt-0" />
                  </td>
                </tr>

                <tr>
                  <td>Capacity</td>
                  <td>:</td>
                  <td>{resourceDrawerData?.capacity} Persons</td>
                </tr>

                <tr>
                  <td height={30} colSpan={3}></td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <h6>Location</h6>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-0">
                    <hr className="mt-0" />
                  </td>
                </tr>
                <tr>
                  <td>Floor</td>
                  <td>:</td>
                  <td>{resourceDrawerData?.floorLocation} </td>
                </tr>
                <tr>
                  <td>City</td>
                  <td>:</td>
                  <td>{resourceDrawerData?.location?.city} </td>
                </tr>
                <tr>
                  <td>State</td>
                  <td>:</td>
                  <td>{resourceDrawerData?.location?.state} </td>
                </tr>
                <tr>
                  <td>Country</td>
                  <td>:</td>
                  <td>{resourceDrawerData?.location?.country} </td>
                </tr>
                <tr>
                  <td>Address</td>
                  <td>:</td>
                  <td>{resourceDrawerData?.location?.address} </td>
                </tr>

                <tr>
                  <td height={30} colSpan={3}></td>
                </tr>

                <tr>
                  <td colSpan={3}>
                    <h6>Amenities</h6>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-0">
                    <hr className="mt-0" />
                  </td>
                </tr>

                <tr>
                  <td colSpan={3}>
                    <ol className="ps-3">
                      {resourceDrawerData?.amenities?.map((a) => (
                        <li> {a}</li>
                      ))}{" "}
                    </ol>
                  </td>
                </tr>

                <tr>
                  <td height={30} colSpan={3}></td>
                </tr>
              </tbody>
            </table>

            <Button
              variant="contained"
              size="medium"
              color="primary"
              onClick={() => {
                setViewOnlyForm(true);
                setIsBookingFormOpen(true);
                setResourceDrawerData("");
              }}
            >
              Book this room
            </Button>
          </div>
        </Card>
      </Drawer>
    </>
  );
};

export default withDragDropContext(Basic);
