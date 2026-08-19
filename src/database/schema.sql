DROP TABLE IF EXISTS warehouse_receipt_details CASCADE;
DROP TABLE IF EXISTS warehouse_receipts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;

-- 1. BẢNG KHO (warehouses)
CREATE TABLE warehouses (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(20)  NOT NULL UNIQUE,        -- Mã kho (VD: 'KHO-01')
    name        VARCHAR(255) NOT NULL,               -- Tên kho (VD: 'Kho nguyên vật liệu')
    address     VARCHAR(500),                        -- Địa chỉ kho
    is_active   BOOLEAN      DEFAULT TRUE,           -- Trạng thái hoạt động
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

-- 2. BẢNG SẢN PHẨM / VẬT TƯ (products)
CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,         -- Mã số (Cột C)
    name        VARCHAR(500) NOT NULL,                -- Tên, nhãn hiệu, quy cách, phẩm chất (Cột B)
    unit        VARCHAR(50)  NOT NULL,                -- Đơn vị tính (Cột D)
    description TEXT,                                 -- Mô tả chi tiết
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

-- 3. BẢNG PHIẾU NHẬP KHO - HEADER (warehouse_receipts)
CREATE TABLE warehouse_receipts (
    id                   SERIAL PRIMARY KEY,
    receipt_number       VARCHAR(50)   NOT NULL UNIQUE,  -- Số phiếu (auto: NK-YYYYMMDD-XXX)
    receipt_date         DATE          NOT NULL,          -- Ngày lập phiếu
    company_name         VARCHAR(255),                    -- Đơn vị
    department           VARCHAR(255),                    -- Bộ phận
    debit_account        VARCHAR(20),                     -- Nợ (tài khoản nợ)
    credit_account       VARCHAR(20),                     -- Có (tài khoản có)
    deliverer_name       VARCHAR(255)  NOT NULL,          -- Họ và tên người giao
    ref_document         VARCHAR(255),                    -- Theo...số...ngày...tháng...năm...của...
    warehouse_id         INTEGER       NOT NULL           -- Nhập tại kho
                         REFERENCES warehouses(id),
    total_amount         DECIMAL(18,2) DEFAULT 0,         -- Tổng cộng thành tiền
    total_amount_text    VARCHAR(500),                    -- Tổng số tiền (viết bằng chữ)
    attached_documents   INTEGER       DEFAULT 0,         -- Số chứng từ gốc kèm theo
    creator_name         VARCHAR(255),                    -- Người lập phiếu (Ký, họ tên)
    deliverer_signer     VARCHAR(255),                    -- Người giao hàng (Ký, họ tên)
    storekeeper_name     VARCHAR(255),                    -- Thủ kho (Ký, họ tên)
    accountant_name      VARCHAR(255),                    -- Kế toán trưởng (Ký, họ tên)
    status               VARCHAR(20)   DEFAULT 'draft'    -- draft | confirmed | cancelled
                         CHECK (status IN ('draft', 'confirmed', 'cancelled')),
    created_at           TIMESTAMP     DEFAULT NOW(),
    updated_at           TIMESTAMP     DEFAULT NOW()
);

-- 4. BẢNG CHI TIẾT PHIẾU NHẬP KHO (warehouse_receipt_details)
CREATE TABLE warehouse_receipt_details (
    id                   SERIAL PRIMARY KEY,
    receipt_id           INTEGER       NOT NULL
                         REFERENCES warehouse_receipts(id) ON DELETE CASCADE,
    line_number          INTEGER       NOT NULL,          -- STT (Cột A)
    product_id           INTEGER       REFERENCES products(id) ON DELETE SET NULL,
    product_name         VARCHAR(500)  NOT NULL,           -- Tên hàng hóa (Cột B) - denormalized
    product_code         VARCHAR(50),                      -- Mã số (Cột C) - denormalized
    unit                 VARCHAR(50)   NOT NULL,           -- Đơn vị tính (Cột D) - denormalized
    quantity_document    DECIMAL(15,3) NOT NULL DEFAULT 0  -- Số lượng theo chứng từ (Cột 1)
                         CHECK (quantity_document >= 0),
    quantity_actual      DECIMAL(15,3) NOT NULL DEFAULT 0  -- Số lượng thực nhập (Cột 2)
                         CHECK (quantity_actual >= 0),
    unit_price           DECIMAL(15,2) NOT NULL DEFAULT 0  -- Đơn giá (Cột 3)
                         CHECK (unit_price >= 0),
    total_price          DECIMAL(18,2) GENERATED ALWAYS AS (quantity_actual * unit_price) STORED, -- Thành tiền (Cột 4)
    created_at           TIMESTAMP     DEFAULT NOW(),
    UNIQUE(receipt_id, line_number)
);

-- INDEXES
CREATE INDEX idx_receipts_date        ON warehouse_receipts(receipt_date DESC);
CREATE INDEX idx_receipts_number      ON warehouse_receipts(receipt_number);
CREATE INDEX idx_receipts_status      ON warehouse_receipts(status);
CREATE INDEX idx_receipts_warehouse   ON warehouse_receipts(warehouse_id);
CREATE INDEX idx_details_receipt      ON warehouse_receipt_details(receipt_id);
CREATE INDEX idx_details_product      ON warehouse_receipt_details(product_id);
CREATE INDEX idx_products_code        ON products(code);
CREATE INDEX idx_products_name        ON products(name);
CREATE INDEX idx_warehouses_code      ON warehouses(code);

-- TRIGGER: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_receipts_updated_at
    BEFORE UPDATE ON warehouse_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- TRIGGER: Auto-update total_amount trên header khi detail thay đổi
CREATE OR REPLACE FUNCTION update_receipt_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE warehouse_receipts
        SET total_amount = COALESCE(
            (SELECT SUM(quantity_actual * unit_price)
             FROM warehouse_receipt_details
             WHERE receipt_id = OLD.receipt_id), 0
        )
        WHERE id = OLD.receipt_id;
        RETURN OLD;
    ELSE
        UPDATE warehouse_receipts
        SET total_amount = COALESCE(
            (SELECT SUM(quantity_actual * unit_price)
             FROM warehouse_receipt_details
             WHERE receipt_id = NEW.receipt_id), 0
        )
        WHERE id = NEW.receipt_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_receipt_total
    AFTER INSERT OR UPDATE OR DELETE ON warehouse_receipt_details
    FOR EACH ROW EXECUTE FUNCTION update_receipt_total_amount();
