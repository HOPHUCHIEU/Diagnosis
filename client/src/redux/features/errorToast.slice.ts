import { createSlice } from '@reduxjs/toolkit'

interface ErrorToastState {
  isErrorToastDisplayed: boolean
}

const initialState: ErrorToastState = {
  isErrorToastDisplayed: false
}

const errorToastSlice = createSlice({
  name: 'errorToast',
  initialState,
  reducers: {
    showErrorToast(state) {
      state.isErrorToastDisplayed = true
    },
    hideErrorToast(state) {
      state.isErrorToastDisplayed = false
    }
  }
})

export default errorToastSlice.reducer

export const { showErrorToast, hideErrorToast } = errorToastSlice.actions
