import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
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
# 4. Train random forest using best-known hyperparameters
# -------------------------------
model = Pipeline([
    ("scaler", StandardScaler()),
    (
        "clf",
        RandomForestClassifier(
            n_estimators=50,
            max_depth=3,
            class_weight="balanced",
            random_state=42
        )
    )
])

# -------------------------------
# 5. Train
# -------------------------------
model.fit(X_train, y_train)

print("Trained RandomForest with fixed parameters: n_estimators=50, max_depth=3")

# -------------------------------
# 6. Evaluate on held-out test set
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
