import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

messages = pd.read_csv('..\\data\\decarbon_categories.csv', sep=',', names=["label", "message"])

messages['length'] = messages['message'].apply(len)

messages['length'] = messages['message'].apply(len)
messages.groupby('label').describe()