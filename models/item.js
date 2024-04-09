// Import the mongoose module
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define the schema for the item model
const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});
// Virtual for item's URL
itemSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/category/item/${this._id}`;
});

module.exports = mongoose.model("Item", itemSchema);
