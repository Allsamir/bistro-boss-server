import express, { Router } from "express";
const router = Router();

router.get("/menus", (req, res) => {
  res.send("Hi I'm from Menu");
});

export default router;
