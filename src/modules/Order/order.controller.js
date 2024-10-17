import { DateTime } from "luxon";
import Cart from "../../../DB/models/cart.model.js";
import CouponUsers from "../../../DB/models/coupon-users.model.js";
import Order from "../../../DB/models/order.model.js";
import Product from "../../../DB/models/product.model.js";
import { applyCouponValidation } from "../../utils/coupon-validation.js";
import { checkProductAvailability } from "../Cart/utils/check-product-in-db.js";
import { getUserCart } from "../Cart/utils/get-user-cart.js";
import {
  confirmPaymentIntent,
  createCheckSession,
  createPaymentIntent,
  createStripeCoupon,
  refundPaymentIntent,
} from "../../payment-handler/stripe.js";
import { qrCodeGeneration } from "../../utils/qr-code.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";
import createInvoice from "../../utils/pdfKit.js";

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
  const orderQR = await qrCodeGeneration([
    {
      orderId: order._id,
      user: order.user,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
    },
  ]);

  // // * invoice
  // const orderCode = `${req.authUser.username}_${generateUniqueString(3)}`;
  // const orderInvoice = {
  //   shipping: {
  //     name: req.authUser.username,
  //     address: order.shippingAddress.address,
  //     city: "Cairo",
  //     state: "Cairo",
  //     country: "Cairo",
  //   },
  //   orderCode,
  //   date: order.createdAt,
  //   items: order.orderItems.product,
  //   subTotal: order.totalPrice,
  //   paidAmount: order.paidAmount,
  // };

  // await createInvoice(orderInvoice,`${orderCode}.pdf`)

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

//================================= order payment with stripe  =================================//
/**
 * * destructure data from params and authUser
 * * get order details from our database
 * * create object payment
 * * create checkout session payment
 * * response successfully
 */
export const payWithStripe = async (req, res, next) => {
  // * destructure data from params and authUser
  const { orderId } = req.params;
  const { _id: userId } = req.authUser;

  // * get order details from our database
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
    orderStatus: "Pending",
  });
  if (!order) {
    return next({ message: "Order not found or cannot be paid", cause: 404 });
  }

  // * create object payment
  const paymentObject = {
    customer_email: req.authUser.email,
    metadata: { orderId: order._id.toString() },
    discounts: [],
    line_items: order.orderItems.map((item) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    }),
  };

  // * coupon checks
  if (order.coupon) {
    const stripeCoupon = await createStripeCoupon({ couponId: order.coupon });
    if (stripeCoupon.status) {
      return next({ message: stripeCoupon.message, cause: 404 });
    }

    paymentObject.discounts.push({
      coupon: stripeCoupon.id,
    });
  }

  // * create checkout session payment
  const checkSession = await createCheckSession(paymentObject);
  const paymentIntent = await createPaymentIntent({
    amount: order.totalPrice,
    currency: "EGP",
  });
  order.payment_intent = paymentIntent.id;
  await order.save();

  // * response successfully
  res.status(200).json({
    success: true,
    message: "Successfully created",
    data: checkSession,
    paymentIntent,
  });
};

export const stripeWebhookLocal = async (req, res, next) => {
  const orderId = req.body.data.object.metadata.orderId;

  const confirmedOrder = await Order.findByIdAndUpdate(orderId, {
    orderStatus: "Paid",
    paidAt: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
    isPaid: true,
  });
  console.log(confirmedOrder.payment_intent);
  await confirmPaymentIntent({
    paymentIntentId: confirmedOrder.payment_intent,
  });

  confirmedOrder.isPaid = true;
  confirmedOrder.paidAt = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  confirmedOrder.orderStatus = "Paid";

  await confirmedOrder.save();

  res.status(200).json({ success: true, message: "webhook received" });
};

export const refundOrder = async (req, res, next) => {
  const { orderId } = req.params;

  const findOrder = await Order.findOne({ _id: orderId, orderStatus: "Paid" });
  if (!findOrder)
    return next({
      message: "Order not found or cannot be refunded",
      cause: 404,
    });

  // * refund the payment intent
  const refund = await refundPaymentIntent({
    paymentIntentId: findOrder.payment_intent,
  });

  findOrder.orderStatus = "Refunded";
  await findOrder.save();

  res.status(200).json({
    success: true,
    message: "Order refunded successfully",
    order: refund,
  });
};

//================================= Cancel order within  1 day after create the order  API =================================//
/**
 * * destructure data from query
 * * order Check is already exists
 * * count time of order
 * * response successffully
 */
export const cancelOrder = async (req, res, next) => {
  // * destructure data from query
  const { orderId } = req.query;

  // * order Check is already exists
  const order = await Order.findById(orderId);
  if (!order) return next({ message: "Order Is Not Exist", cause: 404 });

  // * count time of order
  const checker = DateTime.now() - order.createdAt;
  const millSecondsInDay = 24 * 60 * 60 * 1000;
  if (checker >= millSecondsInDay)
    return next({
      message: "You Cannot Cancel Order After 1 Day From Ordering",
      cause: 409,
    });
  order.orderStatus = "Cancelled";
  await order.save();

  // * response successffully
  res
    .status(200)
    .json({ success: true, message: "Order Cancelled Done", order });
};

//================================= get order by id  =================================//
/**
 * * destructure data from params
 * * get order by id
 * * response successfully
 */
export const getOrderById = async (req, res, next) => {
  // * destructure data from params
  const { orderId } = req.params;

  // * get order by id
  const order = await Order.findById(orderId);
  if (!order)
    return next({ success: false, message: "Order not found", cause: 404 });

  // * response successfully
  res.status(200).json({ success: true, data: order });
};

//========================== get all orders for user ==========================//
/**
 * * destructure data from authUser
 * * get all orders for user
 * * response successfully
 */
export const getAllOrders = async (req, res, next) => {
  // * destructure data from authUser
  const { _id: user } = req.authUser;

  // * get all orders for user
  const orders = await Order.find({ user });

  // * response successfully
  res.status(200).json({ success: true, message: "Your Orders", data: orders });
};
