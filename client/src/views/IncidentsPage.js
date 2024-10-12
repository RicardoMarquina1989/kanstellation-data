import {
  Card,
  CardHeader,
  CardBody,
  InputGroup,
  InputGroupText,
  Input,
  CardTitle
} from "reactstrap"
import { Search} from 'react-feather'
import '../App.css'
import axios from 'axios'

// ** MUI Imports
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useEffect, useState } from "react"
import loadingGif from '../assets/images/loading.gif'

import ColorDisplay from '../@core/components/widgets/color-display'
import StatusButton from "../@core/components/widgets/status-button"

const IncidentsPage = ({pathHistory}) => {
  const [search, setSearch] = useState('')
  const [searchINC, setSearchINC] = useState(null)
  const [expandId, setExpandId] = useState(-1)
  const [incidentData, setIncidentData] = useState([])
  const [backLoading, setBackLoading] = useState(false)
  const [toggleFilter, setToggleFilter] = useState('Open')
  const [noIncidentFlag, setNoIncidentFlag] = useState(true)

    useEffect(() => {
    setNoIncidentFlag(true)
  }, [toggleFilter])

  const getIncidentData = async (reloadFlag) => {
    const prevPath = pathHistory[pathHistory.length - 2]
    if (prevPath.includes('incident')) setToggleFilter(JSON.parse(localStorage.getItem('toggleFilter')))
    if (reloadFlag) setBackLoading(true)
    await axios.get(`/api/incident/all-incident`)
    .then((response) => {
      if (response?.data?.success) {
        const tempIncidnetData = response?.data?.data
        tempIncidnetData.sort((a, b) => {
          if (a.criticality_score > b.criticality_score) return -1
          if (a.criticality_score < b.criticality_score) return 1
          return 0
        })
        setIncidentData(tempIncidnetData)
      }
    })
    .catch((error) => console.log(error))
    .finally(() => {
      if (reloadFlag) setBackLoading(false)
    })
  }
  useEffect(() => {
    getIncidentData(true)
  }, [])

  const toggleHandleChange = (event, newAlignment) => {
    setToggleFilter(newAlignment)
    getIncidentData(true)
  }
  
  return (
    <div className="Home">
      <Card>
        <CardHeader>
          <CardTitle>Prioritized Incidents</CardTitle>
        </CardHeader>
        <CardBody>
          {
            backLoading ? <div className='loading-gif-container'>
              <img src={loadingGif} alt="Getting table data..." className='loading-gif' />
            </div> : <>
              <div className="top" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px'}}>
                  <InputGroup className='mb-1' style={{ width: '30%', minWidth: '250px' }}>
                    <InputGroupText>
                      <Search size={14} />
                    </InputGroupText>
                    <Input placeholder='Search impacted table...' value={search} onChange={(e) => setSearch(e.target.value)} />
                  </InputGroup>
                  <InputGroup className='mb-1' style={{ width: '150px' }}>
                    <InputGroupText>
                      <Search size={14} />
                    </InputGroupText>
                    <Input placeholder='Search INC' value={searchINC} onChange={(e) => setSearchINC(e.target.value)} type="number"/>
                  </InputGroup>
                </div>
                <ToggleButtonGroup
                  color="primary"
                  value={toggleFilter}
                  exclusive
                  onChange={toggleHandleChange}
                  aria-label="Platform"
                >
                  <ToggleButton value="Open">Open</ToggleButton>
                  <ToggleButton value="Solved">Solved</ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className="incident-container">
                {
                  incidentData?.map((item, index) => {
                    if (toggleFilter === 'Solved' && item?.incident_history[0]?.display_status !== 'Closed') return
                    if (toggleFilter === 'Open'   && item?.incident_history[0]?.display_status === 'Closed') return
                    if (noIncidentFlag) setNoIncidentFlag(false)

                    if (!item?.table_name?.toUpperCase()?.includes(search.toUpperCase()) && 
                        !item?.database_name?.toUpperCase()?.includes(search.toUpperCase()) &&
                        !item?.schema_name?.toUpperCase()?.includes(search.toUpperCase()) && 
                        !item?.impacted?.some(element => (
                          element?.database_name?.toUpperCase()?.includes(search.toUpperCase()) ||
                          element?.schema_name?.toUpperCase()?.includes(search.toUpperCase()) ||
                          element?.table_name?.toUpperCase()?.includes(search.toUpperCase())
                        ))
                    ) return

                    return <a className="incident-item normal" key={`incident-${index}`}  href={`/incident?incidentNumber=${item?.incident_number}`} onClick={() => {
                      localStorage.setItem('toggleFilter', JSON.stringify(toggleFilter))
                    }}>
                      <div className="left">
                        <div className="right">
                          <span className="title">Root Cause: <u><a href={`/my-data-table?tableId=${item?.table_id}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                            }}>{item?.table_name} ( {item?.database_name}.{item?.schema_name} )</a></u></span>
                          <span className="critical-score">Criticality Score: <ColorDisplay value={item?.criticality_score ? Number(item?.criticality_score).toFixed(2) : null} size={'mini'} reverse={true}/></span>
                          
                          <span className="impact" onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            if (expandId === index) setExpandId(-1)
                            else setExpandId(index)
                          }}><u>{item?.impacted?.length || 'No'} downstream tables impacted</u></span>
                          <div className={expandId === index ? "impact-items" : "hidden"}>
                            {item?.impacted?.map((iitem, iindex) => {
                              return <div key={`incident-${index}-${iindex}`}>
                                • {iitem?.database_name}.{iitem?.schema_name}.{iitem?.table_name}
                              </div>
                            })}
                          </div>

                          <span className="table-name">Incident {item?.incident_number}</span>
                        </div>
                      </div>

                      <StatusButton incident_history={item?.incident_history} getIncidentData={getIncidentData}/>

                    </a>
                  })
                }
                {
                  noIncidentFlag && (
                    <div className="incident-item">Good Job! No {toggleFilter} incidents</div>
                  )
                }
              </div>
            </>
          }
        </CardBody>
      </Card>
    </div>
  )
}

export default IncidentsPage
