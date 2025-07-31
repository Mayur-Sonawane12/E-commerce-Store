import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';


//File import
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js'
import cartRoutes from './routes/cartRoutes.js';
 
dotenv.config();
const app = express();
app.use(cors({ 
    origin: ['http://localhost:5173', 'https://e-commerce-store-website1.netlify.app', 'https://mayur-sonawane12.github.io/E-commerce-Store'] 
}));
app.use(express.json());

//Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

//DB connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("---------DB Connected ...!------------");
})
.catch((err)=>{
    console.log(`DB cannot be connected,${err}`);
    
})

app.listen(5000);
