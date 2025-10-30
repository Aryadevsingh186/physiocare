import express from 'express'
import exerciseRoutes from "./routes/exerciseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import cors from 'cors'
import 'dotenv/config'

//Initiaze Express 
const app = express()

// Connect to database 

//MiddleWares
app.use(cors())
app.use(express.json())

//Routes
app.get('/',(req,res)=> res.send("API Working "))

app.use("/api/exercise", exerciseRoutes);
app.use("/api/report", reportRoutes);

//PORT 
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
  console.log(`Server is ruuning on port ${PORT}`)
})