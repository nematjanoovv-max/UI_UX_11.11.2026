# 07. Yurak kasalliklari xavfini bashorat qilish (CardioRisk AI Pro Max Enterprise)

[![Live on Vercel](https://img.shields.io/badge/Vercel-Live_Demo-black?logo=vercel&style=for-the-badge)](https://heart-disease-risk-prediction-eosin.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&style=for-the-badge)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-SOTA_Ensemble_%26_5_Models-orange?logo=scikit-learn&style=for-the-badge)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?logo=tailwind-css&style=for-the-badge)](https://tailwindcss.com/)

Ushbu platforma bemorlarning 13 ta klinik ko'rsatkichlari asosida yurak kasalligi xavfini aniqlash, real vaqtda **jonli EKG monitoringi**, **Explainable AI (SHAP) tahlili**, an'anaviy **Framingham ATP III** bilan qiyoslash hamda **EMR (Elektron Tibbiy Karta) orqali davolanish dinamikasi**ni kuzatish imkonini beruvchi xalqaro darajadagi zamonaviy MedTech platformasidir.

---

## ⚡ Tubdan Kiritilgan Yangi Imkoniyatlar (Enterprise v3.0)

1. **Jonli EKG Kardiomonitori (Real-Time Bedside ECG Strip)**:
   - HTML5 Canvas asosidagi yuqori aniqlikdagi tibbiy grid kardiomonitori.
   - P-Q-R-S-T to'lqinlari bemorning `thalach` (puls), `oldpeak` (ST segment depressiyasi), `restecg` (chap qorincha gipertrofiyasi) parametrlariga to'g'ridan-to'g'ri bog'liq holda real vaqtda o'zgaradi.
   - Web Audio API orqali har bir R-pikda real kardiomonitor audio signali (puls ovozi) yoqish/o'chirish imkoniyati.

2. **Explainable AI (SHAP-Style Feature Attribution Waterfall)**:
   - "Qora quti" (black box) muammosini hal qiluvchi individual omillar taqsimoti.
   - Har bir bemor uchun qaysi ko'rsatkich kasallik xavfini necha foizga oshirgani (+%) yoki himoya qilganini (-%) ko'rsatuvchi vizual tahlil.

3. **Klassik Kardiologiya vs AI (Framingham ATP III integratsiyasi)**:
   - Amerika Kardiologiya Assotsiatsiyasining 10-yillik Framingham xavf indeksi bilan Sun'iy Intellektning (Ensemble) bevosita xavfi yonma-yon solishtiriladi.
   - AI aniqlagan yashirin xavflar (ST depressiyasi, tomirlar kalsinozi) tushuntirib beriladi.

4. **SOTA Machine Learning Ensemble (5 xil arxitektura)**:
   - **Ensemble Soft-Voting (SOTA)**: **90.69% ROC-AUC**, **96.97% Recall**.
   - **Gradient Boosting**: **86.89% Aniqlik**, **96.97% Recall**, **88.89% F1-Score**.
   - **Support Vector Machine (SVM RBF)**: **83.61% Aniqlik**, **93.94% Recall**.
   - **Random Forest**: **83.74% 5-Fold CV Aniqligi**, **89.83% ROC-AUC**.
   - **K-Nearest Neighbors (KNN, k=7)**: **81.97% Aniqlik**, **84.51% F1-Score**.

5. **EMR: Bemorlar Tarixi va Dinamika Tahlili (Longitudinal Visit Dynamics)**:
   - Bemorlarni saqlash, tahrirlash va kalkulyatorga 1 bosish bilan yuklash.
   - "Dinamika Tahlili" (Visit 1 vs Visit 2): terapiyadan oldingi va keyingi ko'rsatkichlarni (qon bosimi, xolesterin, ST depressiyasi) solishtirib, sog'ayish dinamikasini avtomatik hisoblash.

6. **Ko'p Tilli Platforma (i18n)**:
   - 🇺🇿 O'zbekcha, 🇬🇧 English, 🇷🇺 Русский tillarida 1 tugma orqali to'liq interfeys, tushuntirishlar va tibbiy hisobotlar.

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

## 🗂 Loyiha Fayllari Tuzilishi

```text
UI_UX_11.11.2026/
├── dataset.csv                          # UCI Cleveland Heart Disease to'liq ma'lumotlar to'plami (302 bemor)
├── main.py                              # Python ML pipeline (Train, 5 Model, 5-Fold CV, Export)
├── heart_disease_prediction.ipynb       # Jupyter Notebook (SOTA tahlil, Multi-ROC va vizualizatsiyalar)
├── heart-disease-risk-prediction.ipynb  # Kaggle manba daftari
├── model_data.json                      # 5 ta model parametrlari, ROC va 5-Fold ma'lumotlari (196 KB)
├── fallback_data.js                     # Brauzer offline inferensiyasi uchun avtomatik JSON export
├── index.html                           # Enterprise MedTech Platformasi (HTML5, Tailwind, Canvas EKG)
├── app.js                               # Inference Engine, EKG Audio, SHAP XAI, Framingham, EMR Dinamika
├── style.css                            # EKG ekran filtri, tibbiy animatsiyalar va bosma PDF uslublari
├── vercel.json                          # Vercel deployment va kesh sozlamalari
├── havolalar.txt                        # Rasmiy havolalar va metrikalar
└── README.md                            # Loyiha to'liq hujjati
```

---

## 🔗 Rasmiy Havolalar

- **Vercel Jonli Web App:** [https://heart-disease-risk-prediction-eosin.vercel.app](https://heart-disease-risk-prediction-eosin.vercel.app)
- **GitHub Repozitoriy:** [https://github.com/nematjanoovv-max/UI_UX_11.11.2026](https://github.com/nematjanoovv-max/UI_UX_11.11.2026)
- **Kaggle Manba Kerneli:** [https://www.kaggle.com/code/i0nlyaziz/heart-disease-risk-prediction](https://www.kaggle.com/code/i0nlyaziz/heart-disease-risk-prediction)
