import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
  email: String,
  cartItems: [String],
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
