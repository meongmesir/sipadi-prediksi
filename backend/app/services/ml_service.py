import os
import math
import warnings
from app.config import settings

try:
    import joblib
    import pandas as pd
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
    warnings.filterwarnings("ignore", message=".*serialized model.*older version.*")
    HAS_ML_DEPS = True
except ImportError:
    HAS_ML_DEPS = False

class MLService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        if not HAS_ML_DEPS:
            print("Warning: ML dependencies not installed. Using mock predictions.")
            self.model = None
            return

        model_path = settings.MODEL_PATH
        if not os.path.exists(model_path):
            print(f"Warning: Model not found at {model_path}. Using mock predictions.")
            self.model = None
            return
        
        try:
            self.model = joblib.load(model_path)
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None

    def predict(self, features: dict) -> float:
        if self.model is None or not HAS_ML_DEPS:
            # Fallback mock jika model belum di-copy atau dependensi kurang
            base = 4200.0
            if features.get('water_code') == 'A': base *= 1.1
            if features.get('n_total_kg_ha', 0) > 100: base *= 1.15
            return round(base, 1)

        # Siapkan DataFrame
        df = pd.DataFrame([{
            'latitude': features['latitude'],
            'longitude': features['longitude'],
            'elevation_m': features['elevation_m'],
            'sowing_doy': features['sowing_doy'],
            'n_total_kg_ha': features['n_total_kg_ha'],
            'plant_pop': features['plant_pop'],
            'cultivar_name': features['cultivar_name'],
            'water_code': features['water_code']
        }])
        
        prediction = self.model.predict(df)
        val = float(prediction[0])
        return round(max(val, 0.0), 1)

ml_service = MLService()
