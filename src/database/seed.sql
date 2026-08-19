-- ============================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ============================================

-- 1. Kho hàng
INSERT INTO warehouses (id, code, name, address) VALUES
(1, 'KHO-01', 'Kho nguyên vật liệu',     'Tầng 1, Nhà máy A, KCN Biên Hòa, Đồng Nai'),
(2, 'KHO-02', 'Kho thành phẩm',          'Tầng 2, Nhà máy A, KCN Biên Hòa, Đồng Nai'),
(3, 'KHO-03', 'Kho dụng cụ - phụ tùng',   'Tầng 1, Nhà máy B, KCN Biên Hòa, Đồng Nai'),
(4, 'KHO-04', 'Kho bao bì đóng gói',     'Khu C, KCN Biên Hòa, Đồng Nai'),
(5, 'KHO-05', 'Kho hóa chất xử lý',      'Khu D, KCN Biên Hòa, Đồng Nai')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  address = EXCLUDED.address;

-- 2. Sản phẩm / Vật tư
INSERT INTO products (id, code, name, unit, description) VALUES
(1,  'NVL-001', 'Thép tấm SS400 dày 3mm',                     'Tấm',   'Thép tấm cán nóng tiêu chuẩn SS400'),
(2,  'NVL-002', 'Thép ống phi 60 dày 2mm',                     'Cây',   'Thép ống mạ kẽm chiều dài 6m'),
(3,  'NVL-003', 'Sơn công nghiệp Nippon màu xanh 5L',         'Thùng', 'Sơn phủ Epoxy kháng hóa chất'),
(4,  'NVL-004', 'Bu lông M10x50 inox 304',                     'Bộ',    'Bu lông kèm đai ốc và long đền'),
(5,  'NVL-005', 'Que hàn AWS E6013 phi 2.5',                   'Kg',    'Que hàn điện hồ quang tay'),
(6,  'DC-001',  'Găng tay bảo hộ vải',                         'Đôi',   'Găng tay sợi len bảo hộ lao động'),
(7,  'DC-002',  'Kính bảo hộ chống bụi UVEX',                  'Cái',   'Kính trong suốt chống va đập'),
(8,  'DC-003',  'Mũ bảo hộ lao động Thùy Dương',              'Cái',   'Mũ bảo hộ có núm vặn'),
(9,  'TP-001',  'Khung kệ thép 5 tầng KT: 200x50x200cm',      'Bộ',    'Kệ kho chứa hàng tải trọng 500kg/tầng'),
(10, 'TP-002',  'Bàn làm việc inox KT: 120x60x80cm',           'Cái',   'Bàn thao tác inox 304'),
(11, 'BB-001',  'Thùng carton 3 lớp KT: 40x30x30cm',           'Cái',   'Thùng carton sóng B chịu lực'),
(12, 'BB-002',  'Màng co PE dày 20 micron khổ 50cm',          'Cuộn',  'Màng quấn pallet chất lượng cao'),
(13, 'PT-001',  'Vòng bi 6205 NSK',                            'Cái',   'Vòng bi cầu rãnh sâu chính hãng'),
(14, 'PT-002',  'Dây đai răng HTD 5M dài 500mm',               'Sợi',   'Dây curoa truyền động công nghiệp'),
(15, 'PT-003',  'Bơm thủy lực Parker PV046',                   'Cái',   'Bơm piston biến tích lưu lượng')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  unit = EXCLUDED.unit;

-- 3. Phiếu nhập kho mẫu (25+ phiếu phong phú để kiểm thử phân trang)
INSERT INTO warehouse_receipts (
    id, receipt_number, receipt_date, company_name, department,
    debit_account, credit_account, deliverer_name,
    ref_document, warehouse_id, total_amount, total_amount_text,
    attached_documents, creator_name, deliverer_signer,
    storekeeper_name, accountant_name, status
) VALUES
(1,  'NK-20260818-001', '2026-08-18', 'Công ty Cổ phần Công nghệ VIMES', 'Phòng Kế hoạch & Sản xuất', '152', '331', 'Nguyễn Văn An', 'Hóa đơn GTGT số 0001234 ngày 15/08/2026', 1, 0, 'Sáu mươi triệu một trăm linh bảy nghìn năm trăm đồng', 2, 'Trần Thị Bình', 'Nguyễn Văn An', 'Lê Văn Cường', 'Phạm Thị Dung', 'draft'),
(2,  'NK-20260817-001', '2026-08-17', 'Công ty TNHH Cơ Khí Đại Việt',   'Phòng Kỹ thuật Vật tư',    '152', '111', 'Trần Đình Trọng', 'Hóa đơn bán hàng số 00567', 1, 0, 'Mười hai triệu năm trăm nghìn đồng', 1, 'Trần Thị Bình', 'Trần Đình Trọng', 'Lê Văn Cường', 'Phạm Thị Dung', 'confirmed'),
(3,  'NK-20260816-001', '2026-08-16', 'Công ty TNHH Nhựa & Bao Bì',     'Bộ phận Đóng gói',         '153', '331', 'Lê Hoàng Nam', 'Phiếu xuất kho kiêm vận chuyển số 890', 4, 0, 'Tám triệu hai trăm nghìn đồng', 1, 'Nguyễn Văn Lập', 'Lê Hoàng Nam', 'Trần Thủ Kho', 'Lê Kế Toán', 'confirmed'),
(4,  'NK-20260815-001', '2026-08-15', 'Công ty Sơn Nippon Việt Nam',     'Xưởng Sản xuất Số 2',      '152', '331', 'Vũ Quốc Bảo', 'HĐ số 0009988 ngày 12/08/2026', 1, 0, 'Mười lăm triệu đồng', 2, 'Trần Thị Bình', 'Vũ Quốc Bảo', 'Lê Văn Cường', 'Phạm Thị Dung', 'draft'),
(5,  'NK-20260814-001', '2026-08-14', 'Công ty Cổ phần Công nghệ VIMES', 'Xưởng Lắp ráp Thiết bị',   '156', '331', 'Đặng Thành Long', 'Biên bản bàn giao số 112', 2, 0, 'Bốn mươi lăm triệu đồng', 1, 'Trần Thị Bình', 'Đặng Thành Long', 'Lê Văn Cường', 'Phạm Thị Dung', 'confirmed'),
(6,  'NK-20260813-001', '2026-08-13', 'Công ty Bảo Hộ Lao Động An Toàn', 'Phòng An Toàn Lao Động',   '153', '111', 'Bùi Đức Hạnh', 'Hóa đơn số 33421', 3, 0, 'Sáu triệu tám trăm nghìn đồng', 1, 'Nguyễn Văn Lập', 'Bùi Đức Hạnh', 'Trần Thủ Kho', 'Lê Kế Toán', 'draft'),
(7,  'NK-20260812-001', '2026-08-12', 'Công ty Thủy Lực Parker VN',      'Xưởng Cơ Điện',            '153', '331', 'Hoàng Minh Tuấn', 'Hóa đơn VAT số 0045612', 3, 0, 'Hai mươi tám triệu đồng', 2, 'Trần Thị Bình', 'Hoàng Minh Tuấn', 'Lê Văn Cường', 'Phạm Thị Dung', 'cancelled'),
(8,  'NK-20260811-001', '2026-08-11', 'Công ty Cổ phần Thép Hòa Phát',   'Phòng Kế hoạch & Sản xuất', '152', '331', 'Ngô Quang Khải', 'Hóa đơn số HP-2026-089', 1, 0, 'Chín mươi triệu đồng', 3, 'Trần Thị Bình', 'Ngô Quang Khải', 'Lê Văn Cường', 'Phạm Thị Dung', 'confirmed'),
(9,  'NK-20260810-001', '2026-08-10', 'Công ty Phụ Tùng Công Nghiệp',    'Phòng Bảo Trì Máy',        '153', '111', 'Phan Văn Đức', 'HĐ số 001923', 3, 0, 'Mười một triệu năm trăm nghìn đồng', 1, 'Nguyễn Văn Lập', 'Phan Văn Đức', 'Trần Thủ Kho', 'Lê Kế Toán', 'draft'),
(10, 'NK-20260809-001', '2026-08-09', 'Công ty TNHH VIMES',              'Xưởng Sản xuất',           '152', '331', 'Đỗ Mạnh Cường', 'Biên bản nghiệm thu số 445', 1, 0, 'Ba mươi triệu đồng', 2, 'Trần Thị Bình', 'Đỗ Mạnh Cường', 'Lê Văn Cường', 'Phạm Thị Dung', 'confirmed'),
(11, 'NK-20260808-001', '2026-08-08', 'Công ty Bao Bì Carton Tân Bình',  'Bộ phận Đóng gói',         '153', '111', 'Dương Văn Tiến', 'HĐ số 009812', 4, 0, 'Năm triệu bốn trăm nghìn đồng', 1, 'Nguyễn Văn Lập', 'Dương Văn Tiến', 'Trần Thủ Kho', 'Lê Kế Toán', 'draft'),
(12, 'NK-20260807-001', '2026-08-07', 'Công ty Hóa Chất Công Nghiệp',    'Xưởng Xử lý Bề mặt',       '152', '331', 'Tạ Đình Phong', 'Hóa đơn VAT số 0998', 5, 0, 'Mười tám triệu sáu trăm nghìn đồng', 2, 'Trần Thị Bình', 'Tạ Đình Phong', 'Lê Văn Cường', 'Phạm Thị Dung', 'confirmed'),
(13, 'NK-20260806-001', '2026-08-06', 'Công ty Kim Khí Tân Phát',        'Phòng Vật tư',             '152', '331', 'Trịnh Bá Hưng', 'HĐ số 004412', 1, 0, 'Bảy mươi hai triệu đồng', 1, 'Trần Thị Bình', 'Trịnh Bá Hưng', 'Lê Văn Cường', 'Phạm Thị Dung', 'draft'),
(14, 'NK-20260805-001', '2026-08-05', 'Công ty Cổ phần Thiết Bị Đo',     'Phòng Kiểm định KCS',      '153', '111', 'Lý Văn Hải', 'Biên bản bàn giao số 09', 3, 0, 'Tám triệu đồng', 1, 'Nguyễn Văn Lập', 'Lý Văn Hải', 'Trần Thủ Kho', 'Lê Kế Toán', 'confirmed'),
(15, 'NK-20260804-001', '2026-08-04', 'Công ty Cổ phần Công nghệ VIMES', 'Kho Thành phẩm',          '156', '155', 'Lưu Văn Toàn', 'Lệnh điều chuyển nội bộ số 12', 2, 0, 'Năm mươi lăm triệu đồng', 1, 'Trần Thị Bình', 'Lưu Văn Toàn', 'Lê Văn Cường', 'Phạm Thị Dung', 'confirmed'),
(16, 'NK-20260803-001', '2026-08-03', 'Công ty Thép Posco Việt Nam',     'Phòng Kế hoạch & Sản xuất', '152', '331', 'Vũ Đình Hải', 'Hóa đơn số PS-2026-44', 1, 0, 'Một trăm mười triệu đồng', 2, 'Trần Thị Bình', 'Vũ Đình Hải', 'Lê Văn Cường', 'Phạm Thị Dung', 'draft'),
(17, 'NK-20260802-001', '2026-08-02', 'Công ty TNHH Nhập Khẩu Vòng Bi',  'Phòng Bảo Trì',            '153', '111', 'Cao Văn Thắng', 'HĐ số 003319', 3, 0, 'Chín triệu sáu trăm nghìn đồng', 1, 'Nguyễn Văn Lập', 'Cao Văn Thắng', 'Trần Thủ Kho', 'Lê Kế Toán', 'confirmed'),
(18, 'NK-20260801-001', '2026-08-01', 'Công ty TNHH Nhựa Đông Á',        'Xưởng Sản xuất Bao bì',    '152', '331', 'Hà Văn Quý', 'Hóa đơn số 001290', 4, 0, 'Hai mươi mốt triệu đồng', 2, 'Trần Thị Bình', 'Hà Văn Quý', 'Lê Văn Cường', 'Phạm Thị Dung', 'draft'),
(19, 'NK-20260731-001', '2026-07-31', 'Công ty TNHH Dầu Nhờn Total',     'Xưởng Cơ Điện',            '152', '111', 'Nguyễn Tấn Đạt', 'HĐ số 00994', 5, 0, 'Mười tư triệu đồng', 1, 'Nguyễn Văn Lập', 'Nguyễn Tấn Đạt', 'Trần Thủ Kho', 'Lê Kế Toán', 'confirmed'),
(20, 'NK-20260730-001', '2026-07-30', 'Công ty TNHH Điện Công Nghiệp',    'Phòng Kỹ thuật Điện',      '153', '331', 'Phạm Văn Hưng', 'Biên bản giao nhận số 67', 3, 0, 'Mười sáu triệu năm trăm nghìn đồng', 1, 'Trần Thị Bình', 'Phạm Văn Hưng', 'Lê Văn Cường', 'Phạm Thị Dung', 'draft'),
(21, 'NK-20260729-001', '2026-07-29', 'Công ty Cổ phần Thép Pomina',     'Xưởng Gia công Kết cấu',   '152', '331', 'Lê Văn Sơn', 'Hóa đơn GTGT số 00771', 1, 0, 'Tám mươi lăm triệu đồng', 3, 'Trần Thị Bình', 'Lê Văn Sơn', 'Lê Văn Cường', 'Phạm Thị Dung', 'confirmed'),
(22, 'NK-20260728-001', '2026-07-28', 'Công ty Thiết Bị Công Nghiệp',    'Phòng Dụng Cụ',            '153', '111', 'Trần Văn Sang', 'Hóa đơn số 00188', 3, 0, 'Bốn triệu hai trăm nghìn đồng', 1, 'Nguyễn Văn Lập', 'Trần Văn Sang', 'Trần Thủ Kho', 'Lê Kế Toán', 'cancelled'),
(23, 'NK-20260727-001', '2026-07-27', 'Công ty TNHH Sơn Jotun VN',       'Xưởng Hoàn Thiện',         '152', '331', 'Ngô Văn Luận', 'HĐ số 002231', 1, 0, 'Hai mươi tư triệu đồng', 2, 'Trần Thị Bình', 'Ngô Văn Luận', 'Lê Văn Cường', 'Phạm Thị Dung', 'confirmed'),
(24, 'NK-20260726-001', '2026-07-26', 'Công ty TNHH Nhựa Tân Á',         'Kho Bao bì',               '152', '111', 'Đinh Văn Hoàng', 'Hóa đơn số 00412', 4, 0, 'Mười ba triệu đồng', 1, 'Nguyễn Văn Lập', 'Đinh Văn Hoàng', 'Trần Thủ Kho', 'Lê Kế Toán', 'draft'),
(25, 'NK-20260725-001', '2026-07-25', 'Công ty Cổ phần Công nghệ VIMES', 'Kho Thành phẩm',          '156', '155', 'Vũ Văn Tài', 'Phiếu nhập kho thành phẩm số 88', 2, 0, 'Sáu mươi tám triệu đồng', 2, 'Trần Thị Bình', 'Vũ Văn Tài', 'Lê Văn Cường', 'Phạm Thị Dung', 'confirmed')
ON CONFLICT (id) DO UPDATE SET
  receipt_number = EXCLUDED.receipt_number,
  receipt_date = EXCLUDED.receipt_date,
  deliverer_name = EXCLUDED.deliverer_name,
  warehouse_id = EXCLUDED.warehouse_id,
  status = EXCLUDED.status;

-- 4. Chi tiết phiếu nhập kho mẫu
INSERT INTO warehouse_receipt_details (
    receipt_id, line_number, product_id, product_name,
    product_code, unit, quantity_document, quantity_actual, unit_price
) VALUES
(1,  1, 1,  'Thép tấm SS400 dày 3mm',                 'NVL-001', 'Tấm',   100, 98,   350000),
(1,  2, 2,  'Thép ống phi 60 dày 2mm',                 'NVL-002', 'Cây',   200, 200,  125000),
(1,  3, 4,  'Bu lông M10x50 inox 304',                 'NVL-004', 'Bộ',    500, 495,  8500),
(2,  1, 2,  'Thép ống phi 60 dày 2mm',                 'NVL-002', 'Cây',   100, 100,  125000),
(3,  1, 11, 'Thùng carton 3 lớp KT: 40x30x30cm',       'BB-001',  'Cái',   1000, 1000, 8200),
(4,  1, 3,  'Sơn công nghiệp Nippon màu xanh 5L',     'NVL-003', 'Thùng', 50,  50,   300000),
(5,  1, 9,  'Khung kệ thép 5 tầng KT: 200x50x200cm',  'TP-001',  'Bộ',    30,  30,   1500000),
(6,  1, 6,  'Găng tay bảo hộ vải',                     'DC-001',  'Đôi',   200, 200,  15000),
(6,  2, 7,  'Kính bảo hộ chống bụi UVEX',              'DC-002',  'Cái',   50,  50,   76000),
(7,  1, 15, 'Bơm thủy lực Parker PV046',               'PT-003',  'Cái',   2,   2,    14000000),
(8,  1, 1,  'Thép tấm SS400 dày 3mm',                 'NVL-001', 'Tấm',   250, 250,  360000),
(9,  1, 13, 'Vòng bi 6205 NSK',                        'PT-001',  'Cái',   100, 100,  115000),
(10, 1, 10, 'Bàn làm việc inox KT: 120x60x80cm',       'TP-002',  'Cái',   15,  15,   2000000),
(11, 1, 12, 'Màng co PE dày 20 micron khổ 50cm',      'BB-002',  'Cuộn',  60,  60,   90000),
(12, 1, 5,  'Que hàn AWS E6013 phi 2.5',               'NVL-005', 'Kg',    300, 300,  62000),
(13, 1, 1,  'Thép tấm SS400 dày 3mm',                 'NVL-001', 'Tấm',   200, 200,  360000),
(14, 1, 8,  'Mũ bảo hộ lao động Thùy Dương',          'DC-003',  'Cái',   100, 100,  80000),
(15, 1, 9,  'Khung kệ thép 5 tầng KT: 200x50x200cm',  'TP-001',  'Bộ',    35,  35,   1571428.57),
(16, 1, 1,  'Thép tấm SS400 dày 3mm',                 'NVL-001', 'Tấm',   300, 300,  366666.67),
(17, 1, 14, 'Dây đai răng HTD 5M dài 500mm',           'PT-002',  'Sợi',   120, 120,  80000),
(18, 1, 11, 'Thùng carton 3 lớp KT: 40x30x30cm',       'BB-001',  'Cái',   2500, 2500, 8400),
(19, 1, 3,  'Sơn công nghiệp Nippon màu xanh 5L',     'NVL-003', 'Thùng', 40,  40,   350000),
(20, 1, 4,  'Bu lông M10x50 inox 304',                 'NVL-004', 'Bộ',    1800, 1800, 9166.67),
(21, 1, 2,  'Thép ống phi 60 dày 2mm',                 'NVL-002', 'Cây',   680, 680,  125000),
(22, 1, 6,  'Găng tay bảo hộ vải',                     'DC-001',  'Đôi',   250, 250,  16800),
(23, 1, 3,  'Sơn công nghiệp Nippon màu xanh 5L',     'NVL-003', 'Thùng', 60,  60,   400000),
(24, 1, 12, 'Màng co PE dày 20 micron khổ 50cm',      'BB-002',  'Cuộn',  130, 130,  100000),
(25, 1, 10, 'Bàn làm việc inox KT: 120x60x80cm',       'TP-002',  'Cái',   34,  34,   2000000)
ON CONFLICT (receipt_id, line_number) DO NOTHING;

-- Reset sequence cho ID
SELECT setval('warehouses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM warehouses));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));
SELECT setval('warehouse_receipts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM warehouse_receipts));
SELECT setval('warehouse_receipt_details_id_seq', (SELECT COALESCE(MAX(id), 1) FROM warehouse_receipt_details));
