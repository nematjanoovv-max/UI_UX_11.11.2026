# 07. Yurak kasalliklari xavfini bashorat qilish (Heart Disease Risk Prediction Pro Max)

[![Live on Vercel](https://img.shields.io/badge/Vercel-Live_Demo-black?logo=vercel&style=for-the-badge)](https://heart-disease-risk-prediction-eosin.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&style=for-the-badge)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-KNN_%26_SVM_5--Fold_CV-orange?logo=scikit-learn&style=for-the-badge)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?logo=tailwind-css&style=for-the-badge)](https://tailwindcss.com/)

Ushbu loyiha bemorlarning 13 ta klinik ko'rsatkichlari (yosh, qon bosimi, xolesterin, yurak urishi, EKG anomaliyalari, ST depressiyasi va b.) asosida yurak kasalligi xavfini aniqlash va bashorat qilish uchun mo'ljallangan chuqur optimallashtirilgan Machine Learning tizimi va zamonaviy tibbiy Web ilovasidir.

---

## 📌 Chuqur va Keng Qamrovli Optimallashtirish

1. **Machine Learning & Validatsiya**:
   - **5-Fold Stratified Kross-Validatsiya**: Modellar umumiy barqarorligi sinovdan o'tkazildi (SVM: **81.09%**, KNN: **81.07%**).
   - **Giperparametrlarni sozlash (GridSearch)**: KNN uchun $k=1$ dan $k=25$ gacha egri chiziq, distance-weighting; SVM uchun RBF yadrosi, $\gamma=\text{scale}$, $C=1.0$.
   - **Kengaytirilgan Metrikalar**: Accuracy, Recall (Sezuvchanlik), Specificity (O'ziga xoslik), Balanced Accuracy, F1-Score, ROC-AUC, MCC (Matthews Correlation Coefficient).

2. **Web UI/UX & XAI (Explainable AI)**:
   - **4-Darajali Xavf Stratifikatsiyasi**: Past (<25%), O'rtacha (25-50%), Yuqori (50-75%), Kritik (>75%).
   - **"What-If" Profilaktika Simulyatori**: Bemor ko'rsatkichlarini (masalan, qon bosimini 120 ga, xolesterinni 190 ga) me'yorlashtirish orqali xavfni necha foizga kamaytirish mumkinligini real-vaqtda ko'rsatuvchi interaktiv vosita.
   - **360° Radar Tahlil**: Bemorning 6 ta asosiy parametrini sog'lom odamlar populyatsiyasi standarti bilan taqqoslovchi Radar chart.
   - **Rasmiy Kardiologik Hisobot (PDF / Print)**: Bemor natijalari, xavf foizi, model xulosalari va vrach tavsiyalarini o'z ichiga olgan rasmiy klinik xulosani chop etish.
   - **Interaktiv Qidiruv va Filtr**: 302 ta bemorlik ma'lumotlar to'plami bo'yicha parametrlar qidiruvi va "Xavf bor / Sog'lom" filtrlari.

---

## 📊 Modellar Natijalari va Taqqoslash

Test to'plamidagi 61 ta haqiqiy bemor ko'rsatkichlari bo'yicha erishilgan natijalar:

| Metrika | K-Nearest Neighbors (KNN, k=7) | Support Vector Machine (SVM RBF) | Eng Yaxshi Model |
| :--- | :---: | :---: | :---: |
| **Aniqlik (Accuracy)** | **81.97%** | **83.61%** | 🏆 **SVM** |
| **Recall (Sezuvchanlik)** | **90.91%** | **93.94%** | 🏆 **SVM (31/33 to'g'ri)** |
| **Specificity (O'ziga xoslik)** | **71.43%** | **71.43%** | 🤝 **Teng** |
| **F1-Score** | **84.51%** | **86.11%** | 🏆 **SVM** |
| **Precision** | **78.95%** | **79.49%** | 🏆 **SVM** |
| **ROC-AUC** | **88.20%** | **88.10%** | 🏆 **KNN** |
| **5-Fold Kross-Validatsiya** | **81.07% (±7.86%)** | **81.09% (±6.09%)** | 🏆 **SVM** |

> 💡 **Tibbiy xulosa:** Kardiologiya amaliyotida bemor kasalligini o'tkazib yubormaslik (False Negative ko'rsatkichini minimal darajaga tushirish) eng muhim omildir. SVM modeli **93.94% Recall** bilan kasallangan 33 ta bemordan 31 tasini aniq aniqladi.

---

## 🗂 Loyiha Fayllari Tuzilishi

```text
UI_UX_11.11.2026/
├── dataset.csv                          # UCI Cleveland Heart Disease to'liq ma'lumotlar to'plami (302 bemor)
├── main.py                              # Python ML pipeline (Train, 5-Fold CV, Export)
├── heart_disease_prediction.ipynb       # Jupyter Notebook (To'liq tahlil, ROC va vizualizatsiyalar)
├── heart-disease-risk-prediction.ipynb  # Kaggle manba daftari
├── model_data.json                      # O'qitilgan modellar parametrlari, ROC va 5-Fold ma'lumotlari
├── fallback_data.js                     # Offline brauzer ishlashi uchun ma'lumotlar
├── index.html                           # Pro Max Tibbiy Dashboard (HTML5 + Tailwind CSS)
├── app.js                               # Brauzer ichidagi ML inferensiyasi, What-If va Radar logikasi
├── style.css                            # Maxsus animatsiyalar va dizayn elementlari
├── vercel.json                          # Vercel deployment sozlamalari
├── havolalar.txt                        # GitHub, Vercel va Kaggle havolalari
└── README.md                            # To'liq hujjatlar
```

---

## 🚀 Mahalliy Kompyuterda Ishga Tushirish

1. **Repozitoriyni klonlash:**
   ```bash
   git clone https://github.com/nematjanoovv-max/UI_UX_11.11.2026.git
   cd UI_UX_11.11.2026
   ```

2. **Kutubxonalarni o'rnatish va modelni o'qitish:**
   ```bash
   pip install pandas numpy scikit-learn
   python3 main.py
   ```

3. **Veb-interfeysni ochish:**
   ```bash
   python3 -m http.server 3000
   ```
   Brauzerda `http://localhost:3000` manziliga kiring.

---

## 🔗 Havolalar va Manbalar

- **GitHub Repozitoriy:** [github.com/nematjanoovv-max/UI_UX_11.11.2026](https://github.com/nematjanoovv-max/UI_UX_11.11.2026)
- **Vercel Jonli Veb-sayt:** [heart-disease-risk-prediction-eosin.vercel.app](https://heart-disease-risk-prediction-eosin.vercel.app)
- **Kaggle Manba Notebook:** [i0nlyaziz/heart-disease-risk-prediction](https://www.kaggle.com/code/i0nlyaziz/heart-disease-risk-prediction)
- **Dataset:** UCI Machine Learning Repository - Heart Disease Dataset
