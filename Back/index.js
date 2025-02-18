import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import checkinoutRouter from './routes/checkinout.route.js';
import equipmentRouter from './routes/equipment.route.js'; // Import the equipment routes
import bookingRouter from './routes/booking.route.js'; // Import the booking routes

dotenv.config();

mongoose
    .connect(process.env.MONGO)
    .then(() => {
    console.log('Connected to MongoDB');
}   
).catch((err) => {
    console.log('Error:', err);
}
);

const app = express();

app.use(express.json());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.use("/Back/user", userRouter);
app.use("/Back/auth", authRouter);
app.use("/Back/checkinout", checkinoutRouter);
app.use('/Back/equipment', equipmentRouter); // Add the equipment routes
app.use('/Back/bookings', bookingRouter); // Add the booking routes