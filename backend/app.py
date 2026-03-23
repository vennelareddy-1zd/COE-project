import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import json
import requests

app = Flask(__name__)

# Configure CORS - allow all origins in production
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
def download_file(url, filename):
    if not os.path.exists(filename):
        print(f"Downloading {filename}...")
        r = requests.get(url)
        with open(filename, "wb") as f:
            f.write(r.content)

# URLs (replace with your links)
MODEL_URL = "YOUR_MODEL_LINK"
VECTORIZER_URL = "YOUR_VECTORIZER_LINK"

download_file(MODEL_URL, "model.pkl")
download_file(VECTORIZER_URL, "vectorizer.pkl")

# Load model and vectorizer
try:
    model = joblib.load("model.pkl")
    vectorizer = joblib.load("vectorizer.pkl")
    print("Model and vectorizer loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# API Routes
@app.route("/api/")
def api_home():
    return jsonify({
        "status": "running",
        "service": "Financial Complaint Classifier API",
        "version": "1.0.0"
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data or "complaint" not in data:
            return jsonify({"error": "Missing 'complaint' field"}), 400
        
        complaint = data["complaint"]
        if not complaint or len(complaint.strip()) < 10:
            return jsonify({"error": "Complaint must be at least 10 characters"}), 400

        text_vec = vectorizer.transform([complaint])
        prediction = model.predict(text_vec)[0]
        prob = model.predict_proba(text_vec).max()

        return jsonify({
            "category": prediction,
            "confidence": float(prob),
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/metrics")
def metrics():
    try:
        with open("metrics.json") as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Serve React frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join("static", path)):
        return send_from_directory("static", path)
    return send_from_directory("static", "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
