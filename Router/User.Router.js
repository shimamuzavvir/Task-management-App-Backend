import express from 'express'
import { CreateTask, DeleteTask, GetAllTasks, GetUserTasks, ListAllUsers, LoginUser, RegisterUser,  SearchTasks,  UpdateTask } from '../Controller/User.Controller.js'
import authMiddleware from '../Middleware/Auth.Middleware.js'


const userRouter = express.Router()

userRouter.post('/register', RegisterUser)
userRouter.post('/login', LoginUser)
userRouter.get('/alluser', ListAllUsers)
userRouter.post('/createtask/:email', CreateTask)
userRouter.get('/getusertask/:email', GetUserTasks)
userRouter.get('/tasks', authMiddleware, GetAllTasks)
userRouter.put('/updatetask/:email/:taskId', UpdateTask)
userRouter.delete('/deletetask/:email/:taskId', DeleteTask)
userRouter.get('/search/:email', SearchTasks)




export default userRouter