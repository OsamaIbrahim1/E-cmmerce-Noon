import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as orderController from "./order.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-role.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as orderValidators from "./order.vaidation-Schema.js";
const router = Router();

router.post(
  "/addOrder",
  auth([systemRoles.USER, systemRoles.ADMIN]),
  validationMiddleware(orderValidators.addOrderSchema),
  expressAsyncHandler(orderController.addOrder)
);

router.post(
  "/convertCartToOrder",
  auth([systemRoles.USER]),
  validationMiddleware(orderValidators.convertCartToOrderSchema),
  expressAsyncHandler(orderController.convertCartToOrder)
);

router.put(
  "/orderDelivery/:orderId",
  auth([systemRoles.USER]),
  validationMiddleware(orderValidators.orderIdSchema),
  expressAsyncHandler(orderController.orderDelivery)
);

router.post(
  "/payWithStripe/:orderId",
  auth([systemRoles.USER]),
  validationMiddleware(orderValidators.payWithStripeSchema),
  expressAsyncHandler(orderController.payWithStripe)
);

router.post(
  "/webhook",
  expressAsyncHandler(orderController.stripeWebhookLocal)
);

router.post(
  "/refund/:orderId",
  auth([systemRoles.SUPER_ADMIN, systemRoles.ADMIN]),
  expressAsyncHandler(orderController.refundOrder)
);

router.post(
  "/cancelOrder",
  auth([systemRoles.USER]),
  validationMiddleware(orderValidators.cancelOrderSchema),
  expressAsyncHandler(orderController.cancelOrder)
);

router.get(
  "/getOrderById/:orderId",
  auth([systemRoles.USER]),
  validationMiddleware(orderValidators.cancelOrderSchema),
  expressAsyncHandler(orderController.getOrderById)
);

router.get(
  "/getAllOrders",
  auth([systemRoles.USER]),
  (req, res, next) => {
    console.log("middleware");
    next();
  },
  expressAsyncHandler(orderController.getAllOrders)
);

export default router;
