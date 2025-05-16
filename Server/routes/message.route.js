import express from "express"
import { getUsersForSidebar ,getMessages, sendMessage} from "../controller/message.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/users/:itemId", verifyToken, getUsersForSidebar);
router.get("/:id", verifyToken, getMessages);
router.post("/send/:id", verifyToken,sendMessage);

export default router;