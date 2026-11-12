#!/usr/bin/env python3
"""
07. Yurak kasalliklari xavfini bashorat qilish (Heart Disease Risk Prediction Pro Max Enterprise)
Kengaytirilgan va chuqur optimallashtirilgan Machine Learning Pipeline:
Pandas, Scikit-learn (KNN, SVM, Random Forest, Gradient Boosting, Soft-Voting Ensemble,
PCA 2D Cluster Space, 5-Fold CV, ROC egri chiziqlari, XAI tahlili va Framingham bazasi)
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
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.decomposition import PCA
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    roc_curve,
    matthews_corrcoef,
    balanced_accuracy_score
)

def evaluate_model(model, X_train, X_test, y_train, y_test, X_all, y_all, cv):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    cv_scores = cross_val_score(model, X_all, y_all, cv=cv, scoring='accuracy')

    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_points = [{"x": round(float(f), 4), "y": round(float(t), 4)} for f, t in zip(fpr, tpr)]

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred) * 100, 2),
        "f1_score": round(f1_score(y_test, y_pred) * 100, 2),
        "recall": round(recall_score(y_test, y_pred) * 100, 2),
        "precision": round(precision_score(y_test, y_pred) * 100, 2),
        "specificity": round(spec * 100, 2),
        "balanced_accuracy": round(balanced_accuracy_score(y_test, y_pred) * 100, 2),
        "mcc": round(matthews_corrcoef(y_test, y_pred), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob) * 100, 2),
        "confusion_matrix": cm.tolist(),
        "cv_mean_acc": round(cv_scores.mean() * 100, 2),
        "cv_std_acc": round(cv_scores.std() * 100, 2),
        "cv_folds": [round(float(s) * 100, 2) for s in cv_scores]
    }
    return metrics, roc_points

def main():
    print("=" * 75)
    print(" Yurak kasalliklari xavfini bashorat qilish (Enterprise ML Pipeline + PCA)")
    print("=" * 75)

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

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # 3. K Hyperparameter Tuning Curve (k=1 dan k=25 gacha)
    print("\n[3] KNN uchun k giperparametrining o'zgarishi tahlili...")
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

    # 4. Modellarni o'qitish va baholash
    print("\n[4] 5 ta modelni o'qitish va baholash (KNN, SVM, RF, GB, Ensemble)...")
    knn = KNeighborsClassifier(n_neighbors=7, weights='distance')
    svm = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True, random_state=42)
    rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=3, random_state=42)

    ensemble = VotingClassifier(
        estimators=[('knn', knn), ('svm', svm), ('rf', rf), ('gb', gb)],
        voting='soft',
        weights=[1.0, 1.2, 1.3, 1.2]
    )

    knn_metrics, roc_knn = evaluate_model(knn, X_train_scaled, X_test_scaled, y_train, y_test, X_all_scaled, y, cv)
    svm_metrics, roc_svm = evaluate_model(svm, X_train_scaled, X_test_scaled, y_train, y_test, X_all_scaled, y, cv)
    rf_metrics, roc_rf = evaluate_model(rf, X_train_scaled, X_test_scaled, y_train, y_test, X_all_scaled, y, cv)
    gb_metrics, roc_gb = evaluate_model(gb, X_train_scaled, X_test_scaled, y_train, y_test, X_all_scaled, y, cv)
    ens_metrics, roc_ens = evaluate_model(ensemble, X_train_scaled, X_test_scaled, y_train, y_test, X_all_scaled, y, cv)

    print(f"  KNN (k=7)              : Aniqlik={knn_metrics['accuracy']}%, F1={knn_metrics['f1_score']}%, Recall={knn_metrics['recall']}%, AUC={knn_metrics['roc_auc']}%")
    print(f"  SVM (RBF)              : Aniqlik={svm_metrics['accuracy']}%, F1={svm_metrics['f1_score']}%, Recall={svm_metrics['recall']}%, AUC={svm_metrics['roc_auc']}%")
    print(f"  Random Forest          : Aniqlik={rf_metrics['accuracy']}%, F1={rf_metrics['f1_score']}%, Recall={rf_metrics['recall']}%, AUC={rf_metrics['roc_auc']}%")
    print(f"  Gradient Boosting      : Aniqlik={gb_metrics['accuracy']}%, F1={gb_metrics['f1_score']}%, Recall={gb_metrics['recall']}%, AUC={gb_metrics['roc_auc']}%")
    print(f"  Ensemble (Soft-Voting) : Aniqlik={ens_metrics['accuracy']}%, F1={ens_metrics['f1_score']}%, Recall={ens_metrics['recall']}%, AUC={ens_metrics['roc_auc']}%")

    # 5. PCA (Principal Component Analysis - 2D Bemorlar Klasteri)
    print("\n[5] PCA 2D tahlili hisoblanmoqda...")
    pca = PCA(n_components=2, random_state=42)
    pca_coords = pca.fit_transform(X_all_scaled)

    pca_points = []
    for i in range(len(df)):
        pca_points.append({
            "x": round(float(pca_coords[i, 0]), 3),
            "y": round(float(pca_coords[i, 1]), 3),
            "target": int(df['target'].iloc[i]),
            "age": int(df['age'].iloc[i]),
            "sex": int(df['sex'].iloc[i]),
            "cp": int(df['cp'].iloc[i]),
            "trestbps": int(df['trestbps'].iloc[i]),
            "chol": int(df['chol'].iloc[i])
        })

    pca_meta = {
        "points": pca_points,
        "components": [[round(float(c), 5) for c in comp] for comp in pca.components_],
        "mean": [round(float(m), 5) for m in pca.mean_],
        "variance_ratio": [round(float(v) * 100, 2) for v in pca.explained_variance_ratio_]
    }
    print(f"  PCA Dastlabki 2 ta asosiy komponent tushuntirish kuchi: {pca_meta['variance_ratio'][0]}% va {pca_meta['variance_ratio'][1]}%")

    # 6. Radar Chart uchun sog'lom vs kasallangan populyatsiya o'rtachalari
    healthy_df = df[df['target'] == 0]
    diseased_df = df[df['target'] == 1]
    radar_features = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'ca']

    healthy_baseline = healthy_df[radar_features].mean().round(2).to_dict()
    diseased_baseline = diseased_df[radar_features].mean().round(2).to_dict()

    # 7. XAI va Xususiyatlar Ta'siri (Feature Importances & Clinical Weights)
    correlations = df.corr()['target'].drop('target').to_dict()
    rf_importances = dict(zip(feature_cols, rf.feature_importances_))
    gb_importances = dict(zip(feature_cols, gb.feature_importances_))

    feature_meta = [
        {"id": "age", "name_uz": "Yosh", "name_en": "Age", "name_ru": "Возраст", "desc_uz": "Bemorning yoshi (yillar)", "desc_en": "Patient age (years)", "desc_ru": "Возраст пациента (лет)", "min": 25, "max": 80, "default": 55, "step": 1, "unit": "yosh"},
        {"id": "sex", "name_uz": "Jins", "name_en": "Sex", "name_ru": "Пол", "desc_uz": "Bemorning jinsi", "desc_en": "Biological sex", "desc_ru": "Биологический пол", "type": "select", "options": [{"value": 1, "label_uz": "Erkak (1)", "label_en": "Male (1)", "label_ru": "Мужчина (1)"}, {"value": 0, "label_uz": "Ayol (0)", "label_en": "Female (0)", "label_ru": "Женщина (0)"}], "default": 1},
        {"id": "cp", "name_uz": "Ko'krak og'rig'i turi", "name_en": "Chest Pain Type", "name_ru": "Тип боли в груди", "desc_uz": "Ko'krak qafasidagi og'riq xarakteri", "desc_en": "Nature of chest pain", "desc_ru": "Характер загрудинной боли", "type": "select", "options": [
            {"value": 0, "label_uz": "0: Tipik stenokardiya (Typical)", "label_en": "0: Typical Angina", "label_ru": "0: Типичная стенокардия"},
            {"value": 1, "label_uz": "1: Atipik stenokardiya (Atypical)", "label_en": "1: Atypical Angina", "label_ru": "1: Атипичная стенокардия"},
            {"value": 2, "label_uz": "2: Stenokardik bo'lmagan (Non-anginal)", "label_en": "2: Non-anginal Pain", "label_ru": "2: Неангинозная боль"},
            {"value": 3, "label_uz": "3: Asimptomatik (Asymptomatic)", "label_en": "3: Asymptomatic", "label_ru": "3: Бессимптомная"}
        ], "default": 0},
        {"id": "trestbps", "name_uz": "Qon bosimi (Resting BP)", "name_en": "Resting Blood Pressure", "name_ru": "Давление в покое", "desc_uz": "Tinch holatdagi sistolik qon bosimi", "desc_en": "Resting systolic blood pressure", "desc_ru": "Систолическое АД в состоянии покоя", "min": 90, "max": 200, "default": 130, "step": 1, "unit": "mm Hg"},
        {"id": "chol", "name_uz": "Xolesterin miqdori", "name_en": "Serum Cholesterol", "name_ru": "Холестерин сыворотки", "desc_uz": "Qondagi umumiy zardob xolesterini darajasi", "desc_en": "Total serum cholesterol level", "desc_ru": "Уровень общего холестерина сыворотки", "min": 120, "max": 570, "default": 240, "step": 1, "unit": "mg/dl"},
        {"id": "fbs", "name_uz": "Qand miqdori (Och qoringa)", "name_en": "Fasting Blood Sugar", "name_ru": "Сахар натощак", "desc_uz": "Och qoringa qon qandi > 120 mg/dl bo'lishi", "desc_en": "Fasting blood sugar > 120 mg/dl", "desc_ru": "Уровень глюкозы натощак > 120 мг/дл", "type": "select", "options": [{"value": 1, "label_uz": "Ha (> 120 mg/dl)", "label_en": "Yes (> 120 mg/dl)", "label_ru": "Да (> 120 мг/дл)"}, {"value": 0, "label_uz": "Yo'q (<= 120 mg/dl)", "label_en": "No (<= 120 mg/dl)", "label_ru": "Нет (<= 120 мг/дл)"}], "default": 0},
        {"id": "restecg", "name_uz": "Tinch EKG natijasi", "name_en": "Resting ECG Results", "name_ru": "ЭКГ в покое", "desc_uz": "Elektrokardiografiya ko'rsatkichlari", "desc_en": "Resting electrocardiographic results", "desc_ru": "Результаты ЭКГ в покое", "type": "select", "options": [
            {"value": 0, "label_uz": "0: Normal", "label_en": "0: Normal", "label_ru": "0: В норме"},
            {"value": 1, "label_uz": "1: ST-T to'lqini anomaliyasi", "label_en": "1: ST-T Wave Abnormality", "label_ru": "1: Аномалия зубца ST-T"},
            {"value": 2, "label_uz": "2: Chap qorincha gipertrofiyasi", "label_en": "2: Left Ventricular Hypertrophy", "label_ru": "2: Гипертрофия левого желудочка"}
        ], "default": 1},
        {"id": "thalach", "name_uz": "Maksimal yurak urishi", "name_en": "Max Heart Rate Achieved", "name_ru": "Максимальный пульс", "desc_uz": "Mashq paytida erishilgan maksimal puls", "desc_en": "Maximum heart rate achieved in exercise", "desc_ru": "Максимальная ЧСС при нагрузке", "min": 70, "max": 210, "default": 150, "step": 1, "unit": "bpm"},
        {"id": "exang", "name_uz": "Mashqdan keyingi angina", "name_en": "Exercise Induced Angina", "name_ru": "Стенокардия напряжения", "desc_uz": "Jismoniy yuklama vaqtida stenokardiya paydo bo'lishi", "desc_en": "Exercise induced angina symptom", "desc_ru": "Возникновение стенокардии при нагрузке", "type": "select", "options": [{"value": 1, "label_uz": "Ha (1)", "label_en": "Yes (1)", "label_ru": "Да (1)"}, {"value": 0, "label_uz": "Yo'q (0)", "label_en": "No (0)", "label_ru": "Нет (0)"}], "default": 0},
        {"id": "oldpeak", "name_uz": "ST depressiyasi", "name_en": "ST Depression", "name_ru": "Депрессия ST", "desc_uz": "Mashq orqali keltirib chiqarilgan ST segment depressiyasi", "desc_en": "ST depression induced by exercise", "desc_ru": "Депрессия сегмента ST при нагрузке", "min": 0.0, "max": 6.5, "default": 1.0, "step": 0.1, "unit": "mm"},
        {"id": "slope", "name_uz": "ST segmentining qiyaligi", "name_en": "Slope of Peak Exercise ST", "name_ru": "Наклон сегмента ST", "desc_uz": "Maksimal mashq ST segmentining ko'tarilish qiyaligi", "desc_en": "Slope of the peak exercise ST segment", "desc_ru": "Наклон сегмента ST на пике нагрузки", "type": "select", "options": [
            {"value": 0, "label_uz": "0: Pastga qarab (Upsloping)", "label_en": "0: Upsloping", "label_ru": "0: Восходящий"},
            {"value": 1, "label_uz": "1: Gorizontal (Flat)", "label_en": "1: Flat", "label_ru": "1: Горизонтальный"},
            {"value": 2, "label_uz": "2: Yuqoriga qarab (Downsloping)", "label_en": "2: Downsloping", "label_ru": "2: Нисходящий"}
        ], "default": 1},
        {"id": "ca", "name_uz": "Bo'yalgan yirik tomirlar soni", "name_en": "Major Vessels (ca)", "name_ru": "Количество сосудов (ca)", "desc_uz": "Flyuroskopiya ostida ko'ringan yirik tomirlar (0-3)", "desc_en": "Number of major vessels colored by flourosopy", "desc_ru": "Число крупных сосудов, окрашенных флюороскопией", "type": "select", "options": [{"value": 0, "label_uz": "0 ta tomir", "label_en": "0 vessels", "label_ru": "0 сосудов"}, {"value": 1, "label_uz": "1 ta tomir", "label_en": "1 vessel", "label_ru": "1 сосуд"}, {"value": 2, "label_uz": "2 ta tomir", "label_en": "2 vessels", "label_ru": "2 сосуда"}, {"value": 3, "label_uz": "3 ta tomir", "label_en": "3 vessels", "label_ru": "3 сосуда"}], "default": 0},
        {"id": "thal", "name_uz": "Talassemiya turi (thal)", "name_en": "Thalassemia Type", "name_ru": "Тип талассемии", "desc_uz": "Talassemiya qon tahlili holati", "desc_en": "Thalassemia blood disorder status", "desc_ru": "Статус талассемии", "type": "select", "options": [
            {"value": 1, "label_uz": "1: Oddiy / Normal", "label_en": "1: Normal", "label_ru": "1: Норма"},
            {"value": 2, "label_uz": "2: Ruxsat etilgan (Fixed)", "label_en": "2: Fixed Defect", "label_ru": "2: Фиксированный дефект"},
            {"value": 3, "label_uz": "3: Qaytariluvchi (Reversable)", "label_en": "3: Reversable Defect", "label_ru": "3: Обратимый дефект"}
        ], "default": 2}
    ]

    feature_importance = []
    for f in feature_meta:
        f_id = f["id"]
        corr = correlations.get(f_id, 0.0)
        rf_imp = rf_importances.get(f_id, 0.0)
        gb_imp = gb_importances.get(f_id, 0.0)
        ensemble_imp = (abs(corr) * 0.3) + (rf_imp * 0.35) + (gb_imp * 0.35)

        feature_importance.append({
            "id": f_id,
            "name_uz": f["name_uz"],
            "name_en": f["name_en"],
            "name_ru": f["name_ru"],
            "correlation": round(float(corr), 4),
            "rf_importance": round(float(rf_imp) * 100, 2),
            "gb_importance": round(float(gb_imp) * 100, 2),
            "ensemble_weight": round(float(ensemble_imp) * 100, 2),
            "impact_direction": "positive" if corr > 0 else "negative"
        })
    feature_importance.sort(key=lambda x: x["ensemble_weight"], reverse=True)

    # 8. Feature Engineering va Kengaytirilgan Klinik Biomarkerlar
    print("\n[8] Klinik Feature Engineering va Kohorta Tahlili...")
    df['rpp'] = (df['trestbps'] * df['thalach'] / 100.0).round(1)
    df['map'] = (df['trestbps'] * 0.7 + 25.0).round(1)
    df['chronotropic_reserve'] = ((df['thalach'] / (220.0 - df['age'])) * 100.0).round(1)
    est_time = (df['thalach'] - 60.0) / 12.0
    df['duke_score'] = (est_time - (5.0 * df['oldpeak']) - (4.0 * df['exang'])).round(2)
    df['atherogenic_idx'] = (df['chol'] / (df['age'] * 3.5)).round(2)

    def get_duke_risk(score):
        if score >= 5:
            return 'Low'
        elif score >= -10:
            return 'Moderate'
        else:
            return 'High'

    df['duke_risk'] = df['duke_score'].apply(get_duke_risk)

    medical_insights = {
        "cp": {"uz": "Ko'krak og'rig'i tipi (angina xarakteri) kasallikning eng kuchli prediktorlaridan biridir.", "en": "Chest pain type is a primary hallmark of coronary perfusion insufficiency.", "ru": "Тип загрудинной боли является ведущим клиническим маркером ишемии."},
        "thalach": {"uz": "Maksimal pulsga erishish qobiliyati yurak funksional rezervi bilan bevosita bog'liq.", "en": "Max heart rate reflects chronotropic competence and cardiac reserve.", "ru": "Максимальная ЧСС отражает хронотропный резерв миокарда."},
        "slope": {"uz": "ST segmentining ko'tarilish burchagi mashqdan keyingi repolyarizatsiyani ifodalaydi.", "en": "ST slope indicates the nature of myocardial repolarization during exercise.", "ru": "Наклон сегмента ST отражает динамику реполяризации при нагрузке."},
        "restecg": {"uz": "Tinch holatdagi EKGda ST-T o'zgarishlari yoki qorincha gipertrofiyasi.", "en": "Resting ECG shows baseline repolarization abnormalities or hypertrophy.", "ru": "ЭКГ покоя выявляет гипертрофию желудочка или диффузную ишемию."},
        "fbs": {"uz": "Qand miqdori qon tomir endoteliysi holati va metabolik sindrom ko'rsatkichi.", "en": "Fasting blood sugar reflects endothelial dysfunction and metabolic syndrome.", "ru": "Глюкоза натощак указывает на метаболический синдром и повреждение сосудов."},
        "chol": {"uz": "Zardob xolesterini aterosklerotik blyashkalar shakllanishiga zamin yaratadi.", "en": "Serum cholesterol directly drives coronary atherosclerotic plaque growth.", "ru": "Холестерин сыворотки ускоряет атеросклеротическое поражение артерий."},
        "trestbps": {"uz": "Sistolik qon bosimi tomir devorlariga tushadigan gidravlik yuklamani belgilaydi.", "en": "Resting systolic blood pressure determines arterial afterload.", "ru": "Систолическое АД определяет сосудистое сопротивление и постнагрузку."},
        "age": {"uz": "Yosh ulg'aygan sari tomirlar elastikligi kamayib, kalsifikatsiya darajasi oshadi.", "en": "Advanced age increases arterial stiffness and calcification burden.", "ru": "Возраст обуславливает жесткость сосудистой стенки и кальциноз."},
        "sex": {"uz": "Erkaklarda erta yoshdanoq koronar kasalliklar xavfi statistik yuqoriroq.", "en": "Males exhibit earlier onset of coronary artery disease.", "ru": "Мужской пол статистически чаще подвержен ранней ишемической болезни."},
        "thal": {"uz": "Qon perfuziyasi defekti yoki gemoglobin yetishmovchiligi kardiak ishemiyani kuchaytiradi.", "en": "Thalassemia perfusion defect aggravates regional ischemia.", "ru": "Дефекты перфузии миокарда напрямую вызывают тканевую гипоксию."},
        "ca": {"uz": "Floroskopiyada ko'ringan kalsiylangan yirik koronar tomirlar soni.", "en": "Number of fluoroscopy-calcified major coronary vessels.", "ru": "Число кальцинированных коронарных артерий по данным флюороскопии."},
        "oldpeak": {"uz": "Mashq orqali keltirib chiqarilgan ST depressiyasi - to'g'ridan-to'g'ri ishemiya nishoni.", "en": "Exercise-induced ST depression is a direct hallmark of subendocardial ischemia.", "ru": "Депрессия ST при нагрузке — прямой маркер субэндокардиальной ишемии."},
        "exang": {"uz": "Jismoniy harakat vaqtida stenokardik ko'krak qisishi paydo bo'lishi.", "en": "Exercise-induced angina demonstrates clinical coronary steal syndrome.", "ru": "Стенокардия напряжения указывает на критическое несоответствие перфузии."}
    }

    feature_correlations = []
    for f_id in feature_cols:
        r_val = float(correlations.get(f_id, 0.0))
        insight = medical_insights.get(f_id, {"uz": "Klinik parametr", "en": "Clinical parameter", "ru": "Клинический параметр"})
        feature_correlations.append({
            "id": f_id,
            "correlation": round(r_val, 4),
            "abs_corr": round(abs(r_val), 4),
            "impact_direction": "positive" if r_val > 0 else "negative",
            "insight_uz": insight["uz"],
            "insight_en": insight["en"],
            "insight_ru": insight["ru"]
        })
    feature_correlations.sort(key=lambda x: x["abs_corr"], reverse=True)

    bins = [0, 39, 49, 59, 69, 120]
    labels = ['<40', '40-49', '50-59', '60-69', '70+']
    df['age_group'] = pd.cut(df['age'], bins=bins, labels=labels)
    age_summary = df.groupby('age_group', observed=False).agg(
        total=('target', 'count'),
        diseased=('target', 'sum')
    ).reset_index()

    age_brackets = []
    for _, row in age_summary.iterrows():
        tot = int(row['total'])
        dis = int(row['diseased'])
        pct = round((dis / tot * 100), 1) if tot > 0 else 0
        age_brackets.append({
            'group': str(row['age_group']),
            'total': tot,
            'diseased': dis,
            'healthy': tot - dis,
            'risk_pct': pct
        })

    male_df = df[df['sex'] == 1]
    female_df = df[df['sex'] == 0]
    gender_breakdown = {
        'male_total': len(male_df),
        'male_diseased': int(male_df['target'].sum()),
        'male_risk_pct': round(float(male_df['target'].mean() * 100), 1),
        'female_total': len(female_df),
        'female_diseased': int(female_df['target'].sum()),
        'female_risk_pct': round(float(female_df['target'].mean() * 100), 1)
    }

    cp_labels_uz = ['0: Tipik stenokardiya', '1: Atipik stenokardiya', '2: Nosteno og\'riq', '3: Asimptomatik']
    cp_breakdown = []
    for cp_val in [0, 1, 2, 3]:
        sub = df[df['cp'] == cp_val]
        tot = len(sub)
        dis = int(sub['target'].sum())
        cp_breakdown.append({
            'cp': cp_val,
            'label': cp_labels_uz[cp_val],
            'total': tot,
            'diseased': dis,
            'risk_pct': round((dis / tot * 100), 1) if tot > 0 else 0
        })

    ca_labels_uz = ['0 ta tomir', '1 ta tomir', '2 ta tomir', '3 ta tomir']
    ca_breakdown = []
    for ca_val in [0, 1, 2, 3]:
        sub = df[df['ca'] == ca_val]
        tot = len(sub)
        dis = int(sub['target'].sum())
        ca_breakdown.append({
            'ca': ca_val,
            'label': ca_labels_uz[ca_val],
            'total': tot,
            'diseased': dis,
            'risk_pct': round((dis / tot * 100), 1) if tot > 0 else 0
        })

    scatter_points = []
    for _, row in df.iterrows():
        scatter_points.append({
            'x': int(row['trestbps']),
            'y': int(row['chol']),
            'target': int(row['target']),
            'age': int(row['age']),
            'sex': int(row['sex'])
        })

    dataset_intelligence = {
        "cohort_distributions": {
            "age_brackets": age_brackets,
            "gender_breakdown": gender_breakdown,
            "cp_breakdown": cp_breakdown,
            "ca_breakdown": ca_breakdown
        },
        "scatter_chol_bp": scatter_points,
        "feature_correlations": feature_correlations,
        "biomarkers_summary": {
            "dts_mean": round(float(df['duke_score'].mean()), 2),
            "rpp_mean": round(float(df['rpp'].mean()), 1),
            "map_mean": round(float(df['map'].mean()), 1),
            "chronotropic_mean": round(float(df['chronotropic_reserve'].mean()), 1)
        }
    }

    # 9. Eksport uchun JSON obyektini tuzish
    export_data = {
        "project": {
            "title_uz": "Yurak kasalliklari xavfini bashorat qilish Pro Max Enterprise",
            "title_en": "Heart Disease Risk Prediction Pro Max Enterprise",
            "title_ru": "Прогнозирование риска сердечно-сосудистых заболеваний Pro Max Enterprise",
            "dataset_name": "UCI Machine Learning Repository - Cleveland Heart Disease",
            "total_samples": int(len(df)),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "features_count": len(feature_cols),
            "algorithms": [
                "Ensemble Soft-Voting (SOTA)",
                "Gradient Boosting",
                "Support Vector Machine (SVM RBF)",
                "Random Forest",
                "K-Nearest Neighbors (KNN)"
            ],
            "date": "2026-11-12",
            "version": "3.5.0-enterprise"
        },
        "features": feature_meta,
        "feature_importance": feature_importance,
        "pca": pca_meta,
        "radar_baselines": {
            "features": radar_features,
            "labels_uz": ["Yosh", "Qon bosimi", "Xolesterin", "Maksimal Puls", "ST Depressiya", "Tomirlar (ca)"],
            "labels_en": ["Age", "Resting BP", "Cholesterol", "Max HR", "ST Depr", "Vessels (ca)"],
            "labels_ru": ["Возраст", "Давление", "Холестерин", "Макс Пульс", "Депрессия ST", "Сосуды (ca)"],
            "healthy": [healthy_baseline[f] for f in radar_features],
            "diseased": [diseased_baseline[f] for f in radar_features]
        },
        "k_tuning_curve": k_curve,
        "roc_curves": {
            "knn": roc_knn,
            "svm": roc_svm,
            "rf": roc_rf,
            "gb": roc_gb,
            "ensemble": roc_ens
        },
        "models": {
            "knn": {
                "name": "K-Nearest Neighbors (KNN)",
                "params": {"k": 7, "weights": "distance", "metric": "euclidean"},
                "metrics": knn_metrics
            },
            "svm": {
                "name": "Support Vector Machine (SVM)",
                "params": {"kernel": "rbf", "C": 1.0, "gamma": round(float(svm._gamma), 5)},
                "metrics": svm_metrics
            },
            "rf": {
                "name": "Random Forest",
                "params": {"n_estimators": 100, "max_depth": 5, "criterion": "gini"},
                "metrics": rf_metrics
            },
            "gb": {
                "name": "Gradient Boosting",
                "params": {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 3},
                "metrics": gb_metrics
            },
            "ensemble": {
                "name": "Ensemble Soft-Voting (SOTA)",
                "params": {"voting": "soft", "weights": [1.0, 1.2, 1.3, 1.2]},
                "metrics": ens_metrics
            }
        },
        "scaler": {
            "feature_names": feature_cols,
            "mean": scaler.mean_.tolist(),
            "scale": scaler.scale_.tolist(),
            "var": scaler.var_.tolist()
        },
        "inference_engine": {
            "knn_train_points": X_train_scaled.round(4).tolist(),
            "knn_train_labels": y_train.tolist(),
            "svm_gamma": float(svm._gamma),
            "svm_intercept": float(svm.intercept_[0]),
            "svm_dual_coef": [round(c, 5) for c in svm.dual_coef_[0].tolist()],
            "svm_support_vectors": [[round(v, 4) for v in sv] for sv in svm.support_vectors_.tolist()],
            "svm_prob_a": float(svm.probA_[0]) if hasattr(svm, 'probA_') else -1.0,
            "svm_prob_b": float(svm.probB_[0]) if hasattr(svm, 'probB_') else 0.0
        },
        "dataset_intelligence": dataset_intelligence,
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

    # model_data.json
    out_json = os.path.join(base_dir, "model_data.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)

    # fallback_data.js
    out_js = os.path.join(base_dir, "fallback_data.js")
    with open(out_js, "w", encoding="utf-8") as f:
        f.write("/* Avtomatik yaratilgan fallback model ma'lumotlari */\n")
        f.write("window.FALLBACK_MODEL_DATA = ")
        json.dump(export_data, f, ensure_ascii=False)
        f.write(";\n")

    print(f"\n[6] Model parametrlari va PCA saqlandi: {out_json}")
    print(f"    Fayl hajmi (JSON): {os.path.getsize(out_json) / 1024:.2f} KB")
    print(f"    Fayl hajmi (JS):   {os.path.getsize(out_js) / 1024:.2f} KB")
    print("=" * 75)

if __name__ == "__main__":
    main()
