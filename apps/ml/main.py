from fastapi import FastAPI
from pydantic import BaseModel as PydanticBaseModel
import random
from fastapi.middleware.cors import CORSMiddleware

import sys
import os

# Ensure the models can be imported
sys.path.append(os.path.dirname(__file__))
from models.base_model import BaseModel as TrueStateBaseModel
from models.iv_opil import IV_OPIL_Encoder
from models.proxy_slcd import Proxy_SLCD
from models.h_cdp import H_CDP_Engine

app = FastAPI(title="TrueState ML Service Stubs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientRequest(PydanticBaseModel):
    patient_id: str
    age: int = 45
    ses: int = 1
    obs_freq: int = 2
    iv_weekend: bool = False

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/simulate")
def run_simulation(req: PatientRequest):
    features = {
        "age": req.age,
        "ses": req.ses,
        "obs_freq": req.obs_freq
    }
    
    # Base Model (Biased)
    base_model = TrueStateBaseModel()
    base_model.fit(None) # Mock fit
    base_risk = round(float(base_model.predict(features)), 2)
    
    # IV-OPIL (Debiased embedding)
    iv_encoder = IV_OPIL_Encoder()
    debiased_embedding = iv_encoder.debias_embedding(features, req.iv_weekend)
    
    # Proxy-SLCD (Selective Label Censorship Debiasing)
    slcd = Proxy_SLCD()
    truestate_risk = round(float(slcd.adjust_risk(debiased_embedding, req.ses)), 2)
    
    # H-CDP & AIA (Conformal Decision Prediction)
    h_cdp = H_CDP_Engine()
    conformal_set = h_cdp.get_conformal_set(truestate_risk)
    aia_results = h_cdp.active_information_acquisition(conformal_set)
    
    return {
        "patient_id": req.patient_id,
        "base_model": {
            "risk_score": base_risk,
            "status": "Underestimating risk due to observation bias." if req.ses == 0 else "Baseline."
        },
        "truestate_model": {
            "final_risk_score": truestate_risk,
            "debiased_embedding": debiased_embedding
        },
        "h_cdp": {
            "initial_action_set": conformal_set,
            "aia_recommendation": aia_results["recommendation"],
            "aia_expected_value": aia_results["expected_set_reduction"],
            "refined_action_set": aia_results["future_set"],
            "confidence_bound": 0.95
        }
    }
