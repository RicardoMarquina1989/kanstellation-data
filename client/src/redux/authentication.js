// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** UseJWT import to get config
import useJwt from '@src/auth/jwt/useJwt'

const config = useJwt.jwtConfig

const initialUser = () => {
  const item = window.localStorage.getItem('userData')
  //** Parse stored json or if none return initialValue
  try {
    return item ? JSON.parse(item) : {}
  } catch (e) {
    return {}
  }  
}

export const authSlice = createSlice({
  name: 'authentication',
  initialState: {
    userData: initialUser()
  },
  reducers: {
    handleLogin: (state, action) => {

      // Invoke the functions to get the token values
      const idToken = action.payload.idToken
      const refreshToken = action.payload.refreshToken
      const accessToken = action.payload.accessToken
      const account_id = action.payload.accountId

      // Update the state with the tokens
      state[config.storageTokenKeyName] = accessToken
      state[config.storageRefreshTokenKeyName] = refreshToken

      // Store user information from the idToken payload
      const { sub, email, username } = idToken.payload
      // Check if username exists, otherwise default to email
      const name = username || email

      state.userData = { sub, email, name, account_id }

      // Store the entire user session object if needed
      state.userSession = action.payload

      // Store tokens in localStorage if needed
      localStorage.setItem(config.storageTokenKeyName, accessToken.jwtToken)
      localStorage.setItem(config.storageRefreshTokenKeyName, refreshToken.token)
      localStorage.setItem('userData', JSON.stringify(state.userData))
    },
    handleLogout: state => {
      
      // Clear authentication-related information in the state
      state[config.storageTokenKeyName] = null
      state[config.storageRefreshTokenKeyName] = null
      state.userData = {}
      state.userSession = null

      // ** Remove user, accessToken & refreshToken from localStorage
      localStorage.removeItem(config.storageTokenKeyName)
      localStorage.removeItem(config.storageRefreshTokenKeyName)
      localStorage.removeItem('userData')

      
    }
  }
})

export const { handleLogin, handleLogout } = authSlice.actions

export default authSlice.reducer
