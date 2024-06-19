import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  username: null,
  token: null,
  userId: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.isLoggedIn = true;
      state.username = action.payload.username;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
    },
    logoutUser(state) {
      state.isLoggedIn = false;
      state.username = null;
      state.token = null;
      state.userId = null;
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
