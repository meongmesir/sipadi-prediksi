from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24
    MODEL_PATH: str = "ml_models/xgboost.joblib"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
