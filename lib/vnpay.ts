import crypto from 'crypto';

// Validate required environment variables
if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET) {
  throw new Error('VNPay configuration is missing required environment variables: VNPAY_TMN_CODE and VNPAY_HASH_SECRET must be set');
}

const VNPayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE!,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET!,
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
};

interface VNPayParams {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_CurrCode: string;
  vnp_TxnRef: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_Locale: string;
  vnp_ReturnUrl: string;
  vnp_IpAddr: string;
  vnp_CreateDate: string;
  vnp_BankCode?: string;
}

export function createVNPayPaymentUrl(params: {
  amount: number;
  orderId: string;
  orderInfo: string;
  bankCode?: string;
  ipAddr: string;
}): string {
  const {
    amount,
    orderId,
    orderInfo,
    bankCode,
    ipAddr
  } = params;

  const date = new Date();
  // VNPay requires timestamp in Vietnam timezone (UTC+7)
  const vietnamDate = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const createDate = vietnamDate.toISOString().replace(/[-:T.]/g, '').slice(0, 14);

  const vnpParams: VNPayParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPayConfig.vnp_TmnCode,
    vnp_Amount: amount * 100, // VNPay requires amount in cents
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'billpayment',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: VNPayConfig.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode) {
    vnpParams.vnp_BankCode = bankCode;
  }

  // Sort parameters
  const sortedParams = Object.keys(vnpParams)
    .sort()
    .reduce((result: Record<string, string | number | boolean | undefined>, key) => {
      result[key] = vnpParams[key as keyof VNPayParams];
      return result;
    }, {});

  // Create query string
  const queryString = Object.keys(sortedParams)
    .filter((key) => sortedParams[key] !== undefined)
    .map((key) => `${key}=${encodeURIComponent(sortedParams[key] as string | number | boolean)}`)
    .join('&');

  // Create secure hash
  const secureHash = crypto
    .createHmac('sha512', VNPayConfig.vnp_HashSecret)
    .update(queryString)
    .digest('hex');

  const paymentUrl = `${VNPayConfig.vnp_Url}?${queryString}&vnp_SecureHash=${secureHash}`;

  return paymentUrl;
}

export function verifyVNPayCallback(params: Record<string, string>): boolean {
  const vnp_Params = { ...params };
  const secureHash = vnp_Params['vnp_SecureHash'];
  
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((result: Record<string, string>, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

  const queryString = Object.keys(sortedParams)
    .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
    .join('&');

  const computedHash = crypto
    .createHmac('sha512', VNPayConfig.vnp_HashSecret)
    .update(queryString)
    .digest('hex');

  return secureHash === computedHash;
}

export function getVNPayResponseCode(code: string): string {
  const responseCodes: { [key: string]: string } = {
    '00': 'Giao dịch thành công',
    '01': 'Giao dịch chưa hoàn tất',
    '02': 'Giao dịch bị lỗi',
    '04': 'Giao dịch đảo (Khách hàng đã hủy giao dịch)',
    '05': 'VNPAY đang xử lý giao dịch này',
    '06': 'VNPAY đã gửi yêu cầu sang ngân hàng nhưng chưa nhận được phản hồi',
    '07': 'Giao dịch bị nghi ngờ gian lận',
    '09': 'Giao dịch bị từ chối',
    '10': 'Giao dịch không hợp lệ',
    '11': 'Số tiền không hợp lệ',
    '12': 'Mã đơn hàng không hợp lệ',
    '13': 'Mã giao dịch không hợp lệ',
    '24': 'Giao dịch bị hủy',
  };

  return responseCodes[code] || 'Mã lỗi không xác định';
}
