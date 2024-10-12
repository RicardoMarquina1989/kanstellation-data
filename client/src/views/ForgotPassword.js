// ** React Imports
import { Link, Redirect, useHistory, NavLink } from 'react-router-dom'

// ** Reactstrap Imports
import { Row, Col, CardTitle, CardText, Form, Label, Input, Button } from 'reactstrap'

// ** Utils
import { isUserLoggedIn } from '@utils'

// ** Icons Imports
import { ChevronLeft } from 'react-feather'

// ** Styles
import '@styles/react/pages/page-authentication.scss'

// ** Ko Logo & Page Background
import koLogoPng from '@assets/Ko-Logo-small.png'
import pageBgPng from '@src/assets/images/pages/login-v3.webp'

// ** Custom Components
import InputPasswordToggle from '@components/input-password-toggle'

import {
  CognitoUserPool,
  CognitoUser
} from "amazon-cognito-identity-js"
import { useState, useRef } from 'react'

const ForgotPassword = () => {
  const history = useHistory()
  const [email, setEmail] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [codePass, setCodePass] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  const [codes, setCodes] = useState(['', '', '', '', '', ''])
  const inputRefs = Array.from({ length: 6 }, () => useRef(null))

  const handleInputChange = (index, value) => {
    setErrorMsg("")
    const newCodes = [...codes]
    newCodes[index] = value
    setCodes(newCodes)

    // Move focus to the next input if the value is filled
    if (value.length === 1 && index < inputRefs.length - 1) {
      inputRefs[index + 1].current.focus()
    }
  }

  const handleBackspace = (index, value) => {
    setErrorMsg("")
    // Move focus to the previous input if backspace is pressed and the current input is empty
    if (value.length === 0 && index > 0) {
      inputRefs[index - 1].current.focus()
    }
  }

  const userPool = new CognitoUserPool({
    UserPoolId: process.env.REACT_APP_USERPOOL_ID,
    ClientId: process.env.REACT_APP_APPCLIENT_ID
  })

  const handleForgotPassword = (e) => {
    e.preventDefault()
    setErrorMsg("")
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    })

    cognitoUser.forgotPassword({
      onSuccess() {
        setCodePass(true)
      },
      onFailure(err) {
        // alert(err.message || JSON.stringify(err))
        setErrorMsg(err.message)
      },
      inputVerificationCode() {
        setCodePass(true)
      }
    })
  }

  const handleConfirmPasswordReset = () => {
    setErrorMsg("")
    if (codes.every(code => code !== '')) {
      const verificationCode = codes.join('')
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      })

      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess() {
          setCodePass(false)
          history.push("/login")
        },
        onFailure(err) {
          setErrorMsg(err.message)
        }
      })
    }

  }

  if (isUserLoggedIn() === 'null') {
    return (
      <div className='auth-wrapper auth-cover' style={{
        backgroundImage: `url(${pageBgPng})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}>
        <Row className='auth-inner m-0'>
          <Col className='d-flex align-items-center auth-bg px-2 p-lg-5' sm={{ size: 8, offset: 2 }} md={{ size: 6, offset: 3 }} lg={{ size: 4, offset: 4 }}>
            {!codePass ? (
              <Col className='px-xl-2 mx-auto' sm='12' md='10' lg='12'>
                <CardTitle tag='h2' className='fw-bold mb-1'>
                  <NavLink to='/' className='navbar-brand'>
                    <span className='brand-logo'>
                      <img src={koLogoPng} alt='logo' />
                    </span>
                  </NavLink>
                </CardTitle>
                <CardText className='mb-2'>
                  Enter your email and we'll send you instructions to reset your password
                </CardText>
                <Form className='auth-forgot-password-form mt-2' onSubmit={handleForgotPassword}>
                  <div className='mb-1'>
                    <Label className='form-label' for='login-email'>
                      Email
                    </Label>
                    <Input type='email' id='login-email' placeholder='john@example.com' autoFocus value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <Button color='primary' block>
                    Send Reset link
                  </Button>
                </Form>
                <p className='text-center mt-2'>
                  <span className='me-25' style={{ color: "red" }}>{errorMsg}</span>
                </p>
                <p className='text-center mt-2'>
                  <Link to='/login'>
                    <ChevronLeft className='rotate-rtl me-25' size={14} />
                    <span className='align-middle'>Back to login</span>
                  </Link>
                </p>
              </Col>
            ) : (
              <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
                <CardTitle tag='h2' className='fw-bold mb-1'>
                  <NavLink to='/' className='navbar-brand'>
                    <span className='brand-logo'>
                      <img src={koLogoPng} alt='logo' />
                    </span>
                  </NavLink>
                </CardTitle>
                <CardTitle tag='h2' className='fw-bolder mb-1'>
                  Check Your Email
                </CardTitle>
                <CardText className='mb-75'>
                  We sent a verification code to your email address: <b>{email}</b>. <br />Enter the code from your email and new password in the fields below.
                </CardText>
                {/* <CardText className='fw-bolder mb-2'>******0789</CardText> */}
                <Form className='mt-2' onSubmit={e => e.preventDefault()}>
                  <h6>Type your 6 digit security code</h6>
                  <div className='auth-input-wrapper d-flex align-items-center justify-content-between'>
                    {Array.from({ length: 6 }, (_, index) => (
                      <Input
                        key={index}
                        innerRef={inputRefs[index]}
                        type="text"
                        maxLength='1'
                        className='auth-input height-50 text-center numeral-mask mx-25 mb-1'
                        value={codes[index]}
                        onChange={(e) => handleInputChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                        onKeyDown={(e) => e.key === 'Backspace' && handleBackspace(index, codes[index])}
                        onPaste={(e) => setCodes(e.clipboardData.getData('Text').split(''))}
                      />
                    ))}
                  </div>
                  <div className='mb-1'>
                    <div className='d-flex justify-content-between'>
                      <Label className='form-label' for='login-password'>
                        New Password
                      </Label>
                    </div>
                    <InputPasswordToggle className='input-group-merge' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className='mb-1'>
                    <div className='d-flex justify-content-between'>
                      <Label className='form-label' for='login-password'>
                        Confirm Password
                      </Label>
                    </div>
                    <InputPasswordToggle className='input-group-merge' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                </Form>
                <Button block color='primary' onClick={() => handleConfirmPasswordReset()}>
                  Reset Password
                </Button>
                <p className='text-center mt-2 al-right'>
                    <Link to='/login'>
                        <span>Go back to Sign in</span>
                    </Link>
                </p>
                <p className='text-center mt-2'>
                  <span className='me-25' style={{ color: "red" }}>{errorMsg}</span>
                </p>
                <p className='text-center mt-2' style={{ fontSize: "small" }}>
                  <span>Didn’t get the code?</span>{' '}
                  <a href='#' onClick={handleForgotPassword}>
                    Resend
                  </a>
                </p>
              </Col>
            )}
          </Col>
        </Row>
      </div>
    )
  } else {
    return <Redirect to='/' />
  }
}

export default ForgotPassword