#!/usr/bin/env python3
"""
07. Yurak kasalliklari xavfini bashorat qilish (Heart Disease Risk Prediction)
Machine Learning pipeline: Pandas, Scikit-learn (KNN va SVM)
"""

import sys
import os
import json

# Termux muhitida sklearn proot-distro (Ubuntu) ichida bo'lsa, avtomatik ravishda o'sha orqali ishga tushirish
try:
    import sklearn
    import pandas as pd
    import numpy as np
except ImportError:
    import subprocess
    script_path = os.path.abspath(__file__)
    cmd = ["proot-distro", "login", "ubuntu", "--", "python3", script_path] + sys.argv[1:]
    sys.exit(subprocess.call(cmd))

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    classification_report
)

def main():
    print("=" * 60)
    print(" Yurak kasalliklari xavfini bashorat qilish (KNN & SVM)")
    print("=" * 60)

    # 1. Ma'lumotlar to'plamini yuklash
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "dataset.csv")

    if not os.path.exists(dataset_path):
        print(f"Xatolik: {dataset_path} fayli topilmadi!")
        sys.exit(1)

    print(f"\n[1] Dataset yuklanmoqda: {dataset_path}")
    df = pd.read_csv(dataset_path)
    
    # BOM yoki bo'shliqlarni ustun nomlaridan tozalash
    df.columns = df.columns.str.strip().str.replace('\ufeff', '')
    print(f"Dataset hajmi: {df.shape[0]} ta qator, {df.shape[1]} ta ustun")
    print(f"Ustunlar: {list(df.columns)}")

    # EDA (Exploratory Data Analysis)
    duplicates = int(df.duplicated().sum())
    if duplicates > 0:
        print(f"Takroriy qatorlar soni: {duplicates}. Ular tozalanmoqda...")
        df.drop_duplicates(inplace=True)
    else:
        print("Takroriy qatorlar: mavjud emas.")

    missing = int(df.isnull().sum().sum())
    print(f"Yetishmayotgan qiymatlar (missing): {missing}")

    target_counts = df['target'].value_counts().to_dict()
    print(f"Klasslar taqsimoti: 1 (Xavf yuqori)={target_counts.get(1, 0)}, 0 (Sog'lom)={target_counts.get(0, 0)}")

    feature_cols = [c for c in df.columns if c != 'target']
    X = df[feature_cols]
    y = df['target']

    # Pearson korrelyatsiyasi (xususiyatlarning yurak kasalligi bilan bog'liqligi)
    correlations = df.corr()['target'].drop('target').to_dict()

    # 2. Train / Test (80 / 20) ga ajratish va Masshtablash
    print("\n[2] Ma'lumotlarni 80% o'qitish (Train) va 20% test to'plamiga ajratish...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train to'plami: {X_train.shape[0]} ta namuna")
    print(f"Test to'plami:  {X_test.shape[0]} ta namuna")

    print("StandardScaler orqali xususiyatlarni masshtablash...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 3. K-Nearest Neighbors (KNN) modelini o'qitish
    print("\n[3] K-Nearest Neighbors (KNN) modelini o'qitish...")
    knn_k = 7
    knn = KNeighborsClassifier(n_neighbors=knn_k, weights='distance')
    knn.fit(X_train_scaled, y_train)

    y_pred_knn = knn.predict(X_test_scaled)
    y_prob_knn = knn.predict_proba(X_test_scaled)[:, 1]

    knn_acc = float(accuracy_score(y_test, y_pred_knn))
    knn_prec = float(precision_score(y_test, y_pred_knn))
    knn_rec = float(recall_score(y_test, y_pred_knn))
    knn_f1 = float(f1_score(y_test, y_pred_knn))
    knn_auc = float(roc_auc_score(y_test, y_prob_knn))
    knn_cm = confusion_matrix(y_test, y_pred_knn).tolist()

    print(f"  KNN (k={knn_k}) Natijalari:")
    print(f"   - Aniqlik (Accuracy): {knn_acc * 100:.2f}%")
    print(f"   - Precision:          {knn_prec * 100:.2f}%")
    print(f"   - Recall:             {knn_rec * 100:.2f}%")
    print(f"   - F1-Score:           {knn_f1 * 100:.2f}%")
    print(f"   - ROC-AUC:            {knn_auc * 100:.2f}%")
    print(f"   - Confusion Matrix:\n{np.array(knn_cm)}")

    # 4. Support Vector Machine (SVM) modelini o'qitish
    print("\n[4] Support Vector Machine (SVM / RBF) modelini o'qitish...")
    svm = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)
    svm.fit(X_train_scaled, y_train)

    y_pred_svm = svm.predict(X_test_scaled)
    y_prob_svm = svm.predict_proba(X_test_scaled)[:, 1]

    svm_acc = float(accuracy_score(y_test, y_pred_svm))
    svm_prec = float(precision_score(y_test, y_pred_svm))
    svm_rec = float(recall_score(y_test, y_pred_svm))
    svm_f1 = float(f1_score(y_test, y_pred_svm))
    svm_auc = float(roc_auc_score(y_test, y_prob_svm))
    svm_cm = confusion_matrix(y_test, y_pred_svm).tolist()

    print(f"  SVM (RBF Kernel) Natijalari:")
    print(f"   - Aniqlik (Accuracy): {svm_acc * 100:.2f}%")
    print(f"   - Precision:          {svm_prec * 100:.2f}%")
    print(f"   - Recall:             {svm_rec * 100:.2f}%")
    print(f"   - F1-Score:           {svm_f1 * 100:.2f}%")
    print(f"   - ROC-AUC:            {svm_auc * 100:.2f}%")
    print(f"   - Confusion Matrix:\n{np.array(svm_cm)}")

    # 5. Xususiyatlar metadatasini tuzish
    feature_meta = [
        {
            "id": "age",
            "name_uz": "Yosh",
            "name_en": "Age",
            "desc": "Bemorning yoshi (yillar)",
            "min": 25,
            "max": 80,
            "default": 55,
            "step": 1,
            "unit": "yosh"
        },
        {
            "id": "sex",
            "name_uz": "Jins",
            "name_en": "Sex",
            "desc": "Bemorning jinsi",
            "type": "select",
            "options": [
                {"value": 1, "label": "Erkak (1)"},
                {"value": 0, "label": "Ayol (0)"}
            ],
            "default": 1
        },
        {
            "id": "cp",
            "name_uz": "Ko'krak og'rig'i turi",
            "name_en": "Chest Pain Type (cp)",
            "desc": "Ko'krak qafasidagi og'riq xarakteri",
            "type": "select",
            "options": [
                {"value": 0, "label": "0: Tipik stenokardiya (Typical Angina)"},
                {"value": 1, "label": "1: Atipik stenokardiya (Atypical Angina)"},
                {"value": 2, "label": "2: Stenokardik bo'lmagan og'riq (Non-anginal)"},
                {"value": 3, "label": "3: Asimptomatik (Asymptomatic)"}
            ],
            "default": 0
        },
        {
            "id": "trestbps",
            "name_uz": "Qon bosimi (Resting BP)",
            "name_en": "Resting Blood Pressure",
            "desc": "Tinch holatdagi sistolik qon bosimi",
            "min": 90,
            "max": 200,
            "default": 130,
            "step": 1,
            "unit": "mm Hg"
        },
        {
            "id": "chol",
            "name_uz": "Xolesterin miqdori",
            "name_en": "Serum Cholesterol",
            "desc": "Qondagi umumiy xolesterin darajasi",
            "min": 120,
            "max": 570,
            "default": 240,
            "step": 1,
            "unit": "mg/dl"
        },
        {
            "id": "fbs",
            "name_uz": "Qand miqdori (Och qoringa)",
            "name_en": "Fasting Blood Sugar",
            "desc": "Och qoringa qon qandi > 120 mg/dl bo'lishi",
            "type": "select",
            "options": [
                {"value": 1, "label": "Ha (> 120 mg/dl)"},
                {"value": 0, "label": "Yo'q (<= 120 mg/dl)"}
            ],
            "default": 0
        },
        {
            "id": "restecg",
            "name_uz": "Tinch EKG natijasi",
            "name_en": "Resting ECG Results",
            "desc": "Elektrokardiografiya ko'rsatkichlari",
            "type": "select",
            "options": [
                {"value": 0, "label": "0: Normal"},
                {"value": 1, "label": "1: ST-T to'lqini anomaliyasi"},
                {"value": 2, "label": "2: Chap qorincha gipertrofiyasi"}
            ],
            "default": 1
        },
        {
            "id": "thalach",
            "name_uz": "Maksimal yurak urishi",
            "name_en": "Max Heart Rate Achieved",
            "desc": "Mashq paytida erishilgan maksimal puls",
            "min": 70,
            "max": 210,
            "default": 150,
            "step": 1,
            "unit": "bpm"
        },
        {
            "id": "exang",
            "name_uz": "Mashqdan keyingi angina",
            "name_en": "Exercise Induced Angina",
            "desc": "Jismoniy yuklama vaqtida stenokardiya paydo bo'lishi",
            "type": "select",
            "options": [
                {"value": 1, "label": "Ha (1)"},
                {"value": 0, "label": "Yo'q (0)"}
            ],
            "default": 0
        },
        {
            "id": "oldpeak",
            "name_uz": "ST depressiyasi",
            "name_en": "ST Depression (oldpeak)",
            "desc": "Mashq orqali keltirib chiqarilgan ST segment depressiyasi",
            "min": 0.0,
            "max": 6.5,
            "default": 1.0,
            "step": 0.1,
            "unit": "mm"
        },
        {
            "id": "slope",
            "name_uz": "ST segmentining qiyaligi",
            "name_en": "Slope of Peak Exercise ST",
            "desc": "Maksimal mashq ST segmentining ko'tarilish qiyaligi",
            "type": "select",
            "options": [
                {"value": 0, "label": "0: Pastga qarab (Upsloping)"},
                {"value": 1, "label": "1: Gorizontal (Flat)"},
                {"value": 2, "label": "2: Yuqoriga qarab (Downsloping)"}
            ],
            "default": 1
        },
        {
            "id": "ca",
            "name_uz": "Bo'yalgan yirik tomirlar soni",
            "name_en": "Major Vessels Colored (ca)",
            "desc": "Flyuroskopiya ostida ko'ringan yirik tomirlar (0-3)",
            "type": "select",
            "options": [
                {"value": 0, "label": "0 ta tomir"},
                {"value": 1, "label": "1 ta tomir"},
                {"value": 2, "label": "2 ta tomir"},
                {"value": 3, "label": "3 ta tomir"}
            ],
            "default": 0
        },
        {
            "id": "thal",
            "name_uz": "Talassemiya turi (thal)",
            "name_en": "Thalassemia Type",
            "desc": "Talassemiya qon tahlili holati",
            "type": "select",
            "options": [
                {"value": 1, "label": "1: Oddiy / Normal"},
                {"value": 2, "label": "2: Ruxsat etilgan nuqson (Fixed defect)"},
                {"value": 3, "label": "3: Qaytariluvchi nuqson (Reversable defect)"}
            ],
            "default": 2
        }
    ]

    # SVM parametrlarini eksportga tayyorlash
    gamma_val = float(svm._gamma)
    intercept_val = float(svm.intercept_[0])
    dual_coef_val = svm.dual_coef_[0].tolist()
    support_vectors_val = svm.support_vectors_.tolist()
    prob_a = float(svm.probA_[0]) if hasattr(svm, 'probA_') else -1.0
    prob_b = float(svm.probB_[0]) if hasattr(svm, 'probB_') else 0.0

    # Dataset namunalari (jadval uchun)
    dataset_preview = df.head(15).to_dict(orient="records")

    # Korrelyatsiyalarni saralash (importance sifatida)
    feature_importance = []
    for f in feature_meta:
        f_id = f["id"]
        corr = correlations.get(f_id, 0.0)
        feature_importance.append({
            "id": f_id,
            "name_uz": f["name_uz"],
            "correlation": round(float(corr), 4),
            "abs_correlation": round(abs(float(corr)), 4)
        })
    feature_importance.sort(key=lambda x: x["abs_correlation"], reverse=True)

    # 6. JSON faylga eksport qilish
    export_data = {
        "project": {
            "title_uz": "Yurak kasalliklari xavfini bashorat qilish",
            "title_en": "Heart Disease Risk Prediction",
            "dataset_name": "UCI Machine Learning Repository - Heart Disease Dataset",
            "total_samples": int(len(df)),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "features_count": len(feature_cols),
            "algorithms": ["K-Nearest Neighbors (KNN)", "Support Vector Machine (SVM)"],
            "date": "2026-11-11"
        },
        "features": feature_meta,
        "feature_importance": feature_importance,
        "scaler": {
            "feature_names": feature_cols,
            "mean": scaler.mean_.tolist(),
            "scale": scaler.scale_.tolist(),
            "var": scaler.var_.tolist()
        },
        "knn": {
            "name": "K-Nearest Neighbors (KNN)",
            "params": {"k": knn_k, "weights": "distance", "metric": "euclidean"},
            "metrics": {
                "accuracy": round(knn_acc * 100, 2),
                "precision": round(knn_prec * 100, 2),
                "recall": round(knn_rec * 100, 2),
                "f1_score": round(knn_f1 * 100, 2),
                "roc_auc": round(knn_auc * 100, 2),
                "confusion_matrix": knn_cm
            },
            # Brauzerda real-vaqtda hisoblash uchun masshtablangan o'qitish to'plami
            "train_points": X_train_scaled.round(4).tolist(),
            "train_labels": y_train.tolist()
        },
        "svm": {
            "name": "Support Vector Machine (SVM)",
            "params": {"kernel": "rbf", "C": 1.0, "gamma": round(gamma_val, 5)},
            "metrics": {
                "accuracy": round(svm_acc * 100, 2),
                "precision": round(svm_prec * 100, 2),
                "recall": round(svm_rec * 100, 2),
                "f1_score": round(svm_f1 * 100, 2),
                "roc_auc": round(svm_auc * 100, 2),
                "confusion_matrix": svm_cm
            },
            # Brauzerda RBF SVM hisoblash parametrlari
            "gamma": gamma_val,
            "intercept": intercept_val,
            "dual_coef": [round(c, 5) for c in dual_coef_val],
            "support_vectors": [[round(v, 4) for v in sv] for sv in support_vectors_val],
            "prob_a": prob_a,
            "prob_b": prob_b
        },
        "dataset_preview": dataset_preview,
        "eda_stats": {
            "total_patients": int(len(df)),
            "high_risk_patients": int(target_counts.get(1, 0)),
            "low_risk_patients": int(target_counts.get(0, 0)),
            "high_risk_pct": round((target_counts.get(1, 0) / len(df)) * 100, 1),
            "low_risk_pct": round((target_counts.get(0, 0) / len(df)) * 100, 1),
            "avg_age": round(float(df['age'].mean()), 1),
            "avg_trestbps": round(float(df['trestbps'].mean()), 1),
            "avg_chol": round(float(df['chol'].mean()), 1),
            "avg_thalach": round(float(df['thalach'].mean()), 1)
        }
    }

    out_json = os.path.join(base_dir, "model_data.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)

    print(f"\n[5] Model parametrlari va metrikalari saqlandi: {out_json}")
    print(f"Fayl hajmi: {os.path.getsize(out_json) / 1024:.2f} KB")
    print("\nBarcha hisoblashlar va eksport muvaffaqiyatli yakunlandi!")

if __name__ == "__main__":
    main()
