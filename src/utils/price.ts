/**
 * คำนวณราคาขายฝากสูงสุด
 * สูตร: ราคาซื้อคืนทองคำแท่ง * 0.9 (90%)
 *
 * วิธีปัดเศษ: ปัดลงให้ลงท้ายด้วย "00" ทุกครั้ง
 * ตัวอย่าง:
 *   - 64,665 บาท -> 90% = 58,198.5 -> ปัดลง = 58,100 บาท
 *   - 71,850 บาท -> 90% = 64,665   -> ปัดลง = 64,600 บาท
 *
 * วิธีคิด: (ราคา * 0.9) / 100 แล้วปัดลง คูณ 100 กลับ
 */
export const calculateMaxConsignmentPrice = (
  barBuyPrice: number | string,
): number => {
  const price =
    typeof barBuyPrice === "string" ? parseFloat(barBuyPrice) : barBuyPrice;

  if (isNaN(price) || price <= 0) return 0;

  const ninetyPercent = price * 0.9;
  return Math.floor(ninetyPercent / 100) * 100;
};

/**
 * คำนวณราคาซื้อคืนทองรูปพรรณ
 * สูตร: ราคาซื้อคืนทองคำแท่ง * 0.95 (95%)
 *
 * วิธีปัดเศษ: ปัดลงปกติ (ไม่ต้องปัดเป็น 100)
 * ตัวอย่าง:
 *   - 71,850 บาท -> 95% = 68,257.5 -> ปัดลง = 68,257 บาท
 */
export const calculateOrnamentsReturnPrice = (
  barBuyPrice: number | string,
): number => {
  const price =
    typeof barBuyPrice === "string" ? parseFloat(barBuyPrice) : barBuyPrice;

  if (isNaN(price) || price <= 0) return 0;

  return Math.floor(price * 0.95);
};
