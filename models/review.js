import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
  name: String,
  details: String,
  rating: Number,
});

const Review = mongoose.model("reviews", reviewSchema);

export default Review;
