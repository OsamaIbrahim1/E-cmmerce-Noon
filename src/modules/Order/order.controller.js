import { DateTime } from "luxon";
import Cart from "../../../DB/models/cart.model.js";
import CouponUsers from "../../../DB/models/coupon-users.model.js";
import Order from "../../../DB/models/order.model.js";
import Product from "../../../DB/models/product.model.js";
import { applyCouponValidation } from "../../utils/coupon-validation.js";
import { checkProductAvailability } from "../Cart/utils/check-product-in-db.js";
import { getUserCart } from "../Cart/utils/get-user-cart.js";

//================================= add order =================================//
/**
 * * destructure data from body and authUser
 * * check of couponCode
 * * check product
 * * object for order Items
 * * count price
 * * order status + paymentMethod
 * * object order
 *  * save order
 * * count stock
 * * increment usageCount
 * * response successfully
 */
export const addOrder = async (req, res, next) => {
  // * destructure data from body and authUser
  const { _id: user } = req.authUser;
  const {
    product, // product id
    quantity,
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  // * check of couponCode
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await applyCouponValidation(couponCode, user);
    if (isCouponValid.status) {
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    }
    coupon = isCouponValid;
  }

  // * check product
  const isProductAvailable = await checkProductAvailability(product, quantity);
  if (!isProductAvailable) {
    return next({ message: "Product is not available", cause: 400 });
  }

  // * object for order Items
  let orderItems = [
    {
      title: isProductAvailable.title,
      quantity,
      price: isProductAvailable.appliedPrice,
      product: isProductAvailable._id,
    },
  ];

  // * count price
  let shippingPrice = orderItems[0].price * quantity;
  let totalPrice = shippingPrice;

  if (coupon?.isFixed && !(coupon.couponAmount <= shippingPrice)) {
    return next({ message: "You cannot use this coupon", cause: 400 });
  }
  if (coupon?.isFixed) {
    totalPrice = shippingPrice - coupon.couponAmount;
  } else if (coupon?.isPercentage) {
    totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount) / 100;
  }

  // * order status + paymentMethod
  let orderStatus;
  if (paymentMethod === "Cash") orderStatus = "Placed";

  // * object order
  const order = new Order({
    user,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  });

  // * save order
  await order.save();

  // * count stock
  isProductAvailable.stock -= quantity;
  await isProductAvailable.save();

  // * increment usageCount
  if (coupon) {
    await CouponUsers.updateOne(
      { couponId: coupon._id, userId: user },
      { $inc: { usageCount: 1 } }
    );
  }

  // * generate QR Code
  const orderQR = qrCodeGeneration({
    orderId: order._id,
    user: order.user,
    totalPrice: order.totalPrice,
    orderStatus: order.orderStatus,
  });

  // * response successfully
  res.status(201).json({
    success: true,
    message: "Order was successfully saved",
    data: orderQR,
  });
};

//================================= convert cart to order =================================//
/**
 * * destructure data from body and authUser
 * * cart items
 * * check of couponCode
 * * object for order Items
 * * count price
 * * order status + paymentMethod
 * * object order
 * * save order
 * * delete cart
 * * count stock
 * * increment usageCount
 * * response successfully
 */
export const convertCartToOrder = async (req, res, next) => {
  // * destructure data from body and authUser
  const { _id: user } = req.authUser;
  const {
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  // * cart items
  const userCart = await getUserCart(user);
  if (!userCart) return next({ message: "Cart not found", cause: 404 });

  // * check of couponCode
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await applyCouponValidation(couponCode, user);
    if (isCouponValid.status) {
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    }
    coupon = isCouponValid;
  }

  // * check product
  // const isProductAvailable = await checkProductAvailability(product, quantity);
  // if (!isProductAvailable) {
  //   return next({ message: "Product is not available", cause: 400 });
  // }

  // * object for order Items
  let orderItems = userCart.products.map((cartItem) => {
    return {
      title: cartItem.title,
      quantity: cartItem.quantity,
      price: cartItem.basePrice,
      product: cartItem.productId,
    };
  });

  // * count price
  let shippingPrice = userCart.subTotal;
  let totalPrice = shippingPrice;

  if (coupon?.isFixed && !(coupon.couponAmount <= shippingPrice)) {
    return next({ message: "You cannot use this coupon", cause: 400 });
  }
  if (coupon?.isFixed) {
    totalPrice = shippingPrice - coupon.couponAmount;
  } else if (coupon?.isPercentage) {
    totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount) / 100;
  }

  // * order status + paymentMethod
  let orderStatus;
  if (paymentMethod === "Cash") orderStatus = "Placed";

  // * object order
  const order = new Order({
    user,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  });

  // * save order
  await order.save();

  // * delete cart
  await Cart.findByIdAndDelete(userCart._id);

  // * count stock
  for (const item of orderItems) {
    await Product.updateMany(
      { _id: item.product },
      { $inc: { stock: -item.quantity } }
    );
  }

  // * increment usageCount
  if (coupon) {
    await CouponUsers.updateOne(
      { couponId: coupon._id, userId: user },
      { $inc: { usageCount: 1 } }
    );
  }

  // * response successfully
  res.status(201).json({
    success: true,
    message: "Order was successfully saved",
    data: order,
  });
};

//================================= order delivery =================================//
/**
 * * destructure data from params
 * * update order {paid,   placed} data {orderStatus, deliveredAt, deliveredBy}
 * * response successfully
 */
export const orderDelivery = async (req, res, next) => {
  // * destructure data from params
  const { orderId } = req.params;

  // * update order {paid, placed} data {orderStatus, deliveredAt, deliveredBy}
  const updateOrder = await Order.findByIdAndUpdate(
    {
      _id: orderId,
      orderStatus: { $in: ["paid", "placed"] },
    },
    {
      orderStatus: "Delivered",
      deliveredAt: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
      deliveredBy: req.authUser._id,
      isDelivered: true,
    },
    { new: true }
  );

  if (!updateOrder) {
    return next({
      message: "Order not found or Cannot be delivered",
      cause: 404,
    });
  }

  // * response successfully
  res.status(200).json({
    success: true,
    message: "Order successfully delivered",
    data: updateOrder,
  });
};
