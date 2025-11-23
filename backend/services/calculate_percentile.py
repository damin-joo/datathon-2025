import pandas as pd
import numpy as np

EXISTING_DATA_PATH = "../data/raw_data.csv"

def get_raw_data () -> list[int]:
    raw_datas_df = pd.read_csv(EXISTING_DATA_PATH)
    raw_datas = raw_datas_df["VALUE"].tolist()
    print(raw_datas)

    return raw_datas

def percentile_of_value(importingData: int, raw_data: list[int]) -> float:
    """
    Calculate the percentile of a single integer within a list of numbers.

    Args:
        importingData (int): The value to calculate percentile for.
        raw_data (list of int): The list of raw numbers.

    Returns:
        float: Percentile rank (0-100) of importingData within raw_data.
    """
    raw_array = np.array(raw_data)
    # Count values less than importingData
    count_below = np.sum(raw_array < importingData)
    count_equal = np.sum(raw_array == importingData)

    # Percentile rank using the "rank" method (include half of ties)
    percentile = (count_below + 0.5 * count_equal) / len(raw_array) * 100
    return percentile


def main(value:int):
    df_with_percentile = get_raw_data()
    percentile = percentile_of_value(value, df_with_percentile)
    print(percentile)

if __name__ == "__main__":
    main()
