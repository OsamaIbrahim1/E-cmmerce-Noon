import { scheduleJob } from "node-schedule";
import { DateTime } from "luxon";

import Coupon from "../../DB/models/coupon.model.js";

export function cronToChangeExpiredCoupons() {
  scheduleJob("60 * * * * *", async () => {
    console.log("cronToChangeExpiredCoupons()  is running every 5 seconds");
    const coupons = await Coupon.find({ couponStatus: "valid" });
    console.log(coupons);

    for (const coupon of coupons) {
      //   if (moment().isAfter(moment(coupon.toDate))) {
      //     coupon.status = "expired";
      //   }
      //   await coupon.save();

      if (DateTime.fromISO(coupon.toDate) < DateTime.now()) {
        coupon.status = "expired";
      }
      await coupon.save();
    }
  });
}
