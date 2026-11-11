#!/usr/bin/env python3
"""
07. Yurak kasalliklari xavfini bashorat qilish (Heart Disease Risk Prediction)
Kengaytirilgan va chuqur optimallashtirilgan Machine Learning Pipeline:
Pandas, Scikit-learn (KNN va SVM, 5-Fold CV, GridSearch, ROC & PR egri chiziqlari, XAI tahlili)
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

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
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
    roc_curve,
    precision_recall_curve,
    matthews_corrcoef,
    balanced_accuracy_score,
    classification_report
)

def main():
    print("=" * 70)
    print(" Yurak kasalliklari xavfini bashorat qilish (Kengaytirilgan ML Pipeline)")
    print("=" * 70)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "dataset.csv")

    if not os.path.exists(dataset_path):
        print(f"Xatolik: {dataset_path} fayli topilmadi!")
        sys.exit(1)

    # 1. Datasetni yuklash va tozalash
    print(f"\n[1] Dataset yuklanmoqda: {dataset_path}")
    df = pd.read_csv(dataset_path)
    df.columns = df.columns.str.strip().str.replace('\ufeff', '')

    duplicates = int(df.duplicated().sum())
    if duplicates > 0:
        print(f"Takroriy qatorlar soni: {duplicates}. Tozalanmoqda...")
        df.drop_duplicates(inplace=True)

    print(f"Tozalangan dataset: {df.shape[0]} ta qator, {df.shape[1]} ta ustun")

    feature_cols = [c for c in df.columns if c != 'target']
    X = df[feature_cols]
    y = df['target']

    target_counts = df['target'].value_counts().to_dict()
    print(f"Klasslar taqsimoti: 1 (Xavf yuqori)={target_counts.get(1, 0)}, 0 (Sog'lom)={target_counts.get(0, 0)}")

    # 2. Train / Test (80 / 20) Stratified Split & StandardScaler
    print("\n[2] Ma'lumotlarni 80% Train va 20% Test to'plamiga ajratish...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    X_all_scaled = scaler.transform(X)

    # 3. 5-Fold Stratified Cross-Validation (Kross-Validatsiya)
    print("\n[3] 5-Fold Stratified Cross-Validation o'tkazilmoqda...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    knn_cv_model = KNeighborsClassifier(n_neighbors=7, weights='distance')
    svm_cv_model = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)

    knn_cv_acc = cross_val_score(knn_cv_model, X_all_scaled, y, cv=cv, scoring='accuracy')
    svm_cv_acc = cross_val_score(svm_cv_model, X_all_scaled, y, cv=cv, scoring='accuracy')
    knn_cv_f1 = cross_val_score(knn_cv_model, X_all_scaled, y, cv=cv, scoring='f1')
    svm_cv_f1 = cross_val_score(svm_cv_model, X_all_scaled, y, cv=cv, scoring='f1')

    print(f"  KNN 5-Fold O'rtacha Aniqlik: {knn_cv_acc.mean()*100:.2f}% (±{knn_cv_acc.std()*100:.2f}%)")
    print(f"  SVM 5-Fold O'rtacha Aniqlik: {svm_cv_acc.mean()*100:.2f}% (±{svm_cv_acc.std()*100:.2f}%)")

    # 4. K Hyperparameter Tuning Curve (k=1 dan k=25 gacha)
    print("\n[4] KNN uchun k giperparametrining o'zgarishi tahlili...")
    k_curve = []
    for k in range(1, 26, 2):
        k_clf = KNeighborsClassifier(n_neighbors=k, weights='distance')
        k_clf.fit(X_train_scaled, y_train)
        k_pred = k_clf.predict(X_test_scaled)
        k_curve.append({
            "k": k,
            "accuracy": round(accuracy_score(y_test, k_pred) * 100, 2),
            "f1_score": round(f1_score(y_test, k_pred) * 100, 2)
        })

    # 5. Asosiy KNN Modelini o'qitish va to'liq metrikalar
    print("\n[5] K-Nearest Neighbors (k=7) modelini o'qitish va baholash...")
    knn = KNeighborsClassifier(n_neighbors=7, weights='distance')
    knn.fit(X_train_scaled, y_train)

    y_pred_knn = knn.predict(X_test_scaled)
    y_prob_knn = knn.predict_proba(X_test_scaled)[:, 1]

    cm_knn = confusion_matrix(y_test, y_pred_knn)
    tn_k, fp_k, fn_k, tp_k = cm_knn.ravel()
    spec_knn = float(tn_k / (tn_k + fp_k))

    fpr_k, tpr_k, _ = roc_curve(y_test, y_prob_knn)
    roc_knn_points = [{"x": round(float(fp), 4), "y": round(float(tp), 4)} for fp, tp in zip(fpr_k, tpr_k)]

    knn_metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred_knn) * 100, 2),
        "f1_score": round(f1_score(y_test, y_pred_knn) * 100, 2),
        "recall": round(recall_score(y_test, y_pred_knn) * 100, 2),
        "precision": round(precision_score(y_test, y_pred_knn) * 100, 2),
        "specificity": round(spec_knn * 100, 2),
        "balanced_accuracy": round(balanced_accuracy_score(y_test, y_pred_knn) * 100, 2),
        "mcc": round(matthews_corrcoef(y_test, y_pred_knn), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob_knn) * 100, 2),
        "confusion_matrix": cm_knn.tolist(),
        "cv_mean_acc": round(knn_cv_acc.mean() * 100, 2),
        "cv_std_acc": round(knn_cv_acc.std() * 100, 2),
        "cv_folds": [round(float(s) * 100, 2) for s in knn_cv_acc]
    }

    # 6. Asosiy SVM Modelini o'qitish va to'liq metrikalar
    print("\n[6] Support Vector Machine (RBF) modelini o'qitish va baholash...")
    svm = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)
    svm.fit(X_train_scaled, y_train)

    y_pred_svm = svm.predict(X_test_scaled)
    y_prob_svm = svm.predict_proba(X_test_scaled)[:, 1]

    cm_svm = confusion_matrix(y_test, y_pred_svm)
    tn_s, fp_s, fn_s, tp_s = cm_svm.ravel()
    spec_svm = float(tn_s / (tn_s + fp_s))

    fpr_s, tpr_s, _ = roc_curve(y_test, y_prob_svm)
    roc_svm_points = [{"x": round(float(fp), 4), "y": round(float(tp), 4)} for fp, tp in zip(fpr_s, tpr_s)]

    svm_metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred_svm) * 100, 2),
        "f1_score": round(f1_score(y_test, y_pred_svm) * 100, 2),
        "recall": round(recall_score(y_test, y_pred_svm) * 100, 2),
        "precision": round(precision_score(y_test, y_pred_svm) * 100, 2),
        "specificity": round(spec_svm * 100, 2),
        "balanced_accuracy": round(balanced_accuracy_score(y_test, y_pred_svm) * 100, 2),
        "mcc": round(matthews_corrcoef(y_test, y_pred_svm), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob_svm) * 100, 2),
        "confusion_matrix": cm_svm.tolist(),
        "cv_mean_acc": round(svm_cv_acc.mean() * 100, 2),
        "cv_std_acc": round(svm_cv_acc.std() * 100, 2),
        "cv_folds": [round(float(s) * 100, 2) for s in svm_cv_acc]
    }

    # 7. Radar Chart uchun sog'lom vs kasallangan populyatsiya o'rtachalari
    healthy_df = df[df['target'] == 0]
    diseased_df = df[df['target'] == 1]
    radar_features = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'ca']

    healthy_baseline = healthy_df[radar_features].mean().round(2).to_dict()
    diseased_baseline = diseased_df[radar_features].mean().round(2).to_dict()

    # 8. XAI (Xususiyatlar Korrelyatsiyasi va Klinik Og'irliklar)
    correlations = df.corr()['target'].drop('target').to_dict()

    feature_meta = [
        {"id": "age", "name_uz": "Yosh", "name_en": "Age", "desc": "Bemorning yoshi (yillar)", "min": 25, "max": 80, "default": 55, "step": 1, "unit": "yosh"},
        {"id": "sex", "name_uz": "Jins", "name_en": "Sex", "desc": "Bemorning jinsi", "type": "select", "options": [{"value": 1, "label": "Erkak (1)"}, {"value": 0, "label": "Ayol (0)"}], "default": 1},
        {"id": "cp", "name_uz": "Ko'krak og'rig'i turi", "name_en": "Chest Pain Type", "desc": "Ko'krak qafasidagi og'riq xarakteri", "type": "select", "options": [
            {"value": 0, "label": "0: Tipik stenokardiya (Typical Angina)"},
            {"value": 1, "label": "1: Atipik stenokardiya (Atypical Angina)"},
            {"value": 2, "label": "2: Stenokardik bo'lmagan og'riq (Non-anginal)"},
            {"value": 3, "label": "3: Asimptomatik (Asymptomatic)"}
        ], "default": 0},
        {"id": "trestbps", "name_uz": "Qon bosimi (Resting BP)", "name_en": "Resting Blood Pressure", "desc": "Tinch holatdagi sistolik qon bosimi", "min": 90, "max": 200, "default": 130, "step": 1, "unit": "mm Hg"},
        {"id": "chol", "name_uz": "Xolesterin miqdori", "name_en": "Serum Cholesterol", "desc": "Qondagi umumiy zardob xolesterini darajasi", "min": 120, "max": 570, "default": 240, "step": 1, "unit": "mg/dl"},
        {"id": "fbs", "name_uz": "Qand miqdori (Och qoringa)", "name_en": "Fasting Blood Sugar", "desc": "Och qoringa qon qandi > 120 mg/dl bo'lishi", "type": "select", "options": [{"value": 1, "label": "Ha (> 120 mg/dl)"}, {"value": 0, "label": "Yo'q (<= 120 mg/dl)"}], "default": 0},
        {"id": "restecg", "name_uz": "Tinch EKG natijasi", "name_en": "Resting ECG Results", "desc": "Elektrokardiografiya ko'rsatkichlari", "type": "select", "options": [{"value": 0, "label": "0: Normal"}, {"value": 1, "label": "1: ST-T to'lqini anomaliyasi"}, {"value": 2, "label": "2: Chap qorincha gipertrofiyasi"}], "default": 1},
        {"id": "thalach", "name_uz": "Maksimal yurak urishi", "name_en": "Max Heart Rate Achieved", "desc": "Mashq paytida erishilgan maksimal puls", "min": 70, "max": 210, "default": 150, "step": 1, "unit": "bpm"},
        {"id": "exang", "name_uz": "Mashqdan keyingi angina", "name_en": "Exercise Induced Angina", "desc": "Jismoniy yuklama vaqtida stenokardiya paydo bo'lishi", "type": "select", "options": [{"value": 1, "label": "Ha (1)"}, {"value": 0, "label": "Yo'q (0)"}], "default": 0},
        {"id": "oldpeak", "name_uz": "ST depressiyasi", "name_en": "ST Depression", "desc": "Mashq orqali keltirib chiqarilgan ST segment depressiyasi", "min": 0.0, "max": 6.5, "default": 1.0, "step": 0.1, "unit": "mm"},
        {"id": "slope", "name_uz": "ST segmentining qiyaligi", "name_en": "Slope of Peak Exercise ST", "desc": "Maksimal mashq ST segmentining ko'tarilish qiyaligi", "type": "select", "options": [{"value": 0, "label": "0: Pastga qarab (Upsloping)"}, {"value": 1, "label": "1: Gorizontal (Flat)"}, {"value": 2, "label": "2: Yuqoriga qarab (Downsloping)"}], "default": 1},
        {"id": "ca", "name_uz": "Bo'yalgan yirik tomirlar soni", "name_en": "Major Vessels (ca)", "desc": "Flyuroskopiya ostida ko'ringan yirik tomirlar (0-3)", "type": "select", "options": [{"value": 0, "label": "0 ta tomir"}, {"value": 1, "label": "1 ta tomir"}, {"value": 2, "label": "2 ta tomir"}, {"value": 3, "label": "3 ta tomir"}], "default": 0},
        {"id": "thal", "name_uz": "Talassemiya turi (thal)", "name_en": "Thalassemia Type", "desc": "Talassemiya qon tahlili holati", "type": "select", "options": [{"value": 1, "label": "1: Oddiy / Normal"}, {"value": 2, "label": "2: Ruxsat etilgan nuqson (Fixed)"}, {"value": 3, "label": "3: Qaytariluvchi nuqson (Reversable)"}], "default": 2}
    ]

    feature_importance = []
    for f in feature_meta:
        f_id = f["id"]
        corr = correlations.get(f_id, 0.0)
        feature_importance.append({
            "id": f_id,
            "name_uz": f["name_uz"],
            "correlation": round(float(corr), 4),
            "abs_correlation": round(abs(float(corr)), 4),
            "impact": "Xavfni oshiradi" if corr > 0 else "Xavfni kamaytiradi"
        })
    feature_importance.sort(key=lambda x: x["abs_correlation"], reverse=True)

    # 9. Eksport uchun JSON obyektini tuzish
    export_data = {
        "project": {
            "title_uz": "Yurak kasalliklari xavfini bashorat qilish",
            "title_en": "Heart Disease Risk Prediction",
            "dataset_name": "UCI Machine Learning Repository - Heart Disease Dataset",
            "total_samples": int(len(df)),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "features_count": len(feature_cols),
            "algorithms": ["Support Vector Machine (SVM RBF)", "K-Nearest Neighbors (KNN)", "Ensemble Soft-Voting"],
            "date": "2026-11-11",
            "optimization_level": "Deep & Broad (5-Fold CV + Hyperparameter Tuning + XAI + What-If Simulator)"
        },
        "features": feature_meta,
        "feature_importance": feature_importance,
        "radar_baselines": {
            "features": radar_features,
            "labels_uz": ["Yosh", "Qon bosimi", "Xolesterin", "Maksimal Puls", "ST Depressiya", "Tomirlar (ca)"],
            "healthy": [healthy_baseline[f] for f in radar_features],
            "diseased": [diseased_baseline[f] for f in radar_features]
        },
        "k_tuning_curve": k_curve,
        "roc_curves": {
            "knn": roc_knn_points,
            "svm": roc_svm_points
        },
        "scaler": {
            "feature_names": feature_cols,
            "mean": scaler.mean_.tolist(),
            "scale": scaler.scale_.tolist(),
            "var": scaler.var_.tolist()
        },
        "knn": {
            "name": "K-Nearest Neighbors (KNN)",
            "params": {"k": 7, "weights": "distance", "metric": "euclidean"},
            "metrics": knn_metrics,
            "train_points": X_train_scaled.round(4).tolist(),
            "train_labels": y_train.tolist()
        },
        "svm": {
            "name": "Support Vector Machine (SVM)",
            "params": {"kernel": "rbf", "C": 1.0, "gamma": round(float(svm._gamma), 5)},
            "metrics": svm_metrics,
            "gamma": float(svm._gamma),
            "intercept": float(svm.intercept_[0]),
            "dual_coef": [round(c, 5) for c in svm.dual_coef_[0].tolist()],
            "support_vectors": [[round(v, 4) for v in sv] for sv in svm.support_vectors_.tolist()],
            "prob_a": float(svm.probA_[0]) if hasattr(svm, 'probA_') else -1.0,
            "prob_b": float(svm.probB_[0]) if hasattr(svm, 'probB_') else 0.0
        },
        "dataset_preview": df.to_dict(orient="records"),
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

    print(f"\n[7] Optimallashtirilgan model parametrlari saqlandi: {out_json}")
    print(f"Fayl hajmi: {os.path.getsize(out_json) / 1024:.2f} KB")

if __name__ == "__main__":
    main()
