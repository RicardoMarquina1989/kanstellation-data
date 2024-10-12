import { Link, Database, Home } from 'react-feather'

export default [
  {
    id: 'home',
    title: 'Home',
    icon: <Home size={20} />,
    navLink: '/home'
  },
  {
    id: 'ConnectionsPage',
    title: 'Connections',
    icon: <Link size={20} />,
    navLink: '/connections'
  },
  {
    id: 'MyDataPage',
    title: 'My Data',
    icon: <Database size={20} />,
    navLink: '/my-data'
  }
]
