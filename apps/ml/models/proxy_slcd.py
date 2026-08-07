import numpy as np

class Proxy_SLCD:
    def __init__(self):
        pass
        
    def adjust_risk(self, embedding, ses_proxy):
        """
        Selective Labels Causal Debiasing
        Adjusts risk for marginalized populations (ses_proxy=0) to account for under-testing.
        """
        base_risk = embedding[0] * 0.1 + embedding[1] * 0.2
        
        # If marginalized, they were likely under-tested, meaning their true risk is higher
        # than what the naive labels suggest.
        if ses_proxy == 0:
            adjusted_risk = base_risk * 1.5  # causal upward adjustment
        else:
            adjusted_risk = base_risk * 1.0
            
        # Sigmoid bound
        return 1 / (1 + np.exp(-adjusted_risk))
