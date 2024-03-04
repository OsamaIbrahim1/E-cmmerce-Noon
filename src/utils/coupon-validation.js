import Coupon from "../../DB/models/coupon.model.js";
import CouponUsers from "../../DB/models/coupon-users.model.js";
import { DateTime } from "luxon";

export async function applyCouponValidation(couponCode, userId) {
  // * couponCode check
  const coupon = await Coupon.findOne({ couponCode });
  if (!coupon) return { message: `Coupon code is invalid.`, status: 400 };

  // * couponStateus check
  if (
    coupon.couponStatus === "expired" ||
    DateTime.fromISO(coupon.toDate) < DateTime.now()
  )
    return { message: `this Coupon is expired`, status: 400 };

  // * start date check
  if (DateTime.fromISO(coupon.fromDate) > DateTime.now())
    return { message: `this Coupon is started yet`, status: 400 };

  // * user cases
  const isUserAssigned = await CouponUsers.findOne({
    couponId: coupon._id,
    userId,
  });
  if (!isUserAssigned)
    return { message: `this Coupon is not assigned to you`, status: 400 };

  // * maxUsage check
  if (isUserAssigned.maxUsage <= isUserAssigned.usageCount)
    return {
      message: `you have exceed the usage count for this coupon`,
      status: 400,
    };

  return coupon;
}
