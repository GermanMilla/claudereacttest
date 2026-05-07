import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, authReady: false },
  reducers: {
    login: (state, action) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
    },
    setAuthReady: (state) => {
      state.authReady = true
    },
  },
})

export const { login, logout, setAuthReady } = authSlice.actions
export default authSlice.reducer
