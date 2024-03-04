import CouponUsers from "../../../DB/models/coupon-users.model.js";
import Coupon from "../../../DB/models/coupon.model.js";
import User from "../../../DB/models/user.model.js";

//============================= add Coupon =============================//
/**
 *  * destructure data from body and authUser
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
