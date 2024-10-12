import { Card, CardHeader, CardBody, CardTitle, Input } from "reactstrap"
import { styled } from "@mui/material/styles"
// import { useParams } from 'react-router-dom'
import { Fragment, useState, useEffect } from "react"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell, { tableCellClasses } from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import {
  Trash,
  Edit,
  Plus,
  CheckCircle,
  Database,
  XCircle,
  AlertCircle,
  Coffee,
  Clock,
  Link
} from "react-feather"
import "../App.css"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import TextField from "@mui/material/TextField"
import Grid from "@mui/material/Grid"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import FormLabel from "@mui/material/FormLabel"

import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { TreeView } from "@mui/x-tree-view/TreeView"
import { TreeItem } from "@mui/x-tree-view/TreeItem"
import Autocomplete from "@mui/material/Autocomplete"
import { useHistory } from "react-router-dom"

import axios from "axios"
import LoadingButton from "@mui/lab/LoadingButton"
import loadingGif from "../assets/images/loading.gif"
import { ReactComponent as SnowflakeDatabaseIcon } from "../assets/images/icons/database/snowflake.svg"
import { ReactComponent as PsqlDatabaseIcon } from "../assets/images/icons/database/postgresql.svg"
import { toast, Slide } from "react-toastify"
import Avatar from "@components/avatar"
import _ from "lodash"
import useDemoFilter from "../utility/hooks/useDemoFilter"
import DemoWarningModal from "../@core/components/demo-warning-modal"

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#2b2b2b",
    color: theme.palette.common.white,
    paddingTop: "10px",
    paddingBottom: "10px"
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    paddingTop: "10px",
    paddingBottom: "10px",
    borderBottom: "solid 1px rgba(0,0,0,.12)"
  }
}))

const StyledTableRow = styled(TableRow)(() => ({
  "&:nth-of-type(odd)": {
    // backgroundColor: theme.palette.action.hover
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0
  }
}))

const getHoursNextSyncNote = (timeString, targetOffset) => {
  // Current date/time
  const now = new Date()

  // Parse the EST time string
  const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10))
  
  const diffMinutes = (hours * 60) + minutes - targetOffset - (now.getUTCHours() * 60) - now.getUTCMinutes()
  
  // Convert the difference to hours as floor
  let diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 0) {
    diffHours += 24
  }

  return diffHours > 0 ? `In ~ ${diffHours} hour${diffHours > 1 ? 's' : ''}` : 'About to start'
}

function createData({
  connection_name,
  connection_type,
  account_name,
  user_name,
  password,
  sf_warehouse,
  user_role,
  connection_id,
  account_id,
  last_sync_ts,
  sync_schedule_time,
  sync_schedule_tz
}) {
  return {
    connectionName: connection_name,
    connectionType: connection_type,
    accountName: account_name,
    userName: user_name,
    password,
    warehouseName: sf_warehouse,
    userRole: user_role,
    connectionId: connection_id,
    accountId: account_id,
    lastSyncTime: last_sync_ts,
    nextSyncTime: sync_schedule_time,
    nextSyncTimezone: sync_schedule_tz
  }
}

const ToastContent = ({ name, message }) => (
  <Fragment>
    <div className="toastify-header">
      <div className="title-wrapper">
        <Avatar size="sm" color="success" icon={<Coffee size={12} />} />
        <h6 className="toast-title fw-bold">Hello, {name}</h6>
      </div>
    </div>
    <div className="toastify-body">
      <span>{message}</span>
    </div>
  </Fragment>
)

const convertDateTimeToTimeZone = (datetime, timezone, targetOffset) => {
  const inputDate = new Date(datetime)

  // Check if the input datetime string is in UTC format
  const isUTC = datetime.endsWith("Z")

  if (targetOffset !== undefined) {
    // Get the user's local time zone offset in minutes if not in UTC
    const localOffset = isUTC ? 0 : inputDate.getTimezoneOffset()

    // Convert the time to the target timezone
    const targetTime =
      inputDate.getTime() + ((targetOffset - localOffset) * 60 * 1000)
    const targetDate = new Date(targetTime)

    // Get the current date and time in the target timezone
    const now = new Date()
    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
    const targetDateOnly = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    )

    // Calculate the difference in days
    const diffInDays = Math.floor(
      (currentDate - targetDateOnly) / (1000 * 60 * 60 * 24)
    )

    // Format the time in the target timezone
    const formattedTime = targetDate.toLocaleString("en-US", {
      timeZone: "UTC", // Ensure UTC is used to avoid re-converting the time zone
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })

    // Determine the day description (Yesterday, Today, Tomorrow)
    let dayDescription = ""
    if (diffInDays === 0) {
      dayDescription = "Today"
    } else if (diffInDays === 1) {
      dayDescription = "Yesterday"
    } else if (diffInDays === -1) {
      dayDescription = "Tomorrow"
    } else {
      // Handle other days if needed
      dayDescription = targetDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
      dayDescription += ","
    }

    return `${dayDescription} ${formattedTime} ${timezone}`
  } else {
    return "Invalid timezone"
  }
}

const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = `${hour < 10 ? "0" : ""}${hour}`
      const formattedMinute = `${minute < 10 ? "0" : ""}${minute}`
      options.push(`${formattedHour}:${formattedMinute}`)
    }
  }
  return options
}

const newConnectionObject = {
  connectionName: "",
  connectionType: "snowflake",
  accountName: "",
  userName: "",
  password: "",
  warehouseName: "",
  accountId: process.env.REACT_APP_ACCOUNT_ID,
  loginId: null,
  userRole: ""
}

const ConnectionsPage = () => {
  const history = useHistory()
  // Check for demo mode
  const demoState = useDemoFilter()
  const [flag, setFlag] = useState(0)
  const [rows, setRows] = useState([])
  const [userData, setUserData] = useState([])
  const [openOne, setOpenOne] = useState(false)
  const [openTwo, setOpenTwo] = useState(false)
  const [openThree, setOpenThree] = useState(false)
  const [openFour, setOpenFour] = useState(false)
  const [checkButtonLoading, setCheckButtonLoading] = useState(false)
  const [addButtonLoading, setAddButtonLoading] = useState(false)
  const [syncButtonLoading, setSyncButtonLoading] = useState(false)
  const [backLoading, setBackLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [updateSettingBtnFlag, setUpdateSettingBtnFlag] = useState(false)
  const [connectionData, setConnectionData] = useState(newConnectionObject)
  const [newConnectionData, setNewConnectionData] =
    useState(newConnectionObject)
  const [connectionDetail, setConnectionDetail] = useState([])
  const [connectionDetailEdited, setConnectionDetailEdited] = useState([])
  const [connectionDetailId, setConnectionDetailId] = useState(-1)
  const [syncTimeData, setSyncTimeData] = useState({})
  const [syncTimeDataEdited, setSyncTimeDataEdited] = useState({})
  const [errorMsg, setErrorMsg] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [timezones, setTimezones] = useState([])
  const timeOptions = generateTimeOptions()

  const getMinuteOffset = (timezone) => {
    const targetTimezone = timezones.find((tz) => tz.tz_abbreviation === timezone)
    if (!targetTimezone) {
      console.error('Invalid timezone')
      return
    }
    return targetTimezone.utc_offset.slice(-3).replace('−', '-') * 60
  }

  function getConnectionData() {
    if (userData?.account_id) {
      setBackLoading(true)
      axios
        .get(`/api/connection/all-connections/${userData?.account_id}`)
        .then((response) => {
          if (response.data.success) {
            setTimezones(response.data.timezones)
            const tempRows = []
            response.data.data?.forEach((item) => {
              tempRows.push(createData(item))
            })
            setRows([...tempRows])
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setBackLoading(false))
    }
  }
  function getConnectionDetail(row, index) {
    setConnectionData(row)
    setErrorMsg("")
    setConnectionDetail([])
    setDetailLoading(true)
    if (connectionDetailId === index) setConnectionDetailId(-1)
    else setConnectionDetailId(index)
    setUpdateSettingBtnFlag(false)
    setSyncTimeData({
      sync_schedule_time: row.nextSyncTime,
      sync_schedule_tz: row.nextSyncTimezone
    })
    axios
      .get(`/api/connection/connection-detail/${row?.connectionId}`)
      .then((response) => {
        if (response.data.success) {
          console.log("response.data.success", response.data)
          setConnectionDetail([...response.data.data])
        }
      })
      .catch((error) => setErrorMsg(error.message))
      .finally(() => setDetailLoading(false))
  }

  useEffect(() => {
    if (flag > 1) return
    else setFlag(flag + 1)
    setUserData(JSON.parse(localStorage.getItem("userData")))
    setConnectionData({
      ...connectionData,
      accountId: JSON.parse(localStorage.getItem("userData"))?.account_id,
      loginId: JSON.parse(localStorage.getItem("userData"))?.login_id
    })
    getConnectionData()
  }, [userData])

  useEffect(() => {
    if (!localStorage.getItem("userData")) history.push("/login")
  }, [])

  useEffect(() => {
    const deepCopy = _.cloneDeep(connectionDetail)
    setConnectionDetailEdited(deepCopy)
  }, [connectionDetail])

  useEffect(() => {
    const deepCopy = _.cloneDeep(syncTimeData)
    setSyncTimeDataEdited(deepCopy)
  }, [syncTimeData])

  function deepEqual(object1, object2) {
    if (object1 === object2) {
      return true
    }

    if (
      typeof object1 !== "object" ||
      object1 === null ||
      typeof object2 !== "object" ||
      object2 === null
    ) {
      return false
    }

    const keys1 = Object.keys(object1)
    const keys2 = Object.keys(object2)

    if (keys1.length !== keys2.length) {
      return false
    }

    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(object1[key], object2[key])) {
        return false
      }
    }

    return true
  }
  useEffect(() => {
    // if (connectionDetail === connectionDetailEdited) setUpdateSettingBtnFlag(false)
    // else setUpdateSettingBtnFlag(true)
    setUpdateSettingBtnFlag(
      !deepEqual(connectionDetail, connectionDetailEdited) ||
        !deepEqual(syncTimeData, syncTimeDataEdited)
    )
  }, [connectionDetailEdited, syncTimeDataEdited])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
        <Button
          variant="outlined"
          startIcon={<Plus size={20} />}
          onClick={() => {
            setErrorMsg("")
            setOpenOne(true)
            setNewConnectionData(newConnectionObject)
          }}
        >
          Add a Connection
        </Button>
      </CardHeader>
      <CardBody style={{ boxShadow: "none" }}>
        {backLoading ? (
          <div className="loading-gif-container">
            <img
              src={loadingGif}
              alt="Getting table data..."
              className="loading-gif"
            />
          </div>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow style={{ textAlign: "center" }}>
                  <StyledTableCell align="left">
                    CONNECTION NAME
                  </StyledTableCell>
                  <StyledTableCell align="left">DATA SOURCE</StyledTableCell>
                  <StyledTableCell align="left">LAST SYNC</StyledTableCell>
                  <StyledTableCell align="left">
                    NEXT SCHEDULED SYNC
                  </StyledTableCell>
                  <StyledTableCell align="left">ACTIONS</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows?.map((row, index) => (
                  <Fragment key={`row-${index}`}>
                    <StyledTableRow
                      className="table-row"
                      onClick={() => {
                        getConnectionDetail(row, index)
                      }}
                    >
                      <StyledTableCell component="th" scope="row">
                        <b>{row.connectionName.toUpperCase()}</b>
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {row.connectionType === "snowflake" ? (
                          <SnowflakeDatabaseIcon className="database-icon" />
                        ) : row.connectionType === "postresql" ? (
                          <PsqlDatabaseIcon className="database-icon" />
                        ) : (
                          <Database size={20} />
                        )}{" "}
                        {row.connectionType}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {row.lastSyncTime ? (
                          <CheckCircle size={20} color="green" />
                        ) : (
                          <XCircle size={20} color="red" />
                        )}{" "}
                        {row.lastSyncTime ? convertDateTimeToTimeZone(
                              row.lastSyncTime,
                              row.nextSyncTimezone,
                              getMinuteOffset(row.nextSyncTimezone)
                            ) : "No Sync yet"}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {row.nextSyncTime ? (<>
                          <Clock size={20} color="green" />{" "}
                          <strong>{getHoursNextSyncNote(row.nextSyncTime, getMinuteOffset(row.nextSyncTimezone))}</strong><br/>
                          <span className="ms-2">
                            ({row.nextSyncTime} {row.nextSyncTimezone})
                          </span>
                        </>) : (<>
                          <XCircle size={20} color="red" />{" "}
                          Not scheduled.
                        </>)}
                      </StyledTableCell>
                      <StyledTableCell align="left" style={{ width: "0px" }}>
                        <Stack
                          spacing={2}
                          direction="row"
                          align="right"
                          style={{ width: "justify-content" }}
                        >
                          <Button
                            variant="outlined"
                            startIcon={<Edit size={20} />}
                          >
                            Manage
                          </Button>
                        </Stack>
                      </StyledTableCell>
                    </StyledTableRow>
                    <tr
                      className={connectionDetailId === index ? "" : "hidden"}
                    >
                      <td colSpan={5}>
                        {detailLoading ? (
                          <div className="loading-gif-container">
                            <img
                              src={loadingGif}
                              alt="Getting table data..."
                              className="loading-gif"
                            />
                          </div>
                        ) : (
                          <div className="connection-manage-box">
                            <div className="manage-left">
                              <TreeView
                                aria-label="file system navigator"
                                defaultCollapseIcon={<ExpandMoreIcon />}
                                defaultExpandIcon={<ChevronRightIcon />}
                              >
                                {connectionDetailEdited?.map(
                                  (iitem, iindex) => (
                                    <TreeItem
                                      nodeId={`database${iindex}`}
                                      key={`database${iindex}`}
                                      label={
                                        <div
                                          className="form-switch form-check-primary"
                                          style={{ display: "flex" }}
                                        >
                                          <Input
                                            type="switch"
                                            checked={iitem.is_included_in_sync}
                                            onChange={(e) => {
                                              e.stopPropagation()
                                              const tempData =
                                                connectionDetailEdited
                                              const now =
                                                iitem.is_included_in_sync
                                              tempData[
                                                iindex
                                              ].is_included_in_sync = !now
                                              for (
                                                let i = 0;
                                                i <
                                                tempData[iindex].schema.length;
                                                i++
                                              ) {
                                                tempData[iindex].schema[
                                                  i
                                                ].is_included_in_sync = !now
                                              }
                                              setConnectionDetailEdited([...tempData])
                                            }}
                                          />
                                          {"DATABASE : "}
                                          {iitem.database_name}
                                          <div style={{ flex: "1 0 0" }} />
                                        </div>
                                      }
                                    >
                                      {iitem?.schema?.map((iiitem, iiindex) => {
                                        return (
                                          <TreeItem
                                            nodeId={`schema${iiindex}`}
                                            key={`schema${iiindex}`}
                                            label={
                                              <div
                                                className="form-switch form-check-primary"
                                                style={{ display: "flex" }}
                                              >
                                                <Input
                                                  type="switch"
                                                  checked={
                                                    iiitem.is_included_in_sync
                                                  }
                                                  onChange={(e) => {
                                                    e.stopPropagation()
                                                    const tempData =
                                                      connectionDetailEdited
                                                    let beforeCount = 0
                                                    for (
                                                      let i = 0;
                                                      i < iitem.schema.length;
                                                      i++
                                                    ) {
                                                      if (
                                                        tempData[iindex].schema[
                                                          i
                                                        ]
                                                          .is_included_in_sync ===
                                                        true
                                                      ) beforeCount++
                                                    }
                                                    const now =
                                                      iiitem.is_included_in_sync
                                                    tempData[iindex].schema[
                                                      iiindex
                                                    ].is_included_in_sync =
                                                      !now
                                                    let afterCount = 0
                                                    for (
                                                      let i = 0;
                                                      i < iitem.schema.length;
                                                      i++
                                                    ) {
                                                      if (
                                                        tempData[iindex].schema[
                                                          i
                                                        ]
                                                          .is_included_in_sync ===
                                                        true
                                                      ) afterCount++
                                                    }
                                                    if (
                                                      now === true &&
                                                      beforeCount ===
                                                        iitem.schema.length
                                                    ) tempData[
                                                        iindex
                                                      ].is_included_in_sync = false
                                                    if (
                                                      now === false &&
                                                      afterCount ===
                                                        iitem.schema.length
                                                    ) tempData[
                                                        iindex
                                                      ].is_included_in_sync = true
                                                    setConnectionDetailEdited([...tempData])
                                                  }}
                                                  style={{
                                                    marginRight: "20px"
                                                  }}
                                                />
                                                {"SCHEMA : "}
                                                {iiitem.schema_name}
                                                <div
                                                  style={{ flex: "1 0 0" }}
                                                />
                                                <span
                                                  className={
                                                    connectionDetail[iindex]
                                                      ?.schema[iiindex]
                                                      ?.is_included_in_sync ? "link" : "link disabled"
                                                  }
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    history.push({
                                                      pathname: "/my-data",
                                                      state: {
                                                        database:
                                                          iitem.database_name,
                                                        schema:
                                                          iiitem.schema_name
                                                      }
                                                    })
                                                  }}
                                                >
                                                  <u>View Table(s)</u>
                                                </span>
                                              </div>
                                            }
                                          />
                                        )
                                      })}
                                    </TreeItem>
                                  )
                                )}
                              </TreeView>
                            </div>
                            <div className="manage-right">
                              <span>Daily Sync Schedule</span>

                              <div className="sync-time-set">
                                <Autocomplete
                                  options={timeOptions}
                                  defaultValue={row.nextSyncTime}
                                  value={syncTimeDataEdited?.sync_schedule_time}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Select Time"
                                      variant="standard"
                                    />
                                  )}
                                  onChange={(e, value) => setSyncTimeDataEdited((prev) => ({
                                      ...prev,
                                      sync_schedule_time: value
                                    }))
                                  }
                                />

                                <Autocomplete
                                  options={timezones.map((tz) => tz.tz_abbreviation)}
                                  defaultValue={row.nextSyncTimezone}
                                  value={syncTimeDataEdited?.sync_schedule_tz}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Select Time Zone"
                                      variant="standard"
                                    />
                                  )}
                                  onChange={(e, value) => setSyncTimeDataEdited((prev) => ({
                                      ...prev,
                                      sync_schedule_tz: value
                                    }))
                                  }
                                />
                              </div>

                              <Stack
                                spacing={2}
                                direction="row"
                                align="right"
                                style={{ justifyContent: "end" }}
                              >
                                <LoadingButton
                                  startIcon={<Clock size={20} />}
                                  onClick={() => {
                                    if (demoState.demoEnabled) {
                                      demoState.setModalState(true)
                                      return
                                    }

                                    setErrorMsg("")
                                    setSyncButtonLoading(true)
                                    axios
                                      .post(`/api/connection/update-sync`, {
                                        connectionDetailEdited,
                                        syncTimeData: syncTimeDataEdited,
                                        connection_id: row?.connectionId
                                      })
                                      .then((response) => {
                                        if (response.data.success) {
                                          toast.success(
                                            <ToastContent
                                              name={
                                                JSON.parse(
                                                  localStorage.getItem(
                                                    "userData"
                                                  )
                                                )?.name?.split("@")[0] || ""
                                              }
                                              message={"Sync data updated."}
                                            />,
                                            {
                                              icon: false,
                                              transition: Slide,
                                              hideProgressBar: true,
                                              autoClose: 3000
                                            }
                                          )
                                          getConnectionDetail(row, index)
                                        } else {
                                          toast.error(
                                            <ToastContent
                                              name={
                                                JSON.parse(
                                                  localStorage.getItem(
                                                    "userData"
                                                  )
                                                )?.name?.split("@")[0] || ""
                                              }
                                              message={response.data.message}
                                            />,
                                            {
                                              icon: false,
                                              transition: Slide,
                                              hideProgressBar: true,
                                              autoClose: 3000
                                            }
                                          )
                                        }
                                      })
                                      .catch((error) => setErrorMsg(error.message)
                                      )
                                      .finally(() => {
                                        setSyncButtonLoading(false)
                                        getConnectionData()
                                      })
                                  }}
                                  loading={syncButtonLoading}
                                  disabled={!updateSettingBtnFlag}
                                  variant="outlined"
                                >
                                  Update settings
                                </LoadingButton>
                                <Button
                                  variant="outlined"
                                  startIcon={<Link size={20} />}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setConnectionData(row)
                                    setErrorMsg("")
                                    setOpenTwo(true)
                                  }}
                                >
                                  Edit Connection
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Trash size={20} />}
                                  onClick={(event) => {
                                    if (demoState.demoEnabled) {
                                      demoState.setModalState(true)
                                      return
                                    }

                                    event.stopPropagation()
                                    setConnectionData(row)
                                    setErrorMsg("")
                                    setOpenThree(true)
                                  }}
                                >
                                  Remove
                                </Button>
                              </Stack>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardBody>

      <Dialog
        open={openOne}
        onClose={() => {
          setOpenOne(false)
          setShowPassword(false)
          setAddButtonLoading(false)
          setCheckButtonLoading(false)
        }}
        onChange={() => {
          setChecked(false)
          setErrorMsg("")
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Create A New Connection
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Connection Name"
                variant="standard"
                value={newConnectionData?.connectionName}
                onChange={(e) => setNewConnectionData({
                    ...newConnectionData,
                    connectionName: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">
                  Data Source
                </FormLabel>
                <RadioGroup
                  row
                  defaultValue="snowflake"
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  onChange={(e) => setNewConnectionData({
                      ...newConnectionData,
                      connectionType: e.target.value
                    })
                  }
                >
                  <FormControlLabel
                    value="snowflake"
                    control={<Radio />}
                    label="Snowflake"
                  />
                  {/* <FormControlLabel value="other" control={<Radio />} label="Other" /> */}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Account Name"
                variant="standard"
                value={newConnectionData?.accountName}
                onChange={(e) => setNewConnectionData({
                    ...newConnectionData,
                    accountName: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="User Name"
                variant="standard"
                value={newConnectionData?.userName}
                onChange={(e) => setNewConnectionData({
                    ...newConnectionData,
                    userName: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Password"
                variant="standard"
                value={newConnectionData?.password}
                type={showPassword ? "text" : "password"}
                InputProps={{
                  // <-- This is where the toggle button is added.
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  autoComplete: "new-password"
                }}
                onChange={(e) => setNewConnectionData({
                    ...newConnectionData,
                    password: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Warehouse Name"
                variant="standard"
                value={newConnectionData?.warehouseName}
                onChange={(e) => setNewConnectionData({
                    ...newConnectionData,
                    warehouseName: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="User Role"
                variant="standard"
                value={newConnectionData?.userRole}
                onChange={(e) => setNewConnectionData({
                    ...newConnectionData,
                    userRole: e.target.value
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="dialog-actions-dense">
          <LoadingButton
            onClick={() => {
              if (demoState.demoEnabled) {
                demoState.setModalState(true)
                return
              }

              setCheckButtonLoading(true)
              setErrorMsg("")
              axios
                .post(`/api/connection/check-connection`, newConnectionData)
                .then((response) => {
                  if (response.data.success) {
                    setChecked(true)
                    setErrorMsg("Connection successful.")
                  } else setErrorMsg(response.data.message)
                })
                .catch((error) => setErrorMsg(error.message))
                .finally(() => setCheckButtonLoading(false))
            }}
            loading={checkButtonLoading}
            variant="outlined"
          >
            Test Connection
          </LoadingButton>
          <span style={{ color: "red" }}>{errorMsg}</span>
          <div style={{ flex: "1 0 0" }} />
          <LoadingButton
            disabled={!checked}
            onClick={() => {
              if (demoState.demoEnabled) {
                demoState.setModalState(true)
                return
              }
              if (!newConnectionData?.connectionName) {
                setErrorMsg("Please input connection name.")
                return
              }
              setErrorMsg("")
              setAddButtonLoading(true)
              axios
                .post(`/api/connection/create-connection`, newConnectionData)
                .then((response) => {
                  getConnectionData()
                  if (response.data.success) {
                    setOpenOne(false)
                  } else setErrorMsg(response.data.message)
                })
                .catch((error) => setErrorMsg(error.message))
                .finally(() => setAddButtonLoading(false))
            }}
            loading={addButtonLoading}
            variant="outlined"
          >
            Create
          </LoadingButton>
          <Button
            onClick={() => setOpenOne(false)}
            variant="outlined"
            color="error"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTwo}
        onClose={() => {
          setOpenTwo(false)
          setShowPassword(false)
        }}
        onChange={() => {
          setChecked(false)
          setErrorMsg("")
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Edit the Connection</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Connection Name"
                variant="standard"
                value={connectionData?.connectionName}
                onChange={(e) => setConnectionData({
                    ...connectionData,
                    connectionName: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">
                  Data Source
                </FormLabel>
                <RadioGroup
                  row
                  defaultValue="snowflake"
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  onChange={(e) => setConnectionData({
                      ...connectionData,
                      connectionType: e.target.value
                    })
                  }
                >
                  <FormControlLabel
                    value="snowflake"
                    control={<Radio />}
                    label="Snowflake"
                  />
                  {/* <FormControlLabel value="other" control={<Radio />} label="Other" /> */}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Account Name"
                variant="standard"
                value={connectionData?.accountName}
                onChange={(e) => setConnectionData({
                    ...connectionData,
                    accountName: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="User Name"
                variant="standard"
                value={connectionData?.userName}
                onChange={(e) => setConnectionData({
                    ...connectionData,
                    userName: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Password"
                variant="standard"
                value={connectionData?.password}
                type={showPassword ? "text" : "password"}
                InputProps={{
                  // <-- This is where the toggle button is added.
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  autoComplete: "new-password"
                }}
                onChange={(e) => setConnectionData({
                    ...connectionData,
                    password: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Warehouse Name"
                variant="standard"
                value={connectionData?.warehouseName}
                onChange={(e) => setConnectionData({
                    ...connectionData,
                    warehouseName: e.target.value
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="User Role"
                variant="standard"
                value={connectionData?.userRole}
                onChange={(e) => setConnectionData({
                    ...connectionData,
                    userRole: e.target.value
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="dialog-actions-dense">
          <LoadingButton
            onClick={() => {
              if (demoState.demoEnabled) {
                demoState.setModalState(true)
                return
              }

              setErrorMsg("")
              if (!connectionData?.password) {
                setErrorMsg("Please enter password.")
                return
              }
              setCheckButtonLoading(true)
              axios
                .post(`/api/connection/check-connection`, connectionData)
                .then((response) => {
                  if (response.data.success) {
                    setChecked(true)
                    setErrorMsg("Successfully connected.")
                  } else setErrorMsg(response.data.message)
                })
                .catch((error) => setErrorMsg(error.message))
                .finally(() => setCheckButtonLoading(false))
            }}
            loading={checkButtonLoading}
            variant="outlined"
          >
            Test Connection
          </LoadingButton>
          <span style={{ color: "red" }}>{errorMsg}</span>
          <div style={{ flex: "1 0 0" }} />
          <LoadingButton
            disabled={!checked}
            onClick={() => {
              if (demoState.demoEnabled) {
                demoState.setModalState(true)
                return
              }

              setErrorMsg("")
              setAddButtonLoading(true)
              axios
                .post(`/api/connection/update-connection`, connectionData)
                .then((response) => {
                  getConnectionData()
                  if (response.data.success) {
                    setChecked(false)
                    setErrorMsg("Successfully Updated.")
                  } else setErrorMsg(response.data.message)
                })
                .catch((error) => setErrorMsg(error.message))
                .finally(() => setAddButtonLoading(false))
            }}
            loading={addButtonLoading}
            variant="outlined"
          >
            Update
          </LoadingButton>
          <Button
            onClick={() => setOpenTwo(false)}
            variant="outlined"
            color="error"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openThree}
        onClose={() => {
          setOpenThree(false)
          setAddButtonLoading(false)
          setErrorMsg("")
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" style={{ alignItems: "center" }}>
          <AlertCircle size={20} color="red" /> Confirmation
        </DialogTitle>
        <DialogContent>
          Are you sure you want to remove this connection?
          <br />
          Please note this action cannot be reversed
          <br />
          and you will lose this connection's data!
        </DialogContent>
        <DialogContent>
          <span style={{ color: "red" }}>{errorMsg}</span>
        </DialogContent>
        <DialogActions className="dialog-actions-dense">
          <LoadingButton
            onClick={() => {
              if (demoState.demoEnabled) {
                demoState.setModalState(true)
                return
              }
              setErrorMsg("")
              setAddButtonLoading(true)
              axios
                .delete(
                  `/api/connection/delete-connection/${connectionData?.connectionId}`
                )
                .then((response) => {
                  if (response.data.success) {
                    getConnectionData()
                    setOpenThree(false)
                  }
                })
                .catch((error) => setErrorMsg(error.message))
                .finally(() => setAddButtonLoading(false))
            }}
            loading={addButtonLoading}
            variant="outlined"
            color="error"
          >
            Remove
          </LoadingButton>
          <Button onClick={() => setOpenThree(false)} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <DemoWarningModal demoState={demoState} />
      <Dialog
        open={openFour}
        onClose={() => {
          setOpenFour(false)
          setAddButtonLoading(false)
        }}
        onPointerEnter={() => {
          axios
            .get(
              `/api/connection/connection-detail/${connectionData?.connectionId}`
            )
            .then((response) => {
              if (response.data.success) {
                // const tempRows = []
                // response.data.data?.forEach((item) => {
                //    tempRows.push(createData(item))
                // })
                // setRows([...tempRows])
              }
            })
            .catch((error) => setErrorMsg(error.message))
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Connection Details</DialogTitle>
        <DialogContent>{JSON.stringify(connectionData)}</DialogContent>
        <DialogContent>
          <span style={{ color: "red" }}>{errorMsg}</span>
        </DialogContent>
        <DialogActions className="dialog-actions-dense">
          <Button
            onClick={() => {
              setOpenFour(false)
              setErrorMsg("")
              setOpenTwo(true)
            }}
            variant="outlined"
            color="error"
          >
            Edit
          </Button>
          <Button onClick={() => setOpenFour(false)} variant="outlined">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ConnectionsPage
