// ** React Imports
import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import '../App.css'

// ** Reactstrap Imports
import { Row, Col, Button, CardTitle } from 'reactstrap'

// ** Styles
import '@styles/react/pages/page-authentication.scss'

// ** Ko Logo & Page Background
import koLogoPng from '@assets/Ko-Logo-small.png'
import pageBgPng from '@src/assets/images/pages/login-v3.webp'

const Error = () => {
    
  return (
    <div className='auth-wrapper auth-cover' style={{
      backgroundImage: `url(${pageBgPng})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    }}>
      <Row className='auth-inner auth-error m-0'>
        <Col className='d-flex align-items-center auth-bg px-2 p-lg-5 rounded' lg='4' sm='12'>
          <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
            <CardTitle tag='h2' className='fw-bold mb-1'>
              <NavLink to='/' className='navbar-brand'>
                <span className='brand-logo'>
                  <img src={koLogoPng} alt='logo' />
                </span>
              </NavLink>
            </CardTitle>
            <div className=' d-flex flex-column align-items-center mb-5'>
              <h2 className='my-2'>404: Page Not Found</h2>
              <p className='mb-4'>Oops! the page you are looking for does not exist</p>
              <Button tag={Link} to='/' color='primary' className='mb-5' block>
                Back to home
              </Button>
            </div>
            <div className='auth-footer-btn d-flex flex-column align-items-center mt-5 pt-5' style={{ fontSize: "small" }}>
              <p className='text-center mb-0'>
                Need help? &nbsp;
                <a href='https://konstellationdata.com/contact'>
                  <u>Contact us</u>
                </a>
              </p>
              <p className='m-0'>or</p>
              <p className='text-center text-nowrap mt-0'>
                Send us an email: &nbsp;
                <a href='mailto:support@konstellationdata.com'>
                  <u>support@konstellationdata.com</u>
                </a>
              </p>
            </div>
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default Error