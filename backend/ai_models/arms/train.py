import pandas as pd
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

# -------------------------------
# 1. Load dataset
# -------------------------------
df = pd.read_csv("arm_raise_dataset_1.csv")

# -------------------------------
# 2. CLEAN DATA
# -------------------------------
df = df[df["label"] != "NA"]

df = df[
    (df["r_shoulder_range"] > 10) &
    (df["l_shoulder_range"] > 10) &
    (df["frames"] > 10)
]

df = df.reset_index(drop=True)

# Fix asymmetry
df["shoulder_asymmetry"] = abs(
    df["r_shoulder_range"] - df["l_shoulder_range"]
)

print("\nClass distribution:\n", df["label"].value_counts())

# -------------------------------
# 3. Split features & label
# -------------------------------
X = df.drop(columns=["label"])
y = df["label"]

le = LabelEncoder()
y_encoded = le.fit_transform(y)

# -------------------------------
# 4. Train-test split
# -------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# -------------------------------
# 5. Model
# -------------------------------
model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", SVC(
        kernel="rbf",
        C=1.0,
        gamma="scale",
        class_weight="balanced",
        probability=True
    ))
])

# -------------------------------
# 6. Train
# -------------------------------
model.fit(X_train, y_train)

# -------------------------------
# 7. Evaluate
# -------------------------------
y_pred = model.predict(X_test)

print("\n===== SVM RESULTS =====")
print("Test Accuracy:", accuracy_score(y_test, y_pred))

print("\nClassification Report:\n",
      classification_report(
          y_test,
          y_pred,
          labels=range(len(le.classes_)),
          target_names=le.classes_,
          zero_division=0
      ))

print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))

# -------------------------------
# 8. Save
# -------------------------------
joblib.dump(model, "arm_svm_model_1.pkl")
joblib.dump(le, "arm_label_encoder_1.pkl")

print("\nSVM model saved successfully!")