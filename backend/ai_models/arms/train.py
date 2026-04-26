import pandas as pd
import joblib

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score, cross_val_predict
from sklearn.metrics import classification_report, confusion_matrix

# -------------------------------
# 1. Load dataset
# -------------------------------
df = pd.read_csv("arm_raise_dataset_1.csv")

# -------------------------------
# 2. Clean dataset
# -------------------------------
df = df[df["label"] != "NA"]
df = df[df["frames"] > 10]
df = df.reset_index(drop=True)

# -------------------------------
# 3. Feature engineering
# -------------------------------
df["shoulder_asymmetry"] = abs(
    df["r_shoulder_range"] - df["l_shoulder_range"]
)

print("\nClass Distribution:")
print(df["label"].value_counts())

# -------------------------------
# 4. Features and labels
# -------------------------------
X = df.drop(columns=["label"])
y = df["label"]

le = LabelEncoder()
y_encoded = le.fit_transform(y)

# -------------------------------
# 5. MODEL (UPDATED ONLY HERE)
# -------------------------------
model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", HistGradientBoostingClassifier(
        max_depth=4,
        learning_rate=0.05,
        max_iter=200,
        random_state=42
    ))
])

# -------------------------------
# 6. Cross validation
# -------------------------------
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(model, X, y_encoded, cv=cv)

print("\n===== CROSS VALIDATION RESULTS =====")
print("Fold Accuracies:", scores)
print("Mean Accuracy:", scores.mean())
print("Std Dev:", scores.std())

# -------------------------------
# 7. Predictions
# -------------------------------
y_pred = cross_val_predict(model, X, y_encoded, cv=cv)

print("\n===== CLASSIFICATION REPORT =====")
print(classification_report(y_encoded, y_pred, target_names=le.classes_))

print("\n===== CONFUSION MATRIX =====")
print(confusion_matrix(y_encoded, y_pred))

# -------------------------------
# 8. Train final model
# -------------------------------
model.fit(X, y_encoded)

# -------------------------------
# 9. Save model
# -------------------------------
joblib.dump(model, "arm_hgb_model.pkl")
joblib.dump(le, "arm_label_encoder.pkl")

print("\nHistGradientBoosting model saved successfully!")