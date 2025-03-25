from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

# Load model and preprocessing objects
model = joblib.load("naive_bayes_model.pkl")
encoder = joblib.load("encoder.pkl")
scaler = joblib.load("scaler.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    # Convert input to DataFrame
    input_df = pd.DataFrame([data])

    # Define numerical and categorical features
    numerical_features = ["Hours_Studied", "Attendance", "Sleep_Hours", "Previous_Scores", "Tutoring_Sessions", "Physical_Activity"]
    categorical_features = ['Parental_Involvement', 'Access_to_Resources', 'Extracurricular_Activities',
                            'Motivation_Level', 'Internet_Access', 'Family_Income', 'Teacher_Quality',
                            'School_Type', 'Peer_Influence', 'Parental_Education_Level', 'Distance_from_Home',
                            'Gender']

    # One-Hot Encode categorical features
    encoded_features = encoder.transform(input_df[categorical_features])
    encoded_df = pd.DataFrame(encoded_features, columns=encoder.get_feature_names_out(categorical_features))

    # Combine numerical and encoded categorical features
    X_input = pd.concat([input_df[numerical_features], encoded_df], axis=1)

    # Scale numerical features
    X_input[numerical_features] = scaler.transform(X_input[numerical_features])

    # Make prediction
    predicted_score = model.predict(X_input)[0]

    return jsonify({"predicted_score": round(predicted_score, 2)})

if __name__ == "__main__":
    app.run(debug=True)
