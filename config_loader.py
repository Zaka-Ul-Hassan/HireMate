# config_loader.py

import json

def load_config():
    with open("config.json") as f:
        return json.load(f)
    
config = load_config()

def get_jwt_settings():
    return config["jwt"]
