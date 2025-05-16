// import { create } from "zustand";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useAuthStore } from "./authStore";

// const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5100/api" : "/api/auth";
// axios.defaults.withCredentials = true;

// export const useChatStore = create((set, get) => ({
//     messages: [],
//     users: [],
//     selectedUser: null,
//     isUsersLoading: false,
//     isMessagesLoading: false,
    

//     getClaimers: async (itemId) => {
//         set({ isUsersLoading: true });
//         try {
//             const res = await axios.get(`${API_URL}/messages/users/${itemId}`);
//             console.log("users",res.data.claimers);
//             set({ users: res.data.claimers });
//         } catch (error) {
//             toast.error(error.response.data.message);
//         } finally {
//             set({ isUsersLoading: false });
//         }
//     },

//     getMessages: async (userId) => {
//         set({ isMessagesLoading: true });
//         try {
//             const res = await axios.get(`${API_URL}/messages/${userId}`);
//             set({ messages: res.data });
//         } catch (error) {
//             toast.error(error.response.data.message);
//         } finally {
//             set({ isMessagesLoading: false });
//         }
//     },
//     sendMessage: async (messageData) => {
//         const { selectedUser, messages } = get();
//         try {
//             const res = await axios.post(`${API_URL}/messages/send/${selectedUser._id}`, messageData);
//             set({ messages: [...messages, res.data] });
//         } catch (error) {
//             toast.error(error.response.data.message);
//         }
//     },

//     subscribeToMessages: () => {
//         const { selectedUser } = get();
//         if (!selectedUser) return;

//         const socket = useAuthStore.getState().socket;
//         console.log("socket on subscribe to message",socket);

//         socket.on("newMessage", (newMessage) => {
//             const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
//             if (!isMessageSentFromSelectedUser) return;

//             set({
//                 messages: [...get().messages, newMessage],
//             });
//         });
//     },

//     unsubscribeFromMessages: () => {
//         const socket = useAuthStore.getState().socket;
//         socket.off("newMessage");
//     },

//     setSelectedUser: (selectedUser) => set({ selectedUser }),
// }));


import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";

const API_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:5100/api"
        : "/api/auth";

axios.defaults.withCredentials = true;

export const useChatStore = create(
    persist(
        (set, get) => ({
            messages: [],
            users: [],
            selectedUser: null,
            isUsersLoading: false,
            isMessagesLoading: false,

            getClaimers: async (itemId) => {
                set({ isUsersLoading: true });
                try {
                    const res = await axios.get(`${API_URL}/messages/users/${itemId}`);
                    console.log("users", res.data.claimers);
                    set({ users: res.data.claimers });
                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to fetch claimers.");
                } finally {
                    set({ isUsersLoading: false });
                }
            },

            getMessages: async (userId) => {
                set({ isMessagesLoading: true });
                try {
                    const res = await axios.get(`${API_URL}/messages/${userId}`);
                    set({ messages: res.data });
                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to fetch messages.");
                } finally {
                    set({ isMessagesLoading: false });
                }
            },

            sendMessage: async (messageData) => {
                const { selectedUser, messages } = get();
                try {
                    const res = await axios.post(
                        `${API_URL}/messages/send/${selectedUser._id}`,
                        messageData
                    );
                    set({ messages: [...messages, res.data] });
                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to send message.");
                }
            },

            subscribeToMessages: () => {
                const { selectedUser } = get();
                const socket = useAuthStore.getState().socket;
                if (!selectedUser || !socket) {
                    console.warn("Socket or selectedUser not available, skipping subscription");
                    return;
                }
                socket.on("newMessage", (newMessage) => {
                    const isFromSelectedUser = newMessage.senderId === selectedUser._id;
                    if (!isFromSelectedUser) return;

                    set({ messages: [...get().messages, newMessage] });
                });
            },

            unsubscribeFromMessages: () => {
                const socket = useAuthStore.getState().socket;
                socket.off("newMessage");
            },

            setSelectedUser: (selectedUser) => set({ selectedUser }),
        }),
        {
            name: "chat-store", // key in localStorage
            partialize: (state) => ({ selectedUser: state.selectedUser }), // only persist selectedUser
        }
    )
);
