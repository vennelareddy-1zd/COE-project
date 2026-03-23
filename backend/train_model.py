import pandas as pd
import joblib
import json

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix

# load dataset
data = pd.read_csv("cfpb_complaints_2019_to_2022.csv", low_memory=False)

data = data[['consumer_complaint_narrative','product']]
data = data.dropna()

# reduce dataset for faster training
data = data.sample(50000, random_state=42)

X = data['consumer_complaint_narrative']
y = data['product']

vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
X_vec = vectorizer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_vec, y, test_size=0.2, random_state=42
)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# evaluation
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
cm = confusion_matrix(y_test, y_pred).tolist()

metrics = {
    "accuracy": accuracy,
    "precision": precision,
    "recall": recall,
    "confusion_matrix": cm
}

with open("metrics.json","w") as f:
    json.dump(metrics,f)

joblib.dump(model,"model.pkl")
joblib.dump(vectorizer,"vectorizer.pkl")

print("Model trained successfully")