import pandas as pd
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
import joblib
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# -------------------------------
# 1. Load dataset
# -------------------------------
df = pd.read_csv("edited.csv")  # your dataset with neck_forward_shift

# -------------------------------
# 2. Split features & label
# -------------------------------
X = df.drop(columns=["label"])
y = df["label"]

# Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# -------------------------------
# 3. Train-test split
# -------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# -------------------------------
# 4. SVM pipeline with scaling
# -------------------------------
model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", SVC(kernel="linear", C=0.5, class_weight="balanced", probability=True))
])

# -------------------------------
# 5. Train
# -------------------------------
model.fit(X_train, y_train)

# -------------------------------
# 6. Evaluate
# -------------------------------
y_pred = model.predict(X_test)
print("Test Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))

# -------------------------------
# 7. Save model and encoder
# -------------------------------
joblib.dump(model, "rep_svm_model.pkl")
joblib.dump(le, "label_encoder.pkl")

print("SVM model trained and saved successfully!")
