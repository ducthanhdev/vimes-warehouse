let rowCounter = 0;
let amountTextDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initDateSync();
  initPrintSync();

  const initialDetails = window.INITIAL_RECEIPT_DETAILS || [];
  if (initialDetails.length > 0) {
    initialDetails.forEach((d) => addNewDetailRow(d));
  } else {
    addNewDetailRow();
    addNewDetailRow();
    addNewDetailRow();
  }

  recalculateAll();
  syncPrintFields();
});

function initPrintSync() {
  const inputsToSync = [
    'company_name', 'department', 'receipt_number',
    'debit_account', 'credit_account', 'deliverer_name',
    'ref_document', 'warehouse_address', 'creator_name',
    'deliverer_signer', 'storekeeper_name', 'accountant_name'
  ];

  inputsToSync.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', syncPrintFields);
      el.addEventListener('change', syncPrintFields);
    }
  });

  const warehouseSelect = document.getElementById('warehouse_id');
  if (warehouseSelect) {
    warehouseSelect.addEventListener('change', () => {
      handleWarehouseChange(warehouseSelect);
      syncPrintFields();
    });
  }

  window.addEventListener('beforeprint', syncPrintFields);
}

function syncPrintFields() {
  const setPrintText = (printId, val, defaultDots = '....................................................') => {
    const el = document.getElementById(printId);
    if (el) {
      el.textContent = val && val.trim() ? val.trim() : defaultDots;
    }
  };

  const getVal = (id) => document.getElementById(id)?.value || '';

  setPrintText('print_company_name', getVal('company_name'), 'Công ty Cổ phần Công nghệ VIMES');
  setPrintText('print_department', getVal('department'), 'Phòng Quản lý Kho & Vật tư');
  setPrintText('print_receipt_number', getVal('receipt_number'), '................');
  setPrintText('print_debit_account', getVal('debit_account'), '152');
  setPrintText('print_credit_account', getVal('credit_account'), '331');
  setPrintText('print_deliverer_name', getVal('deliverer_name'));
  setPrintText('print_ref_document', getVal('ref_document'), '....................................................................................................');

  const whSelect = document.getElementById('warehouse_id');
  if (whSelect) {
    const selectedOption = whSelect.options[whSelect.selectedIndex];
    if (whSelect.value && selectedOption) {
      setPrintText('print_warehouse_name', selectedOption.text);
    } else {
      setPrintText('print_warehouse_name', '', '....................................................');
    }
  }

  setPrintText('print_warehouse_address', getVal('warehouse_address'));

  const dateVal = getVal('receipt_date');
  if (dateVal) {
    const parts = dateVal.split('-');
    if (parts.length === 3) {
      const dayEl = document.getElementById('print_header_day');
      const monthEl = document.getElementById('print_header_month');
      const yearEl = document.getElementById('print_header_year');
      if (dayEl) dayEl.textContent = parts[2];
      if (monthEl) monthEl.textContent = parts[1];
      if (yearEl) yearEl.textContent = parts[0];
    }
  }
}

function initDateSync() {
  const dateInput = document.getElementById('receipt_date');
  if (!dateInput) return;

  const updateDateDisplay = () => {
    const val = dateInput.value;
    if (val) {
      const parts = val.split('-');
      if (parts.length === 3) {
        document.getElementById('sig_year').textContent = parts[0];
        document.getElementById('sig_month').textContent = parts[1];
        document.getElementById('sig_day').textContent = parts[2];
        syncPrintFields();
      }
    }
  };

  dateInput.addEventListener('change', updateDateDisplay);
  updateDateDisplay();
}

function handleWarehouseChange(selectEl) {
  const selectedOption = selectEl.options[selectEl.selectedIndex];
  const address = selectedOption ? selectedOption.getAttribute('data-address') : '';
  const addressInput = document.getElementById('warehouse_address');
  if (addressInput) {
    addressInput.value = address || '';
  }
  syncPrintFields();
}

function addNewDetailRow(data = null) {
  rowCounter++;
  const tbody = document.getElementById('detailsTableBody');
  const rowId = `row_${rowCounter}`;

  const tr = document.createElement('tr');
  tr.id = rowId;
  tr.className = 'detail-row';

  tr.innerHTML = `
    <td class="text-center font-mono row-stt"></td>
    <td>
      <div class="autocomplete-wrapper">
        <input
          type="text"
          class="table-input row-product-name"
          placeholder="Nhập hoặc tìm kiếm vật tư..."
          value="${data ? (data.product_name || '') : ''}"
          oninput="handleProductSearch(this, '${rowId}')"
          autocomplete="off"
          required
        />
        <div id="autocomplete_${rowId}" class="autocomplete-dropdown"></div>
      </div>
      <input type="hidden" class="row-product-id" value="${data && data.product_id ? data.product_id : ''}">
    </td>
    <td>
      <input
        type="text"
        class="table-input text-center font-mono row-product-code"
        placeholder="Mã số"
        value="${data ? (data.product_code || '') : ''}"
      />
    </td>
    <td>
      <input
        type="text"
        class="table-input text-center row-unit"
        placeholder="ĐVT"
        value="${data ? (data.unit || '') : ''}"
        required
      />
    </td>
    <td>
      <input
        type="number"
        step="0.001"
        min="0"
        class="table-input text-right font-mono row-qty-doc"
        placeholder="0"
        value="${data ? data.quantity_document : ''}"
      />
    </td>
    <td>
      <input
        type="number"
        step="0.001"
        min="0"
        class="table-input text-right font-mono font-bold row-qty-act"
        placeholder="0"
        value="${data ? data.quantity_actual : ''}"
        oninput="calculateRowTotal('${rowId}')"
        required
      />
    </td>
    <td>
      <input
        type="number"
        step="1"
        min="0"
        class="table-input text-right font-mono row-unit-price"
        placeholder="0"
        value="${data ? data.unit_price : ''}"
        oninput="calculateRowTotal('${rowId}')"
        required
      />
    </td>
    <td class="text-right font-mono font-bold row-total-price">
      0 ₫
    </td>
    <td class="text-center no-print">
      <button type="button" class="btn-icon btn-delete" title="Xóa dòng" onclick="removeDetailRow('${rowId}')">
        <i class="fa-solid fa-trash"></i>
      </button>
    </td>
  `;

  tbody.appendChild(tr);
  updateRowNumbers();

  if (data) {
    calculateRowTotal(rowId);
  }
}

function removeDetailRow(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;

  const rows = document.querySelectorAll('.detail-row');
  if (rows.length <= 1) {
    showToast('error', 'Phiếu nhập kho phải có ít nhất 1 dòng hàng hóa.');
    return;
  }

  row.remove();
  updateRowNumbers();
  recalculateAll();
}

function updateRowNumbers() {
  const rows = document.querySelectorAll('.detail-row');
  rows.forEach((row, index) => {
    const sttCell = row.querySelector('.row-stt');
    if (sttCell) {
      sttCell.textContent = index + 1;
    }
  });
}

function calculateRowTotal(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;

  const qtyAct = parseFloat(row.querySelector('.row-qty-act').value) || 0;
  const unitPrice = parseFloat(row.querySelector('.row-unit-price').value) || 0;
  const totalPrice = qtyAct * unitPrice;

  row.querySelector('.row-total-price').textContent = `${totalPrice.toLocaleString('vi-VN')} ₫`;
  row.dataset.total = totalPrice;

  recalculateAll();
}

function recalculateAll() {
  const rows = document.querySelectorAll('.detail-row');
  let grandTotal = 0;

  rows.forEach((row) => {
    const qtyAct = parseFloat(row.querySelector('.row-qty-act')?.value) || 0;
    const unitPrice = parseFloat(row.querySelector('.row-unit-price')?.value) || 0;
    grandTotal += qtyAct * unitPrice;
  });

  const grandTotalEl = document.getElementById('grandTotalCell');
  if (grandTotalEl) {
    grandTotalEl.textContent = `${grandTotal.toLocaleString('vi-VN')} ₫`;
  }

  if (amountTextDebounceTimer) clearTimeout(amountTextDebounceTimer);
  amountTextDebounceTimer = setTimeout(async () => {
    try {
      const res = await fetch('/api/receipts/amount-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal }),
      });
      const data = await res.json();
      if (data.success && data.data && data.data.text) {
        const textEl = document.getElementById('amountInWordsText');
        if (textEl) textEl.textContent = data.data.text;
      }
    } catch (err) {
      console.error('Lỗi chuyển số thành chữ:', err);
    }
  }, 300);
}

let searchDebounceTimer = null;
function handleProductSearch(inputEl, rowId) {
  const keyword = inputEl.value.trim();
  const dropdown = document.getElementById(`autocomplete_${rowId}`);
  if (!dropdown) return;

  if (keyword.length < 1) {
    dropdown.style.display = 'none';
    return;
  }

  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(keyword)}&limit=8`);
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        dropdown.innerHTML = data.data
          .map(
            (p) => `
            <div class="autocomplete-item" onclick="selectProduct('${rowId}', ${p.id}, '${escapeHtml(p.code)}', '${escapeHtml(p.name)}', '${escapeHtml(p.unit)}')">
              <strong>${escapeHtml(p.code)}</strong> - ${escapeHtml(p.name)} <span class="text-muted">(${escapeHtml(p.unit)})</span>
            </div>
          `
          )
          .join('');
        dropdown.style.display = 'block';
      } else {
        dropdown.innerHTML = '<div class="autocomplete-item text-muted">Không tìm thấy vật tư có sẵn</div>';
        dropdown.style.display = 'block';
      }
    } catch (err) {
      console.error('Lỗi tìm sản phẩm:', err);
    }
  }, 250);
}

function selectProduct(rowId, productId, code, name, unit) {
  const row = document.getElementById(rowId);
  if (!row) return;

  row.querySelector('.row-product-name').value = name;
  row.querySelector('.row-product-code').value = code;
  row.querySelector('.row-unit').value = unit;
  row.querySelector('.row-product-id').value = productId;

  const dropdown = document.getElementById(`autocomplete_${rowId}`);
  if (dropdown) dropdown.style.display = 'none';

  row.querySelector('.row-qty-act').focus();
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.autocomplete-wrapper')) {
    document.querySelectorAll('.autocomplete-dropdown').forEach((d) => {
      d.style.display = 'none';
    });
  }
});

async function handleFormSubmit() {
  const form = document.getElementById('receiptForm');
  if (!form) return;

  const receiptId = document.getElementById('receipt_id')?.value;
  const isEdit = Boolean(receiptId);

  const receiptDate = document.getElementById('receipt_date').value;
  const companyName = document.getElementById('company_name').value.trim();
  const department = document.getElementById('department').value.trim();
  const debitAccount = document.getElementById('debit_account').value.trim();
  const creditAccount = document.getElementById('credit_account').value.trim();
  const delivererName = document.getElementById('deliverer_name').value.trim();
  const refDocument = document.getElementById('ref_document').value.trim();
  const warehouseId = parseInt(document.getElementById('warehouse_id').value, 10);
  const attachedDocs = parseInt(document.getElementById('attached_documents').value || '0', 10);

  const creatorName = document.getElementById('creator_name').value.trim();
  const delivererSigner = document.getElementById('deliverer_signer').value.trim();
  const storekeeperName = document.getElementById('storekeeper_name').value.trim();
  const accountantName = document.getElementById('accountant_name').value.trim();

  if (!receiptDate) {
    showToast('error', 'Vui lòng chọn ngày lập phiếu.');
    document.getElementById('receipt_date').focus();
    return;
  }
  if (!delivererName) {
    showToast('error', 'Vui lòng nhập họ tên người giao hàng.');
    document.getElementById('deliverer_name').focus();
    return;
  }
  if (!warehouseId || isNaN(warehouseId)) {
    showToast('error', 'Vui lòng chọn kho nhập hàng.');
    document.getElementById('warehouse_id').focus();
    return;
  }

  const rows = document.querySelectorAll('.detail-row');
  const details = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.querySelector('.row-product-name').value.trim();
    const code = row.querySelector('.row-product-code').value.trim();
    const unit = row.querySelector('.row-unit').value.trim();
    const productIdVal = row.querySelector('.row-product-id').value;
    const productId = productIdVal ? parseInt(productIdVal, 10) : null;

    const qtyDoc = parseFloat(row.querySelector('.row-qty-doc').value) || 0;
    const qtyAct = parseFloat(row.querySelector('.row-qty-act').value) || 0;
    const unitPrice = parseFloat(row.querySelector('.row-unit-price').value) || 0;

    if (!name && !unit && qtyAct === 0 && unitPrice === 0) {
      continue;
    }

    if (!name) {
      showToast('error', `Dòng ${i + 1}: Vui lòng nhập tên hàng hóa.`);
      row.querySelector('.row-product-name').focus();
      return;
    }
    if (!unit) {
      showToast('error', `Dòng ${i + 1}: Vui lòng nhập đơn vị tính.`);
      row.querySelector('.row-unit').focus();
      return;
    }

    details.push({
      product_id: productId,
      product_name: name,
      product_code: code || null,
      unit: unit,
      quantity_document: qtyDoc,
      quantity_actual: qtyAct,
      unit_price: unitPrice,
    });
  }

  if (details.length === 0) {
    showToast('error', 'Phiếu nhập kho phải có ít nhất 1 dòng hàng hóa hợp lệ.');
    return;
  }

  const payload = {
    receipt_date: receiptDate,
    company_name: companyName || null,
    department: department || null,
    debit_account: debitAccount || null,
    credit_account: creditAccount || null,
    deliverer_name: delivererName,
    ref_document: refDocument || null,
    warehouse_id: warehouseId,
    attached_documents: attachedDocs,
    creator_name: creatorName || null,
    deliverer_signer: delivererSigner || null,
    storekeeper_name: storekeeperName || null,
    accountant_name: accountantName || null,
    details: details,
  };

  const saveBtn = document.querySelector('.btn-save');
  if (saveBtn) saveBtn.disabled = true;

  try {
    const url = isEdit ? `/api/receipts/${receiptId}` : '/api/receipts';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('success', data.message || 'Lưu phiếu nhập kho thành công!');
      setTimeout(() => {
        window.location.href = `/receipts/${data.data.id}`;
      }, 1000);
    } else {
      if (saveBtn) saveBtn.disabled = false;
      const errorMsg = data.errors
        ? data.errors.map((e) => e.message).join('<br>')
        : (data.message || 'Lỗi khi lưu phiếu nhập kho.');
      showToast('error', errorMsg);
    }
  } catch (err) {
    if (saveBtn) saveBtn.disabled = false;
    showToast('error', 'Lỗi kết nối máy chủ khi lưu phiếu.');
  }
}

function showToast(type, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
