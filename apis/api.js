import dotenv from "dotenv";
dotenv.config();
import { Router } from "express";
import Menu from "../models/menu.js";
import Review from "../models/review.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
import Payment from "../models/payments.js";
import jwt from "jsonwebtoken";
import { verifyToken, verifyAdmin } from "../middlewares/verifyToken.js";
import Stripe from "stripe";
import mongoose from "mongoose";
import axios from "axios";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = Router();

//Menu Collection

router.get("/menus", async (req, res) => {
  // to get all the menus in order page
  try {
    const result = await Menu.find({});
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
  }
});

router.get("/menus/:menuID", async (req, res) => {
  // to get a single menu
  try {
    const { menuID } = req.params;
    const singleMenu = await Menu.findById({ _id: menuID });
    res.status(200).send(singleMenu);
  } catch (err) {
    console.error(err);
  }
});

router.post("/menus", verifyToken, verifyAdmin, async (req, res) => {
  // to add a new menu or item in the app
  try {
    const newMenu = new Menu(req.body);
    await newMenu.save();
    res.status(200).send({ success: true, message: "Menu Added Successfully" });
  } catch (err) {
    console.error(err);
  }
});
router.patch("/menus/:menuID", verifyToken, verifyAdmin, async (req, res) => {
  // to update an existing item or menu
  try {
    const updatedItem = req.body;
    const { menuID } = req.params;
    await Menu.findByIdAndUpdate(
      { _id: menuID },
      {
        name: updatedItem.name,
        category: updatedItem.category,
        image: updatedItem.image,
        recipe: updatedItem.recipe,
        price: updatedItem.price,
      },
      {
        new: true,
      },
    );
    res
      .status(200)
      .send({ success: true, message: "Menu successfully updated" });
  } catch (err) {
    console.error(err);
  }
});
router.delete("/menus", verifyToken, verifyAdmin, async (req, res) => {
  // to delete a menu or item in the app
  try {
    const { id } = req.query;
    await Menu.findByIdAndDelete({ _id: id });
    res.status(200).send({ success: true, message: "Menu Deleted!" });
  } catch (err) {
    console.error(err);
  }
});
//Reviews Collection
router.get("/reviews", async (req, res) => {
  // to get all the reviews of users
  try {
    const result = await Review.find({});
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
  }
});
router.post("/reviews", verifyToken, async (req, res) => {
  try {
    const { name, details, rating } = req.body;
    const newReview = new Review({ name, details, rating });
    await newReview.save();
    res
      .status(201)
      .send({ success: true, message: "Thanks for you kind review" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// Users Collection
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  // to get all the existing users
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (err) {
    console.error(err);
  }
});
router.get("/user/admin", verifyToken, async (req, res) => {
  // to get the role of the user
  if (req.user.email !== req.query.email) {
    return res.status(403).send({ message: "Forbiden Access" });
  }
  const { email } = req.query;
  const role = await User.findOne({ email: email }, "role");
  res.status(200).send(role);
});
router.post("/users", async (req, res) => {
  // to register a user in the app in the register page
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
  // to update the user role
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
  // to delete the user from the app{admin only}
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
  // to get the users cart details
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
  // to add a new item in the user's cart
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
  // to delete an item from the user's cart
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
  // creating or generating jwt token to verify api and user
  try {
    const { email } = req.body;
    const token = jwt.sign(
      {
        email: email,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" },
    );
    res.status(200).send({ token: token });
  } catch (err) {
    console.log(err);
  }
});

// payment api

router.get("/payments", verifyToken, async (req, res) => {
  // to get the payments of the user
  const { email } = req.query;
  const result = await Payment.find({ email: email });
  res.status(200).send(result);
});

router.post("/create-payment-intent", verifyToken, async (req, res) => {
  // to create a payment intent for stripe payment
  try {
    const { price } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "usd",
      amount: price,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).send({
      errorMessage: error.message,
    });
  }
});

router.post(`/payments`, verifyToken, async (req, res) => {
  // to add a paymentinfo of user
  const { paymentInfo } = req.body;
  const savePaymentInfo = new Payment(paymentInfo);
  await savePaymentInfo.save();
  const result = await Cart.findOneAndUpdate(
    { email: paymentInfo.email },
    {
      $pull: {
        cartItems: { $in: paymentInfo.order },
      },
    },
    {
      new: true,
    },
  );
  if (result) {
    res.status(200).send({ success: true });
  }
});

// SSL commerce payment getway apis

router.post("/ssl-payment", verifyToken, async (req, res) => {
  try {
    const paymentInfo = req.body;
    const txID = new mongoose.Types.ObjectId().toString();
    const initialData = {
      store_id: "samir66697a417129a",
      store_passwd: "samir66697a417129a@ssl",
      total_amount: paymentInfo.price,
      currency: "USD",
      tran_id: txID,
      success_url: "https://cafe-gratitude-server.vercel.app/success-payment", // change later with server domain
      fail_url: "https://cafe-gratitude-server.vercel.app/fail-payment",
      cancel_url: "https://cafe-gratitude-server.vercel.app/cancel-payment",
      cus_name: paymentInfo.name,
      cus_email: paymentInfo.email,
      product_category: "General",
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01711111111",
      cus_fax: "01711111111",
      shipping_method: "NO",
      product_name: "Foods",
      product_category: "Food",
      product_profile: "physical-goods",
      multi_card_name: "mastercard,visacard,amexcard",
      value_a: "ref001_A",
      value_b: "ref002_B",
      value_c: "ref003_C",
      value_d: "ref004_D",
    };
    const respone = await axios({
      method: "post",
      url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      data: initialData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (respone.statusText === "OK") {
      const newPaymentInfo = new Payment({
        email: paymentInfo.email,
        name: paymentInfo.name,
        price: paymentInfo.price,
        order: paymentInfo.order,
        status: paymentInfo.status,
        tran_id: txID,
      });
      await newPaymentInfo
        .save()
        .then(() => console.log("SSL Paymentinfo saved"));
    }
    res.status(200).json({
      paymentURL: respone.data.GatewayPageURL,
    });
  } catch (error) {
    console.error(error);
  }
});

router.post("/success-payment", async (req, res) => {
  try {
    const responseFromSSLCommerce = req.body;
    if (responseFromSSLCommerce.status !== "VALID") {
      return res.status(401).send("Unauthorized Access");
    }
    const updatePaymentStatus = await Payment.findOneAndUpdate(
      {
        tran_id: responseFromSSLCommerce.tran_id,
      },
      {
        status: "Successfull Payment",
      },
      {
        new: true,
      },
    );
    if (updatePaymentStatus) {
      const clearCart = await Cart.findOneAndUpdate(
        { email: updatePaymentStatus.email },
        {
          $pull: {
            cartItems: { $in: updatePaymentStatus.order },
          },
        },
        {
          new: true,
        },
      );
      if (clearCart) {
        res.redirect(
          "https://bistro-boss-03.web.app/dashboard/payment-ssl-success",
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
});

router.post(`/fail-payment`, async (req, res) => {
  res.redirect("https://bistro-boss-03.web.app/dashboard/cart");
});
router.post(`/cancel-payment`, async (req, res) => {
  res.redirect("https://bistro-boss-03.web.app/dashboard/cart");
});

// App stats

router.get("/app-stats", verifyToken, verifyAdmin, async (req, res) => {
  // app stats of the app
  try {
    const users = await User.countDocuments();
    const menus = await Menu.countDocuments();
    const orders = await Payment.countDocuments();
    // this is not the best way
    const revenueResult = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
        },
      },
    ]);
    const revenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.send({ users, menus, orders, revenue });
  } catch (error) {
    console.error(error);
  }
});

// order stats api

router.get("/order-stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const order = await Payment.aggregate([
      { $unwind: "$order" },
      {
        $addFields: {
          order: { $toObjectId: "$order" },
        },
      },
      {
        $lookup: {
          from: "menus",
          localField: "order",
          foreignField: "_id",
          as: "menuDetails",
        },
      },
      { $unwind: "$menuDetails" },
      {
        $group: {
          _id: "$menuDetails.category",
          totalRevenue: { $sum: "$menuDetails.price" },
          quantity: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalRevenue: 1,
          quantity: 1,
        },
      },
    ]);

    res.json(order);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching order statistics" });
  }
});

// user stats api

router.get(`/user-stats`, verifyToken, async (req, res) => {
  try {
    const { email, name } = req.query;
    const payments = await Payment.countDocuments({ email: email });
    const reviews = await Review.countDocuments({ name: name });
    const orders = await Payment.aggregate([
      { $match: { email: email } },
      { $unwind: "$order" },
      { $group: { _id: "$email", totalOrders: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
        },
      },
    ]);
    const [totalOrders] = orders;
    res.send({ orders: totalOrders.totalOrders, payments, reviews });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
