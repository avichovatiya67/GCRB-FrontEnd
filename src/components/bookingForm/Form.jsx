import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import * as yup from "yup";

import {
  Autocomplete,
  Container,
  Drawer,
  Box,
  TextField,
  Card,
  Button,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  styled,
  Switch,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Add, AutoDelete, NoteAlt, NoteAltOutlined } from "@mui/icons-material";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";

import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import {
  bookingHistoryContext,
  allUserDataContext,
  creatingEventContext,
  updatingEventContext,
  currentUserContext,
  isBookingFormOpenContext,
  viewOnlyFormContext,
  allResourcesContext,
  filterEventsContext,
  allBookingsContext,
  openCancelConfirmContext,
} from "../../context/ContextProvider";

const Form = () => {
  // Global states from Context Provider
  const [currentUser] = useContext(currentUserContext);
  const [viewOnlyForm, setViewOnlyForm] = useContext(viewOnlyFormContext);
  const [isBookingFormOpen, setIsBookingFormOpen] = useContext(
    isBookingFormOpenContext
  );
  const [, setOpenCancelConfirm] = useContext(openCancelConfirmContext);
  const [updatingEvent, setUpdatingEvent] = useContext(updatingEventContext);
  const [creatingEvent, setCreatingEvent] = useContext(creatingEventContext);
  const [allUserData] = useContext(allUserDataContext);
  const [bookingHistory, setBookingHistory] = useContext(bookingHistoryContext);
  const [allBookings, setAllBookings] = useContext(allBookingsContext);
  // const [myResources] = useContext(myResourcesContext);
  const [allResources] = useContext(allResourcesContext);
  const [filterUpcomingEvents, filterCompletedEvents] =
    useContext(filterEventsContext);

  // States for Auto complete
  // const memberRef = useRef(null);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchUserText, setSearchUserText] = useState("");
  const [loadingAuto, setLoadingAuto] = useState(false);

  //sets the Main while creating new booking
  useEffect(() => {
    main.organizer = currentUser;
    if (creatingEvent) {
      setMain({ ...main, ...creatingEvent });
      setIsForSomeone(Object.keys(creatingEvent).includes("bookedBy"));
      setIsParticipants(
        Object.keys(creatingEvent).includes("participantsDetails")
      );
    }
  }, [creatingEvent, currentUser]);

  // sets the Main while editing existing booking
  useEffect(() => {
    // main.organizer = currentUser;
    if (updatingEvent) {
      setMain({ ...main, ...updatingEvent });
      setIsForSomeone(Object.keys(updatingEvent).includes("bookedBy"));
      // setIsVirtualMeeting(Object.keys(updatingEvent).includes("meetingLink"));
      setIsParticipants(
        Object.keys(updatingEvent).includes("participantsDetails")
      );
    }
  }, [updatingEvent]);

  //======== Main Store for All Fields ========
  const [main, setMain] = useState({
    title: "",
    description: "",
    organizer: currentUser,
    rrule: { type: 1, days: [] },
    isActive: true,
  });

  //======== Errors Store ========
  const initialStateErrors = {
    title: "",
    description: "",
    startDate: "",
    start: "",
    end: "",
    rrule: "",
    endDate: "",
    memberDetails: "",
    participantsDetails: "",
    bookedBy: "",
    meetingLink: "",
    virtualMeetingDesc: "",
    commentForFrontdesk: "",
    pName: "",
    pEmail: "",
  };
  const [errors, setErrors] = useState(initialStateErrors);

  //======== States to hide/show other details ========
  const [isForSomeone, setIsForSomeone] = useState(
    Object.keys(main).includes("bookedBy")
  );
  const [isParticipants, setIsParticipants] = useState(
    Object.keys(main).includes("participantsDetails")
  );

  // const [openStartDate, setOpenStartDate] = useState(false);
  // const [openEndDate, setOpenEndDate] = useState(false);
  // const [openStart, setOpenStart] = useState(false);
  // const [openEnd, setOpenEnd] = useState(false);
  // const [memberValue, setMemberValue] = useState();

  //======== This onChange is for "description" and "commentForFrontdesk" fields ========
  const onChange = (e) => {
    setMain(() => {
      return {
        ...main,
        [e.target.name]: e.target.value
          // .replace(/\s{2,}/g, " ")
          .replace(/\n{2,}/g, `\n`),
      };
    });
  };

  //======== Validation Schema ========
  const currentTime = new Date();
  currentTime.setFullYear(1970);
  currentTime.setMonth(0);
  currentTime.setDate(1);
  const formValidationSchema = yup.object().shape({
    title: yup
      .string()
      .required("Title is required")
      .min(3, "Title must be at least 3 characters long"),
    startDate: yup
      .date()
      .required("Start date is required")
      .min(
        new Date(new Date().toDateString()),
        "Start date must be in the future"
      ),
    endDate: yup.date().when("rrule.type", (type, schema) => {
      return type > 1
        ? schema
            .required("End date is required")
            .test(
              "is-greater",
              "End date must be after start date",
              function (endDate) {
                const { startDate } = this.parent;
                return startDate <= endDate;
              }
            )
        : schema;
    }),
    start: yup
      .date()
      .required("Start time is required")
      .when("startDate", (startDate, schema) => {
        return new Date(new Date(startDate).toDateString()) >
          new Date(new Date().toDateString())
          ? schema
          : schema.min(currentTime, "Start time must be in the future");
      }),
    // .min(currentTime, "Start time must be in the future"),
    end: yup
      .date()
      .required("End time is required")
      .when("start", (start, schema) =>
        schema.min(start, "End time must be after start time")
      ),
    rrule: yup.object().shape({
      type: yup.number().required(),
    }),
    meetingLink: yup.string().url("Link is not valid"),
  });

  //======== Submit Method ========
  const onSubmit = async (e) => {
    await formValidationSchema
      .validate(main)
      .then(async (res) => {
        // setErrors({
        //   ...errors,

        //   title: "",
        //   startDate: "",
        //   endDate: "",
        //   start: "",
        //   end: "",
        //   rrule: "",
        // });
        errors.title = "";
        errors.startDate = "";
        errors.endDate = "";
        errors.start = "";
        errors.end = "";
        errors.rrule = "";
        errors.virtualMeetingDesc = "";
        // await setErrors(errors);
        console.log("errors:", errors);
        if (Object.values(errors).every((value) => value === "")) {
          // console.log("Success", res);
          if (Object.keys(main).includes("_id") && Boolean(updatingEvent)) {
            // alert("Updated");
            axios
              .patch(`/updateBooking/${main._id}`, { main })
              .then(async (res) => {
                console.log("Data SuccessFully Updated: \n", res);
                // setBookingHistory([...bookingHistory, main]);
                setBookingHistory([...bookingHistory, res.data.data]);
                setAllBookings([...allBookings, res.data.data]);
                setIsBookingFormOpen(!isBookingFormOpen);
                await toast.success(res.data.message, {
                  position: toast.POSITION.TOP_RIGHT,
                });
                drawerOnClose();
                // window.location.reload();
              })
              .catch((err) => {
                console.log(err);
                if (err.response.data.data?._id !== main._id) {
                  toast.error(err.response.data.message, {
                    position: toast.POSITION.TOP_RIGHT,
                  });
                }
              });
          } else {
            // alert("Created");
            delete main?._id;
            axios
              .post("/postBooking", { main })
              .then(async (res) => {
                console.log("Data SuccessFull Insert: \n", res);
                setBookingHistory([...bookingHistory, res.data.data]);
                setAllBookings([...allBookings, res.data.data]);
                setIsBookingFormOpen(!isBookingFormOpen);
                await toast.success(res.data.message, {
                  position: toast.POSITION.TOP_RIGHT,
                });
                drawerOnClose();
                // const allBookingsInstance = allBookings;
                // allBookingsInstance.push(main);
                // window.location.reload();
              })
              .catch((err) => {
                console.log(err);
                toast.error(err.response.data.message, {
                  position: toast.POSITION.TOP_RIGHT,
                });
              });
          }
        } else {
          console.log("errors");
          // setErrors(errors);
          // Object.keys(errors).map((key) => {
          //   const error = errors[key];
          //   if (error !== "") {
          //     toast.error(error, {
          //       position: toast.POSITION.TOP_RIGHT,
          //     });
          //   }
          // });
        }
      })
      .catch(async (err) => {
        console.log(err);
        const errName = err.path;
        const errMsg = err.message;
        const errs = {
          title: "",
          description: "",
          startDate: "",
          start: "",
          end: "",
          rrule: "",
          endDate: "",
          memberDetails: "",
          participantsDetails: "",
          bookedBy: "",
          meetingLink: "",
          commentForFrontdesk: "",
          pName: "",
          pEmail: "",
        }; // { ...errors };
        errs[errName] = errMsg;
        setErrors(() => errs);
        toast.error(err.message, {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        console.log(errors);
      });
    e.preventDefault();
  };

  //======== Recurrence States ========
  const handleChange = (event) => {
    // event.target.value === 2 ? setDaily(true) : setDaily(false);
    // event.target.value === 3 ? setWeekly(true) : setWeekly(false);
    setMain({ ...main, rrule: { type: event.target.value, days: [] } });
  };
  //Hide/Show Daily, Weekly
  // const [daily, setDaily] = useState(false);
  // const [weekly, setWeekly] = useState(false);
  //Recurrence Days
  const recurrenceType = ["", "Once", "Daily", "Weekly"];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  //======== Participants ========
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const handleInputAdd = () => {
    if (
      name.trim() !== "" &&
      email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setName("");
      setEmail("");
      setMain({
        ...main,
        participantsDetails: [
          ...(main.participantsDetails || []),
          { name, email },
        ],
      });
    } else {
      toast.error("Please enter valid participant details");
    }
  };
  const handleDelete = (index) => {
    const updatedValues = [...main.participantsDetails];
    updatedValues.splice(index, 1);
    setMain({ ...main, participantsDetails: updatedValues });
  };

  //======== Reset states on closing form ========
  const drawerOnClose = () => {
    setCreatingEvent();
    setUpdatingEvent();
    setMain({
      title: "",
      description: "",
      // organizer: currentUser,
      rrule: { type: 1, days: [] },
      isActive: true,
    });
    setIsParticipants(false);
    setIsForSomeone(false);
    setViewOnlyForm(false);
    setErrors({
      title: "",
      description: "",
      startDate: "",
      start: "",
      end: "",
      rrule: "",
      endDate: "",
      memberDetails: "",
      participantsDetails: "",
      bookedBy: "",
      meetingLink: "",
      commentForFrontdesk: "",
      pName: "",
      pEmail: "",
    });
  };

  // Create Color for Avatar
  const stringToColor = (string) => {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string?.length; i += 1) {
      hash = string?.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  };
  // Create Avatar content
  const stringAvatar = (name) => {
    return {
      sx: {
        fontSize: "14px",
        height: "30px",
        width: "30px",
        bgcolor: stringToColor(name),
      },
      children: `${name?.split(" ")[0].slice(0, 1)}${name
        ?.split(" ")
        .at(-1)
        .slice(0, 1)}`,
    };
  };
  // Search members
  useEffect(() => {
    const searchMembers = (value) => {
      if (value.length > 2) {
        setLoadingAuto(true);
        axios
          .get(`/searchUser?searchText=${value}`)
          .then((response) => {
            setSearchedUsers(() => response.data.data);
            setLoadingAuto(false);
          })
          .catch((error) => {
            setSearchedUsers(() => []);
            setLoadingAuto(false);
          });
      } else {
        setSearchedUsers(() => []);
        setLoadingAuto(false);
      }
    };
    searchMembers(searchUserText);
  }, [searchUserText]);

  // const searchMembers = (a, value) => {
  //   setLoadingAuto(true);
  //   setSearchUserText(value);
  //   // if (value.length > 3) {
  //   axios
  //     .get(`/searchUser?searchText=${value}`)
  //     .then((response) => {
  //       console.log(response.data.data);
  //       setSearchedUsers(response.data.data);
  //       setLoadingAuto(false);
  //     })
  //     .catch((error) => {
  //       setSearchedUsers([{}]);
  //       setLoadingAuto(false);
  //     });
  //   // }
  // };

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={isBookingFormOpen}
      onClose={() => {
        setIsBookingFormOpen(false);
        drawerOnClose();
      }}
      PaperProps={{
        sx: {
          width:
            (currentUser?._id === main?.organizer?._id ||
              currentUser?._id === main?.bookedBy?._id) &&
            viewOnlyForm
              ? // !filterCompletedEvents(bookingHistory)
                //   .map((h) => {
                //     console.log(h);
                //     return h._id;
                //   })
                // .includes(main?._id)
                "80%"
              : "35%",
        },
      }}
    >
      <Container maxWidth="xl" className="p-0">
        <div className=" d-flex h-100">
          {(currentUser?._id === main?.organizer?._id ||
            currentUser?._id === main?.bookedBy?._id) &&
          viewOnlyForm ? (
            // !filterCompletedEvents(bookingHistory)
            //   .map((h) => h._id)
            //   .includes(main?._id)
            <>
              {/* Form Elements */}
              <div className="col-7 grid row-gap-5 ms-2 me-4 h-100">
                <Card
                  className="p-3"
                  variant="standard"
                  component="form"
                  sx={{
                    "& .MuiTextField-root": { m: 0.5 },
                    //   border: ".5px solid grey",
                    //   borderRadius: 4,
                    justifyContent: "center",
                    padding: 5,
                    alignItems: "center",
                  }}
                  noValidate
                  autoComplete="on"
                >
                  {/* Head */}
                  <div className="d-flex justify-content-between ">
                    <h4>Conference Room Booking Form</h4>
                  </div>

                  {/* Meeting Details */}
                  <div className="mt-3">
                    <h6 className="mb-0 ">Meeting Details</h6>
                    <TextField
                      required
                      fullWidth
                      label="Title"
                      name="title"
                      variant="standard"
                      value={main.title}
                      onChange={(e) => {
                        onChange(e);
                        if (
                          Object.keys(errors).includes(e.target.name) &&
                          errors[e.target.name] !== ""
                        ) {
                          setErrors({ ...errors, title: "" });
                        }
                      }}
                      onBlur={() => {
                        if (main.title === "") {
                          setErrors({ ...errors, title: "Title is required" });
                        } else {
                          setErrors({ ...errors, title: "" });
                        }
                      }}
                      error={errors?.title !== ""}
                      helperText={errors?.title}
                    />
                    <br />
                    <TextField
                      multiline
                      fullWidth
                      rows={2}
                      label="Description"
                      name="description"
                      variant="standard"
                      value={main.description}
                      onChange={onChange}
                      error={errors.description !== ""}
                      helperText={errors.description}
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="mt-4 d-flex justify-content-between">
                    {/* <TextField type={} id="standard-basic" label="Participant Number" variant="standard" name='startDate' onChange={(e) => onChange(e)} /> */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        minDate={new Date()}
                        maxDate={new Date().setDate(new Date().getDate() + 45)}
                        className="col-3 g-0"
                        name="startDate"
                        label="Date"
                        value={main?.startDate}
                        inputFormat="DD/MM/YYYY"
                        // open={openStartDate}
                        // onOpen={() => setOpenStartDate(true)}
                        // onClose={() => setOpenStartDate(false)}

                        onChange={(newValue) => {
                          // console.log("StartDate: ", main?.startDate);
                          setMain({
                            ...main,
                            startDate: new Date(
                              new Date(newValue).toDateString()
                            ),
                            endDate: new Date(
                              new Date(newValue).toDateString()
                            ),
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            variant="standard"
                            error={errors.startDate !== ""}
                            helperText={errors.startDate}
                            style={{ caretColor: "transparent" }}
                            onKeyDown={(e) => {
                              e.preventDefault();
                            }}
                          />
                        )}
                      />

                      <TimePicker
                        className="col-3"
                        label="Start Time"
                        name="start"
                        value={main.start}
                        onChange={(newValue) => {
                          const endTime = new Date(newValue);
                          setMain({
                            ...main,
                            start: new Date(newValue),
                            end: endTime.setMinutes(endTime.getMinutes() + 30),
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            variant="standard"
                            error={errors.start !== ""}
                            helperText={errors.start}
                            style={{ caretColor: "transparent" }}
                            onKeyDown={(e) => {
                              e.preventDefault();
                            }}
                          />
                        )}
                      />

                      <TimePicker
                        className="col-3"
                        label="End Time"
                        name="endTime"
                        value={main.end}
                        onChange={(newValue) => {
                          setMain({
                            ...main,
                            end: new Date(newValue),
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            variant="standard"
                            error={errors.end !== ""}
                            helperText={errors.end}
                            style={{ caretColor: "transparent" }}
                            onKeyDown={(e) => {
                              e.preventDefault();
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </div>

                  {/* {/ Recurance /} */}
                  <div className="mt-4 d-flex justify-content-between gap-3">
                    <FormControl fullWidth variant="standard">
                      <InputLabel id="recurrence-label">
                        Recurrence-Type
                      </InputLabel>
                      <Select
                        labelId="recurrence-label"
                        id="recurrence"
                        value={main?.rrule?.type}
                        name="recurrence"
                        label="Recurrence-Type"
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        error={errors.rrule !== ""}
                      >
                        <MenuItem value={1}>Once</MenuItem>
                        <MenuItem value={2}>Daily</MenuItem>
                        <MenuItem value={3}>Weekly</MenuItem>
                      </Select>
                    </FormControl>
                    {/* //Daily */}
                    {(main.rrule.type === 2 || main.rrule.type === 3) && (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          className="col-4"
                          minDate={new Date(main.startDate)}
                          maxDate={new Date().setDate(
                            new Date().getDate() + 45
                          )}
                          label="End By"
                          value={main?.endDate}
                          name="endDate"
                          inputFormat="DD/MM/YYYY"
                          onChange={(newValue) => {
                            console.log(
                              new Date(new Date(newValue).toDateString())
                            );
                            setMain({
                              ...main,
                              endDate: new Date(
                                new Date(newValue).toDateString()
                              ),
                            });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              required
                              variant="standard"
                              error={errors.endDate !== ""}
                              helperText={errors.endDate}
                              style={{ caretColor: "transparent" }}
                              onKeyDown={(e) => {
                                e.preventDefault();
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    )}
                  </div>

                  {main.rrule.type === 3 && (
                    <div className="">
                      <FormControl component="fieldset" variant="standard">
                        <FormLabel
                          className="mt-2 mb-0"
                          sx={{ fontSize: "0.8rem" }}
                          component="legend"
                        >
                          Select Days
                        </FormLabel>
                        <StyledToggleButtonGroup
                          size="small"
                          value={main.rrule.days}
                          onChange={(e, newSelectedDays) =>
                            setMain({
                              ...main,
                              rrule: { type: 3, days: newSelectedDays },
                            })
                          }
                          aria-label="days selection"
                          style={{ display: "flex" }}
                        >
                          {days.map((day) => (
                            <ToggleButton
                              value={day}
                              key={day}
                              aria-label={day}
                            >
                              {day}
                            </ToggleButton>
                          ))}
                        </StyledToggleButtonGroup>
                      </FormControl>
                    </div>
                  )}

                  {/* Member Details */}
                  <div className="mt-4">
                    <h6 className="mb-0 ">Member Details</h6>
                    <Autocomplete
                      multiple
                      fullWidth
                      noOptionsText={
                        loadingAuto
                          ? "Searching..."
                          : searchUserText.length < 3
                          ? "Keep typing to search..."
                          : "No members found."
                      }
                      // open={Boolean(searchedUsers.length)}
                      onBlur={() => {
                        setSearchedUsers([]);
                        setLoadingAuto(false);
                      }}
                      onClose={() => {
                        setSearchedUsers([]);
                        setLoadingAuto(false);
                      }}
                      options={searchedUsers.length ? searchedUsers : []}
                      onInputChange={(e, value) => setSearchUserText(value)} // autoHighlight
                      inputValue={searchUserText}
                      onSelect={() => setSearchedUsers([])}
                      getOptionLabel={(option) =>
                        option ? option.userName : ""
                      }
                      defaultValue={
                        Object.keys(main).includes("memberDetails")
                          ? main.memberDetails.map((user) => user)
                          : []
                      }
                      // value={
                      //   Object.keys(main).includes("memberDetails")
                      //     ? main.memberDetails.map((user) => user)
                      //     : []
                      // }
                      onChange={(e, value) => {
                        setMain({
                          ...main,
                          memberDetails: value,
                        });
                      }}
                      renderOption={(props, option) => {
                        console.log(props);
                        if (!option.userName) {
                          return (
                            <div className="ms-1 text-muted">
                              <i>Keep typing to search member...</i>
                            </div>
                          );
                        }
                        return (
                          <Box
                            component="li"
                            sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                            {...props}
                          >
                            {/* <img
                            loading="lazy"
                            width="20"
                            src="https://images.pexels.com/photos/5774804/pexels-photo-5774804.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                            alt="img"
                          /> */}
                            <Avatar {...stringAvatar(option.userName.trim())} />
                            <label className="ms-1">
                              {option.userName + " - " + option.email}
                            </label>
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label="Choose members"
                          // placeholder="Start typing to search member..."
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingAuto ? (
                                  <CircularProgress
                                    className="text-muted"
                                    size={20}
                                  />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                            // autoComplete: "new-password", // disable autocomplete and autofill
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* Participants Details */}
                  <div className="mt-4">
                    <FormLabel className="">
                      Is anyone attending apart from Gateway Employees ?
                    </FormLabel>
                    <Switch
                      checked={isParticipants}
                      onChange={() => {
                        setIsParticipants(!isParticipants);
                        if (isParticipants === true) {
                          setIsParticipants(false);
                          const newMain = { ...main };
                          delete newMain.participantsDetails;
                          setMain(newMain);
                          const newErrors = errors;
                          newErrors.pName = "";
                          newErrors.pEmail = "";
                          setErrors(newErrors);
                        }
                      }}
                    />
                    {isParticipants && (
                      <div className="mt-4">
                        <h6 className="mb-0">Attendee Details</h6>
                        <div className="d-flex justify-content-between gap-1">
                          <TextField
                            fullWidth
                            label="Name"
                            variant="standard"
                            value={name}
                            name="pName"
                            onChange={(e) => {
                              setName(e.target.value);
                              if (
                                Object.keys(errors).includes(e.target.name) &&
                                errors[e.target.name] !== ""
                              ) {
                                setErrors({ ...errors, pName: "" });
                              }
                            }}
                            // onBlur={(e) => {
                            //   if (e.target.value === "") {
                            //     setErrors({
                            //       ...errors,
                            //       pName: "Attendee name is required",
                            //     });
                            //   } else if (e.target.value.length() < 3) {
                            //     setErrors({
                            //       ...errors,
                            //       pName:
                            //         "Attendee name cannot be less than 3 characters",
                            //     });
                            //   } else {
                            //     setErrors({ ...errors, pName: "" });
                            //   }
                            // }}
                            error={errors.pName !== ""}
                            helperText={errors.pName}
                          />
                          <TextField
                            fullWidth
                            label="Email"
                            variant="standard"
                            value={email}
                            name="pEmail"
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (
                                Object.keys(errors).includes(e.target.name) &&
                                errors[e.target.name] !== ""
                              ) {
                                var res = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                  e.target.value
                                );
                                if (res) {
                                  setErrors({ ...errors, pEmail: "" });
                                } else
                                  setErrors({
                                    ...errors,
                                    pEmail: "Email address is not valid",
                                  });
                              }
                            }}
                            // onBlur={(e) => {
                            //   if (e.target.value === "") {
                            //     setErrors({
                            //       ...errors,
                            //       pEmail: "Attendee email is required",
                            //     });
                            //   } else if (
                            //     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                            //       e.target.value
                            //     )
                            //   ) {
                            //     console.log("invalid");
                            //     setErrors({
                            //       ...errors,
                            //       pEmail: "Email address is not valid",
                            //     });
                            //   } else {
                            //     setErrors({ ...errors, pEmail: "" });
                            //   }
                            // }}
                            error={errors.pEmail !== ""}
                            helperText={errors.pEmail}
                          />
                          {/* <br /> */}
                          <IconButton
                            className="mt-2 "
                            onClick={handleInputAdd}
                          >
                            <Add />
                          </IconButton>
                        </div>
                        {Object.keys(main).includes("participantsDetails")
                          ? main.participantsDetails.map((value, index) => (
                              <Chip
                                className="mt-2"
                                key={index}
                                label={`${value.name} (${value.email})`}
                                onDelete={() => handleDelete(index)}
                                // color="primary"
                                style={{ margin: "2px", height: "30px" }}
                              />
                            ))
                          : ""}
                      </div>
                    )}
                  </div>

                  {/* Other Details */}
                  <div className="mt-4">
                    <h6>Other Details</h6>

                    <div className="d-flex flex-column justify-content-between gap-3">
                      {/* // QA 1 */}
                      <div className="d-flex align-items-start gap-3">
                        <FormLabel className="col-3 mt-2">
                          Booking for someone ?
                        </FormLabel>
                        <Switch
                          checked={isForSomeone}
                          onChange={() => {
                            setIsForSomeone(!isForSomeone);
                            if (isForSomeone === true) {
                              setIsForSomeone(false);
                              delete main.bookedBy;
                              setMain({
                                ...main,
                                organizer: currentUser,
                              });
                              // const newMain = { ...main };
                              // delete newMain.bookedBy;
                              // setMain(newMain);
                            }
                          }}
                        />
                        {isForSomeone && (
                          <Autocomplete
                            fullWidth
                            options={allUserData ? allUserData : [{}]}
                            autoHighlight
                            getOptionLabel={(option) => option.userName}
                            value={
                              main.organizer !== currentUser
                                ? main.organizer
                                : null
                            }
                            onChange={(e, value) => {
                              if (!Boolean(value)) {
                                delete main.bookedBy;
                                setMain({
                                  ...main,
                                  organizer: currentUser,
                                });
                              } else {
                                setMain({
                                  ...main,
                                  organizer: value,
                                  bookedBy: currentUser,
                                });
                              }
                            }}
                            renderOption={(props, option) => (
                              <Box
                                component="li"
                                sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                                {...props}
                              >
                                {/* <img
                                  loading="lazy"
                                  width="20"
                                  src="https://images.pexels.com/photos/5774804/pexels-photo-5774804.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                                  alt="img"
                                /> */}
                                <Avatar {...stringAvatar(option.userName)} />
                                <label className="ms-1">
                                  {option.userName + " - " + option.email}
                                </label>
                              </Box>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="For whom ?"
                                inputProps={{
                                  ...params.inputProps,
                                  autoComplete: "new-password", // disable autocomplete and autofill
                                }}
                              />
                            )}
                          />
                        )}
                      </div>

                      {/* // QA 2 */}
                      {/* <div className="d-flex align-items-start gap-3">
                        <FormLabel className="col-3 mt-2">
                          Is it a virtual meeting ?
                        </FormLabel>
                        <Switch
                          checked={isVirtualMeeting}
                          onChange={(e) => {
                            setIsVirtualMeeting(!isVirtualMeeting);
                            if (isVirtualMeeting === true) {
                              setIsVirtualMeeting(false);
                              const newMain = { ...main };
                              delete newMain.meetingLink;
                              delete newMain.virtualMeetingDesc;
                              setMain(newMain);
                            }
                            const newErrors = { ...errors };
                            newErrors.meetingLink = "";
                            setErrors(newErrors);
                          }}
                        />
                        {isVirtualMeeting && (
                          <div className="d-flex flex-column flex-fill ">
                            <TextField
                              className=""
                              placeholder="Virtual platform link"
                              variant="standard"
                              name="meetingLink"
                              value={main.meetingLink}
                              onChange={(e) => onChange(e)}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  setErrors({
                                    ...errors,
                                    meetingLink: "Meeting link is required",
                                  });
                                } else if (
                                  !/^(https?|ftp)(:\/\/)([a-zA-Z0-9]+[.]{1}[a-zA-Z0-9]+)+(\/)?([a-zA-Z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*$/.test(
                                    e.target.value
                                  )
                                ) {
                                  setErrors({
                                    ...errors,
                                    meetingLink: "Link is not valid",
                                  });
                                } else {
                                  setErrors({ ...errors, meetingLink: "" });
                                }
                              }}
                              error={errors.meetingLink !== ""}
                              helperText={errors.meetingLink}
                            />
                            <TextField
                              size="small"
                              // InputProps={{
                              //   style: {
                              //     fontSize: "12px",
                              //   },
                              // }}
                              multiline
                              rows={2}
                              placeholder="Virtual meeting description"
                              variant="standard"
                              name="virtualMeetingDesc"
                              value={main.virtualMeetingDesc}
                              onChange={(e) => onChange(e)}
                            />
                          </div>
                        )}
                      </div> */}

                      {/* // QA 3 */}
                      <div className=" align-items-start gap-3">
                        <FormLabel className=" mt-2">
                          Message to front desk
                        </FormLabel>
                        <br />
                        <TextField
                          rows={4}
                          //   label="Comment for frontdesk"
                          className="flex-fill"
                          placeholder={`eg.  1. Pickup client from hotel at 10:00 AM
	2. Arrange breakfast & lunch for client
	3. Book a restaurant for the dinner
	   etc…`}
                          variant="standard"
                          name="commentForFrontdesk"
                          value={main?.commentForFrontdesk}
                          multiline
                          fullWidth
                          onChange={(e) => {
                            setMain({
                              ...main,
                              [e.target.name]: e.target.value,
                            });
                            if (e.target.value === "") {
                              delete main.commentForFrontdesk;
                              setMain({ ...main });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col m-0">
                    <Box
                      component="span"
                      className="col p-2"
                      display="flex"
                      justifyContent="end"
                      alignItems="center"
                      gap={2}
                    >
                      <Button
                        variant="outlined"
                        size="medium"
                        color="primary"
                        onClick={() => {
                          setIsBookingFormOpen(false);
                          drawerOnClose();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        size="medium"
                        color="primary"
                        onClick={onSubmit}
                      >
                        Submit
                        {/* {Object.keys(main).includes("_id")
                          ? "Update Booking"
                          : "Book Slot"} */}
                      </Button>
                    </Box>
                  </div>
                </Card>
              </div>

              {/* <Divider className="col-1" orientation="vertical" /> */}
              <div className="vr my-3 me-2"></div>
            </>
          ) : (
            ""
          )}
          {/* Booking Summary */}
          <div className="ms-1 d-flex w-100   ">
            <Card
              className="p-3 w-100"
              variant="standard"
              sx={{
                justifyContent: "center",
                padding: 5,
                alignItems: "center",
              }}
            >
              <h4 className="d-flex align-items-center justify-content-between">
                <NoteAltOutlined fontSize="large" />{" "}
                <label className="flex-fill ms-2">Booking Summary</label>
                {!viewOnlyForm && (
                  // !filterCompletedEvents(bookingHistory)
                  //   .map((h) => {
                  //     console.log(h);
                  //     return h._id;
                  //   })
                  //   .includes(main?._id)
                  <IconButton
                    onClick={() => {
                      setIsBookingFormOpen(!isBookingFormOpen);
                      drawerOnClose();
                    }}
                    className="justify-self-end"
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </h4>
              <div
                className="table-borderless table mt-4"
                style={{ fontFamily: "inherit", fontSize: "1rem" }}
              >
                <table className="align-top table-condensed w-100 m-0">
                  <tbody>
                    {/* Meeting Details */}
                    <>
                      <tr>
                        <td colSpan={3}>
                          <h6>Meeting Details</h6>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-0">
                          <hr className="mt-0" />
                        </td>
                      </tr>

                      {Object.keys(main).includes("title") &&
                      main.title !== "" ? (
                        <tr>
                          <td width="29%">Title</td>
                          <td>:</td>
                          <td>{main.title ? main.title : ""}</td>
                        </tr>
                      ) : (
                        ""
                      )}

                      {Object.keys(main).includes("description") &&
                      main.description !== "" ? (
                        <tr>
                          <td>Description</td>
                          <td>:</td>
                          <td>{main.description ? main.description : ""}</td>
                        </tr>
                      ) : (
                        ""
                      )}

                      {Object.keys(main).includes("organizer") &&
                        currentUser?._id !== main?.organizer?._id && (
                          <tr>
                            <td>Organizer</td>
                            <td>:</td>
                            <td>
                              {main.organizer ? main.organizer.userName : ""}
                            </td>
                          </tr>
                        )}

                      <tr>
                        <td height={10} colSpan={3}></td>
                      </tr>
                      <tr>
                        <td>Location</td>
                        <td>:</td>
                        <td>
                          {main.resourceId && allResources?.length
                            ? allResources?.filter((resource) => {
                                return resource._id === main.resourceId
                                  ? true
                                  : false;
                              })[0]?.roomName
                            : ""}
                        </td>
                      </tr>

                      <tr>
                        <td>Date</td>
                        <td>:</td>
                        <td>
                          {main.startDate
                            ? new Date(main.startDate).toDateString()
                            : ""}
                        </td>
                      </tr>
                      <tr>
                        <td>Time</td>
                        <td>:</td>
                        <td>
                          {main.start
                            ? new Date(main.start).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                              })
                            : ""}
                          {main.end
                            ? " - " +
                              new Date(main.end).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                              })
                            : ""}
                        </td>
                      </tr>
                    </>

                    {/* Recurrence Details */}
                    <>
                      {main.rrule.type !== 1 ? (
                        <>
                          <tr>
                            <td height={30} colSpan={3}></td>
                          </tr>

                          <tr>
                            <td colSpan={3}>
                              <h6>Recurrence Details</h6>
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className="p-0">
                              <hr className="mt-0" />
                            </td>
                          </tr>

                          <tr>
                            <td>Frequency</td>
                            <td>:</td>
                            <td>{recurrenceType[main.rrule.type]}</td>
                          </tr>

                          <tr>
                            <td>End By</td>
                            <td>:</td>
                            <td>
                              {main.endDate
                                ? new Date(main.endDate).toDateString()
                                : ""}
                            </td>
                          </tr>

                          {main.rrule.type === 3 && (
                            <tr>
                              <td>Days</td>
                              <td>:</td>
                              <td>
                                {main.rrule.days.map(
                                  (day, index) =>
                                    ` ${day.slice(0, 3)}${
                                      index < main.rrule.days.length - 1
                                        ? ", "
                                        : ""
                                    }`
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      ) : (
                        ""
                      )}
                    </>

                    {/* Member Details */}
                    <>
                      {Object.keys(main).includes("memberDetails") &&
                      main.memberDetails.length !== 0 ? (
                        <>
                          <tr>
                            <td height={30} colSpan={3}></td>
                          </tr>

                          <tr>
                            <td colSpan={3}>
                              <h6>Members</h6>
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className="p-0">
                              <hr className="mt-0" />
                            </td>
                          </tr>

                          {main.memberDetails.map((p) => (
                            <tr>
                              <td>{p.userName}</td>
                              <td></td>
                              <td>{p.email}</td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        ""
                      )}
                    </>

                    {/* Participant Details */}
                    <>
                      {Object.keys(main).includes("participantsDetails") &&
                      main.participantsDetails.length !== 0 ? (
                        <>
                          <tr>
                            <td height={30} colSpan={3}></td>
                          </tr>

                          <tr>
                            <td colSpan={3}>
                              <h6>Participants</h6>
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className="p-0">
                              <hr className="mt-0" />
                            </td>
                          </tr>

                          {main.participantsDetails.map((p) => (
                            <tr>
                              <td>{p.name}</td>
                              <td></td>
                              <td>{p.email}</td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        ""
                      )}
                    </>

                    {/* Other Details */}
                    <>
                      {/* {Object.keys(main).includes("bookedBy") ? ( */}
                      {["commentForFrontdesk", "bookedBy"]
                        .map((e) => Object.keys(main).includes(e))
                        .includes(true) ? (
                        <>
                          <tr>
                            <td height={30} colSpan={3}></td>
                          </tr>

                          <tr>
                            <td colSpan={3}>
                              <h6>Other Details</h6>
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={3} className="p-0">
                              <hr className="mt-0" />
                            </td>
                          </tr>

                          {Object.keys(main).includes("bookedBy") &&
                            main.bookedBy !== null && (
                              <>
                                <tr>
                                  <td>Booked for</td>
                                  <td>:</td>
                                  <td>{main.organizer.userName}</td>
                                </tr>
                                <tr>
                                  <td height={10} colSpan={3}></td>
                                </tr>
                              </>
                            )}

                          {Object.keys(main).includes("commentForFrontdesk") &&
                            main.commentForFrontdesk !== "" && (
                              <tr>
                                <td>Comment for frontdesk</td>
                                <td>:</td>
                                <td>
                                  {main.commentForFrontdesk
                                    .split("\n")
                                    .map((line, index) => (
                                      <React.Fragment key={index}>
                                        {line}
                                        <br />
                                      </React.Fragment>
                                    ))}
                                  {/* {console.log(main.commentForFrontdesk)} */}
                                </td>
                                {/* <td colSpan={2}>{p.email}</td> */}
                              </tr>
                            )}
                        </>
                      ) : (
                        ""
                      )}
                    </>
                  </tbody>
                </table>
              </div>
              {!viewOnlyForm &&
                bookingHistory
                  ?.map((e) => e?.organizer?._id)
                  .includes(main?.organizer?._id) && (
                  <div className="my-4 gap-2 d-flex  ">
                    {/* Rebook */}
                    {filterCompletedEvents(bookingHistory)
                      ?.map((e) => e?._id)
                      .includes(main?._id) && (
                      <Button
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: 12 }}
                        onClick={() => {
                          // Gives Current Time with Date 01/01/19770
                          const startTime = new Date();
                          startTime.setFullYear(1970);
                          startTime.setMonth(0);
                          startTime.setDate(1);
                          const endTime = new Date(startTime);
                          // Event to be Reboked
                          const eventToRebook = main;
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
                          // setIsBookingFormOpen(!isBookingFormOpen);
                        }}
                      >
                        <EventRepeatIcon
                          sx={{
                            fontSize: 15,
                          }}
                        />
                        &nbsp;Rebook
                      </Button>
                    )}

                    {/* Cancel / Update */}
                    {filterUpcomingEvents(bookingHistory)
                      ?.map((e) => e?._id)
                      .includes(main?._id) && (
                      <>
                        <Button
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            setOpenCancelConfirm(`${main?._id}$${main?.title}`);
                            // const confirm = window.confirm(
                            //   "You are about to cancel your booking... " +
                            //     `\n` +
                            //     main?._id
                            // );
                            // if (confirm) {
                            //   return axios
                            //     .patch(`/cancelBooking/${main?._id}`)
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
                          sx={{ fontSize: 12 }}
                        >
                          <AutoDelete
                            sx={{
                              fontSize: 15,
                            }}
                          />
                          &nbsp;Cancel
                        </Button>

                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setViewOnlyForm(true);
                            setUpdatingEvent(main);
                            // setIsBookingFormOpen(!isBookingFormOpen);
                          }}
                          sx={{ fontSize: 12 }}
                        >
                          <NoteAlt
                            sx={{
                              fontSize: 15,
                            }}
                          />
                          &nbsp;Update
                        </Button>
                      </>
                    )}
                  </div>
                )}
            </Card>
          </div>
        </div>
      </Container>
      {/* {console.log("main: ", main)} */}
    </Drawer>
  );
};
export default Form;

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  "& .MuiToggleButtonGroup-grouped": {
    margin: theme.spacing(0.5),
    border: 0,
    "&.Mui-disabled": {
      border: 0,
    },
    "&:not(:first-of-type)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-of-type": {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));
