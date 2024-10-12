import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Input,
  Row,
  Col
} from "reactstrap"
import { Search, ChevronDown } from "react-feather"
import InputAdornment from "@mui/material/InputAdornment"
import TextField from "@mui/material/TextField"
import IconButton from "@mui/material/IconButton"
import ClearIcon from "@mui/icons-material/Clear"
import Grid from "@mui/material/Grid"
import Autocomplete from "@mui/material/Autocomplete"
import { useHistory } from "react-router-dom"
import { React, useEffect, useState } from "react"
import axios from "axios"
import Checkbox from "@mui/material/Checkbox"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import DataTable from "react-data-table-component"
import ReactPaginate from "react-paginate"
import "@styles/react/apps/app-invoice.scss"
import "@styles/react/libs/tables/react-dataTable-component.scss"
import ColorDisplay from "../@core/components/widgets/color-display"
import loadingGif from "../assets/images/loading.gif"
import "../App.css"
import { ReactComponent as SnowflakeDatabaseIcon } from "../assets/images/icons/database/snowflake.svg"

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />


function createData(
  connection,
  connectionId,
  database,
  databaseId,
  schema,
  schemaId,
  table,
  tableId,
  score
) {
  return {
    connection,
    connectionId,
    database,
    databaseId,
    schema,
    schemaId,
    table,
    tableId,
    score: Number(score)
  }
}

function arrayInclude(arr, str) {
  if (arr.includes(str)) return true
  return false
}

const ConnectionsPage = ({ pathHistory }) => {
  const history = useHistory()
  const [search, setSearch] = useState("")
  const [allData, setAllData] = useState([])
  const [rows, setRows] = useState([])
  const [filterRows, setFilterRows] = useState([])
  const [dispFilterRows, setDispFilterRows] = useState([])
  const [backLoading, setBackLoading] = useState(false)
  const [connectionFilter, setConnectionFilter] = useState([])
  const [databaseFilter, setDatabaseFilter] = useState([])
  const [schemaFilter, setSchemaFilter] = useState([])
  const [tableFilter, setTableFilter] = useState([])
  const [defaultScoreFilter, setDefaultScoreFilter] = useState([
    "00.00 ~ 35.00",
    "35.00 ~ 70.00",
    "70.00 ~ 100.00"
  ])
  const [defaultScoreFilterData, setDefaultScoreFilterData] = useState([])
  const [scoreFilter, setScoreFilter] = useState([])

  const [connectionFilterIO, setConnectionFilterIO] = useState([])
  const [databaseFilterIO, setDatabaseFilterIO] = useState([])
  const [schemaFilterIO, setSchemaFilterIO] = useState([])
  const [tableFilterIO, setTableFilterIO] = useState([])
  const [scoreFilterIO, setScoreFilterIO] = useState([])

  const [connectionFilterDisplay, setConnectionFilterDisplay] = useState("No selected")
  const [databaseFilterDisplay, setDatabaseFilterDisplay] = useState("No selected")
  const [schemaFilterDisplay, setSchemaFilterDisplay] = useState("No selected")
  const [tableFilterDisplay, setTableFilterDisplay] = useState("No selected")
  const [scoreFilterDisplay, setScoreFilterDisplay] = useState("No selected")

  const [sort, setSort] = useState("asc")
  const [sortColumn, setSortColumn] = useState("score")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    const value = connectionFilterIO
    setConnectionFilterDisplay(value.length === 0 ? "No selected" : value.includes("Select-all") ? "All selected" : `${value.length} selected`)
  }, [connectionFilterIO])
  useEffect(() => {
    const value = databaseFilterIO
    setDatabaseFilterDisplay(value.length === 0 ? "No selected" : value.includes("Select-all") ? "All selected" : `${value.length} selected`)
  }, [databaseFilterIO])
  useEffect(() => {
    const value = schemaFilterIO
    setSchemaFilterDisplay(value.length === 0 ? "No selected" : value.includes("Select-all") ? "All selected" : `${value.length} selected`)
  }, [schemaFilterIO])
  useEffect(() => {
    const value = tableFilterIO
    setTableFilterDisplay(value.length === 0 ? "No selected" : value.includes("Select-all") ? "All selected" : `${value.length} selected`)
  }, [tableFilterIO])
  useEffect(() => {
    const value = scoreFilterIO
    setScoreFilterDisplay(value.length === 0 ? "No selected" : value.includes("Select-all") ? "All selected" : `${value.length} selected`)
  }, [scoreFilterIO])

  function setTempScoreFilter(score) {
    let i = 0
    for (const filterItem of defaultScoreFilterData) {
      if (
        Number(filterItem.min_range) <= score &&
        score < Number(filterItem.max_range)
      ) return defaultScoreFilter[i]
      i++
    }
    return null
  }

  function sortScoreFilter(arrayToSort) {
    const order = ["Select", "Low", "Medium", "High"]
    function indexOfSubstring(array, mainString) {
        for (let i = 0; i < array.length; i++) {
            if (mainString.includes(array[i])) return i
        }
        return -1
    }
    const sortedArray = arrayToSort.sort((a, b) => {
        return indexOfSubstring(order, a) - indexOfSubstring(order, b)
    })
    return sortedArray
  }

  async function setRowsBySearch() {
    const tempRows = []
    const tempConnectionFilter = []
    const tempDatabaseFilter = []
    const tempSchemaFilter = []
    const tempTableFilter = []
    const tempScoreFilter = []
    allData.forEach((row) => {
      if (
        row?.connection.toLowerCase().includes(search.toLowerCase()) ||
        row?.database.toLowerCase().includes(search.toLowerCase()) ||
        row?.schema.toLowerCase().includes(search.toLowerCase()) ||
        row?.table.toLowerCase().includes(search.toLowerCase())
      ) {
        tempRows.push(row)
        if (!arrayInclude(tempConnectionFilter, row?.connection)) tempConnectionFilter.push(row?.connection)
        if (!arrayInclude(tempDatabaseFilter, row?.database)) tempDatabaseFilter.push(row?.database)
        if (!arrayInclude(tempSchemaFilter, row?.schema)) tempSchemaFilter.push(row?.schema)
        if (!arrayInclude(tempTableFilter, row?.table)) tempTableFilter.push(row?.table)

        const tempDefaultScoreFilter = setTempScoreFilter(row?.score)
        if (
          !arrayInclude(tempScoreFilter, tempDefaultScoreFilter) &&
          tempDefaultScoreFilter
        ) tempScoreFilter.push(tempDefaultScoreFilter)
      }
    })
    setRows([...tempRows])
    setConnectionFilter([...tempConnectionFilter])
    setDatabaseFilter([...tempDatabaseFilter])
    setSchemaFilter([...tempSchemaFilter])
    setTableFilter([...tempTableFilter])
    setScoreFilter([...sortScoreFilter(tempScoreFilter)])
    setConnectionFilterIO(["Select-all", ...tempConnectionFilter])
    setDatabaseFilterIO(["Select-all", ...tempDatabaseFilter])
    setSchemaFilterIO(["Select-all", ...tempSchemaFilter])
    setTableFilterIO(["Select-all", ...tempTableFilter])
    setScoreFilterIO(["Select-all", ...tempScoreFilter])
  }

  function getData(config) {
    const { perPage = 10, page = 1, sort, sortColumn } = config
    const dataAsc = filterRows?.sort((a, b) => {
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
    const tempDispFilterRows =
      dataToDisp.length <= perPage ? dataToDisp : paginateArray(dataToDisp, perPage, page)

    setDispFilterRows([...tempDispFilterRows])
  }

  const handleSort = (column, sortDirection) => {
    setSort(sortDirection)
    setSortColumn(column.sortField)
    getData({
      page: currentPage,
      sort: sortDirection,
      perPage: rowsPerPage,
      sortColumn: column.sortField
    })
  }

  async function getMyData() {
    setBackLoading(true)
    let isMounted = true
    await axios
      .get(`/api/mydata/all-mydata`)
      .then((response) => {
        if (response.data.success) {
          const tempRows = []
          response.data.data?.forEach((item) => {
            tempRows.push(
              createData(
                item?.connection_name,
                item?.connection_id,
                item?.database_name,
                item?.database_id,
                item?.schema_name,
                item?.schema_id,
                item?.table_name,
                item?.table_id,
                item?.table_score
              )
            )
          })
          if (isMounted) setAllData([...tempRows])

          const tempDefaultScoreFilter = []
          response.data.scoreFilters?.forEach((scoreFilter) => {
            tempDefaultScoreFilter.push(
              `${scoreFilter?.score_level} (${Number(
                scoreFilter?.min_range
              ).toFixed(2)}-${Number(scoreFilter?.max_range).toFixed(2)}%)`
            )
          })
          setDefaultScoreFilter([...tempDefaultScoreFilter])
          setDefaultScoreFilterData([...response.data.scoreFilters])

          const tempConnectionFilterIO = []
          const tempDatabaseFilterIO = []
          const tempSchemaFilterIO = []
          const tempTableFilterIO = []
          tempRows?.forEach((tempRow) => {
            if (!tempConnectionFilterIO.includes(tempRow.connection)) tempConnectionFilterIO.push(tempRow.connection)
            if (!tempDatabaseFilterIO.includes(tempRow.database)) tempDatabaseFilterIO.push(tempRow.database)
            if (!tempSchemaFilterIO.includes(tempRow.schema)) tempSchemaFilterIO.push(tempRow.schema)
            if (!tempTableFilterIO.includes(tempRow.table)) tempTableFilterIO.push(tempRow.table)
          })
          const lastSyncTime = response.data?.lastSyncTime

          const prevSyncTime = localStorage.getItem("lastSyncTime")
          const prevFilter = JSON.parse(localStorage.getItem("filter"))
          const prevSort = JSON.parse(localStorage.getItem("sort"))
          const prevSearch = JSON.parse(localStorage.getItem("search")) || ""

          const prevPath = pathHistory[pathHistory.length - 2]

          if (
            lastSyncTime === prevSyncTime &&
            prevFilter &&
            prevPath.includes("my-data")
          ) {
            setConnectionFilterIO(prevFilter?.connectionFilterIO)
            setDatabaseFilterIO(prevFilter?.databaseFilterIO)
            setSchemaFilterIO(prevFilter?.schemaFilterIO)
            setTableFilterIO(prevFilter?.tableFilterIO)
            setScoreFilterIO(prevFilter?.scoreFilterIO)

            setSort(prevSort?.sort)
            setSortColumn(prevSort?.sortColumn)
            setSearch(prevSearch)
          } else {
            setConnectionFilterIO(["Select-all", ...tempConnectionFilterIO])
            setDatabaseFilterIO(["Select-all", ...tempDatabaseFilterIO])
            setSchemaFilterIO(["Select-all", ...tempSchemaFilterIO])
            setTableFilterIO(["Select-all", ...tempTableFilterIO])
          }
          localStorage.setItem("lastSyncTime", lastSyncTime)
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setBackLoading(false)
      })
    return () => {
      isMounted = false
    }
  }

  function arraysAreEqual(array1, array2) {
    if (array2[0] === "Select-all") array2.shift()
    if (array1.length !== array2.length) {
      return false
    }
    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false
      }
    }
    return true
  }

  useEffect(() => {
    const tempRows = []
    rows.forEach((item) => {
      if (
        connectionFilterIO.includes(item?.connection) &&
        databaseFilterIO.includes(item?.database) &&
        schemaFilterIO.includes(item?.schema) &&
        tableFilterIO.includes(item?.table)
      ) {
        tempRows.push(item)
      }
    })
    setFilterRows([...tempRows])
  }, [connectionFilterIO, databaseFilterIO, schemaFilterIO, tableFilterIO])
  useEffect(async () => {
    if (!localStorage.getItem("userData")) history.push("/login")
    await getMyData()
  }, [])
  useEffect(() => {
    setRowsBySearch()
  }, [search, allData, defaultScoreFilterData])

  useEffect(() => {
    getData({
      sort,
      sortColumn,
      page: currentPage,
      perPage: rowsPerPage
    })
  }, [filterRows.length, rowsPerPage, sort, sortColumn])

  const handlePerPage = (e) => {
    getData({
      sort,
      sortColumn,
      page: currentPage,
      perPage: parseInt(e.target.value)
    })
    setRowsPerPage(parseInt(e.target.value))
  }

  const handlePagination = (page) => {
    getData({
      sort,
      sortColumn,
      perPage: rowsPerPage,
      page: page.selected + 1
    })
    setCurrentPage(page.selected + 1)
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
    let count = Math.floor(filterRows.length / rowsPerPage)
    const rest = filterRows.length % rowsPerPage
    if (rest > 0) count++
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <CustomHeader
          rowsPerPage={rowsPerPage}
          handlePerPage={handlePerPage}
          totalCount={filterRows.length}
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

  const dataToRender = () => {
    if (dispFilterRows.length > 0) {
      return dispFilterRows
    } else if (dispFilterRows.length === 0) {
      return []
    } else {
      return dispFilterRows.slice(0, rowsPerPage)
    }
  }

    const handleRowClick = (row) => {
        localStorage.setItem('tableId', JSON.stringify(row?.tableId))
        localStorage.setItem('tableScore', JSON.stringify(row?.score))
        localStorage.setItem('search', JSON.stringify(search))
        localStorage.setItem('sort', JSON.stringify({
            sort,
            sortColumn
        }))
        localStorage.setItem('filter', JSON.stringify({
            connectionFilterIO,
            databaseFilterIO,
            schemaFilterIO,
            tableFilterIO,
            scoreFilterIO
        }))
        history.push(`/my-data-table?tableId=${row?.tableId}`)
    }

    const columns = [
        {
            name: 'Table Reliability Score',
            sortable: true,
            sortField: 'score',
            cell: row => <ColorDisplay value={row?.score ? parseFloat(row?.score).toFixed(2) : null}/>
        },
        {
            name: 'Table',
            sortable: true,
            sortField: 'table',
            cell: row => <span className='hover-blue full-content me-auto shrink-with-ellipsis overflow-visible'
                               onClick={() => handleRowClick(row)}><b>{row?.table}</b></span>
        },
        {
            sortable: true,
            sortField: 'database',
            name: 'Database',
            cell: row => <span className='shrink-with-ellipsis'
                               onClick={() => handleRowClick(row)}>{row?.database}</span>
        },
        {
            name: 'Schema',
            sortable: true,
            sortField: 'schema',
            cell: row => <span className='shrink-with-ellipsis' onClick={() => handleRowClick(row)}>{row?.schema}</span>
        },
        {
            name: 'Connection',
            sortable: true,
            sortField: 'connection',
            cell: row => <div style={{display: 'flex'}} >
                <SnowflakeDatabaseIcon className='database-icon'/>
                <span className='full-content' onClick={() => handleRowClick(row)}>{row?.connection}</span>
            </div>
        }
    ]

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Tables</CardTitle>
                    <div className='search-box'>
                        <TextField
                            label="Search"
                            variant="standard"
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><Search size={20}/></InputAdornment>),
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => {
                                                setSearch('') // Clear the search state
                                            }}
                                            size="small"
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                            }}
                        />
                    </div>
                    <div style={{width: "80px"}}></div>
                </CardHeader>
                <CardBody>
                    <Grid container spacing={1} style={{flexWrap: "wrap"}}>
                        <Grid item xs={2.4}>
                            <Autocomplete
                                renderTags={() => <></>}
                                multiple
                                variant="standard"
                                options={["Select-all", ...scoreFilter]}
                                limitTags={0}
                                disableCloseOnSelect
                                getOptionLabel={(connection) => connection}
                                renderOption={(props, option, {selected}) => {
                                    return option === "Select-all" ? <div {...props} style={{
                                        display: "flex",
                                        fontSize: "smaller",
                                        padding: "0px",
                                        margin: "0px",
                                        fontWeight: "800"
                                    }}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        Select All </div> : <li {...props} style={{fontSize: "smaller"}}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                }}
                                renderInput={(params) => (
                                  <TextField {...params} label="Table Reliability Score" placeholder={scoreFilterDisplay}/>
                                )}
                                value={scoreFilterIO}
                                onChange={(e, value) => {
                                    let tempScoreFilterIO = []
                                    if (scoreFilterIO.includes("Select-all")) {
                                        if (!value.includes("Select-all")) tempScoreFilterIO = []
                                        else tempScoreFilterIO = value.filter(item => item !== "Select-all")
                                    } else {
                                        if (!value.includes("Select-all")) {
                                            if (value.length === scoreFilter.length) tempScoreFilterIO = ["Select-all", ...scoreFilter]
                                            else tempScoreFilterIO = value
                                        } else tempScoreFilterIO = ["Select-all", ...scoreFilter]
                                    }
                                    setScoreFilterIO(tempScoreFilterIO)

                                    let tempConnectionFilterIO = []
                                    let tempDatabaseFilterIO = []
                                    let tempSchemaFilterIO = []
                                    let tempTableFilterIO = []
                                    rows.forEach((item) => {
                                        const tempDefaultScoreFilter = setTempScoreFilter(item?.score)
                                        if (!arrayInclude(tempScoreFilterIO, tempDefaultScoreFilter) && tempDefaultScoreFilter) return

                                        if (!tempConnectionFilterIO.includes(item?.connection)) tempConnectionFilterIO.push(item?.connection)
                                        if (!tempDatabaseFilterIO.includes(item?.database)) tempDatabaseFilterIO.push(item?.database)
                                        if (!tempSchemaFilterIO.includes(item?.schema)) tempSchemaFilterIO.push(item?.schema)
                                        if (!tempTableFilterIO.includes(item?.table)) tempTableFilterIO.push(item?.table)
                                    })
                                    if (arraysAreEqual(tempConnectionFilterIO, connectionFilter)) tempConnectionFilterIO = ["Select-all", ...tempConnectionFilterIO]
                                    if (arraysAreEqual(tempDatabaseFilterIO, databaseFilter)) tempDatabaseFilterIO = ["Select-all", ...tempDatabaseFilterIO]
                                    if (arraysAreEqual(tempSchemaFilterIO, schemaFilter)) tempSchemaFilterIO = ["Select-all", ...tempSchemaFilterIO]
                                    if (arraysAreEqual(tempTableFilterIO, tableFilter)) tempTableFilterIO = ["Select-all", ...tempTableFilterIO]

                                    if (!arraysAreEqual(tempConnectionFilterIO, connectionFilterIO)) setConnectionFilterIO(tempConnectionFilterIO)
                                    if (!arraysAreEqual(tempDatabaseFilterIO, databaseFilterIO)) setDatabaseFilterIO(tempDatabaseFilterIO)
                                    if (!arraysAreEqual(tempSchemaFilterIO, schemaFilterIO)) setSchemaFilterIO(tempSchemaFilterIO)
                                    if (!arraysAreEqual(tempTableFilterIO, tableFilterIO)) setTableFilterIO(tempTableFilterIO)
                                }}
                            />
                        </Grid>
                        <Grid item xs={2.4}>
                            <Autocomplete
                                renderTags={() => <></>}
                                multiple
                                variant="standard"
                                options={["Select-all", ...tableFilter]}
                                limitTags={0}
                                disableCloseOnSelect
                                getOptionLabel={(connection) => connection}
                                renderOption={(props, option, {selected}) => {
                                    return option === "Select-all" ? <div {...props} style={{
                                        display: "flex",
                                        fontSize: "smaller",
                                        padding: "0px",
                                        margin: "0px",
                                        fontWeight: "800"
                                    }}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        Select All </div> : <li {...props} style={{fontSize: "smaller"}}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Table(s)" placeholder={tableFilterDisplay}/>
                                )}
                                value={tableFilterIO}
                                onChange={(e, value) => {
                                    let tempTableFilterIO = []
                                    if (tableFilterIO.includes("Select-all")) {
                                        if (!value.includes("Select-all")) tempTableFilterIO = []
                                        else tempTableFilterIO = value.filter(item => item !== "Select-all")
                                    } else {
                                        if (!value.includes("Select-all")) {
                                            if (value.length === tableFilter.length) tempTableFilterIO = ["Select-all", ...tableFilter]
                                            else tempTableFilterIO = value
                                        } else tempTableFilterIO = ["Select-all", ...tableFilter]
                                    }
                                    setTableFilterIO(tempTableFilterIO)

                                    let tempConnectionFilterIO = []
                                    let tempDatabaseFilterIO = []
                                    let tempSchemaFilterIO = []
                                    let tempScoreFilterIO = []
                                    rows.forEach((item) => {
                                        if (!tempTableFilterIO.includes(item?.table)) return
                                        if (!tempConnectionFilterIO.includes(item?.connection)) tempConnectionFilterIO.push(item?.connection)
                                        if (!tempDatabaseFilterIO.includes(item?.database)) tempDatabaseFilterIO.push(item?.database)
                                        if (!tempSchemaFilterIO.includes(item?.schema)) tempSchemaFilterIO.push(item?.schema)

                                        const tempDefaultScoreFilter = setTempScoreFilter(item?.score)
                                        if (!arrayInclude(tempScoreFilterIO, tempDefaultScoreFilter) && tempDefaultScoreFilter) tempScoreFilterIO.push(tempDefaultScoreFilter)
                                    })
                                    if (arraysAreEqual(tempConnectionFilterIO, connectionFilter)) tempConnectionFilterIO = ["Select-all", ...tempConnectionFilterIO]
                                    if (arraysAreEqual(tempDatabaseFilterIO, databaseFilter)) tempDatabaseFilterIO = ["Select-all", ...tempDatabaseFilterIO]
                                    if (arraysAreEqual(tempSchemaFilterIO, schemaFilter)) tempSchemaFilterIO = ["Select-all", ...tempSchemaFilterIO]
                                    if (arraysAreEqual(tempScoreFilterIO, scoreFilter)) tempScoreFilterIO = ["Select-all", ...tempScoreFilterIO]

                                    if (!arraysAreEqual(tempConnectionFilterIO, connectionFilterIO)) setConnectionFilterIO(tempConnectionFilterIO)
                                    if (!arraysAreEqual(tempDatabaseFilterIO, databaseFilterIO)) setDatabaseFilterIO(tempDatabaseFilterIO)
                                    if (!arraysAreEqual(tempSchemaFilterIO, schemaFilterIO)) setSchemaFilterIO(tempSchemaFilterIO)
                                    if (!arraysAreEqual(tempScoreFilterIO, scoreFilterIO)) setScoreFilterIO(tempScoreFilterIO)
                                }}
                            />
                        </Grid>
                        <Grid item xs={2.4}>
                            <Autocomplete
                                renderTags={() => <></>}
                                multiple
                                variant="standard"
                                options={["Select-all", ...databaseFilter]}
                                limitTags={0}
                                disableCloseOnSelect
                                getOptionLabel={(connection) => connection}
                                renderOption={(props, option, {selected}) => {
                                    return option === "Select-all" ? <div {...props} style={{
                                        display: "flex",
                                        fontSize: "smaller",
                                        padding: "0px",
                                        margin: "0px",
                                        fontWeight: "800"
                                    }}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        Select All </div> : <li {...props} style={{fontSize: "smaller"}}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Database(s)" placeholder={databaseFilterDisplay}/>
                                )}
                                value={databaseFilterIO}
                                onChange={(e, value) => {
                                    let tempDatabaseFilterIO = []
                                    if (databaseFilterIO.includes("Select-all")) {
                                        if (!value.includes("Select-all")) tempDatabaseFilterIO = []
                                        else tempDatabaseFilterIO = value.filter(item => item !== "Select-all")
                                    } else {
                                        if (!value.includes("Select-all")) {
                                            if (value.length === databaseFilter.length) tempDatabaseFilterIO = ["Select-all", ...databaseFilter]
                                            else tempDatabaseFilterIO = value
                                        } else tempDatabaseFilterIO = ["Select-all", ...databaseFilter]
                                    }
                                    setDatabaseFilterIO(tempDatabaseFilterIO)

                  let tempConnectionFilterIO = []
                  let tempSchemaFilterIO = []
                  let tempTableFilterIO = []
                  let tempScoreFilterIO = []
                  rows.forEach((item) => {
                    if (!tempDatabaseFilterIO.includes(item?.database)) return
                    if (!tempConnectionFilterIO.includes(item?.connection)) tempConnectionFilterIO.push(item?.connection)
                    if (!tempSchemaFilterIO.includes(item?.schema)) tempSchemaFilterIO.push(item?.schema)
                    if (!tempTableFilterIO.includes(item?.table)) tempTableFilterIO.push(item?.table)

                    const tempDefaultScoreFilter = setTempScoreFilter(
                      item?.score
                    )
                    if (
                      !arrayInclude(
                        tempScoreFilterIO,
                        tempDefaultScoreFilter
                      ) &&
                      tempDefaultScoreFilter
                    ) tempScoreFilterIO.push(tempDefaultScoreFilter)
                  })

                  if (arraysAreEqual(tempConnectionFilterIO, connectionFilter)) tempConnectionFilterIO = [
                      "Select-all",
                      ...tempConnectionFilterIO
                    ]
                  if (arraysAreEqual(tempSchemaFilterIO, schemaFilter)) tempSchemaFilterIO = ["Select-all", ...tempSchemaFilterIO]
                  if (arraysAreEqual(tempTableFilterIO, tableFilter)) tempTableFilterIO = ["Select-all", ...tempTableFilterIO]
                  if (arraysAreEqual(tempScoreFilterIO, scoreFilter)) tempScoreFilterIO = ["Select-all", ...tempScoreFilterIO]

                                    if (!arraysAreEqual(tempConnectionFilterIO, connectionFilterIO)) setConnectionFilterIO(tempConnectionFilterIO)
                                    if (!arraysAreEqual(tempSchemaFilterIO, schemaFilterIO)) setSchemaFilterIO(tempSchemaFilterIO)
                                    if (!arraysAreEqual(tempTableFilterIO, tableFilterIO)) setTableFilterIO(tempTableFilterIO)
                                    if (!arraysAreEqual(tempScoreFilterIO, scoreFilterIO)) setScoreFilterIO(tempScoreFilterIO)
                                }}
                            />
                        </Grid>
                        <Grid item xs={2.4}>
                            <Autocomplete
                                renderTags={() => <></>}
                                multiple
                                variant="standard"
                                options={["Select-all", ...schemaFilter]}
                                limitTags={0}
                                disableCloseOnSelect
                                getOptionLabel={(connection) => connection}
                                renderOption={(props, option, {selected}) => {
                                    return option === "Select-all" ? <div {...props} style={{
                                        display: "flex",
                                        fontSize: "smaller",
                                        padding: "0px",
                                        margin: "0px",
                                        fontWeight: "800"
                                    }}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        Select All </div> : <li {...props} style={{fontSize: "smaller"}}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Schema(s)" placeholder={schemaFilterDisplay}/>
                                )}
                                value={schemaFilterIO}
                                onChange={(e, value) => {
                                    let tempSchemaFilterIO = []
                                    if (schemaFilterIO.includes("Select-all")) {
                                        if (!value.includes("Select-all")) tempSchemaFilterIO = []
                                        else tempSchemaFilterIO = value.filter(item => item !== "Select-all")
                                    } else {
                                        if (!value.includes("Select-all")) {
                                            if (value.length === schemaFilter.length) tempSchemaFilterIO = ["Select-all", ...schemaFilter]
                                            else tempSchemaFilterIO = value
                                        } else tempSchemaFilterIO = ["Select-all", ...schemaFilter]
                                    }
                                    setSchemaFilterIO(tempSchemaFilterIO)

                  let tempConnectionFilterIO = []
                  let tempDatabaseFilterIO = []
                  let tempTableFilterIO = []
                  let tempScoreFilterIO = []
                  rows.forEach((item) => {
                    if (!tempSchemaFilterIO.includes(item?.schema)) return
                    if (!tempConnectionFilterIO.includes(item?.connection)) tempConnectionFilterIO.push(item?.connection)
                    if (!tempDatabaseFilterIO.includes(item?.database)) tempDatabaseFilterIO.push(item?.database)
                    if (!tempTableFilterIO.includes(item?.table)) tempTableFilterIO.push(item?.table)

                    const tempDefaultScoreFilter = setTempScoreFilter(
                      item?.score
                    )
                    if (
                      !arrayInclude(
                        tempScoreFilterIO,
                        tempDefaultScoreFilter
                      ) &&
                      tempDefaultScoreFilter
                    ) tempScoreFilterIO.push(tempDefaultScoreFilter)
                  })
                  if (arraysAreEqual(tempConnectionFilterIO, connectionFilter)) tempConnectionFilterIO = [
                      "Select-all",
                      ...tempConnectionFilterIO
                    ]
                  if (arraysAreEqual(tempDatabaseFilterIO, databaseFilter)) tempDatabaseFilterIO = [
                      "Select-all",
                      ...tempDatabaseFilterIO
                    ]
                  if (arraysAreEqual(tempTableFilterIO, tableFilter)) tempTableFilterIO = ["Select-all", ...tempTableFilterIO]
                  if (arraysAreEqual(tempScoreFilterIO, scoreFilter)) tempScoreFilterIO = ["Select-all", ...tempScoreFilterIO]

                                    if (!arraysAreEqual(tempConnectionFilterIO, connectionFilterIO)) setConnectionFilterIO(tempConnectionFilterIO)
                                    if (!arraysAreEqual(tempDatabaseFilterIO, databaseFilterIO)) setDatabaseFilterIO(tempDatabaseFilterIO)
                                    if (!arraysAreEqual(tempTableFilterIO, tableFilterIO)) setTableFilterIO(tempTableFilterIO)
                                    if (!arraysAreEqual(tempScoreFilterIO, scoreFilterIO)) setScoreFilterIO(tempScoreFilterIO)
                                }}
                            />
                        </Grid>
                        <Grid item xs={2.4}>
                            <Autocomplete
                                renderTags={() => <></>}
                                multiple
                                variant="standard"
                                options={["Select-all", ...connectionFilter]}
                                limitTags={0}
                                disableCloseOnSelect
                                getOptionLabel={(connection) => connection}
                                renderOption={(props, option, {selected}) => {
                                    return option === "Select-all" ? <div {...props} style={{
                                        display: "flex",
                                        fontSize: "smaller",
                                        padding: "0px",
                                        margin: "0px",
                                        fontWeight: "800"
                                    }}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        Select All </div> : <li {...props} style={{fontSize: "smaller"}}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Connection(s)" placeholder={connectionFilterDisplay}/>
                                )}
                                value={connectionFilterIO}
                                onChange={(e, value) => {
                                    let tempConnectionFilterIO = []
                                    if (connectionFilterIO.includes("Select-all")) {
                                        if (!value.includes("Select-all")) tempConnectionFilterIO = []
                                        else tempConnectionFilterIO = value.filter(item => item !== "Select-all")
                                    } else {
                                        if (!value.includes("Select-all")) {
                                            if (value.length === connectionFilter.length) tempConnectionFilterIO = ["Select-all", ...connectionFilter]
                                            else tempConnectionFilterIO = value
                                        } else tempConnectionFilterIO = ["Select-all", ...connectionFilter]
                                    }
                                    setConnectionFilterIO(tempConnectionFilterIO)

                                    let tempDatabaseFilterIO = []
                                    let tempSchemaFilterIO = []
                                    let tempTableFilterIO = []
                                    let tempScoreFilterIO = []
                                    rows.forEach((item) => {
                                        if (!tempConnectionFilterIO.includes(item?.connection)) return
                                        if (!tempDatabaseFilterIO.includes(item?.database)) tempDatabaseFilterIO.push(item?.database)
                                        if (!tempSchemaFilterIO.includes(item?.schema)) tempSchemaFilterIO.push(item?.schema)
                                        if (!tempTableFilterIO.includes(item?.table)) tempTableFilterIO.push(item?.table)

                                        const tempDefaultScoreFilter = setTempScoreFilter(item?.score)
                                        if (!arrayInclude(tempScoreFilterIO, tempDefaultScoreFilter) && tempDefaultScoreFilter) tempScoreFilterIO.push(tempDefaultScoreFilter)
                                    })
                                    if (arraysAreEqual(tempDatabaseFilterIO, databaseFilter)) tempDatabaseFilterIO = ["Select-all", ...tempDatabaseFilterIO]
                                    if (arraysAreEqual(tempSchemaFilterIO, schemaFilter)) tempSchemaFilterIO = ["Select-all", ...tempSchemaFilterIO]
                                    if (arraysAreEqual(tempTableFilterIO, tableFilter)) tempTableFilterIO = ["Select-all", ...tempTableFilterIO]
                                    if (arraysAreEqual(tempScoreFilterIO, scoreFilter)) tempScoreFilterIO = ["Select-all", ...tempScoreFilterIO]

                                    if (!arraysAreEqual(tempDatabaseFilterIO, databaseFilterIO)) setDatabaseFilterIO(tempDatabaseFilterIO)
                                    if (!arraysAreEqual(tempSchemaFilterIO, schemaFilterIO)) setSchemaFilterIO(tempSchemaFilterIO)
                                    if (!arraysAreEqual(tempTableFilterIO, tableFilterIO)) setTableFilterIO(tempTableFilterIO)
                                    if (!arraysAreEqual(tempScoreFilterIO, scoreFilterIO)) setScoreFilterIO(tempScoreFilterIO)
                                }}
                            />
                        </Grid>

                    </Grid>
                    {
                        backLoading ? <div className='loading-gif-container'>
                            <img src={loadingGif} alt="Getting table data..." className='loading-gif'/>
                        </div> : <div className='invoice-list-wrapper'>
                            <Card>
                                <div className='invoice-list-dataTable react-dataTable'>
                                    <DataTable
                                        noHeader
                                        pagination
                                        sortServer
                                        paginationServer
                                        subHeader={true}
                                        columns={columns}
                                        responsive={true}
                                        onSort={handleSort}
                                        data={dataToRender()}
                                        sortIcon={<ChevronDown style={{color: "white"}}/>}
                                        className='react-dataTable'
                                        paginationDefaultPage={currentPage}
                                        paginationComponent={CustomPagination}
                                        onRowClicked={(row) => handleRowClick(row)}
                                    />
                                </div>
                            </Card>
                        </div>
                    }
                </CardBody>
            </Card>
        </div>
    )
}

export default ConnectionsPage
