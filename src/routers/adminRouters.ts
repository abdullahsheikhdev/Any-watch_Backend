import express  from "express";
import { adminLogin, adminLogout } from "../controllers/adminController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.post('/logout', adminLogout);

// Route to check if admin is authenticated
adminRouter.get('/is-auth', adminAuthMiddleware, (req, res) => {
    res.json({ success: true, message: 'Authenticated' });
});

export default adminRouter;