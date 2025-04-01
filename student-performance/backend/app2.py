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
    try:
        # Get the data from the request
        data = request.get_json()

        # Extract features from the request data
        features = {
            'Hours_Studied': data['Hours_Studied'],
            'Attendance': data['Attendance'],
            'Sleep_Hours': data['Sleep_Hours'],
            'Previous_Scores': data['Previous_Scores'],
            'Tutoring_Sessions': data['Tutoring_Sessions'],
            'Physical_Activity': data['Physical_Activity'],
            'Parental_Involvement': data['Parental_Involvement'],
            'Access_to_Resources': data['Access_to_Resources'],
            'Motivation_Level': data['Motivation_Level'],
            'Family_Income': data['Family_Income'],
            'Teacher_Quality': data['Teacher_Quality'],
            'Peer_Influence': data['Peer_Influence'],
            'Parental_Education_Level': data['Parental_Education_Level'],
            'Distance_from_Home': data['Distance_from_Home']
        }

        # Convert to DataFrame for processing
        input_data = pd.DataFrame([features])

        # Create derived features
        input_data['Study_Efficiency'] = input_data['Hours_Studied'] / (input_data['Attendance'] + 1)  # Avoid division by zero
        input_data['Improvement_Rate'] = input_data['Previous_Scores'] - input_data['Previous_Scores']  # Assuming Exam_Score will be predicted
        input_data['Tutoring_Effect'] = input_data['Tutoring_Sessions'] / (input_data['Hours_Studied'] + 1)

        # Scale the numerical features using the pre-trained scaler
        numerical_features = ['Hours_Studied', 'Attendance', 'Sleep_Hours', 'Previous_Scores',
                              'Tutoring_Sessions', 'Physical_Activity', 'Study_Efficiency', 
                              'Improvement_Rate', 'Tutoring_Effect']

        input_data[numerical_features] = scaler.transform(input_data[numerical_features])

        # Encode categorical features using the pre-trained encoder with 'handle_unknown' set to 'ignore'
        categorical_features = ['Parental_Involvement', 'Access_to_Resources', 'Motivation_Level',
                                'Family_Income', 'Teacher_Quality', 'Peer_Influence',
                                'Parental_Education_Level', 'Distance_from_Home']

        for col in categorical_features:
            input_data[col] = encoder.transform(input_data[col].apply(lambda x: x if x in encoder.classes_ else 'Unknown'))

        # Predict using the model
        prediction = model.predict(input_data)

        # Return the prediction as a JSON response
        return jsonify({'predicted_exam_score': prediction[0]}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# Route to add a new student
@app.route('/add_student', methods=['POST'])
@jwt_required()
def add_student():
    try:
        data = request.get_json()

        # Required fields (update data types to match the model)
        required_fields = {
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
                data[field] = field_type(data[field])  # Convert to the correct type
            except ValueError:
                return jsonify({"error": f"Invalid data type for {field}"}), 400

        # Create the student record
        student = Student(
            name=data["name"],
            hours_studied=data["hours_studied"],
            attendance=data["attendance"],
            sleep_hours=data["sleep_hours"],
            previous_scores=data["previous_scores"],
            motivation_level=data["motivation_level"],  # Store as string
            teacher_quality=data["teacher_quality"],    # Store as string
            peer_influence=data["peer_influence"],      # Store as string
            parental_education_level=data["parental_education_level"],  # Store as string
            tutoring_sessions=data["tutoring_sessions"],
            physical_activity=data["physical_activity"],
            parental_involvement=data["parental_involvement"],  # Store as string
            access_to_resources=data["access_to_resources"],  # Store as string
            family_income=data["family_income"],              # Store as string
            distance_from_home=data["distance_from_home"],    # Store as string
            predicted_score=None
        )

        db.session.add(student)
        db.session.commit()
        return jsonify({"message": "Student added successfully", "id": student.id}), 201

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
