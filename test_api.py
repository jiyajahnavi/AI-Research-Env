import requests

url = "https://goblinasaddy-research-env.hf.space"

r = requests.post(f"{url}/reset", json={})

print("STATUS:", r.status_code)
print("RAW RESPONSE:", r.text)