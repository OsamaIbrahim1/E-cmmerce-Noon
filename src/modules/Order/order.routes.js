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
  auth([systemRoles.USER]),
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

export default router;
