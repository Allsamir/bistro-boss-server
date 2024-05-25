import dotenv from "dotenv";
dotenv.config();
import { Router } from "express";
import Menu from "../models/menu.js";
import Review from "../models/review.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { verifyToken, verifyAdmin } from "../middlewares/verifyToken.js";
const router = Router();
//Menu Collection

router.get("/menus", async (req, res) => {
  try {
    const result = await Menu.find({});
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
  }
});

router.post("/menus", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const newMenu = new Menu(req.body);
    await newMenu.save();
    res.status(200).send({ success: true, message: "Menu Added Successfully" });
  } catch (err) {
    console.error(err);
  }
});
//Reviews Collection
router.get("/reviews", async (req, res) => {
  try {
    const result = await Review.find({});
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
  }
});
// Users Collection
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (err) {
    console.error(err);
  }
});
router.get("/user/admin", verifyToken, async (req, res) => {
  if (req.user.email !== req.query.email) {
    return res.status(403).send({ message: "Forbiden Access" });
  }
  const { email } = req.query;
  const role = await User.findOne({ email: email }, "role");
  res.status(200).send(role);
});
router.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const newUser = new User(user);
    await newUser.save().then(() => res.status(200).send({ success: true }));
  } catch (err) {
    console.error("User already exists");
    res.send({ success: false });
  }
});

router.patch("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    await User.findByIdAndUpdate(
      { _id: id },
      {
        role: "admin",
      },
      { new: true },
    );
    res.status(200).send({ message: "Admin Created" });
  } catch (err) {}
});
router.delete("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id, email } = req.query;
    await User.findByIdAndDelete({ _id: id });
    await Cart.findOneAndDelete({ email: email });
    res.status(200).send({ success: true });
  } catch (err) {
    console.error(err);
  }
});
//Carts Collection
router.get("/carts", verifyToken, async (req, res) => {
  try {
    const { email } = req.query;
    const result = await Cart.find({ email: email }, "cartItems");
    const [cart] = result;
    const cartItems = await Menu.find({ _id: { $in: cart?.cartItems } });
    res.status(200).send(cartItems);
  } catch (err) {
    console.error(err);
  }
});

router.post("/carts", verifyToken, async (req, res) => {
  try {
    const { email, cartItems } = req.body;
    const userEmailFromDB = await Cart.find({ email: email });
    if (userEmailFromDB.length === 0) {
      const newCart = new Cart({
        email: email,
        cartItems: [cartItems],
      });
      await newCart.save().then(() => {
        res.status(200).send({ message: "Food added to your cart" });
      });
    } else {
      await Cart.findOneAndUpdate(
        { email: email },
        {
          $push: {
            cartItems: cartItems,
          },
        },
        {
          new: true,
        },
      );
      res.status(200).send({ message: "Food added to your cart" });
    }
  } catch (err) {
    console.error(err);
  }
});

router.patch("/carts", verifyToken, async (req, res) => {
  try {
    const { id, email } = req.query;
    const result = await Cart.findOneAndUpdate(
      { email: email },
      {
        $pull: {
          cartItems: id,
        },
      },
      {
        new: true,
      },
    );
    if (result) res.status(200).send({ message: "Deleted from your cart" });
  } catch (err) {
    console.error(err);
  }
});
//JWT api

router.post("/jwt", async (req, res) => {
  try {
    const { email } = req.body;
    const token = jwt.sign(
      {
        email: email,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" },
    );
    res.status(200).send({ token: token });
  } catch (err) {
    console.log(err);
  }
});

export default router;
