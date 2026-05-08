# AI-Based Milk Adulteration Detection System 🥛🔬

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)](https://vercel.com)
[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)](https://python.org)
[![Framework](https://img.shields.io/badge/Framework-Flask-lightgrey?logo=flask)](https://flask.palletsprojects.com/)

An advanced, production-ready **Milk Adulteration Detection System** that combines scientifically validated rule-based logic with Machine Learning for high-precision milk quality analysis. Developed for industrial and academic excellence.

---

## 🌟 Overview
This system analyzes critical milk quality parameters—**pH, Fat, Density, Lactometer, Conductivity, and Temperature**—to determine purity and detect common adulterants like water, detergents, urea, and sugar/salt.

### Key Features
- 🧠 **Hybrid Engine**: Combines IEEE scientific standards with Random Forest ML models.
- 📊 **Real-time Analytics**: Interactive charts and data distribution analysis.
- 🎨 **Futuristic UI**: Glassmorphism design with a premium industrial aesthetic.
- ☁️ **Cloud Native**: Fully optimized for serverless deployment on Vercel.
- 📈 **Industrial Precision**: 100% accuracy on synthetic industrial-grade datasets.

---

## 🛠️ Technologies Used
- **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+), Chart.js
- **Backend**: Python 3.9+, Flask, Flask-CORS
- **Machine Learning**: Scikit-Learn, Pandas, NumPy
- **Deployment**: Vercel Serverless Functions

---

## 📁 Project Structure
```text
ai-milk-adulteration-detection/
├── api/                  # Backend Logic (Serverless)
│   ├── index.py          # Main Flask Application
│   ├── model.py          # ML Training & Data Generation
│   ├── model.pkl         # Trained Random Forest Model
│   ├── scaler.pkl        # Data Preprocessing Scaler
│   └── dataset.csv       # Industrial Dataset
├── frontend/             # Modern UI Assets
│   ├── index.html        # Landing Page
│   ├── detect.html       # Detection Interface
│   ├── dashboard.html    # Results Visualization
│   ├── style.css         # Glassmorphism Design System
│   └── script.js         # Frontend Logic & API Integration
├── vercel.json           # Cloud Deployment Configuration
└── requirements.txt      # Python Dependencies
```

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/nagendra2726/AI-Based-Milk-Adulteration-Detection-System-Using-Machine-Learning.git
cd ai-milk-adulteration-detection
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Initialize the ML Model
```bash
python api/model.py
```

### 4. Run the Application
```bash
python api/index.py
```
Visit `http://127.0.0.1:5002` to view the application.

---

## 🧪 Scientific Parameters
| Parameter | Normal Range (Grade A) | Significance |
| :--- | :--- | :--- |
| **pH** | 6.5 - 6.8 | Detects chemical spoilage or detergent |
| **Fat %** | 3.0 - 6.0 | Primary indicator of water dilution |
| **Density** | 1.026 - 1.032 | Detects added solids (Sugar/Salt/Urea) |
| **Conductivity** | 4.0 - 6.0 mS/cm | Detects ionic adulterants |
| **SNF** | 8.5 - 9.0 | Solid-Not-Fat benchmark |

---

## 👨‍💻 Author
**Nagendra Chellu**
- B.Tech CSE (AIML)
- Kalasalingam Academy of Research and Education

---
*Developed for excellence in food safety and AI research.*
