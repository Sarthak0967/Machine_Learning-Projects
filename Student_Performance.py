import numpy as np
import pandas as pd
import seaborn as sns 
import matplotlib.pyplot as plt
import joblib

from sklearn.model_selection import RandomizedSearchCV, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import GradientBoostingRegressor

# Load the dataset
data = pd.read_csv(r"C:\Users\sarth\Downloads\StudentPerformanceFactors.csv")

# Fill missing values
missing_columns = ['Teacher_Quality', 'Parental_Education_Level', 'Distance_from_Home']
for col in missing_columns:
    data[col].fillna(data[col].mode()[0], inplace=True)

# Encode binary and categorical columns
binary_columns = ['Internet_Access','Learning_Disabilities','Extracurricular_Activities']
for col in binary_columns:
    data[col] = data[col].map({'Yes': 1, 'No': 0})

categorical_features = [
    'Parental_Involvement', 'Access_to_Resources', 'Motivation_Level',
    'Family_Income', 'Teacher_Quality', 'Peer_Influence',
    'Parental_Education_Level', 'Distance_from_Home'
]

encoder = LabelEncoder()
for col in categorical_features:
    data[col] = encoder.fit_transform(data[col])

# Drop low-importance features
low_importance_features = ['School_Type', 'Learning_Disabilities', 'Gender', 'Extracurricular_Activities', 'Internet_Access']
existing_columns_to_drop = [col for col in low_importance_features if col in data.columns]
data = data.drop(columns=existing_columns_to_drop)

# Create derived features EXCLUDING 'Improvement_Rate'
data['Study_Efficiency'] = data['Hours_Studied'] / (data['Attendance'] + 1)
data['Tutoring_Effect'] = data['Tutoring_Sessions'] / (data['Hours_Studied'] + 1)

# Remove 'Improvement_Rate' if it exists
if 'Improvement_Rate' in data.columns:
    data.drop(columns=['Improvement_Rate'], inplace=True)

# Standardize numerical features
numerical_features = ['Hours_Studied', 'Attendance', 'Sleep_Hours', 'Previous_Scores', 
                      'Tutoring_Sessions', 'Physical_Activity', 'Study_Efficiency', 'Tutoring_Effect']

scaler = StandardScaler()
data[numerical_features] = scaler.fit_transform(data[numerical_features])

# Define target and features
X = data.drop(columns=['Exam_Score'])
y = data['Exam_Score']

# Save feature names
joblib.dump(list(X.columns), "feature_names_without_improvement.pkl")

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize model
gb_model = GradientBoostingRegressor(random_state=42)

# Hyperparameter search space
param_dist = {
    'n_estimators': [100, 200, 300],
    'learning_rate': [0.05, 0.1, 0.15],
    'max_depth': [3, 5, 7],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

# RandomizedSearchCV
random_search = RandomizedSearchCV(
    gb_model, param_distributions=param_dist,
    n_iter=10, cv=3, scoring='r2',
    n_jobs=-1, verbose=1, random_state=42
)

random_search.fit(X_train, y_train)

# Train final model
best_params = random_search.best_params_
best_gb_model = GradientBoostingRegressor(**best_params, random_state=42)
best_gb_model.fit(X_train, y_train)

# Predict
y_pred = best_gb_model.predict(X_test)

# Evaluation
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\n🚀 Optimized Gradient Boosting Performance WITHOUT 'Improvement_Rate':")
print(f"Mean Absolute Error (MAE): {mae:.4f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
print(f"R² Score: {r2:.4f}")

# Save model
joblib.dump(best_gb_model, "gb_model_without_improvement.pkl")
joblib.dump(scaler, "scaler_without_improvement.pkl")
joblib.dump(encoder, "encoder_without_improvement.pkl")
