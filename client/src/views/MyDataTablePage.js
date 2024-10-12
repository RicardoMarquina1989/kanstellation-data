import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Input,
  Row,
  Col,
  InputGroup,
  InputGroupText
} from "reactstrap"
import { ChevronDown, Search, Database, MoreVertical } from "react-feather"
import "../App.css"
import Button from "@mui/material/Button"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Grid from "@mui/material/Grid"
import { useHistory, useLocation } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import DataTable from "react-data-table-component"
import ReactPaginate from "react-paginate"
import axios from "axios"
import "@styles/react/apps/app-invoice.scss"
import "@styles/react/libs/tables/react-dataTable-component.scss"
import loadingGif from "../assets/images/loading.gif"
import ColorDisplay from "../@core/components/widgets/color-display"
import { ReactComponent as SnowflakeDatabaseIcon } from "../assets/images/icons/database/snowflake.svg"
import { ReactComponent as PsqlDatabaseIcon } from "../assets/images/icons/database/postgresql.svg"
import Box from "@mui/material/Box"
import CustomTabPanel from "../@core/components/custom-tab-panel"
import AddIcon from "@mui/icons-material/Add"
import AssignmentIcon from "@mui/icons-material/Assignment"
import PieChartIcon from "@mui/icons-material/PieChart"
import FlowDiagram from '../@core/components/widgets/flow-diagram'

const moment = require("moment")

import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryZoomContainer,
  VictoryBrushContainer,
  VictoryScatter,
  VictoryTooltip
} from "victory"
import { IconButton } from "@mui/material"
import RowCountBarChart from "../@core/components/widgets/stats/RowCountBarChart"
import FreshnessLineChart from "../@core/components/widgets/stats/FreshnessLineChart"

function createData(
  columnId,
  columnName,
  columnScore,
  dataType,
  ordinalPosition,
  tableId
) {
  return {
    columnId,
    columnName,
    columnScore: Number(columnScore),
    dataType,
    ordinalPosition,
    tableId
  }
}

function qualityLevel(percentage) {
  if (percentage < 35) return "low"
  else if (percentage < 70) return "medium"
  return "high"
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  }
}

function formatRelativeDate(dateString) {
  const tableLastUpdate = moment(dateString)
  const now = moment()

  const diffInDays = now.diff(tableLastUpdate, "days")

  if (tableLastUpdate.isSame(now, "day")) {
    return "Today"
  } else if (
    diffInDays === 1 ||
    tableLastUpdate.isSame(now.clone().subtract(1, "day"), "day")
  ) {
    return "Yesterday"
  } else if (diffInDays < 29) {
    return `${diffInDays} days ago`
  } else if (tableLastUpdate.isSame(now, "month")) {
    return "This month"
  } else if (
    tableLastUpdate.isSame(now.clone().subtract(1, "month"), "month")
  ) {
    return "Last month"
  } else if (tableLastUpdate.isSame(now, "year")) {
    return "This year"
  } else if (tableLastUpdate.isSame(now.clone().subtract(1, "year"), "year")) {
    return "Last year"
  } else if (tableLastUpdate.isBefore(now.clone().subtract(2, "years"))) {
    return tableLastUpdate.format("M(MMM)/DD/YYYY")
  } else {
    // Handle other cases or fallback to a default format
    return tableLastUpdate.format("M(MMM)/DD/YYYY")
  }
}

const ConnectionsPage = () => {
  const [backLoading, setBackLoading] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tableId = searchParams.get("tableId")
  const accountId = 1
  const [columnsTableRef, setColumnsTableRef] = useState({})
  const [allColumnData, setAllColumnData] = useState([])
  const [allMonitorRows, setAllMonitorRows] = useState([])
  const [activeRows, setActiveRows] = useState([])
  const [dispRows, setDispRows] = useState([])
  const [columnSortType, setColumnSortType] = useState("asc")
  const [sortByColumn, setSortByColumn] = useState("columnScore")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [zoomDomain, setZoomDomain] = useState({
    x: [new Date(2023, 1, 1), new Date(2024, 1, 1)]
  })
  const [chartData, setChartData] = useState([])
  const [search, setSearch] = useState("")
  const [detailDate, setDetailDate] = useState(false)
  const [isTabsFixed, setTabsFixed] = useState(false)
  const [rowCountChartData, setRowCountChartData] = useState([])
  const [freshnessChartData, setFreshnessChartData] = useState([])

  const tabsContainerRef = useRef(null)

  // TabValue default is 1 because it sets the initial tab to "columns"
  const [tabValue, setTabValue] = useState(1)

  async function fetchTableData() {
    setBackLoading(true)
    if (!tableId || !accountId) history.push('/login')
    await axios.post(`/api/mydata/all-table`, { accountId, tableId })
      .then((response) => {
        if (response.data.success) {
          const tempRows = []
          response.data?.data?.table?.forEach((item) => {
            tempRows.push(
              createData(
                item?.column_id,
                item?.column_name,
                item?.column_score,
                item?.data_type,
                item?.ordinal_position,
                item?.table_id
              )
            )
          })
          setColumnsTableRef(response.data?.data?.ref)
          setAllColumnData([...tempRows])
          const tempChartData = []
          let lastCalenderDate = new Date(2001, 1, 1)
          response.data?.data?.scoreArray.forEach((item) => {
            tempChartData.push({
              score_value: Number(item?.score_value),
              calendar_date: new Date(item?.calendar_date)
            })
            const itemCalendarDate = new Date(item?.calendar_date)
            if (itemCalendarDate > lastCalenderDate) {
              lastCalenderDate = itemCalendarDate
            }
          })
          const thirtyDaysBefore = new Date(lastCalenderDate)
          thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30)
          setZoomDomain({
            x: [new Date(thirtyDaysBefore), new Date(lastCalenderDate)]
          })
          setChartData(tempChartData)
          setRowCountChartData(response.data?.data?.rowCountArray)
          setFreshnessChartData(response.data?.data?.freshnessArray)
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setBackLoading(false)
      })
  }

  useEffect(() => {
    const handleScroll = () => {
      /**
       * @type {HTMLDivElement}
       */
      const component = tabsContainerRef.current

      if (component === null) {
        return
      }

      const boundingBox = component.parentElement.getBoundingClientRect()

      if (boundingBox.top <= 0) {
        setTabsFixed(true)
      } else {
        setTabsFixed(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  async function fetchMonitorData() {
    // FIXME: Connect to real data fetch for monitors
    const dummyData = [
      {
        name: "Monitor #1",
        lastStatus: true
      },
      {
        name: "Monitor #2",
        lastStatus: true
      },
      {
        name: "Monitor #3",
        lastStatus: false
      },
      {
        name: "Monitor #4",
        lastStatus: false
      },
      {
        name: "Monitor #5",
        lastStatus: true
      }
    ]

    setAllMonitorRows(dummyData)
  }

  useEffect(() => {
    fetchTableData()
    fetchMonitorData()
  }, [])

  // Handle tab change - reset pagination state
  useEffect(() => {
    setCurrentPage(1)
    setColumnSortType("asc")
    setSearch("")
    setRowsPerPage(10)

    if (tabValue === 0) {
      setSortByColumn("name")
      setActiveRows(allMonitorRows)
    } else if (tabValue === 1) {
      setSortByColumn("columnScore")
      setActiveRows(allColumnData)
    }
  }, [tabValue, allColumnData, allMonitorRows])

  function getData(config) {
    const { perPage = 10, page = 1, sort, sortColumn } = config

    const dataAsc = activeRows?.sort((a, b) => {
      if (typeof a[sortColumn] === "string") {
        return a[sortColumn].localeCompare(b[sortColumn])
      } else {
        return a[sortColumn] - b[sortColumn]
      }
    })
    const dataToDisp = sort === "asc" ? dataAsc : [...dataAsc].reverse()
    const paginateArray = (array, perPage, page) => {
      return array.slice((page - 1) * perPage, page * perPage)
    }
    const tempDispRows =
      dataToDisp.length <= perPage ? dataToDisp : paginateArray(dataToDisp, perPage, page)

    setDispRows([...tempDispRows])
  }

  async function setRowsBySearch() {
    const tempRows = []
    if (tabValue === 0) {
      allMonitorRows.forEach((row) => {
        if (row?.name.toLowerCase().includes(search.toLowerCase())) {
          tempRows.push(row)
        }
      })
    } else if (tabValue === 1) {
      allColumnData.forEach((row) => {
        if (row?.columnName.toLowerCase().includes(search.toLowerCase())) {
          tempRows.push(row)
        }
      })
    }
    setDispRows([...tempRows])
  }

  useEffect(() => {
    setRowsBySearch()
  }, [search, activeRows])

  useEffect(() => {
    console.debug("activeRows: ", activeRows)
  }, [activeRows])

  useEffect(() => {
    getData({
      sort: columnSortType,
      sortColumn: sortByColumn,
      page: currentPage,
      perPage: rowsPerPage
    })
  }, [activeRows, rowsPerPage])

  const handlePerPage = (e) => {
    getData({
      sort: columnSortType,
      sortColumn: sortByColumn,
      page: currentPage,
      perPage: parseInt(e.target.value)
    })
    setRowsPerPage(parseInt(e.target.value))
  }

  const handlePagination = (page) => {
    getData({
      sort: columnSortType,
      sortColumn: sortByColumn,
      page: page.selected + 1,
      perPage: rowsPerPage
    })
    setCurrentPage(page.selected + 1)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const CustomHeader = ({ handlePerPage, rowsPerPage, totalCount }) => {
    return (
      <div className="invoice-list-table-header w-100 py-2">
        <Row>
          <Col className="d-flex align-items-center px-0 px-lg-1">
            <div className="d-flex align-items-center me-2">
              <label htmlFor="rows-per-page">Show</label>
              <Input
                type="select"
                id="rows-per-page"
                value={rowsPerPage}
                onChange={handlePerPage}
                className="form-control ms-50 pe-3"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </Input>
            </div>
            <div>
              {totalCount} {totalCount > 2 ? "Results" : "Result"}
            </div>
          </Col>
        </Row>
      </div>
    )
  }

  const CustomPagination = () => {
    let count = Math.floor(activeRows.length / rowsPerPage)
    const rest = activeRows.length % rowsPerPage
    if (rest > 0) count++
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <CustomHeader
          rowsPerPage={rowsPerPage}
          handlePerPage={handlePerPage}
          totalCount={activeRows.length}
        />
        <ReactPaginate
          nextLabel=""
          breakLabel="..."
          previousLabel=""
          pageCount={count || 1}
          activeClassName="active"
          breakClassName="page-item"
          pageClassName={"page-item"}
          breakLinkClassName="page-link"
          nextLinkClassName={"page-link"}
          pageLinkClassName={"page-link"}
          nextClassName={"page-item next"}
          previousLinkClassName={"page-link"}
          previousClassName={"page-item prev"}
          onPageChange={(page) => handlePagination(page)}
          forcePage={currentPage !== 0 ? currentPage - 1 : 0}
          containerClassName={
            "pagination react-paginate justify-content-end p-1"
          }
        />
      </div>
    )
  }

  const columnDataToRender = () => {
    if (dispRows.length > 0) {
      return dispRows
    } else if (dispRows.length === 0) {
      return []
    } else {
      return dispRows.slice(0, rowsPerPage)
    }
  }

  const handleSort = (column, sortDirection) => {
    setColumnSortType(sortDirection)
    setSortByColumn(column.sortField)
    getData({
      page: currentPage,
      sort: sortDirection,
      perPage: rowsPerPage,
      sortColumn: column.sortField
    })
  }

  const handleColumnSelectionRowClick = (row) => {
    localStorage.setItem("columnId", JSON.stringify(row?.columnId))
    localStorage.setItem("columnScore", JSON.stringify(row?.columnScore))
    history.push("/my-data-table-column")
  }

  /**
   * @type {import("react-data-table-component").TableColumn<any>[]}
   */
  const sqlMonitorColumns = [
    {
      name: "SQL Monitor",
      sortable: true,
      cell: (row) => (
        <Box sx={{ display: "flex", flexDirection: "row", gap: 4 }}>
          <AssignmentIcon />
          <u>
            <b>{row?.name}</b>
          </u>
        </Box>
      )
    },
    {
      name: "Last Status",
      sortable: true,
      selector: (row) => (row?.lastStatus ? "Success" : "Failed")
    },
    {
      name: "Success Rate",
      cell: (row) => (
        <span
          className="hover-blue full-content"
          onClick={() => handleColumnSelectionRowClick(row)}
        >
          <IconButton aria-label="delete">
            <PieChartIcon />
          </IconButton>
        </span>
      )
    }
  ]

  const ColumnsDataTableColumns = [
    {
      name: "Column Score",
      sortable: true,
      sortField: 'columnScore',
      cell: row => <ColorDisplay value={row?.columnScore ? parseFloat(row?.columnScore).toFixed(2) : null} />
    },
    {
      name: "Column",
      sortable: true,
      sortField: "columnName",
      cell: (row) => (
        <span
          className="hover-blue full-content"
          onClick={() => handleColumnSelectionRowClick(row)}
        >
          <b>{row?.columnName}</b>
        </span>
      )
    },
    {
      name: "Data Type",
      sortable: true,
      sortField: "dataType",
      cell: (row) => (
        <span onClick={() => handleColumnSelectionRowClick(row)}>
          {row?.dataType}
        </span>
      )
    }
  ]

  const minDate = new Date(
    Math.min(...chartData.map((d) => new Date(d.calendar_date)))
  )
  const maxDate = new Date(
    Math.max(...chartData.map((d) => new Date(d.calendar_date)))
  )

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle><span className='back-tag' onClick={() => history.push('/my-data')}><u>Tables</u></span> {' > '}
            {columnsTableRef ? columnsTableRef?.database_name : `Database`} . {columnsTableRef ? columnsTableRef?.schema_name : `Schema`} . {columnsTableRef ? columnsTableRef?.table_name : `Table`}
          </CardTitle>
        </CardHeader>
        <CardBody>
          {backLoading ? (
            <div className="loading-gif-container">
              <img
                src={loadingGif}
                alt="Getting table data..."
                className="loading-gif"
              />
            </div>
          ) : (
            <>
              <DialogTitle style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap"
                  }}
                >
                  <span className="bold-large">
                    {columnsTableRef ? columnsTableRef?.database_name : `Database`} .{" "}
                    {columnsTableRef ? columnsTableRef?.schema_name : `Schema`} .{" "}
                    <span className="this">
                      {columnsTableRef ? columnsTableRef?.table_name : `Table`}
                    </span>
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "5px",
                      alignItems: "center",
                      marginLeft: "auto"
                    }}
                  >
                    <span>Table Reliability Score:</span>
                    <ColorDisplay value={columnsTableRef?.table_score ? Number(columnsTableRef?.table_score).toFixed(2) : null} size={'large'} />
                  </div>                  
                </div>
                <span
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      borderLeft: "3px solid #4640e5",
                      paddingLeft: "20px",
                      fontSize: "smaller"
                    }}
                  >
                    <span>
                      {columnsTableRef?.connection_type === "snowflake" ? (
                        <SnowflakeDatabaseIcon className="database-icon" />
                      ) : columnsTableRef?.connection_type === "postresql" ? (
                        <PsqlDatabaseIcon className="database-icon" />
                      ) : (
                        <Database size={20} />
                      )}
                      {columnsTableRef ? columnsTableRef?.connection_name?.toUpperCase() : `Connection`}
                    </span>
                    <span>
                      {`Created on :`}{" "}
                      {`${moment(columnsTableRef?.table_created_on).format(
                        `MMMM DD, YYYY`
                      )}`}
                    </span>
                    <span
                      onMouseOver={() => setDetailDate(true)}
                      onMouseLeave={() => setDetailDate(false)}
                      style={{ position: "relative" }}
                    >
                      {`Last Updated :`}{" "}
                      {`${formatRelativeDate(columnsTableRef?.table_last_upd)}`}
                      <div
                        className={
                          detailDate ? "detail-date" : "detail-date hidden"
                        }
                      >{`${moment(columnsTableRef?.table_last_upd).format(
                        `MMMM DD, YYYY, h:mm A [${
                          JSON.parse(localStorage.getItem("userData"))
                            ?.timezone || "EST"
                        }]`
                      )}`}</div>
                    </span>
                  </span>
                </span>
              </DialogTitle>
              <DialogContent style={{ position: "relative" }}>
                <Box>
                  <Box
                    sx={[
                      { borderBottom: 1, borderColor: "divider" },
                      // TODO: Better solution will be required for scroll fixed tabs
                      isTabsFixed ? {
                            position: "fixed",
                            top: "80px",
                            zIndex: 10000,
                            backgroundColor: "white",
                            width: "100%"
                          } : {}
                    ]}
                    ref={tabsContainerRef}
                  >
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      aria-label="basic tabs"
                    >
                      <Tab label="Table Health" {...a11yProps(0)} />
                      <Tab label="Columns" {...a11yProps(1)} />
                      <Tab label="Lineage" {...a11yProps(2)} />
                    </Tabs>
                  </Box>
                  <CustomTabPanel value={tabValue} index={0}>
                    <Grid container spacing={8}>
                      <Grid item xs={5}>
                        <div className="chart-box" xs={6}>
                          <CardTitle style={{ textAlign: "center" }}>
                            <span>Table Reliability Trend</span>
                          </CardTitle>
                          <VictoryChart
                            width={600}
                            height={400}
                            scale={{ x: "time", y: "linear" }}
                            padding={{
                              top: 0,
                              left: 50,
                              right: 50,
                              bottom: 30
                            }}
                            containerComponent={
                              <VictoryZoomContainer
                                zoomDimension="x"
                                zoomDomain={zoomDomain}
                                onZoomDomainChange={setZoomDomain}
                              />
                            }
                            domain={{ y: [0, 102] }}
                          >
                            <VictoryAxis
                              tickFormat={(x) => new Date(x).toLocaleDateString()
                              }
                              style={{
                                axis: { stroke: "black" },
                                ticks: { stroke: "black", size: 5 },
                                tickLabels: { fontSize: 14, padding: 5 },
                                grid: { stroke: "rgba(0, 0, 0, 0.2)" } // Set the grid color and style
                              }}
                            />

                            <VictoryAxis
                              dependentAxis
                              style={{
                                axis: { stroke: "black" },
                                ticks: { stroke: "black", size: 5 },
                                tickLabels: { fontSize: 13, padding: 5 },
                                grid: { stroke: "rgba(0, 0, 0, 0.2)" } // Set the grid color and style
                              }}
                            />
                            <VictoryLine
                              style={{
                                data: { stroke: "rgb(44 160 191)" }
                              }}
                              data={chartData}
                              x="calendar_date"
                              y="score_value"
                              animate={{ duration: 500 }}
                            />
                            <VictoryScatter
                              style={{ data: { fill: "rgb(17 80 97)" } }}
                              size={3}
                              hitboxRadius={10}
                              data={chartData}
                              x="calendar_date"
                              y="score_value"
                              labels={({ datum }) => `Date: ${datum.calendar_date.toLocaleDateString()}\nQuality Score: ${Number(
                                  datum.score_value
                                ).toFixed(2)}\nQuality Level: ${qualityLevel(
                                  datum.score_value
                                )}`
                              }
                              labelComponent={
                                <VictoryTooltip
                                  renderInPortal={true}
                                  cornerRadius={5}
                                  flyoutStyle={{
                                    fill: "rgba(225, 225, 225, 0.9)",
                                    stroke: "rgba(0, 0, 0, 0.1)",
                                    strokeWidth: 1
                                  }}
                                  textAnchor="start" // Align text to the left
                                  verticalAnchor="middle" // Center text vertically
                                />
                              }
                              animate={{ duration: 500 }}
                            />
                          </VictoryChart>
                          <VictoryChart
                            padding={{
                              top: 0,
                              left: 50,
                              right: 50,
                              bottom: 40
                            }}
                            width={600}
                            height={130}
                            scale={{ x: "time", y: "linear" }}
                            containerComponent={
                              <VictoryBrushContainer
                                brushDimension="x"
                                brushDomain={zoomDomain}
                                onBrushDomainChange={setZoomDomain}
                              />
                            }
                            domain={{ y: [0, 102] }}
                          >
                            <VictoryAxis
                              tickFormat={(x) => {
                                const date = new Date(x)
                                const day = date
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0")
                                const month = (date.getMonth() + 1)
                                  .toString()
                                  .padStart(2, "0") // +1 because months are zero indexed
                                const year = date.getFullYear()
                                return `${day}/${month}/${year}`
                              }}
                              tickValues={[minDate, maxDate]} // Set the custom tick values
                            />
                            <VictoryLine
                              style={{
                                data: { stroke: "rgb(97, 218, 251)" }
                              }}
                              data={chartData}
                              x="calendar_date"
                              y="score_value"
                              animate={{ duration: 500 }}
                            />
                          </VictoryChart>
                        </div>
                      </Grid>
                      <Grid item xs={7}>
                        <Button variant="contained" startIcon={<AddIcon />}>
                          SQL Monitor
                        </Button>
                        <DataTable
                          columns={sqlMonitorColumns}
                          noHeader
                          pagination
                          paginationServer
                          sortServer
                          responsive
                          className="react-dataTable"
                          paginationDefaultPage={currentPage}
                          data={columnDataToRender()}
                          paginationComponent={CustomPagination}
                          sortIcon={<ChevronDown style={{ color: "black" }} />}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} className="mt-2">
                      <Grid item xs={12} sm={6}>
                        <RowCountBarChart data={rowCountChartData} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FreshnessLineChart data={freshnessChartData} />
                      </Grid>
                    </Grid>
                  </CustomTabPanel>
                  <CustomTabPanel value={tabValue} index={1}>
                    <Grid item xs={6}>
                      <InputGroup
                        className="mb-1"
                        style={{ width: "fit-content" }}
                      >
                        <InputGroupText>
                          <Search size={14} />
                        </InputGroupText>
                        <Input
                          placeholder="Search Columns"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </InputGroup>
                      <div className="invoice-list-wrapper">
                        <Card>
                          <div className="invoice-list-dataTable react-dataTable">
                            <DataTable
                              noHeader
                              pagination
                              sortServer
                              paginationServer
                              subHeader={true}
                              columns={ColumnsDataTableColumns}
                              responsive={true}
                              onSort={handleSort}
                              data={columnDataToRender()}
                              sortIcon={
                                <ChevronDown style={{ color: "black" }} />
                              }
                              className="react-dataTable"
                              defaultSortField="invoiceId"
                              paginationDefaultPage={currentPage}
                              paginationComponent={CustomPagination}
                              onRowClicked={(row) => handleColumnSelectionRowClick(row)
                              }
                            />
                          </div>
                        </Card>
                      </div>
                    </Grid>
                  </CustomTabPanel>
                  <CustomTabPanel value={tabValue} index={2}>
                    <FlowDiagram accountId={1} tableId={tableId} zoomFlag={false}/>
                  </CustomTabPanel>
                </Box>
              </DialogContent>
            </>
          )}

          <DialogActions className="dialog-actions-dense">
            <Button
              onClick={() => history.push("/my-data")}
              variant="outlined"
              color="error"
            >
              Back
            </Button>
          </DialogActions>
        </CardBody>
      </Card>
    </div>
  )
}

export default ConnectionsPage
