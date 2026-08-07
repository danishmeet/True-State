import pandas as pd
import numpy as np
import os

def generate_data(num_samples=1000):
    np.random.seed(42)
    
    # Baseline demographics (X)
    # Socioeconomic status proxy: 0 = marginalized, 1 = privileged
    ses = np.random.binomial(1, 0.5, num_samples)
    age = np.random.normal(50, 15, num_samples).astype(int)
    
    # True clinical state (Z) - higher is sicker
    # Marginalized patients are slightly sicker on average
    true_severity = np.random.normal(loc=10 - 2 * ses, scale=3, size=num_samples)
    
    # Hospital operational instrument (IV)
    # 0 = weekday, 1 = weekend
    weekend = np.random.binomial(1, 0.3, num_samples)
    
    # OPIL Bias: Observation frequency (O)
    # Correlated with weekend vs weekday AND slightly with severity
    # If weekend, fewer observations.
    observation_freq = np.random.poisson(lam=np.maximum(1, true_severity - 3 * weekend))
    
    # Final outcome (Y): 1 = adverse event, 0 = stable
    prob_adverse = 1 / (1 + np.exp(-(true_severity - 10) / 2))
    outcome = np.random.binomial(1, prob_adverse)
    
    # SLCD Bias: Decision to test (Label availability)
    # Depends heavily on SES (unobserved confounding in naive models)
    # If SES=0, testing is less likely even if sick.
    prob_test = 1 / (1 + np.exp(-(true_severity * 0.5 + ses * 3 - 5)))
    is_tested = np.random.binomial(1, prob_test)
    
    # The observed label (only available if tested)
    observed_outcome = np.where(is_tested == 1, outcome, np.nan)
    
    df = pd.DataFrame({
        'patient_id': [f'P{i:04d}' for i in range(num_samples)],
        'age': age,
        'ses_proxy': ses,
        'weekend_admission': weekend,
        'true_severity': true_severity,
        'observation_freq': observation_freq,
        'is_tested': is_tested,
        'true_outcome': outcome,
        'observed_outcome': observed_outcome
    })
    
    return df

if __name__ == "__main__":
    os.makedirs('apps/ml/datasets', exist_ok=True)
    df = generate_data(5000)
    output_path = 'apps/ml/datasets/synthetic_cohort.csv'
    df.to_csv(output_path, index=False)
    print(f"Generated synthetic dataset with {len(df)} samples at {output_path}")
