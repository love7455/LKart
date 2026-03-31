import ProductModel from "../database/Models/product.js";
import cloudinary from "../utils/cloudinary.js";
import { User } from "../database/Models/usermodel.js";

const uploadImageBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });

const deleteCloudinaryImages = async (imageIds = []) => {
  const validIds = imageIds.filter(Boolean);
  if (!validIds.length) return;
  await cloudinary.api.delete_resources(validIds);
};

// Add product
const addProduct = async (req, res) => {
  const uploadedImageIds = [];
  try {
    const { productName, productDesc, productPrice, category, brand } = req.body;

    if (!productName || !productDesc || !productPrice || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product images are required",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadImageBuffer(file.buffer, "ecommerce_products");
      uploadedImageIds.push(result.public_id);
      uploadedImages.push({
        url: result.secure_url,
        imageId: result.public_id,
      });
    }

    const product = await ProductModel.create({
      userId: req.user._id,
      productName,
      productDesc,
      productPrice,
      category,
      brand,
      productImages: uploadedImages,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    await deleteCloudinaryImages(uploadedImageIds);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all products
const getAllProcuts = async (req, res) => {
  try {
    const products = await ProductModel.find();
    return res.status(200).json({
      success: true,
      message: "Operation completed",
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product
const deleteProdcut = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "No product found",
      });
    }

    const imageIds = product.productImages.map((img) => img.imageId);
    await deleteCloudinaryImages(imageIds);

    await product.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  const newImageIds = [];
  try {
    const { productId } = req.params;
    const { productName, productDesc, productPrice, category, brand } = req.body;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.productName = productName || product.productName;
    product.productDesc = productDesc || product.productDesc;
    product.productPrice = productPrice || product.productPrice;
    product.category = category || product.category;
    product.brand = brand || product.brand;

    if (req.files && req.files.length > 0) {
      const oldImageIds = product.productImages.map((img) => img.imageId);
      const uploadedImages = [];

      for (const file of req.files) {
        const result = await uploadImageBuffer(file.buffer, "ecommerce_products");
        newImageIds.push(result.public_id);
        uploadedImages.push({
          url: result.secure_url,
          imageId: result.public_id,
        });
      }

      product.productImages = uploadedImages;
      await product.save();
      await deleteCloudinaryImages(oldImageIds);
    } else {
      await product.save();
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    await deleteCloudinaryImages(newImageIds);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const seedDemoProducts = async (req, res) => {
  try {
    const existingCount = await ProductModel.countDocuments();
    if (existingCount >= 8) {
      return res.status(200).json({
        success: true,
        message: "Demo products are already available",
      });
    }

    const owner = await User.findOne({ role: "admin" }).select("_id");
    const fallbackOwner = owner || (await User.findOne().select("_id"));

    if (!fallbackOwner?._id) {
      return res.status(400).json({
        success: false,
        message: "Create a user account first, then seed demo products",
      });
    }

    const demoProducts = [
      {
        productName: "Nova X Pro Smartphone",
        productDesc:
          "6.7 inch AMOLED display, 8GB RAM, 256GB storage and long battery life.",
        productPrice: 32999,
        category: "Mobiles",
        brand: "Nova",
        productImages: [
          {
            url: "https://picsum.photos/seed/lkart-phone/1000/1000",
            imageId: "seed_phone_1",
          },
        ],
      },
      {
        productName: "AeroBeat Wireless Headphones",
        productDesc:
          "Noise cancellation, fast charging and deep bass for immersive audio.",
        productPrice: 3999,
        category: "Audio",
        brand: "AeroBeat",
        productImages: [
          {
            url: "https://picsum.photos/seed/lkart-headphones/1000/1000",
            imageId: "seed_audio_1",
          },
        ],
      },
      {
        productName: "StrideFit Running Shoes",
        productDesc:
          "Lightweight breathable shoes designed for running and daily comfort.",
        productPrice: 2199,
        category: "Fashion",
        brand: "StrideFit",
        productImages: [
          {
            url: "https://picsum.photos/seed/lkart-shoes/1000/1000",
            imageId: "seed_fashion_1",
          },
        ],
      },
      {
        productName: "ChefMate Nonstick Cookware Set",
        productDesc:
          "Premium 5-piece cookware set for easy cooking and quick cleanup.",
        productPrice: 2899,
        category: "Home & Kitchen",
        brand: "ChefMate",
        productImages: [
          {
            url: "https://picsum.photos/seed/lkart-cookware/1000/1000",
            imageId: "seed_home_1",
          },
        ],
      },
      {
        productName: "ZenBook Air 14",
        productDesc:
          "Thin and light laptop with 16GB RAM and 512GB SSD for multitasking.",
        productPrice: 58999,
        category: "Laptops",
        brand: "ZenBook",
        productImages: [
          {
            url: "https://picsum.photos/seed/lkart-laptop/1000/1000",
            imageId: "seed_laptop_1",
          },
        ],
      },
      {
        productName: "Pulse Smartwatch Gen 5",
        productDesc:
          "Track fitness, monitor heart rate and receive calls from your wrist.",
        productPrice: 5499,
        category: "Wearables",
        brand: "Pulse",
        productImages: [
          {
            url: "https://picsum.photos/seed/lkart-watch/1000/1000",
            imageId: "seed_watch_1",
          },
        ],
      },
    ];

    const existingNames = new Set(
      (await ProductModel.find({}, "productName")).map((item) => item.productName),
    );

    const productsToInsert = demoProducts
      .filter((item) => !existingNames.has(item.productName))
      .map((item) => ({
        ...item,
        userId: fallbackOwner._id,
      }));

    if (!productsToInsert.length) {
      return res.status(200).json({
        success: true,
        message: "Demo products are already seeded",
      });
    }

    await ProductModel.insertMany(productsToInsert);

    return res.status(201).json({
      success: true,
      message: `${productsToInsert.length} demo products added successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  addProduct,
  getAllProcuts,
  deleteProdcut,
  updateProduct,
  getProductById,
  seedDemoProducts,
};
