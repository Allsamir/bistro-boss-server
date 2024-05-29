import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  email: String,
  name: String,
  price: Number,
  transactionID: String,
  time: Date,
  order: [String],
  status: String,
});

const Payment = new mongoose.model("Payment", paymentSchema);
export default Payment;
