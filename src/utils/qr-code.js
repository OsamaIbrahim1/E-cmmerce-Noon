import QRCode from "qrcode";

export function qrCodeGeneration(data) {
  const qrCode = QRCode.toDataURL(data, { errorCorrectionLevel: "H" });
  return qrCode;
}
