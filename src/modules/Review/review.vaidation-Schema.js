import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";

export const addReviewSchema = {
  params: Joi.object({ productId: generalRules.dbId }),
  // headers: generalRules.headersRules,
  body: Joi.object({
    reviewRate: Joi.number().valid(1, 2, 3, 4, 5).required(),
    reviewComment: Joi.string(),
  }),
};

export const deleteReviewSchema= {
  params: Joi.object({ reviewId: generalRules.dbId }),
  // // headers: generalRules.headersRules,
};

export const getAllReviewsforProductSchema = {
  params: Joi.object({ productId: generalRules.dbId }),
  // // headers: generalRules.headersRules,
};
