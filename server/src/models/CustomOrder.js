import mongoose from "mongoose";

const customOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    clientName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    clientPhone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },
    estimatedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "in_progress", "completed", "delivered", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 400,
      default: "",
    },
  },
  { timestamps: true }
);

customOrderSchema.index({ orderNumber: 1, createdAt: -1 });
customOrderSchema.index({ status: 1 });

export default mongoose.model("CustomOrder", customOrderSchema);