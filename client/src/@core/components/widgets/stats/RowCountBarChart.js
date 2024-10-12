// ** Third Party Components
import PropTypes from 'prop-types'
import Chart from 'react-apexcharts'
import { getRoundedMaxValue } from '../../../../utility/Utils'

// ** Default Options
const defaultOptions = {
  chart: {
    type: 'bar',
    stacked: false,
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
  },
  colors: ['#4640e5'],
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
  tooltip: {
    x: {
        show: true,
        format: 'MM-dd'
    },
    y: {
      formatter: (val) => val.toLocaleString()
    }
  },
  title: {
    text: 'Row Count',
    align: 'center'
  },
  plotOptions: {
    bar: {
      borderRadius: .5
    }
  }
}

const RowCountBarChart = ({ data, height }) => {
  const series = [
    {
      name: "Row Count",
      data: data.map((item) => ({
        x: item.date,
        y: item.max
      }))
    }
  ]
  const maxValue = Math.max(...data.map((item) => item.max))

  return (
      <Chart
        options={{
          ...defaultOptions,
          yaxis: {
            show: true,
            labels: {
              formatter: (val) => val.toLocaleString()
            },
            min: 0,
            max: getRoundedMaxValue(maxValue)
          }
        }}
        series={series}
        type='bar'
        height={height ? height : 350}
      />
  )
}

export default RowCountBarChart

// ** PropTypes
RowCountBarChart.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.string
}
