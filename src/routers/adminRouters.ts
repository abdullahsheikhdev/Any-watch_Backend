import express  from "express";
import { adminLogin, adminLogout } from "../controllers/adminController.js";
import { adminAuthMiddleware } from "../middleware/adminMiddleware.js";


const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.post('/logout', adminAuthMiddleware ,adminLogout);







export default adminRouter;