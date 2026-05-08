from flask import Flask, request, jsonify, send_from_directory
import pickle
import numpy as np
import pandas as pd
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

app = Flask(__name__)
test_history = []

# Load Industrial Assets
with open(os.path.join(BASE_DIR, 'model.pkl'), 'rb') as f:
    model = pickle.load(f)
with open(os.path.join(BASE_DIR, 'scaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

ADULTERANTS = {0: "Pure Milk", 1: "Water Dilution", 2: "Detergent/Chemical", 3: "Urea/Synthetic", 4: "Sugar/Salt"}

RECOMMENDATIONS = {
    0: "Quality Grade A. Milk is safe for industrial processing and consumption.",
    1: "Significant dilution detected. Check supply chain for illegal water mixing.",
    2: "Chemical contamination alert! Toxic detergent or soap detected. Unsafe for consumption.",
    3: "Urea detected. Suspected synthetic milk fabrication. Reject batch immediately.",
    4: "Abnormal density detected. Potential sugar/salt mixing to artificially inflate SNF values."
}

def get_scientific_status(purity):
    if purity >= 80: return "Pure Milk", "Low Risk", "safe"
    if purity >= 60: return "Slightly Suspicious", "Moderate Risk", "adulterated"
    if purity >= 30: return "Moderately Adulterated", "High Risk", "adulterated"
    return "Highly Adulterated", "Critical Risk (Toxic)", "toxic"

@app.route('/')
def login_page(): return send_from_directory(FRONTEND_DIR, 'login.html')
@app.route('/home')
def home_page(): return send_from_directory(FRONTEND_DIR, 'home.html')
@app.route('/detect')
def detect_page(): return send_from_directory(FRONTEND_DIR, 'detect.html')
@app.route('/dashboard')
def dashboard_page(): return send_from_directory(FRONTEND_DIR, 'dashboard.html')
@app.route('/analytics')
def analytics_page(): return send_from_directory(FRONTEND_DIR, 'analytics.html')
@app.route('/about')
def about_page(): return send_from_directory(FRONTEND_DIR, 'about.html')
@app.route('/contact')
def contact_page(): return send_from_directory(FRONTEND_DIR, 'contact.html')

@app.route('/style.css')
def serve_css(): return send_from_directory(FRONTEND_DIR, 'style.css')
@app.route('/script.js')
def serve_js(): return send_from_directory(FRONTEND_DIR, 'script.js')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        params = ['ph', 'fat', 'density', 'lactometer', 'conductivity', 'temp', 'snf']
        
        features = []
        for p in params:
            val = data.get(p, 0)
            try:
                features.append(float(val) if val != "" else 0.0)
            except:
                features.append(0.0)

        # 1. Scientific Rule-Based Weighted Scoring (40% Weight)
        rule_score = 0
        if not (6.5 <= features[0] <= 6.8): rule_score += 20
        if features[1] < 3.0: rule_score += 20
        if features[2] < 1.026: rule_score += 20
        if features[4] > 6.0: rule_score += 20
        if features[3] < 26: rule_score += 20
        
        rule_based_adulteration = min(rule_score, 100)

        # 2. Industrial ML Prediction (60% Weight)
        scaled = scaler.transform([features])
        probs = model.predict_proba(scaled)[0]
        pred_class = int(model.predict(scaled)[0])
        
        ml_adulteration = (1 - float(probs[0])) * 100
        
        # 3. Hybrid Calculation
        final_adulteration = (rule_based_adulteration * 0.4) + (ml_adulteration * 0.6)
        purity = round(max(0, min(100, 100 - final_adulteration)), 2)

        # 4. Result Synthesis
        status, risk, css_class = get_scientific_status(purity)
        
        result = {
            "adulterant": ADULTERANTS[pred_class] if purity < 80 else "Pure Milk",
            "status": status,
            "risk": risk,
            "purity": purity,
            "adulteration_pct": round(100 - purity, 2),
            "confidence": round(float(np.max(probs)) * 100, 2),
            "recommendation": RECOMMENDATIONS[pred_class],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        test_history.append(result)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/history')
def get_history(): return jsonify(test_history)

@app.route('/api/analytics')
def get_analytics():
    try:
        df = pd.read_csv(os.path.join(BASE_DIR, 'dataset.csv'))
        return jsonify({
            "labels": list(ADULTERANTS.values()),
            "counts": df['target'].value_counts().sort_index().tolist(),
            "ph_avg": df.groupby('target')['ph'].mean().round(2).tolist(),
            "fat_avg": df.groupby('target')['fat'].mean().round(2).tolist()
        })
    except: return jsonify({"error": "No data available"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5002)
