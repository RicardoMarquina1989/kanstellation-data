// ** React Imports
import { Link, NavLink } from 'react-router-dom'
import {
    CognitoUserPool,
    CognitoUserAttribute
} from "amazon-cognito-identity-js"

import '../App.css'
import axios from "axios"
// ** Third Party Components
import { useForm, Controller } from 'react-hook-form'
// import { Facebook, Twitter, Mail, GitHub, Linkedin } from 'react-feather'

// ** Custom Components
import InputPasswordToggle from '@components/input-password-toggle'

// ** Reactstrap Imports
import { Row, Col, CardTitle, CardText, Label, Button, Form, Input, FormFeedback } from 'reactstrap'

// ** Styles
import '@styles/react/pages/page-authentication.scss'

// ** Ko Logo & Page Background
import koLogoPng from '@assets/Ko-Logo-small.png'
import pageBgPng from '@src/assets/images/pages/login-v3.webp'

import { useState } from 'react'

const defaultValues = {
    email: '',
    confirmEmail: '',
    terms: false,
    password: '',
    confirmPassword: ''
}

const Register = () => {
    const [errorMsg, setErrorMsg] = useState("")
    const [signupSuccess, setSignupSuccess] = useState(false)
    const {
        control,
        setError,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm({ mode: "onBlur", defaultValues })

    const userPool = new CognitoUserPool({
        UserPoolId: process.env.REACT_APP_USERPOOL_ID,
        ClientId: process.env.REACT_APP_APPCLIENT_ID
    })

    const onSubmit = data => {
        const tempData = { ...data }
        delete tempData.terms

        if (Object.values(tempData).every(field => field.length > 0) && data.terms === true) {
            const { email, password } = data
            const attributeList = [
                new CognitoUserAttribute({
                    Name: "email",
                    Value: email
                })
            ]
            userPool.signUp(email, password, attributeList, null, (err, result) => {
                if (err) {
                    setErrorMsg(err.message)
                    console.log(err)
                    return
                }
                console.log("call result: ", result)
                setSignupSuccess(true)
                // call email-api
                axios.post('/api/email/sign-up', {email})
                .then((resp) => console.log(resp))
                .catch((err) => console.log(err))
            })
        } else {
            for (const key in data) {
                if (data[key].length === 0) {
                    setError(key, {
                        type: 'manual',
                        message: `Please enter a valid ${key}`
                    })
                }
                if (key === 'terms' && data.terms === false) {
                    setError('terms', {
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
                <Col className='d-flex align-items-center auth-bg px-2' sm={{ size: 8, offset: 2 }} md={{ size: 6, offset: 3 }} lg={{ size: 4, offset: 4 }}>
                    <Col className='px-xl-2 mx-auto' sm='12' md='10' lg='12'>
                        <CardTitle tag='h2' className='fw-bold mb-1'>
                            <NavLink to='/' className='navbar-brand'>
                                <span className='brand-logo'>
                                    <img src={koLogoPng} alt='logo' />
                                </span>
                            </NavLink>
                        </CardTitle>
                        {
                            signupSuccess ? <div className='text-center mt-1' style={{ marginBottom: 120 }}>
                                <p>Please check your email to verify your account</p>
                                <p>Once verified, click <Link to='/login'>here</Link> to login</p>
                            </div> :  <>
                                <Form action='/' className='auth-register-form mt-1' onSubmit={handleSubmit(onSubmit)} onChange={() => setErrorMsg("")}>
                                    <div className='mb-1'>
                                        <Label className='form-label' for='email'>
                                            Email
                                        </Label>
                                        <Controller
                                            id='email'
                                            name='email'
                                            control={control}
                                            rules={{
                                                pattern: {
                                                    value: /^(?!.+@(yahoo|hotmail|gmail|live|google|outlook|msn|icloud|aol|example)\..+)(.+@.+\..+)$/i,
                                                    message: 'You must register with a business email'
                                                }
                                            }}
                                            render={({ field }) => (
                                                <Input type='email' placeholder='john@example.com' invalid={errors.email && true} {...field} />
                                            )}
                                        />
                                        {errors.email ? <FormFeedback>{errors.email.message}</FormFeedback> : null}
                                    </div>
                                    <div className='mb-1'>
                                        <Label className='form-label' for='confirm-email'>
                                            Confirm Email
                                        </Label>
                                        <Controller
                                            id='confirm-email'
                                            name='confirmEmail'
                                            rules={{
                                                validate: {
                                                    emailEqual: value => (value === getValues().email) || 'The email addresses provided don\'t match. Please verify.'
                                                }
                                            }}
                                            control={control}
                                            render={({ field }) => (
                                                <Input type='email' placeholder='john@example.com' invalid={errors.confirmEmail && true} {...field} />
                                            )}
                                        />
                                        {errors.confirmEmail ? <FormFeedback>{errors.confirmEmail.message}</FormFeedback> : null}
                                    </div>
                                    <div className='mb-1'>
                                        <Label className='form-label' for='register-password'>
                                            Password
                                        </Label>
                                        <Controller
                                            id='register-password'
                                            name='password'
                                            control={control}
                                            render={({ field }) => (
                                                <InputPasswordToggle className='input-group-merge' invalid={errors.password && true} {...field} />
                                            )}
                                        />
                                        <span style={{ fontSize: "smaller" }}>Your password must be a minimum of 8 characters and include at least 1 number, 1 special character, 1 uppercase letter, and 1 lowercase letter</span>
                                    </div>
                                    <div className='mb-1'>
                                        <Label className='form-label' for='confirm-password'>
                                            Confirm Password
                                        </Label>
                                        <Controller
                                            id='confirm-password'
                                            name='confirmPassword'
                                            rules={{
                                                validate: {
                                                    passwordEqual: value => (value === getValues().password) || 'The passwords provided don\'t match.'
                                                }
                                            }}
                                            control={control}
                                            render={({ field }) => (
                                                <InputPasswordToggle className='input-group-merge' invalid={errors.confirmPassword && true} {...field} />
                                            )}
                                        />
                                        {errors.confirmPassword ? <FormFeedback>{errors.confirmPassword.message}</FormFeedback> : null}
                                    </div>
                                    <div className='form-check mb-1'>
                                        <Controller
                                            name='terms'
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} id='terms' type='checkbox' checked={field.value} invalid={errors.terms && true} />
                                            )}
                                        />
                                        <Label className='form-check-label' for='terms'>
                                            I agree to
                                            <a className='ms-25' href='http://konstellationdata.com/privacy'>
                                                privacy policy & terms
                                            </a>
                                        </Label>
                                    </div>
                                    <Button type='submit' block color='primary'>
                                        Sign up
                                    </Button>
                                </Form>
                                <p className='text-center mt-1 al-right'>
                                    <Link to='/login'>
                                        <span>Sign in instead</span>
                                    </Link>
                                </p>
                            </>
                        }
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

export default Register