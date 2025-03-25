import joblib
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Load the dataset
file_path = r"C:\Users\sarth\Downloads\StudentPerformanceFactors.csv"
data = pd.read_csv(file_path)

# Display basic information about the dataset
print(data.info())
print(data.describe())

# Check for missing values 
print("Missing values:\n", data.isnull().sum())

# Handle missing values: Fill numerical with median, categorical with mode
data.fillna(data.median(numeric_only=True), inplace=True)
data.fillna(data.mode().iloc[0], inplace=True)

# Define categorical and numerical features
categorical_features = ['Parental_Involvement', 'Access_to_Resources', 'Extracurricular_Activities',
                        'Motivation_Level', 'Internet_Access', 'Family_Income', 'Teacher_Quality',
                        'School_Type', 'Peer_Influence', 'Parental_Education_Level', 'Distance_from_Home',
                        'Gender']
numerical_features = ['Hours_Studied', 'Attendance', 'Sleep_Hours', 'Previous_Scores', 'Tutoring_Sessions',
                      'Physical_Activity']

# One-Hot Encode categorical features
encoder = OneHotEncoder(sparse_output=False, drop='first')
encoded_features = encoder.fit_transform(data[categorical_features])
encoded_feature_names = encoder.get_feature_names_out(categorical_features)
encoded_df = pd.DataFrame(encoded_features, columns=encoded_feature_names)

# Combine numerical and encoded categorical features
X = pd.concat([data[numerical_features], encoded_df], axis=1)
y = data['Exam_Score']

# Convert target variable into categories: Low (0-40), Medium (41-70), High (71-100)
bins = [0, 40, 70, 100]
labels = [0, 1, 2]  # 0 = Low, 1 = Medium, 2 = High
y = pd.cut(y, bins=bins, labels=labels, include_lowest=True)

# Remove NaN values in target
data = data[~y.isna()]
y = y.dropna()
X = X.loc[y.index]

# Feature Scaling for Numerical Features
scaler = StandardScaler()
X[numerical_features] = scaler.fit_transform(X[numerical_features])

# Check for Multicollinearity
corr_matrix = X.corr()
plt.figure(figsize=(12, 8))
sns.heatmap(corr_matrix, annot=False, cmap='coolwarm')
plt.title("Feature Correlation Heatmap")
plt.show()

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Naive Bayes Model
nb_model = GaussianNB()
nb_model.fit(X_train, y_train)

# Evaluate the Model
y_pred_nb = nb_model.predict(X_test)
accuracy_nb = accuracy_score(y_test, y_pred_nb)
print(f'Naive Bayes Model Accuracy: {accuracy_nb:.4f}')

# Save the model and preprocessors
joblib.dump(nb_model, "naive_bayes_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(encoder, "encoder.pkl")

print("Model and Preprocessors saved successfully.")