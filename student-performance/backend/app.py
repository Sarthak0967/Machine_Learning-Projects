from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import joblib
import numpy as np

app = Flask(__name__)

# MySQL Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://flaskuser:yourpassword@localhost/student_performance'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Load trained models and encoders
model = joblib.load("gb_model.pkl")
scaler = joblib.load("scaler.pkl")
encoder = joblib.load("encoder.pkl")

# User Model
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student' or 'teacher'

# Student Performance Model
class StudentPerformance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hours_studied = db.Column(db.Float, nullable=False)
    attendance = db.Column(db.Float, nullable=False)
    previous_scores = db.Column(db.Float, nullable=False)
    tutoring_sessions = db.Column(db.Integer, nullable=False)
    sleep_hours = db.Column(db.Float, nullable=False)
    physical_activity = db.Column(db.Float, nullable=False)
    parental_involvement = db.Column(db.Integer, nullable=False)
    access_to_resources = db.Column(db.Integer, nullable=False)
    motivation_level = db.Column(db.Integer, nullable=False)
    family_income = db.Column(db.Integer, nullable=False)
    teacher_quality = db.Column(db.Integer, nullable=False)
    peer_influence = db.Column(db.Integer, nullable=False)
    parental_education_level = db.Column(db.Integer, nullable=False)
    distance_from_home = db.Column(db.Integer, nullable=False)
    exam_score = db.Column(db.Float, nullable=True)

# Create Database Tables
with app.app_context():
    db.create_all()

# Register Route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(email=data['email'], password=hashed_password, role=data['role'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'})

# Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify({'token': access_token})
    return jsonify({'message': 'Invalid credentials'}), 401

# Student Data Submission and Prediction
@app.route('/student/data', methods=['POST'])
@jwt_required()
def submit_data():
    current_user = get_jwt_identity()
    if current_user['role'] != 'student':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    student_data = StudentPerformance(
        student_id=current_user['id'],
        hours_studied=data['hours_studied'],
        attendance=data['attendance'],
        previous_scores=data['previous_scores'],
        tutoring_sessions=data['tutoring_sessions'],
        sleep_hours=data['sleep_hours'],
        physical_activity=data['physical_activity'],
        parental_involvement=data['parental_involvement'],
        access_to_resources=data['access_to_resources'],
        motivation_level=data['motivation_level'],
        family_income=data['family_income'],
        teacher_quality=data['teacher_quality'],
        peer_influence=data['peer_influence'],
        parental_education_level=data['parental_education_level'],
        distance_from_home=data['distance_from_home']
    )
    db.session.add(student_data)
    db.session.commit()
    
    # Prepare data for prediction
    features = np.array([[
        data['hours_studied'], data['attendance'], data['previous_scores'],
        data['tutoring_sessions'], data['sleep_hours'], data['physical_activity'],
        data['parental_involvement'], data['access_to_resources'], data['motivation_level'],
        data['family_income'], data['teacher_quality'], data['peer_influence'],
        data['parental_education_level'], data['distance_from_home']
    ]])
    
    # Scale numerical features
    features[:, :6] = scaler.transform(features[:, :6])
    
    # Predict exam score
    predicted_score = model.predict(features)[0]
    student_data.exam_score = predicted_score
    db.session.commit()
    
    return jsonify({'message': 'Data submitted successfully', 'predicted_exam_score': predicted_score})

# Teacher Update Data
@app.route('/teacher/update/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student_data(student_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'teacher':
        return jsonify({'message': 'Unauthorized'}), 403
    
    student = StudentPerformance.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    data = request.get_json()
    for key, value in data.items():
        if hasattr(student, key):
            setattr(student, key, value)
    db.session.commit()
    return jsonify({'message': 'Student data updated successfully'})

if __name__ == '__main__':
    app.run(debug=True)
