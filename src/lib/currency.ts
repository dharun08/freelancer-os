/**
 * Centralized currency formatting utility for Freelancer OS.
 * Formats numbers into INR (₹) using Indian locale formatting.
 *
 * Example: 50000 -> ₹50,000.00
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}
