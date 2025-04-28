/**
 * Normalizes form data to ensure consistent data types
 * @param data - The form data to normalize
 * @returns Normalized form data with consistent data types
 */
export const normalizeFormData = (data: any) => {
  return {
    ...data,
    employee_id: data.employee_id ? Number(data.employee_id) : null,
    customer_id: data.customer_id ? Number(data.customer_id) : null,
    newspaper_id: data.newspaper_id ? Number(data.newspaper_id) : null,
    owner_id: data.owner_id ? Number(data.owner_id) : null,
    subscription_id: data.subscription_id ? Number(data.subscription_id) : null,
    payment_id: data.payment_id ? Number(data.payment_id) : null,
    delivery_id: data.delivery_id ? Number(data.delivery_id) : null,
    price: data.price ? Number(data.price) : 0,
    monthly_fee: data.monthly_fee ? Number(data.monthly_fee) : 0,
    amount: data.amount ? Number(data.amount) : 0
  };
};

/**
 * Formats a date string to YYYY-MM-DD format
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a currency value
 * @param value - The value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return `$${Number(value).toFixed(2)}`;
}; 