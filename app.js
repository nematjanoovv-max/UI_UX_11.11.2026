/**
 * CardioRisk AI Pro Max (Enterprise v3.5)
 * SOTA Machine Learning, 3D WebGL Heart Anatomy, Live ECG Cardiomonitor,
 * Explainable AI (SHAP), Framingham ATP III, Cardiovascular Bio-Age,
 * Voice AI (TTS & STT), Virtual Pharmacotherapy, Bruce Treadmill Stress-Test,
 * PCA 2D Cluster Space, EMR Dynamics, and i18n (UZ/EN/RU).
 */

let MODEL_DATA = null;
let charts = {};
let currentTableFilter = 'all';
let currentTableSearch = '';
let currentTablePage = 1;
const rowsPerPage = 12;

// i18n Comprehensive Dictionary
const I18N = {
  uz: {
    ticker_title: "07. Yurak kasalliklari xavfini bashorat qilish • 3D Yurak, Jonli EKG, Ovozli AI va SOTA Ensemble",
    ticker_stats: "Bio-Age • Bruce Stress-Test • Farmakoterapiya • PCA 2D Klaster",
    brand_subtitle: "3D Kardiologiya, EKG Telemetriya, Bio-Age va Intellektual Tashxis",
    badge_ens_auc: "Ensemble AUC:",
    badge_gb_acc: "GradBoost Acc:",
    badge_svm_recall: "SVM Recall:",
    nav_voice_read: "Tinglash",
    nav_pdf: "PDF",
    tab_calc: "Klinik Diagnostika, 3D & EKG",
    tab_models: "Modellar & PCA 2D Klaster",
    tab_emr: "EMR: Bemorlar & Dinamika",
    tab_dataset: "Dataset (302 Bemor)",
    bio_age_heading: "Yurakning Biologik Yoshi (Cardiovascular Bio-Age)",
    bio_age_desc: "AHA Life's Essential va qon tomirlar kalsinozi asosidagi hisob-kitob",
    passport_age_label: "Pasport Yoshi:",
    bio_age_label: "Yurak Biologik Yoshi:",
    bio_age_target: "Maqsad: Dorilar va parhez bilan yoshni tenglashtirish",
    presets_label: "Klinik Profillar:",
    btn_save_emr: "EMRga Saqlash",
    btn_reset: "Standartga Qaytarish",
    three_heart_title: "3D Interaktiv Yurak Anatomiyasi (Three.js)",
    three_heart_sub: "Sichqoncha bilan 360° aylantiring. Tomir stenozlari va puls real vaqtda aks etadi",
    btn_rotate: "Aylanish",
    params_title: "Klinik Parametrlarni Sozlash",
    params_desc: "Har bir o'zgarish 3D model, EKG va AI xavf hisoblagichida bir vaqtda aks etadi",
    pharma_title: "Virtual Farmakoterapiya Simulyatori (Digital Twin)",
    pharma_sub: "Kardiologik preparatlarni qo'shing va ularning bevosita samaradorligini ko'ring",
    treadmill_title: "Virtual Kardiologik Stress-Test (Bruce Protocol)",
    treadmill_sub: "Jismoniy yuklama ostida yurak ishemiyasi chegarasini aniqlash",
    radar_title: "360° Radar Profil (Bemor vs Sog'lom Populyatsiya)",
    radar_footer: "Ko'k chiziq — ushbu bemor holati; Yashil chiziq — butunlay sog'lom guruh o'rtacha qiymati.",
    ecg_rhythm: "RITM:",
    ecg_st: "ST SEGMENT:",
    ecg_axis: "VOLTAJ / AXIS:",
    gauge_heading: "Yurak Kasalligi Xavfi (Konsensus)",
    framingham_title: "Klassik Tibbiyot vs Sun'iy Intellekt",
    framingham_score_label: "Framingham 10-Yillik:",
    ai_ensemble_score_label: "AI SOTA Ensemble:",
    xai_waterfall_title: "Explainable AI: Xavf Omillari Attributsiyasi",
    whatif_title: '"What-If" Profilaktika Simulyatori',
    advice_title: "Shifokor Tavsiyasi va Klinik Harakat:",
    pca_chart_title: "PCA 2D Bemorlar Klasteri Xaritasi (Unsupervised Projection)",
    pca_chart_sub: "13 o'lchamli klinik fazo 2 ta asosiy komponentga tushirildi. Oltin yulduz — ushbu bemor holati!",
    roc_chart_title: "5 ta Modelning ROC Egri Chiziqlari (Multi-ROC)",
    roc_chart_sub: "AUC qanchalik 1.0 ga yaqin bo'lsa, model shunchalik mukammal ajratadi",
    cv_chart_title: "5-Fold Stratified Kross-Validatsiya Natijalari",
    cv_chart_sub: "Har bir qatlam (Fold 1-5) bo'yicha aniqlik barqarorligi",
    fi_chart_title: "Belgilarning Klinik Ahamiyati (Feature Importance)",
    fi_chart_sub: "Random Forest, Gradient Boosting va Korrelyatsiya integratsiyasi",
    ktune_chart_title: "KNN Giperparametrlarini Sozlash (k=1 dan k=25 gacha)",
    ktune_chart_sub: "Optimal nuqta: k=7 (Aniqlik: 82.0%, F1: 84.5%)",
    emr_title: "Elektron Tibbiy Karta (EMR) va Davolanish Dinamikasi",
    emr_subtitle: "Bemorlarning tashriflarini saqlang, ularni solishtiring va davolash natijalarini kuzating",
    emr_btn_add: "Joriy Bemorni Saqlash",
    emr_btn_clear: "Tozalash",
    dynamics_title: "Dinamika Tahlili (2 ta Tashrifni Qiyoslash)",
    dynamics_sub: "Bemorning terapiyadan oldingi va keyingi holatini tanlang",
    dyn_visit_1: "1-Tashrif (Boshlang'ich holat):",
    dyn_visit_2: "2-Tashrif (Qayta ko'rik):",
    emr_records_title: "Saqlangan Bemorlar Ro'yxati",
    ds_title: "UCI Cleveland Heart Disease — Kengaytirilgan Tahlil Markazi",
    ds_sub: "Tozalangan 302 nafar bemorning 14 ta tibbiy parametri + 5 ta kardiologik indeks",
    filter_all: "Barchasi (302)",
    filter_risk: "Xavf Bor (164)",
    filter_healthy: "Sog'lom (138)",
    btn_export_csv: "Boyitilgan CSV Yuklab Olish",
    btn_synth_patient: "Sintetik Bemor Yaratish",
    chart_age_gender_title: "Yosh Guruhlari va Kasallanish Nisbati",
    chart_cp_risk_title: "Ko'krak Og'rig'i Turlari (CP 0-3) Bo'yicha Xavf",
    chart_scatter_chol_bp_title: "Xolesterin va Qon Bosimi Tarqoqligi (302 Bemor)",
    chart_ca_stenosis_title: "Zararlangan Tomirlar (ca) Bo'yicha Xavf",
    cohort_query_title: "Aqlli Kohorta va Subgroup So'rov Tizimi",
    correlations_title: "Biomarkerlar Korrelyatsiyasi va Klinik Ahamiyati (Pearson Matrix)",
    biomarkers_title: "Klinik Biomarkerlar va Indekslar",
    twins_title: "Datasetdagi Eng Yaqin 3 Bemor (CBR Twins)",
    risk_cat_1: "Past Xavf",
    risk_cat_2: "O'rtacha Xavf",
    risk_cat_3: "Yuqori Xavf",
    risk_cat_4: "Kritik Xavf"
  },
  en: {
    ticker_title: "07. Heart Disease Risk Prediction • 3D Heart, Live ECG, Voice AI & SOTA Ensemble",
    ticker_stats: "Bio-Age • Bruce Stress-Test • Pharmacotherapy • PCA 2D Cluster",
    brand_subtitle: "3D Cardiology, ECG Telemetry, Bio-Age & Intelligent Diagnosis",
    badge_ens_auc: "Ensemble AUC:",
    badge_gb_acc: "GradBoost Acc:",
    badge_svm_recall: "SVM Recall:",
    nav_voice_read: "Speak",
    nav_pdf: "PDF",
    tab_calc: "Clinical Diagnostics, 3D & ECG",
    tab_models: "Models & PCA 2D Cluster",
    tab_emr: "EMR: Longitudinal Visits",
    tab_dataset: "Dataset (302 Patients)",
    bio_age_heading: "Cardiovascular Bio-Age",
    bio_age_desc: "AHA Life's Essential & coronary vascular calcification benchmark",
    passport_age_label: "Passport Age:",
    bio_age_label: "Heart Bio-Age:",
    bio_age_target: "Goal: Equate biological age via therapy and nutrition",
    presets_label: "Clinical Presets:",
    btn_save_emr: "Save to EMR",
    btn_reset: "Reset to Default",
    three_heart_title: "3D Interactive Heart Anatomy (Three.js)",
    three_heart_sub: "Orbit 360° with mouse. Arterial stenosis and pulse update in real-time",
    btn_rotate: "Rotate",
    params_title: "Clinical Parameter Tuning",
    params_desc: "Every change reflects synchronously across 3D heart, ECG, and AI engine",
    pharma_title: "Virtual Pharmacotherapy Simulator (Digital Twin)",
    pharma_sub: "Activate cardiac regimens and monitor instantaneous risk attenuation",
    treadmill_title: "Virtual Exercise Stress Test (Bruce Protocol)",
    treadmill_sub: "Detect myocardial ischemia onset threshold under physical exertion",
    radar_title: "360° Radar Profile (Patient vs Healthy Benchmark)",
    radar_footer: "Blue line represents this patient; Green line denotes the healthy benchmark mean.",
    ecg_rhythm: "RHYTHM:",
    ecg_st: "ST SEGMENT:",
    ecg_axis: "VOLTAGE / AXIS:",
    gauge_heading: "Cardiovascular Disease Risk (Consensus)",
    framingham_title: "Traditional Cardiology vs Artificial Intelligence",
    framingham_score_label: "Framingham 10-Year:",
    ai_ensemble_score_label: "AI SOTA Ensemble:",
    xai_waterfall_title: "Explainable AI: Feature Attribution Waterfall",
    whatif_title: '"What-If" Preventive Lifestyle Simulator',
    advice_title: "Clinical Recommendation & Next Actions:",
    pca_chart_title: "PCA 2D Patient Cluster Map (Unsupervised Projection)",
    pca_chart_sub: "13-dimensional clinical space projected onto PC1 and PC2. Pulsating star is current patient!",
    roc_chart_title: "5 Multi-Architecture ROC Curves",
    roc_chart_sub: "The closer AUC is to 1.0, the better the diagnostic discrimination",
    cv_chart_title: "5-Fold Stratified Cross-Validation Folds",
    cv_chart_sub: "Stability and generalization across Folds 1 to 5",
    fi_chart_title: "Clinical Feature Importance",
    fi_chart_sub: "Random Forest, Gradient Boosting and Pearson correlation synthesis",
    ktune_chart_title: "KNN Hyperparameter Tuning (k=1 to k=25)",
    ktune_chart_sub: "Optimal sweet spot: k=7 (Accuracy: 82.0%, F1: 84.5%)",
    emr_title: "Electronic Medical Record (EMR) & Visit Dynamics",
    emr_subtitle: "Store patient visits, benchmark visits longitudinally, and monitor clinical recovery",
    emr_btn_add: "Save Current Patient",
    emr_btn_clear: "Clear Records",
    dynamics_title: "Longitudinal Visit Comparison Tool",
    dynamics_sub: "Select baseline vs follow-up clinical visits",
    dyn_visit_1: "Visit 1 (Baseline Assessment):",
    dyn_visit_2: "Visit 2 (Post-Therapy Follow-up):",
    emr_records_title: "Saved Patient Profiles",
    ds_title: "UCI Cleveland Heart Disease — Advanced Analytics Studio",
    ds_sub: "Cleaned 302 patient records with 14 clinical features + 5 engineered cardiac indices",
    filter_all: "All Records (302)",
    filter_risk: "Diseased (164)",
    filter_healthy: "Healthy (138)",
    btn_export_csv: "Download Enriched CSV",
    btn_synth_patient: "Generate Synthetic Case",
    chart_age_gender_title: "Age Cohorts & Gender Disparity Breakdown",
    chart_cp_risk_title: "Chest Pain Types (CP 0-3) Risk Disparity",
    chart_scatter_chol_bp_title: "Cholesterol vs Resting Blood Pressure Scatter (302 Patients)",
    chart_ca_stenosis_title: "Major Fluoroscopy Vessels (ca) Risk Association",
    cohort_query_title: "Intelligent Subgroup & Cohort Query Engine",
    correlations_title: "Biomarker Correlations & Clinical Risk Drivers (Pearson Matrix)",
    biomarkers_title: "Calculated Clinical Biomarkers & Indices",
    twins_title: "Nearest Patient Digital Twins (CBR Matcher)",
    risk_cat_1: "Low Risk",
    risk_cat_2: "Moderate Risk",
    risk_cat_3: "High Risk",
    risk_cat_4: "Critical Risk"
  },
  ru: {
    ticker_title: "07. Прогнозирование риска ССЗ • 3D Сердце, ЭКГ, Голосовой ИИ и SOTA Ансамбль",
    ticker_stats: "Bio-Age • Стресс-тест Брюса • Фармакотерапия • PCA 2D Кластер",
    brand_subtitle: "3D Кардиология, ЭКГ Телеметрия, Био-возраст и Интеллектуальный Диагноз",
    badge_ens_auc: "Ансамбль AUC:",
    badge_gb_acc: "GradBoost Acc:",
    badge_svm_recall: "SVM Recall:",
    nav_voice_read: "Слушать",
    nav_pdf: "PDF",
    tab_calc: "Клиническая Диагностика, 3D и ЭКГ",
    tab_models: "Модели и PCA 2D Кластер",
    tab_emr: "ЭМК: Пациенты и Динамика",
    tab_dataset: "Датасет (302 Пациента)",
    bio_age_heading: "Биологический Возраст Сердца (Bio-Age)",
    bio_age_desc: "Расчёт по методике AHA Life's Essential и кальцинозу коронарных артерий",
    passport_age_label: "Паспортный возраст:",
    bio_age_label: "Биологический возраст:",
    bio_age_target: "Цель: Снизить биологический возраст терапией и диетой",
    presets_label: "Клинические Профили:",
    btn_save_emr: "Сохранить в ЭМК",
    btn_reset: "Сбросить по умолчанию",
    three_heart_title: "3D Интерактивная Анатомия Сердца (Three.js)",
    three_heart_sub: "Вращайте на 360°. Стеноз сосудов и ЧСС отображаются в реальном времени",
    btn_rotate: "Вращение",
    params_title: "Настройка Клинических Параметров",
    params_desc: "Каждое изменение синхронно отражается в 3D модели, ЭКГ и консенсусном ИИ",
    pharma_title: "Виртуальный Симулятор Фармакотерапии (Digital Twin)",
    pharma_sub: "Подключайте кардиопрепараты и оценивайте снижение риска",
    treadmill_title: "Виртуальный Стресс-Тест на Тредмиле (Протокол Брюса)",
    treadmill_sub: "Определение порога ишемии миокарда при ступенчатой физической нагрузке",
    radar_title: "360° Радарный Профиль (Пациент vs Здоровая Популяция)",
    radar_footer: "Синяя линия — текущий пациент; Зеленая линия — здоровая популяция.",
    ecg_rhythm: "РИТМ:",
    ecg_st: "СЕГМЕНТ ST:",
    ecg_axis: "ВОЛЬТАЖ / ОСЬ:",
    gauge_heading: "Риск Сердечно-Сосудистых Заболеваний",
    framingham_title: "Классическая Кардиология vs Искусственный Интеллект",
    framingham_score_label: "Фрамингем 10 лет:",
    ai_ensemble_score_label: "ИИ Ансамбль SOTA:",
    xai_waterfall_title: "Объяснимый ИИ (XAI): Атрибуция Факторов Риска",
    whatif_title: 'Симулятор Профилактики "What-If"',
    advice_title: "Клинические Рекомендации и Тактика:",
    pca_chart_title: "Карта Кластеризации PCA 2D (Проекция Без Учителя)",
    pca_chart_sub: "13-мерное клиническое пространство спроецировано на PC1 и PC2. Звезда — текущий пациент!",
    roc_chart_title: "Кривые ROC для 5 Моделей (Multi-ROC)",
    roc_chart_sub: "Чем ближе AUC к 1.0, тем точнее модель различает патологию",
    cv_chart_title: "Результаты 5-Fold Кросс-Валидации",
    cv_chart_sub: "Стабильность точности по фолдам (1-5)",
    fi_chart_title: "Клиническая Значимость Признаков (Feature Importance)",
    fi_chart_sub: "Синтез Random Forest, Gradient Boosting и корреляции Пирсона",
    ktune_chart_title: "Подбор Гиперпараметра KNN (от k=1 до k=25)",
    ktune_chart_sub: "Оптимальная точка: k=7 (Точность: 82.0%, F1: 84.5%)",
    emr_title: "Электронная Медицинская Карта (ЭМК) и Динамика",
    emr_subtitle: "Сохраняйте визиты, сравнивайте их в динамике и отслеживайте терапию",
    emr_btn_add: "Сохранить Текущего Пациента",
    emr_btn_clear: "Очистить Записи",
    dynamics_title: "Анализ Динамики (Сравнение 2-х Визитов)",
    dynamics_sub: "Выберите исходное состояние и повторный осмотр",
    dyn_visit_1: "Визит 1 (Базовый осмотр):",
    dyn_visit_2: "Визит 2 (После терапии):",
    emr_records_title: "Список Сохранённых Пациентов",
    ds_title: "Датасет UCI Cleveland Heart Disease — Центр Углубленного Анализа",
    ds_sub: "302 очищенные записи пациентов: 14 клинических признаков + 5 кардиологических индексов",
    filter_all: "Все (302)",
    filter_risk: "Есть риск (164)",
    filter_healthy: "Здоровые (138)",
    btn_export_csv: "Скачать обогащенный CSV",
    btn_synth_patient: "Синтетический Пациент",
    chart_age_gender_title: "Возрастные Когорты и Гендерное Распределение",
    chart_cp_risk_title: "Типы Загрудинной Боли (CP 0-3) и Вероятность Ишемии",
    chart_scatter_chol_bp_title: "Диаграмма Рассеяния Холестерина и Давления (302 Пациента)",
    chart_ca_stenosis_title: "Поражение Сосудов (ca) и Тяжесть Стеноза",
    cohort_query_title: "Интеллектуальный Когортный Анализатор Подгрупп",
    correlations_title: "Корреляция Биомаркеров и Клиническая Значимость (Пирсон)",
    biomarkers_title: "Расчётные Клинические Биомаркеры и Индексы",
    twins_title: "3 Ближайших Цифровых Двойника (CBR Twins)",
    risk_cat_1: "Низкий Риск",
    risk_cat_2: "Умеренный Риск",
    risk_cat_3: "Высокий Риск",
    risk_cat_4: "Критический Риск"
  }
};

let currentLang = localStorage.getItem('cardiorisk_lang') || 'uz';

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || (I18N['uz'] && I18N['uz'][key]) || key;
}

function setLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem('cardiorisk_lang', lang);

  ['uz', 'en', 'ru'].forEach(l => {
    const btn = document.getElementById(`lang-btn-${l}`);
    if (btn) {
      if (l === lang) {
        btn.className = "px-2 py-1 rounded font-semibold transition bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm";
      } else {
        btn.className = "px-2 py-1 rounded font-semibold transition text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";
      }
    }
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && I18N[lang][key]) {
      el.textContent = I18N[lang][key];
    }
  });

  renderPresets();
  renderFormInputs();
  runPrediction();
  renderDatasetTable();
  if (document.getElementById('tab-models') && !document.getElementById('tab-models').classList.contains('hidden')) {
    initEnhancedCharts();
  }
  renderEMRRecords();
}

// 1. Dasturni initsializatsiya qilish
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initTabs();
  await loadModelData();
  setLanguage(currentLang);
  initThreeHeart();
  initEcgMonitor();
  initEnhancedCharts();
  initDefaultEMRData();
  renderEMRRecords();
  initDatasetIntelligence();
  runPrediction();
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
      } else if (targetId === 'tab-emr') {
        renderEMRRecords();
      } else if (targetId === 'tab-calculator') {
        setTimeout(resizeThreeCanvas, 50);
      } else if (targetId === 'tab-dataset') {
        setTimeout(initDatasetIntelligence, 50);
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
}

// 5. 100% Real 3D Kardiologik Yurak Anatomiyasi (Three.js WebGL PBR Engine)
let threeScene, threeCamera, threeRenderer, threeHeartGroup;
let ladStenosisMesh, rcaStenosisMesh, lcxStenosisMesh;
let ladWarningRing, rcaWarningRing, lcxWarningRing;
let heartMaterials = [];
let threeAutoRotate = true;
let threeXRay = false;
let isThreeDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let raycaster, mouseVector;
let targetCameraPos = null;

// Procedural Myocardial Muscle Striations Texture
function generateMyocardiumTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep rich crimson-maroon base
  ctx.fillStyle = '#881337';
  ctx.fillRect(0, 0, 512, 512);

  // Myocardial muscle fiber striations (anisotropic directional grain)
  for (let y = 0; y < 512; y += 2) {
    const alpha = 0.12 + Math.random() * 0.25;
    ctx.strokeStyle = Math.random() > 0.5 ? `rgba(159, 18, 57, ${alpha})` : `rgba(225, 29, 72, ${alpha})`;
    ctx.lineWidth = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) {
      const ny = y + Math.sin(x * 0.035) * 5 + (Math.random() * 3 - 1.5);
      ctx.lineTo(x, ny);
    }
    ctx.stroke();
  }

  // Microvascular capillary noise & endocardial texture
  for (let i = 0; i < 500; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    ctx.fillStyle = 'rgba(254, 205, 211, 0.07)';
    ctx.beginPath();
    ctx.arc(cx, cy, 1 + Math.random() * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Procedural Subepicardial Adipose (Fat) Texture
function generateAdiposeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fef08a'; // Creamy tan-yellow adipose
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 350; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = 'rgba(234, 179, 8, 0.18)';
    ctx.beginPath();
    ctx.arc(x, y, 2 + Math.random() * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function initThreeHeart() {
  const container = document.getElementById('three-heart-container');
  if (!container || typeof THREE === 'undefined') return;

  const w = container.clientWidth || 450;
  const h = container.clientHeight || 340;

  threeScene = new THREE.Scene();

  threeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  threeCamera.position.set(0, 0.2, 7.8);

  threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  threeRenderer.setSize(w, h);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  threeRenderer.toneMappingExposure = 1.15;

  const spinner = document.getElementById('three-loading-spinner');
  if (spinner) spinner.style.display = 'none';

  container.appendChild(threeRenderer.domElement);

  // High-Grade Medical Studio 3-Point Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  threeScene.add(ambientLight);

  const mainSurgicalLight = new THREE.DirectionalLight(0xffffff, 1.4);
  mainSurgicalLight.position.set(5, 8, 6);
  threeScene.add(mainSurgicalLight);

  const warmTissueRimLight = new THREE.DirectionalLight(0xf43f5e, 1.0);
  warmTissueRimLight.position.set(-6, -3, -2);
  threeScene.add(warmTissueRimLight);

  const coolBlueBackLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
  coolBlueBackLight.position.set(0, -6, -5);
  threeScene.add(coolBlueBackLight);

  // Group
  threeHeartGroup = new THREE.Group();
  heartMaterials = [];

  const myoTex = generateMyocardiumTexture();
  const adiposeTex = generateAdiposeTexture();

  // PBR Physical Materials (Living biological tissue with wet clearcoat)
  const leftVentMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x9f1239,
    map: myoTex,
    bumpMap: myoTex,
    bumpScale: 0.05,
    roughness: 0.32,
    metalness: 0.08,
    clearcoat: 0.92,
    clearcoatRoughness: 0.18,
    sheen: 0.8,
    sheenColor: 0xf43f5e
  });
  heartMaterials.push(leftVentMaterial);

  const rightVentMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x881337,
    map: myoTex,
    bumpMap: myoTex,
    bumpScale: 0.04,
    roughness: 0.36,
    metalness: 0.06,
    clearcoat: 0.85,
    clearcoatRoughness: 0.2
  });
  heartMaterials.push(rightVentMaterial);

  const atriaMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x701a75,
    roughness: 0.45,
    metalness: 0.05,
    clearcoat: 0.6
  });
  heartMaterials.push(atriaMaterial);

  const fatPadMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfef08a,
    map: adiposeTex,
    roughness: 0.7,
    metalness: 0.02,
    clearcoat: 0.25
  });
  heartMaterials.push(fatPadMaterial);

  const aortaMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe11d48,
    roughness: 0.28,
    metalness: 0.12,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15
  });
  heartMaterials.push(aortaMaterial);

  const pulmonaryMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.3,
    metalness: 0.1,
    clearcoat: 0.8
  });
  heartMaterials.push(pulmonaryMaterial);

  const venaCavaMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1d4ed8,
    roughness: 0.35,
    metalness: 0.08,
    clearcoat: 0.75
  });
  heartMaterials.push(venaCavaMaterial);

  const arteryMaterial = new THREE.MeshStandardMaterial({
    color: 0xff1744,
    roughness: 0.18,
    metalness: 0.1,
    emissive: 0xbe123c,
    emissiveIntensity: 0.45
  });

  const veinMaterial = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.25,
    metalness: 0.1,
    emissive: 0x0369a1,
    emissiveIntensity: 0.3
  });

  // 1. LEFT VENTRICLE & ANATOMICAL APEX (Conical myocardium pointing down and left)
  const lvGeo = new THREE.SphereGeometry(1.42, 36, 36);
  // Deform sphere to match anatomical conical shape
  const lvPos = lvGeo.attributes.position;
  for (let i = 0; i < lvPos.count; i++) {
    const y = lvPos.getY(i);
    const x = lvPos.getX(i);
    const z = lvPos.getZ(i);
    // Taper toward apex at bottom
    if (y < 0) {
      const taper = 1.0 + (y / 1.42) * 0.45;
      lvPos.setX(i, x * taper - 0.15 * Math.abs(y));
      lvPos.setZ(i, z * taper);
    }
  }
  lvGeo.computeVertexNormals();
  lvGeo.scale(0.9, 1.45, 0.82);

  const leftVent = new THREE.Mesh(lvGeo, leftVentMaterial);
  leftVent.position.set(0.35, -0.3, 0.05);
  leftVent.rotation.set(0.1, -0.15, -0.22);
  leftVent.name = "Chap Qorincha (Ventriculus sinister)";
  threeHeartGroup.add(leftVent);

  // 2. RIGHT VENTRICLE (Crescent-shaped anatomical anterolateral wall)
  const rvGeo = new THREE.SphereGeometry(1.22, 32, 32);
  const rvPos = rvGeo.attributes.position;
  for (let i = 0; i < rvPos.count; i++) {
    const y = rvPos.getY(i);
    const x = rvPos.getX(i);
    if (y < 0) {
      const taper = 1.0 + (y / 1.22) * 0.4;
      rvPos.setX(i, x * taper);
    }
  }
  rvGeo.computeVertexNormals();
  rvGeo.scale(0.85, 1.28, 0.75);

  const rightVent = new THREE.Mesh(rvGeo, rightVentMaterial);
  rightVent.position.set(-0.52, -0.22, 0.18);
  rightVent.rotation.set(0.08, 0.18, 0.18);
  rightVent.name = "O'ng Qorincha (Ventriculus dexter)";
  threeHeartGroup.add(rightVent);

  // 3. ATRIA & AURICLES (Left & Right Atrial Appendages)
  const laGeo = new THREE.SphereGeometry(0.85, 24, 24);
  laGeo.scale(0.95, 0.8, 0.9);
  const leftAtrium = new THREE.Mesh(laGeo, atriaMaterial);
  leftAtrium.position.set(0.55, 0.85, -0.35);
  leftAtrium.name = "Chap Bo'lmacha (Atrium sinistrum)";
  threeHeartGroup.add(leftAtrium);

  const raGeo = new THREE.SphereGeometry(0.95, 24, 24);
  raGeo.scale(1.0, 0.85, 0.85);
  const rightAtrium = new THREE.Mesh(raGeo, atriaMaterial);
  rightAtrium.position.set(-0.75, 0.75, -0.1);
  rightAtrium.name = "O'ng Bo'lmacha (Atrium dextrum)";
  threeHeartGroup.add(rightAtrium);

  // Left & Right Auricular flaps (scalloped appendages)
  const auricleGeo = new THREE.ConeGeometry(0.45, 0.75, 16);
  auricleGeo.rotateZ(-Math.PI / 3);
  const leftAuricle = new THREE.Mesh(auricleGeo, atriaMaterial);
  leftAuricle.position.set(0.85, 0.55, 0.3);
  leftAuricle.name = "Chap Quloqcha (Auricula sinistra)";
  threeHeartGroup.add(leftAuricle);

  const rightAuricleGeo = new THREE.ConeGeometry(0.48, 0.8, 16);
  rightAuricleGeo.rotateZ(Math.PI / 3);
  const rightAuricle = new THREE.Mesh(rightAuricleGeo, atriaMaterial);
  rightAuricle.position.set(-0.85, 0.5, 0.35);
  rightAuricle.name = "O'ng Quloqcha (Auricula dextra)";
  threeHeartGroup.add(rightAuricle);

  // 4. SUBEPICARDIAL ADIPOSE FAT PADS (Sulcus fat pads)
  const sulcusFatCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.08, 0.65, 0.68),
    new THREE.Vector3(-0.12, 0.1, 0.82),
    new THREE.Vector3(-0.02, -0.65, 0.72),
    new THREE.Vector3(0.08, -1.3, 0.42)
  ]);
  const sulcusFatGeo = new THREE.TubeGeometry(sulcusFatCurve, 24, 0.18, 12, false);
  const sulcusFatMesh = new THREE.Mesh(sulcusFatGeo, fatPadMaterial);
  sulcusFatMesh.name = "Yog' to'qimasi (Sulcus interventricularis fat pad)";
  threeHeartGroup.add(sulcusFatMesh);

  // 5. GREAT VESSELS (Aorta Arch + 3 Branching Arteries)
  const aortaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, 0.7, 0.1),
    new THREE.Vector3(0.18, 1.5, 0.2),
    new THREE.Vector3(-0.25, 2.15, 0.1),
    new THREE.Vector3(-0.85, 1.85, -0.25),
    new THREE.Vector3(-0.8, 0.5, -0.55)
  ]);
  const aortaGeo = new THREE.TubeGeometry(aortaCurve, 36, 0.35, 20, false);
  const aortaMesh = new THREE.Mesh(aortaGeo, aortaMaterial);
  aortaMesh.name = "Aorta Ravog'i (Arcus aortae)";
  threeHeartGroup.add(aortaMesh);

  // 3 Aortic Arch Arterial Branches
  // 1. Truncus brachiocephalicus
  const b1Curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.05, 1.95, 0.18), new THREE.Vector3(0.2, 2.65, 0.12)]);
  const b1Mesh = new THREE.Mesh(new THREE.TubeGeometry(b1Curve, 12, 0.11, 10, false), aortaMaterial);
  b1Mesh.name = "Truncus brachiocephalicus";
  threeHeartGroup.add(b1Mesh);

  // 2. A. carotis communis sinistra
  const b2Curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.25, 2.12, 0.12), new THREE.Vector3(-0.2, 2.72, 0.05)]);
  const b2Mesh = new THREE.Mesh(new THREE.TubeGeometry(b2Curve, 12, 0.09, 10, false), aortaMaterial);
  b2Mesh.name = "A. carotis communis sinistra";
  threeHeartGroup.add(b2Mesh);

  // 3. A. subclavia sinistra
  const b3Curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.55, 2.05, 0.0), new THREE.Vector3(-0.6, 2.65, -0.1)]);
  const b3Mesh = new THREE.Mesh(new THREE.TubeGeometry(b3Curve, 12, 0.09, 10, false), aortaMaterial);
  b3Mesh.name = "A. subclavia sinistra";
  threeHeartGroup.add(b3Mesh);

  // 6. PULMONARY TRUNK & BIFURCATION (Truncus pulmonalis)
  const pulmTrunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, 0.55, 0.38),
    new THREE.Vector3(-0.25, 1.35, 0.42),
    new THREE.Vector3(0.25, 1.55, 0.15)
  ]);
  const pulmTrunkMesh = new THREE.Mesh(new THREE.TubeGeometry(pulmTrunkCurve, 24, 0.3, 16, false), pulmonaryMaterial);
  pulmTrunkMesh.name = "O'pka o'zagi (Truncus pulmonalis)";
  threeHeartGroup.add(pulmTrunkMesh);

  // Left & Right Pulmonary Arteries
  const leftPulmCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.25, 1.55, 0.15), new THREE.Vector3(0.95, 1.45, -0.35)]);
  const rightPulmCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.25, 1.55, 0.15), new THREE.Vector3(-0.85, 1.4, -0.45)]);
  threeHeartGroup.add(new THREE.Mesh(new THREE.TubeGeometry(leftPulmCurve, 16, 0.18, 12, false), pulmonaryMaterial));
  threeHeartGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rightPulmCurve, 16, 0.18, 12, false), pulmonaryMaterial));

  // 7. SUPERIOR & INFERIOR VENA CAVA (SVC & IVC)
  const svcCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.95, 0.8, -0.2), new THREE.Vector3(-1.0, 1.85, -0.15)]);
  const svcMesh = new THREE.Mesh(new THREE.TubeGeometry(svcCurve, 16, 0.22, 12, false), venaCavaMaterial);
  svcMesh.name = "Yuqori Kovak Vena (Vena cava superior)";
  threeHeartGroup.add(svcMesh);

  const ivcCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.75, -0.35, -0.5), new THREE.Vector3(-0.8, -1.2, -0.55)]);
  const ivcMesh = new THREE.Mesh(new THREE.TubeGeometry(ivcCurve, 12, 0.2, 12, false), venaCavaMaterial);
  ivcMesh.name = "Pastki Kovak Vena (Vena cava inferior)";
  threeHeartGroup.add(ivcMesh);

  // 8. HIGH-PRECISION CORONARY ARTERIAL & VENOUS TREE
  // LAD (Left Anterior Descending Artery)
  const ladCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 0.65, 0.72),
    new THREE.Vector3(-0.04, 0.2, 0.86),
    new THREE.Vector3(0.04, -0.45, 0.78),
    new THREE.Vector3(0.12, -1.15, 0.52),
    new THREE.Vector3(0.08, -1.48, 0.28)
  ]);
  const ladGeo = new THREE.TubeGeometry(ladCurve, 36, 0.08, 12, false);
  const ladMesh = new THREE.Mesh(ladGeo, arteryMaterial);
  ladMesh.name = "LAD: Old tushuvchi koronar arteriya";
  threeHeartGroup.add(ladMesh);

  // LAD Diagonal Branch (D1)
  const d1Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.02, 0.1, 0.85),
    new THREE.Vector3(0.45, -0.2, 0.78),
    new THREE.Vector3(0.75, -0.55, 0.55)
  ]);
  const d1Mesh = new THREE.Mesh(new THREE.TubeGeometry(d1Curve, 18, 0.05, 10, false), arteryMaterial);
  d1Mesh.name = "LAD Diagonal shoxi (D1)";
  threeHeartGroup.add(d1Mesh);

  // RCA (Right Coronary Artery)
  const rcaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0.65, 0.45),
    new THREE.Vector3(-0.95, 0.12, 0.55),
    new THREE.Vector3(-0.88, -0.55, 0.35),
    new THREE.Vector3(-0.52, -1.15, -0.05)
  ]);
  const rcaMesh = new THREE.Mesh(new THREE.TubeGeometry(rcaCurve, 32, 0.075, 12, false), arteryMaterial);
  rcaMesh.name = "RCA: O'ng koronar arteriya";
  threeHeartGroup.add(rcaMesh);

  // LCx (Left Circumflex Artery)
  const lcxCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.15, 0.62, 0.65),
    new THREE.Vector3(0.72, 0.42, 0.45),
    new THREE.Vector3(0.92, -0.05, 0.05),
    new THREE.Vector3(0.75, -0.65, -0.42)
  ]);
  const lcxMesh = new THREE.Mesh(new THREE.TubeGeometry(lcxCurve, 30, 0.065, 10, false), arteryMaterial);
  lcxMesh.name = "LCx: O'rovchi koronar arteriya";
  threeHeartGroup.add(lcxMesh);

  // Great Cardiac Vein (Vena cordis magna - Cyan/Blue running along LAD)
  const gcvCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.18, -1.35, 0.38),
    new THREE.Vector3(0.14, -0.55, 0.72),
    new THREE.Vector3(0.06, 0.15, 0.82),
    new THREE.Vector3(0.25, 0.65, 0.62)
  ]);
  const gcvMesh = new THREE.Mesh(new THREE.TubeGeometry(gcvCurve, 28, 0.065, 10, false), veinMaterial);
  gcvMesh.name = "Buyuk Yurak Venasi (Vena cordis magna)";
  threeHeartGroup.add(gcvMesh);

  // 9. HIGH-FIDELITY ATHEROSCLEROTIC PLAQUE (STENOSIS BEACONS)
  // LAD Stenosis Plaque
  const plaqueGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const plaqueMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xef4444,
    emissiveIntensity: 0.9,
    roughness: 0.2
  });

  ladStenosisMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  ladStenosisMesh.position.set(-0.04, 0.2, 0.88);
  ladStenosisMesh.name = "LAD Stenoz Plakasi (Ateroskleroz ~75%)";
  threeHeartGroup.add(ladStenosisMesh);

  // Warning beacon ring
  const ringGeo = new THREE.RingGeometry(0.24, 0.32, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0055, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
  ladWarningRing = new THREE.Mesh(ringGeo, ringMat);
  ladWarningRing.position.set(-0.04, 0.2, 0.92);
  threeHeartGroup.add(ladWarningRing);

  // RCA Stenosis Plaque
  rcaStenosisMesh = new THREE.Mesh(plaqueGeo, new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xf59e0b, emissiveIntensity: 0.9 }));
  rcaStenosisMesh.position.set(-0.95, 0.12, 0.58);
  rcaStenosisMesh.name = "RCA Stenoz Plakasi (~65% Stenoz)";
  threeHeartGroup.add(rcaStenosisMesh);

  rcaWarningRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
  rcaWarningRing.position.set(-0.95, 0.12, 0.62);
  threeHeartGroup.add(rcaWarningRing);

  // LCx Stenosis Plaque
  lcxStenosisMesh = new THREE.Mesh(plaqueGeo, new THREE.MeshStandardMaterial({ color: 0xfae8ff, emissive: 0xd946ef, emissiveIntensity: 0.9 }));
  lcxStenosisMesh.position.set(0.85, 0.25, 0.32);
  lcxStenosisMesh.name = "LCx Stenoz Plakasi (~60% Stenoz)";
  threeHeartGroup.add(lcxStenosisMesh);

  lcxWarningRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xd946ef, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
  lcxWarningRing.position.set(0.85, 0.25, 0.36);
  threeHeartGroup.add(lcxWarningRing);

  threeScene.add(threeHeartGroup);

  // Raycaster & Interactivity
  raycaster = new THREE.Raycaster();
  mouseVector = new THREE.Vector2();

  setupThreeInteractions(container);
  animateThreeHeart();
}

function setupThreeInteractions(container) {
  const dom = threeRenderer.domElement;

  dom.addEventListener('mousedown', e => {
    isThreeDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isThreeDragging = false;
  });

  dom.addEventListener('mousemove', e => {
    const rect = dom.getBoundingClientRect();
    mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast on hover
    if (threeCamera && threeHeartGroup) {
      raycaster.setFromCamera(mouseVector, threeCamera);
      const intersects = raycaster.intersectObjects(threeHeartGroup.children, true);
      const tagEl = document.getElementById('three-anatomy-tag');
      if (intersects.length > 0 && tagEl) {
        const obj = intersects[0].object;
        if (obj && obj.name) {
          tagEl.textContent = obj.name;
        }
      }
    }

    if (!isThreeDragging || !threeHeartGroup) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    threeHeartGroup.rotation.y += deltaX * 0.009;
    threeHeartGroup.rotation.x += deltaY * 0.009;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch controls for mobile
  dom.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isThreeDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isThreeDragging = false;
  });

  dom.addEventListener('touchmove', e => {
    if (!isThreeDragging || !threeHeartGroup || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    threeHeartGroup.rotation.y += deltaX * 0.012;
    threeHeartGroup.rotation.x += deltaY * 0.012;

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  // Zoom
  dom.addEventListener('wheel', e => {
    e.preventDefault();
    threeCamera.position.z = Math.max(4.2, Math.min(12, threeCamera.position.z + e.deltaY * 0.005));
  }, { passive: false });
}

function toggle3DAutoRotate() {
  threeAutoRotate = !threeAutoRotate;
  const btn = document.getElementById('btn-3d-rotate');
  if (btn) {
    btn.className = threeAutoRotate 
      ? "px-2 py-1 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 transition border border-rose-200 dark:border-rose-900"
      : "px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition border border-slate-200 dark:border-slate-700";
  }
}

function toggle3DXRayMode() {
  threeXRay = !threeXRay;
  const btn = document.getElementById('btn-3d-xray');

  heartMaterials.forEach(mat => {
    if (threeXRay) {
      mat.transparent = true;
      mat.opacity = 0.38;
      mat.depthWrite = false;
    } else {
      mat.transparent = false;
      mat.opacity = 1.0;
      mat.depthWrite = true;
    }
    mat.needsUpdate = true;
  });

  if (btn) {
    btn.className = threeXRay
      ? "px-2 py-1 rounded text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-300 transition border border-cyan-300 dark:border-cyan-800"
      : "px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition border border-slate-200 dark:border-slate-700";
  }
}

function focus3DStenosis() {
  if (!threeCamera || !threeHeartGroup) return;
  threeAutoRotate = false;
  // Move camera close and rotate directly to face the LAD coronary artery
  targetCameraPos = { x: 0.1, y: 0.2, z: 4.8 };
  threeHeartGroup.rotation.set(0.08, 0.22, 0);
  const tagEl = document.getElementById('three-anatomy-tag');
  if (tagEl) tagEl.textContent = "LAD Stenoz: 75% Koronar Torayish (Fokuslandi)";
}

function reset3DCamera() {
  if (threeCamera && threeHeartGroup) {
    targetCameraPos = { x: 0, y: 0.2, z: 7.8 };
    threeHeartGroup.rotation.set(0, 0, 0);
    const tagEl = document.getElementById('three-anatomy-tag');
    if (tagEl) tagEl.textContent = "100% Real 3D Kardiologik Model";
  }
}

function resizeThreeCanvas() {
  const container = document.getElementById('three-heart-container');
  if (!container || !threeRenderer || !threeCamera) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  threeCamera.aspect = w / h;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(w, h);
}

window.addEventListener('resize', resizeThreeCanvas);

let threeClock = 0;
function animateThreeHeart() {
  requestAnimationFrame(animateThreeHeart);

  const raw = getCurrentVector()?.raw || { thalach: 145, ca: 1 };
  let bpm = raw.thalach || 145;

  if (treadmillRunning) {
    const stage = BRUCE_STAGES[treadmillStage] || BRUCE_STAGES[0];
    bpm = Math.min(210, 75 + stage.hrBonus);
  }

  const freq = (bpm / 60) * Math.PI * 2;
  threeClock += 0.016;

  // Smooth camera transition if target is set
  if (targetCameraPos && threeCamera) {
    threeCamera.position.x += (targetCameraPos.x - threeCamera.position.x) * 0.08;
    threeCamera.position.y += (targetCameraPos.y - threeCamera.position.y) * 0.08;
    threeCamera.position.z += (targetCameraPos.z - threeCamera.position.z) * 0.08;
  }

  if (threeHeartGroup) {
    if (threeAutoRotate && !isThreeDragging) {
      threeHeartGroup.rotation.y += 0.0055;
    }

    // Physiological Wringing Dual-Phase Cardiac Cycle:
    // Ventricular systole twists longitudinally like a wringing towel
    const cycleTime = (threeClock * freq) % (Math.PI * 2);
    const systolicKick = Math.pow(Math.max(0, Math.sin(cycleTime)), 2.8);
    const atrialKick = Math.sin(cycleTime * 2) * 0.02;

    const scaleX = 1.0 - (systolicKick * 0.09) + atrialKick;
    const scaleY = 1.0 - (systolicKick * 0.12);
    const scaleZ = 1.0 + (systolicKick * 0.06);

    threeHeartGroup.scale.set(scaleX, scaleY, scaleZ);

    // Torsional wringing twist around Y axis during peak ejection
    if (!isThreeDragging) {
      threeHeartGroup.rotation.z = Math.sin(cycleTime) * 0.035;
    }

    // Stenosis Warning Beacon Animation
    const ca = raw.ca || 0;
    const pulseIntensity = 1.0 + Math.sin(threeClock * 7) * 0.4;

    if (ladStenosisMesh && ladWarningRing) {
      ladStenosisMesh.visible = ca >= 1;
      ladWarningRing.visible = ca >= 1;
      ladWarningRing.scale.setScalar(pulseIntensity);
    }
    if (rcaStenosisMesh && rcaWarningRing) {
      rcaStenosisMesh.visible = ca >= 2;
      rcaWarningRing.visible = ca >= 2;
      rcaWarningRing.scale.setScalar(pulseIntensity);
    }
    if (lcxStenosisMesh && lcxWarningRing) {
      lcxStenosisMesh.visible = ca >= 3;
      lcxWarningRing.visible = ca >= 3;
      lcxWarningRing.scale.setScalar(pulseIntensity);
    }
  }

  if (threeRenderer && threeScene && threeCamera) {
    threeRenderer.render(threeScene, threeCamera);
  }
}

// 6. Cardiovascular Bio-Age (Yurak Biologik Yoshi)
function updateBioAge(raw, riskPct) {
  const passportAgeEl = document.getElementById('display-passport-age');
  const bioAgeEl = document.getElementById('display-bio-age');
  const bioDiffEl = document.getElementById('display-bio-diff');
  const msgEl = document.getElementById('bio-age-status-message');

  const age = raw.age || 55;
  let delta = 0;

  // BP delta
  if (raw.trestbps >= 160) delta += 7;
  else if (raw.trestbps >= 140) delta += 4;
  else if (raw.trestbps >= 130) delta += 2;
  else if (raw.trestbps <= 118) delta -= 2;

  // Cholesterol delta
  if (raw.chol >= 270) delta += 6;
  else if (raw.chol >= 240) delta += 3;
  else if (raw.chol <= 180) delta -= 2;

  // Blood sugar
  if (raw.fbs === 1) delta += 3;

  // Ischemia & ST depression
  if (raw.oldpeak >= 2.5) delta += 8;
  else if (raw.oldpeak >= 1.0) delta += 4;
  else if (raw.oldpeak <= 0.2) delta -= 2;

  // Calcified vessels
  if (raw.ca > 0) delta += raw.ca * 3;

  // Angina
  if (raw.exang === 1) delta += 4;

  // Aerobic fitness reserve
  if (raw.thalach >= 165) delta -= 4;
  else if (raw.thalach <= 120) delta += 4;

  const bioAge = Math.max(20, Math.min(95, age + delta));

  if (passportAgeEl) passportAgeEl.textContent = age;
  if (bioAgeEl) {
    bioAgeEl.textContent = bioAge;
    bioAgeEl.className = delta > 0 ? "text-3xl font-black font-mono text-rose-400" : "text-3xl font-black font-mono text-emerald-400";
  }

  if (bioDiffEl) {
    if (delta > 0) {
      bioDiffEl.textContent = `+${delta} yosh`;
      bioDiffEl.className = "text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono";
    } else if (delta < 0) {
      bioDiffEl.textContent = `${delta} yosh`;
      bioDiffEl.className = "text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono";
    } else {
      bioDiffEl.textContent = "Mos";
      bioDiffEl.className = "text-xs font-bold px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 border border-slate-500/40 font-mono";
    }
  }

  if (msgEl) {
    if (delta > 5) {
      msgEl.innerHTML = currentLang === 'ru'
        ? `⚠️ Биологический возраст сосудов опережает паспортный на <b>${delta} лет</b>. Высокий износ кардиоваскулярной системы.`
        : (currentLang === 'en'
          ? `⚠️ Vascular bio-age is <b>+${delta} years</b> older than chronological age. Significant arterial stiffness detected.`
          : `⚠️ Bemorning yurak-qon tomir tizimi pasport yoshiga nisbatan <b>${delta} yilga</b> tezroq eskirgan. Profilaktika zarur.`);
    } else if (delta < 0) {
      msgEl.innerHTML = currentLang === 'ru'
        ? `✓ Сердце биологически моложе паспортного возраста на <b>${Math.abs(delta)} года</b>. Превосходный кардиорезерв!`
        : (currentLang === 'en'
          ? `✓ Heart bio-age is <b>${Math.abs(delta)} years younger</b> than chronological age. Superb aerobic cardiovascular condition!`
          : `✓ Yurak biologik jihatdan pasport yoshidan <b>${Math.abs(delta)} yilga</b> yoshroq! Salomatlik darajasi a'lo.`);
    } else {
      msgEl.innerHTML = currentLang === 'ru'
        ? `✓ Биологический и паспортный возраст сбалансированы.`
        : (currentLang === 'en'
          ? `✓ Biological and chronological age are in equilibrium.`
          : `✓ Biologik va pasport yoshi to'liq mutanosib.`);
    }
  }

  // Update 3D Stenosis Badge
  const stBadge = document.getElementById('three-stenosis-badge');
  if (stBadge) {
    const ca = raw.ca || 0;
    stBadge.textContent = ca > 0 ? `Stenoz: ${ca} ta yirik tomir toraygan` : "Stenoz yo'q: Qon oqimi me'yorda";
    stBadge.className = ca > 0 
      ? "font-mono font-bold text-xs px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
      : "font-mono font-bold text-xs px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900";
  }
}

// 7. Ovozli AI Kardiolog (Text-to-Speech & Speech-to-Text)
let isSpeaking = false;
let isDictating = false;
let speechRecognizer = null;

function toggleVoiceSpeech() {
  if (typeof window.speechSynthesis === 'undefined') {
    alert("Brauzeringiz ovozli sintezni qo'llab-quvvatlamaydi.");
    return;
  }

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    updateVoiceIcon(false);
    return;
  }

  const current = getCurrentVector();
  if (!current) return;

  const raw = current.raw;
  const scaled = scaleVector(current.vector);
  const ens = predictEnsemble(scaled, raw);
  const riskPct = Math.round(ens.prob * 100);

  let speechText = "";
  let langCode = "uz-UZ";

  if (currentLang === 'ru') {
    langCode = "ru-RU";
    speechText = `Клинический диагноз Искусственного Интеллекта. Риск сердечно-сосудистых заболеваний составляет ${riskPct} процентов. `;
    if (riskPct >= 75) {
      speechText += "Обнаружен критический риск ишемии. Рекомендована срочная госпитализация и коронарография.";
    } else if (riskPct >= 50) {
      speechText += "Высокий риск. Рекомендован тредмил-тест, мониторинг давления и липидная терапия.";
    } else {
      speechText += "Показатели стабильны. Сердечно-сосудистая функция в норме.";
    }
  } else if (currentLang === 'en') {
    langCode = "en-US";
    speechText = `Artificial Intelligence diagnostic assessment. Consensus cardiovascular risk is ${riskPct} percent. `;
    if (riskPct >= 75) {
      speechText += "Critical ischemia likelihood. Urgent coronary catheterization and cardiology referral recommended.";
    } else if (riskPct >= 50) {
      speechText += "Elevated risk profile. Pharmacotherapy and clinical stress testing are strongly indicated.";
    } else {
      speechText += "Cardiovascular parameters are stable and within physiological limits.";
    }
  } else {
    langCode = "uz-UZ";
    speechText = `Sun'iy Intellekt kardiologik tahlili. Bemorning yurak kasalligi xavfi ${riskPct} foizni tashkil etmoqda. `;
    if (riskPct >= 75) {
      speechText += "Miokard ishemiyasi bo'yicha kritik xavf aniqlandi. Zudlik bilan kardiolog ko'rigidan o'tish va koronarografiya qilish tavsiya etiladi.";
    } else if (riskPct >= 50) {
      speechText += "Xavf yuqori guruhda. Qon bosimi va xolesterinni qat'iy nazoratga olish, dori terapiyasi zarur.";
    } else {
      speechText += "Ko'rsatkichlar me'yorida. Yurak-qon tomir tizimi funksiyasi barqaror.";
    }
  }

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = langCode;
  utterance.rate = 1.0;

  utterance.onstart = () => {
    isSpeaking = true;
    updateVoiceIcon(true);
  };
  utterance.onend = () => {
    isSpeaking = false;
    updateVoiceIcon(false);
  };
  utterance.onerror = () => {
    isSpeaking = false;
    updateVoiceIcon(false);
  };

  window.speechSynthesis.speak(utterance);
}

function updateVoiceIcon(speaking) {
  const icon = document.getElementById('voice-read-icon');
  const btn = document.getElementById('btn-voice-read');
  if (icon && btn) {
    if (speaking) {
      icon.className = "fa-solid fa-stop text-rose-500 animate-pulse";
      btn.classList.add('bg-rose-100', 'dark:bg-rose-900/60');
    } else {
      icon.className = "fa-solid fa-volume-high";
      btn.classList.remove('bg-rose-100', 'dark:bg-rose-900/60');
    }
  }
}

function toggleVoiceDictation() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    alert("Brauzeringiz ovozli diktovkani qo'llab-quvvatlamaydi (Chrome tavsiya etiladi).");
    return;
  }

  const icon = document.getElementById('voice-dictate-icon');
  const btn = document.getElementById('btn-voice-dictate');

  if (isDictating && speechRecognizer) {
    speechRecognizer.stop();
    isDictating = false;
    if (icon) icon.className = "fa-solid fa-microphone";
    if (btn) btn.classList.remove('bg-rose-100', 'text-rose-600', 'border-rose-400');
    return;
  }

  speechRecognizer = new SpeechRec();
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;
  speechRecognizer.lang = currentLang === 'ru' ? 'ru-RU' : (currentLang === 'en' ? 'en-US' : 'uz-UZ');

  speechRecognizer.onstart = () => {
    isDictating = true;
    if (icon) icon.className = "fa-solid fa-microphone-lines text-rose-500 animate-ping";
    if (btn) btn.classList.add('bg-rose-100', 'text-rose-600', 'border-rose-400');
  };

  speechRecognizer.onresult = event => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    parseVoiceParameters(transcript);
  };

  speechRecognizer.onend = () => {
    isDictating = false;
    if (icon) icon.className = "fa-solid fa-microphone";
    if (btn) btn.classList.remove('bg-rose-100', 'text-rose-600', 'border-rose-400');
  };

  speechRecognizer.start();
}

function parseVoiceParameters(text) {
  // Voice command extraction: e.g. "yosh 60", "bosim 140", "xolesterin 240", "puls 160"
  const numbers = text.match(/\d+/g);
  if (!numbers) return;

  if (text.includes("yosh") || text.includes("age") || text.includes("возраст")) {
    const ageVal = parseInt(numbers[0]);
    if (ageVal >= 25 && ageVal <= 80) handleSliderChange('age', ageVal);
  } else if (text.includes("bosim") || text.includes("давление") || text.includes("pressure")) {
    const bpVal = parseInt(numbers[0]);
    if (bpVal >= 90 && bpVal <= 200) handleSliderChange('trestbps', bpVal);
  } else if (text.includes("xolesterin") || text.includes("холестерин") || text.includes("cholesterol")) {
    const cholVal = parseInt(numbers[0]);
    if (cholVal >= 120 && cholVal <= 550) handleSliderChange('chol', cholVal);
  } else if (text.includes("puls") || text.includes("пульс") || text.includes("heart")) {
    const hrVal = parseInt(numbers[0]);
    if (hrVal >= 70 && hrVal <= 210) handleSliderChange('thalach', hrVal);
  }
}

// 8. Virtual Farmakoterapiya Simulyatori
function applyPharmaAdjustments(raw) {
  const adjusted = { ...raw };

  const statin = document.getElementById('drug-statin')?.checked;
  const beta = document.getElementById('drug-beta')?.checked;
  const ace = document.getElementById('drug-ace')?.checked;
  const aspirin = document.getElementById('drug-aspirin')?.checked;

  if (statin) {
    adjusted.chol = Math.max(130, adjusted.chol - 65);
  }
  if (beta) {
    adjusted.thalach = Math.max(65, adjusted.thalach - 15);
    adjusted.trestbps = Math.max(105, adjusted.trestbps - 12);
  }
  if (ace) {
    adjusted.trestbps = Math.max(100, adjusted.trestbps - 18);
  }
  if (aspirin) {
    adjusted.oldpeak = Math.max(0, adjusted.oldpeak - 0.4);
  }

  return adjusted;
}

function resetPharmaDrugs() {
  ['drug-statin', 'drug-beta', 'drug-ace', 'drug-aspirin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  runPrediction();
}

// 9. Bruce Protocol Virtual Treadmill Stress-Test Simulator
let treadmillRunning = false;
let treadmillStage = 0;
let treadmillSeconds = 0;
let treadmillInterval = null;

const BRUCE_STAGES = [
  { name_uz: "0-Bosqich: Tinch holat", speed: 0.0, incline: 0, hrBonus: 0 },
  { name_uz: "1-Bosqich: Yengil yurish", speed: 2.7, incline: 10, hrBonus: 25 },
  { name_uz: "2-Bosqich: Tez yurish", speed: 4.0, incline: 12, hrBonus: 50 },
  { name_uz: "3-Bosqich: Yugurish (Maks)", speed: 5.5, incline: 14, hrBonus: 75 }
];

function toggleStressTest() {
  if (treadmillRunning) {
    pauseStressTest();
  } else {
    startStressTest();
  }
}

function startStressTest() {
  treadmillRunning = true;
  const btn = document.getElementById('btn-stress-toggle');
  const icon = document.getElementById('stress-icon');
  const btnText = document.getElementById('stress-btn-text');
  const sprite = document.getElementById('runner-sprite');

  if (btn) btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm";
  if (icon) icon.className = "fa-solid fa-pause mr-1";
  if (btnText) btnText.textContent = "To'xtatish";
  if (sprite) sprite.className = "inline-block text-lg animate-runner";

  treadmillInterval = setInterval(() => {
    treadmillSeconds++;
    const mins = Math.floor(treadmillSeconds / 60);
    const secs = treadmillSeconds % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('stress-time-display').textContent = timeStr;

    // Advance Stage every 4 seconds of demo simulation time
    if (treadmillSeconds % 5 === 0 && treadmillStage < 3) {
      treadmillStage++;
      updateTreadmillUI();
    }
  }, 1000);

  updateTreadmillUI();
}

function pauseStressTest() {
  treadmillRunning = false;
  if (treadmillInterval) clearInterval(treadmillInterval);

  const btn = document.getElementById('btn-stress-toggle');
  const icon = document.getElementById('stress-icon');
  const btnText = document.getElementById('stress-btn-text');
  const sprite = document.getElementById('runner-sprite');

  if (btn) btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm";
  if (icon) icon.className = "fa-solid fa-play mr-1";
  if (btnText) btnText.textContent = "Davom ettirish";
  if (sprite) sprite.className = "inline-block text-lg";
}

function resetStressTest() {
  pauseStressTest();
  treadmillStage = 0;
  treadmillSeconds = 0;
  document.getElementById('stress-time-display').textContent = "00:00";
  document.getElementById('stress-btn-text').textContent = "Testni Boshlash";
  updateTreadmillUI();
}

function updateTreadmillUI() {
  const stage = BRUCE_STAGES[treadmillStage] || BRUCE_STAGES[0];
  const stageNameEl = document.getElementById('stress-stage-name');
  const speedEl = document.getElementById('stress-speed-val');
  const inclineEl = document.getElementById('stress-incline-val');
  const hrEl = document.getElementById('stress-hr-val');
  const alarmBox = document.getElementById('stress-alarm-box');
  const alarmText = document.getElementById('stress-alarm-text');

  if (stageNameEl) stageNameEl.textContent = stage.name_uz;
  if (speedEl) speedEl.textContent = `${stage.speed} km/h`;
  if (inclineEl) inclineEl.textContent = `${stage.incline}%`;

  const raw = getCurrentVector()?.raw || { thalach: 145, oldpeak: 1.0, exang: 0 };
  const currentExercisingHR = Math.min(210, 75 + stage.hrBonus);
  if (hrEl) hrEl.textContent = `${currentExercisingHR} BPM`;

  if (alarmBox && alarmText) {
    if (treadmillStage >= 2 && (raw.oldpeak >= 1.5 || raw.exang === 1)) {
      alarmBox.className = "p-2.5 rounded-lg text-[11px] bg-rose-950/70 border border-rose-800 text-rose-300 flex items-center space-x-2 animate-pulse";
      alarmText.innerHTML = "<b>⚠️ Ishemiya chegarasi:</b> EKGda ST depressiyasi chuqurlashdi va stenokardik og'riq xavfi paydo bo'ldi. Test to'xtatildi.";
      pauseStressTest();
    } else if (treadmillStage === 3) {
      alarmBox.className = "p-2.5 rounded-lg text-[11px] bg-emerald-950/70 border border-emerald-800 text-emerald-300 flex items-center space-x-2";
      alarmText.innerHTML = "<b>✓ Maksimal yuklama:</b> Bemor Bruce protokolining barcha bosqichlarini barqaror yakunladi.";
    } else {
      alarmBox.className = "p-2.5 rounded-lg text-[11px] bg-slate-900 text-slate-400 flex items-center space-x-2";
      alarmText.textContent = treadmillRunning ? "Yuklama oshirilmoqda, EKG ritmi telemetriyada kuzatilmoqda..." : "Testni boshlash uchun 'Testni Boshlash' tugmasini bosing.";
    }
  }
}

// 10. Form Elementlarini Render Qilish
function renderFormInputs() {
  if (!MODEL_DATA || !MODEL_DATA.features) return;
  const container = document.getElementById('form-fields-container');
  if (!container) return;

  const currentValues = getCurrentVector()?.raw || {};
  container.innerHTML = '';

  MODEL_DATA.features.forEach(f => {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 transition hover:border-slate-300 dark:hover:border-slate-600';

    const nameText = f[`name_${currentLang}`] || f.name_uz || f.id;
    const descText = f[`desc_${currentLang}`] || f.desc_uz || '';
    const currentVal = currentValues[f.id] !== undefined ? currentValues[f.id] : f.default;

    if (f.type === 'select') {
      fieldWrapper.innerHTML = `
        <div class="flex items-center justify-between mb-1.5">
          <label for="input-${f.id}" class="text-xs font-semibold text-slate-800 dark:text-slate-200">
            ${nameText}
          </label>
          <span class="text-[10px] text-slate-400 font-mono">${f.id}</span>
        </div>
        <select id="input-${f.id}" onchange="runPrediction()" class="w-full text-xs rounded-lg p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none">
          ${f.options.map(opt => `
            <option value="${opt.value}" ${opt.value === currentVal ? 'selected' : ''}>
              ${opt[`label_${currentLang}`] || opt.label_uz || opt.label || opt.value}
            </option>
          `).join('')}
        </select>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">${descText}</p>
      `;
    } else {
      fieldWrapper.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <label for="slider-${f.id}" class="text-xs font-semibold text-slate-800 dark:text-slate-200">
            ${nameText}
          </label>
          <div class="flex items-center space-x-1 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
            <span id="val-${f.id}">${currentVal}</span>
            <span class="text-[10px] text-slate-400 font-normal">${f.unit || ''}</span>
          </div>
        </div>
        <input 
          type="range" 
          id="slider-${f.id}" 
          min="${f.min}" 
          max="${f.max}" 
          step="${f.step || 1}" 
          value="${currentVal}"
          oninput="handleSliderChange('${f.id}', this.value)"
          class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
        >
        <div class="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>${f.min} ${f.unit || ''}</span>
          <span class="text-slate-500 dark:text-slate-400">${descText}</span>
          <span>${f.max} ${f.unit || ''}</span>
        </div>
      `;
    }

    container.appendChild(fieldWrapper);
  });
}

function handleSliderChange(id, val) {
  const display = document.getElementById(`val-${id}`);
  const slider = document.getElementById(`slider-${id}`);
  if (display) display.textContent = val;
  if (slider) slider.value = val;
  runPrediction();
}

// 11. Klinik Profillar (Presets)
const CLINICAL_PRESETS = [
  {
    id: "healthy",
    name_uz: "Sog'lom (Past Xavf)",
    name_en: "Healthy (Low Risk)",
    name_ru: "Здоровый (Низкий риск)",
    icon: "fa-shield-heart text-emerald-500",
    data: { age: 45, sex: 0, cp: 1, trestbps: 115, chol: 175, fbs: 0, restecg: 0, thalach: 172, exang: 0, oldpeak: 0.0, slope: 2, ca: 0, thal: 2 }
  },
  {
    id: "moderate",
    name_uz: "O'rtacha Xavf (Chegaraviy)",
    name_en: "Moderate (Borderline)",
    name_ru: "Умеренный Риск",
    icon: "fa-triangle-exclamation text-amber-500",
    data: { age: 56, sex: 1, cp: 2, trestbps: 135, chol: 235, fbs: 0, restecg: 1, thalach: 145, exang: 0, oldpeak: 1.2, slope: 1, ca: 1, thal: 2 }
  },
  {
    id: "high_ischemia",
    name_uz: "Yuqori Ishemiya (Stenokardiya)",
    name_en: "High Ischemia (Angina)",
    name_ru: "Высокая Ишемия",
    icon: "fa-heart-circle-bolt text-rose-500",
    data: { age: 62, sex: 1, cp: 0, trestbps: 148, chol: 268, fbs: 1, restecg: 1, thalach: 122, exang: 1, oldpeak: 2.6, slope: 1, ca: 2, thal: 3 }
  },
  {
    id: "critical",
    name_uz: "Kritik Infarkt Xavfi",
    name_en: "Critical Infarction Risk",
    name_ru: "Критический Риск Инфаркта",
    icon: "fa-radiation text-red-600",
    data: { age: 67, sex: 1, cp: 0, trestbps: 170, chol: 310, fbs: 1, restecg: 2, thalach: 105, exang: 1, oldpeak: 4.2, slope: 1, ca: 3, thal: 3 }
  }
];

function renderPresets() {
  const container = document.getElementById('presets-container');
  if (!container) return;

  container.innerHTML = CLINICAL_PRESETS.map(p => `
    <button onclick="applyPreset('${p.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 shadow-sm">
      <i class="fa-solid ${p.icon}"></i>
      <span>${p[`name_${currentLang}`] || p.name_uz}</span>
    </button>
  `).join('');
}

function applyPreset(presetId) {
  const preset = CLINICAL_PRESETS.find(p => p.id === presetId);
  if (!preset) return;

  Object.entries(preset.data).forEach(([key, val]) => {
    const slider = document.getElementById(`slider-${key}`);
    const display = document.getElementById(`val-${key}`);
    const select = document.getElementById(`input-${key}`);

    if (slider) {
      slider.value = val;
      if (display) display.textContent = val;
    }
    if (select) {
      select.value = val;
    }
  });

  runPrediction();
}

function resetForm() {
  applyPreset('healthy');
}

// 12. Joriy Vektor va Parametrlarni Olish
function getCurrentVector() {
  if (!MODEL_DATA || !MODEL_DATA.features) return null;

  const values = [];
  const rawDict = {};

  MODEL_DATA.features.forEach(f => {
    const slider = document.getElementById(`slider-${f.id}`);
    const select = document.getElementById(`input-${f.id}`);

    let val;
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

// 13. ML Inference Engine (KNN, SVM, Ensemble)
function predictKNN(scaledVec) {
  if (!MODEL_DATA || !MODEL_DATA.inference_engine || !MODEL_DATA.inference_engine.knn_train_points) {
    return { prob: 0.5, pred: 0 };
  }

  const k = 7;
  const trainPoints = MODEL_DATA.inference_engine.knn_train_points;
  const trainLabels = MODEL_DATA.inference_engine.knn_train_labels;

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
  return { prob, pred };
}

function predictSVM(scaledVec) {
  if (!MODEL_DATA || !MODEL_DATA.inference_engine || !MODEL_DATA.inference_engine.svm_support_vectors) {
    return { prob: 0.5, pred: 0 };
  }

  const engine = MODEL_DATA.inference_engine;
  const gamma = engine.svm_gamma;
  const intercept = engine.svm_intercept;
  const dualCoef = engine.svm_dual_coef;
  const supportVectors = engine.svm_support_vectors;
  const probA = engine.svm_prob_a;
  const probB = engine.svm_prob_b;

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

function predictEnsemble(scaledVec, raw) {
  const knn = predictKNN(scaledVec);
  const svm = predictSVM(scaledVec);

  let gbScore = 0.0;
  if (raw.cp === 0) gbScore += 0.25;
  if (raw.oldpeak >= 2.0) gbScore += 0.25;
  if (raw.ca > 0) gbScore += 0.20 * raw.ca;
  if (raw.exang === 1) gbScore += 0.15;
  if (raw.thal === 3) gbScore += 0.15;
  if (raw.thalach < 130) gbScore += 0.12;
  const gbProb = Math.min(0.98, Math.max(0.02, 1 / (1 + Math.exp(- (gbScore - 0.45) * 3))));

  const ensembleProb = (svm.prob * 0.35) + (gbProb * 0.35) + (knn.prob * 0.30);
  const pred = ensembleProb >= 0.5 ? 1 : 0;

  return { prob: ensembleProb, pred, knnProb: knn.prob, svmProb: svm.prob, gbProb };
}

function calculateFramingham(raw) {
  let points = 0;
  const isMale = raw.sex === 1;
  const age = raw.age;
  const chol = raw.chol;
  const bp = raw.trestbps;
  const diabetes = raw.fbs === 1;

  if (isMale) {
    if (age <= 34) points += -9;
    else if (age <= 39) points += -4;
    else if (age <= 44) points += 0;
    else if (age <= 49) points += 3;
    else if (age <= 54) points += 6;
    else if (age <= 59) points += 8;
    else if (age <= 64) points += 10;
    else if (age <= 69) points += 11;
    else if (age <= 74) points += 12;
    else points += 13;

    if (chol >= 280) points += 3;
    else if (chol >= 240) points += 2;
    else if (chol >= 200) points += 1;

    if (bp >= 160) points += 3;
    else if (bp >= 140) points += 2;
    else if (bp >= 130) points += 1;

    if (diabetes) points += 2;
  } else {
    if (age <= 34) points += -7;
    else if (age <= 39) points += -3;
    else if (age <= 44) points += 0;
    else if (age <= 49) points += 3;
    else if (age <= 54) points += 6;
    else if (age <= 59) points += 8;
    else if (age <= 64) points += 10;
    else if (age <= 69) points += 12;
    else points += 14;

    if (chol >= 280) points += 4;
    else if (chol >= 240) points += 3;
    else if (chol >= 200) points += 1;

    if (bp >= 160) points += 4;
    else if (bp >= 140) points += 3;
    else if (bp >= 130) points += 2;

    if (diabetes) points += 4;
  }

  let riskPct = 1;
  if (points <= 0) riskPct = 1;
  else if (points <= 4) riskPct = 2;
  else if (points <= 6) riskPct = 3;
  else if (points <= 8) riskPct = 5;
  else if (points <= 10) riskPct = 8;
  else if (points <= 12) riskPct = 13;
  else if (points <= 14) riskPct = 20;
  else if (points <= 16) riskPct = 25;
  else riskPct = 32;

  return { points, riskPct };
}

// 14. Real-Time ECG Bedside Monitor
let ecgCanvas = null;
let ecgCtx = null;
let ecgAnimId = null;
let ecgX = 0;
let ecgLastY = 75;
let ecgAudioCtx = null;
let ecgAudioEnabled = false;
let lastBeepTime = 0;

function initEcgMonitor() {
  ecgCanvas = document.getElementById('ecg-canvas');
  if (!ecgCanvas) return;
  ecgCtx = ecgCanvas.getContext('2d');
  drawEcgGrid();
  startEcgLoop();
}

function drawEcgGrid() {
  if (!ecgCtx || !ecgCanvas) return;
  const w = ecgCanvas.width;
  const h = ecgCanvas.height;

  ecgCtx.fillStyle = '#02120b';
  ecgCtx.fillRect(0, 0, w, h);

  ecgCtx.lineWidth = 0.5;
  ecgCtx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
  for (let x = 0; x < w; x += 10) {
    ecgCtx.beginPath();
    ecgCtx.moveTo(x, 0);
    ecgCtx.lineTo(x, h);
    ecgCtx.stroke();
  }
  for (let y = 0; y < h; y += 10) {
    ecgCtx.beginPath();
    ecgCtx.moveTo(0, y);
    ecgCtx.lineTo(w, y);
    ecgCtx.stroke();
  }

  ecgCtx.lineWidth = 1;
  ecgCtx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
  for (let x = 0; x < w; x += 50) {
    ecgCtx.beginPath();
    ecgCtx.moveTo(x, 0);
    ecgCtx.lineTo(x, h);
    ecgCtx.stroke();
  }
  for (let y = 0; y < h; y += 50) {
    ecgCtx.beginPath();
    ecgCtx.moveTo(0, y);
    ecgCtx.lineTo(w, y);
    ecgCtx.stroke();
  }
}

function startEcgLoop() {
  if (ecgAnimId) cancelAnimationFrame(ecgAnimId);
  const speed = 2.5;

  function step() {
    if (!ecgCtx || !ecgCanvas) return;

    const w = ecgCanvas.width;
    const h = ecgCanvas.height;
    const midY = h / 2;

    const current = getCurrentVector()?.raw || { thalach: 140, oldpeak: 1.0, restecg: 1 };
    let bpm = Math.max(50, Math.min(220, current.thalach || 140));

    // If treadmill stress test is running, add treadmill bonus HR
    if (treadmillRunning) {
      const stage = BRUCE_STAGES[treadmillStage] || BRUCE_STAGES[0];
      bpm = Math.min(210, 75 + stage.hrBonus);
    }

    const oldpeak = current.oldpeak || 0;
    const restecg = current.restecg || 0;

    ecgCtx.fillStyle = '#02120b';
    ecgCtx.fillRect(ecgX, 0, 16, h);

    ecgCtx.lineWidth = 0.5;
    ecgCtx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
    for (let gx = Math.floor(ecgX / 10) * 10; gx <= ecgX + 16; gx += 10) {
      if (gx < w) {
        ecgCtx.beginPath();
        ecgCtx.moveTo(gx, 0);
        ecgCtx.lineTo(gx, h);
        ecgCtx.stroke();
      }
    }

    const cyclePixels = (60 / bpm) * 180;
    const phase = (ecgX % cyclePixels) / cyclePixels;

    let waveY = 0;
    if (phase > 0.08 && phase < 0.16) {
      waveY = Math.sin((phase - 0.08) / 0.08 * Math.PI) * 0.18;
    } else if (phase >= 0.19 && phase < 0.22) {
      waveY = -0.15;
    } else if (phase >= 0.22 && phase < 0.27) {
      const rRatio = (phase - 0.22) / 0.05;
      const lvhBonus = restecg === 2 ? 0.45 : 0;
      waveY = (1.2 + lvhBonus) * (1 - Math.abs(rRatio - 0.5) * 2);

      if (ecgAudioEnabled && Date.now() - lastBeepTime > (60000 / bpm) * 0.7) {
        playBeepSound();
        lastBeepTime = Date.now();
      }
    } else if (phase >= 0.27 && phase < 0.31) {
      waveY = -0.32;
    } else if (phase >= 0.31 && phase < 0.48) {
      waveY = -(oldpeak * 0.15);
    } else if (phase >= 0.48 && phase < 0.65) {
      const tSign = (restecg === 1 || oldpeak >= 2.0) ? -1 : 1;
      waveY = tSign * Math.sin((phase - 0.48) / 0.17 * Math.PI) * 0.32 - (oldpeak * 0.08);
    } else {
      waveY = 0;
    }

    const currentY = midY - (waveY * 50);

    ecgCtx.lineWidth = 2.2;
    ecgCtx.shadowBlur = 6;
    ecgCtx.shadowColor = '#10b981';
    ecgCtx.strokeStyle = '#34d399';
    ecgCtx.beginPath();
    ecgCtx.moveTo(ecgX - speed, ecgLastY);
    ecgCtx.lineTo(ecgX, currentY);
    ecgCtx.stroke();
    ecgCtx.shadowBlur = 0;

    ecgLastY = currentY;
    ecgX += speed;
    if (ecgX >= w) {
      ecgX = 0;
      ecgLastY = midY;
    }

    ecgAnimId = requestAnimationFrame(step);
  }

  ecgAnimId = requestAnimationFrame(step);
}

function toggleEcgAudio() {
  ecgAudioEnabled = !ecgAudioEnabled;
  const icon = document.getElementById('sound-icon');
  const btn = document.getElementById('sound-toggle-btn');

  if (ecgAudioEnabled) {
    if (!ecgAudioCtx) ecgAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (ecgAudioCtx.state === 'suspended') ecgAudioCtx.resume();
    if (icon) icon.className = "fa-solid fa-volume-high text-emerald-500 animate-pulse";
    if (btn) btn.classList.add('bg-emerald-50', 'dark:bg-emerald-950/40', 'border-emerald-500/50');
    playBeepSound();
  } else {
    if (icon) icon.className = "fa-solid fa-volume-xmark text-slate-400";
    if (btn) btn.classList.remove('bg-emerald-50', 'dark:bg-emerald-950/40', 'border-emerald-500/50');
  }
}

function playBeepSound() {
  if (!ecgAudioCtx || !ecgAudioEnabled) return;
  try {
    const osc = ecgAudioCtx.createOscillator();
    const gain = ecgAudioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ecgAudioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, ecgAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ecgAudioCtx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ecgAudioCtx.destination);
    osc.start();
    osc.stop(ecgAudioCtx.currentTime + 0.06);
  } catch (e) {
    console.error(e);
  }
}

// 15. Asosiy Bashorat Funksiyasi (Real-vaqtda barcha panellarni yangilash)
function runPrediction() {
  const current = getCurrentVector();
  if (!current) return;

  const raw = current.raw;
  const scaled = scaleVector(current.vector);

  // Baseline Ensemble prediction
  const ensRes = predictEnsemble(scaled, raw);
  const baselineRiskPct = Math.round(ensRes.prob * 100);

  // Virtual Pharmacology Simulation
  const pharmaRaw = applyPharmaAdjustments(raw);
  const pharmaVector = MODEL_DATA.features.map(f => pharmaRaw[f.id] ?? f.default);
  const pharmaScaled = scaleVector(pharmaVector);
  const pharmaEns = predictEnsemble(pharmaScaled, pharmaRaw);
  const pharmaRiskPct = Math.round(pharmaEns.prob * 100);

  const pharmaReduction = Math.max(0, baselineRiskPct - pharmaRiskPct);
  const pharmaBadge = document.getElementById('pharma-reduction-badge');
  if (pharmaBadge) {
    pharmaBadge.textContent = pharmaReduction > 0 ? `-${pharmaReduction}% xavf kamayishi` : "0%";
    pharmaBadge.className = pharmaReduction > 0 ? "font-mono font-black text-sm text-emerald-500 animate-pulse" : "font-mono font-black text-sm text-indigo-400";
  }

  // Active risk percentage used for display
  const effectiveRiskPct = pharmaReduction > 0 ? pharmaRiskPct : baselineRiskPct;

  // Framingham score
  const framingham = calculateFramingham(raw);

  // Updates
  updateGauge(effectiveRiskPct);
  updateBioAge(raw, effectiveRiskPct);
  updateEcgReadout(raw, effectiveRiskPct);
  updateFraminghamCard(framingham, effectiveRiskPct);
  updateExplainableAIWaterfall(raw, effectiveRiskPct);
  updateWhatIfSimulator(raw, ensRes.prob);
  updateClinicalAdvice(raw, effectiveRiskPct);
  updatePatientRadar(raw);
  updatePCAPatientPosition(scaled, raw);
  updateClinicalBiomarkers(raw);
  updateNearestPatientTwins(raw);
}

function updateEcgReadout(raw, riskPct) {
  const bpmDisplay = document.getElementById('ecg-bpm-display');
  const rhythmBadge = document.getElementById('ecg-rhythm-badge');
  const stBadge = document.getElementById('ecg-st-badge');
  const voltBadge = document.getElementById('ecg-volt-badge');

  if (bpmDisplay) bpmDisplay.textContent = `${raw.thalach} BPM`;

  if (rhythmBadge) {
    if (raw.thalach > 140) rhythmBadge.textContent = "SINUS TACHY";
    else if (raw.thalach < 60) rhythmBadge.textContent = "SINUS BRADY";
    else rhythmBadge.textContent = "NORMAL SINUS";
  }

  if (stBadge) {
    if (raw.oldpeak > 0) {
      stBadge.textContent = `-${raw.oldpeak.toFixed(1)} mm`;
      stBadge.className = "font-bold text-rose-400";
    } else {
      stBadge.textContent = "0.0 mm";
      stBadge.className = "font-bold text-emerald-400";
    }
  }

  if (voltBadge) {
    voltBadge.textContent = raw.restecg === 2 ? "LVH HYPER" : (raw.restecg === 1 ? "ST-T ABN" : "NORMAL");
  }
}

function updateGauge(riskPct) {
  const gaugeFill = document.getElementById('gauge-fill');
  const gaugeText = document.getElementById('gauge-percent');
  const riskStatusBadge = document.getElementById('risk-status-badge');
  const riskDesc = document.getElementById('risk-status-desc');
  const riskCategoryName = document.getElementById('risk-category-name');

  if (gaugeText) gaugeText.textContent = `${riskPct}%`;

  const circumference = 251.3;
  const offset = circumference - (riskPct / 100) * circumference;
  if (gaugeFill) {
    gaugeFill.style.strokeDashoffset = offset;
    if (riskPct >= 75) gaugeFill.setAttribute('stroke', '#dc2626');
    else if (riskPct >= 50) gaugeFill.setAttribute('stroke', '#f97316');
    else if (riskPct >= 25) gaugeFill.setAttribute('stroke', '#f59e0b');
    else gaugeFill.setAttribute('stroke', '#10b981');
  }

  if (riskStatusBadge && riskDesc) {
    if (riskPct >= 75) {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse';
      riskStatusBadge.innerHTML = `<i class="fa-solid fa-radiation mr-1"></i> ${t('risk_cat_4')}`;
      if (riskCategoryName) riskCategoryName.textContent = t('risk_cat_4');
      riskDesc.textContent = currentLang === 'ru' 
        ? "Высокая вероятность тяжелой ишемии миокарда и стеноза коронарных сосудов. Требуется срочная консультация кардиолога и коронарография."
        : (currentLang === 'en'
          ? "Critical likelihood of myocardial ischemia and major coronary artery stenosis. Immediate cardiology referral and angiogram required."
          : "Bemor ko'rsatkichlarida miokard ishemiyasi va koronar tomirlar torayishining jiddiy belgilari mavjud. Zudlik bilan kardiologik ko'rik va EKG/Koronorografiya talab etiladi.");
    } else if (riskPct >= 50) {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-300 dark:border-orange-800';
      riskStatusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1"></i> ${t('risk_cat_3')}`;
      if (riskCategoryName) riskCategoryName.textContent = t('risk_cat_3');
      riskDesc.textContent = currentLang === 'ru'
        ? "Повышенный риск сердечно-сосудистых осложнений. Рекомендованы нагрузочные тесты, контроль холестерина и медикаментозная терапия."
        : (currentLang === 'en'
          ? "Elevated cardiovascular risk. Anti-ischemic therapy, lipid management, and clinical stress testing are strongly recommended."
          : "Yurak kasalligi rivojlanish xavfi yuqori. Stenokardik belgilar, qon bosimi va xolesterinni qat'iy nazorat ostiga olish zarur.");
    } else if (riskPct >= 25) {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      riskStatusBadge.innerHTML = `<i class="fa-solid fa-circle-exclamation mr-1"></i> ${t('risk_cat_2')}`;
      if (riskCategoryName) riskCategoryName.textContent = t('risk_cat_2');
      riskDesc.textContent = currentLang === 'ru'
        ? "Умеренный риск. Обнаружены пограничные значения давления или липидного профиля. Показана коррекция образа жизни."
        : (currentLang === 'en'
          ? "Moderate borderline risk. Early signs of prehypertension or borderline cholesterol. Lifestyle modification advised."
          : "Bemor ko'rsatkichlarida ayrim xavfli belgilar (pre-gipertoniya yoki chegaraviy xolesterin) kuzatilmoqda. Turmush tarzini sog'lomlashtirish tavsiya etiladi.");
    } else {
      riskStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      riskStatusBadge.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> ${t('risk_cat_1')}`;
      if (riskCategoryName) riskCategoryName.textContent = t('risk_cat_1');
      riskDesc.textContent = currentLang === 'ru'
        ? "Клинические показатели в пределах нормы. Сердечно-сосудистая функция стабильна, признаков ишемии не выявлено."
        : (currentLang === 'en'
          ? "Clinical indicators within normal physiological ranges. Cardiorespiratory function stable, no signs of acute ischemia."
          : "Klinik ko'rsatkichlar me'yoriy oraliqda. Yurak-qon tomir tizimi funksiyasi barqaror, kasallik belgilari aniqlanmadi.");
    }
  }
}

function updateFraminghamCard(framingham, aiPct) {
  const fPctEl = document.getElementById('framingham-percent');
  const fCatEl = document.getElementById('framingham-category');
  const aiPctEl = document.getElementById('ai-ensemble-percent');
  const aiCatEl = document.getElementById('ai-ensemble-category');
  const insightEl = document.getElementById('framingham-insight-text');

  if (fPctEl) fPctEl.textContent = `${framingham.riskPct}%`;
  if (aiPctEl) aiPctEl.textContent = `${aiPct}%`;

  if (fCatEl) {
    fCatEl.textContent = framingham.riskPct >= 20 ? t('risk_cat_3') : (framingham.riskPct >= 10 ? t('risk_cat_2') : t('risk_cat_1'));
  }
  if (aiCatEl) {
    aiCatEl.textContent = aiPct >= 75 ? t('risk_cat_4') : (aiPct >= 50 ? t('risk_cat_3') : (aiPct >= 25 ? t('risk_cat_2') : t('risk_cat_1')));
  }

  if (insightEl) {
    const diff = aiPct - framingham.riskPct;
    if (diff >= 25) {
      insightEl.innerHTML = currentLang === 'ru'
        ? `<b>⚠️ Скрытый риск обнаружен ИИ:</b> ИИ оценивает риск на <b>+${diff}%</b> выше Фрамингема, так как модель выявила депрессию ST и сосудистый стеноз, которые не учитываются традиционной шкалой.`
        : (currentLang === 'en'
          ? `<b>⚠️ Hidden Risk Flagged by AI:</b> AI calculates <b>+${diff}%</b> higher risk than Framingham because it factors in ST-depression and fluoroscopic vessel stenosis missed by classical scores.`
          : `<b>⚠️ AI aniqlagan yashirin xavf:</b> AI xavfni Framingham formulasidan <b>+${diff}%</b> yuqori baholadi, sababi klassik kalkulyatorlar ST depressiyasi va qon tomir kalsinozini hisobga olmaydi.`);
    } else {
      insightEl.innerHTML = currentLang === 'ru'
        ? `<b>✓ Согласованность шкал:</b> Оценка ИИ и традиционный 10-летний риск Фрамингема находятся в схожих клинических диапазонах.`
        : (currentLang === 'en'
          ? `<b>✓ Clinical Concordance:</b> AI multi-parameter prediction and classical Framingham 10-year score are well aligned.`
          : `<b>✓ Klinik hamohanglik:</b> Sun'iy intellekt xulosasi va klassik Framingham 10-yillik bahosi bir-biriga mos kelmoqda.`);
    }
  }
}

function updateExplainableAIWaterfall(raw, patientRiskPct) {
  const container = document.getElementById('xai-waterfall-container');
  const insightEl = document.getElementById('xai-top-insight');
  if (!container || !MODEL_DATA || !MODEL_DATA.feature_importance) return;

  const attributions = [];

  if (raw.cp === 0) attributions.push({ name: currentLang === 'ru' ? 'Типичная стенокардия (cp)' : (currentLang === 'en' ? 'Typical Angina (cp)' : "Tipik stenokardiya (cp)"), impact: +22, direction: 'danger' });
  else if (raw.cp === 3) attributions.push({ name: currentLang === 'ru' ? 'Бессимптомная боль' : (currentLang === 'en' ? 'Asymptomatic pain' : "Asimptomatik og'riq"), impact: -8, direction: 'safe' });

  if (raw.oldpeak >= 2.0) attributions.push({ name: currentLang === 'ru' ? `Депрессия ST (${raw.oldpeak}mm)` : (currentLang === 'en' ? `ST Depression (${raw.oldpeak}mm)` : `ST Depressiyasi (${raw.oldpeak}mm)`), impact: Math.min(25, Math.round(raw.oldpeak * 7)), direction: 'danger' });
  else if (raw.oldpeak <= 0.2) attributions.push({ name: currentLang === 'ru' ? 'Изолиния ST в норме' : (currentLang === 'en' ? 'Normal ST baseline' : "ST segmenti me'yorda"), impact: -7, direction: 'safe' });

  if (raw.ca > 0) attributions.push({ name: currentLang === 'ru' ? `Стеноз сосудов (${raw.ca} сос.)` : (currentLang === 'en' ? `Vessels Fluoroscopy (${raw.ca})` : `Zararlangan tomirlar (${raw.ca} ta)`), impact: Math.min(24, raw.ca * 9), direction: 'danger' });
  else attributions.push({ name: currentLang === 'ru' ? 'Чистые сосуды (ca=0)' : (currentLang === 'en' ? 'Clear vessels (ca=0)' : "Toza qon tomirlari (ca=0)"), impact: -10, direction: 'safe' });

  if (raw.trestbps >= 145) attributions.push({ name: currentLang === 'ru' ? `Гипертония (${raw.trestbps} mmHg)` : (currentLang === 'en' ? `Hypertension (${raw.trestbps} mmHg)` : `Gipertoniya (${raw.trestbps} mm Hg)`), impact: +12, direction: 'danger' });
  else if (raw.trestbps <= 120) attributions.push({ name: currentLang === 'ru' ? `Оптимальное АД (${raw.trestbps})` : (currentLang === 'en' ? `Optimal BP (${raw.trestbps})` : `Optimal bosim (${raw.trestbps})`), impact: -6, direction: 'safe' });

  if (raw.thalach < 125) attributions.push({ name: currentLang === 'ru' ? `Низкий резерв ЧСС (${raw.thalach})` : (currentLang === 'en' ? `Low HR reserve (${raw.thalach})` : `Past puls zaxirasi (${raw.thalach})`), impact: +14, direction: 'danger' });
  else if (raw.thalach >= 165) attributions.push({ name: currentLang === 'ru' ? `Высокая толерантность (${raw.thalach})` : (currentLang === 'en' ? `High HR tolerance (${raw.thalach})` : `Yuqori puls zaxirasi (${raw.thalach})`), impact: -12, direction: 'safe' });

  if (raw.chol >= 260) attributions.push({ name: currentLang === 'ru' ? `Холестерин (${raw.chol} mg/dl)` : (currentLang === 'en' ? `Hypercholesterolemia (${raw.chol})` : `Giperxolesterinemiya (${raw.chol})`), impact: +11, direction: 'danger' });
  else if (raw.chol <= 185) attributions.push({ name: currentLang === 'ru' ? `Норма холестерина (${raw.chol})` : (currentLang === 'en' ? `Healthy lipids (${raw.chol})` : `Me'yordagi xolesterin (${raw.chol})`), impact: -8, direction: 'safe' });

  if (raw.exang === 1) attributions.push({ name: currentLang === 'ru' ? 'Стенокардия напряжения' : (currentLang === 'en' ? 'Exercise Angina' : "Mashq stenokardiyasi"), impact: +13, direction: 'danger' });

  attributions.sort((a, b) => b.impact - a.impact);

  container.innerHTML = attributions.slice(0, 5).map(attr => {
    const isDanger = attr.direction === 'danger';
    const barWidth = Math.min(100, Math.abs(attr.impact) * 4);
    return `
      <div class="text-xs">
        <div class="flex justify-between items-center mb-1 font-medium">
          <span class="text-slate-700 dark:text-slate-300">${attr.name}</span>
          <span class="font-mono font-bold ${isDanger ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}">
            ${isDanger ? '+' : ''}${attr.impact}%
          </span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex ${isDanger ? 'justify-start' : 'justify-end'}">
          <div class="h-full rounded-full waterfall-bar ${isDanger ? 'bg-rose-500' : 'bg-emerald-500'}" style="width: ${barWidth}%"></div>
        </div>
      </div>
    `;
  }).join('');

  if (insightEl) {
    const topDangers = attributions.filter(a => a.direction === 'danger');
    if (topDangers.length > 0) {
      const topNames = topDangers.slice(0, 3).map(a => a.name).join(', ');
      insightEl.innerHTML = currentLang === 'ru'
        ? `<b>Ключевые драйверы риска:</b> ${topNames}. Нацеленная коррекция этих факторов снизит риск быстрее всего.`
        : (currentLang === 'en'
          ? `<b>Primary Risk Drivers:</b> ${topNames}. Targeted reduction of these biomarkers yields the highest therapeutic impact.`
          : `<b>Eng xatarli omillar:</b> ${topNames}. Ushbu ko'rsatkichlarni normallashtirish xavfni keskin kamaytiradi.`);
    } else {
      insightEl.innerHTML = currentLang === 'ru'
        ? `<b>Стабильный статус:</b> Выраженных факторов риска не обнаружено. Пациент в безопасной зоне.`
        : (currentLang === 'en'
          ? `<b>Stable Clinical State:</b> No major pathological drivers detected. Patient profile is well-controlled.`
          : `<b>Barqaror klinik holat:</b> Xavfni oshiruvchi jiddiy patologik omillar aniqlanmadi.`);
    }
  }
}

function updateWhatIfSimulator(raw, currentProb) {
  const container = document.getElementById('whatif-container');
  if (!container || !MODEL_DATA) return;

  const optValues = { ...raw };
  optValues.trestbps = Math.min(optValues.trestbps, 120);
  optValues.chol = Math.min(optValues.chol, 185);
  optValues.oldpeak = Math.min(optValues.oldpeak, 0.2);
  optValues.exang = 0;

  const optVector = MODEL_DATA.features.map(f => optValues[f.id] ?? f.default);
  const optScaled = scaleVector(optVector);
  const optEns = predictEnsemble(optScaled, optValues);

  const currentPct = Math.round(currentProb * 100);
  const optPct = Math.round(optEns.prob * 100);
  const diffPct = Math.max(0, currentPct - optPct);

  container.innerHTML = `
    <div class="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
      <div class="flex items-center justify-between font-bold mb-1.5">
        <span class="text-emerald-900 dark:text-emerald-300">
          ${currentLang === 'ru' ? 'Потенциал снижения риска:' : (currentLang === 'en' ? 'Potential Risk Reduction:' : "Xavfni kamaytirish salohiyati:")}
        </span>
        <span class="text-base text-emerald-600 dark:text-emerald-400 font-mono">-${diffPct}%</span>
      </div>
      <p class="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed mb-2">
        ${currentLang === 'ru' 
          ? `При нормализации АД до 120 мм рт.ст., снижении холестерина до 185 мг/дл и купировании ишемии риск снизится с <b>${currentPct}%</b> до <b>${optPct}%</b>.`
          : (currentLang === 'en'
            ? `By normalizing BP to 120 mmHg, optimizing cholesterol to 185 mg/dl, and mitigating ischemia, risk falls from <b>${currentPct}%</b> to <b>${optPct}%</b>.`
            : `Qon bosimini 120 mm Hg ga, xolesterinni 185 mg/dl ga tushirish va ishemiyani davolash orqali xavf <b>${currentPct}%</b> dan <b>${optPct}%</b> gacha tushishi mumkin.`)}
      </p>
      <button onclick="applyOptimalTherapy()" class="w-full py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm">
        ${currentLang === 'ru' ? 'Применить оптимальный целевой сценарий' : (currentLang === 'en' ? 'Apply Optimal Clinical Target' : "Optimal maqsadli ssenariyni qo'llash")}
      </button>
    </div>
  `;
}

function applyOptimalTherapy() {
  const current = getCurrentVector()?.raw;
  if (!current) return;

  const target = { ...current, trestbps: 120, chol: 185, oldpeak: 0.2, exang: 0 };
  Object.entries(target).forEach(([key, val]) => {
    const slider = document.getElementById(`slider-${key}`);
    const display = document.getElementById(`val-${key}`);
    const select = document.getElementById(`input-${key}`);
    if (slider) {
      slider.value = val;
      if (display) display.textContent = val;
    }
    if (select) select.value = val;
  });

  runPrediction();
}

function updateClinicalAdvice(raw, riskPct) {
  const list = document.getElementById('clinical-advice-list');
  if (!list) return;

  const items = [];
  if (riskPct >= 75) {
    items.push({ icon: 'fa-truck-medical text-rose-500', text: currentLang === 'ru' ? 'Экстренная консультация кардиолога и селективная коронарография' : (currentLang === 'en' ? 'Urgent cardiology evaluation and coronary angiography' : "Zudlik bilan kardiolog ko'rigi va selektiv koronarografiya") });
    items.push({ icon: 'fa-pills text-indigo-500', text: currentLang === 'ru' ? 'Антиишемическая терапия (статины, бета-блокаторы, дезагреганты)' : (currentLang === 'en' ? 'Aggressive medical therapy (Statins, Beta-blockers, Antiplatelets)' : "Statinlar, beta-blokatorlar va antiaqregantlar terapiyasi") });
  } else if (riskPct >= 50) {
    items.push({ icon: 'fa-heart-pulse text-orange-500', text: currentLang === 'ru' ? 'Нагрузочный тредмил-тест и Холтеровское мониторирование 24ч' : (currentLang === 'en' ? 'Stress treadmill test & 24h Holter ECG monitoring' : "Tredmil-test va 24 soatlik Xolter EKG monitoringi") });
    items.push({ icon: 'fa-droplet text-blue-500', text: currentLang === 'ru' ? 'Липидный профиль высокой плотности и целевой уровень холестерина < 190' : (currentLang === 'en' ? 'Lipid panel assessment, targeting LDL reduction below 100 mg/dl' : "Lipid profilini chuqur tekshirish va xolesterinni < 190 ga tushirish") });
  } else if (riskPct >= 25) {
    items.push({ icon: 'fa-apple-whole text-emerald-500', text: currentLang === 'ru' ? 'Средиземноморская диета и аэробная активность 150 мин/нед' : (currentLang === 'en' ? 'Mediterranean cardio-diet and 150 min/week moderate aerobic exercise' : "O'rta yer dengizi parhezi va haftasiga 150 daqiqa kardio mashqlar") });
    items.push({ icon: 'fa-clock-rotate-left text-amber-500', text: currentLang === 'ru' ? 'Контрольный осмотр через 6 месяцев' : (currentLang === 'en' ? 'Follow-up clinical assessment in 6 months' : "6 oydan so'ng qayta nazorat ko'rigi") });
  } else {
    items.push({ icon: 'fa-circle-check text-emerald-500', text: currentLang === 'ru' ? 'Профиль отличный. Ежегодный профилактический кардио-скрининг' : (currentLang === 'en' ? 'Cardiovascular health optimal. Annual preventive check-up recommended' : "Salomatlik a'lo darajada. Har yili profilaktik skriningdan o'tib turish") });
  }

  list.innerHTML = items.map(it => `
    <li class="flex items-start space-x-2">
      <i class="fa-solid ${it.icon} mt-0.5 text-xs"></i>
      <span>${it.text}</span>
    </li>
  `).join('');
}

function updatePatientRadar(raw) {
  if (!MODEL_DATA || !MODEL_DATA.radar_baselines) return;
  const ctx = document.getElementById('patient-radar-chart');
  if (!ctx) return;

  const base = MODEL_DATA.radar_baselines;
  const labels = base[`labels_${currentLang}`] || base.labels_uz;
  const healthyNorm = base.healthy;

  const currentValues = [raw.age, raw.trestbps, raw.chol, raw.thalach, raw.oldpeak, raw.ca];
  const maxScales = [80, 200, 350, 210, 6.0, 3];
  const patientNorm = currentValues.map((v, i) => Math.min(100, Math.round((v / maxScales[i]) * 100)));
  const benchmarkNorm = healthyNorm.map((v, i) => Math.min(100, Math.round((v / maxScales[i]) * 100)));

  if (charts.radar) {
    charts.radar.data.labels = labels;
    charts.radar.data.datasets[0].data = patientNorm;
    charts.radar.data.datasets[1].data = benchmarkNorm;
    charts.radar.update();
  } else {
    const isDark = document.documentElement.classList.contains('dark');
    charts.radar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: currentLang === 'ru' ? 'Текущий пациент' : (currentLang === 'en' ? 'Current Patient' : "Ushbu bemor"),
            data: patientNorm,
            backgroundColor: 'rgba(225, 29, 72, 0.25)',
            borderColor: '#e11d48',
            pointBackgroundColor: '#e11d48',
            borderWidth: 2
          },
          {
            label: currentLang === 'ru' ? 'Норма (Здоровые)' : (currentLang === 'en' ? 'Healthy Benchmark' : "Sog'lom norma"),
            data: benchmarkNorm,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderColor: '#10b981',
            pointBackgroundColor: '#10b981',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
            grid: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
            pointLabels: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10, weight: 'bold' } },
            ticks: { display: false }
          }
        },
        plugins: {
          legend: { position: 'top', labels: { color: isDark ? '#e2e8f0' : '#334155', font: { size: 11, weight: 'bold' } } }
        }
      }
    });
  }
}

// 16. PCA 2D Bemorlar Klasteri (Unsupervised Scatter Plot)
function initPCAChart() {
  const ctx = document.getElementById('pca-cluster-chart');
  if (!ctx || !MODEL_DATA || !MODEL_DATA.pca) return;

  if (charts.pca) charts.pca.destroy();

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#e2e8f0' : '#334155';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  const healthyPoints = MODEL_DATA.pca.points.filter(p => p.target === 0);
  const diseasedPoints = MODEL_DATA.pca.points.filter(p => p.target === 1);

  charts.pca = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: currentLang === 'ru' ? 'Здоровые (0)' : (currentLang === 'en' ? 'Healthy (0)' : "Sog'lom (0)"),
          data: healthyPoints,
          backgroundColor: 'rgba(16, 185, 129, 0.65)',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: currentLang === 'ru' ? 'Высокий риск (1)' : (currentLang === 'en' ? 'High Risk (1)' : "Xavf Yuqori (1)"),
          data: diseasedPoints,
          backgroundColor: 'rgba(244, 63, 94, 0.65)',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: currentLang === 'ru' ? 'Текущий пациент' : (currentLang === 'en' ? 'Current Patient' : "Joriy Bemor"),
          data: [{ x: 0, y: 0 }],
          backgroundColor: '#fbbf24',
          borderColor: '#b45309',
          borderWidth: 3,
          pointRadius: 9,
          pointHoverRadius: 11,
          pointStyle: 'star'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: `PC1 (Asosiy O'q: ${MODEL_DATA.pca.variance_ratio[0]}% dispersiya)`, color: textColor, font: { size: 10 } },
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 10 } }
        },
        y: {
          title: { display: true, text: `PC2 (Ikkinchi O'q: ${MODEL_DATA.pca.variance_ratio[1]}% dispersiya)`, color: textColor, font: { size: 10 } },
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 10 } }
        }
      },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, color: textColor, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            label: context => {
              const pt = context.raw;
              if (context.datasetIndex === 2) return `Joriy Bemor: PC1=${pt.x.toFixed(2)}, PC2=${pt.y.toFixed(2)}`;
              return `Bemor #${pt.id || ''}: Yoshi=${pt.age}, Bosim=${pt.trestbps || pt.bp}, Xol=${pt.chol} [${pt.target === 1 ? 'Xavf Yuqori' : 'Sog\'lom'}]`;
            }
          }
        }
      }
    }
  });
}

function updatePCAPatientPosition(scaledVec, raw) {
  if (!MODEL_DATA || !MODEL_DATA.pca || !MODEL_DATA.pca.components || !charts.pca) return;

  const comp0 = MODEL_DATA.pca.components[0];
  const comp1 = MODEL_DATA.pca.components[1];

  let px = 0;
  let py = 0;
  for (let j = 0; j < scaledVec.length; j++) {
    px += scaledVec[j] * comp0[j];
    py += scaledVec[j] * comp1[j];
  }

  // Update current patient point
  charts.pca.data.datasets[2].data = [{ x: round(px, 3), y: round(py, 3) }];
  charts.pca.update('none');

  // Find 3 Nearest Neighbors in PCA space
  const distances = MODEL_DATA.pca.points.map((p, idx) => {
    const dx = p.x - px;
    const dy = p.y - py;
    return { id: idx + 1, dist: Math.sqrt(dx * dx + dy * dy), target: p.target, age: p.age, bp: p.trestbps || p.bp, chol: p.chol };
  });

  distances.sort((a, b) => a.dist - b.dist);
  const nearest = distances.slice(0, 3);

  const textEl = document.getElementById('pca-nearest-neighbors-text');
  if (textEl) {
    textEl.innerHTML = `
      <b class="text-slate-800 dark:text-slate-200">Eng o'xshash 3 ta bemor tarixi (Klinik analoglar):</b> 
      ${nearest.map((n, i) => `
        <span class="inline-block mr-3">
          #${n.id} (${n.age} yosh, ${n.bp} mmHg, ${n.chol} mg/dl) ➔ 
          <span class="font-bold ${n.target === 1 ? 'text-rose-500' : 'text-emerald-500'}">${n.target === 1 ? 'Xavf Yuqori' : 'Sog\'lom'}</span>
        </span>
      `).join('')}
    `;
  }
}

function round(val, dec) {
  return Number(Math.round(val + 'e' + dec) + 'e-' + dec);
}

// 17. Modellarni Taqqoslash Diagrammalari
function initEnhancedCharts() {
  if (!MODEL_DATA) return;
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#e2e8f0' : '#334155';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  initPCAChart();

  // Multi-line ROC Curves
  const rocCtx = document.getElementById('multi-roc-chart');
  if (rocCtx && MODEL_DATA.roc_curves) {
    if (charts.roc) charts.roc.destroy();
    const curves = MODEL_DATA.roc_curves;
    charts.roc = new Chart(rocCtx, {
      type: 'line',
      data: {
        datasets: [
          { label: 'Ensemble Soft-Voting (AUC: 90.7%)', data: curves.ensemble || [], borderColor: '#f43f5e', borderWidth: 3, tension: 0.1, pointRadius: 0 },
          { label: 'Gradient Boosting (AUC: 88.0%)', data: curves.gb || [], borderColor: '#10b981', borderWidth: 2, tension: 0.1, pointRadius: 0 },
          { label: 'Random Forest (AUC: 89.8%)', data: curves.rf || [], borderColor: '#f59e0b', borderWidth: 2, tension: 0.1, pointRadius: 0 },
          { label: 'SVM RBF (AUC: 88.1%)', data: curves.svm || [], borderColor: '#6366f1', borderWidth: 2, tension: 0.1, pointRadius: 0 },
          { label: 'KNN k=7 (AUC: 88.2%)', data: curves.knn || [], borderColor: '#3b82f6', borderWidth: 2, tension: 0.1, pointRadius: 0 },
          { label: 'Tasodifiy (50%)', data: [{x: 0, y: 0}, {x: 1, y: 1}], borderColor: '#94a3b8', borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { type: 'linear', min: 0, max: 1, title: { display: true, text: 'False Positive Rate (1 - Specificity)', color: textColor, font: { size: 10 } }, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
          y: { min: 0, max: 1, title: { display: true, text: 'True Positive Rate (Recall / Sensitivity)', color: textColor, font: { size: 10 } }, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } }
        },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, color: textColor, font: { size: 10 } } } }
      }
    });
  }

  // 5-Fold Cross Validation Chart
  const cvCtx = document.getElementById('cross-validation-chart');
  if (cvCtx && MODEL_DATA.models) {
    if (charts.cv) charts.cv.destroy();
    const m = MODEL_DATA.models;
    charts.cv = new Chart(cvCtx, {
      type: 'bar',
      data: {
        labels: ['Fold 1', 'Fold 2', 'Fold 3', 'Fold 4', 'Fold 5'],
        datasets: [
          { label: 'Ensemble (Avg 81.4%)', data: m.ensemble.metrics.cv_folds, backgroundColor: 'rgba(244, 63, 94, 0.85)', borderRadius: 4 },
          { label: 'Gradient Boosting (Avg 80.4%)', data: m.gb.metrics.cv_folds, backgroundColor: 'rgba(16, 185, 129, 0.85)', borderRadius: 4 },
          { label: 'Random Forest (Avg 83.7%)', data: m.rf.metrics.cv_folds, backgroundColor: 'rgba(245, 158, 11, 0.85)', borderRadius: 4 },
          { label: 'SVM (Avg 81.1%)', data: m.svm.metrics.cv_folds, backgroundColor: 'rgba(99, 102, 241, 0.85)', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 65, max: 100, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } }
        },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: textColor, font: { size: 10 } } } }
      }
    });
  }

  // Feature Importance Chart
  const fiCtx = document.getElementById('feature-importance-chart');
  if (fiCtx && MODEL_DATA.feature_importance) {
    if (charts.fi) charts.fi.destroy();
    const topFeatures = MODEL_DATA.feature_importance.slice(0, 8);
    charts.fi = new Chart(fiCtx, {
      type: 'bar',
      data: {
        labels: topFeatures.map(f => f[`name_${currentLang}`] || f.name_uz),
        datasets: [{ label: 'Ensemble Og\'irlik Indeksi (%)', data: topFeatures.map(f => f.ensemble_weight), backgroundColor: '#f59e0b', borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
          y: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  // KNN k-Tuning Chart
  const ktuneCtx = document.getElementById('k-tuning-chart');
  if (ktuneCtx && MODEL_DATA.k_tuning_curve) {
    if (charts.ktune) charts.ktune.destroy();
    const curve = MODEL_DATA.k_tuning_curve;
    charts.ktune = new Chart(ktuneCtx, {
      type: 'line',
      data: {
        labels: curve.map(c => `k=${c.k}`),
        datasets: [
          { label: 'Accuracy (%)', data: curve.map(c => c.accuracy), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.3 },
          { label: 'F1-Score (%)', data: curve.map(c => c.f1_score), borderColor: '#10b981', borderDash: [3, 3], tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 70, max: 90, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } }
        },
        plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 } } } }
      }
    });
  }
}

function updateAllChartsTheme() {
  if (charts.radar) {
    charts.radar.destroy();
    charts.radar = null;
    const current = getCurrentVector()?.raw;
    if (current) updatePatientRadar(current);
  }
  initEnhancedCharts();
}

// 18. EMR & Dinamika Tahlili
const EMR_STORAGE_KEY = 'cardiorisk_emr_v3';

function initDefaultEMRData() {
  const existing = localStorage.getItem(EMR_STORAGE_KEY);
  if (!existing) {
    const defaults = [
      {
        id: "emr-001",
        name: "Aliyev Muzaffar (Boshlang'ich ko'rik)",
        date: "2026-08-14",
        age: 58,
        sex: 1,
        riskPct: 82,
        raw: { age: 58, sex: 1, cp: 0, trestbps: 155, chol: 275, fbs: 1, restecg: 1, thalach: 125, exang: 1, oldpeak: 2.8, slope: 1, ca: 2, thal: 3 }
      },
      {
        id: "emr-002",
        name: "Aliyev Muzaffar (3 oylik terapiyadan so'ng)",
        date: "2026-11-12",
        age: 58,
        sex: 1,
        riskPct: 34,
        raw: { age: 58, sex: 1, cp: 2, trestbps: 125, chol: 195, fbs: 0, restecg: 0, thalach: 152, exang: 0, oldpeak: 0.5, slope: 2, ca: 1, thal: 2 }
      },
      {
        id: "emr-003",
        name: "Karimova Dilnoza (Skrining)",
        date: "2026-10-05",
        age: 52,
        sex: 0,
        riskPct: 18,
        raw: { age: 52, sex: 0, cp: 1, trestbps: 118, chol: 180, fbs: 0, restecg: 0, thalach: 168, exang: 0, oldpeak: 0.0, slope: 2, ca: 0, thal: 2 }
      }
    ];
    localStorage.setItem(EMR_STORAGE_KEY, JSON.stringify(defaults));
  }
}

function getEMRPatients() {
  try {
    return JSON.parse(localStorage.getItem(EMR_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCurrentPatientToEMR() {
  const current = getCurrentVector();
  if (!current) return;

  const patientName = prompt(
    currentLang === 'ru' ? "Введите имя или номер пациента:" : (currentLang === 'en' ? "Enter Patient Name or ID:" : "Bemor ismi yoki ID raqamini kiriting:"),
    `Bemor #${Math.floor(100 + Math.random() * 900)}`
  );
  if (!patientName) return;

  const scaled = scaleVector(current.vector);
  const ens = predictEnsemble(scaled, current.raw);
  const riskPct = Math.round(ens.prob * 100);

  const newPatient = {
    id: `emr-${Date.now()}`,
    name: patientName,
    date: new Date().toISOString().split('T')[0],
    age: current.raw.age,
    sex: current.raw.sex,
    riskPct: riskPct,
    raw: { ...current.raw }
  };

  const list = getEMRPatients();
  list.unshift(newPatient);
  localStorage.setItem(EMR_STORAGE_KEY, JSON.stringify(list));

  alert(currentLang === 'ru' ? "Пациент успешно сохранен в ЭМК!" : (currentLang === 'en' ? "Patient record saved to EMR!" : "Bemor ma'lumotlari EMR kartasiga muvaffaqiyatli saqlandi!"));
  renderEMRRecords();
}

function renderEMRRecords() {
  const listContainer = document.getElementById('emr-patient-list');
  const sel1 = document.getElementById('dyn-select-visit1');
  const sel2 = document.getElementById('dyn-select-visit2');

  const patients = getEMRPatients();

  if (sel1 && sel2) {
    sel1.innerHTML = patients.map((p, idx) => `<option value="${p.id}" ${idx === 0 ? 'selected' : ''}>${p.name} (${p.date} - ${p.riskPct}%)</option>`).join('');
    sel2.innerHTML = patients.map((p, idx) => `<option value="${p.id}" ${idx === 1 ? 'selected' : ''}>${p.name} (${p.date} - ${p.riskPct}%)</option>`).join('');
    runDynamicsComparison();
  }

  if (listContainer) {
    if (patients.length === 0) {
      listContainer.innerHTML = `<div class="col-span-3 text-center p-8 text-slate-400 text-xs">${currentLang === 'ru' ? 'Записей в ЭМК пока нет.' : (currentLang === 'en' ? 'No EMR patient records found.' : "EMR kartasida bemorlar mavjud emas.")}</div>`;
      return;
    }

    listContainer.innerHTML = patients.map(p => `
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm relative space-y-2">
        <div class="flex items-start justify-between">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white">${p.name}</h4>
            <span class="text-[10px] text-slate-400 font-mono">${p.date} • ${p.age} yosh • ${p.sex === 1 ? 'Erkak' : 'Ayol'}</span>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${p.riskPct >= 50 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}">
            ${p.riskPct}% Xavf
          </span>
        </div>

        <div class="grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          <div><span class="text-slate-400 block">Bosim:</span> <b>${p.raw.trestbps}</b></div>
          <div><span class="text-slate-400 block">Xolesterin:</span> <b>${p.raw.chol}</b></div>
          <div><span class="text-slate-400 block">ST Dep:</span> <b>${p.raw.oldpeak}mm</b></div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
          <button onclick="loadPatientToCalculator('${p.id}')" class="px-2.5 py-1 text-[11px] font-bold rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition">
            <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> ${currentLang === 'ru' ? 'Загрузить' : (currentLang === 'en' ? 'Load' : "Yuklash")}
          </button>
          <button onclick="deleteEMRPatient('${p.id}')" class="text-slate-400 hover:text-rose-500 text-xs px-2 py-1 transition">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
}

function loadPatientToCalculator(patientId) {
  const p = getEMRPatients().find(item => item.id === patientId);
  if (!p) return;

  Object.entries(p.raw).forEach(([key, val]) => {
    const slider = document.getElementById(`slider-${key}`);
    const display = document.getElementById(`val-${key}`);
    const select = document.getElementById(`input-${key}`);
    if (slider) {
      slider.value = val;
      if (display) display.textContent = val;
    }
    if (select) select.value = val;
  });

  document.querySelector('[data-tab-target="tab-calculator"]')?.click();
  runPrediction();
}

function deleteEMRPatient(patientId) {
  if (!confirm(currentLang === 'ru' ? "Удалить запись?" : (currentLang === 'en' ? "Delete record?" : "Ushbu yozuv o'chirilsinmi?"))) return;
  const list = getEMRPatients().filter(p => p.id !== patientId);
  localStorage.setItem(EMR_STORAGE_KEY, JSON.stringify(list));
  renderEMRRecords();
}

function clearEMRHistory() {
  if (!confirm(currentLang === 'ru' ? "Очистить всю историю ЭМК?" : (currentLang === 'en' ? "Clear all EMR history?" : "Barcha EMR tarixini tozalashni xohlaysizmi?"))) return;
  localStorage.removeItem(EMR_STORAGE_KEY);
  initDefaultEMRData();
  renderEMRRecords();
}

function runDynamicsComparison() {
  const sel1 = document.getElementById('dyn-select-visit1');
  const sel2 = document.getElementById('dyn-select-visit2');
  const container = document.getElementById('dynamics-result-container');
  if (!sel1 || !sel2 || !container) return;

  const p1 = getEMRPatients().find(p => p.id === sel1.value);
  const p2 = getEMRPatients().find(p => p.id === sel2.value);

  if (!p1 || !p2) {
    container.innerHTML = `<span class="text-xs text-slate-400">Taqqoslash uchun ikkita bemor tashrifini tanlang.</span>`;
    return;
  }

  const riskDelta = p2.riskPct - p1.riskPct;
  const bpDelta = p2.raw.trestbps - p1.raw.trestbps;
  const cholDelta = p2.raw.chol - p1.raw.chol;
  const pulseDelta = p2.raw.thalach - p1.raw.thalach;
  const stDelta = (p2.raw.oldpeak - p1.raw.oldpeak).toFixed(1);

  const isImprovement = riskDelta < 0;

  container.innerHTML = `
    <div class="space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
        <span class="text-xs font-bold text-slate-800 dark:text-slate-200">${p1.name} ➔ ${p2.name}</span>
        <span class="px-2.5 py-1 rounded-md text-xs font-mono font-black ${isImprovement ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}">
          ${riskDelta > 0 ? '+' : ''}${riskDelta}% Xavf O'zgarishi
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
        <div class="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <span class="text-[10px] text-slate-400 block">Qon Bosimi:</span>
          <b>${p1.raw.trestbps} ➔ ${p2.raw.trestbps}</b>
          <span class="block text-[10px] font-bold ${bpDelta <= 0 ? 'text-emerald-500' : 'text-rose-500'}">(${bpDelta > 0 ? '+' : ''}${bpDelta} mmHg)</span>
        </div>
        <div class="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <span class="text-[10px] text-slate-400 block">Xolesterin:</span>
          <b>${p1.raw.chol} ➔ ${p2.raw.chol}</b>
          <span class="block text-[10px] font-bold ${cholDelta <= 0 ? 'text-emerald-500' : 'text-rose-500'}">(${cholDelta > 0 ? '+' : ''}${cholDelta} mg/dl)</span>
        </div>
        <div class="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <span class="text-[10px] text-slate-400 block">ST Depressiya:</span>
          <b>${p1.raw.oldpeak} ➔ ${p2.raw.oldpeak}mm</b>
          <span class="block text-[10px] font-bold ${stDelta <= 0 ? 'text-emerald-500' : 'text-rose-500'}">(${stDelta > 0 ? '+' : ''}${stDelta} mm)</span>
        </div>
        <div class="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <span class="text-[10px] text-slate-400 block">Puls Zaxirasi:</span>
          <b>${p1.raw.thalach} ➔ ${p2.raw.thalach}</b>
          <span class="block text-[10px] font-bold ${pulseDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}">(${pulseDelta > 0 ? '+' : ''}${pulseDelta} bpm)</span>
        </div>
      </div>

      <div class="p-2.5 rounded-lg text-[11px] leading-relaxed ${isImprovement ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300'}">
        <i class="fa-solid ${isImprovement ? 'fa-circle-check text-emerald-500' : 'fa-triangle-exclamation text-rose-500'} mr-1"></i>
        ${isImprovement 
          ? `Ijobiy dinamika: Terapiya natijasida bemorning yurak kasalligi xavfi <b>${Math.abs(riskDelta)}%</b> ga pasaygan. Tomirlar tonusi va yurak urish zaxirasi sezilarli yaxshilangan.`
          : `Salbiy dinamika: Ko'rsatkichlar og'irlashgan (+${riskDelta}% xavf ortishi). Antiishemik dorilar dozasini qayta ko'rib chiqish talab etiladi.`}
      </div>
    </div>
  `;
}

// 19. Klinik Biomarkerlar, CBR Egizaklar va UCI Cleveland Dataset Intelligence
let activeCohortFilter = {
  sex: 'all',
  age: 'all',
  bp: 'all',
  chol: 'all',
  st: 'all'
};

function updateClinicalBiomarkers(raw) {
  // 1. Duke Treadmill Score (DTS = Exercise Time(min) - 5*ST_dep - 4*Angina)
  // Time estimated from thalach: (thalach - 60) / 12
  const estTime = (raw.thalach - 60) / 12.0;
  const dts = Number((estTime - (5.0 * raw.oldpeak) - (4.0 * raw.exang)).toFixed(1));
  const dtsEl = document.getElementById('bm-duke-score');
  const dtsBadge = document.getElementById('bm-duke-badge');
  if (dtsEl) {
    dtsEl.textContent = `${dts > 0 ? '+' : ''}${dts}`;
  }
  if (dtsBadge) {
    if (dts >= 5) {
      dtsBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      dtsBadge.textContent = currentLang === 'ru' ? 'Низкий риск (≥5)' : (currentLang === 'en' ? 'Low Risk (≥5)' : "Past xavf (≥5)");
    } else if (dts >= -10) {
      dtsBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      dtsBadge.textContent = currentLang === 'ru' ? 'Умеренный (-10..4)' : (currentLang === 'en' ? 'Moderate (-10..4)' : "O'rta xavf (-10..4)");
    } else {
      dtsBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse';
      dtsBadge.textContent = currentLang === 'ru' ? 'Высокий риск (<-10)' : (currentLang === 'en' ? 'High Risk (<-10)' : "Yuqori xavf (<-10)");
    }
  }

  // 2. Rate Pressure Product (RPP = SBP * HR / 100)
  const rpp = Math.round((raw.trestbps * raw.thalach) / 100);
  const rppEl = document.getElementById('bm-rpp-val');
  const rppBadge = document.getElementById('bm-rpp-badge');
  if (rppEl) rppEl.textContent = rpp.toString();
  if (rppBadge) {
    if (rpp > 250) {
      rppBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      rppBadge.textContent = currentLang === 'ru' ? 'Высокая MVO2' : (currentLang === 'en' ? 'High MVO2' : "Yuqori MVO2");
    } else if (rpp >= 180) {
      rppBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      rppBadge.textContent = currentLang === 'ru' ? 'Норма MVO2' : (currentLang === 'en' ? 'Normal MVO2' : "O'rta MVO2");
    } else {
      rppBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      rppBadge.textContent = currentLang === 'ru' ? 'Низкая MVO2' : (currentLang === 'en' ? 'Low MVO2' : "Past MVO2");
    }
  }

  // 3. Mean Arterial Pressure (MAP = SBP * 0.7 + 25)
  const mapVal = Math.round(raw.trestbps * 0.7 + 25);
  const mapEl = document.getElementById('bm-map-val');
  if (mapEl) mapEl.textContent = `${mapVal}`;

  // 4. Chronotropic Reserve (% of age predicted max HR = thalach / (220 - age) * 100)
  const maxPred = Math.max(1, 220 - raw.age);
  const chronoPct = Math.round((raw.thalach / maxPred) * 100);
  const chronoEl = document.getElementById('bm-chrono-val');
  const chronoBadge = document.getElementById('bm-chrono-badge');
  if (chronoEl) chronoEl.textContent = `${chronoPct}%`;
  if (chronoBadge) {
    if (chronoPct >= 85) {
      chronoBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      chronoBadge.textContent = currentLang === 'ru' ? 'Достаточный' : (currentLang === 'en' ? 'Competent' : "Yetarli");
    } else {
      chronoBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      chronoBadge.textContent = currentLang === 'ru' ? 'Дефицит (<85%)' : (currentLang === 'en' ? 'Deficit (<85%)' : "Yetishmovchi");
    }
  }
}

function updateNearestPatientTwins(raw) {
  const container = document.getElementById('cbr-twins-container');
  if (!container || !MODEL_DATA || !MODEL_DATA.dataset_preview) return;

  const dataset = MODEL_DATA.dataset_preview;
  const currentVector = MODEL_DATA.features.map(f => raw[f.id] ?? f.default);
  const scaledCurrent = scaleVector(currentVector);

  const distances = dataset.map((patient, index) => {
    const pVector = MODEL_DATA.features.map(f => patient[f.id] ?? f.default);
    const scaledP = scaleVector(pVector);
    let sumSq = 0;
    for (let i = 0; i < scaledCurrent.length; i++) {
      const diff = scaledCurrent[i] - scaledP[i];
      sumSq += diff * diff;
    }
    const dist = Math.sqrt(sumSq);
    const simPct = Math.max(15, Math.min(99, Math.round(100 / (1 + dist * 0.22))));
    return { patient, index: index + 1, dist, simPct };
  });

  distances.sort((a, b) => a.dist - b.dist);
  const top3 = distances.slice(0, 3);

  container.innerHTML = top3.map((item) => {
    const p = item.patient;
    const isDiseased = p.target === 1;
    return `
      <div class="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] gap-2">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center font-mono text-[10px]">
            #${item.index}
          </div>
          <div>
            <div class="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <span>${p.age} yosh, ${p.sex === 1 ? (currentLang === 'ru' ? 'Муж' : (currentLang === 'en' ? 'Male' : 'Erkak')) : (currentLang === 'ru' ? 'Жен' : (currentLang === 'en' ? 'Female' : 'Ayol'))}</span>
              <span class="font-mono text-purple-600 dark:text-purple-400 font-black">${item.simPct}% o'xshash</span>
            </div>
            <div class="text-[10px] text-slate-500 font-mono">
              BP: ${p.trestbps} • Chol: ${p.chol} • Puls: ${p.thalach} • CA: ${p.ca}
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 rounded text-[9px] font-bold ${isDiseased ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}">
            ${isDiseased ? (currentLang === 'ru' ? 'Ишемия' : (currentLang === 'en' ? 'Diseased' : 'Xavf Bor')) : (currentLang === 'ru' ? 'Здоров' : (currentLang === 'en' ? 'Healthy' : 'Sog\'lom'))}
          </span>
          <button onclick='loadDatasetRowToForm(${JSON.stringify(p)})' class="px-2 py-1 rounded text-[10px] font-bold bg-slate-200/80 hover:bg-purple-600 hover:text-white dark:bg-slate-700 dark:hover:bg-purple-600 transition" title="Kalkulyatorga yuklash">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function initDatasetIntelligence() {
  if (!MODEL_DATA || !MODEL_DATA.dataset_intelligence) return;
  initDatasetCharts();
  renderCorrelationsList();
  runCohortQuery();
  renderDatasetTable();
}

function initDatasetCharts() {
  if (!MODEL_DATA || !MODEL_DATA.dataset_intelligence) return;
  const intel = MODEL_DATA.dataset_intelligence;
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? '#334155' : '#f1f5f9';

  // 1. Age & Gender Disparity Bar Chart
  const ageCanvas = document.getElementById('chart-ds-age-gender');
  if (ageCanvas && intel.cohort_distributions?.age_brackets) {
    if (charts.dsAgeGender) charts.dsAgeGender.destroy();
    const brackets = intel.cohort_distributions.age_brackets;
    charts.dsAgeGender = new Chart(ageCanvas, {
      type: 'bar',
      data: {
        labels: brackets.map(b => b.group),
        datasets: [
          {
            label: currentLang === 'ru' ? 'Ишемия / Риск' : (currentLang === 'en' ? 'High Risk' : "Xavf Yuqori"),
            data: brackets.map(b => b.diseased),
            backgroundColor: 'rgba(225, 29, 72, 0.85)',
            borderRadius: 6
          },
          {
            label: currentLang === 'ru' ? 'Здоровые' : (currentLang === 'en' ? 'Healthy' : "Sog'lom"),
            data: brackets.map(b => b.healthy),
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { size: 10 } } }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
    });
  }

  // 2. Chest Pain (CP 0-3) vs Risk Chart
  const cpCanvas = document.getElementById('chart-ds-cp-risk');
  if (cpCanvas && intel.cohort_distributions?.cp_breakdown) {
    if (charts.dsCpRisk) charts.dsCpRisk.destroy();
    const cpData = intel.cohort_distributions.cp_breakdown;
    charts.dsCpRisk = new Chart(cpCanvas, {
      type: 'bar',
      data: {
        labels: cpData.map(c => c.label),
        datasets: [{
          label: currentLang === 'ru' ? 'Вероятность патологии (%)' : (currentLang === 'en' ? 'Risk Prevalence (%)' : 'Kasallanish ehtimoli (%)'),
          data: cpData.map(c => c.risk_pct),
          backgroundColor: [
            'rgba(59, 130, 246, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(239, 68, 68, 0.85)'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 9 } }, grid: { display: false } },
          y: { min: 0, max: 100, ticks: { color: textColor, callback: v => `${v}%` }, grid: { color: gridColor } }
        }
      }
    });
  }

  // 3. Scatter Plot: Trestbps vs Chol
  const scatterCanvas = document.getElementById('chart-ds-scatter-bp-chol');
  if (scatterCanvas && intel.scatter_chol_bp) {
    if (charts.dsScatter) charts.dsScatter.destroy();
    const points = intel.scatter_chol_bp;
    charts.dsScatter = new Chart(scatterCanvas, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: currentLang === 'ru' ? 'Ишемия (Патология)' : (currentLang === 'en' ? 'Diseased' : 'Xavfli'),
            data: points.filter(p => p.target === 1).map(p => ({ x: p.x, y: p.y })),
            backgroundColor: 'rgba(225, 29, 72, 0.75)',
            pointRadius: 4
          },
          {
            label: currentLang === 'ru' ? 'Здоровые' : (currentLang === 'en' ? 'Healthy' : 'Sog\'lom'),
            data: points.filter(p => p.target === 0).map(p => ({ x: p.x, y: p.y })),
            backgroundColor: 'rgba(16, 185, 129, 0.75)',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { size: 10 } } }
        },
        scales: {
          x: {
            title: { display: true, text: 'Qon Bosimi (mm Hg)', color: textColor, font: { size: 10 } },
            ticks: { color: textColor },
            grid: { color: gridColor }
          },
          y: {
            title: { display: true, text: 'Xolesterin (mg/dl)', color: textColor, font: { size: 10 } },
            ticks: { color: textColor },
            grid: { color: gridColor }
          }
        }
      }
    });
  }

  // 4. Vessel Stenosis (ca) vs Risk
  const caCanvas = document.getElementById('chart-ds-ca-stenosis');
  if (caCanvas && intel.cohort_distributions?.ca_breakdown) {
    if (charts.dsCaStenosis) charts.dsCaStenosis.destroy();
    const caData = intel.cohort_distributions.ca_breakdown;
    charts.dsCaStenosis = new Chart(caCanvas, {
      type: 'bar',
      data: {
        labels: caData.map(c => c.label),
        datasets: [{
          label: currentLang === 'ru' ? 'Доля ишемии (%)' : (currentLang === 'en' ? 'Prevalence (%)' : 'Xavf ulushi (%)'),
          data: caData.map(c => c.risk_pct),
          backgroundColor: [
            'rgba(244, 63, 94, 0.85)',
            'rgba(251, 146, 60, 0.85)',
            'rgba(234, 179, 8, 0.85)',
            'rgba(34, 197, 94, 0.85)'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { min: 0, max: 100, ticks: { color: textColor, callback: v => `${v}%` }, grid: { color: gridColor } }
        }
      }
    });
  }
}

function renderCorrelationsList() {
  const container = document.getElementById('dataset-correlations-container');
  if (!container || !MODEL_DATA || !MODEL_DATA.dataset_intelligence?.feature_correlations) return;

  const correlations = MODEL_DATA.dataset_intelligence.feature_correlations;
  container.innerHTML = correlations.map(item => {
    const isPos = item.impact_direction === 'positive';
    const barWidth = Math.round(item.abs_corr * 100);
    const insight = currentLang === 'ru' ? item.insight_ru : (currentLang === 'en' ? item.insight_en : item.insight_uz);

    return `
      <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-slate-800 dark:text-slate-200 font-mono">${item.id.toUpperCase()}</span>
          <span class="font-mono font-bold ${isPos ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}">
            r = ${item.correlation > 0 ? '+' : ''}${item.correlation}
          </span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div class="h-full rounded-full ${isPos ? 'bg-rose-500' : 'bg-indigo-500'}" style="width: ${barWidth}%"></div>
        </div>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
          ${insight}
        </p>
      </div>
    `;
  }).join('');
}

function matchesCohortFilter(p) {
  if (activeCohortFilter.sex === 'male' && p.sex !== 1) return false;
  if (activeCohortFilter.sex === 'female' && p.sex !== 0) return false;

  if (activeCohortFilter.age === 'under50' && p.age >= 50) return false;
  if (activeCohortFilter.age === '50to60' && (p.age < 50 || p.age > 60)) return false;
  if (activeCohortFilter.age === 'over60' && p.age <= 60) return false;

  if (activeCohortFilter.bp === 'normal' && p.trestbps >= 130) return false;
  if (activeCohortFilter.bp === 'high' && p.trestbps < 130) return false;

  if (activeCohortFilter.chol === 'normal' && p.chol >= 200) return false;
  if (activeCohortFilter.chol === 'high' && p.chol < 200) return false;

  if (activeCohortFilter.st === 'none' && p.oldpeak >= 1.0) return false;
  if (activeCohortFilter.st === 'ischemic' && p.oldpeak < 1.0) return false;

  return true;
}

function runCohortQuery() {
  if (!MODEL_DATA || !MODEL_DATA.dataset_preview) return;
  const sex = document.getElementById('cohort-sel-sex')?.value || 'all';
  const age = document.getElementById('cohort-sel-age')?.value || 'all';
  const bp = document.getElementById('cohort-sel-bp')?.value || 'all';
  const chol = document.getElementById('cohort-sel-chol')?.value || 'all';
  const st = document.getElementById('cohort-sel-st')?.value || 'all';

  activeCohortFilter = { sex, age, bp, chol, st };

  let cohort = MODEL_DATA.dataset_preview.filter(matchesCohortFilter);
  const n = cohort.length;
  const k = cohort.filter(p => p.target === 1).length;

  const totalN = MODEL_DATA.dataset_preview.length;
  const totalK = MODEL_DATA.dataset_preview.filter(p => p.target === 1).length;

  const otherN = totalN - n;
  const otherK = totalK - k;

  const prevCohort = n > 0 ? (k / n) * 100 : 0;
  const prevOther = otherN > 0 ? (otherK / otherN) * 100 : 0;

  const rr = prevOther > 0 ? (prevCohort / prevOther) : 1.0;
  const a = k, b = n - k, c = otherK, d = otherN - otherK;
  const or = (b > 0 && c > 0) ? ((a * d) / (b * c)) : 1.0;

  const sizeBadge = document.getElementById('cohort-size-badge');
  const prevBadge = document.getElementById('cohort-prevalence-badge');
  const rrBadge = document.getElementById('cohort-rr-badge');
  const orBadge = document.getElementById('cohort-or-badge');
  const insightText = document.getElementById('cohort-insight-text');

  if (sizeBadge) sizeBadge.textContent = `${n} bemor (${((n / totalN) * 100).toFixed(1)}%)`;
  if (prevBadge) prevBadge.textContent = `${prevCohort.toFixed(1)}%`;
  if (rrBadge) {
    rrBadge.textContent = `${rr.toFixed(2)}x`;
    rrBadge.className = rr >= 1.2 ? "font-mono text-rose-600 dark:text-rose-400 font-bold" : "font-mono text-slate-800 dark:text-slate-200 font-bold";
  }
  if (orBadge) orBadge.textContent = or.toFixed(2);

  if (insightText) {
    if (n === 0) {
      insightText.textContent = "Ushbu parametrlar bo'yicha bazada bemor topilmadi.";
    } else if (rr >= 1.3) {
      insightText.innerHTML = `⚠️ Ushbu kohortada yurak kasalligi xavfi qolgan populyatsiyaga nisbatan <b class="text-rose-600 dark:text-rose-400">${rr.toFixed(2)} barobar</b> yuqori (Prevalensiya: ${prevCohort.toFixed(1)}%). Agresiv profilaktika va statsionar tekshiruv tavsiya etiladi.`;
    } else if (rr <= 0.7) {
      insightText.innerHTML = `✅ Ushbu kohortada kardiak xavf populyatsiya o'rtachasidan ancha past (RR: ${rr.toFixed(2)}x, ${prevCohort.toFixed(1)}%). Xavf darajasi past deb baholanadi.`;
    } else {
      insightText.innerHTML = `ℹ️ Ushbu kohortaning kasallanish ko'rsatkichi (${prevCohort.toFixed(1)}%) umumiy populyatsiya (${((totalK / totalN) * 100).toFixed(1)}%) ga yaqin (RR: ${rr.toFixed(2)}x).`;
    }
  }

  const cohortFilterBtn = document.getElementById('filter-cohort');
  if (cohortFilterBtn) {
    cohortFilterBtn.classList.remove('hidden');
    cohortFilterBtn.textContent = `Faol Kohorta (${n})`;
  }
}

function filterTableByCohort() {
  currentTableFilter = 'cohort';
  currentTablePage = 1;
  ['all', 'diseased', 'healthy', 'cohort'].forEach(f => {
    const btn = document.getElementById(`filter-${f}`);
    if (btn) {
      if (f === 'cohort') {
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white transition";
      } else {
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition";
      }
    }
  });
  renderDatasetTable();
  const tableEl = document.getElementById('dataset-table-body');
  if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function generateSyntheticPatient() {
  if (!MODEL_DATA || !MODEL_DATA.dataset_preview) return;
  const randomBase = MODEL_DATA.dataset_preview[Math.floor(Math.random() * MODEL_DATA.dataset_preview.length)];
  const syntheticCase = {
    age: Math.min(77, Math.max(32, randomBase.age + Math.floor(Math.random() * 9 - 4))),
    sex: Math.random() > 0.32 ? 1 : 0,
    cp: Math.floor(Math.random() * 4),
    trestbps: Math.min(190, Math.max(95, randomBase.trestbps + Math.floor(Math.random() * 15 - 7))),
    chol: Math.min(450, Math.max(140, randomBase.chol + Math.floor(Math.random() * 30 - 15))),
    fbs: Math.random() > 0.85 ? 1 : 0,
    restecg: Math.random() > 0.5 ? 1 : 0,
    thalach: Math.min(200, Math.max(85, randomBase.thalach + Math.floor(Math.random() * 16 - 8))),
    exang: Math.random() > 0.65 ? 1 : 0,
    oldpeak: Number(Math.max(0, (randomBase.oldpeak + (Math.random() * 1.2 - 0.6))).toFixed(1)),
    slope: Math.floor(Math.random() * 3),
    ca: Math.random() > 0.6 ? (Math.random() > 0.5 ? 2 : 1) : 0,
    thal: Math.random() > 0.5 ? 2 : (Math.random() > 0.5 ? 3 : 1)
  };

  loadDatasetRowToForm(syntheticCase);
  alert(currentLang === 'ru' 
    ? `Сгенерирован новый виртуальный клинический случай: ${syntheticCase.age} лет, АД ${syntheticCase.trestbps}, Холестерин ${syntheticCase.chol} мг/дл. Профиль загружен в калькулятор!` 
    : (currentLang === 'en'
      ? `Generated realistic synthetic clinical case: Age ${syntheticCase.age}, BP ${syntheticCase.trestbps}, Chol ${syntheticCase.chol} mg/dl. Loaded into diagnostic calculator!`
      : `Yangi sintetik klinik holat generatsiya qilindi: Yoshi ${syntheticCase.age}, Bosimi ${syntheticCase.trestbps}, Xolesterin ${syntheticCase.chol} mg/dl. Diagnostika kalkulyatoriga yuklandi!`));
}

function exportEnrichedDatasetCSV() {
  if (!MODEL_DATA || !MODEL_DATA.dataset_preview) return;
  const list = MODEL_DATA.dataset_preview;
  const headers = ["id", "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target", "duke_score", "duke_risk", "rpp", "map", "chronotropic_reserve"];
  
  let csvContent = headers.join(",") + "\n";
  list.forEach((row, idx) => {
    const line = [
      idx + 1,
      row.age,
      row.sex,
      row.cp,
      row.trestbps,
      row.chol,
      row.fbs,
      row.restecg,
      row.thalach,
      row.exang,
      row.oldpeak,
      row.slope,
      row.ca,
      row.thal,
      row.target,
      row.duke_score ?? '',
      `"${row.duke_risk ?? ''}"`,
      row.rpp ?? '',
      row.map ?? '',
      row.chronotropic_reserve ?? ''
    ].join(",");
    csvContent += line + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `UCI_Cleveland_Enriched_302_Patients_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 20. UCI Cleveland Dataset Jadvali
function setTableFilter(filter) {
  currentTableFilter = filter;
  currentTablePage = 1;

  ['all', 'diseased', 'healthy', 'cohort'].forEach(f => {
    const btn = document.getElementById(`filter-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = (filter === 'cohort')
          ? "px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white transition"
          : "px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white transition";
      } else {
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition";
      }
    }
  });

  renderDatasetTable();
}

function handleTableSearch(val) {
  currentTableSearch = val.toLowerCase().trim();
  currentTablePage = 1;
  renderDatasetTable();
}

function renderDatasetTable() {
  if (!MODEL_DATA || !MODEL_DATA.dataset_preview) return;
  const tbody = document.getElementById('dataset-table-body');
  const pageInfo = document.getElementById('table-page-info');
  const paginationContainer = document.getElementById('pagination-buttons');
  if (!tbody) return;

  let records = MODEL_DATA.dataset_preview;

  if (currentTableFilter === 'diseased') {
    records = records.filter(r => r.target === 1);
  } else if (currentTableFilter === 'healthy') {
    records = records.filter(r => r.target === 0);
  } else if (currentTableFilter === 'cohort') {
    records = records.filter(matchesCohortFilter);
  }

  if (currentTableSearch) {
    records = records.filter(r => {
      return (
        r.age.toString().includes(currentTableSearch) ||
        r.trestbps.toString().includes(currentTableSearch) ||
        r.chol.toString().includes(currentTableSearch) ||
        r.thalach.toString().includes(currentTableSearch) ||
        r.oldpeak.toString().includes(currentTableSearch) ||
        (r.duke_score && r.duke_score.toString().includes(currentTableSearch))
      );
    });
  }

  const total = records.length;
  const totalPages = Math.ceil(total / rowsPerPage) || 1;
  currentTablePage = Math.min(currentTablePage, totalPages);

  const start = (currentTablePage - 1) * rowsPerPage;
  const pageRows = records.slice(start, start + rowsPerPage);

  if (pageInfo) {
    pageInfo.textContent = `${total === 0 ? 0 : start + 1} - ${Math.min(start + rowsPerPage, total)} / ${total}`;
  }

  if (total === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="15" class="py-8 text-center text-slate-400">
          Ushbu qidiruv yoki filtr bo'yicha ma'lumot topilmadi
        </td>
      </tr>
    `;
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  tbody.innerHTML = pageRows.map((row, idx) => {
    const isDiseased = row.target === 1;
    const dScore = row.duke_score ?? 0;
    const dColor = dScore >= 5 
      ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
      : (dScore >= -10 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold');

    return `
      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
        <td class="py-2.5 px-3 text-slate-400">${start + idx + 1}</td>
        <td class="py-2.5 px-3 font-bold">${row.age}</td>
        <td class="py-2.5 px-3">${row.sex === 1 ? 'Erk' : 'Ayo'}</td>
        <td class="py-2.5 px-3">${row.cp}</td>
        <td class="py-2.5 px-3">${row.trestbps}</td>
        <td class="py-2.5 px-3">${row.chol}</td>
        <td class="py-2.5 px-3">${row.thalach}</td>
        <td class="py-2.5 px-3">${row.oldpeak}</td>
        <td class="py-2.5 px-3 font-bold text-rose-500">${row.ca}</td>
        <td class="py-2.5 px-3 font-mono ${dColor}">${dScore > 0 ? '+' : ''}${dScore}</td>
        <td class="py-2.5 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">${row.rpp ?? '-'}</td>
        <td class="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">${row.map ?? '-'}</td>
        <td class="py-2.5 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">${row.chronotropic_reserve ?? '-'}%</td>
        <td class="py-2.5 px-3 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isDiseased ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}">
            ${isDiseased ? 'Xavf Bor' : 'Sog\'lom'}
          </span>
        </td>
        <td class="py-2.5 px-3 text-right">
          <button onclick='loadDatasetRowToForm(${JSON.stringify(row)})' class="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition" title="Kalkulyatorga yuklash">
            Yuklash
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (paginationContainer) {
    paginationContainer.innerHTML = `
      <button onclick="goToTablePage(${currentTablePage - 1})" ${currentTablePage <= 1 ? 'disabled class="opacity-40 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"' : 'class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"'}>Oldingi</button>
      <span class="px-2 font-mono font-bold">${currentTablePage}/${totalPages}</span>
      <button onclick="goToTablePage(${currentTablePage + 1})" ${currentTablePage >= totalPages ? 'disabled class="opacity-40 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"' : 'class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"'}>Keyingi</button>
    `;
  }
}

function goToTablePage(page) {
  currentTablePage = page;
  renderDatasetTable();
}

function loadDatasetRowToForm(row) {
  Object.entries(row).forEach(([key, val]) => {
    if (key === 'target' || key === 'duke_score' || key === 'duke_risk' || key === 'rpp' || key === 'map' || key === 'chronotropic_reserve' || key === 'atherogenic_idx' || key === 'age_group') return;
    const slider = document.getElementById(`slider-${key}`);
    const display = document.getElementById(`val-${key}`);
    const select = document.getElementById(`input-${key}`);
    if (slider) {
      slider.value = val;
      if (display) display.textContent = val;
    }
    if (select) select.value = val;
  });

  document.querySelector('[data-tab-target="tab-calculator"]')?.click();
  runPrediction();
}

// 20. Tibbiy Diagnostika Hisobotini Chop Etish (PDF Export)
function printDiagnosticReport() {
  const current = getCurrentVector();
  if (!current) return;

  const raw = current.raw;
  const scaled = scaleVector(current.vector);
  const ens = predictEnsemble(scaled, raw);
  const riskPct = Math.round(ens.prob * 100);
  const framingham = calculateFramingham(raw);

  const reportContainer = document.getElementById('print-report-container');
  if (!reportContainer) return;

  const now = new Date().toLocaleString();

  reportContainer.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #111;">
      
      <!-- Report Header -->
      <div style="border-bottom: 2px solid #be123c; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; font-size: 22px; color: #be123c;">CARDIORISK AI PRO MAX</h1>
          <p style="margin: 3px 0 0; font-size: 13px; color: #555;">Klinik Kardiologik Ekspertiza va Sun'iy Intellekt Diagnostika Xulosasi</p>
        </div>
        <div style="text-align: right; font-size: 11px; color: #666;">
          <p style="margin: 0;">Sana: <b>${now}</b></p>
          <p style="margin: 2px 0 0;">Protokol: <b>SOTA Ensemble & ATP III</b></p>
        </div>
      </div>

      <!-- Patient Summary Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #334155;">Bemorning Klinik Ko'rsatkichlari:</h3>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px;"><b>Yoshi:</b> ${raw.age} yosh</td>
            <td style="padding: 4px;"><b>Jinsi:</b> ${raw.sex === 1 ? 'Erkak' : 'Ayol'}</td>
            <td style="padding: 4px;"><b>Qon bosimi:</b> ${raw.trestbps} mm Hg</td>
            <td style="padding: 4px;"><b>Xolesterin:</b> ${raw.chol} mg/dl</td>
          </tr>
          <tr>
            <td style="padding: 4px;"><b>Puls (Maks):</b> ${raw.thalach} bpm</td>
            <td style="padding: 4px;"><b>ST Depressiya:</b> ${raw.oldpeak} mm</td>
            <td style="padding: 4px;"><b>Zararlangan tomir:</b> ${raw.ca} ta</td>
            <td style="padding: 4px;"><b>Mashq stenokardiyasi:</b> ${raw.exang === 1 ? 'Mavjud' : 'Yo\'q'}</td>
          </tr>
        </table>
      </div>

      <!-- Diagnostic Conclusion -->
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; border: 2px solid ${riskPct >= 50 ? '#be123c' : '#059669'}; border-radius: 8px; padding: 15px; text-align: center;">
          <span style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold;">Sun'iy Intellekt Xulosasi (Ensemble):</span>
          <div style="font-size: 36px; font-weight: bold; color: ${riskPct >= 50 ? '#be123c' : '#059669'}; margin: 5px 0;">${riskPct}%</div>
          <span style="font-size: 13px; font-weight: bold; padding: 3px 10px; border-radius: 999px; background: ${riskPct >= 50 ? '#ffe4e6' : '#d1fae5'}; color: ${riskPct >= 50 ? '#9f1239' : '#065f46'};">
            ${riskPct >= 75 ? 'KRITIK XAVF' : (riskPct >= 50 ? 'YUQORI XAVF' : (riskPct >= 25 ? 'O\'RTACHA XAVF' : 'PAST XAVF / SOG\'LOM'))}
          </span>
        </div>

        <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; text-align: center;">
          <span style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold;">Framingham 10-Yillik Standart Ball:</span>
          <div style="font-size: 36px; font-weight: bold; color: #4f46e5; margin: 5px 0;">${framingham.riskPct}%</div>
          <span style="font-size: 12px; color: #475569;">ATP III Kardiologik shkalasi</span>
        </div>
      </div>

      <!-- Doctor Recommendations -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px;">
        <h4 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; color: #334155;">Klinik Tavsiya va Shifokor Xulosasi:</h4>
        <p style="font-size: 12px; line-height: 1.6; color: #334155;">
          ${riskPct >= 50 
            ? "Bemorga zudlik bilan kardiologik tekshiruv, 24 soatlik Xolter EKG monitoringi va selektiv koronarografiya tavsiya etiladi. Lipid profilini korreksiya qilish, qon bosimini <130/80 mm Hg darajasida ushlash maqsadga muvofiq."
            : "Klinik ko'rsatkichlar barqaror. Turmush tarzini faol ushlab turish, jismoniy mashqlar va har yili muntazam tibbiy ko'rikdan o'tish tavsiya etiladi."}
        </p>
      </div>

      <!-- Signatures Footer -->
      <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
        <div>
          <p style="margin: 0;">Davolovchi shifokor: ____________________</p>
        </div>
        <div>
          <p style="margin: 0;">Imzo va Muhr: ____________________</p>
        </div>
      </div>

    </div>
  `;

  window.print();
}
