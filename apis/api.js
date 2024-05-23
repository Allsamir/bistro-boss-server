import express, { Router } from "express";
import Menu from "../models/menu.js";
import Review from "../models/review.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
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

router.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const newUser = new User(user);
    await newUser.save().then(() => res.status(200).send({ success: true }));
  } catch (err) {
    console.error(err);
  }
});

//Carts Collection
router.get("/carts", async (req, res) => {
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

router.post("/carts", async (req, res) => {
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

router.patch("/carts", async (req, res) => {
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

export default router;
