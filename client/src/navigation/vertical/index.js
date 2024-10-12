import { Link, Database, AlertTriangle } from 'react-feather'

export default [
  {
    id: 'IncidentsPage',
    title: 'Incidents',
    icon: <AlertTriangle size={20} />,
    navLink: '/incidents'
  },
  {
    id: 'MyDataPage',
    title: 'Tables',
    icon: <Database size={20} />,
    navLink: '/my-data'
  },
  {
    id: 'ConnectionsPage',
    title: 'Connections',
    icon: <Link size={20} />,
    navLink: '/connections'
  }
]
