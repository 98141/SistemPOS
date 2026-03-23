import mongoose from "mongoose";

const productVariableSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true,
      maxlength: 60,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unitMeasure: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    minStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    variables: {
      type: [productVariableSchema],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 400,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ stock: 1 });

export default mongoose.model("Product", productSchema);