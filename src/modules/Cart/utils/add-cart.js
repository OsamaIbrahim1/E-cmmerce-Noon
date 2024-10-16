import Cart from "../../../../DB/models/cart.model.js";

/**
 * @param {String} userId
 * @param {Product Type} product
 * @param {Number} quantity
 * @returns  {Promise<Cart>}
 * @description add user's cart in the database
 */
export async function addCart(userId, product, quantity) {
  console.log(product);
  const cartObj = {
    userId,
    products: [
      {
        productId: product._id,
        quantity,
        basePrice: product.basePrice,
        title: product.title,
        discount: product.discount,
        finalPrice: product.appliedPrice * quantity,
      },
    ],
    subTotal: product.appliedPrice * quantity,
  };
  const newCart = await Cart.create(cartObj);
  return newCart;
}
