const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const subCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    image: {
        type: String,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true, 
    },
});

subCategorySchema.plugin(timestamps);
module.exports = mongoose.model("subCategory", subCategorySchema);
