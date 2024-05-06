import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../Models/User.Schema.js'

dotenv.config()

// Register user

export const RegisterUser = async(req, res)=>{
    try {
        const {firstname, lastname, email, password, role} = req.body
        const hashPassword = await bcrypt.hash(password, 10)

        const user = await User.findOne({email})
        if(user){
            return res.status(409).json({message:"username already exist"})
        }
        const newUser = new User({firstname, lastname, email, password:hashPassword, role})
        await newUser.save()
        res.status(200).json({message:"registered successfully", data:newUser})
        
    } catch (error) {
       console.log(error)
       res.status(500).json({error:"Internal Server Error"}) 
    }
}


// login User

export const LoginUser = async(req, res) =>{
    try {
      const {email, password} = req.body

      const user = await User.findOne({email}) 
      if(!user){
        return res.status(401).json({message:"user not found"})
      }

      const passwordMatch = await bcrypt.compare(password, user.password)
      if(!passwordMatch) {
        return res.status(401).json({message:"invalid password"})
      }

      const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET)
      user.token = token
      await user.save()
      res.status(200).json({message:"login successfully", token:token, data:user})
      
    } catch (error) {
      console.log(error);
      res.status(200).json({error:"internal server failed"})
      
    }
  }


  // Get all user

  export const ListAllUsers = async (req, res) => {
    try {
      const allusers = await User.find();
  
      res.status(200).json({
        message: "All Users Fetched Successfully",
        data: allusers,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


  //Authorized user

  export const AdminDashboard = async (req, res) => {
    try {
      // console.log(req.user)
      const userId = req.user._id;
  
      // Fetch the user document of the logged-in user
      const user = await User.findById(userId);
  
      // Check if the logged-in user is an admin
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. User is not an admin." });
      }
  
  
      res.status(200).json({ message: "Authorized User",data: user  }); //data: [user] 
    } catch (error) {
      console.log(error);
      res.status(500).json({ err: "Internal server Error " });
    }
  };


//create Task


export const CreateTask = async (req, res) => {
    try {
        const { email } = req.params; // Assuming email is passed in the URL
        const { title, description, deadline } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newTask = { title, description, deadline, isDone: false };
        user.tasks.push(newTask);
        await user.save();
        res.status(200).json({ message: "Task created successfully", data: newTask });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



//getuser task

export const GetUserTasks = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Modify the response data to include taskId
        const tasksWithIds = user.tasks.map(task => ({
            ...task.toObject(), // Convert Mongoose object to plain JavaScript object
            taskId: task._id // Add taskId to the task object
        }));
        res.status(200).json({ message: "Tasks fetched successfully", data: tasksWithIds });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


//get all user with their task

export const GetAllTasks = async (req, res) => {
    try {
        // console.log(req.user)
      const userId = req.user._id;
  
      // Fetch the user document of the logged-in user
      const user = await User.findById(userId);
  
      // Check if the logged-in user is an admin
      if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. User is not an admin." });
        }

        // Find all users and populate their tasks
        const allUsersWithTasks = await User.find().populate('tasks');

        res.status(200).json({ message: "All tasks fetched successfully", data: allUsersWithTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}



//update task
export const UpdateTask = async (req, res) => {
    try {
        const { email, taskId } = req.params;
        const { status, deadline } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const task = user.tasks.find(task => task._id.toString() === taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (status) {
            task.status = status;
        }

        if (deadline) {
            task.deadline = deadline;
        }

        await user.save();

        res.status(200).json({ message: "Task updated successfully", data: task });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// delete task


export const DeleteTask = async (req, res) => {
    try {
        const { email, taskId } = req.params;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const taskIndex = user.tasks.findIndex(task => task._id.toString() === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Remove the task from the tasks array
        user.tasks.splice(taskIndex, 1);
        // Save the updated user object
        await user.save();
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


//search task

export const SearchTasks = async (req, res) => {
    try {
        const { email } = req.params;
        const { keyword } = req.query;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const filteredTasks = user.tasks.filter(task =>
            task.title.toLowerCase().includes(keyword.toLowerCase()) ||
            task.description.toLowerCase().includes(keyword.toLowerCase())
        );

        res.status(200).json({ message: "Tasks fetched successfully", data: filteredTasks });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
