export interface Coupon {
  code: string;
  label: string;
  percentOff?: number;
  amountOff?: number;
  minSubtotal?: number;
}

export const COUPONS: Coupon[] = [
  { code: "SIGNORA10", label: "10% off entire order", percentOff: 10 },
  { code: "WELCOME5", label: "5% off first order", percentOff: 5 },
  { code: "FLAT1000", label: "PKR 1,000 off orders above 20,000", amountOff: 1000, minSubtotal: 20000 },
];

export function findCoupon(code: string): Coupon | undefined {
  const c = code.trim().toUpperCase();
  return COUPONS.find((x) => x.code === c);
}

export function couponDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon) return 0;
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  if (coupon.percentOff) return Math.round((subtotal * coupon.percentOff) / 100);
  if (coupon.amountOff) return Math.min(coupon.amountOff, subtotal);
  return 0;
}
