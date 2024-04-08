import CouponUsers from "../../../DB/models/coupon-users.model.js";
import Coupon from "../../../DB/models/coupon.model.js";
import User from "../../../DB/models/user.model.js";
import { APIFeature } from "../../utils/api-features.js";

//============================= add Coupon =============================//
/**
 * * destructure data from body and authUser
 * * coupon Check
 * * create new coupon
 * * users checks
 * * response successfully
 */
export const addCoupon = async (req, res, next) => {
  // * destructure data from body and authUser
  const { _id: addedBy } = req.authUser;
  const {
    couponCode,
    couponAmount,
    isFixed,
    isPercentage,
    fromDate,
    toDate,
    Users,
  } = req.body;

  // * couponCode Check
  const isCouponCodeExist = await Coupon.findOne({ couponCode });
  if (isCouponCodeExist) {
    return next("Coupon code is already exist", { cause: 409 });
  }

  if (isFixed === isPercentage) {
    return next("Coupon can be fixed or percentage", { cause: 409 });
  }

  if (isPercentage && couponAmount > 100) {
    return next("Percentage should be less than 100", { cause: 409 });
  }

  // * create new coupon
  const couponObject = {
    couponCode,
    couponAmount,
    isFixed,
    isPercentage,
    fromDate,
    toDate,
    addedBy,
  };
  const coupon = await Coupon.create(couponObject);
  if (!coupon) return next("Coupon not created", { cause: 400 });

  // * users checks
  const arrayIds = [];
  for (const user of Users) {
    arrayIds.push(user.userId);
  }

  const isUserExists = await User.find({ _id: { $in: arrayIds } });
  if (isUserExists.length != Users.length)
    return next("User not found", { cause: 404 });

  // * create new couponUsers
  const couponUsers = await CouponUsers.create(
    Users.map((ele) => ({ ...ele, couponId: coupon._id }))
  );

  // * response successfully
  res.status(201).json({
    success: true,
    message: "created coupon",
    dataCoupon: coupon,
    dataCouponUsers: couponUsers,
  });
};

//============================= adget Coupon by id =============================//
/**
 * * destructure data from body and authUser
 * * coupon Check
 * * create new coupon
 * * users checks
 * * response successfully
 */
export const getCouponById = async (req, res, next) => {
  // * destructure data from params
  const { couponId } = req.params;

  // * get coupon
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next("coupon not found", { cause: 404 });
  }

  // * response successfully
  res
    .status(200)
    .json({ success: true, message: "coupon found", data: coupon });
};

//================================= get All coupon with pagination =================================//
/**
 * * destructure data from query
 * * find data and paginate it
 * * response successfully
 */
export const getAllCouponsWithPagination = async (req, res, next) => {
  //  * destructure data from query
  const { page, size, sort, ...search } = req.query;

  // * find data and paginate it
  const features = new APIFeature(req.query, Coupon.find())
    .pagination({
      page,
      size,
    })
    .sort(sort);

  const coupons = await features.mongooseQuery;

  // * response successfully
  res
    .status(200)
    .json({ success: true, message: "get all coupons", data: coupons });
};

//================================= make coupon enable and desable =================================//
/**
 * * destructure data from query
 * * check if coupon already exists
 * * if coupon is enabled changed it to disabled
 * * changed coupon to enabled
 * * save changes
 * * response successfully
 */
export const enableAndDesableCoupon = async (req, res, next) => {
  // * destructure data from query
  const { couponId } = req.query;
  const { _id: userId } = req.authUser;

  // * check if coupon already exists
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(`Coupon not found`, { cause: 404 });
  }

  // * if coupon is enabled changed it to disabled
  if (coupon.couponCondition === "enabled") {
    coupon.couponCondition = "disabled";
    coupon.disabledAt = Date.now();
    coupon.disabledBy = userId;
  } else {
    // * changed coupon to enabled
    coupon.couponCondition = "enabled";
    coupon.enabledAt = Date.now();
    coupon.enabledBy = userId;
  }

  // * save changes
  coupon.save();

  // * response successfully
  res.status(200).json({ success: true, message: "change coupon", coupon });
};

//================================= Get all disabled coupons =================================//
/**
 * * get all coupon disabled
 * * response successfully
 */
export const getAllDisabledCoupons = async (req, res, next) => {
  // * get all coupon disabled
  const coupon = await Coupon.find({ couponCondition: "disabled" });
  if (!coupon) return next(`not found coupon disabled`);

  // * response successfully
  res.status(200).json({ success: true, message: "coupon disabled", coupon });
};

//================================= Get all enabled coupons =================================//
/**
 * * get all coupon enabled
 * * response successfully
 */
export const getAllEnabledCoupons = async (req, res, next) => {
  // * get all coupon disabled
  const coupon = await Coupon.find({ couponCondition: "enabled" });
  if (!coupon) return next(`not found coupon enabled`);

  // * response successfully
  res.status(200).json({ success: true, message: "coupon enabled", coupon });
};

//================================= Update  Coupon =================================//
/**
 * * destructure data from query and body and authUser
 * * check if coupon is already existing
 * * update coupon
 * * save changes
 * * response successfully
 */
export const updateCoupons = async (req, res, next) => {
  // * destructure data from query and body and authUser
  const { couponId } = req.query;
  const {
    couponAmount,
    couponStatus,
    isFixed,
    isPercentage,
    fromDate,
    toDate,
    couponCondition,
  } = req.body;
  const { _id: userId } = req.authUser;

  // * check if coupon is already existing
  const coupon = await Coupon.findOne({ _id: couponId, addedBy: userId });
  if (!coupon) return next(`Coupon not found`, { cause: 404 });

  // * update coupon
  if (couponAmount) {
    coupon.couponAmount = couponAmount;
  }

  if (couponStatus) {
    coupon.couponStatus = couponStatus;
  }
  if (isFixed) {
    coupon.isFixed = isFixed;
  }
  if (isPercentage) {
    coupon.isPercentage = isPercentage;
  }
  if (fromDate) {
    coupon.fromDate = fromDate;
  }
  if (toDate) {
    coupon.toDate = toDate;
  }
  if (couponCondition) {
    coupon.couponCondition = couponCondition;
  }

  // * save changes
  coupon.save();

  // * response success
  res
    .status(200)
    .json({ success: true, message: "updated successfully", coupon });
};
