import Claim from "../models/Claim.js";

import Chat from "../models/Chat.js";
import Item from "../models/Item.js";

export const initiateChatOnClaim = async (req, res) => {
  try {
    const { itemId } = req.body;
    const claimerId = req.user._id; // Current logged-in user

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Get the user who submitted the item
    const submitterId = item.ownerId || item.founderId;

    if (!submitterId) {
      return res.status(400).json({ message: "Item does not have a submitter yet" });
    }

    // Prevent duplicate chat
    let existingChat = await Chat.findOne({
      itemId,
      participants: { $all: [claimerId, submitterId] },
    });

    if (existingChat) {
      return res.json({ message: "Chat already exists", chatId: existingChat._id });
    }

    // Create new chat
    const chat = new Chat({
      itemId,
      participants: [claimerId, submitterId],
      messages: [],
    });

    await chat.save();

    res.status(201).json({
      message: "Chat initiated",
      chatId: chat._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



export const submitClaim = async (req, res) => {
  try {
    const { itemId, name, rollNo, department } = req.body;
    if (!itemId || !name || !rollNo || !department || !req.file) {
      return res
        .status(400)
        .json({
          message: "All fields are required, including identity card upload",
        });
    }

    const newClaim = new Claim({
      itemId,
      name,
      identityCard: req.file.path,
      rollNo,
      department,
    });

    await newClaim.save();
    res
      .status(201)
      .json({ message: "Claim submitted successfully", claim: newClaim });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all claims for a specific item
export const getClaimsByItem = async (req, res) => {
  try {
    const claims = await Claim.find({ itemId: req.params.itemId });
    if (!claims.length) {
      return res.status(404).json({ message: "No claims found for this item" });
    }
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get claim details by ID
export const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }
    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
