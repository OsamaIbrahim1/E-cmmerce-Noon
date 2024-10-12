import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";

export const addCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().min(3).max(10).required().alphanum(),
    couponAmount: Joi.number().min(1).required(),
    isFixed: Joi.boolean(),
    isPercentage: Joi.boolean(),
    fromDate: Joi.date()
      .iso()
      .required()
      .greater(Date.now() - 24 * 60 * 60 * 1000),
    toDate: Joi.date().iso().required().greater(Joi.ref("fromDate")),
    Users: Joi.array().items(
      Joi.object({
        userId: generalRules.dbId.required(),
        maxUsage: Joi.number().required().min(1),
      })
    ),
  }),
};
export const getCouponByIdSchema = {
  params: Joi.object({
    couponId: generalRules.dbId,
  }),
};

export const enableAndDesableCouponSchema = {
  query: Joi.object({
    couponId: generalRules.dbId,
  }),
  // headers: generalRules.headersRules,
};

export const updateCouponsSchema = {
  query: Joi.object({
    couponId: generalRules.dbId,
  }),
  // // headers: generalRules.headersRules,
  body: Joi.object({
    couponAmount: Joi.number().min(1),
    couponStatus: Joi.string().valid("valid", "expired"),
    isFixed: Joi.boolean(),
    isPercentage: Joi.boolean(),
    fromDate: Joi.date()
      .iso()
      .greater(Date.now() - 24 * 60 * 60 * 1000),
    toDate: Joi.date().iso().greater(Joi.ref("fromDate")),
    couponCondition: Joi.string().valid("enabled", "disabled"),
  }),
};
