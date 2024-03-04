import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as couponController from "./coupon.ccontroller.js";
import * as validators from "./coupon.validation.js";
import { systemRoles } from "../../utils/system-role.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/addCoupon",
  auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  validationMiddleware(validators.addCouponSchema),
  expressAsyncHandler(couponController.addCoupon)
);

export default router;
