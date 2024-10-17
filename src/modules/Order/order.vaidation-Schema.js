import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";

export const addOrderSchema = {
  body: Joi.object({
    product: generalRules.dbId,
    quantity: Joi.number().required(),
    couponCode: Joi.string().trim().lowercase(),
    paymentMethod: Joi.string().required().valid("Cash", "Stripe", "Paymob"),
    phoneNumbers: Joi.Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }),
  // headers: generalRules.headersRules,
};

export const convertCartToOrderSchema = {
  body: Joi.object({
    couponCode: Joi.string().trim().lowercase(),
    paymentMethod: Joi.string().required().valid("Cash", "Stripe", "Paymob"),
    phoneNumbers: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }),
  // // headers: generalRules.headersRules,
};

export const orderIdSchema = {
  params: Joi.object({
    orderId: generalRules.dbId,
  }),
  // // headers: generalRules.headersRules,
};

export const payWithStripeSchema = {
  params: Joi.object({
    orderId: generalRules.dbId,
  }),
  // // headers: generalRules.headersRules,
};

export const cancelOrderSchema = {
  query: Joi.object({
    orderId: generalRules.dbId,
  }),
  // // headers: generalRules.headersRules,
};
