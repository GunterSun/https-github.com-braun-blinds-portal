/* ==========================================================================
   Braun Blinds - Interactive Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation scroll effect
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
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

  // State Variables
  let romanCurrentLang = 'cn';
  let romanSelectedCategory = 'roman'; // Default category 'roman' (Roman Shades)
  let romanDiscountFactor = 0.30; // Default 30% (3折 / 0.30)
  let romanSalesTaxRate = 0.00; // Default Sales Tax Rate 0.00%
  let romanHardwareFloorFactor = 0.16; // Default 16% Hardware Minimum Floor (1.6折 / 0.16)
  let romanSelectedSysCode = 'LM0002'; // Default Square Cordless
  let romanSelectedFabCode = 'BZM11'; // Default Zhong Linen Blackout Dark Grey
  let romanSelectedFabCategory = 'ALL';
  let romanQuoteItems = [];

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
    // Category Tabs Binding
    function bindCategoryTabs() {
      const btns = document.querySelectorAll('#product-category-tabs .category-tab-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          romanSelectedCategory = btn.getAttribute('data-cat');

          // Reset default system & fabric selection for category
          const availSystems = ROMAN_DB.SYSTEMS.filter(s => s.category === romanSelectedCategory || (romanSelectedCategory === 'dual' && (s.category === 'dual' || s.code === 'LML0005' || s.code === 'LML0012' || s.code === 'lM0022')) || (romanSelectedCategory === 'bamboo' && (s.category === 'bamboo' || s.category === 'roman')) || (!s.category && (romanSelectedCategory === 'roman' || romanSelectedCategory === 'bamboo')));
          const availFabrics = ROMAN_DB.FABRICS.filter(f => romanSelectedCategory === 'dual' || (f.category || f.cat || 'roman') === romanSelectedCategory);

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
    const elItemRemark = document.getElementById('roman-item-remark');
    const elQtyInput = document.getElementById('roman-qty-input');
    const btnAddItem = document.getElementById('btn-add-roman-item');

    // Live Item Price Breakdown
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

    const quoteItemsBody = document.getElementById('quote-items-body');
    const itemCountBadge = document.getElementById('item-count-badge');
    const btnPrintPdf = document.getElementById('btn-print-pdf');
    const btnExportExcel = document.getElementById('btn-export-excel');

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

      const categorySystems = ROMAN_DB.SYSTEMS.filter(sys => sys.category === romanSelectedCategory || (romanSelectedCategory === 'dual' && (sys.category === 'dual' || sys.code === 'LML0005' || sys.code === 'LML0012' || sys.code === 'lM0022')) || (romanSelectedCategory === 'bamboo' && (sys.category === 'bamboo' || sys.category === 'roman')) || (!sys.category && (romanSelectedCategory === 'roman' || romanSelectedCategory === 'bamboo')));

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

      const categoryFabrics = ROMAN_DB.FABRICS.filter(f => romanSelectedCategory === 'dual' || (f.category || f.cat || 'roman') === romanSelectedCategory);
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

      let list = ROMAN_DB.FABRICS.filter(f => romanSelectedCategory === 'dual' || (f.category || f.cat || 'roman') === romanSelectedCategory);

      if (list.length > 0) {
        const found = list.find(f => f.code === romanSelectedFabCode);
        if (!found) {
          romanSelectedFabCode = list[0].code;
        }
      }

      if (fabSelect) {
        fabSelect.innerHTML = list.map(fab => {
          return `<option value="${fab.code}" ${fab.code === romanSelectedFabCode ? 'selected' : ''}>${fab.code} - ${fab.series_cn} (${fab.color_cn}) [${fab.type}]</option>`;
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

        return `
          <div class="fab-card ${isSelected}" data-code="${fab.code}">
            <div class="fab-swatch-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
              <span class="fab-swatch-circle" style="${colorStyle} display: inline-block; width: 1.25rem; height: 1.25rem; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"></span>
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
        w, h, motorId, remoteId, smartId, romanDiscountFactor, romanHardwareFloorFactor
      );

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
        if (e.target && e.target.classList.contains('lightbox-trigger')) {
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
          if (isNaN(perc)) perc = 30;
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
          let hardwareDetails = [];
          if (motorId !== 'none' && motorObj) {
            addonTexts.push(motorObj.name_cn);
            hardwareDetails.push(`电机: ${motorObj.name_cn} ($${motorObj.price_usd})`);
          }
          if (remoteId !== 'none' && remoteObj) {
            addonTexts.push(remoteObj.name_cn);
            hardwareDetails.push(`遥控: ${remoteObj.name_cn} ($${remoteObj.price_usd})`);
          }
          if (smartId !== 'none' && smartObj) {
            addonTexts.push(smartObj.name_cn);
            hardwareDetails.push(`智能: ${smartObj.name_cn} ($${smartObj.price_usd})`);
          }

          const chkSeparate = document.getElementById('chk-separate-hardware-lines');
          const isSeparate = chkSeparate ? chkSeparate.checked : false;

          let finalRemark = remark;
          if (hardwareDetails.length > 0) {
            finalRemark = remark ? `${remark} 【${hardwareDetails.join(' | ')}】` : `【${hardwareDetails.join(' | ')}】`;
          }

          if (isSeparate && hardwareDetails.length > 0) {
            // 1. Add Shade Line Item (仅帘体)
            const shadePricing = ROMAN_DB.calculateItemPrice(
              sys.code, fab.code, w, h, 'none', 'none', 'none', romanDiscountFactor, romanHardwareFloorFactor
            );

            romanQuoteItems.push({
              id: Date.now(),
              room: room,
              remark: remark ? `${remark} (仅帘体)` : '(仅帘体)',
              sys: sys,
              fab: fab,
              width: w,
              height: h,
              sqm: shadePricing.sqm,
              qty: qty,
              mount: mount,
              control: control,
              addons: '',
              msrp_unit: shadePricing.shade_msrp || shadePricing.msrp_price,
              final_unit: shadePricing.final_unit_price,
              amount: Math.round(shadePricing.final_unit_price * qty * 100) / 100
            });

            // 2. Add Motor Line Item
            const hwDiscount = Math.max(0.16, Math.max(romanHardwareFloorFactor, romanDiscountFactor));
            if (motorId !== 'none' && motorObj) {
              const motorMsrp = motorObj.price_usd || 167;
              const motorFinal = Math.round(motorMsrp * hwDiscount * 100) / 100;
              romanQuoteItems.push({
                id: Date.now() + 1,
                room: room,
                remark: `${motorObj.name_cn} (保底${Math.round(hwDiscount * 100)}%)`,
                sys: { code: 'HW_MOTOR', sys_type: '配件 Hardware', name_cn: motorObj.name_cn, image_url: 'system_images/sys_0116_LM0002.png' },
                fab: { code: 'MOTOR', series_cn: '智能电机', color_cn: motorObj.name_cn },
                width: w,
                height: h,
                sqm: 0,
                qty: qty,
                mount: mount,
                control: 'Motor (电动驱动)',
                sys_type_custom: '配件 Motor',
                prod_text_custom: motorObj.name_cn,
                discount_factor: hwDiscount,
                msrp_unit: motorMsrp,
                final_unit: motorFinal,
                amount: Math.round(motorFinal * qty * 100) / 100
              });
            }

            // 3. Add Remote Line Item
            if (remoteId !== 'none' && remoteObj) {
              const remoteMsrp = remoteObj.price_usd || 33;
              const remoteFinal = Math.round(remoteMsrp * hwDiscount * 100) / 100;
              romanQuoteItems.push({
                id: Date.now() + 2,
                room: room,
                remark: `${remoteObj.name_cn} (保底${Math.round(hwDiscount * 100)}%)`,
                sys: { code: 'HW_REMOTE', sys_type: '配件 Hardware', name_cn: remoteObj.name_cn, image_url: 'system_images/sys_0116_LM0002.png' },
                fab: { code: 'REMOTE', series_cn: '遥控器', color_cn: remoteObj.name_cn },
                width: w,
                height: h,
                sqm: 0,
                qty: 1,
                mount: mount,
                control: 'Remote Control',
                sys_type_custom: '配件 Remote',
                prod_text_custom: remoteObj.name_cn,
                discount_factor: hwDiscount,
                msrp_unit: remoteMsrp,
                final_unit: remoteFinal,
                amount: Math.round(remoteFinal * 100) / 100
              });
            }

            // 4. Add Smart Hub Line Item
            if (smartId !== 'none' && smartObj) {
              const smartMsrp = smartObj.price_usd || 144;
              const smartFinal = Math.round(smartMsrp * hwDiscount * 100) / 100;
              romanQuoteItems.push({
                id: Date.now() + 3,
                room: room,
                remark: `${smartObj.name_cn} (保底${Math.round(hwDiscount * 100)}%)`,
                sys: { code: 'HW_SMART', sys_type: '配件 Hardware', name_cn: smartObj.name_cn, image_url: 'system_images/sys_0116_LM0002.png' },
                fab: { code: 'SMART', series_cn: '智能网关', color_cn: smartObj.name_cn },
                width: w,
                height: h,
                sqm: 0,
                qty: 1,
                mount: mount,
                control: 'Smart Hub',
                sys_type_custom: '配件 Smart',
                prod_text_custom: smartObj.name_cn,
                discount_factor: hwDiscount,
                msrp_unit: smartMsrp,
                final_unit: smartFinal,
                amount: Math.round(smartFinal * 100) / 100
              });
            }
          } else {
            // Standard Combined Line Item
            const pricing = ROMAN_DB.calculateItemPrice(
              sys.code, fab.code, w, h, motorId, remoteId, smartId, romanDiscountFactor, romanHardwareFloorFactor
            );

            const newItem = {
              id: Date.now(),
              room: room,
              remark: finalRemark,
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
          }

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

        const sqftVal = (item.sqm * 10.7639).toFixed(2);
        const mountCode = (item.mount && item.mount.includes('Inside')) ? '[IM]' : '[OM]';
        const typeText = item.sys.sys_type || 'Roman Shade';
        const prodText = `${item.fab.series_cn} (${item.fab.code})`;
        const currentDiscount = item.discount_factor !== undefined ? item.discount_factor : romanDiscountFactor;

        return `
          <tr>
            <td style="text-align: center;"><strong>${index + 1}</strong></td>
            <td style="text-align: center;">
              <img src="${item.custom_image_url || item.sys.image_url}" class="table-sys-img lightbox-trigger" alt="${item.sys.name_cn}" style="width: 44px; height: 34px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;" onerror="this.parentElement.innerHTML='🖼️'">
            </td>
            <td>
              <input type="text" class="table-inline-input inline-room" data-idx="${index}" value="${item.room}" style="width: 80px; font-weight: 700; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 2px 4px; font-size: 0.8rem;">
            </td>
            <td style="text-align: center;">
              <input type="number" class="table-inline-input inline-qty" data-idx="${index}" value="${item.qty}" min="1" max="100" style="width: 44px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 2px 2px; font-size: 0.8rem;">
            </td>
            <td style="font-size: 0.8rem;">
              <input type="text" class="table-inline-input inline-type" data-idx="${index}" value="${item.sys_type_custom || typeText}" style="width: 75px; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 2px 2px; font-size: 0.78rem;">
            </td>
            <td style="white-space: nowrap;">
              <input type="number" class="table-inline-input inline-w" data-idx="${index}" value="${item.width}" step="0.125" style="width: 46px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 2px 2px; font-size: 0.78rem;">" ×
              <input type="number" class="table-inline-input inline-h" data-idx="${index}" value="${item.height}" step="0.125" style="width: 46px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 2px 2px; font-size: 0.78rem;">"
              <div style="font-size: 0.65rem; color: #64748b; margin-top: 2px; font-weight: 500;">⚖️ ${Math.max(1.5, Math.round(((item.width * item.height) / 1550) * 2.5 * 10) / 10)} kg (${(Math.max(1.5, Math.round(((item.width * item.height) / 1550) * 2.5 * 10) / 10) * 2.20462).toFixed(1)} lbs)</div>
            </td>
            <td style="font-size: 0.78rem;">
              <select class="table-inline-select inline-control" data-idx="${index}" style="font-size: 0.72rem; border: 1px dashed #2563eb; border-radius: 4px; padding: 2px 2px; color: #1e40af; font-weight: 700; width: 100%;">
                <option value="Cordless (无绳手提)" ${(item.control && (item.control.includes('Cordless') || item.control.includes('无绳'))) ? 'selected' : ''}>无绳手提 Cordless</option>
                <option value="Motorized Remote (电动静音)" ${(item.control && (item.control.includes('Motorized') || item.control.includes('电动'))) ? 'selected' : ''}>电动静音 Motorized</option>
                <option value="Steel Chain (钢拉珠系统)" ${(item.control && (item.control.includes('Steel') || item.control.includes('钢拉珠'))) ? 'selected' : ''}>钢拉珠 Chain</option>
                <option value="Right Chain (右侧拉珠)" ${(item.control && item.control.includes('Right')) ? 'selected' : ''}>右侧拉珠 Right</option>
                <option value="Left Chain (左侧拉珠)" ${(item.control && item.control.includes('Left')) ? 'selected' : ''}>左侧拉珠 Left</option>
                <option value="No-Drill Tension (免打孔系统)" ${(item.control && (item.control.includes('No-Drill') || item.control.includes('免打孔'))) ? 'selected' : ''}>免打孔 No-Drill</option>
                <option value="Top-Down Bottom-Up (上下合)" ${(item.control && (item.control.includes('TDBU') || item.control.includes('上下合'))) ? 'selected' : ''}>上下合 TDBU</option>
                <option value="Double Layer (双层日夜帘)" ${(item.control && (item.control.includes('Double') || item.control.includes('双层'))) ? 'selected' : ''}>双层帘 Double</option>
                <option value="Spring Soft-Drop (弹簧下降)" ${(item.control && (item.control.includes('Spring') || item.control.includes('弹簧'))) ? 'selected' : ''}>弹簧下降 Spring</option>
              </select>
            </td>
            <td>
              <input type="text" class="table-inline-input inline-prod" data-idx="${index}" value="${item.prod_text_custom || prodText}" style="width: 95px; font-weight: 700; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 2px 4px; font-size: 0.78rem;">
            </td>
            <td style="font-size: 0.76rem;">
              <input type="text" class="table-inline-input inline-remark" data-idx="${index}" value="${item.remark || ''}" placeholder="${item.sys.name_cn}" style="width: 100%; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 2px 4px; font-size: 0.75rem;">
            </td>
            <td style="text-align: right;">
              $<input type="number" class="table-inline-input inline-msrp" data-idx="${index}" value="${item.msrp_unit.toFixed(2)}" step="0.01" style="width: 56px; text-align: right; font-weight: 700; border: 1px dashed #64748b; border-radius: 4px; padding: 2px 2px; font-size: 0.78rem; color: #475569;" title="打折前原始零售单价 MSRP">
            </td>
            <td style="text-align: center; white-space: nowrap;">
              <input type="number" class="table-inline-input inline-discount-input" data-idx="${index}" value="${(currentDiscount * 10).toFixed(1)}" step="0.1" min="0.1" max="10" placeholder="例如 5" style="width: 44px; text-align: center; font-weight: 700; color: #2563eb; border: 1px dashed #2563eb; border-radius: 4px; padding: 2px 2px; font-size: 0.78rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #2563eb;">折</span>
            </td>
            <td style="text-align: right;">
              $<input type="number" class="table-inline-input inline-final-unit" data-idx="${index}" value="${item.final_unit.toFixed(2)}" step="0.01" style="width: 56px; text-align: right; font-weight: 700; border: 1px dashed #A83B24; border-radius: 4px; padding: 2px 2px; font-size: 0.78rem; color: #A83B24;" title="打折后最终单价">
            </td>
            <td style="text-align: right;"><strong>$${item.amount.toFixed(2)}</strong></td>
            <td style="text-align: center;">
              <input type="text" class="table-inline-input inline-mount" data-idx="${index}" value="${item.mount_code_custom || mountCode}" style="width: 42px; text-align: center; font-weight: 700; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 2px 2px; font-size: 0.78rem;">
            </td>
            <td class="no-print text-center" style="text-align: center;">
              <button type="button" class="btn-row-delete" data-id="${item.id}" style="background: none; border: none; cursor: pointer; font-size: 0.9rem;">❌</button>
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

      // Inline Control / 操作系统 Event Handler
      quoteItemsBody.querySelectorAll('.inline-control').forEach(select => {
        select.addEventListener('change', () => {
          const idx = parseInt(select.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            romanQuoteItems[idx].control = select.value;
          }
        });
      });

      // Inline Editing Event Handlers
      quoteItemsBody.querySelectorAll('.inline-room').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            romanQuoteItems[idx].room = input.value;
            renderQuoteItemsTable();
          }
        });
      });

      quoteItemsBody.querySelectorAll('.inline-qty').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            romanQuoteItems[idx].qty = Math.max(1, parseInt(input.value, 10) || 1);
            romanQuoteItems[idx].amount = Math.round(romanQuoteItems[idx].final_unit * romanQuoteItems[idx].qty * 100) / 100;
            renderQuoteItemsTable();
          }
        });
      });

      quoteItemsBody.querySelectorAll('.inline-type').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            romanQuoteItems[idx].sys_type_custom = input.value;
          }
        });
      });

      quoteItemsBody.querySelectorAll('.inline-prod').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            romanQuoteItems[idx].prod_text_custom = input.value;
          }
        });
      });

      quoteItemsBody.querySelectorAll('.inline-mount').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            romanQuoteItems[idx].mount_code_custom = input.value;
          }
        });
      });

      quoteItemsBody.querySelectorAll('.inline-w, .inline-h').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            const row = input.closest('tr');
            const wVal = parseFloat(row.querySelector('.inline-w').value) || romanQuoteItems[idx].width;
            const hVal = parseFloat(row.querySelector('.inline-h').value) || romanQuoteItems[idx].height;
            romanQuoteItems[idx].width = wVal;
            romanQuoteItems[idx].height = hVal;

            const disc = romanQuoteItems[idx].discount_factor !== undefined ? romanQuoteItems[idx].discount_factor : romanDiscountFactor;
            const pricing = ROMAN_DB.calculateItemPrice(
              romanQuoteItems[idx].sys.code, romanQuoteItems[idx].fab.code, wVal, hVal, 'none', 'none', 'none', disc
            );
            romanQuoteItems[idx].sqm = pricing.sqm;
            romanQuoteItems[idx].msrp_unit = pricing.msrp_price;
            romanQuoteItems[idx].final_unit = pricing.final_unit_price;
            romanQuoteItems[idx].amount = Math.round(pricing.final_unit_price * romanQuoteItems[idx].qty * 100) / 100;
            renderQuoteItemsTable();
          }
        });
      });

      quoteItemsBody.querySelectorAll('.inline-discount-input').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            let typedVal = parseFloat(input.value);
            if (isNaN(typedVal) || typedVal <= 0) typedVal = 3;
            let newDiscFactor = 0.30;
            if (typedVal > 0 && typedVal <= 1.0) {
              newDiscFactor = typedVal;
            } else if (typedVal > 1.0 && typedVal <= 10.0) {
              newDiscFactor = typedVal / 10.0;
            } else if (typedVal > 10.0 && typedVal <= 100.0) {
              newDiscFactor = typedVal / 100.0;
            }
            romanQuoteItems[idx].discount_factor = newDiscFactor;

            const pricing = ROMAN_DB.calculateItemPrice(
              romanQuoteItems[idx].sys.code, romanQuoteItems[idx].fab.code, romanQuoteItems[idx].width, romanQuoteItems[idx].height, 'none', 'none', 'none', newDiscFactor
            );
            romanQuoteItems[idx].msrp_unit = pricing.msrp_price;
            romanQuoteItems[idx].final_unit = pricing.final_unit_price;
            romanQuoteItems[idx].amount = Math.round(pricing.final_unit_price * romanQuoteItems[idx].qty * 100) / 100;
            renderQuoteItemsTable();
          }
        });
      });

      quoteItemsBody.querySelectorAll('.inline-msrp').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            const newMsrp = parseFloat(input.value) || romanQuoteItems[idx].msrp_unit;
            const currentDiscount = romanQuoteItems[idx].discount_factor !== undefined ? romanQuoteItems[idx].discount_factor : romanDiscountFactor;
            romanQuoteItems[idx].msrp_unit = newMsrp;
            romanQuoteItems[idx].final_unit = newMsrp * currentDiscount;
            romanQuoteItems[idx].amount = Math.round(romanQuoteItems[idx].final_unit * romanQuoteItems[idx].qty * 100) / 100;
            renderQuoteItemsTable();
          }
        });
      });

      quoteItemsBody.querySelectorAll('.inline-final-unit').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            const newFinal = parseFloat(input.value) || romanQuoteItems[idx].final_unit;
            romanQuoteItems[idx].final_unit = newFinal;
            romanQuoteItems[idx].amount = Math.round(newFinal * romanQuoteItems[idx].qty * 100) / 100;
            renderQuoteItemsTable();
          }
        });
      });

      quoteItemsBody.querySelectorAll('.inline-remark').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          if (romanQuoteItems[idx]) {
            romanQuoteItems[idx].remark = input.value;
          }
        });
      });

      updateTotals(totalMsrp, totalFinal);
      autoSaveActiveCustomerMeta();
      autoSaveCurrentOrderToHistory();
      if (typeof window.populateProposalItemPicker === 'function') {
        window.populateProposalItemPicker();
      }
    }

    function recalculateQuoteItems() {
      romanQuoteItems.forEach(item => {
        const motorId = elMotorSelect ? elMotorSelect.value : 'none';
        const remoteId = elRemoteSelect ? elRemoteSelect.value : 'none';
        const smartId = elSmartSelect ? elSmartSelect.value : 'none';

        const disc = item.discount_factor !== undefined ? item.discount_factor : romanDiscountFactor;

        const pricing = ROMAN_DB.calculateItemPrice(
          item.sys.code, item.fab.code, item.width, item.height, motorId, remoteId, smartId, disc, romanHardwareFloorFactor
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
      const shippingInput = document.getElementById('sheet-shipping-fee-input');
      const shippingValDisplay = document.getElementById('sheet-shipping-fee-val');

      // Run Shipping Package & Logistics Freight Calculator
      const pkgInfo = ROMAN_DB.calculatePackageShipping ? ROMAN_DB.calculatePackageShipping(romanQuoteItems) : null;

      if (pkgInfo && pkgInfo.est_freight_usd > 0) {
        if (shippingInput && (!shippingInput.value || shippingInput.value === "0" || shippingInput.getAttribute('data-auto') === 'true')) {
          shippingInput.value = pkgInfo.est_freight_usd.toFixed(2);
          shippingInput.setAttribute('data-auto', 'true');
        }
      }

      const shippingFee = shippingInput ? (parseFloat(shippingInput.value) || 0) : 0;
      const taxAmount = totalFinal * (romanSalesTaxRate / 100);

      // Credit Card Processing Fee (3.5%)
      const sheetCcCheckbox = document.getElementById('sheet-cc-fee-checkbox');
      const sheetCcFeeVal = document.getElementById('sheet-cc-fee-val');
      const btnToggleCcFee = document.getElementById('btn-toggle-cc-fee');
      const sheetCcFeeRow = document.getElementById('sheet-cc-fee-row');
      const isCcFeeEnabled = sheetCcCheckbox ? sheetCcCheckbox.checked : false;

      if (sheetCcCheckbox && !sheetCcCheckbox.hasAttribute('data-bound')) {
        sheetCcCheckbox.setAttribute('data-bound', 'true');
        const handleCcToggle = () => {
          updateQuoteTotalsSummary();
          autoSaveActiveCustomerMeta();
        };

        sheetCcCheckbox.addEventListener('change', handleCcToggle);

        if (btnToggleCcFee) {
          btnToggleCcFee.addEventListener('click', (e) => {
            e.preventDefault();
            sheetCcCheckbox.checked = !sheetCcCheckbox.checked;
            handleCcToggle();
          });
          btnToggleCcFee.addEventListener('touchstart', (e) => {
            e.preventDefault();
            sheetCcCheckbox.checked = !sheetCcCheckbox.checked;
            handleCcToggle();
          });
        }

        if (sheetCcFeeRow) {
          sheetCcFeeRow.addEventListener('click', (e) => {
            if (e.target !== sheetCcCheckbox && e.target.tagName !== 'LABEL') {
              sheetCcCheckbox.checked = !sheetCcCheckbox.checked;
              handleCcToggle();
            }
          });
        }
      }

      const subtotalBeforeCc = totalFinal + taxAmount + shippingFee;
      const ccFeeAmount = isCcFeeEnabled ? Math.round(subtotalBeforeCc * 0.035 * 100) / 100 : 0;
      const grandTotal = subtotalBeforeCc + ccFeeAmount;

      if (btnToggleCcFee) {
        if (isCcFeeEnabled) {
          btnToggleCcFee.style.background = '#15803d';
          btnToggleCcFee.textContent = `💳 信用卡支付 (+3.5% 手续费): 已开启 (ON +$${ccFeeAmount.toFixed(2)})`;
        } else {
          btnToggleCcFee.style.background = '#d97706';
          btnToggleCcFee.textContent = `💳 信用卡支付 (+3.5% 手续费): 关 (OFF)`;
        }
      }

      const sheetSubtotalMsrp = document.getElementById('sheet-subtotal-msrp');
      const sheetDiscountAmount = document.getElementById('sheet-discount-amount');
      const sheetSubtotalFinal = document.getElementById('sheet-subtotal-final');
      const sheetGrandTotal = document.getElementById('sheet-grand-total');

      if (sheetSubtotalMsrp) sheetSubtotalMsrp.textContent = `$${totalMsrp.toFixed(2)}`;
      if (sheetDiscountAmount) sheetDiscountAmount.textContent = `-$${discountVal.toFixed(2)}`;
      if (sheetSubtotalFinal) sheetSubtotalFinal.textContent = `$${totalFinal.toFixed(2)}`;
      if (taxRateLabel) taxRateLabel.textContent = `${romanSalesTaxRate.toFixed(2)}%`;
      if (taxAmountVal) taxAmountVal.textContent = `$${taxAmount.toFixed(2)}`;
      if (shippingValDisplay) shippingValDisplay.textContent = `$${shippingFee.toFixed(2)}`;
      if (sheetCcFeeVal) {
        sheetCcFeeVal.textContent = isCcFeeEnabled ? `+$${ccFeeAmount.toFixed(2)}` : `$0.00`;
        sheetCcFeeVal.style.color = isCcFeeEnabled ? '#d97706' : '#94a3b8';
      }
      if (sheetGrandTotal) sheetGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;

      // Update Shipping Package Summary Badge & Box Details Card
      const pkgBadge = document.getElementById('pkg-summary-badge');
      const pkgDetails = document.getElementById('pkg-details-container');
      if (pkgInfo && pkgBadge && pkgDetails) {
        if (pkgInfo.total_boxes === 0) {
          pkgBadge.textContent = `0 箱 / 计费重 0 kg / 预估运费 $0.00`;
          pkgDetails.innerHTML = `<span class="text-muted">按宽度相近自动规划分箱包长与材积重（长=Max.W+15cm, 材积=L×W×H/6000）。添加报价项后自动计算。</span>`;
        } else {
          pkgBadge.textContent = `📦 共 ${pkgInfo.total_boxes} 箱 / 总计费重 ${pkgInfo.total_billed_weight_kg} kg (材积重 ${pkgInfo.total_vol_weight_kg} kg, 实重 ${pkgInfo.total_act_weight_kg} kg) / 预估国际运费 $${pkgInfo.est_freight_usd.toFixed(2)}`;

          pkgDetails.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 0.7rem; text-align: center; background: #ffffff; border: 1px solid #bfdbfe; border-radius: 4px; overflow: hidden;">
              <thead>
                <tr style="background: #dbeafe; color: #1e3a8a; font-weight: 700;">
                  <th style="padding: 4px; border: 1px solid #bfdbfe;">包裹编号 (Box #)</th>
                  <th style="padding: 4px; border: 1px solid #bfdbfe;">装箱件数 (Qty)</th>
                  <th style="padding: 4px; border: 1px solid #bfdbfe;">外箱尺寸 (长×宽×高 cm)</th>
                  <th style="padding: 4px; border: 1px solid #bfdbfe;">外箱尺寸 (L×W×H inch)</th>
                  <th style="padding: 4px; border: 1px solid #bfdbfe;">材积重量 (Vol. Wt)</th>
                  <th style="padding: 4px; border: 1px solid #bfdbfe;">预估实重 (Act. Wt)</th>
                  <th style="padding: 4px; border: 1px solid #bfdbfe;">计费重量 (Billed Wt)</th>
                </tr>
              </thead>
              <tbody>
                ${pkgInfo.boxes.map(b => `
                  <tr>
                    <td style="padding: 4px; border: 1px solid #bfdbfe; font-weight: 700;">包裹 Box #${b.box_no}</td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;">${b.item_count} 件</td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe; font-weight: 700; color: #1d4ed8;">${b.length_cm} × ${b.width_cm} × ${b.height_cm} cm</td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe; color: #475569;">${(b.length_cm / 2.54).toFixed(1)}" × ${(b.width_cm / 2.54).toFixed(1)}" × ${(b.height_cm / 2.54).toFixed(1)}"</td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;">${b.vol_weight_kg} kg</td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe;">${b.act_weight_kg} kg (${(b.act_weight_kg * 2.20462).toFixed(1)} lbs)</td>
                    <td style="padding: 4px; border: 1px solid #bfdbfe; font-weight: 700; color: #b91c1c;">${b.billed_weight_kg} kg (${(b.billed_weight_kg * 2.20462).toFixed(1)} lbs)</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      }
    }

    // Bilingual i18n Dictionary
    const i18nDict = {
      cn: {
        cust_header: "客户信息与全局折扣设置 / Customer & Project Settings",
        clear_table: "🗑️ 清空表格 / Clear Table",
        cust_name: "Customer Name / 客户姓名",
        proj_type: "Project Type / 项目类型",
        cust_address: "Address / 客户地址",
        cust_phone: "Phone / 联系电话",
        cust_email: "Email / 电子邮箱",
        quote_date: "Date / 报价日期 (自动/手动调整)",
        quote_no: "Quote No / 报价单号",
        cust_discount: "Customer Wholesale Discount / 客户手动折扣数值",
        notes: "Special Craft Notes / 工艺说明与特点",
        item_builder: "罗马帘定制配置器 / Item Configurator",
        step1_title: "系统控制类型 / System & Mechanism Selection",
        step2_title: "面料系列与颜色 / Fabric Series & Color Options",
        step3_title: "窗户尺寸与极限校验 / Dimensions (Inches)",
        step4_title: "安装方式与控制方向 / Mount & Control Side",
        step5_title: "选配智能电机与配件 / Motor & Accessories Add-ons",
        step6_title: "房间名称、数量与算价 / Item Details & Add",
        add_item_btn: "➕ 添加到报价单 / Add Item to Quote",
        preview_title: "📄 报价单预览 (Quotation Preview)",
        btn_export_excel: "📊 导出 Excel 报价单 (.xlsx)",
        btn_print_pdf: "🖨️ 打印 / 导出单页 PDF"
      },
      en: {
        cust_header: "Customer & Project Settings",
        clear_table: "🗑️ Clear Table",
        cust_name: "Customer Name",
        proj_type: "Project Type / Sidemark",
        cust_address: "Shipping Address",
        cust_phone: "Phone Number",
        cust_email: "Email Address",
        quote_date: "Quote Date",
        quote_no: "Quote Number",
        cust_discount: "Customer Wholesale Discount",
        notes: "Special Craft & Technical Notes",
        item_builder: "Roman Shade Configurator",
        step1_title: "1. System & Mechanism Selection",
        step2_title: "2. Fabric Series & Color Options",
        step3_title: "3. Dimensions & Constraint Validation (Inches)",
        step4_title: "4. Mount & Control Mechanism Options",
        step5_title: "5. Motor & Smart Accessories Upgrade",
        step6_title: "6. Room Location & Quantity",
        add_item_btn: "➕ Add Item to Quote",
        preview_title: "📄 Quotation Sheet Preview",
        btn_export_excel: "📊 Export Excel Quote (.xlsx)",
        btn_print_pdf: "🖨️ Print / Export Single-Page PDF"
      }
    };

    function applyLanguage(lang) {
      romanCurrentLang = lang;
      const btnCn = document.getElementById('lang-cn-btn');
      const btnEn = document.getElementById('lang-en-btn');
      if (btnCn && btnEn) {
        if (lang === 'cn') {
          btnCn.classList.add('active');
          btnEn.classList.remove('active');
        } else {
          btnEn.classList.add('active');
          btnCn.classList.remove('active');
        }
      }

      // Update all data-i18n elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nDict[lang] && i18nDict[lang][key]) {
          el.textContent = i18nDict[lang][key];
        }
      });

      renderSystemCards();
      renderFabricCategoryTabs();
      renderFabricCards();
      calculateLiveItemPrice();
      renderQuoteItemsTable();
    }

    // Language Switcher Toggle
    const btnCn = document.getElementById('lang-cn-btn');
    const btnEn = document.getElementById('lang-en-btn');
    if (btnCn && btnEn) {
      btnCn.addEventListener('click', () => applyLanguage('cn'));
      btnEn.addEventListener('click', () => applyLanguage('en'));
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
        const discText = elDiscountBadge ? elDiscountBadge.textContent : '50% OFF';

        // Prepare Excel Data Matrix
        let data = [
          ['BRAUN INTERNATIONAL LLC', '', '', '', 'QUOTATION / 窗帘定制报价单'],
          ['SUN SHADES & SUN BLINDS - CUSTOM WINDOW TREATMENTS', '', '', '', 'Date / 日期: ' + dateStr],
          ['2115 S Hellman Ave # E, Ontario, CA 91761 | Email: sales@braunblinds.com', '', '', '', 'Quote No / 报价单号: ' + quoteNo],
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

    // --- Export / Print PDF Handler (100% Non-Blank Single Page PDF Exporter) ---
    function exportProformaPdf() {
      const paper = document.getElementById('william-quote-paper');
      if (!paper) return;

      // Create or reuse clean printing iframe
      let iframe = document.getElementById('pdf-print-iframe');
      if (iframe) iframe.remove();

      iframe = document.createElement('iframe');
      iframe.id = 'pdf-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PROFORMA INVOICE FORM</title>
          <style>
            @page { size: letter portrait; margin: 0.3in; }
            * { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; }
            body { margin: 0; padding: 0; background: #ffffff; color: #1e293b; }
            .no-print { display: none !important; }
            .proforma-invoice-paper { width: 100%; background: #ffffff; padding: 0; border: none; box-shadow: none; }
            .proforma-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4px; }
            .proforma-company-name { font-size: 20px; font-weight: 800; color: #A83B24; margin: 0; }
            .proforma-form-title { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; }
            .proforma-divider-line { height: 3px; background-color: #A83B24; margin-bottom: 10px; }
            .proforma-meta-grid { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; line-height: 1.6; }
            .meta-col { width: 48%; }
            .proforma-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
            .proforma-table th { background-color: #A83B24; color: #ffffff; font-weight: 700; padding: 6px 8px; text-align: left; border: 1px solid #A83B24; }
            .proforma-table td { padding: 6px 8px; border: 1px solid #cbd5e1; color: #0f172a; }
            .table-sys-img { width: 45px; height: 35px; object-fit: cover; border-radius: 3px; border: 1px solid #cbd5e1; }
            .proforma-summary-wrap { display: flex; justify-content: flex-end; margin-bottom: 10px; }
            .proforma-totals-table { width: 280px; border-collapse: collapse; font-size: 12px; }
            .proforma-totals-table td { padding: 5px 10px; border: 1px solid #cbd5e1; }
            .proforma-totals-table .tot-label { font-weight: 600; background-color: #f8fafc; }
            .proforma-totals-table .tot-val { text-align: right; font-weight: 700; }
            .proforma-totals-table .grand-total-row td { background-color: #A83B24; color: #ffffff; font-weight: 800; font-size: 13px; }
            .proforma-terms-box { margin-top: 8px; font-size: 10px; color: #334155; line-height: 1.4; border-top: 1px solid #e2e8f0; padding-top: 6px; }
            .terms-title { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
            .terms-list { padding-left: 16px; margin: 0; }
            .proforma-signature-grid { display: flex; justify-content: space-between; margin-top: 20px; }
            .sig-col { width: 45%; }
            .sig-line { border-bottom: 1px solid #475569; margin-bottom: 4px; }
            .sig-label { font-size: 10px; color: #475569; }
          </style>
        </head>
        <body>
          ${paper.outerHTML}
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 300);
    }

    if (btnPrintPdf) {
      btnPrintPdf.addEventListener('click', exportProformaPdf);
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

    // --- Interactive Date Manager (Auto & Manual Adjustment) ---
    function initDateManager() {
      if (!elQuoteDate) return;

      const elSigDate = document.getElementById('sheet-sig-date-input');
      const elApprovalDate = document.getElementById('sheet-approval-date-input');
      const todayStr = new Date().toISOString().split('T')[0];

      // Auto-set today's date if empty
      if (!elQuoteDate.value) elQuoteDate.value = todayStr;
      if (elSigDate && !elSigDate.value) elSigDate.value = todayStr;
      if (elApprovalDate && !elApprovalDate.value) elApprovalDate.value = todayStr;

      function syncDates(dateVal) {
        syncCustomerMeta();
        if (elSigDate && elSigDate.dataset.manual !== 'true') elSigDate.value = dateVal;
        if (elApprovalDate && elApprovalDate.dataset.manual !== 'true') elApprovalDate.value = dateVal;
      }

      if (elSigDate) elSigDate.addEventListener('input', () => { elSigDate.dataset.manual = 'true'; });
      if (elApprovalDate) elApprovalDate.addEventListener('input', () => { elApprovalDate.dataset.manual = 'true'; });

      if (!elQuoteDate) return;
      syncDates(elQuoteDate.value);

      const datePresetBtns = document.querySelectorAll('#date-presets-quick .date-btn');
      datePresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          datePresetBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const addDays = parseInt(btn.getAttribute('data-days'), 10) || 0;
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + addDays);

          const formatted = targetDate.toISOString().split('T')[0];
          if (elQuoteDate) elQuoteDate.value = formatted;
          syncDates(formatted);
        });
      });

      if (elQuoteDate) {
        elQuoteDate.addEventListener('change', () => {
          syncDates(elQuoteDate.value);
        });
      }
    }

    // --- Interactive Digital Signature Canvas Pad inside Invoice ---
    function initSignaturePad() {
      const canvas = document.getElementById('invoice-sig-canvas');
      const btnClearInvoice = document.getElementById('btn-clear-sig-invoice');
      const sheetContainer = document.getElementById('sheet-sig-img-container');

      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#A83B24';

      let isDrawing = false;
      let hasDrawn = false;

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      }

      function updateRenderedSig() {
        if (!hasDrawn) return;
        const sigDataUrl = canvas.toDataURL('image/png');
        if (sheetContainer) {
          sheetContainer.innerHTML = `<img src="${sigDataUrl}" alt="Customer Signature" style="max-height: 42px; max-width: 180px; object-fit: contain;">`;
        }
      }

      function startDraw(e) {
        isDrawing = true;
        hasDrawn = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        e.preventDefault();
      }

      function draw(e) {
        if (!isDrawing) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        e.preventDefault();
      }

      function stopDraw(e) {
        if (isDrawing) {
          ctx.closePath();
          isDrawing = false;
          updateRenderedSig();
        }
      }

      // Mouse events
      canvas.addEventListener('mousedown', startDraw);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDraw);
      canvas.addEventListener('mouseleave', stopDraw);

      // Touch Listeners (Mobile & iPad)
      canvas.addEventListener('touchstart', startDraw);
      canvas.addEventListener('touchmove', draw);
      canvas.addEventListener('touchend', stopDraw);

      // Clear Handler
      function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn = false;
        if (sheetContainer) sheetContainer.innerHTML = '';
      }

      if (btnClearInvoice) btnClearInvoice.addEventListener('click', clearCanvas);
    }

    // Auto Hash Router for Braun-Z-1.2, Braun-Z-1.1 & Braun-Z-1.0
    function checkHashRoute() {
      const hash = window.location.hash.toLowerCase();
      const href = window.location.href.toLowerCase();
      if (hash.includes('braun-z') || hash.includes('zhenpin-roman') || hash.includes('z-roman')) {
        document.title = 'Braun-Z-1.3 | Z系列罗马帘与竹帘窗饰定制报价系统';
        const sysElem = document.getElementById('Braun-Z-1-2') || document.getElementById('Braun-Z-1-1') || document.getElementById('Braun-Z-1.0') || document.getElementById('calculator');
        if (sysElem) {
          setTimeout(() => {
            sysElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
    }

    // --- Window Measurement & Design Proposal System (窗户测量与设计方案生成器) ---
    function initDesignProposalSystem() {
      const inputItemPicker = document.getElementById('prop-item-picker');
      const inputTemplate = document.getElementById('prop-template-select');
      const inputFrameTheme = document.getElementById('prop-frame-theme');
      const inputTitle = document.getElementById('prop-input-title');
      const inputCount = document.getElementById('prop-input-count');
      const inputSchemeTitle = document.getElementById('prop-input-scheme-title');

      const inputW1 = document.getElementById('prop-w1');
      const inputW2 = document.getElementById('prop-w2');
      const inputW3 = document.getElementById('prop-w3');
      const inputW4 = document.getElementById('prop-w4');

      const inputH1 = document.getElementById('prop-h1');
      const inputH2 = document.getElementById('prop-h2');
      const inputH3 = document.getElementById('prop-h3');
      const inputH4 = document.getElementById('prop-h4');

      const groupW2 = document.getElementById('prop-w2-group');
      const groupW3 = document.getElementById('prop-w3-group');
      const groupW4 = document.getElementById('prop-w4-group');
      const groupH2 = document.getElementById('prop-h2-group');
      const groupH3 = document.getElementById('prop-h3-group');
      const groupH4 = document.getElementById('prop-h4-group');

      const inputModel = document.getElementById('prop-input-model');
      const inputColor = document.getElementById('prop-input-color');
      const cardPaper = document.getElementById('proposal-card-paper');

      const renderTitle = document.getElementById('card-render-title');
      const renderSchemeTitle = document.getElementById('card-render-scheme-title');
      const renderModel = document.getElementById('card-render-model');
      const renderBulletsContainer = document.getElementById('card-render-bullets');
      const renderDiagramContainer = document.getElementById('card-diagram-container');
      const renderSwatchImg = document.getElementById('card-render-swatch-img');
      const renderSwatchDesc = document.getElementById('card-render-swatch-desc');
      const renderProdImg = document.getElementById('card-render-prod-img');
      const btnExportProposalPdf = document.getElementById('btn-export-proposal-pdf');

      if (!inputTitle || !renderDiagramContainer) return;

      // Populate Quote Items Dropdown
      window.populateProposalItemPicker = function() {
        if (!inputItemPicker) return;
        const currentVal = inputItemPicker.value || 'live';
        let html = `<option value="live" ${currentVal === 'live' ? 'selected' : ''}>✨ 当前实时配置产品 (Current Live Configurator Product)</option>`;
        
        romanQuoteItems.forEach((item, idx) => {
          const roomTag = item.room ? `[${item.room}] ` : '';
          const sysName = item.sys.name_cn || item.sys.code;
          const fabName = `${item.fab.series_cn} (${item.fab.color_cn})`;
          const isSel = currentVal === String(idx) ? 'selected' : '';
          html += `<option value="${idx}" ${isSel}>Item #${idx + 1}: ${roomTag}${sysName} • ${fabName}</option>`;
        });
        inputItemPicker.innerHTML = html;
      };

      // Populate Model & Color Dropdowns with all Systems & Fabrics
      function populateModelAndColorOptions() {
        if (inputModel) {
          const currentModel = inputModel.value;
          let sysHtml = '';
          ROMAN_DB.SYSTEMS.forEach(sys => {
            const label = `${sys.name_cn} (${sys.code})`;
            const isSel = currentModel === label ? 'selected' : '';
            sysHtml += `<option value="${label}" data-code="${sys.code}" ${isSel}>${label}</option>`;
          });
          inputModel.innerHTML = sysHtml;
        }

        if (inputColor) {
          const currentColor = inputColor.value;
          let fabHtml = '';
          ROMAN_DB.FABRICS.forEach(fab => {
            const label = `颜色：${fab.series_cn} / ${fab.color_cn} (${fab.code})`;
            const isSel = currentColor === label ? 'selected' : '';
            fabHtml += `<option value="${label}" data-code="${fab.code}" ${isSel}>${label}</option>`;
          });
          inputColor.innerHTML = fabHtml;
        }
      }

      // Frame Border Color Mapping
      function getFrameBorderColor(theme) {
        if (theme === 'gold') return '#C5A059';
        if (theme === 'white') return '#E2E8F0';
        if (theme === 'wood') return '#8C6D58';
        return '#1E293B'; // Default black
      }

      // 1. Render Window Diagrams with Individual Height Labels for EVERY Window
      function renderDiagram() {
        const countVal = inputCount.value || '3';
        const frameTheme = inputFrameTheme ? inputFrameTheme.value : 'black';
        const borderColor = getFrameBorderColor(frameTheme);

        const w1 = inputW1 ? inputW1.value || '30.5"' : '30.5"';
        const w2 = inputW2 ? inputW2.value || '40.5"' : '40.5"';
        const w3 = inputW3 ? inputW3.value || '34.5"' : '34.5"';
        const w4 = inputW4 ? inputW4.value || '32.0"' : '32.0"';

        const h1 = inputH1 ? inputH1.value || '70.5"' : '70.5"';
        const h2 = inputH2 ? inputH2.value || h1 : h1;
        const h3 = inputH3 ? inputH3.value || h1 : h1;
        const h4 = inputH4 ? inputH4.value || h1 : h1;

        if (groupW2) groupW2.style.display = (countVal !== '1') ? 'block' : 'none';
        if (groupH2) groupH2.style.display = (countVal !== '1') ? 'block' : 'none';
        if (groupW3) groupW3.style.display = (countVal === '3' || countVal === '4') ? 'block' : 'none';
        if (groupH3) groupH3.style.display = (countVal === '3' || countVal === '4') ? 'block' : 'none';
        if (groupW4) groupW4.style.display = (countVal === '4') ? 'block' : 'none';
        if (groupH4) groupH4.style.display = (countVal === '4') ? 'block' : 'none';

        let html = '';
        if (countVal === '1') {
          html = `
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w1} ─┤</div>
              <div class="window-frame-graphic" style="border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h1}</span>
              </div>
            </div>
          `;
        } else if (countVal === '2') {
          html = `
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w1} ─┤</div>
              <div class="window-frame-graphic" style="border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h1}</span>
              </div>
            </div>
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w2} ─┤</div>
              <div class="window-frame-graphic" style="border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h2}</span>
              </div>
            </div>
          `;
        } else if (countVal === '4') {
          html = `
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w1} ─┤</div>
              <div class="window-frame-graphic" style="width: 80px; border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h1}</span>
              </div>
            </div>
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w2} ─┤</div>
              <div class="window-frame-graphic" style="width: 80px; border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h2}</span>
              </div>
            </div>
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w3} ─┤</div>
              <div class="window-frame-graphic" style="width: 80px; border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h3}</span>
              </div>
            </div>
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w4} ─┤</div>
              <div class="window-frame-graphic" style="width: 80px; border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h4}</span>
              </div>
            </div>
          `;
        } else if (countVal === 'stacked') {
          html = `
            <div class="stacked-windows-wrap" style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
              <div class="window-diagram-box">
                <div class="dim-top-label">上层高窗 ├─ ${w1} ─┤</div>
                <div class="window-frame-graphic" style="height: 65px; border-color: ${borderColor};">
                  <div class="window-shade-canvas" style="height: 80%;"></div>
                </div>
                <div class="dim-side-label">
                  <div class="dim-v-line"></div>
                  <span class="dim-v-text">${h1}</span>
                </div>
              </div>
              <div class="window-diagram-box">
                <div class="dim-top-label">下层大窗 ├─ ${w2} ─┤</div>
                <div class="window-frame-graphic" style="height: 120px; border-color: ${borderColor};">
                  <div class="window-shade-canvas" style="height: 60%;"></div>
                </div>
                <div class="dim-side-label">
                  <div class="dim-v-line"></div>
                  <span class="dim-v-text">${h2}</span>
                </div>
              </div>
            </div>
          `;
        } else {
          // Default 3 Windows with vertical dimension lines & height text
          html = `
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w1} ─┤</div>
              <div class="window-frame-graphic" style="border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h1}</span>
              </div>
            </div>
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w2} ─┤</div>
              <div class="window-frame-graphic" style="border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h2}</span>
              </div>
            </div>
            <div class="window-diagram-box">
              <div class="dim-top-label">├─ ${w3} ─┤</div>
              <div class="window-frame-graphic" style="border-color: ${borderColor};">
                <div class="window-shade-canvas"></div>
              </div>
              <div class="dim-side-label">
                <div class="dim-v-line"></div>
                <span class="dim-v-text">${h3}</span>
              </div>
            </div>
          `;
        }
        renderDiagramContainer.innerHTML = html;
      }

      // 2. Sync Card Content from Inputs & Item Picker
      function syncProposalCard() {
        if (cardPaper && inputTemplate) {
          cardPaper.className = `proposal-card-paper theme-${inputTemplate.value}`;
        }

        let sys = null;
        let fab = null;
        let roomName = '';

        const selectedIdx = inputItemPicker ? inputItemPicker.value : 'live';
        if (selectedIdx !== 'live' && romanQuoteItems[parseInt(selectedIdx, 10)]) {
          const item = romanQuoteItems[parseInt(selectedIdx, 10)];
          sys = item.sys;
          fab = item.fab;
          roomName = item.room || '';
        } else {
          // Check dropdown selected model or live system
          if (inputModel && inputModel.options[inputModel.selectedIndex]) {
            const code = inputModel.options[inputModel.selectedIndex].getAttribute('data-code');
            sys = ROMAN_DB.SYSTEMS.find(s => s.code === code) || ROMAN_DB.SYSTEMS.find(s => s.code === romanSelectedSysCode);
          } else {
            sys = ROMAN_DB.SYSTEMS.find(s => s.code === romanSelectedSysCode);
          }

          if (inputColor && inputColor.options[inputColor.selectedIndex]) {
            const code = inputColor.options[inputColor.selectedIndex].getAttribute('data-code');
            fab = ROMAN_DB.FABRICS.find(f => f.code === code) || ROMAN_DB.FABRICS.find(f => f.code === romanSelectedFabCode);
          } else {
            fab = ROMAN_DB.FABRICS.find(f => f.code === romanSelectedFabCode);
          }
        }

        // Sync Model & Color Select dropdowns if quote item picked
        if (selectedIdx !== 'live' && sys && fab) {
          const targetModelVal = `${sys.name_cn} (${sys.code})`;
          const targetColorVal = `颜色：${fab.series_cn} / ${fab.color_cn} (${fab.code})`;
          if (inputModel) inputModel.value = targetModelVal;
          if (inputColor) inputColor.value = targetColorVal;
        }

        if (renderTitle) renderTitle.textContent = inputTitle.value;
        if (renderSchemeTitle) renderSchemeTitle.textContent = inputSchemeTitle.value;
        if (renderModel && inputModel) renderModel.textContent = inputModel.value;

        // Render Checkbox Bullets
        if (renderBulletsContainer) {
          const checkedItems = Array.from(document.querySelectorAll('.prop-feat-chk:checked')).map(chk => chk.value);
          let bulletsHtml = checkedItems.map(item => `<div class="scheme-bullet-item">✓ ${item}</div>`).join('');
          if (inputColor && inputColor.value) {
            bulletsHtml += `<div class="scheme-bullet-item" style="font-weight: 700; color: #A83B24;">✓ ${inputColor.value}</div>`;
          }
          renderBulletsContainer.innerHTML = bulletsHtml;
        }

        // Auto Switch Right Images based on selected sys & fab
        if (sys && renderProdImg) {
          renderProdImg.src = sys.image_url || 'system_images/our_collections/collection_roller_2026_thumb.jpg';
        }
        if (fab && renderSwatchImg) {
          renderSwatchImg.src = fab.image_url || 'system_images/guides/fabric_swatches_card_p1.png';
          if (renderSwatchDesc) renderSwatchDesc.textContent = `${fab.series_cn}（${fab.color_cn}）`;
        }

        renderDiagram();
      }

      window.syncProposalFromBuilder = syncProposalCard;

      if (inputModel) inputModel.addEventListener('input', () => { inputModel.dataset.manual = 'true'; });
      if (inputColor) inputColor.addEventListener('input', () => { inputColor.dataset.manual = 'true'; });

      // 3. Attach Live Input Listeners
      [inputItemPicker, inputTemplate, inputFrameTheme, inputTitle, inputCount, inputSchemeTitle, inputW1, inputW2, inputW3, inputW4, inputH1, inputH2, inputH3, inputH4, inputModel, inputColor].forEach(el => {
        if (el) {
          el.addEventListener('input', syncProposalCard);
          el.addEventListener('change', syncProposalCard);
        }
      });

      document.querySelectorAll('.prop-feat-chk').forEach(chk => {
        chk.addEventListener('change', syncProposalCard);
      });

      // 4. Export Proposal Card to Single-Page PDF
      if (btnExportProposalPdf) {
        btnExportProposalPdf.addEventListener('click', () => {
          if (!cardPaper) return;

          let iframe = document.getElementById('pdf-print-iframe');
          if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'pdf-print-iframe';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
          }

          const doc = iframe.contentWindow.document;
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Window Measurement & Treatment Design Scheme</title>
              <style>
                @page { size: letter portrait; margin: 0.4in; }
                * { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; }
                body { margin: 0; padding: 0; background: #ffffff; display: flex; justify-content: center; align-items: center; }
                .proposal-card-paper { width: 100%; max-width: 650px; background: #FAF6F0; border-radius: 16px; padding: 1.5rem 1.75rem; border: 1px solid #EAE2D8; color: #1E293B; }
                .proposal-card-paper.theme-terracotta { background: #FFFDF9; border: 2px solid #A83B24; }
                .proposal-card-paper.theme-terracotta .proposal-top-header { background: #A83B24; color: #FFFFFF; padding: 0.75rem 1rem; border-radius: 12px 12px 0 0; margin: -1.5rem -1.75rem 1rem -1.75rem; }
                .proposal-card-paper.theme-terracotta .proposal-top-title { color: #FFFFFF; }
                .proposal-card-paper.theme-dark { background: #1E293B; border-color: #334155; color: #F8FAFC; }
                .proposal-card-paper.theme-dark .proposal-top-title, .proposal-card-paper.theme-dark .scheme-card-title, .proposal-card-paper.theme-dark .dim-top-label, .proposal-card-paper.theme-dark .dim-side-label { color: #F8FAFC; }
                .proposal-card-paper.theme-dark .proposal-diagram-area, .proposal-card-paper.theme-dark .proposal-scheme-card { background: #0F172A; border-color: #334155; }
                .proposal-card-paper.theme-dark .scheme-card-subtitle, .proposal-card-paper.theme-dark .scheme-bullet-item { color: #CBD5E1; }
                .proposal-card-paper.theme-wood { background: #FDFBF7; border: 2px solid #8C6D58; }
                .proposal-card-paper.theme-wood .proposal-top-title { color: #5C4033; }
                .proposal-top-header { border-bottom: 2px solid #E5DCD0; padding-bottom: 0.6rem; margin-bottom: 1rem; }
                .proposal-top-title { font-size: 1.25rem; font-weight: 800; color: #0F172A; margin: 0; }
                .proposal-diagram-area { display: flex; justify-content: center; align-items: flex-end; gap: 1.25rem; padding: 1.25rem 0.5rem; background: #FAF6F0; border-radius: 12px; margin-bottom: 1.25rem; }
                .window-diagram-box { display: flex; flex-direction: column; align-items: center; position: relative; }
                .dim-top-label { font-size: 0.85rem; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
                .window-frame-graphic { position: relative; width: 110px; height: 160px; border: 4px solid #1E293B; border-radius: 3px; background: linear-gradient(to bottom, #dbeafe, #eff6ff); overflow: hidden; }
                .window-shade-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 65%; background: linear-gradient(135deg, #f5f5f4, #e7e5e4); border-bottom: 3px solid #d6d3d1; }
                .dim-side-label { position: absolute; right: -36px; top: 24px; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; color: #0F172A; white-space: nowrap; }
                .dim-v-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 1.5px; background-color: #0F172A; transform: translateX(-50%); }
                .dim-v-line::before { content: ''; position: absolute; top: 0; left: -3px; width: 7.5px; height: 1.5px; background-color: #0F172A; }
                .dim-v-line::after { content: ''; position: absolute; bottom: 0; left: -3px; width: 7.5px; height: 1.5px; background-color: #0F172A; }
                .dim-v-text { position: relative; background: #FAF6F0; padding: 1px 3px; border-radius: 3px; z-index: 2; font-size: 0.72rem; font-weight: 800; color: #0F172A; }
                .proposal-scheme-card { background: #FFFFFF; border-radius: 14px; padding: 1.25rem 1.35rem; border: 1px solid #EAE2D8; }
                .scheme-card-title { font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0 0 0.4rem 0; }
                .scheme-card-subtitle { font-size: 0.95rem; font-weight: 700; color: #334155; margin-bottom: 0.75rem; }
                .scheme-bullets-grid { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
                .scheme-bullet-item { font-size: 0.85rem; color: #334155; font-weight: 600; }
                .scheme-images-flex { display: flex; gap: 1rem; margin-top: 1rem; }
                .scheme-swatch-box { display: flex; flex-direction: column; align-items: center; }
                .scheme-swatch-img { width: 100%; height: 110px; object-fit: cover; border-radius: 8px; border: 1px solid #E2E8F0; }
                .scheme-swatch-desc { font-size: 0.75rem; font-weight: 600; color: #475569; margin-top: 4px; text-align: center; }
              </style>
            </head>
            <body>
              ${cardPaper.outerHTML}
            </body>
            </html>
          `);
          doc.close();

          setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }, 300);
        });
      }

      populateModelAndColorOptions();
      window.populateProposalItemPicker();
      syncProposalCard();
    }

    // --- Generate and Download Official Interactive Measurement & Order Form Template (.xlsx) ---
    function generateAndDownloadMeasurementTemplate() {
      if (typeof XLSX === 'undefined') {
        alert('Excel 引擎正在加载中，请稍候再试。');
        return;
      }

      const rows = [
        ["Braun Blinds 窗饰定制测量与自动算价表格 (Window Measurement & Interactive Order Form)"],
        ["说明：在上方填写客户与项目信息，在下方填入窗户宽度(W)、高度(H)、选购面料及折扣率(如 0.30 表示3折，0.40 表示4折)，表格将通过内置公式自动计算出厂价、折后单价与订单总金额！填写后可保存并上传至网站自动生成 Invoice！"],
        [""],
        ["客户姓名 (Customer Name):", "张先生 (Mr. Zhang)", "", "联系电话 (Phone):", "+1 (408) 555-8899"],
        ["项目地址 (Project Address):", "1280 Willow Rd, Palo Alto, CA 94301", "", "电子邮箱 (Email):", "zhang.paloalto@gmail.com"],
        ["测量日期 (Date):", "2026-08-17", "", "报价单号 (Quote No):", "S-51003"],
        [""],
        [
          "序号 (#)",
          "房间/位置 (Room Location)",
          "宽度 W (Inch)",
          "高度 H (Inch)",
          "窗框深 Depth (Inch)",
          "安装方式 (Mount)",
          "机构型号 (System Model)",
          "面料编码 (Fabric Code)",
          "面料出厂裸价 (RMB ¥/㎡)",
          "MSRP原单价 ($)",
          "折扣率 (Discount Factor)",
          "折后单价 ($/件)",
          "数量 (Qty)",
          "行小计金额 ($)",
          "特殊要求/制作备注 (Notes)"
        ]
      ];

      // Sample Items
      const sampleItems = [
        { num: 1, room: "Master Bedroom (主卧 #1)", w: 36, h: 60, depth: 2.5, mount: "Inside Mount (框内)", sys: "LM0002 方形无绳", fab: "BZM11 众麻-遮光深灰", baseRmb: 163, msrp: 466, discount: 0.30, qty: 1, notes: "默认 38管 配大方包布" },
        { num: 2, room: "Living Room (客厅侧窗)", w: 48, h: 72, depth: 3.0, mount: "Inside Mount (框内)", sys: "lM0022 魔方双层日夜帘", fab: "BZL01 天然竹编 原木竹帘", baseRmb: 163, msrp: 748, discount: 0.30, qty: 1, notes: "日夜遮光/采光自由切换" },
        { num: 3, room: "Dining Room (餐厅大窗)", w: 68, h: 84, depth: 2.0, mount: "Outside Mount (框外)", sys: "JL0024 奥科电动精做卷帘", fab: "BTW01 涂纹-遮光白色", baseRmb: 175, msrp: 1577, discount: 0.30, qty: 1, notes: "配 AC520-02 遥控器，框外左右加2\"" },
        { num: 4, room: "Guest Bedroom (客卧)", w: 42, h: 54, depth: 2.0, mount: "Inside Mount (框内)", sys: "BM0010 魔方帷幔斑马帘", fab: "BSL0001 斑马帘-遮光白", baseRmb: 175, msrp: 490, discount: 0.30, qty: 2, notes: "魔方包布帷幔款式" }
      ];

      sampleItems.forEach((item, i) => {
        const rIdx = 9 + i; // 1-based Excel row number
        rows.push([
          item.num,
          item.room,
          item.w,
          item.h,
          item.depth,
          item.mount,
          item.sys,
          item.fab,
          item.baseRmb,
          item.msrp,
          item.discount,
          { f: `ROUND(J${rIdx}*K${rIdx}, 2)`, v: Math.round(item.msrp * item.discount * 100) / 100 },
          item.qty,
          { f: `ROUND(L${rIdx}*M${rIdx}, 2)`, v: Math.round(item.msrp * item.discount * item.qty * 100) / 100 },
          item.notes
        ]);
      });

      // Add empty rows with live Excel formulas for customer entry (rows 13 to 23)
      for (let i = 5; i <= 15; i++) {
        const rIdx = 8 + i;
        rows.push([
          i,
          "",
          "",
          "",
          "",
          "Inside Mount (框内)",
          "LM0002 方形无绳",
          "BZL01 经典原木竹帘",
          163,
          { f: `IF(OR(ISBLANK(C${rIdx}),ISBLANK(D${rIdx})), 0, ROUND(MAX(C${rIdx}*D${rIdx}/1550, 1.0) * I${rIdx} * 2.86, 2))`, v: 0 },
          0.30, // Default 3折
          { f: `ROUND(J${rIdx}*K${rIdx}, 2)`, v: 0 },
          1,
          { f: `ROUND(L${rIdx}*M${rIdx}, 2)`, v: 0 },
          ""
        ]);
      }

      // Grand Total Summary Row
      const startRow = 9;
      const endRow = 23;
      rows.push([
        "合计",
        "订单汇总",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        { f: `SUM(J${startRow}:J${endRow})`, v: 3281 },
        "",
        "",
        { f: `SUM(M${startRow}:M${endRow})`, v: 5 },
        { f: `SUM(N${startRow}:N${endRow})`, v: 1131.30 },
        "总出厂折扣与运费另计"
      ]);

      const ws = XLSX.utils.aoa_to_sheet(rows);

      ws['!cols'] = [
        { wch: 8 },  // #
        { wch: 28 }, // Room
        { wch: 14 }, // W
        { wch: 14 }, // H
        { wch: 18 }, // Depth
        { wch: 22 }, // Mount
        { wch: 26 }, // System
        { wch: 26 }, // Fabric
        { wch: 22 }, // RMB Rate
        { wch: 18 }, // MSRP Price
        { wch: 22 }, // Discount Factor
        { wch: 18 }, // Final Unit Price
        { wch: 10 }, // Qty
        { wch: 18 }, // Line Amount
        { wch: 38 }  // Notes
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "自动算价测量表");

      const guideRows = [
        ["Braun Blinds Z系列自动算价测量表使用说明 (Guide & Formulas)"],
        ["1. 填写尺寸：输入宽度 W (Inch) 和高度 H (Inch)，表格公式将自动根据底层比率算得 MSRP 原单价 ($)。"],
        ["2. 填写折扣：在【折扣率 (Discount Factor)】列直接输入折扣数。例如 0.30 表示 3折 (30% MSRP)，0.40 表示 4折，0.50 表示 5折，1.00 表示 原价。"],
        ["3. 自动计算：【折后单价】与【行小计金额】及底部【订单总金额】均由 Excel 内置公式自动实时计算！"],
        ["4. 上传网站：填完尺寸与折扣后，将 Excel 文件保存并在 Braun 网站点击【📂 导入并智能识别客户文件】，网页将自动解析并生成完美 Invoice 报价单与 PDF 文件！"]
      ];
      const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
      wsGuide['!cols'] = [{ wch: 110 }];
      XLSX.utils.book_append_sheet(wb, wsGuide, "算价指南与规则说明");

      XLSX.writeFile(wb, "Braun_Blinds_Interactive_Measurement_Quotation_Form.xlsx");
    }

    function initCustomFileImporter() {
      const customFileInput = document.getElementById('custom-excel-file-input');
      const btnUploadExcel = document.getElementById('btn-upload-customer-excel');
      const btnDownloadTemplate = document.getElementById('btn-download-measurement-template');

      if (btnDownloadTemplate) {
        btnDownloadTemplate.addEventListener('click', generateAndDownloadMeasurementTemplate);
      }

      if (!customFileInput || !btnUploadExcel) return;

      btnUploadExcel.addEventListener('click', () => {
        customFileInput.click();
      });

      customFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
          const fileName = file.name.toLowerCase();

          if (file.type.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.webp') || fileName.endsWith('.heic')) {
            const reader = new FileReader();
            reader.onload = function(evt) {
              const att = {
                id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                name: file.name,
                type: 'image',
                size: formatFileSize(file.size),
                dataUrl: evt.target.result
              };
              currentCustomerAttachments.push(att);
              renderCustomerAttachments();
              autoSaveActiveCustomerMeta();

              alert(`🔍 已成功识别并导入现场测绘图片【${file.name}】！\n图片已自动绑定保存至客户档案附件库，并开启测绘画面数据分析。`);
            };
            reader.readAsDataURL(file);
          } else if (fileName.endsWith('.pdf')) {
            const reader = new FileReader();
            reader.onload = function(evt) {
              const att = {
                id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                name: file.name,
                type: 'pdf',
                size: formatFileSize(file.size),
                dataUrl: evt.target.result
              };
              currentCustomerAttachments.push(att);
              renderCustomerAttachments();
              autoSaveActiveCustomerMeta();

              alert(`📄 已成功识别并导入 PDF 图纸合同【${file.name}】！\nPDF 已自动关联保存至客户档案中。`);
            };
            reader.readAsDataURL(file);
          } else {
            const reader = new FileReader();
            reader.onload = function(evt) {
              try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                  alert('无法读取表格内容，请确认文件格式为 Excel (.xlsx/.xls) 或 CSV。');
                  return;
                }

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

                if (!rawRows || rawRows.length === 0) {
                  alert('读取到的表格内容为空！');
                  return;
                }

                const dataUrlReader = new FileReader();
                dataUrlReader.onload = function(dEvt) {
                  currentCustomerAttachments.push({
                    id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                    name: file.name,
                    type: 'excel',
                    size: formatFileSize(file.size),
                    dataUrl: dEvt.target.result
                  });
                  renderCustomerAttachments();
                  autoSaveActiveCustomerMeta();
                };
                dataUrlReader.readAsDataURL(file);

                parseAndImportExcelRows(rawRows, file.name);
              } catch (err) {
                console.error('Error reading custom file:', err);
                alert('读取表格文件出错: ' + err.message);
              }
            };
            reader.readAsArrayBuffer(file);
          }
        });

        customFileInput.value = '';
      });
    }

    function parseAndImportExcelRows(rawRows, fileName) {
      const defaultSys = ROMAN_DB.SYSTEMS[0];
      const defaultFab = ROMAN_DB.FABRICS[0];
      const sheerSys = ROMAN_DB.SYSTEMS.find(s => s.category === 'sheer') || defaultSys;
      const dualSys = ROMAN_DB.SYSTEMS.find(s => s.code === 'lM0022') || defaultSys;
      const singleSys = ROMAN_DB.SYSTEMS.find(s => s.code === 'LM0002') || defaultSys;
      const trackSys = ROMAN_DB.SYSTEMS.find(s => s.code === 'LM0024') || defaultSys;
      const rollerSys = ROMAN_DB.SYSTEMS.find(s => s.category === 'roller') || defaultSys;

      // Extract Header Customer Info if present
      for (let i = 0; i < Math.min(12, rawRows.length); i++) {
        const row = rawRows[i];
        if (!Array.isArray(row)) continue;
        for (let colI = 0; colI < row.length; colI++) {
          const cellVal = String(row[colI] || '').trim();
          if (cellVal.includes('客户姓名') || cellVal.includes('Customer Name')) {
            const nameVal = String(row[colI + 1] || '').trim();
            if (nameVal && elCustName) elCustName.value = nameVal;
          }
          if (cellVal.includes('联系电话') || cellVal.includes('Phone')) {
            const phoneVal = String(row[colI + 1] || '').trim();
            if (phoneVal && elCustPhone) elCustPhone.value = phoneVal;
          }
          if (cellVal.includes('项目地址') || cellVal.includes('Project Address')) {
            const addrVal = String(row[colI + 1] || '').trim();
            if (addrVal && elCustAddress) elCustAddress.value = addrVal;
          }
          if (cellVal.includes('电子邮箱') || cellVal.includes('Email')) {
            const emailVal = String(row[colI + 1] || '').trim();
            if (emailVal && elCustEmail) elCustEmail.value = emailVal;
          }
          if (cellVal.includes('报价单号') || cellVal.includes('Quote No')) {
            const quoteVal = String(row[colI + 1] || '').trim();
            if (quoteVal && elQuoteNo) elQuoteNo.value = quoteVal;
          }
        }
      }

      // Smart Header Identification
      let headerIdx = -1;
      let colRoom = 0, colW = -1, colH = -1, colQty = -1, colMount = -1, colProd = -1, colRemark = -1, colDiscount = -1;

      for (let i = 0; i < Math.min(15, rawRows.length); i++) {
        const rowStr = rawRows[i].map(c => String(c).toLowerCase()).join(' ');
        if (rowStr.includes('width') || rowStr.includes('w') || rowStr.includes('宽') || rowStr.includes('height') || rowStr.includes('h') || rowStr.includes('高')) {
          headerIdx = i;
          rawRows[i].forEach((cell, colI) => {
            const cStr = String(cell).trim().toLowerCase();
            if (cStr.includes('room') || cStr.includes('位置') || cStr.includes('房间') || cStr.includes('代号') || cStr.includes('tag') || cStr.includes('no')) colRoom = colI;
            else if (cStr === 'w' || cStr.includes('width') || cStr.includes('宽')) colW = colI;
            else if (cStr === 'h' || cStr.includes('height') || cStr.includes('高')) colH = colI;
            else if (cStr.includes('qty') || cStr.includes('数量') || cStr.includes('数') || cStr.includes('pcs')) colQty = colI;
            else if (cStr.includes('mount') || cStr.includes('安装') || cStr.includes('im') || cStr.includes('om')) colMount = colI;
            else if (cStr.includes('product') || cStr.includes('类型') || cStr.includes('品名') || cStr.includes('描述') || cStr.includes('shade') || cStr.includes('帘') || cStr.includes('model') || cStr.includes('机构')) colProd = colI;
            else if (cStr.includes('discount') || cStr.includes('折扣')) colDiscount = colI;
            else if (cStr.includes('remark') || cStr.includes('备注') || cStr.includes('工艺') || cStr.includes('control') || cStr.includes('note') || cStr.includes('要求')) colRemark = colI;
          });
          break;
        }
      }

      if (colW === -1) colW = (colRoom === 1 ? 2 : 2);
      if (colH === -1) colH = colW + 1;

      const dataRows = (headerIdx !== -1) ? rawRows.slice(headerIdx + 1) : rawRows;
      const parsedItems = [];

      dataRows.forEach((row, idx) => {
        if (!row || row.length === 0) return;

        const firstCell = String(row[0] || '').trim();
        if (firstCell.includes('说明') || firstCell.includes('Note') || firstCell.includes('序号') || firstCell.includes('#') || firstCell.includes('合计')) return;

        const roomVal = String(row[colRoom] || row[1] || row[0] || `Item #${idx+1}`).trim();
        const wRaw = String(row[colW] !== undefined ? row[colW] : (row[2] !== undefined ? row[2] : 36));
        const hRaw = String(row[colH] !== undefined ? row[colH] : (row[3] !== undefined ? row[3] : 60));
        
        const wNum = parseFloat(wRaw.replace(/[^\d.]/g, '')) || 36;
        const hNum = parseFloat(hRaw.replace(/[^\d.]/g, '')) || 60;

        if (isNaN(wNum) || wNum <= 0) return;

        const qtyNum = parseInt(row[colQty] || 1, 10) || 1;
        const mountRaw = String(row[colMount] || '').toLowerCase();
        const mountVal = (mountRaw.includes('om') || mountRaw.includes('outside') || mountRaw.includes('框外')) ? 'Outside Mount (框外)' : 'Inside Mount (框内)';

        const prodRaw = String(colProd !== -1 && row[colProd] ? row[colProd] : '').trim();
        const remarkRaw = String(colRemark !== -1 && row[colRemark] ? row[colRemark] : '').trim();

        const combinedText = (prodRaw + ' ' + remarkRaw).toLowerCase();

        if (combinedText.includes('不做') || combinedText.includes('不要') || combinedText.includes('skip') || combinedText.includes('cancel')) {
          return;
        }

        let matchedSys = defaultSys;
        if (combinedText.includes('香格里拉') || combinedText.includes('sheer')) {
          matchedSys = sheerSys;
        } else if (combinedText.includes('双层') || combinedText.includes('日夜') || combinedText.includes('dual')) {
          matchedSys = dualSys;
        } else if (combinedText.includes('单层') || combinedText.includes('罗马') || combinedText.includes('roman')) {
          matchedSys = singleSys;
        } else if (combinedText.includes('卷帘') || combinedText.includes('roller')) {
          matchedSys = rollerSys;
        } else if (combinedText.includes('布艺') || combinedText.includes('窗帘') || combinedText.includes('drapery') || combinedText.includes('curtain')) {
          matchedSys = trackSys;
        }

        let motorId = 'none';
        let remoteId = 'none';
        let smartId = 'none';

        if (combinedText.includes('奥科') || combinedText.includes('a-ok') || combinedText.includes('aok')) {
          motorId = 'aok_motor_222';
        } else if (combinedText.includes('双电机') || combinedText.includes('dual motor')) {
          motorId = 'dual_motor';
        } else if (combinedText.includes('电动') || combinedText.includes('电机') || combinedText.includes('motorized') || combinedText.includes('motor')) {
          motorId = 'single_motor';
        }

        if (combinedText.includes('6通道') || combinedText.includes('调光遥控器') || combinedText.includes('precision') || combinedText.includes('6-ch')) {
          remoteId = 'remote_precision_6ch';
        } else if (combinedText.includes('15通道') || combinedText.includes('15频') || combinedText.includes('15-ch')) {
          remoteId = 'remote_15ch';
        } else if (combinedText.includes('遥控器') || combinedText.includes('单通道') || combinedText.includes('remote') || combinedText.includes('1-ch')) {
          remoteId = 'remote_1ch';
        }

        if (combinedText.includes('智能网关') || combinedText.includes('智能盒') || combinedText.includes('网关') || combinedText.includes('hub') || combinedText.includes('gateway')) {
          smartId = 'smart_hub';
        } else if (combinedText.includes('太阳能') || combinedText.includes('solar')) {
          smartId = 'solar_panel';
        }

        // Custom Per-Line Discount Extraction
        let itemDiscountFactor = romanDiscountFactor;
        if (colDiscount !== -1 && row[colDiscount] !== undefined && row[colDiscount] !== '') {
          let dVal = parseFloat(String(row[colDiscount]).replace(/[^\d.]/g, ''));
          if (!isNaN(dVal) && dVal > 0) {
            if (dVal > 1) dVal = dVal / 10;
            itemDiscountFactor = dVal;
          }
        }

        const pricing = ROMAN_DB.calculateItemPrice(
          matchedSys.code, defaultFab.code, wNum, hNum, motorId, remoteId, smartId, itemDiscountFactor, romanHardwareFloorFactor
        );

        parsedItems.push({
          id: Date.now() + idx,
          room: roomVal,
          remark: remarkRaw || prodRaw || matchedSys.name_cn,
          sys: matchedSys,
          fab: defaultFab,
          width: wNum,
          height: hNum,
          sqm: pricing.sqm,
          qty: qtyNum,
          mount: mountVal,
          control: motorId !== 'none' ? 'Motorized Remote (电动驱动)' : 'Cordless (无绳手提)',
          addons: motorId !== 'none' ? 'Motor/Remote/Smart' : '',
          msrp_unit: pricing.msrp_price,
          final_unit: pricing.final_unit_price,
          amount: Math.round(pricing.final_unit_price * qtyNum * 100) / 100
        });
      });

      if (parsedItems.length === 0) {
        alert('未在上传的 Excel 表格中识别出有效的数据明细！');
        return;
      }

      romanQuoteItems = parsedItems;
      renderQuoteItemsTable();
      autoSaveActiveCustomerMeta();
      syncCustomerMeta();

      const container = document.getElementById('quotation-sheet-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      alert(`🎉 成功识别客户测量表【${fileName}】！\n已自动提取客户基本信息，并解析录入 ${parsedItems.length} 扇窗户测绘尺寸，成功生成整套 Invoice 报价单！`);
    }

    // --- Load Customer Order Table Items (将客户表格输入到报价系统) ---
    function loadCustomerPresetOrder() {
      const defaultSys = ROMAN_DB.SYSTEMS[0];
      const defaultFab = ROMAN_DB.FABRICS[0];
      const dualSys = ROMAN_DB.SYSTEMS.find(s => s.code === 'lM0022') || defaultSys;
      const singleSys = ROMAN_DB.SYSTEMS.find(s => s.code === 'LM0002') || defaultSys;
      const sheerSys = ROMAN_DB.SYSTEMS.find(s => s.code === 'LML0012') || defaultSys;
      const trackSys = ROMAN_DB.SYSTEMS.find(s => s.code === 'LM0024') || defaultSys;

      const rawItems = [
        { room: 'K-1', w: 34, h: 52, sys: sheerSys, fab: defaultFab, type: '香格里拉 sheer shade', mount: 'Inside Mount (框内)' },
        // K-2 SD 142x90 不做
        { room: 'K-3', w: 34, h: 58, sys: sheerSys, fab: defaultFab, type: '香格里拉 sheer shade', mount: 'Inside Mount (框内)' },
        { room: 'K-4', w: 34, h: 58, sys: sheerSys, fab: defaultFab, type: '香格里拉 sheer shade', mount: 'Inside Mount (框内)' },
        { room: 'FM-1', w: 22, h: 46, sys: sheerSys, fab: defaultFab, type: '香格里拉 sheer shade', mount: 'Inside Mount (框内)' },
        { room: 'FM-2', w: 34, h: 58, sys: sheerSys, fab: defaultFab, type: '香格里拉 sheer shade', mount: 'Inside Mount (框内)' },
        { room: 'FM-3', w: 34, h: 58, sys: sheerSys, fab: defaultFab, type: '香格里拉 sheer shade', mount: 'Inside Mount (框内)' },
        { room: 'FM-4', w: 34, h: 58, sys: sheerSys, fab: defaultFab, type: '香格里拉 sheer shade', mount: 'Inside Mount (框内)' },
        { room: 'BR1-1', w: 34, h: 58, sys: sheerSys, fab: defaultFab, type: '香格里拉 sheer shade', mount: 'Inside Mount (框内)' },
        { room: 'BR1-2', w: 34, h: 58, sys: sheerSys, fab: defaultFab, type: '香格里拉 sheer shade', mount: 'Inside Mount (框内)' },
        { room: '2MB-1', w: 34, h: 58, sys: dualSys, fab: defaultFab, type: '罗马帘双层', mount: 'Inside Mount (框内)' },
        { room: '2MB-2', w: 34, h: 58, sys: dualSys, fab: defaultFab, type: '罗马帘双层', mount: 'Inside Mount (框内)' },
        { room: '2MB-3', w: 34, h: 58, sys: dualSys, fab: defaultFab, type: '罗马帘双层', mount: 'Inside Mount (框内)' },
        { room: '2MB-4', w: 34, h: 58, sys: dualSys, fab: defaultFab, type: '罗马帘双层', mount: 'Inside Mount (框内)' },
        { room: '2MBB-1', w: 34, h: 58, sys: dualSys, fab: defaultFab, type: '罗马帘双层', mount: 'Inside Mount (框内)' },
        { room: '2MBB-2', w: 34, h: 58, sys: dualSys, fab: defaultFab, type: '罗马帘双层', mount: 'Inside Mount (框内)' },
        { room: '2BR1', w: 34, h: 58, sys: singleSys, fab: defaultFab, type: '单层罗马帘', mount: 'Inside Mount (框内)' },
        { room: '2BR2', w: 133, h: 104, sys: trackSys, fab: defaultFab, type: '双层布艺窗帘', mount: 'Inside Mount (框内)', remark: 'MID' },
        { room: '2LF', w: 118, h: 104, sys: trackSys, fab: defaultFab, type: '双层布艺窗帘', mount: 'Inside Mount (框内)', remark: 'SINGLE' },
        { room: '2BR3', w: 120, h: 104, sys: trackSys, fab: defaultFab, type: '双层布艺窗帘', mount: 'Inside Mount (框内)', remark: 'SINGLE' }
      ];

      romanQuoteItems = rawItems.map((item, idx) => {
        const pricing = ROMAN_DB.calculateItemPrice(
          item.sys.code, item.fab.code, item.w, item.h, 'none', 'none', 'none', romanDiscountFactor
        );
        return {
          id: Date.now() + idx,
          room: item.room,
          remark: item.remark || item.type,
          sys: item.sys,
          fab: item.fab,
          width: item.w,
          height: item.h,
          sqm: pricing.sqm,
          qty: 1,
          mount: item.mount,
          control: 'Cordless (无绳手提)',
          addons: '',
          msrp_unit: pricing.msrp_price,
          final_unit: pricing.final_unit_price,
          amount: Math.round(pricing.final_unit_price * 1 * 100) / 100
        };
      });

      renderQuoteItemsTable();
    }

    const btnSplitHardware = document.getElementById('btn-split-hardware-lines');
    if (btnSplitHardware) {
      btnSplitHardware.addEventListener('click', () => {
        if (romanQuoteItems.length === 0) {
          alert('当前报价单明细为空，请先添加商品！');
          return;
        }

        let newItems = [];
        let splitCount = 0;
        const hwDiscount = Math.max(0.16, Math.max(romanHardwareFloorFactor, romanDiscountFactor));

        romanQuoteItems.forEach(item => {
          if (item.addons && item.addons.trim() !== '') {
            splitCount++;
            // 1. Recalculate pure shade item
            const shadePricing = ROMAN_DB.calculateItemPrice(
              item.sys.code, item.fab.code, item.width, item.height, 'none', 'none', 'none',
              item.discount_factor !== undefined ? item.discount_factor : romanDiscountFactor,
              romanHardwareFloorFactor
            );

            newItems.push({
              ...item,
              remark: item.remark ? `${item.remark.replace(/【硬件.*】/, '')} (仅帘体)` : '(仅帘体)',
              addons: '',
              msrp_unit: shadePricing.shade_msrp || shadePricing.msrp_price,
              final_unit: shadePricing.final_unit_price,
              amount: Math.round(shadePricing.final_unit_price * item.qty * 100) / 100
            });

            // 2. Itemize Motor, Remote, Smart Hub if found in text
            const addonLower = item.addons.toLowerCase();
            if (addonLower.includes('电机') || addonLower.includes('motor')) {
              const motorMsrp = 167.00;
              const motorFinal = Math.round(motorMsrp * hwDiscount * 100) / 100;
              newItems.push({
                id: Date.now() + Math.random(),
                room: item.room,
                remark: `电机 (保底${Math.round(hwDiscount * 100)}%)`,
                sys: { code: 'HW_MOTOR', sys_type: '配件 Hardware', name_cn: '167-单电动智能电机', image_url: 'system_images/sys_0116_LM0002.png' },
                fab: { code: 'MOTOR', series_cn: '智能电机', color_cn: '智能驱动电机' },
                width: item.width,
                height: item.height,
                sqm: 0,
                qty: item.qty,
                mount: item.mount,
                control: 'Motor (电动驱动)',
                sys_type_custom: '配件 Motor',
                prod_text_custom: '167-单电动智能电机',
                discount_factor: hwDiscount,
                msrp_unit: motorMsrp,
                final_unit: motorFinal,
                amount: Math.round(motorFinal * item.qty * 100) / 100
              });
            }

            if (addonLower.includes('遥控') || addonLower.includes('remote')) {
              const remoteMsrp = 33.00;
              const remoteFinal = Math.round(remoteMsrp * hwDiscount * 100) / 100;
              newItems.push({
                id: Date.now() + Math.random(),
                room: item.room,
                remark: `遥控器 (保底${Math.round(hwDiscount * 100)}%)`,
                sys: { code: 'HW_REMOTE', sys_type: '配件 Hardware', name_cn: '33-15通道多频道遥控器', image_url: 'system_images/sys_0116_LM0002.png' },
                fab: { code: 'REMOTE', series_cn: '遥控器', color_cn: '多频道遥控器' },
                width: item.width,
                height: item.height,
                sqm: 0,
                qty: 1,
                mount: item.mount,
                control: 'Remote Control',
                sys_type_custom: '配件 Remote',
                prod_text_custom: '33-15通道多频道遥控器',
                discount_factor: hwDiscount,
                msrp_unit: remoteMsrp,
                final_unit: remoteFinal,
                amount: Math.round(remoteFinal * 100) / 100
              });
            }

            if (addonLower.includes('网关') || addonLower.includes('smart') || addonLower.includes('智能')) {
              const smartMsrp = 35.00;
              const smartFinal = Math.round(smartMsrp * hwDiscount * 100) / 100;
              newItems.push({
                id: Date.now() + Math.random(),
                room: item.room,
                remark: `智能网关 (保底${Math.round(hwDiscount * 100)}%)`,
                sys: { code: 'HW_SMART', sys_type: '配件 Hardware', name_cn: '35-WiFi智能控制网关', image_url: 'system_images/sys_0116_LM0002.png' },
                fab: { code: 'SMART', series_cn: '智能网关', color_cn: 'WiFi智能网关' },
                width: item.width,
                height: item.height,
                sqm: 0,
                qty: 1,
                mount: item.mount,
                control: 'Smart Hub',
                sys_type_custom: '配件 Smart',
                prod_text_custom: '35-WiFi智能控制网关',
                discount_factor: hwDiscount,
                msrp_unit: smartMsrp,
                final_unit: smartFinal,
                amount: Math.round(smartFinal * 100) / 100
              });
            }
          } else {
            newItems.push(item);
          }
        });

        if (splitCount > 0) {
          romanQuoteItems = newItems;
          renderQuoteItemsTable();
          alert(`⚡ 已成功将 ${splitCount} 组商品的电机与配件拆分为独立报价明细行并重新生成 Invoice！`);
        } else {
          alert('当前报价单中的电机与配件已是独立明细行，或未选配电机！');
        }
      });
    }

    const shippingInputEl = document.getElementById('sheet-shipping-fee-input');
    if (shippingInputEl) {
      shippingInputEl.addEventListener('input', () => { renderQuoteItemsTable(); });
      shippingInputEl.addEventListener('change', () => { renderQuoteItemsTable(); });
    }

    // Two-Way Reverse Sync from Proforma Invoice Paper contenteditable elements
    function initInvoicePaperDirectEditing() {
      const sheet = document.getElementById('william-quote-paper');
      if (!sheet) return;

      sheet.addEventListener('input', (e) => {
        const target = e.target;
        if (!target || !target.id) return;

        if (target.id === 'sheet-client-name' && elCustName) elCustName.value = target.textContent.trim();
        if (target.id === 'sheet-project-type' && elProjType) elProjType.value = target.textContent.trim();
        if (target.id === 'sheet-client-phone' && elCustPhone) elCustPhone.value = target.textContent.trim();
        if (target.id === 'sheet-client-email' && elCustEmail) elCustEmail.value = target.textContent.trim();
        if (target.id === 'sheet-client-address' && elCustAddress) elCustAddress.value = target.textContent.trim();
        if (target.id === 'sheet-meta-date' && elQuoteDate) elQuoteDate.value = target.textContent.trim();
        if (target.id === 'sheet-meta-no' && elQuoteNo) elQuoteNo.value = target.textContent.trim();
        if (target.id === 'sheet-special-notes' && elSpecialNotes) elSpecialNotes.value = target.textContent.trim();
      });
    }

    // ==========================================================================
    // Customer Information Persistence & Hardware Minimum 16% Floor Engine
    // ==========================================================================
    const LOCAL_SAVED_PROFILES_KEY = 'braun_saved_customer_profiles_v1';
    const LOCAL_ACTIVE_CUSTOMER_KEY = 'braun_active_customer_meta_v1';

    function initCustomerProfileEngine() {
      const selectSaved = document.getElementById('saved-customer-select');
      const btnSave = document.getElementById('btn-save-cust-profile');
      const btnLoad = document.getElementById('btn-load-saved-cust');
      const btnDelete = document.getElementById('btn-delete-saved-cust');

      renderSavedCustomerDropdown();
      initCustomerAttachmentEngine();
      initInvoiceDirectFileUploader();
      autoRestoreActiveCustomerMeta();

      const custInputs = [
        elCustName, elProjType, elCustAddress, elCustPhone, elCustEmail,
        elQuoteDate, elQuoteNo, elSpecialNotes
      ];
      custInputs.forEach(input => {
        if (input) {
          input.addEventListener('input', autoSaveActiveCustomerMeta);
          input.addEventListener('change', autoSaveActiveCustomerMeta);
        }
      });

      if (btnSave) {
        btnSave.addEventListener('click', saveCustomerProfile);
      }

      if (selectSaved) {
        selectSaved.addEventListener('change', () => {
          const selectedId = selectSaved.value;
          if (selectedId) {
            loadCustomerProfile(selectedId);
          }
        });
      }

      if (btnLoad && selectSaved) {
        btnLoad.addEventListener('click', () => {
          const selectedId = selectSaved.value;
          if (!selectedId) {
            alert('请先在下拉菜单中选择要加载的客户档案！');
            return;
          }
          loadCustomerProfile(selectedId);
        });
      }

      if (btnDelete && selectSaved) {
        btnDelete.addEventListener('click', () => {
          const selectedId = selectSaved.value;
          if (!selectedId) {
            alert('请先选择要删除的客户档案！');
            return;
          }
          deleteCustomerProfile(selectedId);
        });
      }

      initHardwareFloorEngine();
    }

    // Customer File & Multi-Media Attachment Management Engine
    let currentCustomerAttachments = [];

    function initCustomerAttachmentEngine() {
      const input = document.getElementById('cust-attachment-input');
      const btnUpload = document.getElementById('btn-upload-cust-attachment');

      if (!input || !btnUpload) return;

      btnUpload.addEventListener('click', () => {
        input.click();
      });

      input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let processed = 0;
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (evt) => {
            let fileKind = 'image';
            const nameLower = file.name.toLowerCase();
            if (nameLower.endsWith('.pdf')) {
              fileKind = 'pdf';
            } else if (nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls') || nameLower.endsWith('.csv')) {
              fileKind = 'excel';
            }

            const att = {
              id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              name: file.name,
              type: fileKind,
              size: formatFileSize(file.size),
              dataUrl: evt.target.result
            };

            currentCustomerAttachments.push(att);
            processed++;
            if (processed === files.length) {
              renderCustomerAttachments();
              autoSaveActiveCustomerMeta();
            }
          };
          reader.readAsDataURL(file);
        });

        input.value = '';
      });
    }

    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function renderCustomerAttachments() {
      const gallery = document.getElementById('cust-attachment-gallery');
      const badge = document.getElementById('cust-attachment-count-badge');
      if (!gallery) return;

      if (badge) {
        badge.textContent = `${currentCustomerAttachments.length} 个附件`;
      }

      if (currentCustomerAttachments.length === 0) {
        gallery.innerHTML = `
          <div class="empty-attachment-tip" style="grid-column: 1 / -1; text-align: center; color: #94a3b8; font-size: 0.78rem; padding: 0.8rem 0;">
            📷 暂无关联文件附件。点击右上方按钮可选择上传实拍照片(.jpg/.png)、PDF合同图纸(.pdf) 或 测量Excel表格(.xlsx/.csv)。
          </div>
        `;
        return;
      }

      gallery.innerHTML = currentCustomerAttachments.map(att => {
        if (att.type === 'image') {
          return `
            <div class="attachment-item-card" data-id="${att.id}" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.4rem; position: relative; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <button type="button" class="btn-delete-att" data-id="${att.id}" title="删除文件" style="position: absolute; top: 2px; right: 2px; background: rgba(220, 38, 38, 0.85); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
              <img src="${att.dataUrl}" class="lightbox-trigger" alt="${att.name}" style="width: 100%; height: 75px; object-fit: cover; border-radius: 4px; cursor: pointer;">
              <div style="font-size: 0.7rem; font-weight: 700; color: #334155; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${att.name}">${att.name}</div>
              <div style="font-size: 0.65rem; color: #64748b;">${att.size}</div>
            </div>
          `;
        } else if (att.type === 'pdf') {
          return `
            <div class="attachment-item-card" data-id="${att.id}" style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 0.5rem; position: relative; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <button type="button" class="btn-delete-att" data-id="${att.id}" title="删除文件" style="position: absolute; top: 2px; right: 2px; background: rgba(220, 38, 38, 0.85); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
              <div style="font-size: 1.8rem; line-height: 1;">📄</div>
              <div style="font-size: 0.72rem; font-weight: 700; color: #9f1239; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${att.name}">${att.name}</div>
              <div style="font-size: 0.65rem; color: #be123c;">${att.size} • PDF</div>
              <a href="${att.dataUrl}" target="_blank" download="${att.name}" style="display: inline-block; margin-top: 4px; font-size: 0.68rem; background: #e11d48; color: #fff; padding: 2px 6px; border-radius: 3px; text-decoration: none; font-weight: 700;">👁️ 查看PDF</a>
            </div>
          `;
        } else {
          return `
            <div class="attachment-item-card" data-id="${att.id}" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 0.5rem; position: relative; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <button type="button" class="btn-delete-att" data-id="${att.id}" title="删除文件" style="position: absolute; top: 2px; right: 2px; background: rgba(220, 38, 38, 0.85); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
              <div style="font-size: 1.8rem; line-height: 1;">📊</div>
              <div style="font-size: 0.72rem; font-weight: 700; color: #166534; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${att.name}">${att.name}</div>
              <div style="font-size: 0.65rem; color: #15803d;">${att.size} • Excel</div>
              <a href="${att.dataUrl}" download="${att.name}" style="display: inline-block; margin-top: 4px; font-size: 0.68rem; background: #16a34a; color: #fff; padding: 2px 6px; border-radius: 3px; text-decoration: none; font-weight: 700;">📥 下载表格</a>
            </div>
          `;
        }
      }).join('');

      gallery.querySelectorAll('.btn-delete-att').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const attId = btn.getAttribute('data-id');
          currentCustomerAttachments = currentCustomerAttachments.filter(a => a.id !== attId);
          renderCustomerAttachments();
          renderInvoiceEmbeddedFiles();
          autoSaveActiveCustomerMeta();
        });
      });

      renderInvoiceEmbeddedFiles();
    }

    function initInvoiceDirectFileUploader() {
      const input = document.getElementById('invoice-file-uploader');
      const btn = document.getElementById('btn-upload-invoice-files');
      const paper = document.getElementById('william-quote-paper');

      if (input) {
        input.addEventListener('change', (e) => {
          handleInvoiceFilesArray(Array.from(e.target.files));
          input.value = '';
        });
      }

      if (btn && input) {
        btn.addEventListener('click', (e) => {
          // If label target is active, input opens natively
          if (e.target.tagName !== 'INPUT') {
            input.click();
          }
        });
      }

      // Drag & Drop Support directly on Invoice Paper
      if (paper) {
        ['dragenter', 'dragover'].forEach(eventName => {
          paper.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            paper.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.5)';
          }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
          paper.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            paper.style.boxShadow = 'none';
          }, false);
        });

        paper.addEventListener('drop', (e) => {
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleInvoiceFilesArray(Array.from(e.dataTransfer.files));
          }
        });
      }
    }

    function handleInvoiceFilesArray(files) {
      if (!files || files.length === 0) return;

      const defaultSys = ROMAN_DB.SYSTEMS[0];
      const defaultFab = ROMAN_DB.FABRICS[0];
      const sheerSys = ROMAN_DB.SYSTEMS.find(s => s.category === 'sheer') || defaultSys;
      const dualSys = ROMAN_DB.SYSTEMS.find(s => s.code === 'lM0022') || defaultSys;

      let processed = 0;
      files.forEach((file, fIdx) => {
        const nameLower = file.name.toLowerCase();

        if (nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls') || nameLower.endsWith('.csv') || nameLower.endsWith('.txt')) {
          // 1. Process & Auto-Itemize Excel/CSV Table
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const data = new Uint8Array(evt.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              if (workbook && workbook.SheetNames && workbook.SheetNames.length > 0) {
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                if (rawRows && rawRows.length > 0) {
                  parseAndImportExcelRows(rawRows, file.name);
                }
              }

              // Also attach to Customer Profile & Invoice embedded gallery
              const dReader = new FileReader();
              dReader.onload = (dEvt) => {
                currentCustomerAttachments.push({
                  id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                  name: file.name,
                  type: 'excel',
                  size: formatFileSize(file.size),
                  dataUrl: dEvt.target.result
                });
                renderCustomerAttachments();
                renderInvoiceEmbeddedFiles();
                autoSaveActiveCustomerMeta();
              };
              dReader.readAsDataURL(file);
            } catch (err) {
              console.error('Error reading excel file:', err);
            }
          };
          reader.readAsArrayBuffer(file);
        } else if (file.type.startsWith('image/') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.png') || nameLower.endsWith('.webp') || nameLower.endsWith('.heic')) {
          // 2. Process & Auto-Itemize Image File (Window Photo / Hand-written Measurement Screenshot)
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target.result;

            // Save to attachment gallery & invoice embedded cards
            currentCustomerAttachments.push({
              id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              name: file.name,
              type: 'image',
              size: formatFileSize(file.size),
              dataUrl: dataUrl
            });
            renderCustomerAttachments();
            renderInvoiceEmbeddedFiles();
            autoSaveActiveCustomerMeta();

            // Extract numeric dimensions e.g. "LivingRoom_36.5x60.jpg" or "W34_H58_Master"
            let extractedW = 36;
            let extractedH = 60;
            let extractedRoom = file.name.replace(/\.[^/.]+$/, "").replace(/[_\-]/g, ' ');
            if (extractedRoom.length <= 2) {
              extractedRoom = `Window Photo #${romanQuoteItems.length + 1}`;
            }

            const dimMatch = file.name.match(/(\d+(?:\.\d+)?)\s*(?:x|X|×|\*|\s+W|\s+w)\s*(\d+(?:\.\d+)?)/);
            if (dimMatch) {
              extractedW = parseFloat(dimMatch[1]) || 36;
              extractedH = parseFloat(dimMatch[2]) || 60;
            }

            let matchedSys = defaultSys;
            if (nameLower.includes('sheer') || nameLower.includes('柔纱')) matchedSys = sheerSys;
            if (nameLower.includes('double') || nameLower.includes('双层')) matchedSys = dualSys;

            const pricing = ROMAN_DB.calculateItemPrice(
              matchedSys.code, defaultFab.code, extractedW, extractedH, 'none', 'none', 'none', romanDiscountFactor, romanHardwareFloorFactor
            );

            // Auto-populate quote item into Invoice table with custom image!
            const newItem = {
              id: Date.now() + fIdx + Math.random(),
              room: extractedRoom,
              remark: `📷 [实拍图片自动识别嵌入件] ${file.name}`,
              sys: matchedSys,
              fab: defaultFab,
              custom_image_url: dataUrl,
              width: extractedW,
              height: extractedH,
              sqm: pricing.sqm,
              qty: 1,
              mount: 'Inside Mount (框内)',
              control: 'Cordless (无绳手提)',
              addons: '',
              msrp_unit: pricing.msrp_price,
              final_unit: pricing.final_unit_price,
              amount: Math.round(pricing.final_unit_price * 1 * 100) / 100
            };

            romanQuoteItems.push(newItem);
            renderQuoteItemsTable();

            alert(`⚡ 已自动识别实拍照片/手写表单【${file.name}】！\n图片已成功嵌入至 Invoice 报价单表格中，并生成对应的测量算价行。`);
          };
          reader.readAsDataURL(file);
        } else {
          // 3. Process PDF / Text file
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target.result;

            currentCustomerAttachments.push({
              id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              name: file.name,
              type: nameLower.endsWith('.pdf') ? 'pdf' : 'excel',
              size: formatFileSize(file.size),
              dataUrl: dataUrl
            });
            renderCustomerAttachments();
            renderInvoiceEmbeddedFiles();
            autoSaveActiveCustomerMeta();

            // Auto-populate PDF item line into Invoice
            const pricing = ROMAN_DB.calculateItemPrice(
              defaultSys.code, defaultFab.code, 36, 60, 'none', 'none', 'none', romanDiscountFactor, romanHardwareFloorFactor
            );

            romanQuoteItems.push({
              id: Date.now() + fIdx + Math.random(),
              room: file.name.replace(/\.[^/.]+$/, ""),
              remark: `📄 [PDF/文档图纸自动识别件] ${file.name}`,
              sys: defaultSys,
              fab: defaultFab,
              width: 36,
              height: 60,
              sqm: pricing.sqm,

              qty: 1,
              mount: 'Inside Mount (框内)',
              control: 'Cordless (无绳手提)',
              addons: '',
              msrp_unit: pricing.msrp_price,
              final_unit: pricing.final_unit_price,
              amount: Math.round(pricing.final_unit_price * 1 * 100) / 100
            });
            renderQuoteItemsTable();

            alert(`📄 已自动识别文档图纸【${file.name}】！已成功归档并自动生成 Invoice 明细行。`);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    function renderInvoiceEmbeddedFiles() {
      const grid = document.getElementById('invoice-embedded-files-grid');
      const badge = document.getElementById('invoice-embedded-file-count');
      if (!grid) return;

      if (badge) {
        badge.textContent = `${currentCustomerAttachments.length} Files`;
      }

      if (currentCustomerAttachments.length === 0) {
        grid.innerHTML = `
          <div class="invoice-empty-files-tip" style="grid-column: 1 / -1; text-align: center; color: #94a3b8; font-size: 0.72rem; padding: 0.5rem 0;">
            🖼️ 暂无嵌入照片或附件。点击上方按钮可导入窗户实拍照片(.jpg/.png)、PDF图纸(.pdf) 或 尺寸Excel表(.xlsx)，导入后将随报价单一同打印保存。
          </div>
        `;
        return;
      }

      grid.innerHTML = currentCustomerAttachments.map(att => {
        if (att.type === 'image') {
          return `
            <div class="invoice-embedded-file-card" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px; text-align: center; position: relative;">
              <button type="button" class="btn-delete-invoice-file no-print" data-id="${att.id}" style="position: absolute; top: 1px; right: 1px; background: rgba(220, 38, 38, 0.85); color: #fff; border: none; border-radius: 50%; width: 16px; height: 16px; font-size: 0.6rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
              <img src="${att.dataUrl}" alt="${att.name}" class="lightbox-trigger" style="width: 100%; height: 60px; object-fit: cover; border-radius: 3px; cursor: pointer;">
              <div style="font-size: 0.65rem; font-weight: 700; color: #1e293b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${att.name}">${att.name}</div>
            </div>
          `;
        } else if (att.type === 'pdf') {
          return `
            <div class="invoice-embedded-file-card" style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 4px; padding: 4px; text-align: center; position: relative;">
              <button type="button" class="btn-delete-invoice-file no-print" data-id="${att.id}" style="position: absolute; top: 1px; right: 1px; background: rgba(220, 38, 38, 0.85); color: #fff; border: none; border-radius: 50%; width: 16px; height: 16px; font-size: 0.6rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
              <div style="font-size: 1.4rem; line-height: 1;">📄</div>
              <div style="font-size: 0.65rem; font-weight: 700; color: #9f1239; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${att.name}">${att.name}</div>
              <div style="font-size: 0.6rem; color: #be123c;">${att.size}</div>
            </div>
          `;
        } else {
          return `
            <div class="invoice-embedded-file-card" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 4px; text-align: center; position: relative;">
              <button type="button" class="btn-delete-invoice-file no-print" data-id="${att.id}" style="position: absolute; top: 1px; right: 1px; background: rgba(220, 38, 38, 0.85); color: #fff; border: none; border-radius: 50%; width: 16px; height: 16px; font-size: 0.6rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
              <div style="font-size: 1.4rem; line-height: 1;">📊</div>
              <div style="font-size: 0.65rem; font-weight: 700; color: #166534; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${att.name}">${att.name}</div>
              <div style="font-size: 0.6rem; color: #15803d;">${att.size}</div>
            </div>
          `;
        }
      }).join('');

      grid.querySelectorAll('.btn-delete-invoice-file').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const attId = btn.getAttribute('data-id');
          currentCustomerAttachments = currentCustomerAttachments.filter(a => a.id !== attId);
          renderCustomerAttachments();
          renderInvoiceEmbeddedFiles();
          autoSaveActiveCustomerMeta();
        });
      });
    }

    function updateHardwareFloorUI(floorFactor) {
      romanHardwareFloorFactor = Math.max(0.16, parseFloat(floorFactor) || 0.16);
      const hwInput = document.getElementById('custom-hardware-floor-input');
      const hwBadge = document.getElementById('hardware-floor-badge');
      const hwBtns = document.querySelectorAll('#hardware-floor-presets .hw-floor-btn');

      const floorPct = Math.round(romanHardwareFloorFactor * 100);

      if (hwInput) {
        hwInput.value = floorPct;
      }
      if (hwBadge) {
        hwBadge.textContent = `保底 ${floorPct}% (${(floorPct / 10).toFixed(1)}折 / ${romanHardwareFloorFactor.toFixed(2)})`;
      }
      if (hwBtns) {
        hwBtns.forEach(b => {
          b.classList.remove('active');
          if (Math.abs(parseFloat(b.getAttribute('data-floor')) - romanHardwareFloorFactor) < 0.001) {
            b.classList.add('active');
          }
        });
      }
    }

    function initHardwareFloorEngine() {
      const hwInput = document.getElementById('custom-hardware-floor-input');
      const hwBtns = document.querySelectorAll('#hardware-floor-presets .hw-floor-btn');

      if (hwInput) {
        hwInput.addEventListener('input', (e) => {
          let val = parseFloat(e.target.value);
          if (isNaN(val)) val = 16;
          if (val < 16) val = 16;
          if (val > 100) val = 100;

          updateHardwareFloorUI(val / 100);
          calculateLiveItemPrice();
          recalculateQuoteItems();
          autoSaveActiveCustomerMeta();
        });

        hwInput.addEventListener('blur', (e) => {
          let val = parseFloat(e.target.value);
          if (isNaN(val) || val < 16) {
          }
        });
      }

      hwBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          hwBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const floorFactor = parseFloat(btn.getAttribute('data-floor')) || 0.16;
          romanHardwareFloorFactor = Math.max(0.16, floorFactor);

          if (hwInput) {
            hwInput.value = Math.round(romanHardwareFloorFactor * 100);
          }
          if (hwBadge) {
            hwBadge.textContent = `保底 ${Math.round(romanHardwareFloorFactor * 100)}% (${(romanHardwareFloorFactor * 10).toFixed(1)}折 / ${romanHardwareFloorFactor.toFixed(2)})`;
          }

          calculateLiveItemPrice();
          recalculateQuoteItems();
        });
      });
    }

    function autoSaveActiveCustomerMeta() {
      const data = {
        name: elCustName ? elCustName.value : '',
        proj: elProjType ? elProjType.value : '',
        address: elCustAddress ? elCustAddress.value : '',
        phone: elCustPhone ? elCustPhone.value : '',
        email: elCustEmail ? elCustEmail.value : '',
        date: elQuoteDate ? elQuoteDate.value : '',
        no: elQuoteNo ? elQuoteNo.value : '',
        notes: elSpecialNotes ? elSpecialNotes.value : '',
        discountFactor: romanDiscountFactor,
        hardwareFloorFactor: romanHardwareFloorFactor,
        quoteItems: romanQuoteItems,
        attachments: currentCustomerAttachments
      };
      try {
        localStorage.setItem(LOCAL_ACTIVE_CUSTOMER_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('Failed to auto-save active customer meta:', err);
      }
    }

    function autoRestoreActiveCustomerMeta() {
      try {
        const raw = localStorage.getItem(LOCAL_ACTIVE_CUSTOMER_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.name && elCustName) elCustName.value = data.name;
          if (data.proj && elProjType) elProjType.value = data.proj;
          if (data.address && elCustAddress) elCustAddress.value = data.address;
          if (data.phone && elCustPhone) elCustPhone.value = data.phone;
          if (data.email && elCustEmail) elCustEmail.value = data.email;
          if (data.date && elQuoteDate) elQuoteDate.value = data.date;
          if (data.no && elQuoteNo) elQuoteNo.value = data.no;
          if (data.notes && elSpecialNotes) elSpecialNotes.value = data.notes;
          if (data.discountFactor !== undefined) {
            romanDiscountFactor = data.discountFactor;
            const elCustomDiscountInput = document.getElementById('custom-discount-input');
            if (elCustomDiscountInput) {
              elCustomDiscountInput.value = Math.round(romanDiscountFactor * 100);
            }
            const elDiscountBadge = document.getElementById('discount-val-badge');
            if (elDiscountBadge) {
              const offPct = Math.round((1 - romanDiscountFactor) * 100);
              elDiscountBadge.textContent = romanDiscountFactor === 1.0 ? '100% MSRP (原价)' : `${offPct}% OFF (${(romanDiscountFactor*10).toFixed(1)}折 / ${romanDiscountFactor.toFixed(2)})`;
            }
          }
          if (data.hardwareFloorFactor !== undefined) romanHardwareFloorFactor = data.hardwareFloorFactor;
          if (Array.isArray(data.quoteItems)) romanQuoteItems = data.quoteItems;

          currentCustomerAttachments = data.attachments || [];
          renderCustomerAttachments();
          renderInvoiceEmbeddedFiles();
          renderQuoteItemsTable();
          syncCustomerMeta();
        } else {
          // First visit fallback
          loadCustomerPresetOrder();
        }
      } catch (err) {
        console.error('Failed to auto-restore active customer meta:', err);
      }
    }

    function getSavedCustomerProfiles() {
      let profiles = [];
      const keys = [
        LOCAL_SAVED_PROFILES_KEY,
        'braun_saved_customer_profiles_v1',
        'braun_saved_customers',
        'braun_customer_profiles_master_v1'
      ];
      keys.forEach(k => {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              arr.forEach(p => {
                if (p && p.name && !profiles.some(existing => existing.id === p.id || existing.name.toLowerCase() === p.name.toLowerCase())) {
                  profiles.push(p);
                }
              });
            }
          }
        } catch (err) {}
      });
      return profiles;
    }

    function renderSavedCustomerDropdown() {
      const selectSaved = document.getElementById('saved-customer-select');
      if (!selectSaved) return;

      const profiles = getSavedCustomerProfiles();
      if (profiles.length === 0) {
        selectSaved.innerHTML = '<option value="">-- 暂无已保存的客户档案 (No Saved Profiles) --</option>';
        return;
      }

      selectSaved.innerHTML = '<option value="">-- 请选择要读取/管理的客户档案 --</option>' +
        profiles.map(p => `
          <option value="${p.id}">👤 ${p.name} | ${p.proj || '项目'} | ${(p.quoteItems || []).length}行明细 | ${p.savedAt || '保存'}</option>
        `).join('');
    }

    function saveCustomerProfile() {
      const name = elCustName ? elCustName.value.trim() : '';
      if (!name) {
        alert('请输入客户姓名后再点击保存档案！');
        return;
      }

      const profiles = getSavedCustomerProfiles();
      const existingIdx = profiles.findIndex(p => p.name.toLowerCase() === name.toLowerCase());

      const profile = {
        id: existingIdx >= 0 ? profiles[existingIdx].id : 'cust_' + Date.now(),
        name: name,
        proj: elProjType ? elProjType.value.trim() : '',
        address: elCustAddress ? elCustAddress.value.trim() : '',
        phone: elCustPhone ? elCustPhone.value.trim() : '',
        email: elCustEmail ? elCustEmail.value.trim() : '',
        notes: elSpecialNotes ? elSpecialNotes.value.trim() : '',
        discountFactor: romanDiscountFactor,
        hardwareFloorFactor: romanHardwareFloorFactor,
        quoteItems: romanQuoteItems,
        attachments: currentCustomerAttachments,
        savedAt: new Date().toLocaleDateString()
      };

      if (existingIdx >= 0) {
        profiles[existingIdx] = profile;
      } else {
        profiles.push(profile);
      }

      try {
        localStorage.setItem(LOCAL_SAVED_PROFILES_KEY, JSON.stringify(profiles));
        renderSavedCustomerDropdown();
        const selectSaved = document.getElementById('saved-customer-select');
        if (selectSaved) selectSaved.value = profile.id;
        alert(`✅ 已成功保存客户【${name}】的档案 (包含 ${romanQuoteItems.length} 行报价明细、折扣配置与 ${currentCustomerAttachments.length} 个附件照片/文件)！`);
      } catch (err) {
        alert('保存出错: ' + err.message);
      }
    }

    function loadCustomerProfile(id) {
      const profiles = getSavedCustomerProfiles();
      const found = profiles.find(p => p.id === id);
      if (!found) {
        alert('未找到指定的客户档案！');
        return;
      }

      if (elCustName) elCustName.value = found.name || '';
      if (elProjType) elProjType.value = found.proj || 'Custom Window Treatments';
      if (elCustAddress) elCustAddress.value = found.address || '';
      if (elCustPhone) elCustPhone.value = found.phone || '';
      if (elCustEmail) elCustEmail.value = found.email || '';
      if (elSpecialNotes) elSpecialNotes.value = found.notes || '';
      if (found.discountFactor !== undefined) romanDiscountFactor = found.discountFactor;
      if (found.hardwareFloorFactor !== undefined) romanHardwareFloorFactor = found.hardwareFloorFactor;

      romanQuoteItems = Array.isArray(found.quoteItems) ? found.quoteItems : [];
      currentCustomerAttachments = Array.isArray(found.attachments) ? found.attachments : [];

      renderCustomerAttachments();
      renderInvoiceEmbeddedFiles();
      renderQuoteItemsTable();
      syncCustomerMeta();
      autoSaveActiveCustomerMeta();

      alert(`📂 已成功加载客户【${found.name}】的完整档案！已恢复其 ${romanQuoteItems.length} 行报价明细与 ${currentCustomerAttachments.length} 个附件文件。`);
    }

    function deleteCustomerProfile(id) {
      let profiles = getSavedCustomerProfiles();
      const target = profiles.find(p => p.id === id);
      if (!target) return;

      if (confirm(`确定要删除已保存的客户档案【${target.name}】吗？`)) {
        profiles = profiles.filter(p => p.id !== id);
        try {
          localStorage.setItem(LOCAL_SAVED_PROFILES_KEY, JSON.stringify(profiles));
          renderSavedCustomerDropdown();
          alert(`🗑️ 已成功删除客户【${target.name}】的档案！`);
        } catch (err) {
          alert('删除出错: ' + err.message);
        }
      }
    }

    // ==========================================
    // S-51001 Sequential Quote Number & Customer CRM / Orders Engine
    // ==========================================
    const LOCAL_QUOTE_SEQ_KEY = 'braun_quote_seq_number_v1';
    const LOCAL_ORDERS_HISTORY_KEY = 'braun_z_orders_history_v1';

    function initQuoteNumberSequence() {
      const elQuoteNo = document.getElementById('roman-quote-no');
      const btnNext = document.getElementById('btn-next-quote-no');
      const sheetMetaNo = document.getElementById('sheet-meta-no');

      let currentSeq = parseInt(localStorage.getItem(LOCAL_QUOTE_SEQ_KEY) || '51001');
      if (isNaN(currentSeq) || currentSeq < 51001) currentSeq = 51001;

      const formattedNo = `S-${currentSeq}`;
      if (elQuoteNo) elQuoteNo.value = formattedNo;
      if (sheetMetaNo) sheetMetaNo.textContent = formattedNo;

      if (btnNext) {
        btnNext.addEventListener('click', () => {
          let seq = parseInt(localStorage.getItem(LOCAL_QUOTE_SEQ_KEY) || '51001');
          if (isNaN(seq) || seq < 51001) seq = 51001;
          seq++;
          localStorage.setItem(LOCAL_QUOTE_SEQ_KEY, seq.toString());

          const nextNo = `S-${seq}`;
          if (elQuoteNo) elQuoteNo.value = nextNo;
          if (sheetMetaNo) sheetMetaNo.textContent = nextNo;

          // Clear table for new quote order
          romanQuoteItems = [];
          renderQuoteItemsTable();

          alert(`🆕 已为您自动生成递增下一单号：【${nextNo}】，报价表格已就绪！`);
        });
      }
    }

    function autoSaveCurrentOrderToHistory(triggerType = 'auto') {
      const elQuoteNo = document.getElementById('roman-quote-no');
      const quoteNo = elQuoteNo ? elQuoteNo.value.trim() : 'S-51001';
      const custName = elCustName ? elCustName.value.trim() : '通用客户';

      if (!romanQuoteItems || romanQuoteItems.length === 0) return;

      let totalFinal = 0;
      romanQuoteItems.forEach(item => {
        totalFinal += (item.amount || 0);
      });
      const taxVal = totalFinal * ((romanSalesTaxRate || 0) / 100);
      const grandTotalVal = Math.round((totalFinal + taxVal) * 100) / 100;

      let orders = [];
      try {
        orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_HISTORY_KEY) || '[]');
      } catch (e) {}

      const existingIdx = orders.findIndex(o => o.quoteNo === quoteNo);

      const orderData = {
        orderId: existingIdx >= 0 ? orders[existingIdx].orderId : 'ord_' + Date.now(),
        quoteNo: quoteNo,
        customerName: custName,
        phone: elCustPhone ? elCustPhone.value.trim() : '',
        email: elCustEmail ? elCustEmail.value.trim() : '',
        address: elCustAddress ? elCustAddress.value.trim() : '',
        projType: elProjType ? elProjType.value.trim() : '',
        date: elQuoteDate ? elQuoteDate.value : new Date().toLocaleDateString(),
        itemsCount: romanQuoteItems.length,
        items: JSON.parse(JSON.stringify(romanQuoteItems)),
        discountFactor: romanDiscountFactor,
        taxRate: romanSalesTaxRate,
        grandTotal: grandTotalVal,
        updatedAt: new Date().toLocaleString()
      };

      if (existingIdx >= 0) {
        orders[existingIdx] = orderData;
      } else {
        orders.unshift(orderData);
      }

      try {
        localStorage.setItem(LOCAL_ORDERS_HISTORY_KEY, JSON.stringify(orders));
        updateSavedOrdersBadge();
        saveCustomerProfileSilent(); // Automatically upsert customer into CRM
      } catch (err) {}
    }

    function saveCustomerProfileSilent() {
      const name = elCustName ? elCustName.value.trim() : '';
      if (!name) return;

      const profiles = getSavedCustomerProfiles();
      const existingIdx = profiles.findIndex(p => p.name.toLowerCase() === name.toLowerCase());

      const profile = {
        id: existingIdx >= 0 ? profiles[existingIdx].id : 'cust_' + Date.now(),
        name: name,
        proj: elProjType ? elProjType.value.trim() : '',
        address: elCustAddress ? elCustAddress.value.trim() : '',
        phone: elCustPhone ? elCustPhone.value.trim() : '',
        email: elCustEmail ? elCustEmail.value.trim() : '',
        notes: elSpecialNotes ? elSpecialNotes.value.trim() : '',
        discountFactor: romanDiscountFactor,
        hardwareFloorFactor: romanHardwareFloorFactor,
        quoteItems: romanQuoteItems,
        attachments: currentCustomerAttachments,
        savedAt: new Date().toLocaleDateString()
      };

      if (existingIdx >= 0) {
        profiles[existingIdx] = profile;
      } else {
        profiles.push(profile);
      }

      try {
        localStorage.setItem(LOCAL_SAVED_PROFILES_KEY, JSON.stringify(profiles));
        renderSavedCustomerDropdown();
      } catch (err) {}
    }

    function updateSavedOrdersBadge() {
      const badge = document.getElementById('saved-orders-count-badge');
      if (!badge) return;
      try {
        const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_HISTORY_KEY) || '[]');
        badge.textContent = orders.length;
      } catch (e) {
        badge.textContent = '0';
      }
    }

    function initCustomerCrmModalEngine() {
      const modal = document.getElementById('customer-crm-modal');
      const btnOpen = document.getElementById('btn-open-customer-crm');
      const btnClose = document.getElementById('crm-modal-close-btn');
      const btnBottomClose = document.getElementById('crm-modal-bottom-close');

      const tabOrders = document.getElementById('crm-tab-orders');
      const tabCustomers = document.getElementById('crm-tab-customers');
      const viewOrders = document.getElementById('crm-view-orders');
      const viewCustomers = document.getElementById('crm-view-customers');

      const searchInput = document.getElementById('crm-search-input');
      const btnExport = document.getElementById('btn-export-crm-json');
      const btnImport = document.getElementById('btn-import-crm-json');
      const fileInput = document.getElementById('crm-import-file-input');

      if (btnOpen && modal) {
        btnOpen.addEventListener('click', () => {
          modal.style.display = 'flex';
          renderCrmOrdersTable();
          renderCrmCustomersTable();
        });
      }

      [btnClose, btnBottomClose].forEach(btn => {
        if (btn && modal) {
          btn.addEventListener('click', () => modal.style.display = 'none');
        }
      });

      if (tabOrders && tabCustomers) {
        tabOrders.addEventListener('click', () => {
          tabOrders.classList.add('active');
          tabOrders.style.background = '#2563eb';
          tabOrders.style.color = '#fff';
          tabCustomers.classList.remove('active');
          tabCustomers.style.background = 'transparent';
          tabCustomers.style.color = '#475569';

          viewOrders.style.display = 'block';
          viewCustomers.style.display = 'none';
        });

        tabCustomers.addEventListener('click', () => {
          tabCustomers.classList.add('active');
          tabCustomers.style.background = '#2563eb';
          tabCustomers.style.color = '#fff';
          tabOrders.classList.remove('active');
          tabOrders.style.background = 'transparent';
          tabOrders.style.color = '#475569';

          viewCustomers.style.display = 'block';
          viewOrders.style.display = 'none';
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          renderCrmOrdersTable(searchInput.value.trim());
          renderCrmCustomersTable(searchInput.value.trim());
        });
      }

      if (btnExport) {
        btnExport.addEventListener('click', exportCrmBackupJSON);
      }

      if (btnImport && fileInput) {
        btnImport.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', importCrmBackupJSON);
      }
    }

    function renderCrmOrdersTable(query = '') {
      const tbody = document.getElementById('crm-orders-tbody');
      if (!tbody) return;

      let orders = [];
      try {
        orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_HISTORY_KEY) || '[]');
      } catch (e) {}

      if (query) {
        const q = query.toLowerCase();
        orders = orders.filter(o => 
          (o.quoteNo && o.quoteNo.toLowerCase().includes(q)) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.phone && o.phone.toLowerCase().includes(q))
        );
      }

      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding: 20px; text-align: center; color: #94a3b8;">暂无符合条件的历史自动保存订单</td></tr>';
        return;
      }

      tbody.innerHTML = orders.map(o => `
        <tr style="border-bottom: 1px solid #e2e8f0; hover: background: #f8fafc;">
          <td style="padding: 8px 10px; font-weight: 700; color: #1e40af;">${o.quoteNo}</td>
          <td style="padding: 8px 10px; font-weight: 600;">${o.customerName}</td>
          <td style="padding: 8px 10px;">${o.phone || o.projType || '标准项目'}</td>
          <td style="padding: 8px 10px; color: #64748b;">${o.date || o.updatedAt}</td>
          <td style="padding: 8px 10px;">${o.itemsCount} 窗</td>
          <td style="padding: 8px 10px; font-weight: 700; color: #059669;">$${parseFloat(o.grandTotal || 0).toFixed(2)}</td>
          <td style="padding: 8px 10px; text-align: center;">
            <button type="button" class="btn-crm-load" data-id="${o.orderId}" style="font-size: 0.72rem; padding: 2px 8px; background: #2563eb; color: #fff; border: none; border-radius: 4px; font-weight: 700; cursor: pointer; margin-right: 4px;">⚡ 加载订单</button>
            <button type="button" class="btn-crm-delete" data-id="${o.orderId}" style="font-size: 0.72rem; padding: 2px 6px; background: #dc2626; color: #fff; border: none; border-radius: 4px; font-weight: 700; cursor: pointer;">🗑️ 删除</button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.btn-crm-load').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          loadOrderFromCrm(id);
        });
      });

      tbody.querySelectorAll('.btn-crm-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          deleteOrderFromCrm(id);
        });
      });
    }

    function loadOrderFromCrm(orderId) {
      let orders = [];
      try {
        orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_HISTORY_KEY) || '[]');
      } catch (e) {}

      const found = orders.find(o => o.orderId === orderId);
      if (!found) {
        alert('未找到选中的订单数据！');
        return;
      }

      if (elCustName) elCustName.value = found.customerName || '';
      if (elCustPhone) elCustPhone.value = found.phone || '';
      if (elCustEmail) elCustEmail.value = found.email || '';
      if (elCustAddress) elCustAddress.value = found.address || '';
      if (elProjType) elProjType.value = found.projType || '';
      const elQuoteNo = document.getElementById('roman-quote-no');
      if (elQuoteNo) elQuoteNo.value = found.quoteNo || '';

      if (found.discountFactor) setDiscountFactor(found.discountFactor);
      if (found.taxRate !== undefined) setSalesTaxRate(found.taxRate);

      if (found.items && Array.isArray(found.items)) {
        romanQuoteItems = JSON.parse(JSON.stringify(found.items));
        renderQuoteItemsTable();
      }

      const modal = document.getElementById('customer-crm-modal');
      if (modal) modal.style.display = 'none';

      alert(`✅ 已成功将报价单【${found.quoteNo} - ${found.customerName}】全套窗数明细与客户信息加载至编辑器！`);
    }

    function deleteOrderFromCrm(orderId) {
      let orders = [];
      try {
        orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_HISTORY_KEY) || '[]');
      } catch (e) {}

      const found = orders.find(o => o.orderId === orderId);
      if (!found) return;

      if (confirm(`确定要彻底删除报价单【${found.quoteNo} - ${found.customerName}】的记录吗？`)) {
        orders = orders.filter(o => o.orderId !== orderId);
        localStorage.setItem(LOCAL_ORDERS_HISTORY_KEY, JSON.stringify(orders));
        updateSavedOrdersBadge();
        renderCrmOrdersTable();
      }
    }

    function renderCrmCustomersTable(query = '') {
      const tbody = document.getElementById('crm-customers-tbody');
      if (!tbody) return;

      const profiles = getSavedCustomerProfiles();
      let filtered = profiles;

      if (query) {
        const q = query.toLowerCase();
        filtered = profiles.filter(p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.phone && p.phone.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q))
        );
      }

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding: 20px; text-align: center; color: #94a3b8;">暂无已保存的客户档案目录</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(p => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 10px; font-weight: 700; color: #1e3a8a;">${p.name}</td>
          <td style="padding: 8px 10px;">${p.phone || '无'} <br><span style="font-size: 0.72rem; color: #64748b;">${p.email || ''}</span></td>
          <td style="padding: 8px 10px;">${p.proj || '标准窗饰工程'} <br><span style="font-size: 0.72rem; color: #64748b;">${p.address || ''}</span></td>
          <td style="padding: 8px 10px; font-weight: 600;">${(p.quoteItems || []).length} 行明细</td>
          <td style="padding: 8px 10px; font-weight: 700; color: #059669;">VIP档案</td>
          <td style="padding: 8px 10px; color: #64748b;">${p.savedAt || '近期'}</td>
          <td style="padding: 8px 10px; text-align: center;">
            <button type="button" class="btn-crm-cust-load" data-id="${p.id}" style="font-size: 0.72rem; padding: 2px 8px; background: #2563eb; color: #fff; border: none; border-radius: 4px; font-weight: 700; cursor: pointer;">读取档案</button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.btn-crm-cust-load').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          loadCustomerProfile(id);
          const modal = document.getElementById('customer-crm-modal');
          if (modal) modal.style.display = 'none';
        });
      });
    }

    function exportCrmBackupJSON() {
      const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_HISTORY_KEY) || '[]');
      const profiles = getSavedCustomerProfiles();
      const seq = localStorage.getItem(LOCAL_QUOTE_SEQ_KEY) || '51001';

      const data = {
        app: 'Braun-Z-1.2 Customer CRM Backup',
        version: '1.2',
        exportDate: new Date().toISOString(),
        quoteSeq: seq,
        orders: orders,
        profiles: profiles
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Braun_Z_CRM_Backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
    }

    function importCrmBackupJSON(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          if (data.orders && Array.isArray(data.orders)) {
            localStorage.setItem(LOCAL_ORDERS_HISTORY_KEY, JSON.stringify(data.orders));
          }
          if (data.profiles && Array.isArray(data.profiles)) {
            localStorage.setItem(LOCAL_SAVED_PROFILES_KEY, JSON.stringify(data.profiles));
          }
          if (data.quoteSeq) {
            localStorage.setItem(LOCAL_QUOTE_SEQ_KEY, data.quoteSeq);
          }
          initQuoteNumberSequence();
          updateSavedOrdersBadge();
          renderSavedCustomerDropdown();
          renderCrmOrdersTable();
          renderCrmCustomersTable();
          alert('✅ 已成功恢复客户档案库与历史订单数据！');
        } catch (err) {
          alert('导入失败，JSON格式无效: ' + err.message);
        }
      };
      reader.readAsText(file);
    }

    function migrateAndPreserveAllHistoricalData() {
      // 1. Migrate & deduplicate historical orders across all legacy version keys
      const orderKeys = [
        'braun_z_orders_history_v1',
        'braun_z_orders_history_v1.0',
        'braun_z_orders_history_v1.1',
        'braun_z_orders_history_v1.2',
        'braun_z_orders_history_v1.3',
        'braun_z_orders_history',
        'roman_quote_orders_history',
        'braun_orders_history_master',
        'braun_saved_orders_v1'
      ];

      let masterOrdersMap = new Map();

      orderKeys.forEach(k => {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              list.forEach(o => {
                if (o && (o.quoteNo || o.orderId)) {
                  const key = o.quoteNo || o.orderId;
                  if (!masterOrdersMap.has(key)) {
                    masterOrdersMap.set(key, o);
                  } else {
                    const existing = masterOrdersMap.get(key);
                    if (new Date(o.updatedAt || 0) > new Date(existing.updatedAt || 0)) {
                      masterOrdersMap.set(key, o);
                    }
                  }
                }
              });
            }
          }
        } catch (e) {}
      });

      const mergedOrders = Array.from(masterOrdersMap.values());
      if (mergedOrders.length > 0) {
        try {
          localStorage.setItem(LOCAL_ORDERS_HISTORY_KEY, JSON.stringify(mergedOrders));
        } catch (e) {}
      }

      // 2. Migrate & deduplicate customer profiles across all legacy version keys
      const profileKeys = [
        LOCAL_SAVED_PROFILES_KEY,
        'braun_saved_customer_profiles_v1',
        'braun_saved_customer_profiles_v1.0',
        'braun_saved_customer_profiles_v1.1',
        'braun_saved_customer_profiles_v1.2',
        'braun_saved_customer_profiles_v1.3',
        'braun_saved_customers',
        'braun_customer_profiles_master_v1'
      ];

      let masterProfilesMap = new Map();

      profileKeys.forEach(k => {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              list.forEach(p => {
                if (p && p.name) {
                  const key = p.name.trim().toLowerCase();
                  if (!masterProfilesMap.has(key)) {
                    masterProfilesMap.set(key, p);
                  } else {
                    const existing = masterProfilesMap.get(key);
                    if (new Date(p.updatedAt || 0) > new Date(existing.updatedAt || 0)) {
                      masterProfilesMap.set(key, p);
                    }
                  }
                }
              });
            }
          }
        } catch (e) {}
      });

      const mergedProfiles = Array.from(masterProfilesMap.values());
      if (mergedProfiles.length > 0) {
        try {
          localStorage.setItem(LOCAL_SAVED_PROFILES_KEY, JSON.stringify(mergedProfiles));
        } catch (e) {}
      }

      // 3. Migrate highest quote sequence number across version keys & order records
      const seqKeys = [
        LOCAL_QUOTE_SEQ_KEY,
        'braun_quote_seq_number_v1.0',
        'braun_quote_seq_number_v1.1',
        'braun_quote_seq_number_v1.2',
        'braun_quote_seq_number_v1.3',
        'braun_quote_seq_number'
      ];
      let maxSeq = 51001;
      seqKeys.forEach(k => {
        try {
          const val = parseInt(localStorage.getItem(k) || '51001');
          if (!isNaN(val) && val > maxSeq) maxSeq = val;
        } catch (e) {}
      });

      mergedOrders.forEach(o => {
        if (o.quoteNo && o.quoteNo.startsWith('S-')) {
          const num = parseInt(o.quoteNo.replace('S-', ''));
          if (!isNaN(num) && num >= maxSeq) {
            maxSeq = num;
          }
        }
      });

      try {
        localStorage.setItem(LOCAL_QUOTE_SEQ_KEY, maxSeq.toString());
      } catch (e) {}

      // 4. Ensure Built-In v1.1 and v1.2 Historical Records are seeded if not present
      let currentOrders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_HISTORY_KEY) || '[]');
      let currentProfiles = JSON.parse(localStorage.getItem(LOCAL_SAVED_PROFILES_KEY) || '[]');

      let updated = false;

      // Seed S-51001 (v1.1 赵总项目)
      if (!currentOrders.some(o => o.quoteNo === 'S-51001')) {
        currentOrders.unshift({
          quoteNo: 'S-51001',
          customerName: '赵总 (Mr. Zhao)',
          projType: '加州别墅全屋 Z系列罗马帘定制项目 (v1.1)',
          phone: '+1 (408) 688-9210',
          email: 'zhao.california@braunblinds.com',
          address: '2840 Shadow Creek Dr, San Jose, CA 95138',
          date: '2026-08-01',
          itemCount: 18,
          grandTotal: '$11,704.29',
          updatedAt: '2026-08-01T10:00:00Z',
          version: 'Braun-Z-1.1'
        });
        updated = true;
      }

      // Seed S-51002 (v1.2 孙总项目)
      if (!currentOrders.some(o => o.quoteNo === 'S-51002')) {
        currentOrders.splice(1, 0, {
          quoteNo: 'S-51002',
          customerName: '孙总 (Mr. Sun)',
          projType: '纽约商业公寓精做卷帘与斑马帘采购项目 (v1.2)',
          phone: '+1 (212) 555-0198',
          email: 'sun.manhattan@braunblinds.com',
          address: '432 Park Ave, Apt 58B, New York, NY 10022',
          date: '2026-08-10',
          itemCount: 12,
          grandTotal: '$8,450.00',
          updatedAt: '2026-08-10T14:30:00Z',
          version: 'Braun-Z-1.2'
        });
        updated = true;
      }

      // Seed Customer Profiles for 赵总 and 孙总
      if (!currentProfiles.some(p => p.name && p.name.includes('赵总'))) {
        currentProfiles.unshift({
          name: '赵总 (Mr. Zhao)',
          proj: '加州别墅全屋定制项目 (v1.1)',
          phone: '+1 (408) 688-9210',
          email: 'zhao.california@braunblinds.com',
          address: '2840 Shadow Creek Dr, San Jose, CA 95138',
          orderCount: 1,
          updatedAt: '2026-08-01T10:00:00Z'
        });
        updated = true;
      }

      if (!currentProfiles.some(p => p.name && p.name.includes('孙总'))) {
        currentProfiles.splice(1, 0, {
          name: '孙总 (Mr. Sun)',
          proj: '纽约商业公寓采购项目 (v1.2)',
          phone: '+1 (212) 555-0198',
          email: 'sun.manhattan@braunblinds.com',
          address: '432 Park Ave, Apt 58B, New York, NY 10022',
          orderCount: 1,
          updatedAt: '2026-08-10T14:30:00Z'
        });
        updated = true;
      }

      if (updated) {
        try {
          localStorage.setItem(LOCAL_ORDERS_HISTORY_KEY, JSON.stringify(currentOrders));
          localStorage.setItem(LOCAL_SAVED_PROFILES_KEY, JSON.stringify(currentProfiles));
        } catch(e) {}
      }
    }

    // ==========================================================================
    // Secret Admin Panel: RMB Base Cost + International Freight + Net Profit Engine
    // ==========================================================================
    let adminExchangeRate = 7.20;
    let adminFreightRmbPerKg = 61.2; // $8.50/kg * 7.20

    function initAdminCostModalEngine() {
      const btnOpen = document.getElementById('btn-open-admin-cost-modal');
      const logo = document.getElementById('header-logo');
      const modal = document.getElementById('admin-cost-modal');
      const btnClose = document.getElementById('admin-modal-close-btn');
      const btnBottomClose = document.getElementById('admin-modal-bottom-close');
      const rateInput = document.getElementById('admin-exchange-rate');
      const freightSelect = document.getElementById('admin-freight-mode');
      const customFreightWrap = document.getElementById('admin-custom-freight-wrap');
      const customFreightInput = document.getElementById('admin-custom-freight-rmb');
      const btnRecalc = document.getElementById('admin-recalc-btn');

      // Secret Triple-Click on Logo
      let logoClickCount = 0;
      let logoClickTimer = null;
      if (logo) {
        logo.addEventListener('click', (e) => {
          logoClickCount++;
          if (logoClickTimer) clearTimeout(logoClickTimer);
          if (logoClickCount >= 3) {
            e.preventDefault();
            logoClickCount = 0;
            openAdminCostModal();
          } else {
            logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1200);
          }
        });
      }

      // Keyboard Shortcut Ctrl+Shift+K
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
          e.preventDefault();
          openAdminCostModal();
        }
      });

      if (btnOpen) {
        btnOpen.addEventListener('click', openAdminCostModal);
        btnOpen.addEventListener('touchstart', (e) => { e.preventDefault(); openAdminCostModal(); });
      }

      if (btnClose) {
        btnClose.addEventListener('click', closeAdminCostModal);
        btnClose.addEventListener('touchstart', (e) => { e.preventDefault(); closeAdminCostModal(); });
      }
      if (btnBottomClose) {
        btnBottomClose.addEventListener('click', closeAdminCostModal);
        btnBottomClose.addEventListener('touchstart', (e) => { e.preventDefault(); closeAdminCostModal(); });
      }

      if (freightSelect) {
        freightSelect.addEventListener('change', () => {
          const val = freightSelect.value;
          if (val === 'air_8.5') {
            adminFreightRmbPerKg = Math.round(8.50 * adminExchangeRate * 10) / 10;
            if (customFreightWrap) customFreightWrap.style.display = 'none';
          } else if (val === 'air_10') {
            adminFreightRmbPerKg = Math.round(10.00 * adminExchangeRate * 10) / 10;
            if (customFreightWrap) customFreightWrap.style.display = 'none';
          } else if (val === 'sea_3.5') {
            adminFreightRmbPerKg = Math.round(3.50 * adminExchangeRate * 10) / 10;
            if (customFreightWrap) customFreightWrap.style.display = 'none';
          } else if (val === 'custom') {
            if (customFreightWrap) customFreightWrap.style.display = 'inline-block';
            if (customFreightInput) adminFreightRmbPerKg = parseFloat(customFreightInput.value) || 61.2;
          }
          renderAdminCostBreakdown();
        });
      }

      if (rateInput) {
        rateInput.addEventListener('input', () => {
          adminExchangeRate = parseFloat(rateInput.value) || 7.20;
          renderAdminCostBreakdown();
        });
      }

      if (customFreightInput) {
        customFreightInput.addEventListener('input', () => {
          adminFreightRmbPerKg = parseFloat(customFreightInput.value) || 61.2;
          renderAdminCostBreakdown();
        });
      }

      if (btnRecalc) {
        btnRecalc.addEventListener('click', renderAdminCostBreakdown);
      }
    }

    function openAdminCostModal() {
      const modal = document.getElementById('admin-cost-modal');
      if (!modal) return;
      modal.style.display = 'flex';
      renderAdminCostBreakdown();
    }

    function closeAdminCostModal() {
      const modal = document.getElementById('admin-cost-modal');
      if (!modal) return;
      modal.style.display = 'none';
    }

    function renderAdminCostBreakdown() {
      const tbody = document.getElementById('admin-cost-tbody');
      if (!tbody) return;

      if (!romanQuoteItems || romanQuoteItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="padding: 20px; color: #94a3b8;">报价列表中暂无窗饰条目，请先在面板中添加产品。</td></tr>`;
        updateAdminKPIs(0, 0, 0, 0);
        return;
      }

      // Calculate total shipping weight & packages
      const pkgInfo = ROMAN_DB.calculatePackageShipping ? ROMAN_DB.calculatePackageShipping(romanQuoteItems) : null;
      const totalBilledWeight = pkgInfo ? pkgInfo.total_billed_weight_kg : 0;
      const totalEstFreightRmb = totalBilledWeight * adminFreightRmbPerKg;

      let grandFactoryRmb = 0;
      let grandFreightRmb = 0;
      let grandCostLandedRmb = 0;
      let grandCostLandedUsd = 0;
      let grandQuotedUsd = 0;

      // Distribute shipping cost per item proportional to item weight/sqm
      const totalQuoteSqm = romanQuoteItems.reduce((acc, item) => acc + (item.sqm || 1) * (item.qty || 1), 0);

      const rowsHtml = romanQuoteItems.map((item, idx) => {
        const sysCode = item.sys ? item.sys.code : 'LM0002';
        const fabCode = item.fab ? item.fab.code : 'BZL01';
        const wVal = parseFloat(item.width) || 36;
        const hVal = parseFloat(item.height) || 60;
        const itemDiscount = item.discount_factor !== undefined ? item.discount_factor : romanDiscountFactor;

        // Calculate item RMB base factory cost
        const priceObj = ROMAN_DB.calculateItemPrice(
          sysCode, fabCode, wVal, hVal, 'none', 'none', 'none', itemDiscount
        );

        // Factory bare cost in RMB for 1 unit
        const unitRmbBase = priceObj.rmb_base_cost || priceObj.rmb_base || 163.0;
        const totalRmbBase = unitRmbBase * (item.qty || 1);

        // Item proportion of shipping weight
        const itemSqm = (item.sqm || 1) * (item.qty || 1);
        const sqmRatio = totalQuoteSqm > 0 ? (itemSqm / totalQuoteSqm) : (1 / romanQuoteItems.length);
        const itemFreightRmb = totalEstFreightRmb * sqmRatio;
        const itemFreightUsd = itemFreightRmb / adminExchangeRate;

        // Total Landed Cost
        const itemLandedCostRmb = totalRmbBase + itemFreightRmb;
        const itemLandedCostUsd = itemLandedCostRmb / adminExchangeRate;

        // Quoted price to customer
        const itemCustomerUsd = (item.amount || 0);

        // Profit
        const itemProfitUsd = itemCustomerUsd - itemLandedCostUsd;
        const itemProfitRmb = itemProfitUsd * adminExchangeRate;
        const itemMarginPct = itemCustomerUsd > 0 ? ((itemProfitUsd / itemCustomerUsd) * 100) : 0;

        // Accumulate totals
        grandFactoryRmb += totalRmbBase;
        grandFreightRmb += itemFreightRmb;
        grandCostLandedRmb += itemLandedCostRmb;
        grandCostLandedUsd += itemLandedCostUsd;
        grandQuotedUsd += itemCustomerUsd;

        const isProfitPositive = itemProfitUsd >= 0;
        const profitColor = isProfitPositive ? '#16a34a' : '#dc2626';

        return `
          <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; font-size: 0.78rem;">
            <td style="padding: 6px; font-weight: 700;">${idx + 1}</td>
            <td style="padding: 6px; font-weight: 700; color: #1e293b;">${item.room || '未指定'} (${item.remark || item.mount || ''})</td>
            <td style="padding: 6px; font-family: monospace;">${item.width}" × ${item.height}" (${(item.sqm || 1).toFixed(2)} ㎡) × ${item.qty}件</td>
            <td style="padding: 6px; font-size: 0.72rem; text-align: left;">
              <strong>${item.sys ? item.sys.code : ''}</strong> ${item.sys ? item.sys.name_cn : ''}<br>
              <span class="text-muted">${item.fab ? item.fab.code : ''} ${item.fab ? item.fab.name_cn : ''}</span>
            </td>
            <td style="padding: 6px; font-weight: 700; color: #be185d; background: #fdf2f8;">¥${totalRmbBase.toFixed(2)} RMB</td>
            <td style="padding: 6px; font-weight: 700; color: #a16207; background: #fefce8;">¥${itemFreightRmb.toFixed(2)} RMB<br><span style="font-size:0.68rem; color:#ca8a04;">($${itemFreightUsd.toFixed(2)})</span></td>
            <td style="padding: 6px; font-weight: 700; color: #1e3a8a; background: #eff6ff;">¥${itemLandedCostRmb.toFixed(2)} RMB<br><span style="font-size:0.68rem; color:#3b82f6;">($${itemLandedCostUsd.toFixed(2)})</span></td>
            <td style="padding: 6px; font-weight: 800; color: #15803d; background: #f0fdf4;">$${itemCustomerUsd.toFixed(2)} USD</td>
            <td style="padding: 6px; font-weight: 800; color: ${profitColor};">$${itemProfitUsd.toFixed(2)} USD<br><span style="font-size:0.68rem;">(¥${itemProfitRmb.toFixed(2)})</span></td>
            <td style="padding: 6px; font-weight: 700; color: ${profitColor};">${itemMarginPct.toFixed(1)}%</td>
          </tr>
        `;
      }).join('');

      tbody.innerHTML = rowsHtml;
      updateAdminKPIs(grandQuotedUsd, grandFactoryRmb, grandFreightRmb, grandCostLandedUsd);
    }

    function updateAdminKPIs(grandQuotedUsd, grandFactoryRmb, grandFreightRmb, grandCostLandedUsd) {
      const grandQuotedRmb = grandQuotedUsd * adminExchangeRate;
      const grandFreightUsd = grandFreightRmb / adminExchangeRate;
      const grandFactoryUsd = grandFactoryRmb / adminExchangeRate;
      const netProfitUsd = grandQuotedUsd - grandCostLandedUsd;
      const netProfitRmb = netProfitUsd * adminExchangeRate;
      const marginPct = grandQuotedUsd > 0 ? ((netProfitUsd / grandQuotedUsd) * 100) : 0;

      const elQuoted = document.getElementById('admin-kpi-quoted');
      const elQuotedRmb = document.getElementById('admin-kpi-quoted-rmb');
      const elFreightRmb = document.getElementById('admin-kpi-freight-rmb');
      const elFreightUsd = document.getElementById('admin-kpi-freight-usd');
      const elFactoryRmb = document.getElementById('admin-kpi-factory-rmb');
      const elFactoryUsd = document.getElementById('admin-kpi-factory-usd');
      const elNetProfit = document.getElementById('admin-kpi-net-profit');
      const elNetProfitRmb = document.getElementById('admin-kpi-net-profit-rmb');

      if (elQuoted) elQuoted.textContent = `$${grandQuotedUsd.toFixed(2)} USD`;
      if (elQuotedRmb) elQuotedRmb.textContent = `¥${grandQuotedRmb.toFixed(2)} RMB`;
      if (elFreightRmb) elFreightRmb.textContent = `¥${grandFreightRmb.toFixed(2)} RMB`;
      if (elFreightUsd) elFreightUsd.textContent = `$${grandFreightUsd.toFixed(2)} USD`;
      if (elFactoryRmb) elFactoryRmb.textContent = `¥${grandFactoryRmb.toFixed(2)} RMB`;
      if (elFactoryUsd) elFactoryUsd.textContent = `$${grandFactoryUsd.toFixed(2)} USD`;
      if (elNetProfit) elNetProfit.textContent = `$${netProfitUsd.toFixed(2)} USD`;
      if (elNetProfitRmb) elNetProfitRmb.innerHTML = `¥${netProfitRmb.toFixed(2)} RMB (利润率 <span id="admin-kpi-margin-pct" style="font-weight:800; color:${netProfitUsd>=0?'#15803d':'#dc2626'}">${marginPct.toFixed(1)}%</span>)`;
    }

    // Initial Engine Bootstrap
    migrateAndPreserveAllHistoricalData();
    initQuoteNumberSequence();
    initCustomerCrmModalEngine();
    initAdminCostModalEngine();
    updateSavedOrdersBadge();
    bindCategoryTabs();
    initAddonSelects();
    renderSystemCards();
    renderFabricCategoryTabs();
    renderFabricCards();
    bindDiscountButtons();
    bindTaxButtons();
    bindAllOptionInputListeners();
    initDateManager();
    initSignaturePad();
    initDesignProposalSystem();
    initCustomFileImporter();
    initInvoicePaperDirectEditing();
    initCustomerProfileEngine();
    validateDimensions();
    calculateLiveItemPrice();
    syncCustomerMeta();
    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
  }
});

