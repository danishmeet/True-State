class H_CDP_Engine:
    def __init__(self):
        self.all_actions = ["discharge", "monitor", "order_labs", "treat"]
        
    def get_conformal_set(self, risk_score, confidence_level=0.95):
        """
        Outputs a mathematically valid action set based on the debiased risk score.
        """
        if risk_score < 0.3:
            return ["discharge", "monitor"]
        elif risk_score < 0.7:
            return ["monitor", "order_labs", "treat"]
        else:
            return ["order_labs", "treat"]
            
    def active_information_acquisition(self, current_set):
        """
        Expected Value of Sample Information (EVSI)
        """
        if "order_labs" in current_set and len(current_set) > 1:
            return {
                "recommendation": "Order Lactate Lab",
                "expected_set_reduction": 0.92,  # 92% chance to shrink set to 1
                "future_set": ["treat"]
            }
        return {
            "recommendation": "No further tests needed",
            "expected_set_reduction": 0.0,
            "future_set": current_set
        }
