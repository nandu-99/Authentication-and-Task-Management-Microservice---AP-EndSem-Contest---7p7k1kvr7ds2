const express = require('express');
const dotenv = require('dotenv');
const {prisma} = require('./db/config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

dotenv.config();
const app = express();
app.use(express.json());


// Write your code
app.post('/api/auth/signup', async (req, res)=>{
  const {username, email, password} = req.body; 
  try{
    if(!username || !email || !password){
      return res.status(400).json({
        "error": "All fields are required"
      })
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email
      }
    })
    if(existingUser){
      return res.status(400).json({
        "error": "User already exists"
      })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: {
        username: username, 
        email: email, 
        password: hashedPassword
      }
    })
    return res.status(201).json({
      "message": "User created successfully"
    })
  }catch(e){
    console.log(e)
    return res.status(500).json("Internal server error")
  }
})

app.post('/api/auth/login', async (req, res)=>{
  const {email, password} = req.body; 
  try{
    if(!email || !password){
      return res.status(400).json({
        "error": "All fields are required"
      })
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email
      }
    })
    const validPassword = await bcrypt.compare(password, existingUser.password)
    if(!validPassword){
      return res.status(401).json({
        "error": "Invalid credentials"
      }
      )
    }
    const token = jwt.sign({id: existingUser.id}, process.env.JWT_SECRET)
    return res.status(200).json({
      "message": "Login successful",
      "token": token
  })
  }catch(e){
    console.log(e)
    res.status(500).json("Internal server error")
  }
})

app.post('/api/task/create', async (req, res)=>{
  const token = req.headers["authorization"];
  const {task} = req.body;
  try{
    if(!token){
      return res.status(401).json({
        "error": "No token provided"
      })
    }
    const validToken = jwt.verify(token, process.env.JWT_SECRET)
    if(!validToken){
      return res.status(401).json({
        "error": "Unauthorized"
      })
    }
    if(!task){
      return res.status(400).json({
        "error": "Task content is required"
      })
    }

    const newTask = await prisma.task.create({
      data: {
        task: task, 
        userId: validToken.id
      }
    })

    return res.status(201).json({
      "message": "Task created successfully",
      "task": newTask
    })
  }catch(e){
    console.log(e)
    return res.status(500).json("Internal server error")
  }
})

app.get('/api/task/getAll', async (req, res)=>{
  const token = req.headers["authorization"]
  try{
    if(!token){
      return res.status(401).json({
        "error": "No token provided"
      })
    }
    const validToken = jwt.verify(token, process.env.JWT_SECRET, (err)=>{
      if(err){
        return res.status(401).json({
          "error": "Unauthorized"
        })
      }
    })
    if(!validToken){
      return res.status(401).json({
        "error": "Unauthorized"
      })
    }
    const tasks = await prisma.task.findMany()
    return res.status(200).json({
      "tasks": tasks
    })
  }catch(e){
    console.log(e)
    return res.status(500).json("Internal server error")
  }
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

module.exports={app};
