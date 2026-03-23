import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    skuSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    nameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    unitMeasureSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    items: {
      type: [purchaseItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "La compra debe tener al menos un producto",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

purchaseSchema.index({ purchaseNumber: 1, date: -1 });

export default mongoose.model("Purchase", purchaseSchema);