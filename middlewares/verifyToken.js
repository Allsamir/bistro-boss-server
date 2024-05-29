import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from "../models/user.js";
const verifyToken = (req, res, next) => {
  // verify jwt token
  if (req.headers.token === "null") {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = req.headers.token;
  jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.user = decoded;
    next();
  });
};
const verifyAdmin = async (req, res, next) => {
  // verify user role or admin
  const { email } = req.user;
  const user = await User.findOne({ email: email });
  const isAdmin = user?.role === "admin";
  if (!isAdmin) {
    return res.status(403).send({ message: "Forbidden access" });
  }
  next();
};
export { verifyToken, verifyAdmin };
