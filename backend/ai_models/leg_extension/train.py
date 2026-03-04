# train.py
import pandas as pd
import joblib
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# -------------------------------
# 1. Load Leg Extension dataset
# -------------------------------
# Ensure you have run main.py and collected enough reps first!
DATA_FILE = "leg_extension_data.csv"

try:
    df = pd.read_csv(DATA_FILE)
except FileNotFoundError:
    print(f"Error: {DATA_FILE} not found. Collect some reps first!")
    exit()

# -------------------------------
# 2. Split features & label
# -------------------------------
X = df.drop(columns=["label"])
y = df["label"]

# Encode labels (e.g., 'correct' -> 0, 'hips_lifting' -> 1)
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# -------------------------------
# 3. Train-test split
# -------------------------------
# 80% for training, 20% for testing
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# -------------------------------
# 4. SVM pipeline with scaling
# -------------------------------
# StandardScaler is vital for SVM to perform correctly.
# C=0.5 helps prevent overfitting on small datasets.
model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", SVC(kernel="linear", C=0.5, class_weight="balanced", probability=True))
])

# -------------------------------
# 5. Train the Model
# -------------------------------
print(f"Training on {len(X_train)} samples...")
model.fit(X_train, y_train)

# -------------------------------
# 6. Evaluate Performance
# -------------------------------
y_pred = model.predict(X_test)
print("\n" + "="*30)
print(f"TEST ACCURACY: {accuracy_score(y_test, y_pred):.2%}")
print("="*30)
print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=le.classes_))

# -------------------------------
# 7. Save model and encoder
# -------------------------------
# These files will be used by your real-time inference script
joblib.dump(model, "leg_extension_model.pkl")
joblib.dump(le, "leg_label_encoder.pkl")

print("\nModel saved as 'leg_extension_model.pkl'")
print("Label encoder saved as 'leg_label_encoder.pkl'")