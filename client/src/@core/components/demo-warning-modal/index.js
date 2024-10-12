import Proptypes from "prop-types"

// ** Third Party Components
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import { DialogContentText, Typography } from "@mui/material"

const DemoWarningModal = (props) => {
  return (
    <Dialog
      open={props.demoState.state}
      onClose={() => {
        props.demoState.setModalState(false)
        if (
          props.demoState.onClose &&
          typeof props.demoState.onClose === "function"
        ) {
          props.demoState.onClose()
        }
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Demo Mode ON</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Typography textAlign={"justify"}>
            Thank you for exploring our platform!
          </Typography>
          <Typography>
            Please note this demo mode restricts certain functionalities for a
            seamless experience. Feel free to continue exploring!
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            props.demoState.setModalState(false)
          }}
          autoFocus
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DemoWarningModal

DemoWarningModal.propTypes = {
  demoState: Proptypes.shape({
    demoEnabled: Proptypes.bool.isRequired,
    state: Proptypes.bool.isRequired,
    setModalState: Proptypes.func.isRequired,
    onClose: Proptypes.func
  })
}
