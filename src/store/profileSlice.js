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
  },
})


export const { setProfile, clearProfile } = profileSlice.actions
export default profileSlice.reducer
