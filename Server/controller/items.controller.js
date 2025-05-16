import Item from "../models/item.model.js";
import mongoose from "mongoose";


// Get all items (either Lost or Found)
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("ownerId", "name")
      .populate("founderId", "name")
      .exec();
    res.status(200).json(items); // Respond with the items in JSON format

    console.log(items)
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving items", error: error.message });
  }
};

export const createItem = async (req, res) => {
  try {
    const { itemName, itemType, date, time, location, description, status } =
      req.body;
    const reporterId = req.userId;

    if (!reporterId) {
      return res.status(400).json({ message: "Reporter ID is required" });
    }

    if (!["Lost", "Found"].includes(itemType)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Must be 'Lost' or 'Found'" });
    }

   
    console.log("File received:", req.file);
    const image = req.file ? req.file.path.replace(/\\/g, "/") : null;

  
    let itemData = {
      itemName,
      itemType,
      date,
      time,
      location,
      description,
      status,
      images: image ? [image] : [], 
    };

   
    if (itemType === "Lost") {
      itemData.ownerId = reporterId; // Reporter is the owner in case of a lost item
    } else if (itemType === "Found") {
      itemData.founderId = reporterId; // Reporter is the founder in case of a found item
    }

    const newItem = new Item(itemData);
    console.log(newItem);

    await newItem.save();
    res
      .status(201)
      .json({ message: "Item created successfully", item: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getUserItems = async (req, res) => {
  try {
    const userId = req.userId; // Get the logged-in user's ID from the request

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }


    const items = await Item.find({
      $or: [{ ownerId: userId }, { founderId: userId }],
    })
      .populate("ownerId", "name")
      .populate("founderId", "name")
      .sort({ createdAt: -1 }) // Show the latest items first
      .lean()
      .exec();

    res.status(200).json(items);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user items", error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .lean()
      .exec();

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating item status", error: error.message });
  }
};


// Update an item by ID
export const updateItemById = async (req, res) => {
  const { id } = req.params; // Extract the item ID from the URL parameters
  const {
    itemName,
    itemType,
    date,
    time,
    location,
    description,
    status,
    images,
  } = req.body;

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        itemName,
        itemType,
        date,
        time,
        location,
        description,
        status,
        images,
      },
      { new: true } // Return the updated item after modification
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(updatedItem); // Respond with the updated item
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating item", error: error.message });
  }
};

// Delete an item by ID
export const deleteItemById = async (req, res) => {
  const { id } = req.params; // Extract the item ID from the URL parameters

  try {
    const deletedItem = await Item.findByIdAndDelete(id); // Delete the item by its ID
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" }); // Respond with a success message
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting item", error: error.message });
  }
};

export const isAdmin = async(req,res)=>{
  const { userId } = req;
  const {itemId}=req.params;
 

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid itemId or userId" });
    }

    // Find the item by ID and match either founderId or ownerId
    const item = await Item.findOne({
      _id: itemId,
      $or: [{ founderId: userId }, { ownerId: userId }],
    });

    if (item) {
      return res.status(200).json({ message: "Access granted", item, Access: "true" });
      
    }
    return res.json({ message: "Access denied. Not related to this item.", Access: "false" });
   
  } catch (error) {
    console.error("Error checking item access:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const claimItem= async(req,res)=>{
  const { itemId } = req.params;
  const { userId } = req.body; 
  console.log("user",userId);

  try {
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.claimers.includes(userId)) {
      return res.json({ message: "You have already claimed this item" });
    }

    item.claimers.push(userId);
    await item.save();

    return res.status(200).json({ message: "Item claimed successfully", item });
  } catch (error) {
    console.error("Error claiming item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

}
