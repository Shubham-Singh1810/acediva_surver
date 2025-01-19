const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const installationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rate: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subCategory",
    required: true,
  },
  description: [{ type: String }],
});

installationSchema.plugin(timestamps);
module.exports = mongoose.model("installation", installationSchema);
