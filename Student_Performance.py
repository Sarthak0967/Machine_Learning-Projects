import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Load the dataset
file_path = r"C:\Users\sarth\Downloads\StudentPerformanceFactors.csv"
data = pd.read_csv(file_path)

# Display basic information about the dataset
print(data.info())
print(data.describe())

# Check for missing values 
# This gives the totalsum of all the missing values in a attributes in the dataset.
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

# Train Linear Regression Model
model = Ridge(alpha=1.0)  # Ridge helps with multicollinearity
model.fit(X_train, y_train)

# Make Predictions
y_pred = model.predict(X_test)

print(y_pred) 

# Evaluate the Model
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

# Print Evaluation Metrics
print(f'Mean Absolute Error: {mae:.2f}')
print(f'Mean Squared Error: {mse:.2f}')
print(f'R² Score: {r2:.4f}')




# Plot the Linear Regression Line in Scatter Plot
plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred, color='blue', edgecolor='k', alpha=0.7)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], color='red', linewidth=2)
plt.xlabel('Actual Exam Scores')
plt.ylabel('Predicted Exam Scores')
plt.title('Actual vs Predicted Exam Scores')
plt.show()