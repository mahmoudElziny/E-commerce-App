import QRCode from 'qrcode';


export async function generateQrCode(data) {
    const qr = await QRCode.toDataURL(JSON.stringify(data),{
        errorCorrectionLevel: "H",
    });
    return qr;
}