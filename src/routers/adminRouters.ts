import express  from "express";
import { adminAddMovie, adminLogin, adminLogout, moviesList } from "../controllers/adminController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.post('/logout', adminLogout);


adminRouter.post('/add-movie', adminAuthMiddleware, adminAddMovie);

adminRouter.get('/all-movis', adminAuthMiddleware, moviesList)

export default adminRouter;