// ** Third Party Components
import PropTypes from 'prop-types'
import Chart from 'react-apexcharts'

function HMSToSeconds(hms) {
  const [hours, minutes, seconds] = hms.split(':').map(Number)
  return (hours * 3600) + (minutes * 60) + seconds
}

function secondsToHMS(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds - (hours * 3600)) / 60)
  // const seconds = totalSeconds - (hours * 3600) - (minutes * 60)

  // Padding each value to ensure it's at least two digits
  const paddedHours = String(hours).padStart(2, '0')
  const paddedMinutes = String(minutes).padStart(2, '0')
  // const paddedSeconds = String(seconds).padStart(2, '0')

  return `${paddedHours}:${paddedMinutes}` // :${paddedSeconds}
}

// ** Default Options
const defaultOptions = {
  chart: {
    type: 'line',
    stacked: false,
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
  },
  colors: ['#4640e5'],
  stroke: {
    curve: 'straight'
  },
  markers: {
    size: 1
  },
  axisBorder: {
    show: true
  },
  stroke: {
    width: 4
  },
  xaxis: {
    type: 'datetime',
    labels: {
      format: 'MM-dd'
    }
  },
  yaxis: {
    labels: {
      formatter: (val) => secondsToHMS(val)
    },
    tickAmount: 12,
    min: 0,
    max: 24 * 60 * 60
  },
  tooltip: {
    x: {
      show: true,
      format: 'MM-dd'
    },
    y: {
      formatter: (val) => secondsToHMS(val)
    }
  },
  title: {
    text: 'Freshness',
    align: 'center'
  }
}

const FreshnessLineChart = ({ data, height }) => {
  const series = [
    {
      name: "Time loaded",
      data: data.map((item) => ({
        x: item.date,
        y: HMSToSeconds(item.time_arrived)
      }))
    }
  ]

  return (
    <Chart
      options={{
        ...defaultOptions
      }}
      series={series}
      type='line'
      height={height ? height : 350}
    />
  )
}

export default FreshnessLineChart

// ** PropTypes
FreshnessLineChart.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.string
}
