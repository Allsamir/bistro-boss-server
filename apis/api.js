import express, { Router } from "express";
import Menu from "../models/menu.js";
import Review from "../models/review.js";
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
//Carts Collection
router.post("/carts", async (req, res) => {
  try {
  } catch (err) {}
});

export default router;
