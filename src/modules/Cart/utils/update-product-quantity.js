import { calculateSubTotal } from "./calculate-SubTotal.js";
import { checkProductIfExistsInCart } from "./check-product-in-cart.js";

/**
 *
 * @param {Cart type} cart
 * @param {String} productId
 * @param {Number} quantity
 * @returns  {Promise<Cart | null>}
 * @description update product quantity , final Price and subTotal in cart
 */

export async function updateProductQuantity(cart, productId, quantity) {
  const isProductExistInCart = await checkProductIfExistsInCart(
    cart,
    productId
  );
  if (!isProductExistInCart) return null;

  cart?.products.forEach((product) => {
    if (product.productId.toString() === productId) {
      product.quantity = quantity;

      product.finalPrice =
        ((product.basePrice * (100 - product.discount)) / 100) * quantity;
    }
  });

  cart.subTotal = calculateSubTotal(cart.products);

  return await cart.save();
}

//================= version 2 from enhancement =================/
/**
 *@description we will remove the saving in db from here and save from the controller
 */
export async function updateProductQuantityV2(cart, productId, quantity) {
  const isProductExistInCart = await checkProductIfExistsInCart(
    cart,
    productId
  );
  if (!isProductExistInCart) return null;

  cart?.products.forEach((product) => {
    if (product.productId.toString() === productId) {
      product.quantity = quantity;
      product.finalPrice = product.basePrice * quantity;
    }
  });
  return cart.products;
}
