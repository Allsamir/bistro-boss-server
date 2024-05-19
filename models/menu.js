import mongoose from "mongoose";

const menuScheam = mongoose.Schema({
  name: String,
  recipe: String,
  image: String,
  category: String,
  price: Number,
});

const Menu = mongoose.model("menus", menuScheam);

export default Menu;
