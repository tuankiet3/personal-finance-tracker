/**
 * Receipt Scanner - Camera + OCR with Tesseract.js
 * Handles camera stream, image capture, OCR processing, and Vietnamese receipt parsing
 */

const Scanner = {
  stream: null,
  facingMode: 'environment', // rear camera
  worker: null,
  isProcessing: false,

  // ===== CAMERA MANAGEMENT =====
  async startCamera() {
    try {
      const constraints = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = document.getElementById('cameraStream');
      video.srcObject = this.stream;
      video.style.display = 'block';

      document.getElementById('capturedImage').style.display = 'none';
      document.getElementById('viewfinderOverlay').style.display = 'flex';
      document.getElementById('captureBtn').style.display = 'flex';
      document.getElementById('switchCameraBtn').style.display = 'inline-flex';

      return true;
    } catch (err) {
      console.warn('Camera not available:', err.message);
      // Camera not available - show file picker only
      this.showFileOnlyMode();
      return false;
    }
  },

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    const video = document.getElementById('cameraStream');
    if (video) {
      video.srcObject = null;
      video.style.display = 'none';
    }
  },

  showFileOnlyMode() {
    const video = document.getElementById('cameraStream');
    const overlay = document.getElementById('viewfinderOverlay');
    const captureBtn = document.getElementById('captureBtn');
    const switchBtn = document.getElementById('switchCameraBtn');
    const viewfinder = document.getElementById('scannerViewfinder');

    if (video) video.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'none';
    if (switchBtn) switchBtn.style.display = 'none';

    if (overlay) {
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div class="file-only-prompt">
          <i class="fas fa-camera-retro"></i>
          <p>Camera không khả dụng</p>
          <p class="viewfinder-hint">Hãy chọn ảnh hóa đơn từ thư viện</p>
        </div>
      `;
    }
  },

  toggleCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    this.stopCamera();
    this.startCamera();
  },

  // ===== IMAGE CAPTURE =====
  captureFromCamera() {
    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('cameraCanvas');
    const img = document.getElementById('capturedImage');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    img.src = dataUrl;
    img.style.display = 'block';
    video.style.display = 'none';
    document.getElementById('viewfinderOverlay').style.display = 'none';

    this.stopCamera();
    this.processImage(dataUrl);
  },

  handleFileInput(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById('capturedImage');
      img.src = e.target.result;
      img.style.display = 'block';

      const video = document.getElementById('cameraStream');
      if (video) video.style.display = 'none';
      document.getElementById('viewfinderOverlay').style.display = 'none';

      this.stopCamera();
      this.processImage(e.target.result);
    };
    reader.readAsDataURL(file);
  },

  // ===== OCR PROCESSING =====
  async processImage(imageSource) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Show processing state
    document.getElementById('scannerControls').style.display = 'none';
    document.getElementById('scannerProcessing').style.display = 'block';
    document.getElementById('scannerResults').style.display = 'none';

    try {
      const result = await Tesseract.recognize(imageSource, 'vie+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round(m.progress * 100);
            document.getElementById('ocrProgress').style.width = `${pct}%`;
            document.querySelector('.processing-text').textContent =
              `Đang nhận diện văn bản... ${pct}%`;
          }
        },
      });

      const text = result.data.text;
      this.displayResults(text);
    } catch (err) {
      console.error('OCR error:', err);
      showToast('Lỗi nhận diện văn bản. Vui lòng thử lại.', 'error');
      this.resetToCapture();
    } finally {
      this.isProcessing = false;
    }
  },

  // ===== VIETNAMESE RECEIPT PARSER =====
  parseReceipt(text) {
    const result = {
      amount: null,
      date: null,
      description: null,
      rawText: text,
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // --- EXTRACT AMOUNT ---
    // Look for total/thanh toan/tong patterns first
    const totalPatterns = [
      /(?:TỔNG|TOTAL|THANH\s*TOÁN|T\.THANH\s*TOÁN|THÀNH\s*TIỀN|TONG\s*CONG|TỔNG\s*CỘNG|GIÁ|AMOUNT|SỐ\s*TIỀN)[:\s]*([0-9.,]+)/i,
      /([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:đ|VND|VNĐ|₫)/i,
      /(?:đ|VND|VNĐ|₫)\s*([0-9]{1,3}(?:[.,][0-9]{3})+)/i,
    ];

    let amounts = [];
    for (const pattern of totalPatterns) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          const numStr = match[1].replace(/[.,]/g, '');
          const num = parseInt(numStr, 10);
          if (num >= 1000 && num <= 999999999) {
            amounts.push({ value: num, line, priority: totalPatterns.indexOf(pattern) });
          }
        }
      }
    }

    // Fallback: find any large number that looks like VND
    if (amounts.length === 0) {
      const fallbackPattern = /([0-9]{1,3}(?:[.,][0-9]{3})+)/g;
      for (const line of lines) {
        let match;
        while ((match = fallbackPattern.exec(line)) !== null) {
          const numStr = match[1].replace(/[.,]/g, '');
          const num = parseInt(numStr, 10);
          if (num >= 1000 && num <= 999999999) {
            amounts.push({ value: num, line, priority: 10 });
          }
        }
      }
    }

    // Pick the highest amount from highest priority matches
    if (amounts.length > 0) {
      amounts.sort((a, b) => a.priority - b.priority || b.value - a.value);
      result.amount = amounts[0].value;
    }

    // --- EXTRACT DATE ---
    const datePatterns = [
      /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/,  // DD/MM/YYYY
      /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,  // YYYY/MM/DD
      /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})(?!\d)/, // DD/MM/YY
    ];

    for (const line of lines) {
      for (let i = 0; i < datePatterns.length; i++) {
        const match = line.match(datePatterns[i]);
        if (match) {
          let day, month, year;
          if (i === 0) {
            [, day, month, year] = match;
          } else if (i === 1) {
            [, year, month, day] = match;
          } else {
            [, day, month, year] = match;
            year = parseInt(year, 10);
            year = year < 50 ? 2000 + year : 1900 + year;
          }

          day = parseInt(day, 10);
          month = parseInt(month, 10);
          year = parseInt(year, 10);

          if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2020 && year <= 2030) {
            result.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            break;
          }
        }
      }
      if (result.date) break;
    }

    // --- EXTRACT DESCRIPTION ---
    // Try to get store name from first few lines
    const skipPatterns = /^(HÓA\s*ĐƠN|RECEIPT|INVOICE|BILL|MST|TAX|ĐC|TEL|SĐT|FAX|HOTLINE|---|\*\*\*|===)/i;
    for (const line of lines.slice(0, 5)) {
      if (line.length >= 3 && line.length <= 60 && !skipPatterns.test(line) && !/^\d+$/.test(line)) {
        result.description = line;
        break;
      }
    }

    return result;
  },

  // ===== DISPLAY RESULTS =====
  displayResults(rawText) {
    const parsed = this.parseReceipt(rawText);

    document.getElementById('scannerProcessing').style.display = 'none';
    document.getElementById('scannerResults').style.display = 'block';

    document.getElementById('scanAmount').value = parsed.amount
      ? new Intl.NumberFormat('vi-VN').format(parsed.amount)
      : '';
    document.getElementById('scanDate').value = parsed.date || new Date().toISOString().split('T')[0];
    document.getElementById('scanDescription').value = parsed.description || '';
    document.getElementById('scanRawText').value = rawText;
  },

  // ===== RESET =====
  resetToCapture() {
    document.getElementById('scannerControls').style.display = 'flex';
    document.getElementById('scannerProcessing').style.display = 'none';
    document.getElementById('scannerResults').style.display = 'none';
    document.getElementById('capturedImage').style.display = 'none';
    document.getElementById('ocrProgress').style.width = '0%';

    this.startCamera();
  },

  // ===== CREATE TRANSACTION FROM RESULTS =====
  createTransaction() {
    const amountStr = document.getElementById('scanAmount').value.replace(/[.,\s]/g, '');
    const amount = parseInt(amountStr, 10) || 0;
    const date = document.getElementById('scanDate').value;
    const description = document.getElementById('scanDescription').value;

    // Close scanner
    closeScanner();

    // Open transaction modal with pre-filled data
    openTransactionModal({
      type: 'EXPENSE',
      amount: amount,
      transactionDate: date,
      description: description,
    });
  },
};

// ===== GLOBAL FUNCTIONS (called from HTML) =====
function openScanner() {
  const modal = document.getElementById('scannerModal');
  if (!modal) return;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  Scanner.resetToCapture();
}

function closeScanner() {
  const modal = document.getElementById('scannerModal');
  if (!modal) return;

  modal.style.display = 'none';
  document.body.style.overflow = '';
  Scanner.stopCamera();
}

function captureImage() {
  Scanner.captureFromCamera();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  Scanner.handleFileInput(file);
  // Reset file input so same file can be re-selected
  event.target.value = '';
}

function switchCamera() {
  Scanner.toggleCamera();
}

function resetScanner() {
  Scanner.resetToCapture();
}

function createTransactionFromScan() {
  Scanner.createTransaction();
}
