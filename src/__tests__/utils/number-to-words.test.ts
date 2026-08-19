import { numberToVietnameseWords } from '../../utils/number-to-words';

describe('numberToVietnameseWords Utility', () => {
  test('0 -> "Không đồng"', () => {
    expect(numberToVietnameseWords(0)).toBe('Không đồng');
  });

  test('1 -> "Một đồng"', () => {
    expect(numberToVietnameseWords(1)).toBe('Một đồng');
  });

  test('10 -> "Mười đồng"', () => {
    expect(numberToVietnameseWords(10)).toBe('Mười đồng');
  });

  test('11 -> "Mười một đồng"', () => {
    expect(numberToVietnameseWords(11)).toBe('Mười một đồng');
  });

  test('14 -> "Mười bốn đồng"', () => {
    expect(numberToVietnameseWords(14)).toBe('Mười bốn đồng');
  });

  test('15 -> "Mười lăm đồng" (không phải "mười năm")', () => {
    expect(numberToVietnameseWords(15)).toBe('Mười lăm đồng');
  });

  test('21 -> "Hai mươi mốt đồng" (không phải "hai mươi một")', () => {
    expect(numberToVietnameseWords(21)).toBe('Hai mươi mốt đồng');
  });

  test('24 -> "Hai mươi tư đồng" (hoặc bốn)', () => {
    expect(numberToVietnameseWords(24)).toBe('Hai mươi tư đồng');
  });

  test('25 -> "Hai mươi lăm đồng"', () => {
    expect(numberToVietnameseWords(25)).toBe('Hai mươi lăm đồng');
  });

  test('101 -> "Một trăm lẻ một đồng"', () => {
    expect(numberToVietnameseWords(101)).toBe('Một trăm lẻ một đồng');
  });

  test('105 -> "Một trăm lẻ năm đồng"', () => {
    expect(numberToVietnameseWords(105)).toBe('Một trăm lẻ năm đồng');
  });

  test('1000 -> "Một nghìn đồng"', () => {
    expect(numberToVietnameseWords(1000)).toBe('Một nghìn đồng');
  });

  test('1001 -> "Một nghìn không trăm lẻ một đồng"', () => {
    expect(numberToVietnameseWords(1001)).toBe('Một nghìn không trăm lẻ một đồng');
  });

  test('1,500,000 -> "Một triệu năm trăm nghìn đồng"', () => {
    expect(numberToVietnameseWords(1500000)).toBe('Một triệu năm trăm nghìn đồng');
  });

  test('59,500,000 -> "Năm mươi chín triệu năm trăm nghìn đồng"', () => {
    expect(numberToVietnameseWords(59500000)).toBe('Năm mươi chín triệu năm trăm nghìn đồng');
  });

  test('1,000,000,000 -> "Một tỷ đồng"', () => {
    expect(numberToVietnameseWords(1000000000)).toBe('Một tỷ đồng');
  });

  test('Số âm -> throw Error', () => {
    expect(() => numberToVietnameseWords(-100)).toThrow('Số tiền không được âm');
  });

  test('Infinity / NaN -> throw Error', () => {
    expect(() => numberToVietnameseWords(Infinity)).toThrow('Số tiền không hợp lệ');
    expect(() => numberToVietnameseWords(NaN)).toThrow('Số tiền không hợp lệ');
  });

  test('Số thập phân làm tròn', () => {
    expect(numberToVietnameseWords(1500.8)).toBe('Một nghìn năm trăm lẻ một đồng');
    expect(numberToVietnameseWords(1500.2)).toBe('Một nghìn năm trăm đồng');
  });
});
