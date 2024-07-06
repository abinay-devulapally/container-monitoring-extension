import requests
import subprocess
import json

# Obtain the access token
result = subprocess.run(['az', 'account', 'get-access-token', '--resource', 'https://management.azure.com'], capture_output=True, text=True)
token = json.loads(result.stdout)['accessToken']

# Set your variables
subscription_id = "ea5f3610-efdf-492e-b705-642751c9cf58"
resource_group_name = "azstudent"
container_group_name = "<your_container_group_name>"

# List Container Instances
url = f"https://management.azure.com/subscriptions/{subscription_id}/resourceGroups/{resource_group_name}/providers/Microsoft.ContainerInstance/containerGroups?api-version=2023-04-01"
headers = {"Authorization": f"Bearer {token}"}

response = requests.get(url, headers=headers)
print(response.json())

# Get Container Instance Properties
url = f"https://management.azure.com/subscriptions/{subscription_id}/resourceGroups/{resource_group_name}/providers/Microsoft.ContainerInstance/containerGroups/{container_group_name}?api-version=2023-04-01"

response = requests.get(url, headers=headers)
print(response.json())
