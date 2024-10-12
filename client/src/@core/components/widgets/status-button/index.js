import React, { useState } from 'react'
import LoadingButton from '@mui/lab/LoadingButton'
import axios from 'axios'

import {
    createTheme,
    ThemeProvider
} from '@mui/material/styles'


const { palette } = createTheme()
const { augmentColor } = palette
const createColor = (mainColor) => augmentColor({ color: { main: mainColor } })
const theme = createTheme({
  palette: {
    pink: createColor('#DA00BA'),
    purple: createColor('#4640e5')
  }
})

const formatTimestamp = (timestamp) => {
    // Create a new Date object from the timestamp
    const date = new Date(timestamp)
  
    // Extract date components
    const year = date.getFullYear()
    const month = (`0${date.getMonth() + 1}`).slice(-2)
    const day = (`0${date.getDate()}`).slice(-2)
  
    // Extract time components
    let hours = date.getHours()
    const minutes = (`0${date.getMinutes()}`).slice(-2)
    const ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12
    hours = hours ? hours : 12 // Handle midnight
  
    // Format the time in 12-hour format
    const time = `${hours}:${minutes} ${ampm}`
  
    // Construct the formatted string
    const formattedDate = `${year}-${month}-${day} ${time}`
    return formattedDate
}

function StatusButton({incident_history, getIncidentData}) {
    const reversed_history = incident_history.slice()
    reversed_history.reverse()
    const [statusButtonLoading, setStatusButtonoading] = useState(false)

    function Prefix(status) {
        switch (status) {
          case 'New': return 'Reported'
          case 'Acknowledged': return 'Acknowledged'
          case 'Closed': return 'Closed'
          default: return ''
        }
    }

    return (
        <div className="right">
            <div className="status">Status: <b>{incident_history[0]?.display_status}</b></div>
            <ThemeProvider theme={theme}>
                <LoadingButton variant={"contained"}
                    color={incident_history[0]?.display_status === "Acknowledged" ? "pink" : "purple"}
                    loading={statusButtonLoading}
                    className={incident_history[0]?.display_status === "Closed" ? "hidden" : ""}
                    onClick={async(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setStatusButtonoading(true)
                        const userName = JSON.parse(localStorage.getItem('userData'))?.name?.split('@')[0] || ''
                        await axios.post(`/api/incident/update-status`, {incident_history: incident_history[0], userName})
                            .then(async (response) => {
                                if (response?.data.success) {
                                    await getIncidentData(false)
                                    setStatusButtonoading(false)
                                }
                            })
                            .catch((error) => console.log(error))
                }}>
                    {incident_history[0]?.display_status === "New" && 'ACKNOWLEDGE'}
                    {incident_history[0]?.display_status === "Acknowledged" && 'RESOLVE'}
                </LoadingButton>
            </ThemeProvider>
            <div className="dates">
                {
                    reversed_history?.map((iitem, iindex) => {
                        return <span className="report" key={`incident-history-${iindex}`}>
                            {Prefix(iitem?.display_status)} {formatTimestamp(iitem?.status_ts)} {iitem?.username ? `(By ${iitem?.username})` : ''}
                        </span>
                    })
                }
            </div>
        </div>
    )
}

export default StatusButton