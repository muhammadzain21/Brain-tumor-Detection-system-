# Brain Tumor Detection System

A deep learning-powered web application that detects brain tumors from MRI scans using a VGG16 transfer learning model. The system provides real-time predictions with a modern, intuitive user interface.

## Overview

This project leverages computer vision and deep learning to assist in the early detection of brain tumors. It uses a fine-tuned VGG16 convolutional neural network trained on a dataset of brain MRI images to classify scans as either containing a tumor or being tumor-free.

### Key Features

- **VGG16 Transfer Learning Model** — Pre-trained on ImageNet, fine-tuned for brain MRI classification
- **Image Preprocessing Pipeline** — Automatic brain region cropping using contour detection
- **Real-time Inference** — Upload an MRI scan and get instant predictions
- **Confidence Scoring** — Each prediction includes a confidence percentage
- **Modern UI** — Sleek, dark-themed interface with drag-and-drop upload
- **REST API** — Flask backend with CORS support for seamless frontend integration

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Deep Learning | TensorFlow / Keras (VGG16) |
| Backend | Flask, Python |
| Frontend | React.js |
| Image Processing | OpenCV, imutils |
| Model Architecture | VGG16 (Transfer Learning) |

## Project Structure

```
Brain-Tumor-Detection-System/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── model/
│       └── vgg_model.h5    # Trained VGG16 model
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   └── index.js        # React entry point
│   └── package.json
└── dataset/
    ├── TRAIN_CROP/         # Training images
    ├── VAL_CROP/           # Validation images
    └── TEST_CROP/          # Test images
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The Flask server will start on `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app will start on `http://localhost:3000`.

### Usage

1. Start the backend Flask server
2. Start the frontend React app
3. Open `http://localhost:3000` in your browser
4. Upload or drag-and-drop an MRI scan image
5. Click **Run Analysis** to get the prediction

## Model Details

- **Architecture:** VGG16 (pre-trained on ImageNet)
- **Transfer Learning:** Custom dense layers added on top of VGG16 base
- **Input Size:** 224 x 224 pixels
- **Preprocessing:** Brain region cropping → Resize → VGG16 preprocessing
- **Training Data:** Brain MRI images (cropped and augmented)
- **Validation Accuracy:** ~98%

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Upload an MRI image and get tumor detection result |
| `GET` | `/health` | Check server and model status |

### Example Response

```json
{
  "predicted_class": 1,
  "label": "TUMOR DETECTED",
  "confidence": 98.75,
  "cropped_image": "base64_encoded_cropped_image"
}
```

## License

This project is open-source and available under the MIT License.

## Acknowledgments

- [VGG16](https://keras.io/api/applications/vgg/) — Keras Applications
- [OpenCV](https://opencv.org/) — Computer vision library
- Dataset: Brain MRI images for tumor detection
