import express, { Router } from "express";
import Menu from "../models/menu.js";
import Review from "../models/review.js";
const router = Router();

router.get("/menus", async (req, res) => {
  try {
    const result = await Menu.find({});
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
  }
});

router.get("/reviews", async (req, res) => {
  try {
    const result = await Review.find({});
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
  }
});

export default router;
