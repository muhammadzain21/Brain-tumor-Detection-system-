from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import imutils
from keras.models import load_model
from keras.applications.vgg16 import preprocess_input
import base64
import os

app = Flask(__name__)
CORS(app)

# Load model once at startup
MODEL_PATH = r'D:\Nova Brain Tumor Detector\backend\model\2026-06-07_VGG_model.h5'
model = load_model(MODEL_PATH)
IMG_SIZE = (224, 224)

def crop_brain(img):
    """Crop brain region from MRI image"""
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.threshold(gray, 45, 255, cv2.THRESH_BINARY)[1]
    thresh = cv2.erode(thresh, None, iterations=2)
    thresh = cv2.dilate(thresh, None, iterations=2)
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    if len(cnts) == 0:
        return img
    c = max(cnts, key=cv2.contourArea)
    extLeft  = tuple(c[c[:, :, 0].argmin()][0])
    extRight = tuple(c[c[:, :, 0].argmax()][0])
    extTop   = tuple(c[c[:, :, 1].argmin()][0])
    extBot   = tuple(c[c[:, :, 1].argmax()][0])
    cropped  = img[extTop[1]:extBot[1], extLeft[0]:extRight[0]].copy()
    if cropped.size == 0:
        return img
    return cropped

def preprocess_image(img):
    """Full preprocessing pipeline matching training"""
    cropped = crop_brain(img)
    resized = cv2.resize(cropped, IMG_SIZE, interpolation=cv2.INTER_CUBIC)
    preprocessed = preprocess_input(resized)
    return np.expand_dims(preprocessed, axis=0)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    img_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    if img is None:
        return jsonify({'error': 'Could not read image'}), 400

    # Preprocess
    img_prep = preprocess_image(img)

    # Predict
    prediction = float(model.predict(img_prep)[0][0])
    predicted_class = 1 if prediction > 0.5 else 0
    confidence = prediction if predicted_class == 1 else 1 - prediction

    # Encode cropped image to send back
    cropped = crop_brain(img)
    cropped_bgr = cv2.cvtColor(cropped, cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.jpg', cropped_bgr)
    cropped_b64 = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        'predicted_class': predicted_class,
        'label': 'TUMOR DETECTED' if predicted_class == 1 else 'NO TUMOR',
        'confidence': round(confidence * 100, 2),
        'cropped_image': cropped_b64
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)