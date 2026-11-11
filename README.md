# 07. Yurak kasalliklari xavfini bashorat qilish (Heart Disease Risk Prediction)

[![Live on Vercel](https://img.shields.io/badge/Vercel-Live_Demo-black?logo=vercel&style=for-the-badge)](https://heart-disease-risk-prediction-eosin.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&style=for-the-badge)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-KNN_%26_SVM-orange?logo=scikit-learn&style=for-the-badge)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?logo=tailwind-css&style=for-the-badge)](https://tailwindcss.com/)

Ushbu loyiha bemorlarning klinik ko'rsatkichlari (yosh, qon bosimi, xolesterin, yurak urishi, EKG va b.) asosida yurak kasalligi xavfini aniqlash va bashorat qilish uchun mo'ljallangan to'liq avtonom Machine Learning va zamonaviy Web ilovasidir.

---

## 📌 Loyiha Tarkibi va Asosiy Xususiyatlari

1. **Ma'lumotlar tahlili (EDA) va Preprocessing**:
   - UCI Machine Learning Repository: Cleveland Heart Disease Dataset (`dataset.csv`).
   - Takroriy va yetishmayotgan qiymatlarni tozalash, xususiyatlar o'rtasidagi Pearson korrelyatsiyasi.
   - `StandardScaler` yordamida ma'lumotlarni masshtablash va Train/Test (80% / 20%) to'plamiga ajratish.

2. **Machine Learning Modellar (KNN & SVM)**:
   - **K-Nearest Neighbors (KNN)**: $k=7$, distance-weighted Evklid masofasi.
   - **Support Vector Machine (SVM)**: RBF (Radial Basis Function) yadrosi, Platt scaling ehtimollik taqsimoti.
   - Model metrikalari: Accuracy, Precision, Recall, F1-Score, ROC-AUC va Confusion Matrix.

3. **Vercel Web UI/UX Dashboard**:
   - **Interaktiv Kalkulyator**: 13 ta klinik parametrlarni o'zgartirish orqali real-vaqtda yurak xastaligi xavfini (% da) hisoblash.
   - **Namunaviy profillar (Presets)**: Sog'lom bemor, O'rtacha xavf va Yuqori xavfli bemor profillari.
   - **Modellarni Taqqoslash**: Chart.js interaktiv grafiklari (Metrikalar, Feature Importance, Confusion Matrix).
   - **Dataset & Kod ko'rish**: Namunaviy yozuvlar jadvali, `main.py` va `heart_disease_prediction.ipynb` fayllarini yuklab olish.
   - **Dark / Light Mode**: Tizim parametrlariga moslashuvchi to'liq moslashuvchan dizayn.

---

## 📊 Modellar Natijalari va Taqqoslash

Test to'plamidagi 61 ta haqiqiy bemor ko'rsatkichlari bo'yicha erishilgan natijalar:

| Metrika | K-Nearest Neighbors (KNN) | Support Vector Machine (SVM) | Eng Yaxshi |
| :--- | :---: | :---: | :---: |
| **Aniqlik (Accuracy)** | **81.97%** | **83.61%** | 🏆 **SVM** |
| **F1-Score** | **84.51%** | **86.11%** | 🏆 **SVM** |
| **Recall (Sezuvchanlik)** | **90.91%** | **93.94%** | 🏆 **SVM** |
| **Precision** | **78.95%** | **79.49%** | 🏆 **SVM** |
| **ROC-AUC** | **88.20%** | **88.10%** | 🏆 **KNN** |

> 💡 **Tibbiy xulosa:** Kardiologiya amaliyotida bemor kasalligini o'tkazib yubormaslik (False Negative ko'rsatkichini kamaytirish) eng asosiy mezon hisoblanadi. SVM modeli **93.94% Recall** natijasi bilan 33 ta bemordan faqat 2 tasida xato qildi va eng yuqori ishonchlilikni ko'rsatdi.

---

## 🗂 Loyiha Fayllari Tuzilishi

```text
UI_UX_11.11.2026/
├── dataset.csv                          # UCI Heart Disease to'liq ma'lumotlar to'plami
├── main.py                              # Python ML pipeline (Train, Evaluate, Export)
├── heart_disease_prediction.ipynb       # Jupyter Notebook (To'liq tahlil va vizualizatsiya)
├── heart-disease-risk-prediction.ipynb  # Kaggle manba daftari
├── model_data.json                      # O'qitilgan modellar parametrlari va metrikalari
├── fallback_data.js                     # Offline brauzer ishlashi uchun ma'lumotlar
├── index.html                           # Zamonaviy Tibbiy Dashboard (HTML5)
├── app.js                               # Brauzer ichidagi ML inferensiyasi va UI logikasi
├── style.css                            # Maxsus animatsiyalar va dizayn elementlari
├── vercel.json                          # Vercel statik deployment sozlamalari
├── havolalar.txt                        # GitHub, Vercel va Kaggle havolalari
└── README.md                            # Loyiha hujjatlari
```

---

## 🚀 Mahalliy Kompyuterda Ishga Tushirish

1. **Repozitoriyni klonlash:**
   ```bash
   git clone https://github.com/nematjanoovv-max/heart-disease-risk-prediction.git
   cd heart-disease-risk-prediction
   ```

2. **Kutubxonalarni o'rnatish va modelni o'qitish:**
   ```bash
   pip install pandas numpy scikit-learn
   python3 main.py
   ```

3. **Veb-interfeysni ochish:**
   - Brauzeringizda `index.html` faylini oching yoki mahalliy server orqali ishga tushiring:
   ```bash
   python3 -m http.server 3000
   ```
   Brauzerda `http://localhost:3000` manziliga kiring.

---

## 🔗 Havolalar va Manbalar

- **GitHub Repozitoriy:** [github.com/nematjanoovv-max/heart-disease-risk-prediction](https://github.com/nematjanoovv-max/heart-disease-risk-prediction)
- **Vercel Jonli Veb-sayt:** [heart-disease-risk-prediction-eosin.vercel.app](https://heart-disease-risk-prediction-eosin.vercel.app)
- **Kaggle Manba Notebook:** [i0nlyaziz/heart-disease-risk-prediction](https://www.kaggle.com/code/i0nlyaziz/heart-disease-risk-prediction)
- **Dataset:** UCI Machine Learning Repository - Heart Disease Dataset
