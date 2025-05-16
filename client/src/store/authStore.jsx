import {create} from "zustand"
import axios from "axios"
import { io } from "socket.io-client";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5100/api/auth" : "/api/auth";



axios.defaults.withCredentials = true;

const storedAuth = JSON.parse(localStorage.getItem("authState")) || {
  user: null,
  isAuthenticated: false,
};


export const useAuthStore = create((set,get) => ({
  user: storedAuth.user,
  isAuthenticated: storedAuth.isAuthenticated,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,
  socket: null,
  onlineUsers: [],

  persistAuthState: (user, isAuthenticated) => {
    localStorage.setItem(
      "authState",
      JSON.stringify({ user, isAuthenticated })
    );
  },

  signup: async (email, password, name, phoneNumber, gender) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name,
        phoneNumber,
        gender,
      });

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      useAuthStore.getState().persistAuthState(response.data.user, true);
      get().connectSocket();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error signing up";

      if (errorMessage.includes("User already exists")) {
        alert("User already exists. Please log in.");
      }

      set({
        error: errorMessage,
        isLoading: false,
      });

      throw error;
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
        isLoading: false,
      });
      useAuthStore.getState().persistAuthState(response.data.user, true);
          console.log("User after login:", response.data.user);
      get().connectSocket();
      
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error logging in",
        isLoading: false,
      });
      throw error;
    }
    
    
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/logout`);
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
      localStorage.removeItem("authState");
      get().disconnectSocket();
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, { code });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return response.data;
    } catch (error) {
      set({
        error: error.response.data.message || "Error verifying email",
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
      useAuthStore.getState().persistAuthState(response.data.user, true);
      get().connectSocket();
      console.log("socket ", get().socket);
      
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response.data.message || "Error sending reset password email",
      });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        password,
      });
      set({ message: response.data.message, isLoading: false });
      useAuthStore.getState().persistAuthState(response.data.user, true);
    } catch (error) {
      localStorage.removeItem("authState");
      set({
        isLoading: false,
        error: error.response.data.message || "Error resetting password",
      });
      throw error;
    }
  },

  connectSocket: () => {
    const { user } = get();
    console.log("user connected to socket ",user);
    if (!user || get().socket?.connected) return;

    const socket = io('http://localhost:5100', {
      query: {
        userId: user._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    // socket.on("getOnlineUsers", (userIds) => {
    //   set({ onlineUsers: userIds });
    // });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

}));



