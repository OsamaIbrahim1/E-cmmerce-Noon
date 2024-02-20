import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";
import { query } from "express";

export const addCartSchema = {
  body: Joi.object({
    quantity: Joi.number().required(),
  }),
  query: Joi.object({
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
