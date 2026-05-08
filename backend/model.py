import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle
import os

def generate_ieee_dataset(samples=5000):
    np.random.seed(42)
    data = []
    
    # Categories:
    # 0: Pure Milk (Standards: pH 6.6, Fat 4.5, Density 1.030, SNF 8.7, Lactometer 29)
    # 1: Water Adulteration
    # 2: Detergent/Soap
    # 3: Urea/Chemicals
    # 4: Sugar/Salt
    
    for _ in range(samples):
        target = np.random.randint(0, 5)
        
        # Base: Normal Dairy Range
        ph = np.random.uniform(6.5, 6.8)
        fat = np.random.uniform(3.0, 6.0)
        density = np.random.uniform(1.026, 1.032)
        lactometer = np.random.uniform(26, 32)
        conductivity = np.random.uniform(4.0, 6.0)
        temp = np.random.uniform(25, 37)
        snf = np.random.uniform(8.5, 9.0)
        
        if target == 1: # Water (Lower Fat, Lower Density, Lower SNF)
            fat = np.random.uniform(1.0, 2.9)
            density = np.random.uniform(1.018, 1.025)
            snf = np.random.uniform(5.0, 8.4)
            lactometer = np.random.uniform(18, 25)
        elif target == 2: # Detergent (High pH, High Conductivity)
            ph = np.random.uniform(8.0, 11.0)
            conductivity = np.random.uniform(8.0, 15.0)
        elif target == 3: # Urea (Abnormal Density, High pH)
            ph = np.random.uniform(7.5, 9.5)
            density = np.random.uniform(1.033, 1.040)
        elif target == 4: # Sugar/Salt (High Density, High Conductivity)
            density = np.random.uniform(1.035, 1.045)
            conductivity = np.random.uniform(7.0, 12.0)
            lactometer = np.random.uniform(33, 40)

        data.append([ph, fat, density, lactometer, conductivity, temp, snf, target])

    columns = ['ph', 'fat', 'density', 'lactometer', 'conductivity', 'temp', 'snf', 'target']
    return pd.DataFrame(data, columns=columns)

def train_industrial_model():
    print("Training S-Grade Industrial ML Model...")
    df = generate_ieee_dataset()
    
    X = df.drop('target', axis=1)
    y = df['target']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    # We use Random Forest for industrial precision
    model = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42)
    model.fit(X_train, y_train)
    
    acc = model.score(X_test, y_test)
    print(f"Industrial Precision: {acc*100:.2f}%")
    
    # Save artifacts
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, 'model.pkl'), 'wb') as f:
        pickle.dump(model, f)
    with open(os.path.join(base_dir, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
    df.to_csv(os.path.join(base_dir, 'dataset.csv'), index=False)
    print("Industrial Intelligence Assets saved successfully.")

if __name__ == "__main__":
    train_industrial_model()
