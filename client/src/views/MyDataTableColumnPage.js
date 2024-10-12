import { Card, CardHeader, CardBody, CardTitle } from 'reactstrap'
import Button from '@mui/material/Button'
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Grid from '@mui/material/Grid'
import { useHistory } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ColorDisplay from '../@core/components/widgets/color-display'
import TrendLineChart from '../@core/components/widgets/stats/TrendLineChart'

import axios from 'axios'
import { convertNumberSystem, getRoundedMaxValue } from '../utility/Utils'
import loadingGif from '../assets/images/loading.gif'
import '../App.css'

let dailyInterval = null

const ConnectionsPage = () => {
  const history = useHistory()
  const [backLoading, setBackLoading] = useState(false)
  const [columnData, setColumnData] = useState({})
  const [trends, setTrends] = useState([])
  async function getColumnData() {
    setBackLoading(true)
    const columnId = JSON.parse(localStorage.getItem('columnId'))
    if (!columnId) history.push('/login')
    await axios.post(`/api/mydata/all-column`, { columnId })
      .then((response) => {
        if (response.data.success) {
          console.log("response.data", response)
          setColumnData(response.data?.data?.column)
          setTrends(response.data?.data?.columnExpectation?.filter(
            (item) => item.actual_value !== null && !isNaN(item.actual_value)
          ).map((item) => ({
            x: new Date(item.calendar_date).getTime(),
            y: Number(item.actual_value),
            column_measure: item.column_measure
          })))
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setBackLoading(false)
      })
  }

  useEffect(() => {
    getColumnData()
    dailyInterval = setInterval(() => {
      getColumnData()
    }, 24 * 60 * 60 * 1000)

    return () => {
      clearInterval(dailyInterval)
    }
  }, [])

  const nullTrendChartSeries = [
    {
      name: "Null %",
      data: trends.filter((item) => item.column_measure === 'null_percent').map((item) => ({
        ...item,
        y: item.y * 100
      }))
    }
  ]
  const nullTrendChartOptions = {
    yaxis: {
      show: true,
      min: 0,
      max: 100,
      labels: {
        show: true,
        formatter: (val) => `${parseInt(val)  }%`
      }
    },
    tooltip: {
      x: {
          show: true,
          format: 'yyyy-MM-dd'
      },
      y: {
        formatter: (val) => `${parseInt(val)  }%`
      }
    }
  }

  const minMaxTrendChartSeries = [
    {
      name: "max value",
      data: trends.filter((item) => item.column_measure === 'max_value')
    },
    {
      name: "min value",
      data: trends.filter((item) => item.column_measure === 'min_value')
    }
  ]
  const minMaxValues = trends.filter(
    (item) => ['max_value', 'min_value'].includes(item.column_measure)
  ).map((item) => item.y)
  const maxTrendValue = Math.max(...minMaxValues)
  const minMaxTrendChartOptions = {
    yaxis: {
      min: 0,
      max: getRoundedMaxValue(maxTrendValue || 0.8),
      labels: {
        show: true,
        formatter: (val) => convertNumberSystem(val)
      },
      forceNiceScale: true,
      tickAmount: 5
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      floating: true,
      offsetY: -15
    },
    tooltip: {
      x: {
          show: true,
          format: 'yyyy-MM-dd'
      },
      y: {
        formatter: (val) => convertNumberSystem(val)
      }
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle><span className='back-tag' onClick={() => history.push('/my-data')}><u>Tables</u></span>
            {' > '} <span className='back-tag' onClick={() => history.goBack()}><u>
              {columnData?.database_name || `Database`} . {columnData?.schema_name || `Schema`} . {columnData?.table_name || `Table`}
            </u></span>
            {' > '}  {columnData?.column_name || 'Column'}</CardTitle>
        </CardHeader>
        <CardBody>
          {
            backLoading ? <div className='loading-gif-container'>
              <img src={loadingGif} alt="Getting table data..." className='loading-gif' />
            </div> : <>
              <DialogTitle style={{ paddingTop: '0px', paddingBottom: '0px' }}>
                <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
                  <span className='bold-large'>
                    {columnData?.database_name || `Database`} . {columnData?.schema_name || `Schema`} . {columnData?.table_name || `Table`} . <span className='this'>{columnData?.column_name || 'Column'}</span>
                  </span>
                  
                </div>
                <span>{`Data Type: ${columnData?.data_type || 'Ddta Type'}`}</span>
                <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span>Column Reliability Score:</span>
                  <ColorDisplay value={JSON.parse(localStorage.getItem('columnScore')) ? parseFloat(JSON.parse(localStorage.getItem('columnScore'))).toFixed(2) : null} size={'large'} />
                </span>
              </DialogTitle>

              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TrendLineChart title="Daily Null % Trend" series={nullTrendChartSeries} options={nullTrendChartOptions} />
                  </Grid>
                  {minMaxValues.length ? <Grid item xs={12} sm={6}>
                    <TrendLineChart title="Min & Max Trends" series={minMaxTrendChartSeries} options={minMaxTrendChartOptions} />
                  </Grid> : null}
                </Grid>
              </DialogContent>
            </>
          }
          <DialogActions className='dialog-actions-dense'>
            <Button onClick={() => history.goBack()} variant="outlined" color='error'>Back</Button>
          </DialogActions>
        </CardBody>
      </Card>
    </div>
  )
}

export default ConnectionsPage
