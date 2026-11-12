# 07. Yurak kasalliklari xavfini bashorat qilish (CardioRisk AI Pro Max Enterprise v3.5)

[![Live on Vercel](https://img.shields.io/badge/Vercel-Live_Demo-black?logo=vercel&style=for-the-badge)](https://heart-disease-risk-prediction-eosin.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&style=for-the-badge)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-SOTA_Ensemble_%26_PCA_2D-orange?logo=scikit-learn&style=for-the-badge)](https://scikit-learn.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Heart_WebGL-black?logo=three.js&style=for-the-badge)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?logo=tailwind-css&style=for-the-badge)](https://tailwindcss.com/)

CardioRisk AI Pro Max — bemorlarning 13 ta klinik ko'rsatkichlari asosida yurak kasalligi xavfini aniqlash, **3D interaktiv yurak anatomiyasi**, real vaqtda **jonli EKG telemetriyasi**, **Ovozli AI Kardiolog**, **Yurak Biologik Yoshi (Bio-Age)**, **Virtual Farmakoterapiya**, **Bruce Protocol Tredmil Stress-Testi**, **PCA 2D Bemorlar Klasteri** hamda **EMR Dinamika Tahlili**ni o'z ichiga olgan xalqaro darajadagi zamonaviy MedTech platformasi.

---

## ⚡ Barcha Yangi Imkoniyatlar (Enterprise v3.5)

1. **100% Realistik 3D Yurak Anatomiyasi (Three.js WebGL & PBR Physical Shading)**:
   - **Protsedurali to'qima generatori**: Miokard mushak tolalari (striated muscle fibers) va subepikardial yog' qatlamlari teksturasi.
   - **PBR MeshPhysicalMaterial**: Jonli yurak to'qimasi yaltirashi (clearcoat 0.92, sheen, micro-bump map).
   - **Anatomik aniqlik**: Chap qorincha (tilted apex), O'ng qorincha, Chap va O'ng bo'lmachalar hamda quloqchalar (auricles).
   - **Yirik qon tomirlar**: Aorta ravog'i (va uning 3 ta braxiotsefal shoxchalari: Brachiocephalic trunk, Left common carotid, Left subclavian), O'pka arteriyasi bifurkatsiyasi, Yuqori va Pastki kovak venalar.
   - **Koronar qon tomir daraxti**: LAD (Oldingi tushuvchi arteriya + D1 shoxcha), LCx (O'rab oluvchi arteriya), RCA (O'ng koronar arteriya) va Katta yurak venasi.
   - **Aterosklerotik blyashka stenoz vizualizatsiyasi**: Bemorning `ca` (0-3) qiymatiga ko'ra zararlangan tomirlarda 3D ogohlantiruvchi qizil pulsatsiyalanuvchi stenoz nurlari.
   - **Fiziologik sistolik spiral qisqarish (Torsional Wringing)**: Haqiqiy yurak kabi bo'ylama va buralma harakat.
   - **Shaffof rentgen rejimi (X-Ray Mode)**: Yurak ichki tuzilishi va tomir to'rini ko'rish uchun yarim shaffof ko'rinish.
   - **Stenozga fokuslash**: Blokada tomiriga kamerani avtomatik yaqinlashtirib ko'rsatish.
   - **Interaktiv 3D Raycasting teglari**: Sichqoncha yoki barmoq tekkan anatomik tuzilmaning nomini jonli ko'rsatish.

2. **Yurakning Biologik Yoshi (Cardiovascular Bio-Age)**:
   - Amerika Yurak Assotsiatsiyasi (AHA) va Framingham Vascular Age protokoli asosida pasport yoshi va haqiqiy biologik yurak yoshining qiyosiy hisob-kitobi.

3. **Ovozli AI Kardiolog (Web Speech API - TTS & STT)**:
   - **Tashxisni ovozda tinglash (TTS)**: O'zbek, Rus va Ingliz tillarida AI Kardiolog ovozi bilan tashxis va shifokor tavsiyalarini o'qib berish.
   - **Ovozli diktovka (STT)**: Shifokor mikrofonga aytib turgan parametrlarni ("yosh 55", "bosim 140", "xolesterin 250") avtomatik formaga yozish.

4. **Virtual Farmakoterapiya Simulyatori (Digital Twin)**:
   - Standart kardiologik preparatlar (Statinlar, Beta-blokatorlar, ACE ingibitorlari, Aspirin) ta'sirini virtual sinab ko'rish va xavf necha foizga pasayishini real vaqtda kuzatish.

5. **Virtual Kardiologik Stress-Test (Bruce Protocol Treadmill)**:
   - Tredmil mashq yuklamasi testi: 0-bosqichdan 3-bosqichgacha tezlik va nishablikni oshirib borish, ishemiya chegarasini (ST depressiyasi boshlanish vaqtini) avtomatik aniqlash.

6. **PCA 2D Bemorlar Klasteri Xaritasi (Unsupervised Space)**:
   - 13 o'lchamli klinik fazoni Principal Component Analysis orqali 2D tekislikka tushirish, 302 nafar bemor orasida joriy bemor o'rnini yulduzcha sifatida ko'rsatish va unga eng yaqin 3 ta bemor analoglarini topish.

7. **Jonli EKG Kardiomonitori & Audio Telemetriya**:
   - HTML5 Canvas asosidagi 25 mm/s tezlikdagi tibbiy EKG chizig'i, P-Q-R-S-T to'lqinlari va Web Audio API 880 Hz puls ovozi.

8. **Explainable AI (SHAP Waterfall)**:
   - Har bir bemor uchun natijaga ta'sir qilgan ijobiy va salbiy biomarkerlarning aniq foiz taqsimoti.

9. **EMR: Bemorlar Tarixi va Dinamika Tahlili**:
   - Tashriflarni saqlash va terapiyadan oldingi/keyingi holatni (Visit 1 vs Visit 2) solishtirib, sog'ayish dinamikasini hisoblash.

10. **Ko'p Tilli Platforma (i18n)**:
    - 🇺🇿 O'zbekcha, 🇬🇧 English, 🇷🇺 Русский tillarida 1 bosish bilan to'liq interfeys.

---

## 📊 5 Ta Modelning Sinov Natijalari (UCI Cleveland 302 Bemor)

| Model Arxitekturasi | Aniqlik (Accuracy) | Recall (Sezuvchanlik) | F1-Score | ROC-AUC | 5-Fold CV Barqarorlik |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 🏆 **Ensemble Soft-Voting (SOTA)** | **83.61%** | **96.97%** | **86.49%** | **90.69%** | **81.42% (±5.97%)** |
| 🚀 **Gradient Boosting** | **86.89%** | **96.97%** | **88.89%** | **87.99%** | **80.44% (±5.04%)** |
| 🎯 **Support Vector Machine (SVM RBF)** | **83.61%** | **93.94%** | **86.11%** | **88.10%** | **81.09% (±6.09%)** |
| 🌲 **Random Forest (100 Trees)** | **80.33%** | **93.94%** | **83.78%** | **89.83%** | **83.74% (±5.96%)** |
| 🔍 **K-Nearest Neighbors (k=7)** | **81.97%** | **90.91%** | **84.51%** | **88.20%** | **81.07% (±7.86%)** |

---

## 🔗 Rasmiy Havolalar

- **Vercel Jonli Web App:** [https://heart-disease-risk-prediction-eosin.vercel.app](https://heart-disease-risk-prediction-eosin.vercel.app)
- **GitHub Repozitoriy:** [https://github.com/nematjanoovv-max/UI_UX_11.11.2026](https://github.com/nematjanoovv-max/UI_UX_11.11.2026)
- **Kaggle Manba Kerneli:** [https://www.kaggle.com/code/i0nlyaziz/heart-disease-risk-prediction](https://www.kaggle.com/code/i0nlyaziz/heart-disease-risk-prediction)
