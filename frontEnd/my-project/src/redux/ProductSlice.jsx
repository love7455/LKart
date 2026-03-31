import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  cart: [],
  wishlist: [],
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    addToCart: (state, action) => {
      state.cart = action.payload;
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cart = state.cart.filter(
        (item) => item.productId._id !== productId,
      );
    },

    clearCart: (state) => {
      state.cart = [];
    },
    setWishlist: (state, action) => {
      state.wishlist = action.payload;
    },
  },
});

export const { setProducts, addToCart, removeFromCart, clearCart, setWishlist } =
  productSlice.actions;

export default productSlice.reducer;
