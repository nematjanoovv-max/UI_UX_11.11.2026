/**
 * CardioRisk AI - Kengaytirilgan va Chuqur Optimallashtirilgan Web Dastur Logikasi
 * ML Inference Engine (KNN, SVM, Ensemble), XAI Tahlili, What-If Simulyatori, Radar & ROC Chizmalari
 */

let MODEL_DATA = null;
let charts = {};
let currentTableFilter = 'all';
let currentTableSearch = '';
let currentTablePage = 1;
const rowsPerPage = 12;

// 1. Dasturni initsializatsiya qilish
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initTabs();
  await loadModelData();
  renderFormInputs();
  renderPresets();
  initEnhancedCharts();
  renderDatasetTable();
  runPrediction();
  setupCodeCopy();
  setupPrintReport();
});

// 2. Dark / Light Mavzu sozlash
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('cardiorisk-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  if (savedTheme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      html.classList.toggle('dark');
      const isDark = html.classList.contains('dark');
      localStorage.setItem('cardiorisk-theme', isDark ? 'dark' : 'light');
      updateAllChartsTheme();
    });
  }
}

// 3. Tablar boshqaruvi
function initTabs() {
  const tabButtons = document.querySelectorAll('[data-tab-target]');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab-target');

      tabButtons.forEach(b => {
        b.classList.remove('active', 'border-rose-600', 'text-rose-600', 'dark:text-rose-400', 'dark:border-rose-400');
        b.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400');
      });

      btn.classList.add('active', 'border-rose-600', 'text-rose-600', 'dark:text-rose-400', 'dark:border-rose-400');
      btn.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400');

      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });

      if (targetId === 'tab-models') {
        setTimeout(initEnhancedCharts, 50);
      }
    });
  });
}

// 4. Model Ma'lumotlarini yuklash
async function loadModelData() {
  try {
    const res = await fetch('model_data.json');
    if (!res.ok) throw new Error('model_data.json yuklanmadi');
    MODEL_DATA = await res.json();
  } catch (err) {
    console.warn('model_data.json fetch muammosi, fallback ishlatilmoqda:', err);
    MODEL_DATA = window.FALLBACK_MODEL_DATA || null;
  }
  
  if (MODEL_DATA) {
    updateSummaryBadges();
  }
}

function updateSummaryBadges() {
  const knnAccEl = document.getElementById('badge-knn-acc');
  const svmAccEl = document.getElementById('badge-svm-acc');
  const cvAccEl = document.getElementById('badge-cv-acc');
  const totalSamplesEl = document.getElementById('badge-samples');

  if (knnAccEl && MODEL_DATA.knn) {
    knnAccEl.textContent = `${MODEL_DATA.knn.metrics.accuracy}%`;
  }
  if (svmAccEl && MODEL_DATA.svm) {
    svmAccEl.textContent = `${MODEL_DATA.svm.metrics.accuracy}%`;
  }
  if (cvAccEl && MODEL_DATA.svm && MODEL_DATA.svm.metrics.cv_mean_acc) {
    cvAccEl.textContent = `${MODEL_DATA.svm.metrics.cv_mean_acc}% (5-Fold)`;
  }
  if (totalSamplesEl && MODEL_DATA.project) {
    totalSamplesEl.textContent = `${MODEL_DATA.project.total_samples} bemor`;
  }
}

// 5. Forma maydonlarini render qilish
function renderFormInputs() {
  const container = document.getElementById('inputs-container');
  if (!container || !MODEL_DATA || !MODEL_DATA.features) return;

  container.innerHTML = '';

  MODEL_DATA.features.forEach(feature => {
    const col = document.createElement('div');
    col.className = 'bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 transition hover:border-rose-400 dark:hover:border-rose-700';

    if (feature.type === 'select') {
      let optionsHtml = feature.options.map(opt => `
        <option value="${opt.value}" ${opt.value === feature.default ? 'selected' : ''}>
          ${opt.label}
        </option>
      `).join('');

      col.innerHTML = `
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs font-bold text-slate-800 dark:text-slate-200">
            ${feature.name_uz}
          </label>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
            ${feature.id}
          </span>
        </div>
        <select id="input-${feature.id}" class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition">
          ${optionsHtml}
        </select>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">${feature.desc}</p>
      `;

      const select = col.querySelector('select');
      select.addEventListener('change', runPrediction);
    } else {
      col.innerHTML = `
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs font-bold text-slate-800 dark:text-slate-200">
            ${feature.name_uz}
          </label>
          <div class="flex items-center space-x-1">
            <span id="val-${feature.id}" class="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
              ${feature.default}
            </span>
            <span class="text-[10px] text-slate-400">${feature.unit || ''}</span>
          </div>
        </div>
        <div class="space-y-1.5">
          <input 
            type="range" 
            id="slider-${feature.id}" 
            min="${feature.min}" 
            max="${feature.max}" 
            step="${feature.step}" 
            value="${feature.default}" 
            class="w-full accent-rose-600"
          >
          <div class="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>${feature.min}</span>
            <span>${feature.max} ${feature.unit || ''}</span>
          </div>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">${feature.desc}</p>
      `;

      const slider = col.querySelector('input[type="range"]');
      const valDisplay = col.querySelector(`#val-${feature.id}`);

      slider.addEventListener('input', (e) => {
        valDisplay.textContent = e.target.value;
        runPrediction();
      });
    }

    container.appendChild(col);
  });
}

// 6. Namunaviy profillar (Presets)
function renderPresets() {
  const presets = [
    {
      name: "Sog'lom bemor (Past xavf)",
      icon: "fa-heart-circle-check",
      color: "emerald",
      values: {
        age: 38, sex: 0, cp: 2, trestbps: 115, chol: 180, fbs: 0,
        restecg: 0, thalach: 175, exang: 0, oldpeak: 0.2, slope: 2, ca: 0, thal: 2
      }
    },
    {
      name: "O'rtacha xavfli bemor",
      icon: "fa-heart-circle-bolt",
      color: "amber",
      values: {
        age: 54, sex: 1, cp: 1, trestbps: 135, chol: 235, fbs: 0,
        restecg: 1, thalach: 148, exang: 0, oldpeak: 1.2, slope: 1, ca: 1, thal: 2
      }
    },
    {
      name: "Yuqori xavfli bemor",
      icon: "fa-heart-circle-exclamation",
      color: "orange",
      values: {
        age: 63, sex: 1, cp: 0, trestbps: 155, chol: 280, fbs: 1,
        restecg: 1, thalach: 120, exang: 1, oldpeak: 2.6, slope: 0, ca: 2, thal: 3
      }
    },
    {
      name: "Kritik holatdagi bemor",
      icon: "fa-triangle-exclamation",
      color: "rose",
      values: {
        age: 70, sex: 1, cp: 0, trestbps: 175, chol: 320, fbs: 1,
        restecg: 2, thalach: 98, exang: 1, oldpeak: 4.2, slope: 0, ca: 3, thal: 3
      }
    }
  ];

  const container = document.getElementById('presets-container');
  if (!container) return;

  container.innerHTML = presets.map((p, idx) => `
    <button onclick="applyPreset(${idx})" class="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-${p.color}-500 text-slate-700 dark:text-slate-300 shadow-sm transition">
      <i class="fa-solid ${p.icon} text-${p.color}-500"></i>
      <span>${p.name}</span>
    </button>
  `).join('');

  window.PRESETS_DATA = presets;
}

window.applyPreset = function(index) {
  const preset = window.PRESETS_DATA[index];
  if (!preset) return;

  Object.entries(preset.values).forEach(([key, val]) => {
    const slider = document.getElementById(`slider-${key}`);
    const select = document.getElementById(`input-${key}`);
    const valDisplay = document.getElementById(`val-${key}`);

    if (slider) {
      slider.value = val;
      if (valDisplay) valDisplay.textContent = val;
    } else if (select) {
      select.value = val;
    }
  });

  runPrediction();
};

window.resetForm = function() {
  if (!MODEL_DATA || !MODEL_DATA.features) return;
  MODEL_DATA.features.forEach(f => {
    const slider = document.getElementById(`slider-${f.id}`);
    const select = document.getElementById(`input-${f.id}`);
    const valDisplay = document.getElementById(`val-${f.id}`);

    if (slider) {
      slider.value = f.default;
      if (valDisplay) valDisplay.textContent = f.default;
    } else if (select) {
      select.value = f.default;
    }
  });
  runPrediction();
};

// 7. Vektor qiymatlarini yig'ish
function getCurrentVector() {
  if (!MODEL_DATA || !MODEL_DATA.features) return null;
  const values = [];
  const rawDict = {};

  MODEL_DATA.features.forEach(f => {
    const slider = document.getElementById(`slider-${f.id}`);
    const select = document.getElementById(`input-${f.id}`);
    let val = 0;
    if (slider) {
      val = parseFloat(slider.value);
    } else if (select) {
      val = parseFloat(select.value);
    } else {
      val = f.default;
    }
    values.push(val);
    rawDict[f.id] = val;
  });

  return { vector: values, raw: rawDict };
}

// 8. StandardScaler orqali masshtablash
function scaleVector(vec) {
  if (!MODEL_DATA || !MODEL_DATA.scaler) return vec;
  const mean = MODEL_DATA.scaler.mean;
  const scale = MODEL_DATA.scaler.scale;

  return vec.map((v, i) => {
    const m = mean[i] || 0;
    const s = scale[i] || 1;
    return (v - m) / s;
  });
}

// 9. KNN Inference Engine (K-Nearest Neighbors)
function predictKNN(scaledVec) {
  if (!MODEL_DATA || !MODEL_DATA.knn || !MODEL_DATA.knn.train_points) {
    return { prob: 0.5, pred: 0 };
  }

  const k = MODEL_DATA.knn.params.k || 7;
  const trainPoints = MODEL_DATA.knn.train_points;
  const trainLabels = MODEL_DATA.knn.train_labels;

  const distances = [];
  for (let i = 0; i < trainPoints.length; i++) {
    const pt = trainPoints[i];
    let sumSq = 0;
    for (let j = 0; j < scaledVec.length; j++) {
      const diff = scaledVec[j] - pt[j];
      sumSq += diff * diff;
    }
    const dist = Math.sqrt(sumSq);
    distances.push({ dist, label: trainLabels[i] });
  }

  distances.sort((a, b) => a.dist - b.dist);
  const topK = distances.slice(0, k);

  let totalWeight = 0;
  let positiveWeight = 0;

  for (let i = 0; i < topK.length; i++) {
    const w = 1.0 / (topK[i].dist + 1e-5);
    totalWeight += w;
    if (topK[i].label === 1) {
      positiveWeight += w;
    }
  }

  const prob = totalWeight > 0 ? positiveWeight / totalWeight : 0.5;
  const pred = prob >= 0.5 ? 1 : 0;

  return { prob, pred, topK };
}

// 10. SVM Inference Engine (RBF Kernel Support Vector Machine)
function predictSVM(scaledVec) {
  if (!MODEL_DATA || !MODEL_DATA.svm || !MODEL_DATA.svm.support_vectors) {
    return { prob: 0.5, pred: 0 };
  }

  const gamma = MODEL_DATA.svm.gamma;
  const intercept = MODEL_DATA.svm.intercept;
  const dualCoef = MODEL_DATA.svm.dual_coef;
  const supportVectors = MODEL_DATA.svm.support_vectors;
  const probA = MODEL_DATA.svm.prob_a;
  const probB = MODEL_DATA.svm.prob_b;

  let decision = intercept;
  for (let i = 0; i < supportVectors.length; i++) {
    const sv = supportVectors[i];
    let sumSq = 0;
    for (let j = 0; j < scaledVec.length; j++) {
      const diff = scaledVec[j] - sv[j];
      sumSq += diff * diff;
    }
    const kVal = Math.exp(-gamma * sumSq);
    decision += dualCoef[i] * kVal;
  }

  let prob = 0.5;
  if (probA !== 0) {
    prob = 1.0 / (1.0 + Math.exp(probA * decision + probB));
  } else {
    prob = 1.0 / (1.0 + Math.exp(-decision));
  }

  prob = Math.max(0.01, Math.min(0.99, prob));
  const pred = prob >= 0.5 ? 1 : 0;

  return { prob, pred, decision };
}

// 11. Asosiy Bashorat Funksiyasi (Real-vaqtda UI yangilash)
function runPrediction() {
  const current = getCurrentVector();
  if (!current) return;

  const scaled = scaleVector(current.vector);
  const knnRes = predictKNN(scaled);
  const svmRes = predictSVM(scaled);

  // Ensemble Konsensusi (Og'irlik: SVM 60%, KNN 40%)
  const ensembleProb = (svmRes.prob * 0.6) + (knnRes.prob * 0.4);
  const riskPct = Math.round(ensembleProb * 100);

  updateGauge(riskPct);
  updateModelCards(knnRes, svmRes, riskPct);
  updateRiskFactors(current.raw, ensembleProb);
  updateWhatIfSimulator(current.raw, ensembleProb);
  updatePatientRadar(current.raw);
}

// 12. 4-Darajali Gauge Stratifikatsiyasi
function updateGauge(riskPct) {
  const gaugeFill = document.getElementById('gauge-fill');
  const gaugeText = document.getElementById('gauge-percent');
  const riskStatusBadge = document.getElementById('risk-status-badge');
  const riskDesc = document.getElementById('risk-status-desc');
  const riskCategoryName = document.getElementById('risk-category-name');

  if (gaugeText) {
    gaugeText.textContent = `${riskPct}%`;
  }

  const circumference = 251.3;
  const offset = circumference - (riskPct / 100) * circumference;
  if (gaugeFill) {
    gaugeFill.style.strokeDashoffset = offset;

    if (riskPct >= 75) {
      gaugeFill.setAttribute('stroke', '#dc2626'); // Qizil (Kritik)
    } else if (riskPct >= 50) {
      gaugeFill.setAttribute('stroke', '#f97316'); // To'q sariq (Yuqori)
    } else if (riskPct >= 25) {
      gaugeFill.setAttribute('stroke', '#f59e0b'); // Sariq (O'rtacha)
    } else {
      gaugeFill.setAttribute('stroke', '#10b981'); // Yashil (Past)
    }
  }

  if (riskStatusBadge && riskDesc) {
    if (riskPct >= 75) {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse';
      riskStatusBadge.innerHTML = '<i class="fa-solid fa-radiation mr-1"></i> 4-Daraja: Kritik Yurak Xastaligi Xavfi';
      if (riskCategoryName) riskCategoryName.textContent = "Kritik Xavf";
      riskDesc.textContent = "Bemor tibbiy ko'rsatkichlarida miokard ishemiyasi va koronar qon tomirlar torayishining jiddiy belgilari mavjud. Zudlik bilan kardiologik tekshiruv va EKG/Koronorografiya talab etiladi.";
    } else if (riskPct >= 50) {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-300 dark:border-orange-800';
      riskStatusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> 3-Daraja: Yuqori Xavf Guruhi';
      if (riskCategoryName) riskCategoryName.textContent = "Yuqori Xavf";
      riskDesc.textContent = "Yurak kasalligi rivojlanish xavfi yuqori. Stenokardik belgilar, qon bosimi va xolesterinni qat'iy nazorat ostiga olish, medikamentoz terapiya zarur.";
    } else if (riskPct >= 25) {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      riskStatusBadge.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-1"></i> 2-Daraja: O\'rtacha Xavf Guruhi';
      if (riskCategoryName) riskCategoryName.textContent = "O'rtacha Xavf";
      riskDesc.textContent = "Bemor ko'rsatkichlarida ayrim xavfli belgilar (pre-gipertoniya yoki chegaraviy xolesterin) kuzatilmoqda. Parhez va turmush tarzini sog'lomlashtirish tavsiya etiladi.";
    } else {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      riskStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> 1-Daraja: Past Xavf / Sog\'lom';
      if (riskCategoryName) riskCategoryName.textContent = "Past Xavf";
      riskDesc.textContent = "Klinik ko'rsatkichlar me'yoriy oraliqda. Yurak-qon tomir tizimi funksiyasi barqaror, kasallik belgilari aniqlanmadi.";
    }
  }
}

// 13. Alohida Model Kartalarini yangilash
function updateModelCards(knn, svm, avgRiskPct) {
  const knnPct = Math.round(knn.prob * 100);
  const knnValEl = document.getElementById('knn-result-pct');
  const knnBarEl = document.getElementById('knn-result-bar');
  const knnBadgeEl = document.getElementById('knn-result-badge');

  if (knnValEl) knnValEl.textContent = `${knnPct}%`;
  if (knnBarEl) {
    knnBarEl.style.width = `${knnPct}%`;
    knnBarEl.className = `h-2 rounded-full transition-all duration-500 ${knnPct >= 50 ? 'bg-rose-500' : 'bg-emerald-500'}`;
  }
  if (knnBadgeEl) {
    knnBadgeEl.textContent = knn.pred === 1 ? 'Xavf Bor' : 'Xavf Yo\'q';
    knnBadgeEl.className = `px-2 py-0.5 text-xs font-semibold rounded-md ${knn.pred === 1 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`;
  }

  const svmPct = Math.round(svm.prob * 100);
  const svmValEl = document.getElementById('svm-result-pct');
  const svmBarEl = document.getElementById('svm-result-bar');
  const svmBadgeEl = document.getElementById('svm-result-badge');

  if (svmValEl) svmValEl.textContent = `${svmPct}%`;
  if (svmBarEl) {
    svmBarEl.style.width = `${svmPct}%`;
    svmBarEl.className = `h-2 rounded-full transition-all duration-500 ${svmPct >= 50 ? 'bg-rose-500' : 'bg-emerald-500'}`;
  }
  if (svmBadgeEl) {
    svmBadgeEl.textContent = svm.pred === 1 ? 'Xavf Bor' : 'Xavf Yo\'q';
    svmBadgeEl.className = `px-2 py-0.5 text-xs font-semibold rounded-md ${svm.pred === 1 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`;
  }

  const consensusEl = document.getElementById('model-consensus-text');
  if (consensusEl) {
    if (knn.pred === svm.pred) {
      consensusEl.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold"><i class="fa-solid fa-check-double mr-1"></i> Modellar To'liq Hamfikr:</span> KNN (${knnPct}%) va SVM (${svmPct}%) bir xil xulosani qayd etdi (${knn.pred === 1 ? 'Yurak xastaligi xavfi mavjud' : 'Xastalik xavfi mavjud emas'}).`;
    } else {
      consensusEl.innerHTML = `<span class="text-amber-600 dark:text-amber-400 font-semibold"><i class="fa-solid fa-circle-question mr-1"></i> Chegaraviy Holat:</span> Modellarda ehtimollik farqlari mavjud (SVM: ${svmPct}%, KNN: ${knnPct}%). 93.9% Recall ko'rsatkichiga ega SVM xulosasi ustun hisoblanadi.`;
    }
  }
}

// 14. Xavf omillari ro'yxati
function updateRiskFactors(raw, prob) {
  const container = document.getElementById('risk-factors-list');
  if (!container) return;

  const factors = [];

  if (raw.trestbps >= 140) {
    factors.push({ name: "Qon bosimi (trestbps)", val: `${raw.trestbps} mm Hg`, desc: "Gipertoniya 1-2 daraja (me'yordan ancha yuqori)", type: "danger" });
  } else if (raw.trestbps >= 130) {
    factors.push({ name: "Qon bosimi (trestbps)", val: `${raw.trestbps} mm Hg`, desc: "Pre-gipertoniya holati", type: "warning" });
  }

  if (raw.chol >= 240) {
    factors.push({ name: "Zardob xolesterini (chol)", val: `${raw.chol} mg/dl`, desc: "Giperxolesterinemiya (tomirlar torayishi xavfi)", type: "danger" });
  } else if (raw.chol >= 200) {
    factors.push({ name: "Zardob xolesterini (chol)", val: `${raw.chol} mg/dl`, desc: "Chegaraviy xolesterin darajasi", type: "warning" });
  }

  if (raw.exang === 1) {
    factors.push({ name: "Mashq stenokardiyasi (exang)", val: "Ha", desc: "Jismoniy yuklamada ko'krak qafasida og'riq kuzatiladi", type: "danger" });
  }

  if (raw.oldpeak >= 2.0) {
    factors.push({ name: "ST depressiyasi (oldpeak)", val: `${raw.oldpeak} mm`, desc: "Miokard ishemiyasiga xos jiddiy EKG o'zgarishi", type: "danger" });
  }

  if (raw.ca > 0) {
    factors.push({ name: "Yirik tomirlar (ca)", val: `${raw.ca} ta tomir`, desc: "Flyuroskopiyada kalsiylangan yirik qon tomirlari", type: "danger" });
  }

  if (raw.cp === 0) {
    factors.push({ name: "Ko'krak og'rig'i (cp)", val: "Tipik stenokardiya", desc: "Klassik koronar og'riq belgisi", type: "danger" });
  }

  if (factors.length === 0) {
    container.innerHTML = `
      <div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
        <i class="fa-solid fa-circle-check text-emerald-500 text-sm"></i>
        <span>Kritik tibbiy xavf omillari aniqlanmadi. Ko'rsatkichlar me'yorda.</span>
      </div>
    `;
  } else {
    container.innerHTML = factors.map(f => `
      <div class="p-2.5 rounded-lg ${f.type === 'danger' ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60' : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60'} text-xs flex items-start space-x-2">
        <i class="fa-solid ${f.type === 'danger' ? 'fa-circle-xmark text-rose-500' : 'fa-triangle-exclamation text-amber-500'} mt-0.5"></i>
        <div class="flex-1">
          <div class="flex justify-between font-semibold ${f.type === 'danger' ? 'text-rose-900 dark:text-rose-300' : 'text-amber-900 dark:text-amber-300'}">
            <span>${f.name}</span>
            <span class="font-mono">${f.val}</span>
          </div>
          <p class="text-slate-600 dark:text-slate-400 mt-0.5">${f.desc}</p>
        </div>
      </div>
    `).join('');
  }
}

// 15. "What-If" Interaktiv Profilaktika Simulyatori
function updateWhatIfSimulator(raw, currentProb) {
  const container = document.getElementById('whatif-container');
  if (!container || !MODEL_DATA) return;

  // Agar qon bosimi 120 ga, xolesterin 185 ga, ST depressiyasi 0.2 ga tushirilsa
  const optimizedValues = { ...raw };
  optimizedValues.trestbps = Math.min(optimizedValues.trestbps, 120);
  optimizedValues.chol = Math.min(optimizedValues.chol, 190);
  optimizedValues.oldpeak = Math.min(optimizedValues.oldpeak, 0.5);
  optimizedValues.exang = 0;

  const optVector = MODEL_DATA.features.map(f => optimizedValues[f.id] ?? f.default);
  const optScaled = scaleVector(optVector);
  const optKnn = predictKNN(optScaled);
  const optSvm = predictSVM(optScaled);
  const optProb = (optSvm.prob * 0.6) + (optKnn.prob * 0.4);

  const currentPct = Math.round(currentProb * 100);
  const optPct = Math.round(optProb * 100);
  const diffPct = Math.max(0, currentPct - optPct);

  container.innerHTML = `
    <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800/80 dark:to-slate-850 border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center space-x-1.5">
          <i class="fa-solid fa-wand-magic-sparkles text-indigo-500"></i>
          <span>"What-If" Profilaktika Simulyatori</span>
        </h4>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/70 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-300">
          Prognoz
        </span>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
        Agar bemor qon bosimini <strong>120 mm Hg</strong> ga, xolesterinni <strong>190 mg/dl</strong> ga tushirsa va jismoniy mashqlar orqali ishemiyani kamaytirsa:
      </p>
      <div class="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-100 dark:border-slate-800">
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Joriy Xavf:</span>
          <span class="text-lg font-mono font-bold text-rose-600 dark:text-rose-400">${currentPct}%</span>
        </div>
        <div class="text-center">
          <i class="fa-solid fa-arrow-right text-indigo-400 text-sm"></i>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Optimallashgan:</span>
          <span class="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">${optPct}%</span>
        </div>
        <div class="text-right">
          <span class="text-[10px] uppercase font-bold text-emerald-500 block">Kamayish:</span>
          <span class="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400">-${diffPct}%</span>
        </div>
      </div>
    </div>
  `;
}

// 16. Bemor Radar Diagrammasi
function updatePatientRadar(raw) {
  const canvas = document.getElementById('chart-patient-radar');
  if (!canvas || !MODEL_DATA || !MODEL_DATA.radar_baselines) return;

  const baselines = MODEL_DATA.radar_baselines;
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  // Normalizatsiya qilingan qiymatlar (0 - 100 oralig'ida)
  const norm = (val, max) => Math.min(100, Math.round((val / max) * 100));

  const maxes = [80, 200, 350, 200, 5.0, 3];
  const patientNorm = [
    norm(raw.age, maxes[0]),
    norm(raw.trestbps, maxes[1]),
    norm(raw.chol, maxes[2]),
    norm(raw.thalach, maxes[3]),
    norm(raw.oldpeak, maxes[4]),
    norm(raw.ca, maxes[5])
  ];

  const healthyNorm = [
    norm(baselines.healthy[0], maxes[0]),
    norm(baselines.healthy[1], maxes[1]),
    norm(baselines.healthy[2], maxes[2]),
    norm(baselines.healthy[3], maxes[3]),
    norm(baselines.healthy[4], maxes[4]),
    norm(baselines.healthy[5], maxes[5])
  ];

  if (charts.radar) charts.radar.destroy();

  charts.radar = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: baselines.labels_uz,
      datasets: [
        {
          label: 'Joriy Bemor',
          data: patientNorm,
          backgroundColor: 'rgba(225, 29, 72, 0.25)',
          borderColor: '#e11d48',
          borderWidth: 2,
          pointBackgroundColor: '#e11d48'
        },
        {
          label: "Sog'lom Standart",
          data: healthyNorm,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          borderWidth: 2,
          pointBackgroundColor: '#10b981'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: gridColor },
          angleLines: { color: gridColor },
          pointLabels: { color: textColor, font: { size: 10, weight: '600' } }
        }
      },
      plugins: {
        legend: { labels: { color: textColor, font: { size: 11, weight: '600' } } }
      }
    }
  });
}

// 17. Kengaytirilgan Modellarni Taqqoslash Grafiklari
function initEnhancedCharts() {
  if (!MODEL_DATA || typeof Chart === 'undefined') return;

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  // 1. Asosiy Metrikalar
  const metricsCanvas = document.getElementById('chart-metrics-comparison');
  if (metricsCanvas) {
    if (charts.metrics) charts.metrics.destroy();
    const knnMet = MODEL_DATA.knn.metrics;
    const svmMet = MODEL_DATA.svm.metrics;

    charts.metrics = new Chart(metricsCanvas, {
      type: 'bar',
      data: {
        labels: ['Accuracy', 'Recall', 'Specificity', 'F1-Score', 'Precision', 'ROC-AUC', 'Balanced Acc'],
        datasets: [
          {
            label: 'KNN (k=7)',
            data: [knnMet.accuracy, knnMet.recall, knnMet.specificity, knnMet.f1_score, knnMet.precision, knnMet.roc_auc, knnMet.balanced_accuracy],
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderRadius: 6
          },
          {
            label: 'SVM (RBF Kernel)',
            data: [svmMet.accuracy, svmMet.recall, svmMet.specificity, svmMet.f1_score, svmMet.precision, svmMet.roc_auc, svmMet.balanced_accuracy],
            backgroundColor: 'rgba(225, 29, 72, 0.85)',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { min: 60, max: 100, ticks: { color: textColor, callback: (v) => `${v}%` }, grid: { color: gridColor } }
        }
      }
    });
  }

  // 2. ROC Egri Chiziqlari (ROC Curves)
  const rocCanvas = document.getElementById('chart-roc-curve');
  if (rocCanvas && MODEL_DATA.roc_curves) {
    if (charts.roc) charts.roc.destroy();

    charts.roc = new Chart(rocCanvas, {
      type: 'line',
      data: {
        datasets: [
          {
            label: `SVM (AUC = ${MODEL_DATA.svm.metrics.roc_auc}%)`,
            data: MODEL_DATA.roc_curves.svm,
            borderColor: '#e11d48',
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
            fill: true,
            tension: 0.2,
            borderWidth: 2
          },
          {
            label: `KNN (AUC = ${MODEL_DATA.knn.metrics.roc_auc}%)`,
            data: MODEL_DATA.roc_curves.knn,
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.2,
            borderWidth: 2
          },
          {
            label: 'Tasodifiy chegara (AUC = 50%)',
            data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
            borderColor: '#94a3b8',
            borderDash: [3, 3],
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
          x: { type: 'linear', min: 0, max: 1, title: { display: true, text: 'False Positive Rate (1 - Specificity)', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
          y: { min: 0, max: 1, title: { display: true, text: 'True Positive Rate (Sensitivity / Recall)', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
    });
  }

  // 3. 5-Fold Cross Validation Folds
  const cvCanvas = document.getElementById('chart-cv-folds');
  if (cvCanvas && MODEL_DATA.svm.metrics.cv_folds) {
    if (charts.cv) charts.cv.destroy();

    charts.cv = new Chart(cvCanvas, {
      type: 'bar',
      data: {
        labels: ['Fold 1', 'Fold 2', 'Fold 3', 'Fold 4', 'Fold 5'],
        datasets: [
          {
            label: 'SVM Cross-Val (%)',
            data: MODEL_DATA.svm.metrics.cv_folds,
            backgroundColor: 'rgba(225, 29, 72, 0.8)',
            borderRadius: 6
          },
          {
            label: 'KNN Cross-Val (%)',
            data: MODEL_DATA.knn.metrics.cv_folds,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { min: 60, max: 100, ticks: { color: textColor, callback: (v) => `${v}%` }, grid: { color: gridColor } }
        }
      }
    });
  }

  // 4. K Tuning Curve
  const kCanvas = document.getElementById('chart-k-curve');
  if (kCanvas && MODEL_DATA.k_tuning_curve) {
    if (charts.kCurve) charts.kCurve.destroy();

    const kData = MODEL_DATA.k_tuning_curve;
    charts.kCurve = new Chart(kCanvas, {
      type: 'line',
      data: {
        labels: kData.map(d => `k=${d.k}`),
        datasets: [
          {
            label: 'Accuracy (%)',
            data: kData.map(d => d.accuracy),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            fill: true,
            tension: 0.3,
            borderWidth: 2
          },
          {
            label: 'F1-Score (%)',
            data: kData.map(d => d.f1_score),
            borderColor: '#10b981',
            tension: 0.3,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { min: 70, max: 90, ticks: { color: textColor, callback: (v) => `${v}%` }, grid: { color: gridColor } }
        }
      }
    });
  }

  // 5. Xususiyatlar Muhimligi
  const featuresCanvas = document.getElementById('chart-feature-importance');
  if (featuresCanvas && MODEL_DATA.feature_importance) {
    if (charts.features) charts.features.destroy();

    const topFeatures = MODEL_DATA.feature_importance.slice(0, 9);
    charts.features = new Chart(featuresCanvas, {
      type: 'bar',
      data: {
        labels: topFeatures.map(f => `${f.name_uz} (${f.id})`),
        datasets: [{
          label: 'Korrelyatsiya koeffitsiyenti (r)',
          data: topFeatures.map(f => f.correlation),
          backgroundColor: topFeatures.map(f => f.correlation > 0 ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)'),
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }

  renderConfusionMatrix('cm-knn-grid', MODEL_DATA.knn.metrics.confusion_matrix, 'KNN');
  renderConfusionMatrix('cm-svm-grid', MODEL_DATA.svm.metrics.confusion_matrix, 'SVM');
}

function renderConfusionMatrix(containerId, cm, modelName) {
  const container = document.getElementById(containerId);
  if (!container || !cm) return;

  const tn = cm[0][0];
  const fp = cm[0][1];
  const fn = cm[1][0];
  const tp = cm[1][1];
  const total = tn + fp + fn + tp;

  container.innerHTML = `
    <div class="grid grid-cols-2 gap-2 text-center text-xs">
      <div class="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
        <span class="block text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">True Negative (TN)</span>
        <span class="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">${tn}</span>
        <span class="block text-[10px] text-slate-500">Sog'lom to'g'ri topildi</span>
      </div>
      <div class="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
        <span class="block text-[10px] text-rose-800 dark:text-rose-300 font-semibold">False Positive (FP)</span>
        <span class="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">${fp}</span>
        <span class="block text-[10px] text-slate-500">Sog'lomga kasal deb xato</span>
      </div>
      <div class="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
        <span class="block text-[10px] text-rose-800 dark:text-rose-300 font-semibold">False Negative (FN)</span>
        <span class="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">${fn}</span>
        <span class="block text-[10px] text-slate-500">Kasalni o'tkazib yubordi</span>
      </div>
      <div class="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
        <span class="block text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">True Positive (TP)</span>
        <span class="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">${tp}</span>
        <span class="block text-[10px] text-slate-500">Kasallik to'g'ri topildi</span>
      </div>
    </div>
    <div class="mt-2 text-[11px] text-slate-500 dark:text-slate-400 text-center">
      Test to'plami: <span class="font-mono font-semibold">${total} ta bemor</span> (${modelName} aniqligi: <span class="font-bold text-rose-600 dark:text-rose-400">${Math.round(((tp+tn)/total)*1000)/10}%</span>)
    </div>
  `;
}

function updateAllChartsTheme() {
  initEnhancedCharts();
  const current = getCurrentVector();
  if (current) updatePatientRadar(current.raw);
}

// 18. Filtrlash va Qidiruvga ega Dataset Jadvali
function renderDatasetTable() {
  const tbody = document.getElementById('dataset-table-body');
  if (!tbody || !MODEL_DATA || !MODEL_DATA.dataset_preview) return;

  let data = MODEL_DATA.dataset_preview;

  // Filtr
  if (currentTableFilter === 'diseased') {
    data = data.filter(r => r.target === 1);
  } else if (currentTableFilter === 'healthy') {
    data = data.filter(r => r.target === 0);
  }

  // Qidiruv (Yosh, Qon bosimi va b.)
  if (currentTableSearch.trim()) {
    const q = currentTableSearch.toLowerCase();
    data = data.filter(r => 
      String(r.age).includes(q) ||
      String(r.trestbps).includes(q) ||
      String(r.chol).includes(q) ||
      String(r.thalach).includes(q)
    );
  }

  const totalFiltered = data.length;
  const startIdx = (currentTablePage - 1) * rowsPerPage;
  const pageData = data.slice(startIdx, startIdx + rowsPerPage);

  const countBadge = document.getElementById('dataset-count-badge');
  if (countBadge) countBadge.textContent = `${totalFiltered} ta bemor topildi`;

  tbody.innerHTML = pageData.map((row, idx) => `
    <tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 font-mono text-xs">
      <td class="px-3 py-2 text-slate-400">${startIdx + idx + 1}</td>
      <td class="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">${row.age}</td>
      <td class="px-3 py-2">${row.sex === 1 ? 'Erkak' : 'Ayol'}</td>
      <td class="px-3 py-2">${row.cp}</td>
      <td class="px-3 py-2 font-semibold text-rose-600 dark:text-rose-400">${row.trestbps}</td>
      <td class="px-3 py-2">${row.chol}</td>
      <td class="px-3 py-2">${row.fbs}</td>
      <td class="px-3 py-2">${row.restecg}</td>
      <td class="px-3 py-2 text-blue-600 dark:text-blue-400 font-semibold">${row.thalach}</td>
      <td class="px-3 py-2">${row.exang}</td>
      <td class="px-3 py-2">${row.oldpeak}</td>
      <td class="px-3 py-2">${row.slope}</td>
      <td class="px-3 py-2">${row.ca}</td>
      <td class="px-3 py-2">${row.thal}</td>
      <td class="px-3 py-2">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${row.target === 1 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}">
          ${row.target === 1 ? 'Xavf Bor (1)' : 'Sog\'lom (0)'}
        </span>
      </td>
    </tr>
  `).join('');

  // Pagination tugmalari
  const maxPage = Math.ceil(totalFiltered / rowsPerPage) || 1;
  const pageDisplay = document.getElementById('table-page-display');
  if (pageDisplay) pageDisplay.textContent = `${currentTablePage} / ${maxPage}`;
}

window.filterTable = function(type) {
  currentTableFilter = type;
  currentTablePage = 1;
  
  document.querySelectorAll('[data-filter-btn]').forEach(btn => {
    if (btn.getAttribute('data-filter-btn') === type) {
      btn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white';
    } else {
      btn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  });

  renderDatasetTable();
};

window.searchTable = function(val) {
  currentTableSearch = val;
  currentTablePage = 1;
  renderDatasetTable();
};

window.prevTablePage = function() {
  if (currentTablePage > 1) {
    currentTablePage--;
    renderDatasetTable();
  }
};

window.nextTablePage = function() {
  if (!MODEL_DATA) return;
  const total = MODEL_DATA.dataset_preview.length;
  if (currentTablePage * rowsPerPage < total) {
    currentTablePage++;
    renderDatasetTable();
  }
};

// 19. Tibbiy Hisobotni Chop Etish / PDF
function setupPrintReport() {
  window.printDiagnosticReport = function() {
    const current = getCurrentVector();
    if (!current) return;

    const scaled = scaleVector(current.vector);
    const knn = predictKNN(scaled);
    const svm = predictSVM(scaled);
    const avgProb = (svm.prob * 0.6) + (knn.prob * 0.4);
    const riskPct = Math.round(avgProb * 100);

    const reportWindow = window.open('', '_blank');
    const now = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kardiologik Diagnostika Xulosasi - CardioRisk AI</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; }
          .header { border-bottom: 2px solid #e11d48; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 22px; font-weight: bold; color: #be123c; }
          .date { font-size: 12px; color: #64748b; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #475569; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
          th { background: #f8fafc; font-weight: 600; }
          .risk-box { padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; font-weight: bold; }
          .risk-high { background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; }
          .risk-low { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">CardioRisk AI • Kardiologik Diagnostika Xulosasi</div>
            <div style="font-size: 12px; color: #64748b;">Yurak kasalliklari xavfini bashorat qilish tizimi (KNN & SVM)</div>
          </div>
          <div class="date">${now}</div>
        </div>

        <div class="risk-box ${riskPct >= 50 ? 'risk-high' : 'risk-low'}">
          Umumiy Yurak Xastaligi Ehtimoli: ${riskPct}% (${riskPct >= 50 ? 'XAVF YUQORI' : 'XAVF PAST / ME\'YORDA'})
          <div style="font-size: 12px; font-weight: normal; margin-top: 4px;">
            SVM Bashorati: ${Math.round(svm.prob*100)}% | KNN Bashorati: ${Math.round(knn.prob*100)}%
          </div>
        </div>

        <div class="section">
          <div class="section-title">Bemor Klinik Ko'rsatkichlari</div>
          <table>
            <tr><th>Yosh:</th><td>${current.raw.age} yosh</td><th>Jins:</th><td>${current.raw.sex === 1 ? 'Erkak' : 'Ayol'}</td></tr>
            <tr><th>Qon bosimi (trestbps):</th><td>${current.raw.trestbps} mm Hg</td><th>Zardob xolesterini:</th><td>${current.raw.chol} mg/dl</td></tr>
            <tr><th>Maksimal puls (thalach):</th><td>${current.raw.thalach} bpm</td><th>Och qoringa qand (fbs):</th><td>${current.raw.fbs === 1 ? '> 120 mg/dl' : 'Me\'yorda'}</td></tr>
            <tr><th>ST depressiyasi (oldpeak):</th><td>${current.raw.oldpeak} mm</td><th>Mashq stenokardiyasi:</th><td>${current.raw.exang === 1 ? 'Mavjud' : 'Yo\'q'}</td></tr>
            <tr><th>Bo'yalgan tomirlar (ca):</th><td>${current.raw.ca} ta</td><th>Ko'krak og'rig'i (cp):</th><td>${current.raw.cp}-toifa</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Kardiologik Tavsiyalar</div>
          <ul style="font-size: 12px; line-height: 1.6; color: #334155;">
            ${riskPct >= 50 
              ? '<li>Shifokor-kardiolog ko\'rigidan zudlik bilan o\'tish va EKG/ExoKG tekshiruvlarini bajarish tavsiya etiladi.</li><li>Qon bosimi va xolesterin darajasini pasaytirishga qaratilgan profilaktik davolash rejasini tuzish.</li><li>Jismoniy va emotsional zo\'riqishlarni cheklash.</li>' 
              : '<li>Yurak-qon tomir tizimi yaxshi holatda. Yiliga 1 marta rejaviy profilaktik ko\'rikdan o\'tish kifoya.</li><li>To\'g\'ri ovqatlanish va haftasiga kamida 150 daqiqa me\'yordagi jismoniy faollikni davom ettirish.</li>'}
          </ul>
        </div>

        <div class="footer">
          CardioRisk AI v2.0 • UCI Machine Learning Dataset asosida o'qitilgan (SVM 83.6% Accuracy, 93.9% Recall)
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    reportWindow.document.close();
  };
}

// 20. Koddan nusxa olish
function setupCodeCopy() {
  const copyBtn = document.getElementById('copy-code-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const codeEl = document.getElementById('python-code-block');
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check text-emerald-500 mr-1.5"></i> Nusxalandi!';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy mr-1.5"></i> Koddan nusxa olish';
          }, 2000);
        });
      }
    });
  }
}
