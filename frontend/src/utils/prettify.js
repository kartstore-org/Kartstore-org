/**
 * KARTSTORE formatting helpers for the React storefront and seller/admin panels.
 * Display-only helpers: never use these functions to calculate trusted payment totals.
 */

const DEFAULT_LOCALE = 'en-IN';
const DEFAULT_CURRENCY = 'INR';

export function formatPrice(amount, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return new Intl.NumberFormat(locale, {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(0);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatCompactPrice(amount, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return formatPrice(0, currency, locale);
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(value, locale = DEFAULT_LOCALE) {
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat(locale).format(number) : '0';
}

export function formatPercentage(value, decimals = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(decimals)}%` : '0%';
}

export function formatDate(date, options = {
  day: '2-digit', month: 'short', year: 'numeric',
}, locale = DEFAULT_LOCALE) {
  if (!date) return 'N/A';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return new Intl.DateTimeFormat(locale, options).format(parsed);
}

export function formatDateTime(date, locale = DEFAULT_LOCALE) {
  return formatDate(date, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }, locale);
}

export function formatTime(date, locale = DEFAULT_LOCALE) {
  return formatDate(date, { hour: '2-digit', minute: '2-digit' }, locale);
}

export function formatRelativeDate(date, locale = DEFAULT_LOCALE) {
  if (!date) return 'N/A';
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return 'N/A';
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  for (const [unit, size] of units) {
    const amount = Math.round(seconds / size);
    if (Math.abs(amount) >= 1) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(amount, unit);
    }
  }
  return 'Just now';
}

export function toTitleCase(value = '') {
  return String(value).toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

export function toSentenceCase(value = '') {
  const text = String(value).trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
}

export function capitalize(value = '') {
  const text = String(value);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

export function createSlug(value = '') {
  return String(value).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function truncateText(value = '', maxLength = 100) {
  const text = String(value);
  return text.length <= maxLength ? text : `${text.slice(0, maxLength).trim()}...`;
}

export function formatStockStatus(stock) {
  const quantity = Number(stock);
  if (!Number.isFinite(quantity) || quantity <= 0) return 'Out of Stock';
  return quantity <= 5 ? 'Low Stock' : 'In Stock';
}

export function calculateDiscount(originalPrice, salePrice) {
  const original = Number(originalPrice);
  const sale = Number(salePrice);
  if (!Number.isFinite(original) || !Number.isFinite(sale)
    || original <= 0 || sale < 0 || sale > original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function calculateProfit(sellingPrice, productCost, shippingCost = 0) {
  const values = [sellingPrice, productCost, shippingCost].map(Number);
  if (!values.every(Number.isFinite)) return 0;
  return values[0] - values[1] - values[2];
}

export function calculateMargin(profit, sellingPrice) {
  const amount = Number(profit);
  const price = Number(sellingPrice);
  if (!Number.isFinite(amount) || !Number.isFinite(price) || price <= 0) return 0;
  return Number(((amount / price) * 100).toFixed(2));
}

export function formatOrderStatus(status = '') {
  return toTitleCase(String(status).replace(/[_-]/g, ' '));
}

export function getOrderStatusColor(status = '') {
  const colors = {
    pending: 'warning', paid: 'success', processing: 'info', shipped: 'info',
    delivered: 'success', cancelled: 'danger', refunded: 'secondary', failed: 'danger',
    'out for delivery': 'info',
  };
  return colors[String(status).toLowerCase()] || 'secondary';
}

export function getInitials(name = '') {
  return String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase()).join('');
}

export function formatPhone(phone = '') {
  return String(phone).replace(/[^\d+]/g, '');
}

export function maskEmail(email = '') {
  const [username, domain] = String(email).split('@');
  if (!username || !domain) return 'Invalid email';
  return `${username.slice(0, 2)}${'*'.repeat(Math.max(0, username.length - 2))}@${domain}`;
}

export function maskPhone(phone = '') {
  const value = String(phone);
  if (value.length < 5) return value;
  return `${value.slice(0, 2)}${'*'.repeat(value.length - 5)}${value.slice(-3)}`;
}

export function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / (1024 ** index)).toFixed(2)} ${units[index]}`;
}

export function getFileExtension(filename = '') {
  const parts = String(filename).split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

export function isSupportedImportFile(filename = '') {
  return ['csv', 'xls', 'xlsx'].includes(getFileExtension(filename));
}

export function formatBoolean(value) {
  return value ? 'Yes' : 'No';
}

export function formatAddress(address = {}) {
  return [address.addressLine1, address.addressLine2, address.city, address.state,
    address.postalCode, address.country].filter(Boolean).join(', ');
}

export function safeValue(value, fallback = 'N/A') {
  return value === null || value === undefined || value === '' ? fallback : value;
}
