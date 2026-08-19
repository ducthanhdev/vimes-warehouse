const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

function readGroup(hundreds: number, tens: number, ones: number, hasHigherGroup: boolean): string {
  const parts: string[] = [];

  if (hundreds > 0) {
    parts.push(`${DIGITS[hundreds]} trăm`);
  } else if (hasHigherGroup && (tens > 0 || ones > 0)) {
    parts.push('không trăm');
  }

  if (tens === 0 && ones > 0 && (hundreds > 0 || hasHigherGroup)) {
    parts.push('lẻ');
  } else if (tens === 1) {
    parts.push('mười');
  } else if (tens > 1) {
    parts.push(`${DIGITS[tens]} mươi`);
  }

  if (ones === 1) {
    if (tens === 0 || tens === 1) {
      parts.push('một');
    } else {
      parts.push('mốt');
    }
  } else if (ones === 4 && tens > 1) {
    parts.push('tư');
  } else if (ones === 5 && tens > 0) {
    parts.push('lăm');
  } else if (ones > 0) {
    parts.push(DIGITS[ones]);
  }

  return parts.join(' ');
}

export function numberToVietnameseWords(amount: number): string {
  if (amount < 0) throw new Error('Số tiền không được âm');
  if (!Number.isFinite(amount)) throw new Error('Số tiền không hợp lệ');

  amount = Math.round(amount);

  if (amount === 0) return 'Không đồng';

  const groups: number[] = [];
  let remaining = amount;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (group === 0) continue;

    const hundreds = Math.floor(group / 100);
    const tens = Math.floor((group % 100) / 10);
    const ones = group % 10;

    const hasHigherGroup = i < groups.length - 1;
    const groupText = readGroup(hundreds, tens, ones, hasHigherGroup);

    if (groupText) {
      const unit = UNITS[i] ? ` ${UNITS[i]}` : '';
      parts.push(`${groupText}${unit}`.trim());
    }
  }

  const result = parts.join(' ').replace(/\s+/g, ' ').trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
}
