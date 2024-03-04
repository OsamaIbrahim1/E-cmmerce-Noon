import mongoose from "mongoose";

const couponUserSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    maxUsage: {
      type: Number,
      required: true,
      min: 1,
    },

    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

couponUserSchema.index({ couponId: 1, userId: 1 }, { unique: true });

export default mongoose.models.CouponUsers ||
  mongoose.model("CouponUsers", couponUserSchema);
