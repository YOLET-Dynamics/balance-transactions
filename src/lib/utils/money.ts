/**
 * Money utilities for ETB (Ethiopian Birr)
 * All amounts stored as Decimal in DB, handled as numbers in code
 */

const BIRR_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS_WORDS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const SCALE_WORDS = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

/**
 * Convert a number (0-999) to words
 */
function numberToWordsUnder1000(num: number): string {
  if (num === 0) return '';
  if (num < 20) return BIRR_WORDS[num];
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return TENS_WORDS[tens] + (ones > 0 ? ' ' + BIRR_WORDS[ones] : '');
  }
  
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  let result = BIRR_WORDS[hundreds] + ' Hundred';
  if (remainder > 0) {
    result += ' and ' + numberToWordsUnder1000(remainder);
  }
  return result;
}

/**
 * Convert a number to Ethiopian Birr words
 * @param amount - The amount in ETB
 * @returns String representation in words
 * @example moneyToWords(1234.56) => "One Thousand Two Hundred Thirty Four Birr and Fifty Six Cents"
 */
export function moneyToWords(amount: number): string {
  if (amount === 0) return 'Zero Birr';
  
  // Split into birr and cents
  const [birrPart, centsPart = '0'] = amount.toFixed(2).split('.');
  const birr = parseInt(birrPart, 10);
  const cents = parseInt(centsPart, 10);
  
  let result = '';
  
  // Process birr part
  if (birr > 0) {
    const parts: string[] = [];
    let remaining = birr;
    let scaleIndex = 0;
    
    while (remaining > 0) {
      const chunk = remaining % 1000;
      if (chunk > 0) {
        const chunkWords = numberToWordsUnder1000(chunk);
        const scale = SCALE_WORDS[scaleIndex];
        parts.unshift(chunkWords + (scale ? ' ' + scale : ''));
      }
      remaining = Math.floor(remaining / 1000);
      scaleIndex++;
    }
    
    result = parts.join(' ') + ' Birr';
  }
  
  // Process cents part
  if (cents > 0) {
    if (result) result += ' and ';
    result += numberToWordsUnder1000(cents) + ' Cents';
  }
  
  return result;
}

/**
 * Format money for display
 * @param amount - The amount to format
 * @param currency - Currency code (default: ETB)
 * @returns Formatted string
 * @example formatMoney(1234.56) => "ETB 1,234.56"
 */
export function formatMoney(amount: number, currency: string = 'ETB'): string {
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Round money to 2 decimal places
 */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Add two money amounts safely
 */
export function addMoney(a: number, b: number): number {
  return roundMoney(a + b);
}

/**
 * Subtract two money amounts safely
 */
export function subtractMoney(a: number, b: number): number {
  return roundMoney(a - b);
}

/**
 * Multiply money by a factor
 */
export function multiplyMoney(amount: number, factor: number): number {
  return roundMoney(amount * factor);
}

/**
 * Calculate percentage of an amount
 */
export function percentageOf(amount: number, percentage: number): number {
  return roundMoney((amount * percentage) / 100);
}

/**
 * Calculate VAT amount (default 15% for Ethiopia)
 */
export function calculateVAT(amount: number, vatRate: number = 15): number {
  return percentageOf(amount, vatRate);
}

/**
 * Calculate withholding tax
 * Rules: 
 * - Service: if amount > 20,000, withhold 3%
 * - Goods: if amount > 30,000, withhold 3%
 */
export function calculateWithholding(
  amount: number,
  isCompany: boolean,
  isService: boolean
): { withheldPct: number; withheldAmount: number } {
  if (!isCompany) {
    return { withheldPct: 0, withheldAmount: 0 };
  }
  
  const threshold = isService ? 20000 : 30000;
  
  if (amount > threshold) {
    return {
      withheldPct: 3,
      withheldAmount: percentageOf(amount, 3),
    };
  }
  
  return { withheldPct: 0, withheldAmount: 0 };
}

/**
 * Parse money string to number
 */
export function parseMoney(str: string): number {
  const cleaned = str.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : roundMoney(parsed);
}

