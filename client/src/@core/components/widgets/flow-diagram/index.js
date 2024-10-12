import React, {useState, useRef, useEffect} from 'react'
import Grid from '@mui/material/Grid'
import axios from 'axios'
import { ReactComponent as SnowflakeDatabaseIcon } from '../../../../assets/images/icons/database/snowflake.svg'
import { ReactComponent as PsqlDatabaseIcon } from '../../../../assets/images/icons/database/postgresql.svg'
import ColorDisplay from '../color-display'
import { Database, MoreVertical } from 'react-feather'
import loadingGif from '../../../../assets/images/loading.gif'
import { useHistory } from 'react-router-dom'

function FlowDiagram({accountId, tableId, zoomFlag}) {
    const history = useHistory()
    const [isDiagramZoomed, setIsDiagramZoomed] = useState(false)
    const [backLoading, setBackLoading] = useState(false)
    const [flowData, setFlowData] = useState({})
    const [moreIndex, setMoreIndex] = useState("")
    const canvasRef = useRef(null)
    const diagramRef = useRef(null)
    const innerDiagramRef = useRef(null)
    // const [parentSize, setParentSize] = useState({ width: 0, height: 0 })

    const parentElements = []
    const currentElements = []
    const childrenElements = []

    flowData.parents?.map((item, index) => {
        parentElements.push(
        <div key={`parent-${index}`} className='flow-node' id={`parent-${index}`}>
            <div className='top'>
            <div className='icon'>{
                item.connection_type === 'snowflake' ? (
                    <SnowflakeDatabaseIcon className='database-icon' />
                ) : item.connectionType === 'postresql' ? (
                    <PsqlDatabaseIcon className='database-icon' />
                ) : (
                    <Database size={20} />
                )} 
            </div>
            <span className='table-type'>{item?.table_type}</span>
            {"|"}
            <span className='database-name'>{item?.database_name}</span>
            {"."}
            <span className='schema-name'>{item?.schema_name}</span>
            <div className='three-dots' onClick={(e) => {
                e.stopPropagation()
                setMoreIndex(`parent-${index}`)
                }} onMouseLeave={() => setMoreIndex("")}>
                <MoreVertical/>
                <div className={moreIndex === `parent-${index}` ? 'menu' : 'hidden'} onClick={() => {
                history.push(`/my-data-table?tableId=${item?.table_id}`)
                window.location.reload()
                }}>
                Go to Table
                </div>
            </div>
            </div>
            <div className='middle-table-name'>{item?.table_name}</div>
            <div className='bottom'>
            <ColorDisplay value={item?.table_score ? Number(item?.table_score).toFixed(2) : null} size={'mini'} />
            </div>
        </div>
        )
    })

    flowData.current?.map((item, index) => {
        currentElements.push(
        <div key={`current-${index}`} className='flow-node' id={`current-${index}`}>
            <div className='top'>
            <div className='icon'>{
                item.connection_type === 'snowflake' ? (
                    <SnowflakeDatabaseIcon className='database-icon' />
                ) : item.connectionType === 'postresql' ? (
                    <PsqlDatabaseIcon className='database-icon' />
                ) : (
                    <Database size={20} />
                )} 
            </div>
            <span className='table-type'>{item?.table_type}</span>
            {"|"}
            <span className='database-name'>{item?.database_name}</span>
            {"."}
            <span className='schema-name'>{item?.schema_name}</span>
            <div className='three-dots' onClick={(e) => {
                e.stopPropagation()
                setMoreIndex(`current-${index}`)
            }} onMouseLeave={() => setMoreIndex("")}>
                <MoreVertical/>
                <div className={moreIndex === `current-${index}` ? 'menu' : 'hidden'} >
                Go to Table
                </div>
            </div>
            </div>
            <div className='middle-table-name'>{item?.table_name}</div>
            <div className='bottom'>
            <ColorDisplay value={item?.table_score ? Number(item?.table_score).toFixed(2) : null} size={'mini'} />
            </div>
        </div>
        )
    })

    flowData.children?.map((item, index) => {
        childrenElements.push(
        <div key={`child-${index}`} className='flow-node' id={`child-${index}`}>
            <div className='top'>
            <div className='icon'>{
                item.connection_type === 'snowflake' ? (
                    <SnowflakeDatabaseIcon className='database-icon' />
                ) : item.connectionType === 'postresql' ? (
                    <PsqlDatabaseIcon className='database-icon' />
                ) : (
                    <Database size={20} />
                )} 
            </div>
            <span className='table-type'>{item?.table_type}</span>
            {"|"}
            <span className='database-name'>{item?.database_name}</span>
            {"."}
            <span className='schema-name'>{item?.schema_name}</span>
            <div className='three-dots' onClick={(e) => {
                e.stopPropagation()
                setMoreIndex(`child-${index}`)
            }} onMouseLeave={() => setMoreIndex("")}>
                <MoreVertical/>
                <div className={moreIndex === `child-${index}` ? 'menu' : 'hidden'} onClick={() => {
                history.push(`/my-data-table?tableId=${item?.table_id}`)
                window.location.reload()
                }}>
                Go to Table
                </div>
            </div>
            </div>
            <div className='middle-table-name'>{item?.table_name}</div>
            <div className='bottom'>
            <ColorDisplay value={item?.table_score ? Number(item?.table_score).toFixed(2) : null} size={'mini'} />
            </div>
        </div>
        )
    })

    useEffect(() => {
        const run = async () => {
            setBackLoading(true)
            await axios.post(`/api/mydata/all-table`, { accountId, tableId })
                .then((response) => {
                    if (response.data.success) {
                        setFlowData(response.data?.data?.flowData)
                    }
                })
                .catch((error) => console.log(error))
                .finally(() => {
                    setBackLoading(false)
                })
        }
        run()
    }, [])

    useEffect(() => {
        let multiple = zoomFlag ? 1 / 0.6 : 1
        if (isDiagramZoomed && zoomFlag) multiple *= 0.6
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const diagram = diagramRef.current
        const innerDiagram = innerDiagramRef.current
        canvas.height = innerDiagram.getBoundingClientRect().height * multiple
    
        const baseX = diagram.getBoundingClientRect().x
        const baseY = innerDiagram.getBoundingClientRect().y + 10
        const currentElement = document.getElementById('current-0')
        if (!currentElement) return
    
        // Clear the canvas
        ctx.clearRect(0, 0, diagram.width, diagram.height)
        ctx.beginPath()
    
        // Set the ending points    
        let endPoint = { x: currentElement.getBoundingClientRect().x - baseX,
                         y: currentElement.getBoundingClientRect().y - baseY + (currentElement.getBoundingClientRect().height / 2) }
    
        flowData.parents.map((item, index) => {
          const parentElement = document.getElementById(`parent-${index}`)
          if (!parentElement) return
          const startPoint = { x: parentElement.getBoundingClientRect().x - baseX + (parentElement.getBoundingClientRect().width),
                               y: parentElement.getBoundingClientRect().y - baseY + (parentElement.getBoundingClientRect().height / 2) }
          ctx.moveTo(startPoint.x * multiple, startPoint.y * multiple)
          ctx.lineTo(endPoint.x * multiple, endPoint.y * multiple)
        })
    
        endPoint = { x: currentElement.getBoundingClientRect().x - baseX + (currentElement.getBoundingClientRect().width),
                     y: currentElement.getBoundingClientRect().y - baseY + (currentElement.getBoundingClientRect().height / 2) }
    
        flowData.children.map((item, index) => {
          const childElement = document.getElementById(`child-${index}`)
          if (!childElement) return
          const startPoint = { x: childElement.getBoundingClientRect().x - baseX,
                               y: childElement.getBoundingClientRect().y - baseY + (childElement.getBoundingClientRect().height / 2) }
          ctx.moveTo(startPoint.x * multiple, startPoint.y * multiple)
          ctx.lineTo(endPoint.x * multiple, endPoint.y * multiple)
        })
    
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.818)'
        ctx.lineWidth = 1
        ctx.stroke()
    
    })

    return (
        <div className={`flow-diagram ${!isDiagramZoomed ? 'zoomed' : ''} ${backLoading ? 'loading' : ''} ${zoomFlag ? '' : 'normal'}`}
            ref={diagramRef}
            onMouseLeave={() => setIsDiagramZoomed(false)}
            onClick={() => setIsDiagramZoomed(true)}
        >
            {
                backLoading ? <div className='loading-gif-container'>
                    <img src={loadingGif} alt="Getting table data..." className='loading-gif' />
                </div> : <div>
                    <canvas
                        ref={canvasRef}
                        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none'}}
                        height={10000}
                        width={10000}
                    />
                    <Grid container spacing={2} alignItems="center" justifyContent="center" ref={innerDiagramRef}>
                        <Grid item xs={4}>
                            {parentElements}
                        </Grid>
                        <Grid item xs={4}>
                            {currentElements}
                        </Grid>
                        <Grid item xs={4}>
                            {childrenElements}
                        </Grid>
                    </Grid>
                </div>
            }
        </div>
    )
}

export default FlowDiagram