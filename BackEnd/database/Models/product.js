import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    productDesc: {
      type: String,
      required: [true, "Product description is required"],
    },

    productImages: [
      {
        url: {
          type: String,
          required: true,
        },
        imageId: {
          type: String,
          required: true, // Cloudinary public_id
        },
      },
    ],

    productPrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
