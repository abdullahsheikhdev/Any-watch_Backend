import express  from "express";
import { adminAddMovie, adminLogin, adminLogout, createShow, deleteMovie, deleteShow, moviesList, updateMovieStatus, getShows, updateShow } from "../controllers/adminController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.post('/logout', adminLogout);


adminRouter.post('/add-movie', adminAuthMiddleware, adminAddMovie);
adminRouter.post('/add-show', adminAuthMiddleware, createShow)

adminRouter.get('/all-movies', adminAuthMiddleware, moviesList)
adminRouter.get('/all-shows', adminAuthMiddleware, getShows)


adminRouter.delete('/delete-movie/:id', adminAuthMiddleware, deleteMovie)
adminRouter.delete('/delete-show/:id', adminAuthMiddleware, deleteShow)
adminRouter.patch('/update-status/:id', adminAuthMiddleware, updateMovieStatus)
adminRouter.put('/edit-show/:id', adminAuthMiddleware, updateShow)

export default adminRouter;