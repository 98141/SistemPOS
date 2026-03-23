import mongoose from "mongoose";

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["purchase", "sale", "manual_adjustment"],
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },
    newStock: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceType: {
      type: String,
      required: true,
      enum: ["purchase", "sale", "manual_adjustment"],
    },
    referenceId: {
      type: String,
      trim: true,
      default: "",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  { timestamps: true }
);

inventoryMovementSchema.index({ createdAt: -1 });
inventoryMovementSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model("InventoryMovement", inventoryMovementSchema);