import Router from "express";
import expressAsyncHandler from "express-async-handler";

import * as reviewController from "./review.controller.js";
import { systemRoles } from "../../utils/system-role.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "./review.vaidation-Schema.js";
const router = Router();

router.post(
  "/addReview/:productId",
  auth([systemRoles.USER]),
  validationMiddleware(validators.addReviewSchema),
  expressAsyncHandler(reviewController.addReview)
);

router.delete(
  "/deleteReview/:reviewId",
  auth([systemRoles.USER]),
  validationMiddleware(validators.deleteReviewSchema),
  expressAsyncHandler(reviewController.deleteReview)
);

router.get(
  "/getAllReviewsforProduct/:productId",
  auth([systemRoles.USER]),
  validationMiddleware(validators.getAllReviewsforProductSchema),
  expressAsyncHandler(reviewController.getAllReviewsforProduct)
);

export default router;
