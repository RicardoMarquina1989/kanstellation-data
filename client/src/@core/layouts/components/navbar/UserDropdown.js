// ** React Imports
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Utils
// import { isUserLoggedIn } from '@utils'

// ** Third Party Components
import { User, Mail, CheckSquare, MessageSquare, Settings, CreditCard, HelpCircle, Power } from 'react-feather'
import { CognitoUserPool } from "amazon-cognito-identity-js"

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

// ** Default Avatar Image
import defaultAvatar from '@src/assets/images/portrait/small/avatar-blank.png'

import { useDispatch } from 'react-redux'
import { handleLogout } from "../../../../redux/authentication.js"

const UserDropdown = () => {
  // ** State
  const [userData, setUserData] = useState(null)

  //** ComponentDidMount
  useEffect(() => {
    // if (isUserLoggedIn() !== null) {
    try {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    } catch (e) { }

    // }
  }, [])

  // Use the useDispatch hook 
  const dispatch = useDispatch()

  // Define the function to handle the logout click
  const handleLogoutClick = () => {
    // Dispatch the handleLogout action
    dispatch(handleLogout())

    //Cognito Logout
    const userPool = new CognitoUserPool({
      UserPoolId: process.env.REACT_APP_USERPOOL_ID,
      ClientId: process.env.REACT_APP_APPCLIENT_ID
    })
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser !== null) {
      cognitoUser.signOut()
    }
  }

  //** Vars
  const userAvatar = (userData && userData?.avatar) || defaultAvatar

  return (
    <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
      <DropdownToggle href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
        <div className='user-nav d-sm-flex d-none'>
          <span className='user-name fw-bold'>{(userData && userData?.name?.split('@')[0]) || ''}</span>
        </div>
        <Avatar img={userAvatar} imgHeight='40' imgWidth='40' status='online' />
      </DropdownToggle>
      <DropdownMenu end>
        {/* <DropdownItem tag='a' href='/pages/profile' onClick={e => e.preventDefault()}>
          <User size={14} className='me-75' />
          <span className='align-middle'>Profile</span>
        </DropdownItem>
        <DropdownItem tag='a' href='/pages/faq' onClick={e => e.preventDefault()}>
          <HelpCircle size={14} className='me-75' />
          <span className='align-middle'>FAQ</span>
        </DropdownItem> */}
        <DropdownItem tag={Link} to='/login' onClick={handleLogoutClick}>
          <Power size={14} className='me-75' />
          <span className='align-middle'>Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  )
}

export default UserDropdown