/**
 * CardioRisk AI - Yurak Kasalliklari Xavfini Bashorat Qilish
 * Web Application Logic & Machine Learning Inference Engine (KNN & SVM)
 */

let MODEL_DATA = null;
let charts = {};

// 1. Dasturni ishga tushirish
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initTabs();
  await loadModelData();
  renderFormInputs();
  renderPresets();
  renderDatasetTable();
  initCharts();
  runPrediction(); // Dastlabki hisoblash
  setupCodeCopy();
});

// 2. Dark / Light rejimini sozlash
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
      updateChartsTheme();
    });
  }
}

// 3. Tablar navigatsiyasi
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

      // Agar grafiklar tabi ochilsa, qayta render qilish
      if (targetId === 'tab-models') {
        setTimeout(initCharts, 50);
      }
    });
  });
}

// 4. Model ma'lumotlarini yuklash
async function loadModelData() {
  try {
    const res = await fetch('model_data.json');
    if (!res.ok) throw new Error('model_data.json yuklanmadi');
    MODEL_DATA = await res.json();
  } catch (err) {
    console.warn('model_data.json fetch xatosi, fallback ishlatilmoqda:', err);
    // Standart parametrlarni o'rnatish
    MODEL_DATA = window.FALLBACK_MODEL_DATA || null;
  }
  
  if (MODEL_DATA) {
    updateSummaryBadges();
  }
}

function updateSummaryBadges() {
  const knnAccEl = document.getElementById('badge-knn-acc');
  const svmAccEl = document.getElementById('badge-svm-acc');
  const totalSamplesEl = document.getElementById('badge-samples');

  if (knnAccEl && MODEL_DATA.knn) {
    knnAccEl.textContent = `${MODEL_DATA.knn.metrics.accuracy}%`;
  }
  if (svmAccEl && MODEL_DATA.svm) {
    svmAccEl.textContent = `${MODEL_DATA.svm.metrics.accuracy}%`;
  }
  if (totalSamplesEl && MODEL_DATA.project) {
    totalSamplesEl.textContent = `${MODEL_DATA.project.total_samples} bemor`;
  }
}

// 5. Interaktiv forma maydonlarini yaratish
function renderFormInputs() {
  const container = document.getElementById('inputs-container');
  if (!container || !MODEL_DATA || !MODEL_DATA.features) return;

  container.innerHTML = '';

  MODEL_DATA.features.forEach(feature => {
    const col = document.createElement('div');
    col.className = 'bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 transition hover:border-rose-300 dark:hover:border-rose-800';

    if (feature.type === 'select') {
      let optionsHtml = feature.options.map(opt => `
        <option value="${opt.value}" ${opt.value === feature.default ? 'selected' : ''}>
          ${opt.label}
        </option>
      `).join('');

      col.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-slate-800 dark:text-slate-200">
            ${feature.name_uz}
          </label>
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
            ${feature.id}
          </span>
        </div>
        <select id="input-${feature.id}" class="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition">
          ${optionsHtml}
        </select>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">${feature.desc}</p>
      `;

      const select = col.querySelector('select');
      select.addEventListener('change', runPrediction);
    } else {
      col.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-slate-800 dark:text-slate-200">
            ${feature.name_uz}
          </label>
          <div class="flex items-center space-x-1.5">
            <span id="val-${feature.id}" class="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
              ${feature.default}
            </span>
            <span class="text-xs text-slate-400 font-medium">${feature.unit || ''}</span>
          </div>
        </div>
        <div class="space-y-2">
          <input 
            type="range" 
            id="slider-${feature.id}" 
            min="${feature.min}" 
            max="${feature.max}" 
            step="${feature.step}" 
            value="${feature.default}" 
            class="w-full accent-rose-600"
          >
          <div class="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>${feature.min} ${feature.unit || ''}</span>
            <span>${feature.max} ${feature.unit || ''}</span>
          </div>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">${feature.desc}</p>
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
        age: 38, sex: 0, cp: 2, trestbps: 110, chol: 175, fbs: 0,
        restecg: 0, thalach: 175, exang: 0, oldpeak: 0.2, slope: 2, ca: 0, thal: 2
      }
    },
    {
      name: "O'rtacha xavfli bemor",
      icon: "fa-heart-circle-bolt",
      color: "amber",
      values: {
        age: 54, sex: 1, cp: 1, trestbps: 135, chol: 245, fbs: 0,
        restecg: 1, thalach: 145, exang: 0, oldpeak: 1.2, slope: 1, ca: 1, thal: 2
      }
    },
    {
      name: "Yuqori xavfli bemor",
      icon: "fa-heart-circle-exclamation",
      color: "rose",
      values: {
        age: 67, sex: 1, cp: 0, trestbps: 160, chol: 286, fbs: 1,
        restecg: 2, thalach: 108, exang: 1, oldpeak: 3.4, slope: 0, ca: 2, thal: 3
      }
    }
  ];

  const container = document.getElementById('presets-container');
  if (!container) return;

  container.innerHTML = presets.map((p, idx) => `
    <button onclick="applyPreset(${idx})" class="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-${p.color}-500 dark:hover:border-${p.color}-500 text-slate-700 dark:text-slate-300 shadow-sm transition">
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

// 7. Joriy kiritilgan qiymatlarni yig'ish
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

// 8. StandardScaler yordamida masshtablash
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

  // Evklid masofasini hisoblash
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

  // Masofa bo'yicha saralash
  distances.sort((a, b) => a.dist - b.dist);

  // K ta eng yaqin qo'shnilarni olish va og'irlik berish
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

  // Platt scaling ehtimolligi (scikit-learn predict_proba formati)
  let prob = 0.5;
  if (probA !== 0) {
    prob = 1.0 / (1.0 + Math.exp(probA * decision + probB));
  } else {
    // Standart sigmoid fallback
    prob = 1.0 / (1.0 + Math.exp(-decision));
  }

  // Chegaralash
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

  // Umumiy o'rtacha xavf ehtimolligi
  const avgProb = (knnRes.prob + svmRes.prob) / 2.0;
  const riskPct = Math.round(avgProb * 100);

  // UI komponentlarini yangilash
  updateGauge(riskPct);
  updateModelCards(knnRes, svmRes, riskPct);
  updateRiskFactors(current.raw, avgProb);
}

// 12. Doiraviy Risk Grafikasini yangilash
function updateGauge(riskPct) {
  const gaugeFill = document.getElementById('gauge-fill');
  const gaugeText = document.getElementById('gauge-percent');
  const riskStatusBadge = document.getElementById('risk-status-badge');
  const riskDesc = document.getElementById('risk-status-desc');

  if (gaugeText) {
    gaugeText.textContent = `${riskPct}%`;
  }

  // Doira aylanasi: r=40, C=2*pi*r ≈ 251.3
  const circumference = 251.3;
  const offset = circumference - (riskPct / 100) * circumference;
  if (gaugeFill) {
    gaugeFill.style.strokeDashoffset = offset;

    // Rang gradientini xavfga qarab o'zgartirish
    if (riskPct >= 65) {
      gaugeFill.setAttribute('stroke', '#ef4444'); // Qizil
    } else if (riskPct >= 40) {
      gaugeFill.setAttribute('stroke', '#f59e0b'); // Sariq
    } else {
      gaugeFill.setAttribute('stroke', '#10b981'); // Yashil
    }
  }

  if (riskStatusBadge && riskDesc) {
    if (riskPct >= 65) {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse';
      riskStatusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> Yuqori Yurak Xastaligi Xavfi';
      riskDesc.textContent = "Bemor tibbiy ko'rsatkichlarida yurak kasalligi belgilari yuqori ehtimol bilan mavjud. Zudlik bilan kardiolog ko'rigi talab etiladi.";
    } else if (riskPct >= 40) {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      riskStatusBadge.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-1"></i> O\'rtacha Xavf Guruhi';
      riskDesc.textContent = "Bemor ko'rsatkichlarida ayrim xavfli omillar kuzatilmoqda. Qon bosimi va xolesterin miqdorini muntazam nazorat qilib borish tavsiya qilinadi.";
    } else {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      riskStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> Sog\'lom / Xavf Past';
      riskDesc.textContent = "Bemor ko'rsatkichlari me'yorda. Yurak-qon tomir tizimida jiddiy xastalik xavfi aniqlanmadi.";
    }
  }
}

// 13. Alohida KNN va SVM kartalarini yangilash
function updateModelCards(knn, svm, avgRiskPct) {
  // KNN Card
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

  // SVM Card
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

  // Konsensus
  const consensusEl = document.getElementById('model-consensus-text');
  if (consensusEl) {
    if (knn.pred === svm.pred) {
      consensusEl.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold"><i class="fa-solid fa-check-double mr-1"></i> 100% Modellar Hamfikr:</span> Har ikki algoritm (KNN va SVM) bir xil xulosaga keldi (${knn.pred === 1 ? 'Xastalik ehtimoli yuqori' : 'Xastalik xavfi mavjud emas'}).`;
    } else {
      consensusEl.innerHTML = `<span class="text-amber-600 dark:text-amber-400 font-semibold"><i class="fa-solid fa-circle-question mr-1"></i> Chegaraviy Holat:</span> Modellar o'rtasida ehtimollik farqi bor. SVM aniqligi yuqoriroq (83.6%) bo'lgani sababli uning xulosasiga ustunlik berish tavsiya etiladi.`;
    }
  }
}

// 14. Bemor xavf omillari diagnostikasini chiqarish
function updateRiskFactors(raw, prob) {
  const container = document.getElementById('risk-factors-list');
  if (!container) return;

  const factors = [];

  if (raw.trestbps >= 140) {
    factors.push({ name: "Qon bosimi (trestbps)", val: `${raw.trestbps} mm Hg`, desc: "Gipertoniya 1-2 daraja (me'yordan yuqori)", type: "danger" });
  } else if (raw.trestbps >= 130) {
    factors.push({ name: "Qon bosimi (trestbps)", val: `${raw.trestbps} mm Hg`, desc: "Pre-gipertoniya holati", type: "warning" });
  }

  if (raw.chol >= 240) {
    factors.push({ name: "Zardob xolesterini (chol)", val: `${raw.chol} mg/dl`, desc: "Yuqori xolesterinemiya (tomirlar torayishi xavfi)", type: "danger" });
  } else if (raw.chol >= 200) {
    factors.push({ name: "Zardob xolesterini (chol)", val: `${raw.chol} mg/dl`, desc: "Chegaraviy xolesterin darajasi", type: "warning" });
  }

  if (raw.exang === 1) {
    factors.push({ name: "Mashq stenokardiyasi (exang)", val: "Ha", desc: "Jismoniy yuklamada ko'krak qafasida og'riq kuzatiladi", type: "danger" });
  }

  if (raw.oldpeak >= 2.0) {
    factors.push({ name: "ST depressiyasi (oldpeak)", val: `${raw.oldpeak} mm`, desc: "Miyokard ishemiyasiga xos jiddiy EKG o'zgarishi", type: "danger" });
  }

  if (raw.ca > 0) {
    factors.push({ name: "Yirik tomirlar torayishi (ca)", val: `${raw.ca} ta tomir`, desc: "Flyuroskopiyada kalsiylangan yirik qon tomirlari", type: "danger" });
  }

  if (raw.cp === 0) {
    factors.push({ name: "Ko'krak og'rig'i (cp)", val: "Tipik stenokardiya", desc: "Yurak ishemik kasalligiga xos klassik og'riq", type: "danger" });
  }

  if (factors.length === 0) {
    container.innerHTML = `
      <div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
        <i class="fa-solid fa-circle-check text-emerald-500 text-sm"></i>
        <span>Kritik tibbiy xavf omillari aniqlanmadi. Barcha ko'rsatkichlar me'yoriy chegarada.</span>
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

// 15. Chart.js Grafiklarini initsializatsiya qilish
function initCharts() {
  if (!MODEL_DATA || typeof Chart === 'undefined') return;

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  // 1. Modellar metrikalarini taqqoslash grafigi
  const metricsCanvas = document.getElementById('chart-metrics-comparison');
  if (metricsCanvas) {
    if (charts.metrics) charts.metrics.destroy();

    const knnMet = MODEL_DATA.knn.metrics;
    const svmMet = MODEL_DATA.svm.metrics;

    charts.metrics = new Chart(metricsCanvas, {
      type: 'bar',
      data: {
        labels: ['Accuracy (Aniqlik)', 'F1-Score', 'Recall (Sezuvchanlik)', 'Precision', 'ROC-AUC'],
        datasets: [
          {
            label: 'KNN (k=7)',
            data: [knnMet.accuracy, knnMet.f1_score, knnMet.recall, knnMet.precision, knnMet.roc_auc],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: 'SVM (RBF Kernel)',
            data: [svmMet.accuracy, svmMet.f1_score, svmMet.recall, svmMet.precision, svmMet.roc_auc],
            backgroundColor: 'rgba(225, 29, 72, 0.85)',
            borderColor: '#e11d48',
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
            }
          }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: {
            min: 60,
            max: 100,
            ticks: { color: textColor, callback: (v) => `${v}%` },
            grid: { color: gridColor }
          }
        }
      }
    });
  }

  // 2. Xususiyatlar muhimligi (Feature Correlation)
  const featuresCanvas = document.getElementById('chart-feature-importance');
  if (featuresCanvas && MODEL_DATA.feature_importance) {
    if (charts.features) charts.features.destroy();

    const topFeatures = MODEL_DATA.feature_importance.slice(0, 8);
    charts.features = new Chart(featuresCanvas, {
      type: 'bar',
      data: {
        labels: topFeatures.map(f => `${f.name_uz} (${f.id})`),
        datasets: [{
          label: 'Korrelyatsiya koeffitsiyenti (r)',
          data: topFeatures.map(f => f.correlation),
          backgroundColor: topFeatures.map(f => f.correlation > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Korrelyatsiya: ${ctx.raw}`
            }
          }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }

  // 3. Confusion Matrix larni render qilish
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

function updateChartsTheme() {
  initCharts();
}

// 16. Dataset jadvalini render qilish
function renderDatasetTable() {
  const tbody = document.getElementById('dataset-table-body');
  if (!tbody || !MODEL_DATA || !MODEL_DATA.dataset_preview) return;

  const data = MODEL_DATA.dataset_preview;
  tbody.innerHTML = data.map((row, idx) => `
    <tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 font-mono text-xs">
      <td class="px-3 py-2 text-slate-400">${idx + 1}</td>
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
}

// 17. Kod nusxalash
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
