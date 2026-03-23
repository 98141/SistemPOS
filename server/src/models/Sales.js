import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
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
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unitCostSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    saleNumber: {
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
      type: [saleItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "La venta debe tener al menos un producto",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "efectivo",
      enum: ["efectivo", "transferencia", "nequi", "daviplata", "tarjeta", "mixto"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["completed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

saleSchema.index({ saleNumber: 1, date: -1 });

export default mongoose.model("Sale", saleSchema);