// Redux Store
import { createSlice } from "@reduxjs/toolkit";

const initialModalData = { isOpen: false, data: {}, isLoading: false };

// Initial state
const initialState = {
  // User
  profile: initialModalData,
  editUser: initialModalData,
  deleteUser: initialModalData,
  createUser: initialModalData,
  resetUserPassword: initialModalData,
  viewUserPassword: initialModalData,

  // Class
  createClass: initialModalData,
  editClass: initialModalData,
  deleteClass: initialModalData,

  // Subject
  createSubject: initialModalData,
  editSubject: initialModalData,
  deleteSubject: initialModalData,

  // Grade
  editGrade: initialModalData,
  deleteGrade: initialModalData,
  createGrade: initialModalData,

  // Schedule
  createSchedule: initialModalData,
  editSchedule: initialModalData,
  deleteSchedule: initialModalData,

  // Holiday
  createHoliday: initialModalData,
  editHoliday: initialModalData,
  deleteHoliday: initialModalData,

  // Messages
  sendMessage: initialModalData,
  messageDetails: initialModalData,

  // Stats
  studentStats: initialModalData,

  // Topics
  uploadTopics: initialModalData,

  // Market
  deleteMarketProduct: initialModalData,
  updateMarketOrderStatus: initialModalData,

  // Export / Import
  exportUsers: initialModalData,

  // Penalties
  createPenalty: initialModalData,
  reviewPenalty: initialModalData,
  penaltyDetail: initialModalData,
  reducePenalty: initialModalData,

  createPenaltyCategory: initialModalData,
  editPenaltyCategory: initialModalData,

  // Roles
  createRole: initialModalData,
  editRole: initialModalData,
  deleteRole: initialModalData,

  // Coin Distribution
  confirmDistribution: initialModalData,

  // Download App
  downloadApp: initialModalData,

  // Bug Report
  bugReport: initialModalData,

  // Social network
  editSocialNetwork: initialModalData,
  deleteSocialNetwork: initialModalData,
  createSocialNetwork: initialModalData,

  // Task
  stopTask: initialModalData,
  reviewTask: initialModalData,
  createTask: initialModalData,
  extendDeadline: initialModalData,

  // Payments
  createPayment: initialModalData,

  // Notifications
  sendNotification: initialModalData,
  notificationDetail: initialModalData,
};

export const modalSlice = createSlice({
  initialState,
  name: "modal",
  reducers: {
    open: (state, action) => {
      const { modal, data } = action.payload;
      if (!state[modal]) return;
      state[modal].isOpen = true;

      Object.assign(state[modal].data, data || {});
    },

    close: (state, action) => {
      const { modal, data } = action.payload;
      if (!state[modal]) return;
      state[modal].isOpen = false;
      Object.assign(state[modal].data, data || {});
    },

    updateData: (state, action) => {
      const { modal, data } = action.payload;
      if (!state[modal]) return;
      Object.assign(state[modal].data, data || {});
    },

    updateLoading: (state, action) => {
      const { modal, value } = action.payload;
      if (!state[modal]) return;
      state[modal].isLoading = value;
    },
  },
});

// Export actions
export const { open, close, updateLoading, updateData } = modalSlice.actions;

// Export reducer
export default modalSlice.reducer;
