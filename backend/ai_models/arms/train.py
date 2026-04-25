import pandas as pd
import joblib

from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder
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

# Fix asymmetry feature
df["shoulder_asymmetry"] = abs(
    df["r_shoulder_range"] - df["l_shoulder_range"]
)

print("\nClass Distribution:")
print(df["label"].value_counts())

# -------------------------------
# 3. Features and labels
# -------------------------------
X = df.drop(columns=["label"])
y = df["label"]

# Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# -------------------------------
# 4. Model Pipeline
# -------------------------------
model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", SVC(
        kernel="linear",       # simpler, less overfitting
        C=0.1,
        class_weight="balanced"
    ))
])

# -------------------------------
# 5. Stratified K-Fold CV
# -------------------------------
cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

# Cross-validation accuracy
scores = cross_val_score(
    model,
    X,
    y_encoded,
    cv=cv
)

print("\n===== CROSS VALIDATION RESULTS =====")
print("Fold Accuracies:", scores)
print("Mean Accuracy:", scores.mean())
print("Std Dev:", scores.std())

# -------------------------------
# 6. Cross-validated predictions
# -------------------------------
y_pred = cross_val_predict(
    model,
    X,
    y_encoded,
    cv=cv
)

print("\n===== CLASSIFICATION REPORT =====")
print(classification_report(
    y_encoded,
    y_pred,
    target_names=le.classes_,
    zero_division=0
))

print("\n===== CONFUSION MATRIX =====")
print(confusion_matrix(y_encoded, y_pred))

# -------------------------------
# 7. Train final model on full data
# -------------------------------
model.fit(X, y_encoded)

# -------------------------------
# 8. Save model
# -------------------------------
joblib.dump(model, "arm_svm_model.pkl")
joblib.dump(le, "arm_label_encoder.pkl")

print("\nModel saved successfully!")