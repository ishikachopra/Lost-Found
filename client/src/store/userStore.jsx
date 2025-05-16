import {create} from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./authStore";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const userStore = create((set) => ({
  userInfo: null,
  error: null,
  isLoading: false,
  onlineUsers: [],
  socket: null,

  // Function to fetch user data
  fetchUserInfo: async () => {
    set({ isLoading: true }); // Set loading state to true

    try {
      const response = await fetch(`${BASE_URL}/api/user-info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send credentials (cookies or tokens)
      });

      // Check if the response is OK (200)
      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const data = await response.json();

      // Validate if the response contains the expected structure
      if (data.message === "User found" && data.userInfo) {
        set({ userInfo: data.userInfo, error: null }); // Set user info if found
      } else {
        set({ error: "User info not found", userInfo: null }); // Handle case when user info is not found
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({
        error: error.message || "Error fetching user info",
        userInfo: null,
      });
    } finally {
      set({ isLoading: false }); // Set loading state to false
    }
  },

  // connectSocket: () => {
  //   const {user}=useAuthStore();
  //   if (!user || get().socket?.connected) return;

  //   const socket = io(BASE_URL, {
  //     query: {
  //       userId: authUser._id,
  //     },
  //   });
  //   socket.connect();

  //   set({ socket: socket });

  //   socket.on("getOnlineUsers", (userIds) => {
  //     set({ onlineUsers: userIds });
  //   });
  // },
  // disconnectSocket: () => {
  //   if (get().socket?.connected) get().socket.disconnect();
  // },

}));
