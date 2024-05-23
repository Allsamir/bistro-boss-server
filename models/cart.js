import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  cartItems: [String],
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
