from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd


app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:password123@localhost/student_performance'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'supersecretkey'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Load ML model and scaler
model = joblib.load("gb_model.pkl")
scaler = joblib.load("scaler.pkl")
encoder = joblib.load("encoder.pkl")

# Teacher model
class Teacher(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# Student model
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    hours_studied = db.Column(db.Float, nullable=False)
    attendance = db.Column(db.Float, nullable=False)
    sleep_hours = db.Column(db.Float, nullable=False)
    previous_scores = db.Column(db.Float, nullable=False)
    motivation_level = db.Column(db.String(20), nullable=False)  # Changed to String
    teacher_quality = db.Column(db.String(20), nullable=False)  # Changed to String
    peer_influence = db.Column(db.String(20), nullable=False)  # Changed to String
    parental_education_level = db.Column(db.String(20), nullable=False)  # Changed to String
    tutoring_sessions = db.Column(db.Float, nullable=False)
    physical_activity = db.Column(db.Float, nullable=False)
    parental_involvement = db.Column(db.String(20), nullable=False)  # Changed to String
    access_to_resources = db.Column(db.String(20), nullable=False)  # Changed to String
    family_income = db.Column(db.String(20), nullable=False)  # Changed to String
    distance_from_home = db.Column(db.String(20), nullable=False)  # Changed to String
    predicted_score = db.Column(db.Float, nullable=True)

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

# Route for teacher signup
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    teacher = Teacher(email=data['email'], password=hashed_password)
    db.session.add(teacher)
    db.session.commit()
    return jsonify({"message": "Teacher registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    teacher = Teacher.query.filter_by(email=data.get('email')).first()

    if teacher and bcrypt.check_password_hash(teacher.password, data.get('password')):
        access_token = create_access_token(identity=teacher.email)
        return jsonify(access_token=access_token)

    return jsonify({"message": "Invalid credentials"}), 401

# Route for prediction
@app.route('/predict', methods=['POST'])
@jwt_required()


def predict():
    import matplotlib.pyplot as plt
    import io
    import base64
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
        input_data["Improvement_Rate"] = (input_data["Previous_Scores"] / (input_data['Hours_Studied']+1))  # Likely needs fixing
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
        prediction = model.predict(input_data)[0]

        # --- 🔽 GRAPH GENERATION STARTS HERE ---
        # Fetch all existing predicted scores from DB
        existing_scores = [s.predicted_score for s in Student.query.with_entities(Student.predicted_score).all() if s.predicted_score is not None]

        # Add current prediction
        all_scores = existing_scores + [prediction]

        # # Create histogram
        # plt.figure(figsize=(10, 5))
        # plt.hist(existing_scores, bins=10, alpha=0.7, label="Existing Predictions", color="skyblue", edgecolor='black')
        # plt.axvline(prediction, color='red', linestyle='dashed', linewidth=2, label=f"Current Prediction: {round(prediction, 2)}")
        # plt.title("Distribution of Predicted Scores")
        # plt.xlabel("Score")
        # plt.ylabel("Number of Students")
        # plt.legend()

        # # Save plot to buffer
        # img_buf = io.BytesIO()
        # plt.savefig(img_buf, format='png')
        # plt.close()
        # img_buf.seek(0)

        # # Encode as base64
        # img_base64 = base64.b64encode(img_buf.getvalue()).decode('utf-8')
        
        # --- 🔽 SPIDER GRAPH GENERATION STARTS HERE ---
        # Only numerical + derived features
        radar_features = numerical_features + ["Study_Efficiency", "Improvement_Rate", "Tutoring_Effect"]

        # Values to plot
        values = input_data.iloc[0][radar_features].tolist()

        # Number of variables
        num_vars = len(radar_features)

        # Compute angle for each axis
        angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()

        # Repeat first value to close the plot
        values += values[:1]
        angles += angles[:1]

        # Create radar chart
        fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
        ax.plot(angles, values, color='red', linewidth=2)
        ax.fill(angles, values, color='red', alpha=0.25)

        # Add labels
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(radar_features, fontsize=9)
        ax.set_yticklabels([])  # Hide radial labels
        ax.set_title("Numerical Feature Profile", size=14, y=1.08)

        # Save to buffer
        radar_buf = io.BytesIO()
        plt.savefig(radar_buf, format='png')
        plt.close()
        radar_buf.seek(0)

        # Encode to base64
        radar_img_base64 = base64.b64encode(radar_buf.getvalue()).decode('utf-8')
        # --- 🔼 SPIDER GRAPH GENERATION ENDS HERE ---


        return jsonify({
            'predicted_score': prediction,
            'prediction_graph': f"data:image/png;base64,{radar_img_base64}"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500




# Route to add a new student
@app.route('/add_student', methods=['POST'])
@jwt_required()
def add_student():
    try:
        data = request.get_json()

        # Required fields (update data types to match the model)
        required_fields = {
            "name": str,  # include name here for validation
            "hours_studied": float, "attendance": float, "sleep_hours": float,
            "previous_scores": float, "tutoring_sessions": float, "physical_activity": float,
            "motivation_level": str, "teacher_quality": str, "peer_influence": str,
            "parental_education_level": str, "parental_involvement": str,
            "access_to_resources": str, "family_income": str, "distance_from_home": str
        }

        # Validate and convert required fields
        for field, field_type in required_fields.items():
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
            try:
                data[field] = field_type(data[field])
            except ValueError:
                return jsonify({"error": f"Invalid data type for {field}"}), 400

        # Prepare input for prediction
        input_dict = {
            "Hours_Studied": data["hours_studied"],
            "Attendance": data["attendance"],
            "Sleep_Hours": data["sleep_hours"],
            "Previous_Scores": data["previous_scores"],
            "Motivation_Level": data["motivation_level"],
            "Teacher_Quality": data["teacher_quality"],
            "Peer_Influence": data["peer_influence"],
            "Parental_Education_Level": data["parental_education_level"],
            "Tutoring_Sessions": data["tutoring_sessions"],
            "Physical_Activity": data["physical_activity"],
            "Parental_Involvement": data["parental_involvement"],
            "Access_to_Resources": data["access_to_resources"],
            "Family_Income": data["family_income"],
            "Distance_from_Home": data["distance_from_home"]
        }

        # Derived features
        input_dict["Study_Efficiency"] = input_dict["Hours_Studied"] / (input_dict["Attendance"] + 1)
        input_dict["Improvement_Rate"] = input_dict["Previous_Scores"] / (input_dict["Hours_Studied"]+1) # could be 0 unless you define better logic
        input_dict["Tutoring_Effect"] = input_dict["Tutoring_Sessions"] / (input_dict["Hours_Studied"] + 1)

        # Encode categorical values
        for feature, valid_values in categorical_mappings.items():
            if input_dict[feature] not in valid_values:
                return jsonify({"error": f"Invalid value '{input_dict[feature]}' for {feature}. Must be one of {valid_values}"}), 400
            input_dict[feature] = categorical_mappings[feature].index(input_dict[feature])

        # Convert to DataFrame
        input_df = pd.DataFrame([input_dict])

        # Scale numerical + derived features
        numerical_features_with_derived = numerical_features + ["Study_Efficiency", "Improvement_Rate", "Tutoring_Effect"]
        input_df[numerical_features_with_derived] = scaler.transform(input_df[numerical_features_with_derived])

        # Order columns
        input_df = input_df[feature_order]

        # Predict
        predicted_score = model.predict(input_df)[0]

        # Save student with prediction
        student = Student(
            name=data["name"],
            hours_studied=data["hours_studied"],
            attendance=data["attendance"],
            sleep_hours=data["sleep_hours"],
            previous_scores=data["previous_scores"],
            motivation_level=data["motivation_level"],
            teacher_quality=data["teacher_quality"],
            peer_influence=data["peer_influence"],
            parental_education_level=data["parental_education_level"],
            tutoring_sessions=data["tutoring_sessions"],
            physical_activity=data["physical_activity"],
            parental_involvement=data["parental_involvement"],
            access_to_resources=data["access_to_resources"],
            family_income=data["family_income"],
            distance_from_home=data["distance_from_home"],
            predicted_score=predicted_score
        )

        db.session.add(student)
        db.session.commit()

        return jsonify({
            "message": "Student added and prediction saved successfully",
            "id": student.id,
            "predicted_score": predicted_score
        }), 201

    except Exception as e:
        return jsonify({"error": "Failed to process request", "details": str(e)}), 500


# Route to fetch student details
@app.route('/student', methods=['GET'])
@jwt_required()
def get_student():
    student_id = request.args.get('id')
    student_name = request.args.get('name')

    if student_id:
        student = Student.query.get(student_id)
    elif student_name:
        student = Student.query.filter_by(name=student_name).first()
    else:
        return jsonify({"message": "Please provide either student ID or name"}), 400

    if not student:
        return jsonify({"message": "Student not found"}), 404

    return jsonify({
        "id": student.id,
        "name": student.name,
        "hours_studied": student.hours_studied,
        "attendance": student.attendance,
        "sleep_hours": student.sleep_hours,
        "previous_scores": student.previous_scores,
        "motivation_level": student.motivation_level,
        "teacher_quality": student.teacher_quality,
        "peer_influence": student.peer_influence,
        "parental_education_level": student.parental_education_level,
        "tutoring_sessions": student.tutoring_sessions,
        "physical_activity": student.physical_activity,
        "parental_involvement": student.parental_involvement,
        "access_to_resources": student.access_to_resources,
        "family_income": student.family_income,
        "distance_from_home": student.distance_from_home,
        "predicted_score": student.predicted_score
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
