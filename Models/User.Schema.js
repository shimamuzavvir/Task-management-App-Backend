// User.Schema.js

import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    deadline: Date,
    status: {
        type: String,
        enum: ["Pending", "InProgress", "Completed"],
        default: "Pending"
    }
});

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    tasks: [taskSchema]
}, { versionKey: false });

const User = mongoose.model('User', userSchema);

export default User;
