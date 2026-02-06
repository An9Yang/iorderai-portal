export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DeliverySettings {
  selfDeliveryRadius: number;  // 商户自配送半径（英里）
  uberMaxRadius: number;       // Uber 最大配送半径（固定 10 英里）
  coordinates: Coordinates;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  deliveryMode: 'uber' | 'self' | 'hybrid';
  status: 'active' | 'paused' | 'terminated';
  joinDate: string;
  deliverySettings?: DeliverySettings;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerPhone: string;
  orderType: 'delivery' | 'pickup';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tips: number;
  total: number;
  paymentMethod: 'card' | 'cash';
  paymentStatus: 'paid' | 'pending' | 'failed';
  deliveryAddress?: string;
  status: 'pending' | 'completed' | 'cancelled';
  cancelReason?: string;
  notes?: string;           // 订单备注（如：多要餐具、少放辣等）
  createdAt: string;
}

export interface FinanceStats {
  orderCount: number;
  totalAmount: number;
  deliveryFee: number;
  platformFee: number;
  settlementAmount: number;
  settledAmount: number;
  pendingAmount: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: 'ach';
  bankAccount: string;
}

// 银行账户
export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  accountNumber: string;  // 仅显示后4位
  routingNumber: string;  // 仅显示后4位
  isDefault: boolean;
  createdAt: string;
}

// 提现申请状态
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// 提现申请
export interface WithdrawalRequest {
  id: string;
  amount: number;
  fee: number;           // 提现手续费
  actualAmount: number;  // 实际到账金额
  bankAccountId: string;
  bankAccountInfo: string;  // 银行账户简要信息，如 "Chase ****1234"
  status: WithdrawalStatus;
  failReason?: string;   // 失败原因
  createdAt: string;
  processedAt?: string;  // 处理时间
  completedAt?: string;  // 完成时间
}

// 提现余额信息
export interface WithdrawalBalance {
  availableAmount: number;   // 可提现金额
  frozenAmount: number;      // 冻结金额（未完成订单）
  processingAmount: number;  // 提现处理中金额
  totalWithdrawn: number;    // 历史累计提现
  minimumWithdrawal: number; // 最低提现金额
  withdrawalFeeRate: number; // 提现手续费率 (0 表示免手续费)
}

export interface User {
  id: string;
  username: string;
  restaurantId: string;
}

export type DateRange = 'today' | 'week' | 'month' | 'custom';

// 通话记录相关类型
export interface CallMessage {
  id: string;
  role: 'customer' | 'ai';
  content: string;
  timestamp: string;
}

export type CallStatus = 'completed' | 'missed' | 'in_progress';

export interface CallRecord {
  id: string;
  callerPhone: string;        // 来电号码
  receiverPhone: string;      // 接听号码（餐馆号码）
  startTime: string;          // 通话开始时间
  endTime?: string;           // 通话结束时间
  duration: number;           // 通话时长（秒）
  status: CallStatus;         // 通话状态
  orderId?: string;           // 关联的订单ID（如果有）
  transcript: CallMessage[];  // 通话转写内容
  recordingUrl?: string;      // 通话录音URL
}
