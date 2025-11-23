import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

messages = pd.read_csv('..\\data\\decarbon_categories.csv', sep=',', names=["label", "message"])

messages['length'] = messages['message'].apply(len)

messages['length'] = messages['message'].apply(len)
messages.groupby('label').describe()

from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y,test_size=0.3,random_state=87)
