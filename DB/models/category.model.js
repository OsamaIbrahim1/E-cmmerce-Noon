import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true, unique: true },
    },
    folderId: { type: String, required: true, unique: true },
    disabledAt: {
      type: String,
    },
    disabledBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    enabledBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    enabledAt: {
      type: String,
    },
    addedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true }, // Super Admin
    updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("subCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "categoryId",
});

export default mongoose.models.Category ||
  mongoose.model("Category", categorySchema);
