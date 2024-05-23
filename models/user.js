import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  name: String,
});

const User = mongoose.model("User", userSchema);

export default User;
