import React, { useEffect, useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import loadingGif from '../assets/images/loading.gif'
import { Card, CardHeader, CardBody, CardTitle} from 'reactstrap'
import '../App.css'
import axios from 'axios'

// ** MUI Imports
import Button from "@mui/material/Button"
import { ReactComponent as SnowflakeDatabaseIcon } from '../assets/images/icons/database/snowflake.svg'
import { ReactComponent as PsqlDatabaseIcon } from '../assets/images/icons/database/postgresql.svg'
import { Database } from 'react-feather'
import FlowDiagram from '../@core/components/widgets/flow-diagram'
import StatusButton from "../@core/components/widgets/status-button"
import ColorDisplay from '../@core/components/widgets/color-display'

function IncidentDetailPage() {
    const location = useLocation()
    const history = useHistory()
    const searchParams = new URLSearchParams(location.search)
    const incidentNumber = searchParams.get('incidentNumber')
    const [incidentData, setIncidentData] = useState([])
    const [backLoading, setBackLoading] = useState(false)

    const getIncidentData = async () => {
        setBackLoading(true)
        await axios.post(`/api/incident/one-incident`, {incidentNumber})
        .then((response) => {
          if (response?.data.success) {
            console.log("response.data.data", response.data.data)
            setIncidentData(response.data.data)
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setBackLoading(false))
    }

    useEffect(() => {
        getIncidentData()
    }, [])
    
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle><span className='back-tag' onClick={() => history.push('/incidents')}><u>Incidents</u></span> {' > '}
                        {incidentNumber ? `Incident ${incidentNumber}` : `Incident`}
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    {
                        backLoading ? <div className='loading-gif-container'>
                            <img src={loadingGif} alt="Getting table data..." className='loading-gif' />
                        </div> : <div className="incident-container">
                            {
                                incidentData?.map((item, index) => {
                                    return <div className="incident-item block" key={`incident-${index}`} >
                                        <div className='top'>
                                            <div className="left">
                                                <div className="right">
                                                    <span className="title">Root Cause: <u><a href={`/my-data-table?tableId=${item?.table_id}`}
                                                        onClick={(e) => {
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                        }}>{item?.table_name} ( {item?.database_name}.{item?.schema_name} )</a></u></span>
                                                    <span className="critical-score">Criticality Score: <ColorDisplay value={item?.criticality_score ? Number(item?.criticality_score).toFixed(2) : null} size={'mini'} reverse={true}/></span>
                                                    <span className="p-l-20">
                                                        {
                                                            item?.connection_type === 'snowflake' ? (
                                                            <SnowflakeDatabaseIcon className='database-icon' />
                                                        ) : item?.connection_type === 'postresql' ? (
                                                            <PsqlDatabaseIcon className='database-icon' />
                                                        ) : (
                                                            <Database size={20} />
                                                        )}
                                                        {item?.connection_name?.toUpperCase() || `Connection`}
                                                    </span>
                                                    <span className="table-name">Incident {item?.incident_number}</span>
                                                </div>
                                                
                                            </div>
                                            <StatusButton incident_history={item?.incident_history} getIncidentData={getIncidentData}/>
                                        </div>
                                        <span className='bold p-l-20 p-t-10'>Impact Analysis</span>
                                        <div className='bottom'>
                                            <div className='left'>
                                                <span className='bold'>Usage Downstream</span>
                                                <span className="impact p-l-20"><u>{item?.impacted?.length || 'No'} downstream tables</u></span>
                                                {
                                                    item?.impacted?.map((iitem, iindex) => {
                                                        return <div key={`incident-${index}-${iindex}`} className='p-l-20'>
                                                            • {iitem?.database_name}.{iitem?.schema_name}.{iitem?.table_name}
                                                        </div>
                                                    })
                                                }
                                                <span className='bold'>{item?.queries_impacted} average daily queries</span>
                                            </div>
                                            <div className='right'>
                                                <FlowDiagram accountId={1} tableId={item?.table_id} zoomFlag={true}/>
                                            </div>
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    }
                </CardBody>
            </Card>
        </div>
    )
}

export default IncidentDetailPage
