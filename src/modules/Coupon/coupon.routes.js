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

router.get(
  "/getCouponById/:couponId",
  auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  validationMiddleware(validators.getCouponByIdSchema),
  expressAsyncHandler(couponController.getCouponById)
);

router.get(
  "/getAllCouponsWithPagination",
  auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  expressAsyncHandler(couponController.getAllCouponsWithPagination)
);

router.patch(
  "/enableAndDesableCoupon",
  auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  validationMiddleware(validators.enableAndDesableCouponSchema),
  expressAsyncHandler(couponController.enableAndDesableCoupon)
);

router.get(
  "/getAllDisabledCoupons",
  auth([systemRoles.SUPER_ADMIN]),
  expressAsyncHandler(couponController.getAllDisabledCoupons)
);

router.get(
  "/getAllEnabledCoupons",
  auth([systemRoles.SUPER_ADMIN]),
  expressAsyncHandler(couponController.getAllEnabledCoupons)
);
router.put(
  "/updateCoupons",
  auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  validationMiddleware(validators.updateCouponsSchema),
  expressAsyncHandler(couponController.updateCoupons)
);

export default router;
