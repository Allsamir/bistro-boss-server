import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  console.log(req.headers);
  if (req.headers.token === "null") {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = req.headers.token;
  jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.user = decoded;
    next();
  });
};
export default verifyToken;
