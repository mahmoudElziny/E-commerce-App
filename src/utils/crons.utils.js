import { scheduleJob } from "node-schedule";
import { Coupon } from "../../DB/models/index.js";
import { DateTime } from "luxon";


export const disableCouponsCron = () => {
    scheduleJob('0 59 23 * * *', async () => {

        console.log(" Cron job to Disable Coupons disableCouponsCron() ");
        
        const enabledCoupons = await Coupon.find({ isEnabled: true });
        if (enabledCoupons.length) {
            for (const coupon of enabledCoupons) {
                if (DateTime.now() > DateTime.fromJSDate(coupon.till)) {
                    coupon.isEnabled = false;
                    await coupon.save();
                }
            }
        }
    });
}