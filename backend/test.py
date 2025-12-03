# test_upload.py
import requests

url = "http://localhost:8000/files/upload"
files = {"file": open(r"test.webm", "rb")}
data = {"session_id": "SESSION123", "question_id": "g-1", "chunk_index": "0"}
r = requests.post(url, files=files, data=data)
print(r.status_code, r.text)
