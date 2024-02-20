import { calculateSubTotal } from "./calculate-SubTotal.js";

/**
 *
 * @param {Cart Type} cart
 * @param {Product Type} product
 * @param {Number} quantity
 * @returns  {Promise<Cart>}
 * @description add product to cart
 */


export async function pushNewProduct(cart, product, quantity) {
  cart?.products.push({
    productId: product._id,
    quantity: quantity,
    basePrice: product.appliedPrice,
    title: product.title,
    finalPrice: product.appliedPrice * quantity,
  });

  cart.subTotal = calculateSubTotal(cart.products);

  return await cart.save();
}

export async function pushNewProductV2(cart, product, quantity) {
  cart?.products.push({
    productId: product._id,
    quantity: quantity,
    basePrice: product.appliedPrice,
    title: product.title,
    finalPrice: product.appliedPrice * quantity,
  });

  return cart.products;
}
