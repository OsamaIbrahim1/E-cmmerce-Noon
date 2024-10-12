import Joi from "joi";
import { Types } from "mongoose";

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("invalid objectId");
};

export const generalRules = {
  dbId: Joi.string().custom(objectIdValidation),
  headersRules: Joi.object({
    accesstoken: Joi.string().required(),
    "postman-token": Joi.string(),
    "cache-control": Joi.string(),
    host: Joi.string(),
    "content-type": Joi.string(),
    "content-length": Joi.string(),
    "user-agent": Joi.string(),
    accept: Joi.string(),
    "accept-encoding": Joi.string(),
    connection: Joi.string(),
  }),
  hostHeaderRules: Joi.object({
    accesstoken: Joi.string().required(),
    "postman-token": Joi.string(),
    "cache-control": Joi.string(),
    host: Joi.string(),
    "content-type": Joi.string(),
    "content-length": Joi.string(),
    "user-agent": Joi.string(),
    accept: Joi.string(),
    "accept-encoding": Joi.string(),
    connection: Joi.string(),
    "cdn-loop": Joi.string(),
    "cf-connecting-ip": Joi.string(),
    "cf-ew-via": Joi.string(),
    "cf-ipcountry": Joi.string(),
    "cf-ray": Joi.string(),
    "cf-visitor": Joi.string(),
    "cf-worker": Joi.string(),
    "render-proxy-ttl": Joi.string(),
    "rndr-id": Joi.string(),
    "true-client-ip": Joi.string(),
    "x-forwarded-for": Joi.string(),
    "x-forwarded-proto": Joi.string(),
    "x-request-start": Joi.string(),
  }),
};
