import QRCode from "qrcode";

export function(data){
    const qrCode = QRCode.toDataURL(data,{errorCorrectionLevel:'H'});
    return qrCode
}