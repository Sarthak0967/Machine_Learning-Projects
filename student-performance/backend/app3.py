from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load the trained model, scaler, and encoder
model = joblib.load("gb_model.pkl")
scaler = joblib.load("scaler.pkl")
encoder = joblib.load("encoder.pkl")

# Define categorical feature mappings (from training data)
categorical_mappings = {
    "Parental_Involvement": ["Low", "Medium", "High"],
    "Access_to_Resources": ["Low", "Medium", "High"],
    "Motivation_Level": ["Low", "Medium", "High"],
    "Family_Income": ["Low", "Medium", "High"],
    "Teacher_Quality": ["Low", "Medium", "High"],
    "Peer_Influence": ["Negative", "Neutral", "Positive"],
    "Parental_Education_Level": ["High School", "College", "Post Graduate"],
    "Distance_from_Home": ["Near", "Moderate", "Far"]
}

# Define numerical features
numerical_features = [
    "Hours_Studied", "Attendance", "Sleep_Hours", "Previous_Scores", 
    "Tutoring_Sessions", "Physical_Activity"
]

# Define the correct feature order used during training
feature_order = [
    "Hours_Studied", "Attendance", "Parental_Involvement", "Access_to_Resources", 
    "Sleep_Hours", "Previous_Scores", "Motivation_Level", "Tutoring_Sessions", 
    "Family_Income", "Teacher_Quality", "Peer_Influence", "Physical_Activity", 
    "Parental_Education_Level", "Distance_from_Home", "Study_Efficiency", 
    "Improvement_Rate", "Tutoring_Effect"
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        data = request.get_json()

        # Validate all required features are present
        missing_features = [feature for feature in numerical_features + list(categorical_mappings.keys()) if feature not in data]
        if missing_features:
            return jsonify({"error": f"Missing features: {missing_features}"}), 400

        # Validate categorical values
        for feature, valid_values in categorical_mappings.items():
            if data[feature] not in valid_values:
                return jsonify({"error": f"Invalid value '{data[feature]}' for {feature}. Must be one of {valid_values}"}), 400

        # Convert input data to DataFrame
        input_data = pd.DataFrame([data])

        # Calculate derived features
        input_data["Study_Efficiency"] = input_data["Hours_Studied"] / (input_data["Attendance"] + 1)  # Avoid division by zero
        input_data["Improvement_Rate"] = input_data["Previous_Scores"] - input_data["Previous_Scores"]  # Likely needs fixing
        input_data["Tutoring_Effect"] = input_data["Tutoring_Sessions"] / (input_data["Hours_Studied"] + 1)

        # Encode categorical features using predefined mappings
        for feature in categorical_mappings:
            input_data[feature] = categorical_mappings[feature].index(data[feature])

        # Scale numerical features, including derived features
        numerical_features_with_derived = numerical_features + ["Study_Efficiency", "Improvement_Rate", "Tutoring_Effect"]
        input_data[numerical_features_with_derived] = scaler.transform(input_data[numerical_features_with_derived])

        # Ensure feature order matches training
        input_data = input_data[feature_order]

        # Make prediction
        prediction = model.predict(input_data)

        return jsonify({'predicted_score': prediction[0]})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
