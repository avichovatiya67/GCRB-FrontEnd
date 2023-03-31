import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Form from "../components/bookingForm/Form";
import History from "../components/History";
import Scheduler from "../components/scheduler/Scheduler";
import {
  bookingHistoryContext,
  openCancelConfirmContext,
} from "../context/ContextProvider";

const Dashboard = () => {
  const [bookingHistory] = useContext(bookingHistoryContext);
  const [openCancelConfirm, setOpenCancelConfirm] = useContext(
    openCancelConfirmContext
  );
  return (
    <>
      <div className="d-flex flex-fill">
        {/* Scheduler */}
        {/* <div
          // style={{ width: bookingHistory?.length === 0 ? "100%" : "85%" }}
          className="d-flex flex-fill flex-column"
        > */}
        <div
          className="bg-white m-3 py-2 flex-fill"
          style={{ borderRadius: "20px", border: "#ffffff" }}
        >
          <Scheduler />
        </div>
        {/* </div> */}

        {/* History Section */}
        {bookingHistory?.length !== 0 ? (
          <div className="bg-white p-2" style={{ width: "18%" }}>
            <History />
          </div>
        ) : (
          ""
        )}

        <Form />
        <Dialog
          open={Boolean(openCancelConfirm)}
          // TransitionComponent={Transition}
          keepMounted
          onClose={() => setOpenCancelConfirm(null)}
          aria-describedby="alert-dialog-slide-description"
        >
          {Boolean(openCancelConfirm) && (
            <>
              <DialogTitle>
                {"You are about to cancel your booking..!"}
              </DialogTitle>
              <DialogContent>
                Title : {openCancelConfirm?.split("$")[1]}
              </DialogContent>
            </>
          )}
          <DialogActions>
            <Button onClick={() => setOpenCancelConfirm(false)}>No</Button>
            <Button
              color="error"
              onClick={() =>
                axios
                  .patch(
                    `${process.env.REACT_APP_API_URL}/cancelBooking/${
                      openCancelConfirm.split("$")[0]
                    }`
                  )
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
                  })
              }
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {/* Copy Rights */}
      <div
        className="bg-white d-flex justify-content-center "
        style={{ fontSize: "12px" }}
      >
        © 2023 COPYRIGHT GCRB - All Rights Reserved.
        <a
          href="https://thegatewaycorp.com/"
          style={{ textDecoration: "none" }}
        >
          [The Gateway Group Company]
        </a>
      </div>
    </>
  );
};
export default Dashboard;
