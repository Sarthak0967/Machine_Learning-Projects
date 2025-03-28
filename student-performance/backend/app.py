from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://flaskuser:yourpassword@localhost/student_performance'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Load models
model = joblib.load("gb_model.pkl") if os.path.exists("gb_model.pkl") else None
scaler = joblib.load("scaler.pkl") if os.path.exists("scaler.pkl") else None
encoder = joblib.load("encoder.pkl") if os.path.exists("encoder.pkl") else None

# Models
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)

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

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(email=data['email'], password=hashed_password, role=data['role'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify({'token': access_token})
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    try:
        data = request.get_json()
        required_fields = [
            'hours_studied', 'attendance', 'previous_scores', 'tutoring_sessions',
            'sleep_hours', 'physical_activity', 'parental_involvement', 'access_to_resources',
            'motivation_level', 'family_income', 'teacher_quality', 'peer_influence',
            'parental_education_level', 'distance_from_home'
        ]
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Convert to numpy array in correct order
        features = np.array([[data[field] for field in required_fields]])
        
        # Scale numerical features (first 6)
        features[:, :6] = scaler.transform(features[:, :6])
        
        # Predict
        predicted_score = model.predict(features)[0]
        return jsonify({'predicted_exam_score': predicted_score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/performance')
@jwt_required()
def get_performance():
    return jsonify({
        "labels": ["Week 1", "Week 2", "Week 3"],
        "values": [85, 90, 88]
    })


if __name__ == '__main__':
    app.run(debug=True)