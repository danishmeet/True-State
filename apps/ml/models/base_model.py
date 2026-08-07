import numpy as np

class BaseModel:
    def __init__(self):
        self.weights = None
        
    def fit(self, df):
        # Naive approach: try to predict 'observed_outcome' based on age, ses, and observation_freq
        # Fails because it learns that observation_freq is highly correlated with being sick
        # and it ignores the fact that SES causes missing labels.
        print("Training Base Model (Biased)...")
        # Mock weights for demo
        self.weights = {"age": 0.01, "ses": -0.5, "obs_freq": 1.2}
        
    def predict(self, features):
        """
        features: dict with age, ses, obs_freq
        """
        # Linear combination
        score = (features.get('age', 50) * self.weights['age'] + 
                 features.get('ses', 1) * self.weights['ses'] + 
                 features.get('obs_freq', 1) * self.weights['obs_freq'])
                 
        # sigmoid
        prob = 1 / (1 + np.exp(-score))
        return prob
