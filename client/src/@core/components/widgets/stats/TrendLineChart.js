// ** Third Party Components
import PropTypes from 'prop-types'
import Chart from 'react-apexcharts'

// ** Reactstrap Imports
import { Card } from 'reactstrap'

// ** Default Options
const trendLineChartOptions = {
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
  colors: ["#9e16f8", "#ed5e53"],
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
      format: 'yyyy-MM-dd'
    }
  }
}

const TrendLineChart = ({ title, series, options, type, height, ...rest }) => {
  return (
    <Card outline {...rest}>
      <Chart
        options={{
          ...trendLineChartOptions,
          ...options,
          title: {
            text: title,
            align: 'left'
          }
        }}
        series={series}
        type={type}
        height={height ? height : 350}
      />
    </Card>
  )
}

export default TrendLineChart

// ** PropTypes
TrendLineChart.propTypes = {
  type: PropTypes.string,
  height: PropTypes.string,
  options: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  series: PropTypes.array.isRequired
}

// ** Default Props
TrendLineChart.defaultProps = {
  type: 'line'
}
