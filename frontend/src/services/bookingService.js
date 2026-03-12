// Booking utility helpers

export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  on_the_way: 'On the Way',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  on_the_way: '#8b5cf6',
  in_progress: '#f97316',
  completed: '#10b981',
  cancelled: '#ef4444',
};

export const STATUS_ICONS = {
  pending: '⏳',
  confirmed: '✅',
  on_the_way: '🚗',
  in_progress: '🔧',
  completed: '🎉',
  cancelled: '❌',
};

export const PAYMENT_METHODS = [
  { value: 'upi', label: '📱 UPI', desc: 'GPay, PhonePe, Paytm' },
  { value: 'credit_card', label: '💳 Credit Card', desc: 'Visa, Mastercard' },
  { value: 'debit_card', label: '🏦 Debit Card', desc: 'All banks supported' },
  { value: 'cash', label: '💵 Cash', desc: 'Pay on service' },
];

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

export const getNextStatus = (currentStatus) => {
  const flow = { pending: 'confirmed', confirmed: 'on_the_way', on_the_way: 'in_progress', in_progress: 'completed' };
  return flow[currentStatus] || null;
};
