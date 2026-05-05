import { createSlice } from '@reduxjs/toolkit'

const profileSlice = createSlice({
  name: 'profile',
  initialState: { profile: null },
  reducers: {
      setProfile: (state, action) => {
        state.profile = action.payload
      },
      clearProfile: (state) => {
        state.profile = null
      },
      profileError: (state, action) => {
        state.error = action.payload
      }
  },
})


export const { setProfile, clearProfile, profileError } = profileSlice.actions
export default profileSlice.reducer
