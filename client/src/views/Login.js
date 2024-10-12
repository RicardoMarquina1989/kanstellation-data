// ** React Imports
import { Fragment, useState, useEffect} from 'react'
import { Link, useHistory, NavLink } from 'react-router-dom'
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CookieStorage,
  AmazonCognitoIdentity
} from "amazon-cognito-identity-js"
import '../App.css'

import { useDispatch } from "react-redux"
import { handleLogin } from "../redux/authentication.js"

import { useForm, Controller } from 'react-hook-form'
import { Facebook, Twitter, Mail, GitHub, Coffee, Linkedin } from 'react-feather'

// ** Custom Components
import Avatar from '@components/avatar'
import InputPasswordToggle from '@components/input-password-toggle'

// ** Reactstrap Imports
import { Row, Col, Form, Input, Label, Alert, Button, CardText, CardTitle, UncontrolledTooltip } from 'reactstrap'

// ** Styles
import '@styles/react/pages/page-authentication.scss'

// ** Ko Logo & Page Background
import koLogoPng from '@assets/Ko-Logo-small.png'
import pageBgPng from '@src/assets/images/pages/login-v3.webp'

const ToastContent = ({ name, role }) => (
  <Fragment>
    <div className='toastify-header'>
      <div className='title-wrapper'>
        <Avatar size='sm' color='success' icon={<Coffee size={12} />} />
        <h6 className='toast-title fw-bold'>Welcome, {name}</h6>
      </div>
    </div>
    <div className='toastify-body'>
      <span>You have successfully logged in as an {role} user to Vuexy. Now you can start to explore. Enjoy!</span>
    </div>
  </Fragment>
)

const defaultValues = {
  password: '',
  loginEmail: ''
}

const Login = () => {
  const dispatch = useDispatch()
  const poolData = {
    UserPoolId: process.env.REACT_APP_USERPOOL_ID,
    ClientId: process.env.REACT_APP_APPCLIENT_ID,
    Storage: new CookieStorage({
      domain: process.env.REACT_APP_DOMAIN,
      secure: false,
      path: '/',
      expires: 365
    })
  }

  const userPool = new CognitoUserPool(poolData)

  const history = useHistory()
  const [errorMsg, setErrorMsg] = useState("")
  const [rememberFlag, setRememberFlag] = useState(false)
  const [userData, setUserData] = useState(null)

  //** ComponentDidMount
  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(userData))
  }, [userData])
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = data => {
    if (Object.values(data).every(field => field.length > 0)) {

      setUserData({
        Username: data.loginEmail,
        Pool: userPool,
        Storage: new CookieStorage({
          domain: process.env.REACT_APP_DOMAIN,
          secure: false,
          path: '/',
          expires: 365
        })
      })
        const cognitoUser = new CognitoUser({
          Username: data.loginEmail,
          Pool: userPool
        })      
        const authenticationDetails = new AuthenticationDetails({
          Username: data.loginEmail,
          Password: data.password
        })
    
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            dispatch(
              handleLogin({
                idToken: result.idToken,
                refreshToken: result.refreshToken,
                accessToken: result.accessToken,
                accountId: process.env.REACT_APP_ACCOUNT_ID
              })
            )
            console.log("login successful!!")
            history.push('/incidents')
          },
          onFailure: (err) => {
            if (err.__type === "UserNotConfirmedException") {
              setErrorMsg('User not verified yet. Please check your email for a verification link')
            } else {
              setErrorMsg(err.message)
            }
          }
        })
    } else {
      for (const key in data) {
        if (data[key].length === 0) {
          setError(key, {
            type: 'manual'
          })
        }
      }
    }
  }
    
  return (
    <div className='auth-wrapper auth-cover' style={{
      backgroundImage: `url(${pageBgPng})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    }}>
      <Row className='auth-inner m-0'>
      <Col className='d-flex align-items-center auth-bg px-1' sm={{ size: 8, offset: 2 }} md={{ size: 6, offset: 3 }} lg={{ size: 4, offset: 4 }}>
          <Col className='px-xl-1 px-md-1 mx-auto' sm='12' md='10' lg='12'>
            <CardTitle tag='h2' className='fw-bold mb-1'>
              <NavLink to='/' className='navbar-brand'>
                <span className='brand-logo'>
                  <img src={koLogoPng} alt='logo' />
                </span>
              </NavLink>
            </CardTitle>
            <Form className='auth-login-form mt-1' onSubmit={handleSubmit(onSubmit)} onChange={() => setErrorMsg("")}>
              <div className='mb-1'>
                <Label className='form-label' for='login-email'>
                  Email
                </Label>
                <Controller
                  id='loginEmail'
                  name='loginEmail'
                  control={control}
                  render={({ field }) => (
                    <Input
                      autoFocus
                      type='email'
                      placeholder='john@example.com'
                      invalid={errors.loginEmail && true}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className='mb-1'>
                <div className='d-flex justify-content-between'>
                  <Label className='form-label' for='login-password'>
                    Password
                  </Label>
                  <Link to='/forgot-password' >
                    <small>Forgot Password?</small>
                  </Link>
                </div>
                <Controller
                  id='password'
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <InputPasswordToggle className='input-group-merge' invalid={errors.password && true} {...field} />
                  )}
                />
              </div>
              <div className='form-check mb-1'>
                <Input type='checkbox' id='remember-me' checked={rememberFlag} onChange={() => setRememberFlag(!rememberFlag)}/>
                <Label className='form-check-label' for='remember-me'>
                  Remember Me
                </Label>
              </div>
              <Button type='submit' color='primary' block>
                Sign in
              </Button>
            </Form>
            <p className='text-center mt-1 al-right'>
              <Link to='/register'>
                <span>Create an account</span>
              </Link>
            </p>
            <p className='text-center mt-1'>
              <span className='me-25' style={{ color: "red", fontSize: "smaller" }}>{errorMsg}</span>
            </p>
            <div className='auth-footer-btn d-flex flex-column align-items-center' style={{ fontSize: "smaller" }}>
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

export default Login