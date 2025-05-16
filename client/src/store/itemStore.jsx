import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { useAuthStore } from "./authStore";

// Set the API URL based on the environment
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5100/api/items"
    : "/api/items";


axios.defaults.withCredentials = true;

export const useItemStore = create(persist((set) => ({
  items: [],
  loading: false, // State to indicate loading status
  error: null, // State to hold any errors
  access:false,

  
  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(API_URL);
      set({ items: response.data, loading: false });
      console.log(response.data);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addItem: async (newItem, imageFile) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("itemName", newItem.itemName);
      formData.append("itemType", newItem.itemType);
      formData.append("date", newItem.date);
      formData.append("time", newItem.time);
      formData.append("location", newItem.location);
      formData.append("description", newItem.description);

      if (imageFile) {
        formData.append("image", imageFile);
        console.log("Image file:", imageFile);
      }

      console.log("Form Data",newItem);
      console.log("Sending FormData:", formData);

      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data", 
        },
      });

      // Update the state with the newly created item
      set((state) => ({
        items: [...state.items, response.data],
        loading: false,
      }));
    } catch (error) {
      console.error("Error adding item:", error);
      set({ error: error.message, loading: false });
    }
  },


  // Update an existing item
  updateItem: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, updatedData);
      set((state) => ({
        items: state.items.map((item) =>
          item._id === id ? response.data : item
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Delete an item
  deleteItem: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({
        items: state.items.filter((item) => item._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  isAdmin:async(itemId)=>{
    try{
      const res=await axios.get(`${API_URL}/admin/${itemId}`);
      console.log("resoonse",res);
      if (res.data.Access === 'true') {
        set({ access: true, error: null });
      } else {
        set({ access: false, error: "Access denied" });
      }
    }catch(error){
      set({ access: false, error: error.response?.data?.message || "Something went wrong" });
    }
  },

  claimItem: async (itemId)=>{
    const user = useAuthStore.getState().user;
    try{
      const res=axios.post(`${API_URL}/claim/${itemId}`,{
        userId: user._id,
      });
    }catch(error){
      console.log(error);
    }
  }

})));

