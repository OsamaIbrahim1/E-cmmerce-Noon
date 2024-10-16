import Cart from "../../../DB/models/cart.model.js";
import Product from "../../../DB/models/product.model.js";
import { addCart } from "./utils/add-cart.js";
import { pushNewProduct } from "./utils/add-product-to-cart.js";
import { calculateSubTotal } from "./utils/calculate-SubTotal.js";
import { checkProductAvailability } from "./utils/check-product-in-db.js";
import { getUserCart } from "./utils/get-user-cart.js";
import { updateProductQuantity } from "./utils/update-product-quantity.js";

//================================= add Product To Cart =================================//
/**
 * @param { productId , quantity }  from req.body
 * @param { userId } from req.authUser
 * @description  Add the specified product to the user's cart.
 * @returns  the updated cart with the new product added to it or the new cart if the user doesn't have a cart.
 * @throws 404 - if the product not found or not available
 * @throws 400 - if the product not added to cart
 * @throws 201 - if the product added to cart successfully
 * @throws 500 - if any error occurs
 */
export const addProductToCart = async (req, res, next) => {
  const { _id } = req.authUser;
  const { productId, quantity } = req.body;

  // * check if the product exists and if it's available
  const product = await checkProductAvailability(productId, quantity);
  if (!product) {
    return next({
      message: "Product is not found or not available",
      cause: 404,
    });
  }

  /**
   * @check if the user has a cart
   */
  const userCart = await getUserCart(_id);
  /**
   * @check if the user has no cart, create a new cart and add the product to it
   */
  if (!userCart) {
    const newCart = await addCart(_id, product, quantity);
    return res.status(201).json({
      success: true,
      message: "Cart created successfully",
      data: newCart,
    });
  }

  /**
   * @returns The cart state after modifying its products array to reflect the updated quantities and subtotals.
   * @check if the returned value is null, then the product is not found in the cart and we will add it.
   */
  const isUpdated = await updateProductQuantity(userCart, productId, quantity);
  if (!isUpdated) {
    const added = await pushNewProduct(userCart, product, quantity);
    if (!added)
      return next({ message: "Product not added to cart", cause: 400 });
  }

  // * response successfully
  res.status(201).json({
    success: true,
    message: "product added to cart successfully",
    data: userCart,
  });
};

//============================= Remove product From Cart ===============================//
/**
 * @param { productId } from req.params
 * @param { userId } from req.authUser
 * @description  Update the cart by removing the specified product from the user's cart.
 */
export const removeFromCart = async (req, res, next) => {
  // * destructure data from params and authUser
  const { productId } = req.params;
  const { _id } = req.authUser;

  /**
   * @todo you can handle it using the dbMethods
   * @check if the product exists in the user's cart
   */
  const userCart = await Cart.findOne({
    userId: _id,
    "products.productId": productId,
  });
  if (!userCart) {
    return next(`Cart not found`, { cause: 404 });
  }

  /** @returns the resulting state of the userCart.products array, after removing the specified product from the user's cart */
  userCart.products = userCart.products.filter(
    (product) => product.productId.toString() !== productId
  );

  /**@returns the calculated subtotal after update the cart's products array. */
  userCart.subTotal = calculateSubTotal(userCart.products);

  const newCart = await userCart.save();

  /**@check If the cart's products array is empty we will delete the cart. */
  if (newCart.products.length === 0) {
    await Cart.findByIdAndDelete(newCart._id);
  }

  res.status(200).json({
    success: true,
    message: "product delete to cart successfully",
    data: newCart,
  });
};

//========================= get user cart =========================//
/**
 * * destructuring the userId from authUser
 * * get the user's cart
 * * response successfully
 */
export const getCartData = async (req, res, next) => {
  // * destructure data from authUser
  const { _id:userId } = req.authUser;

  // * get the user's cart
  const userCart = await Cart.findOne({ userId });
  if (!userCart) {
    return next(`Cart not found`, { cause: 404 });
  }

  // * response successfully
  res.status(200).json({
    success: true,
    message: "user cart",
    data: userCart,
  });
};
