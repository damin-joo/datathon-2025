import numpy as np
import pandas as pd

GOVERNMENT_BASED_MEDIAN_FILE = "..\\data\\1110022301-eng.csv"
TARGET_SIZE = 20

def main():
    median_df = get_gov_median_file_wanted_data()


def get_gov_median_file_wanted_data():
    try:
        df_gov_median_1 = pd.read_csv(GOVERNMENT_BASED_MEDIAN_FILE, header=12)
        df_gov_median = df_gov_median_1.iloc[:49]
        return df_gov_median
    except Exception as e:
        print(f"Failed to get the government-based median customer spending pattern data.")

def generate_random_data(target_median: float, size: int, spread: float = 10.0) -> pd.DataFrame:
    """
    Generates a random dataset of a specified size that has the target median,
    and returns it as a Pandas DataFrame.
    This function works by generating half the samples below the target median
    and half above it, ensuring the target value sits at the 50th percentile.

    Args:
        target_median: The desired median value for the generated dataset.
        size: The total number of data points to generate (the sample size).
        spread: Controls the range of values around the median (the data will
                roughly range from (M - spread) to (M + spread)).

    Returns:
        A Pandas DataFrame containing the randomly generated data in a column named 'Value'.
    """
    if size < 2:
        # A median is only meaningful for a set of numbers
        # Return a DataFrame with the target median repeated if size is too small
        data_list = [target_median] * size
        return pd.DataFrame({'Value': data_list})

    # 1. Determine the number of values needed above and below the median
    num_below = size // 2
    num_above = size // 2
    
    # If size is odd, the median must be one of the values, so we add a place for it later.
    
    # 2. Generate random values below the target median (M)
    # We use uniform distribution from (M - spread) to M.
    low_bound = target_median - spread
    if low_bound < 0:
        # Prevent negative values if the spread is too large for a small median
        low_bound = 0
        
    data_below = np.random.uniform(low=low_bound, high=target_median, size=num_below)

    # 3. Generate random values above the target median (M)
    # We use uniform distribution from M, up to (M + spread).
    high_bound = target_median + spread
    data_above = np.random.uniform(low=target_median, high=high_bound, size=num_above)

    # 4. Combine the three parts: data below, fixed median, and data above
    data_list = list(data_below) + list(data_above)

    # If the size is odd, the median must be one of the values, so we insert it.
    if size % 2 != 0:
        data_list.append(target_median)
        
    # 5. Convert to a NumPy array and shuffle to randomize the order
    dataset_array = np.array(data_list)
    np.random.shuffle(dataset_array)
    
    # 6. Convert the resulting array to a Pandas DataFrame
    dataset_df = pd.DataFrame({'Value': dataset_array})
    
    return dataset_df

# --- Example Usage ---
TARGET_MEDIAN = 75.0
SAMPLE_SIZE = 21  # Changed to an odd number (e.g., 21) to show that case
DATA_SPREAD = 25.0 # Spread remains the same

# Set a seed for reproducibility
random.seed(42)
np.random.seed(42)

# Generate and test the dataset
generated_df = generate_data_with_median(
    target_median=TARGET_MEDIAN,
    size=SAMPLE_SIZE,
    spread=DATA_SPREAD
)

# Print the results
print(f"Target Median: {TARGET_MEDIAN}")
print(f"Sample Size: {SAMPLE_SIZE}")
print("-" * 30)
print("Generated DataFrame Head:")
print(generated_df.head())
print("-" * 30)
print(f"Calculated Median (Pandas): {generated_df['Value'].median():.2f}")
print(f"Data Range: [{generated_df['Value'].min():.2f}, {generated_df['Value'].max():.2f}]")
print(f"Verification Check: {'SUCCESS' if generated_df['Value'].median() == TARGET_MEDIAN else 'FAIL'}")
    

if __name__ == "__main__":
    main()