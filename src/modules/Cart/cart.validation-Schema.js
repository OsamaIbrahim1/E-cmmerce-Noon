import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";

export const addProductToCartSchema = {
  body: Joi.object({
    quantity: Joi.number().required(),
    productId: generalRules.dbId,
  }),
  headers: generalRules.headersRules,
};

export const removeFromCartSchema = {
  params: Joi.object({
    productId: generalRules.dbId,
  }),
  headers: generalRules.headersRules,
};
