/* ==========================================================================
   Braun Blinds - Interactive Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation scroll effect
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Active navigation link state on scroll
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });

  // ==========================================
  // Braun Price Calculator Logic
  // ==========================================

  // Pricing configuration
  const basePrices = {
    roller: 12.0,      // $12 per sq ft
    zebra: 16.0,       // $16 per sq ft
    wood: 22.0,        // $22 per sq ft
    cellular: 18.0,    // $18 per sq ft
    roman: 25.0        // $25 per sq ft
  };

  const materialMultipliers = {
    standard: 1.0,
    premium: 1.25,
    luxury: 1.50
  };

  const controlAdditions = {
    manual: 0.0,
    motorized: 80.0,
    smart: 130.0
  };

  // DOM Elements for Bottom Sync Calculator
  const typeOptions = document.querySelectorAll('.type-option');
  const widthSlider = document.getElementById('calc-width');
  const heightSlider = document.getElementById('calc-height');
  const widthVal = document.getElementById('width-val');
  const heightVal = document.getElementById('height-val');
  const materialOptions = document.querySelectorAll('[data-material]');
  const controlOptions = document.querySelectorAll('[data-control]');
  const installOptions = document.querySelectorAll('[data-install]');

  // Live Output Elements
  const outType = document.getElementById('out-type');
  const outSize = document.getElementById('out-size');
  const outMaterial = document.getElementById('out-material');
  const outControl = document.getElementById('out-control');
  const outInstall = document.getElementById('out-install');
  const outPriceVal = document.getElementById('out-price-val');

  // Synchronize Bottom Calculator with Top Z-Series System
  function syncBottomCalculatorWithTop(res, w, h) {
    if (widthSlider) widthSlider.value = w;
    if (heightSlider) heightSlider.value = h;
    if (widthVal) widthVal.textContent = `${w}"`;
    if (heightVal) heightVal.textContent = `${h}"`;

    if (typeof ROMAN_DB !== 'undefined') {
      const sys = ROMAN_DB.SYSTEMS.find(s => s.code === romanSelectedSysCode) || ROMAN_DB.SYSTEMS[0];
      const fab = ROMAN_DB.FABRICS.find(f => f.code === romanSelectedFabCode) || ROMAN_DB.FABRICS[0];
      const elControlSide = document.getElementById('roman-control-side');

      if (outType && sys) outType.textContent = `${sys.name_cn} (${sys.sys_type})`;
      if (outSize) outSize.textContent = `${w}" W x ${h}" H (${res ? res.sqm : 1.0} ㎡)`;
      if (outMaterial && fab) outMaterial.textContent = `${fab.code} (${fab.series_cn})`;
      if (outControl && elControlSide) outControl.textContent = elControlSide.options[elControlSide.selectedIndex].text;
      if (outPriceVal && res) outPriceVal.textContent = `$${(res.final_unit_price || 0).toFixed(2)}`;
    }
  }

  // 1. Slider Events -> Sync to Top Calculator Input
  if (widthSlider) {
    widthSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 36;
      if (widthVal) widthVal.textContent = `${val}"`;
      const elW = document.getElementById('roman-width-input');
      if (elW) {
        elW.value = val;
        elW.dispatchEvent(new Event('input'));
      }
    });
  }

  if (heightSlider) {
    heightSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 60;
      if (heightVal) heightVal.textContent = `${val}"`;
      const elH = document.getElementById('roman-height-input');
      if (elH) {
        elH.value = val;
        elH.dispatchEvent(new Event('input'));
      }
    });
  }

  // 2. Category Option Click -> Sync to Top Category Tabs
  typeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      typeOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const catType = opt.getAttribute('data-type');
      let targetCat = 'roman';
      if (catType === 'roller') targetCat = 'roller';
      else if (catType === 'wood' || catType === 'cellular') targetCat = 'zebra';
      else targetCat = 'roman';

      const topTabBtn = document.querySelector(`#product-category-tabs .category-tab-btn[data-cat="${targetCat}"]`);
      if (topTabBtn) {
        topTabBtn.click();
      }
    });
  });

  // 3. Control Option Click -> Sync to Top Motor Selects
  controlOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      controlOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const ctrl = opt.getAttribute('data-control');
      const elMotorSelect = document.getElementById('roman-motor-select');
      const elControlSide = document.getElementById('roman-control-side');

      if (ctrl === 'motorized' || ctrl === 'smart') {
        if (elMotorSelect) elMotorSelect.value = 'single_motor';
        if (elControlSide) elControlSide.value = 'motorized';
      } else {
        if (elMotorSelect) elMotorSelect.value = 'none';
        if (elControlSide) elControlSide.value = 'cordless';
      }
      const elW = document.getElementById('roman-width-input');
      if (elW) elW.dispatchEvent(new Event('change'));
    });
  });

  // 4. Installation Options
  installOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      installOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // ==========================================
  // Quote Booking Form Actions
  // ==========================================
  const ctaQuoteBtn = document.getElementById('btn-book-quote');
  const messageField = document.getElementById('booking-message');

  if (ctaQuoteBtn) {
    ctaQuoteBtn.addEventListener('click', () => {
      // Auto-populate message text with calculator configuration
      const typeLabel = selectedType.charAt(0).toUpperCase() + selectedType.slice(1) + ' Blind';
      const detailStr = `Hello, I'm interested in booking a free consultation. My calculated setup is:
- Type: ${typeLabel}
- Dimensions: ${width}" W x ${height}" H
- Material: ${selectedMaterial.toUpperCase()}
- Control Option: ${selectedControl === 'manual' ? 'Manual Cordless' : (selectedControl === 'motorized' ? 'Motorized' : 'Smart Home Integration')}
- Installation Needed: ${includeInstallation ? 'Yes' : 'No'}
Estimated price: ${outPriceVal.textContent}`;

      if (messageField) {
        messageField.value = detailStr;
      }

      // Smooth scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Contact Form Submission Handling
  const contactForm = document.getElementById('consultation-form');
  const successMsg = document.getElementById('success-msg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Show loader or button state transition
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';

      // Simulate API submit delay
      setTimeout(() => {
        submitBtn.innerHTML = 'Sent!';
        
        // Show success block
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Reset form
        contactForm.reset();
        
        // Restore button state after 3 seconds
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 3000);

      }, 1500);
    });
  }

  // ==========================================================================
  // Zhenpin Roman Shades Custom Quotation System Engine
  // ==========================================================================
  
  if (typeof ROMAN_DB !== 'undefined') {
    let romanCurrentLang = 'cn';
    let romanSelectedCategory = 'roman'; // Default category 'roman' (Roman Shades)
    let romanDiscountFactor = 0.50; // Default 50% OFF (5折)
    let romanSalesTaxRate = 0.00; // Default Sales Tax Rate 0.00%
    let romanSelectedSysCode = 'LM0002'; // Default Square Cordless
    let romanSelectedFabCode = 'BZM11'; // Default Zhong Linen Blackout Dark Grey
    let romanSelectedFabCategory = 'ALL';
    let romanQuoteItems = [];

    // Category Tabs Binding
    function bindCategoryTabs() {
      const btns = document.querySelectorAll('#product-category-tabs .category-tab-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          romanSelectedCategory = btn.getAttribute('data-cat');

          // Reset default system & fabric selection for category
          const availSystems = ROMAN_DB.SYSTEMS.filter(s => s.category === romanSelectedCategory || (!s.category && romanSelectedCategory === 'roman'));
          const availFabrics = ROMAN_DB.FABRICS.filter(f => f.category === romanSelectedCategory || (!f.category && romanSelectedCategory === 'roman'));

          if (availSystems.length > 0) romanSelectedSysCode = availSystems[0].code;
          if (availFabrics.length > 0) romanSelectedFabCode = availFabrics[0].code;
          romanSelectedFabCategory = 'ALL';

          renderSystemCards();
          renderFabricCategoryTabs();
          renderFabricCards();
          validateDimensions();
          calculateLiveItemPrice();
        });
      });
    }

    // Elements
    const elCustName = document.getElementById('roman-cust-name');
    const elProjType = document.getElementById('roman-proj-type');
    const elCustAddress = document.getElementById('roman-cust-address');
    const elCustPhone = document.getElementById('roman-cust-phone');
    const elCustEmail = document.getElementById('roman-cust-email');
    const elQuoteDate = document.getElementById('roman-quote-date');
    const elQuoteNo = document.getElementById('roman-quote-no');
    const elSpecialNotes = document.getElementById('roman-special-notes');
    const elDiscountBadge = document.getElementById('discount-val-badge');
    const elCustomDiscountInput = document.getElementById('custom-discount-input');

    const elWidthInput = document.getElementById('roman-width-input');
    const elHeightInput = document.getElementById('roman-height-input');
    const elDepthInput = document.getElementById('roman-depth-input');
    const elDimValidationMsg = document.getElementById('dim-validation-msg');

    const elMountType = document.getElementById('roman-mount-type');
    const elControlSide = document.getElementById('roman-control-side');
    const elMotorSelect = document.getElementById('roman-motor-select');
    const elRemoteSelect = document.getElementById('roman-remote-select');
    const elSmartSelect = document.getElementById('roman-smart-select');

    const elRoomName = document.getElementById('roman-room-name');
    const elQtyInput = document.getElementById('roman-qty-input');
    const btnAddItem = document.getElementById('btn-add-roman-item');

    // Live Item Price Breakdown
    const elLiveRmbBase = document.getElementById('live-rmb-base');
    const elLiveUsdBase = document.getElementById('live-usd-base');
    const elLiveMsrp = document.getElementById('live-msrp');
    const elLiveFinalRate = document.getElementById('live-final-rate');

    // Sheet Elements
    const sheetMetaDate = document.getElementById('sheet-meta-date');
    const sheetMetaNo = document.getElementById('sheet-meta-no');
    const sheetClientName = document.getElementById('sheet-client-name');
    const sheetProjectType = document.getElementById('sheet-project-type');
    const sheetClientAddress = document.getElementById('sheet-client-address');
    const sheetClientPhone = document.getElementById('sheet-client-phone');
    const sheetClientEmail = document.getElementById('sheet-client-email');
    const sheetSpecialNotes = document.getElementById('sheet-special-notes');
    const sheetClientDiscount = document.getElementById('sheet-client-discount');

    const quoteItemsBody = document.getElementById('quote-items-body');
    const itemCountBadge = document.getElementById('item-count-badge');
    const sheetSubtotalMsrp = document.getElementById('sheet-subtotal-msrp');
    const sheetDiscountAmount = document.getElementById('sheet-discount-amount');
    const sheetSubtotalFinal = document.getElementById('sheet-subtotal-final');
    const sheetGrandTotal = document.getElementById('sheet-grand-total');

    const btnExportExcel = document.getElementById('btn-export-excel');
    const btnPrintPdf = document.getElementById('btn-print-pdf');

    // Set default date
    if (elQuoteDate) {
      const today = new Date().toISOString().split('T')[0];
      elQuoteDate.value = today;
      if (sheetMetaDate) sheetMetaDate.textContent = today;
    }

    // Populate Select Options with USD conversion formatting (strictly from Motorized System Price List)
    function initAddonSelects() {
      if (elMotorSelect) {
        elMotorSelect.innerHTML = ROMAN_DB.MOTOR_OPTIONS.map(m => {
          const tag = m.price_usd > 0 ? `(+$${m.price_usd})` : '';
          return `<option value="${m.id}">${m.name_cn} ${tag}</option>`;
        }).join('');
      }
      if (elRemoteSelect) {
        elRemoteSelect.innerHTML = ROMAN_DB.REMOTE_OPTIONS.map(r => {
          const tag = r.price_usd > 0 ? `(+$${r.price_usd})` : '';
          return `<option value="${r.id}">${r.name_cn} ${tag}</option>`;
        }).join('');
      }
      if (elSmartSelect) {
        elSmartSelect.innerHTML = ROMAN_DB.SMART_ACC_OPTIONS.map(s => {
          const tag = s.price_usd > 0 ? `(+$${s.price_usd})` : '';
          return `<option value="${s.id}">${s.name_cn} ${tag}</option>`;
        }).join('');
      }
    }

    // Render System Cards
    function renderSystemCards() {
      const grid = document.getElementById('system-selector-grid');
      const sysSelect = document.getElementById('roman-sys-select');
      if (!grid) return;

      const categorySystems = ROMAN_DB.SYSTEMS.filter(sys => sys.category === romanSelectedCategory || (!sys.category && romanSelectedCategory === 'roman'));

      if (categorySystems.length > 0) {
        const found = categorySystems.find(s => s.code === romanSelectedSysCode);
        if (!found) {
          romanSelectedSysCode = categorySystems[0].code;
        }
      }

      if (sysSelect) {
        sysSelect.innerHTML = categorySystems.map(sys => {
          return `<option value="${sys.code}" ${sys.code === romanSelectedSysCode ? 'selected' : ''}>${sys.code} - ${sys.name_cn} (${sys.sys_type} • ${sys.series})</option>`;
        }).join('');
      }

      grid.innerHTML = categorySystems.map(sys => {
        const isSelected = sys.code === romanSelectedSysCode ? 'selected' : '';
        return `
          <div class="sys-card ${isSelected}" data-code="${sys.code}">
            <div class="sys-card-code">${sys.code} • ${sys.sys_type}</div>
            <div class="sys-img-wrap">
              <img src="${sys.image_url}" class="sys-card-img" alt="${sys.name_cn}" loading="lazy" onerror="this.parentElement.style.display='none'">
            </div>
            <div class="sys-card-name">${romanCurrentLang === 'cn' ? sys.name_cn : sys.name_en}</div>
            <div class="sys-card-meta">
              <span class="sys-badge">${sys.series}</span>
              <span class="sys-badge">${sys.style}</span>
              <span class="sys-badge">${sys.craft}</span>
            </div>
            <div class="sys-limit-text">
              📏 Limit: W ${sys.min_w}"-${sys.max_w}", H ${sys.min_h}"-${sys.max_h}" (Depth > ${sys.min_depth}")
            </div>
          </div>
        `;
      }).join('');

      // Attach click events
      grid.querySelectorAll('.sys-card').forEach(card => {
        card.addEventListener('click', () => {
          grid.querySelectorAll('.sys-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          romanSelectedSysCode = card.getAttribute('data-code');
          if (sysSelect) sysSelect.value = romanSelectedSysCode;
          validateDimensions();
          calculateLiveItemPrice();
        });
      });
    }

    // Render Fabric Filter Tabs & Cards
    function renderFabricCategoryTabs() {
      const tabsBox = document.getElementById('fabric-filter-tabs');
      if (!tabsBox) return;

      const categoryFabrics = ROMAN_DB.FABRICS.filter(f => f.category === romanSelectedCategory || (!f.category && romanSelectedCategory === 'roman'));
      const seriesSet = new Set(categoryFabrics.map(f => f.series_cn));
      const categories = ['ALL', ...Array.from(seriesSet)];

      tabsBox.innerHTML = categories.map(cat => `
        <button type="button" class="fab-tab ${cat === romanSelectedFabCategory ? 'active' : ''}" data-cat="${cat}">
          ${cat === 'ALL' ? '全部 (All Fabrics)' : cat}
        </button>
      `).join('');

      tabsBox.querySelectorAll('.fab-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          tabsBox.querySelectorAll('.fab-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          romanSelectedFabCategory = tab.getAttribute('data-cat');
          renderFabricCards();
        });
      });
    }

    function renderFabricCards() {
      const grid = document.getElementById('fabric-selector-grid');
      const fabSelect = document.getElementById('roman-fab-select');
      if (!grid) return;

      let list = ROMAN_DB.FABRICS.filter(f => f.category === romanSelectedCategory || (!f.category && romanSelectedCategory === 'roman'));

      if (list.length > 0) {
        const found = list.find(f => f.code === romanSelectedFabCode);
        if (!found) {
          romanSelectedFabCode = list[0].code;
        }
      }

      if (fabSelect) {
        fabSelect.innerHTML = list.map(fab => {
          const rmbRate = fab.rmb_base || (fab.prices ? Object.values(fab.prices)[0] : 160) || 160;
          return `<option value="${fab.code}" ${fab.code === romanSelectedFabCode ? 'selected' : ''}>${fab.code} - ${fab.series_cn} (${fab.color_cn}) [${fab.type}] - ¥${rmbRate}/㎡</option>`;
        }).join('');
      }

      if (romanSelectedFabCategory !== 'ALL') {
        list = list.filter(f => f.series_cn === romanSelectedFabCategory);
      }

      // Helper function for fabric color swatches
      function getFabricColorStyle(fab) {
        if (fab.hex) return `background-color: ${fab.hex};`;
        const code = fab.code.toLowerCase();
        if (code.includes('black') || fab.color_cn.includes('黑')) return 'background-color: #22252a;';
        if (code.includes('grey') || code.includes('gray') || fab.color_cn.includes('灰')) return 'background-color: #78828e;';
        if (code.includes('white') || fab.color_cn.includes('白')) return 'background-color: #f8f9fa; border: 1px solid #ced4da;';
        if (code.includes('beige') || fab.color_cn.includes('米') || fab.color_cn.includes('杏')) return 'background-color: #e8dfd1;';
        if (code.includes('brown') || fab.color_cn.includes('咖') || fab.color_cn.includes('棕')) return 'background-color: #7b593f;';
        if (code.includes('blue') || fab.color_cn.includes('蓝')) return 'background-color: #3b5998;';
        if (code.includes('green') || fab.color_cn.includes('绿')) return 'background-color: #4a7c59;';
        return 'background: linear-gradient(135deg, #d8dcd6, #979b93);';
      }

      grid.innerHTML = list.map(fab => {
        const isSelected = fab.code === romanSelectedFabCode ? 'selected' : '';
        const isBlackout = fab.type && fab.type.toLowerCase().includes('blackout');
        const colorStyle = getFabricColorStyle(fab);
        const rmbRate = fab.rmb_base || (fab.prices ? Object.values(fab.prices)[0] : 160) || 160;

        return `
          <div class="fab-card ${isSelected}" data-code="${fab.code}">
            <div class="fab-swatch-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
              <span class="fab-swatch-circle" style="${colorStyle} display: inline-block; width: 1.25rem; height: 1.25rem; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
              <span class="fab-price-badge" style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 700;">¥${rmbRate}/㎡</span>
            </div>
            <div class="fab-card-code">${fab.code} • ${fab.series_cn}</div>
            <div class="fab-card-name">${romanCurrentLang === 'cn' ? fab.color_cn : fab.color_en}</div>
            <span class="fab-card-type ${isBlackout ? 'blackout' : 'light-filtering'}">
              ${isBlackout ? '遮光 Blackout' : '滤光 Light Filtering'}
            </span>
          </div>
        `;
      }).join('');

      grid.querySelectorAll('.fab-card').forEach(card => {
        card.addEventListener('click', () => {
          grid.querySelectorAll('.fab-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          romanSelectedFabCode = card.getAttribute('data-code');
          if (fabSelect) fabSelect.value = romanSelectedFabCode;
          calculateLiveItemPrice();
        });
      });
    }

    // Validate Dimensions against system limits
    function validateDimensions() {
      const sys = ROMAN_DB.SYSTEMS.find(s => s.code === romanSelectedSysCode) || ROMAN_DB.SYSTEMS[0];
      const w = parseFloat(elWidthInput ? elWidthInput.value : 36) || 36;
      const h = parseFloat(elHeightInput ? elHeightInput.value : 60) || 60;
      const d = parseFloat(elDepthInput ? elDepthInput.value : 2.0) || 2.0;
      const mount = elMountType ? elMountType.value : 'inside';

      let warnings = [];
      if (w < sys.min_w || w > sys.max_w) {
        warnings.push(`宽度 ${w}" 超出 ${sys.name_cn} 的极限范围 (${sys.min_w}" - ${sys.max_w}")`);
      }
      if (h < sys.min_h || h > sys.max_h) {
        warnings.push(`高度 ${h}" 超出 ${sys.name_cn} 的极限范围 (${sys.min_h}" - ${sys.max_h}")`);
      }
      if (mount === 'inside' && d < sys.min_depth) {
        warnings.push(`框内进深 ${d}" 小于该系统要求的最小洞深 (${sys.min_depth}")`);
      }

      if (elDimValidationMsg) {
        if (warnings.length > 0) {
          elDimValidationMsg.className = 'dimension-alert-box warning';
          elDimValidationMsg.innerHTML = `<span class="alert-icon">⚠️</span><span class="alert-text">${warnings.join('；')}</span>`;
        } else {
          elDimValidationMsg.className = 'dimension-alert-box valid';
          elDimValidationMsg.innerHTML = `<span class="alert-icon">✅</span><span class="alert-text">尺寸满足 ${sys.name_cn} 制作极限与进深要求 (W: ${sys.min_w}"-${sys.max_w}", H: ${sys.min_h}"-${sys.max_h}")。</span>`;
        }
      }
    }

    // Calculate Live Item Price & Sync Bottom Online Quote Card
    function calculateLiveItemPrice() {
      const w = parseFloat(elWidthInput ? elWidthInput.value : 36) || 36;
      const h = parseFloat(elHeightInput ? elHeightInput.value : 60) || 60;
      const motorId = elMotorSelect ? elMotorSelect.value : 'none';
      const remoteId = elRemoteSelect ? elRemoteSelect.value : 'none';
      const smartId = elSmartSelect ? elSmartSelect.value : 'none';

      const res = ROMAN_DB.calculateItemPrice(
        romanSelectedSysCode,
        romanSelectedFabCode,
        w, h, motorId, remoteId, smartId, romanDiscountFactor
      );

      if (elLiveRmbBase) elLiveRmbBase.textContent = `¥${res.rmb_total}`;
      if (elLiveUsdBase) elLiveUsdBase.textContent = `$${(res.usd_landed_freight || res.usd_ex_factory || 0).toFixed(2)}`;
      if (elLiveMsrp) elLiveMsrp.textContent = `$${(res.msrp_price || 0).toFixed(2)}`;
      if (elLiveFinalRate) elLiveFinalRate.textContent = `$${(res.final_unit_price || 0).toFixed(2)}`;

      // Sync Bottom Online Quote Card 100% with top calculator
      updateBottomQuoteCalculator(res, w, h);
      syncBottomCalculatorWithTop(res, w, h);
    }

    function updateBottomQuoteCalculator(res, w, h) {
      const sys = ROMAN_DB.SYSTEMS.find(s => s.code === romanSelectedSysCode) || ROMAN_DB.SYSTEMS[0];
      const fab = ROMAN_DB.FABRICS.find(f => f.code === romanSelectedFabCode) || ROMAN_DB.FABRICS[0];

      const outType = document.getElementById('out-type');
      const outSize = document.getElementById('out-size');
      const outMaterial = document.getElementById('out-material');
      const outControl = document.getElementById('out-control');
      const outPriceVal = document.getElementById('out-price-val');

      if (outType && sys) outType.textContent = `${sys.name_cn} (${sys.sys_type})`;
      if (outSize) outSize.textContent = `${w}" W x ${h}" H`;
      if (outMaterial && fab) outMaterial.textContent = `${fab.code} (${fab.series_cn})`;
      if (outControl && elControlSide) outControl.textContent = elControlSide.options[elControlSide.selectedIndex].text;
      if (outPriceVal && res) outPriceVal.textContent = `$${(res.final_unit_price || 0).toFixed(2)}`;
    }

    // Dynamic Customer Info Sync
    function syncCustomerMeta() {
      if (sheetClientName && elCustName) sheetClientName.textContent = elCustName.value || '--';
      if (sheetProjectType && elProjType) sheetProjectType.textContent = elProjType.value || 'Custom Window Treatments';
      if (sheetClientAddress && elCustAddress) sheetClientAddress.textContent = elCustAddress.value || '--';
      if (sheetClientPhone && elCustPhone) sheetClientPhone.textContent = elCustPhone.value || '--';
      if (sheetClientEmail && elCustEmail) sheetClientEmail.textContent = elCustEmail.value || '--';
      if (sheetMetaDate && elQuoteDate) sheetMetaDate.textContent = elQuoteDate.value || new Date().toISOString().split('T')[0];
      if (sheetMetaNo && elQuoteNo) sheetMetaNo.textContent = elQuoteNo.value || 'QT-20260806-01';
      if (sheetSpecialNotes && elSpecialNotes) sheetSpecialNotes.textContent = elSpecialNotes.value || 'Square Headrail Cordless';
    }

    // Universal Click-to-Zoom Lightbox Overlay
    function initImageLightbox() {
      const modal = document.getElementById('image-lightbox-modal');
      const modalImg = document.getElementById('lightbox-target-img');
      const modalCaption = document.getElementById('lightbox-target-caption');
      const closeBtn = document.getElementById('lightbox-close-btn');

      if (!modal || !modalImg) return;

      document.body.addEventListener('click', (e) => {
        if (e.target && (e.target.classList.contains('sys-card-img') || e.target.classList.contains('lightbox-trigger') || (e.target.tagName === 'IMG' && e.target.closest('.guide-card')))) {
          modalImg.src = e.target.src;
          modalCaption.textContent = e.target.alt || 'Visual Guide Image / 款式实拍图';
          modal.classList.add('show');
        }
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.classList.remove('show');
        });
      }

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    }

    // Discount Input & Button Handlers
    function bindDiscountButtons() {
      const btns = document.querySelectorAll('.discount-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const factor = parseFloat(btn.getAttribute('data-factor'));
          if (elCustomDiscountInput) {
            elCustomDiscountInput.value = Math.round(factor * 100);
          }
          setDiscountFactor(factor);
        });
      });

      if (elCustomDiscountInput) {
        elCustomDiscountInput.addEventListener('input', (e) => {
          btns.forEach(b => b.classList.remove('active'));
          let valStr = e.target.value.trim();
          let perc = parseFloat(valStr);
          if (isNaN(perc)) perc = 100;
          if (perc < 0) perc = 0;
          if (perc > 100) perc = 100;
          let factor = perc / 100;

          // Highlight matching preset button if any
          btns.forEach(b => {
            if (parseFloat(b.getAttribute('data-factor')) === factor) {
              b.classList.add('active');
            }
          });

          setDiscountFactor(factor);
        });
      }
    }

    function setDiscountFactor(factor) {
      romanDiscountFactor = factor;
      const offPercentage = Math.round((1 - factor) * 100);
      const labelStr = factor === 1.0 ? '100% MSRP (原价)' : `${offPercentage}% OFF (${(factor*10).toFixed(1)}折 / ${factor.toFixed(2)})`;
      
      if (elDiscountBadge) elDiscountBadge.textContent = labelStr;
      if (sheetClientDiscount) sheetClientDiscount.textContent = labelStr;

      calculateLiveItemPrice();
      recalculateQuoteItems();
    }

    // Sales Tax Input & Button Handlers
    function bindTaxButtons() {
      const taxInput = document.getElementById('custom-tax-input');
      const btns = document.querySelectorAll('#tax-presets-quick .tax-btn');

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const taxVal = parseFloat(btn.getAttribute('data-tax')) || 0;
          if (taxInput) taxInput.value = taxVal;
          setSalesTaxRate(taxVal);
        });
      });

      if (taxInput) {
        taxInput.addEventListener('input', (e) => {
          btns.forEach(b => b.classList.remove('active'));
          let val = parseFloat(e.target.value);
          if (isNaN(val)) val = 0;
          if (val < 0) val = 0;
          if (val > 30) val = 30;

          btns.forEach(b => {
            if (parseFloat(b.getAttribute('data-tax')) === val) {
              b.classList.add('active');
            }
          });

          setSalesTaxRate(val);
        });
      }
    }

    function setSalesTaxRate(rate) {
      romanSalesTaxRate = rate;
      const taxBadge = document.getElementById('tax-val-badge');
      if (taxBadge) {
        taxBadge.textContent = rate === 0 ? '0.00% Tax (免税)' : `${rate.toFixed(2)}% Tax (销售税)`;
      }
      renderQuoteItemsTable();
    }

    // Bind all config & option input listeners for real-time live updates
    function bindAllOptionInputListeners() {
      const sysSelect = document.getElementById('roman-sys-select');
      if (sysSelect) {
        sysSelect.addEventListener('change', (e) => {
          romanSelectedSysCode = e.target.value;
          renderSystemCards();
          validateDimensions();
          calculateLiveItemPrice();
        });
      }

      const fabSelect = document.getElementById('roman-fab-select');
      if (fabSelect) {
        fabSelect.addEventListener('change', (e) => {
          romanSelectedFabCode = e.target.value;
          renderFabricCards();
          calculateLiveItemPrice();
        });
      }

      const inputsToCalculate = [
        elWidthInput, elHeightInput, elDepthInput, elMountType, elControlSide,
        elMotorSelect, elRemoteSelect, elSmartSelect, elQtyInput
      ];

      inputsToCalculate.forEach(input => {
        if (input) {
          input.addEventListener('input', () => {
            validateDimensions();
            calculateLiveItemPrice();
          });
          input.addEventListener('change', () => {
            validateDimensions();
            calculateLiveItemPrice();
          });
        }
      });

      const customerInputs = [
        elCustName, elProjType, elCustAddress, elCustPhone, elCustEmail,
        elQuoteDate, elQuoteNo, elSpecialNotes
      ];

      customerInputs.forEach(input => {
        if (input) {
          input.addEventListener('input', syncCustomerMeta);
          input.addEventListener('change', syncCustomerMeta);
        }
      });
    }

    // Add Item to Quotation
    if (btnAddItem) {
      btnAddItem.addEventListener('click', (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
          const sys = ROMAN_DB.SYSTEMS.find(s => s.code === romanSelectedSysCode) || ROMAN_DB.SYSTEMS[0];
          const fab = ROMAN_DB.FABRICS.find(f => f.code === romanSelectedFabCode) || ROMAN_DB.FABRICS[0];
          const w = (elWidthInput ? parseFloat(elWidthInput.value) : 36) || 36;
          const h = (elHeightInput ? parseFloat(elHeightInput.value) : 60) || 60;
          const qty = (elQtyInput ? parseInt(elQtyInput.value, 10) : 1) || 1;
          const roomVal = elRoomName ? elRoomName.value.trim() : '';
          const room = roomVal !== '' ? roomVal : `Item #${romanQuoteItems.length + 1}`;
          
          const elItemRemark = document.getElementById('roman-item-remark');
          const remark = elItemRemark ? elItemRemark.value.trim() : '';

          const mount = (elMountType && elMountType.value === 'inside') ? 'Inside Mount (框内)' : 'Outside Mount (框外)';
          const control = (elControlSide && elControlSide.options && elControlSide.selectedIndex >= 0) ? elControlSide.options[elControlSide.selectedIndex].text : 'Cordless (无绳手提)';

          const motorId = elMotorSelect ? elMotorSelect.value : 'none';
          const remoteId = elRemoteSelect ? elRemoteSelect.value : 'none';
          const smartId = elSmartSelect ? elSmartSelect.value : 'none';

          const motorObj = ROMAN_DB.MOTOR_OPTIONS.find(m => m.id === motorId);
          const remoteObj = ROMAN_DB.REMOTE_OPTIONS.find(r => r.id === remoteId);
          const smartObj = ROMAN_DB.SMART_ACC_OPTIONS.find(s => s.id === smartId);

          let addonTexts = [];
          if (motorId !== 'none' && motorObj) addonTexts.push(motorObj.name_cn);
          if (remoteId !== 'none' && remoteObj) addonTexts.push(remoteObj.name_cn);
          if (smartId !== 'none' && smartObj) addonTexts.push(smartObj.name_cn);

          const pricing = ROMAN_DB.calculateItemPrice(
            sys.code, fab.code, w, h, motorId, remoteId, smartId, romanDiscountFactor
          );

          const newItem = {
            id: Date.now(),
            room: room,
            remark: remark,
            sys: sys,
            fab: fab,
            width: w,
            height: h,
            sqm: pricing.sqm,
            qty: qty,
            mount: mount,
            control: control,
            addons: addonTexts.join(', '),
            msrp_unit: pricing.msrp_price,
            final_unit: pricing.final_unit_price,
            amount: Math.round(pricing.final_unit_price * qty * 100) / 100
          };

          romanQuoteItems.push(newItem);
          renderQuoteItemsTable();
          
          // Reset room & remark inputs
          if (elRoomName) elRoomName.value = '';
          if (elItemRemark) elItemRemark.value = '';

          // Smooth scroll to quotation sheet table
          const quoteTable = document.getElementById('quote-items-table');
          if (quoteTable) {
            quoteTable.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (err) {
          console.error('Error adding item to quotation:', err);
        }
      });
    }

    // Render Quotation Table & Calculate Totals
    function renderQuoteItemsTable() {
      if (!quoteItemsBody) return;

      if (romanQuoteItems.length === 0) {
        quoteItemsBody.innerHTML = `
          <tr class="empty-table-row">
            <td colspan="10" class="text-center py-4">No quotation items. Please configure items above and click "Add Item to Quotation".<br><span class="text-muted">暂无报价明细，请在上方配置器中选择系统与面料后点击“添加到报价单”。</span></td>
          </tr>
        `;
        if (itemCountBadge) itemCountBadge.textContent = '0 Items';
        updateTotals(0, 0);
        return;
      }

      if (itemCountBadge) itemCountBadge.textContent = `${romanQuoteItems.length} Items`;

      let totalMsrp = 0;
      let totalFinal = 0;

      quoteItemsBody.innerHTML = romanQuoteItems.map((item, index) => {
        const lineMsrp = item.msrp_unit * item.qty;
        totalMsrp += lineMsrp;
        totalFinal += item.amount;

        const sysName = `${item.sys.name_cn} (${item.sys.name_en})`;
        const fabDesc = `Fabric / 面料: ${item.fab.code} (${item.fab.series_cn} ${item.fab.color_cn} / ${item.fab.series_en} ${item.fab.color_en})`;
        const sqmVal = item.sqm || Math.max(1.0, Math.round((item.width * item.height / 1550.0031) * 100) / 100);
        const specsText = `Size / 尺寸: ${item.width}" W x ${item.height}" H (${sqmVal} ㎡)\n${item.mount} | ${item.control}${item.addons ? '\nAdd-ons / 选配: ' + item.addons : ''}`;
        const remarkTag = item.remark ? `<br><span class="badge-remark" style="color: var(--accent-gold); font-size: 0.78rem;">📝 备注: ${item.remark}</span>` : '';

        return `
          <tr>
            <td><strong>${index + 1}</strong></td>
            <td>
              <img src="${item.sys.image_url}" class="table-sys-img lightbox-trigger" alt="${item.sys.name_cn}" onerror="this.parentElement.innerHTML='🖼️'">
            </td>
            <td>
              <strong>${item.room}</strong>
            </td>
            <td>
              <strong>${sysName}</strong>${remarkTag}<br>
              <span class="text-muted" style="font-size: 0.78rem;">${fabDesc}</span>
            </td>
            <td style="white-space: pre-line; font-size: 0.8rem;">${specsText}</td>
            <td class="text-center">${item.qty}</td>
            <td>$${item.msrp_unit.toFixed(2)}</td>
            <td><strong class="text-gold">$${item.final_unit.toFixed(2)}</strong></td>
            <td><strong>$${item.amount.toFixed(2)}</strong></td>
            <td class="no-print text-center">
              <button type="button" class="btn-row-delete" data-id="${item.id}">❌</button>
            </td>
          </tr>
        `;
      }).join('');

      // Delete item handler
      quoteItemsBody.querySelectorAll('.btn-row-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.getAttribute('data-id'), 10);
          romanQuoteItems = romanQuoteItems.filter(i => i.id !== id);
          renderQuoteItemsTable();
        });
      });

      updateTotals(totalMsrp, totalFinal);
    }

    function recalculateQuoteItems() {
      romanQuoteItems.forEach(item => {
        const motorId = elMotorSelect ? elMotorSelect.value : 'none';
        const remoteId = elRemoteSelect ? elRemoteSelect.value : 'none';
        const smartId = elSmartSelect ? elSmartSelect.value : 'none';

        const pricing = ROMAN_DB.calculateItemPrice(
          item.sys.code, item.fab.code, item.width, item.height, motorId, remoteId, smartId, romanDiscountFactor
        );
        item.msrp_unit = pricing.msrp_price;
        item.final_unit = pricing.final_unit_price;
        item.amount = Math.round(pricing.final_unit_price * item.qty * 100) / 100;
      });
      renderQuoteItemsTable();
    }

    function updateTotals(totalMsrp, totalFinal) {
      const discountVal = totalMsrp - totalFinal;
      const taxRateLabel = document.getElementById('sheet-tax-rate-label');
      const taxAmountVal = document.getElementById('sheet-tax-amount');

      const taxAmount = totalFinal * (romanSalesTaxRate / 100);
      const grandTotal = totalFinal + taxAmount;

      if (sheetSubtotalMsrp) sheetSubtotalMsrp.textContent = `$${totalMsrp.toFixed(2)}`;
      if (sheetDiscountAmount) sheetDiscountAmount.textContent = `-$${discountVal.toFixed(2)}`;
      if (sheetSubtotalFinal) sheetSubtotalFinal.textContent = `$${totalFinal.toFixed(2)}`;
      if (taxRateLabel) taxRateLabel.textContent = `${romanSalesTaxRate.toFixed(2)}%`;
      if (taxAmountVal) taxAmountVal.textContent = `$${taxAmount.toFixed(2)}`;
      if (sheetGrandTotal) sheetGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
    }

    // Language Switcher Toggle
    const btnCn = document.getElementById('lang-cn-btn');
    const btnEn = document.getElementById('lang-en-btn');
    if (btnCn && btnEn) {
      btnCn.addEventListener('click', () => {
        btnCn.classList.add('active');
        btnEn.classList.remove('active');
        romanCurrentLang = 'cn';
        renderSystemCards();
        renderFabricCards();
      });
      btnEn.addEventListener('click', () => {
        btnEn.classList.add('active');
        btnCn.classList.remove('active');
        romanCurrentLang = 'en';
        renderSystemCards();
        renderFabricCards();
      });
    }

    // Visual Guide Tabs
    const guideBtns = document.querySelectorAll('.guide-tab-btn');
    guideBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        guideBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.querySelectorAll('.guide-tab-content').forEach(c => c.classList.remove('active'));
        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.classList.add('active');
      });
    });

    // Inputs Listeners
    [elCustName, elProjType, elCustAddress, elCustPhone, elCustEmail, elQuoteDate, elQuoteNo, elSpecialNotes].forEach(el => {
      if (el) el.addEventListener('input', syncCustomerMeta);
    });

    [elWidthInput, elHeightInput, elDepthInput, elMountType].forEach(el => {
      if (el) {
        el.addEventListener('input', () => {
          validateDimensions();
          calculateLiveItemPrice();
        });
        el.addEventListener('change', () => {
          validateDimensions();
          calculateLiveItemPrice();
        });
      }
    });

    [elMotorSelect, elRemoteSelect, elSmartSelect].forEach(el => {
      if (el) el.addEventListener('change', calculateLiveItemPrice);
    });

    // --- Export to Excel Handler (Matching William窗帘报价单 layout) ---
    if (btnExportExcel) {
      btnExportExcel.addEventListener('click', () => {
        if (typeof XLSX === 'undefined') {
          alert('Excel Library (XLSX) is not loaded.');
          return;
        }

        const custName = elCustName ? (elCustName.value || '--') : '--';
        const projType = elProjType ? (elProjType.value || 'Custom Window Treatments') : 'Custom Window Treatments';
        const custAddress = elCustAddress ? (elCustAddress.value || '--') : '--';
        const custPhone = elCustPhone ? (elCustPhone.value || '--') : '--';
        const custEmail = elCustEmail ? (elCustEmail.value || '--') : '--';
        const dateStr = elQuoteDate ? elQuoteDate.value : new Date().toISOString().split('T')[0];
        const quoteNo = elQuoteNo ? elQuoteNo.value : 'QT-20260806-01';
        const specNotes = elSpecialNotes ? elSpecialNotes.value : 'Square Headrail Cordless';
        const discText = sheetClientDiscount ? sheetClientDiscount.textContent : '50% OFF';

        // Prepare Excel Data Matrix
        let data = [
          ['BRAUN INTERNATIONAL LLC', '', '', '', 'QUOTATION / 窗帘定制报价单'],
          ['SUN SHADES & SUN BLINDS - CUSTOM WINDOW TREATMENTS', '', '', '', 'Date / 日期: ' + dateStr],
          ['Ontario, CA 91761, USA | Email: sundagang91709@gmail.com', '', '', '', 'Quote No / 报价单号: ' + quoteNo],
          [],
          ['CLIENT & PROJECT DETAILS / 客户与项目信息'],
          ['Customer Name / 客户姓名:', custName, '', 'Project Type / 项目类型:', projType],
          ['Address / 客户地址:', custAddress, '', 'Phone / 联系电话:', custPhone],
          ['Email / 电子邮箱:', custEmail, '', 'Customer Tier / 折扣:', discText],
          ['Special Notes / 工艺特征:', specNotes, '', '', ''],
          [],
          ['Item #', 'Room / Location / 房间位置', 'Item Description / 项目与规格说明', 'Specs & Dimensions / 尺寸参数', 'Qty / 数量', 'Rate ($) / 单价', 'Amount ($) / 金额']
        ];

        let grandTotal = 0;
        romanQuoteItems.forEach((item, index) => {
          grandTotal += item.amount;
          const sqmVal = item.sqm || Math.max(1.0, Math.round((item.width * item.height / 1550.0031) * 100) / 100);
          const desc = `${item.sys.name_cn} (${item.sys.name_en})\nFabric / 面料: ${item.fab.code} (${item.fab.series_cn} ${item.fab.color_cn} / ${item.fab.series_en} ${item.fab.color_en})${item.remark ? '\nRemark / 备注: ' + item.remark : ''}`;
          const specs = `Size / 尺寸: ${item.width}" W x ${item.height}" H (${sqmVal} ㎡)\n${item.mount} | ${item.control}${item.addons ? '\nAdd-ons / 选配: ' + item.addons : ''}`;
          data.push([index + 1, item.room, desc, specs, item.qty, item.final_unit, item.amount]);
        });

        // Summary Rows
        const subtotalFinal = grandTotal;
        const taxAmt = Math.round(subtotalFinal * (romanSalesTaxRate / 100) * 100) / 100;
        const finalGrandTotal = Math.round((subtotalFinal + taxAmt) * 100) / 100;

        data.push([]);
        data.push(['', '', '', '', 'Products Subtotal / 折后小计:', subtotalFinal]);
        data.push(['', '', '', '', `Sales Tax (${romanSalesTaxRate.toFixed(2)}%) / 销售税:`, taxAmt]);
        data.push(['', '', '', '', 'Shipping & Freight / 运费:', 0]);
        data.push(['', '', '', '', 'Grand Total / 预估总计:', finalGrandTotal]);

        // Create Workbook
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [
          { wch: 8 },  // Col A: Item #
          { wch: 25 }, // Col B: Room / Location
          { wch: 45 }, // Col C: Item Description
          { wch: 45 }, // Col D: Specs & Dimensions
          { wch: 10 }, // Col E: Qty
          { wch: 15 }, // Col F: Rate
          { wch: 15 }  // Col G: Amount
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Window Treatment Quote');

        // File Download
        const safeName = custName !== '--' ? custName : 'Client';
        const filename = `${safeName}_Z系列报价单.xlsx`;
        XLSX.writeFile(wb, filename);
      });
    }

    // --- Export / Print PDF Handler ---
    if (btnPrintPdf) {
      btnPrintPdf.addEventListener('click', () => {
        window.print();
      });
    }

    // --- Clear Handler ---
    const btnClearAll = document.getElementById('btn-clear-all-items');

    if (btnClearAll) {
      btnClearAll.addEventListener('click', () => {
        if (confirm('确定清空当前报价单中的所有商品明细吗？')) {
          romanQuoteItems = [];
          renderQuoteItemsTable();
        }
      });
    }

    // Initial Engine Bootstrap
    bindCategoryTabs();
    initAddonSelects();
    renderSystemCards();
    renderFabricCategoryTabs();
    renderFabricCards();
    bindDiscountButtons();
    bindTaxButtons();
    bindAllOptionInputListeners();
    validateDimensions();
    calculateLiveItemPrice();
    syncCustomerMeta();
    renderQuoteItemsTable();
  }
});

