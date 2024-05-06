import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import userRouter from './Router/User.Router.js'
import connectDB from './Database/Config.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.options('*', cors())


const port = process.env.PORT 

app.use('/api/user', userRouter)

connectDB()
app.listen(port,()=>{
    console.log('app is listening in the port-', port);
})