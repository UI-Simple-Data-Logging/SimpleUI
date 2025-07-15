import requests
import json
import time
from datetime import datetime, timedelta

# TTN API Configuration
TTN_API_KEY = "NNSXS.R7RMZWRWFLPYNPHCF6WRGVBWH7MPEXYQW56Y7BY.NTQHICDM5BXTIXZ4SBAS5GOFPPGCO5LSOI36NWV7E6T7NKC3DEDA"
TTN_CONSOLE_URL = "https://nam1.cloud.thethings.network/api/v3"

# Headers for TTN API authentication
TTN_HEADERS = {
    "Authorization": f"Bearer {TTN_API_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def handle_ttn_response(response, endpoint_name):
    """Handle TTN API response format"""
    print(f"[{datetime.now()}] {endpoint_name} - Status Code: {response.status_code}")
    print(f"Request URL: {response.url}")
    
    if response.status_code == 200:
        try:
            response_data = response.json()
            print(f"SUCCESS: {endpoint_name}")
            return response_data
        except json.JSONDecodeError:
            print(f"ERROR: Invalid JSON response for {endpoint_name}")
            print(f"Response text: {response.text}")
            return None
    elif response.status_code == 403:
        print(f"FORBIDDEN: Check API key permissions for {endpoint_name}")
        print(f"Response text: {response.text}")
        return None
    elif response.status_code == 404:
        print(f"NOT FOUND: {endpoint_name}")
        print(f"Response text: {response.text}")
        return None
    else:
        print(f"HTTP ERROR {response.status_code} for {endpoint_name}")
        print(f"Response text: {response.text}")
        return None

def get_user_info():
    """Get current user information to verify API key"""
    try:
        url = f"{TTN_CONSOLE_URL}/auth_info"
        
        response = requests.get(url, headers=TTN_HEADERS)
        
        user_info = handle_ttn_response(response, "GET User Info")
        
        if user_info is not None:
            print(f"\n=== TTN User Info ===")
            print(json.dumps(user_info, indent=2))
            return user_info
        
        return None
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed for GET User Info: {e}")
        return None

def get_ttn_applications():
    """Get all TTN applications using different API endpoints"""
    endpoints_to_try = [
        f"{TTN_CONSOLE_URL}/applications",
        f"{TTN_CONSOLE_URL}/users/applications", 
        f"{TTN_CONSOLE_URL}/api/v3/applications"
    ]
    
    for url in endpoints_to_try:
        try:
            print(f"Trying endpoint: {url}")
            response = requests.get(url, headers=TTN_HEADERS)
            
            if response.status_code == 200:
                apps_data = response.json()
                print(f"SUCCESS: Found applications at {url}")
                
                if 'applications' in apps_data:
                    applications = apps_data['applications']
                    print(f"\n=== TTN Applications ===")
                    print(f"Found {len(applications)} application(s):")
                    for i, app in enumerate(applications, 1):
                        app_id = app.get('ids', {}).get('application_id', 'N/A')
                        app_name = app.get('name', 'N/A')
                        created_at = app.get('created_at', 'N/A')
                        print(f"  {i}. {app_name}")
                        print(f"     ID: {app_id}")
                        print(f"     Created: {created_at}")
                        print()
                    return applications
                else:
                    print("Response doesn't contain 'applications' field")
                    print(json.dumps(apps_data, indent=2))
                    return apps_data
            else:
                print(f"Failed: Status {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed for {url}: {e}")
    
    return None

def list_available_endpoints():
    """Try to discover available API endpoints"""
    print("\n=== Testing TTN API Endpoints ===")
    
    test_endpoints = [
        "/auth_info",
        "/applications",
        "/users",
        "/users/me",
        "/organizations",
        "/gateways"
    ]
    
    for endpoint in test_endpoints:
        try:
            url = f"{TTN_CONSOLE_URL}{endpoint}"
            response = requests.get(url, headers=TTN_HEADERS)
            
            status_text = "✓" if response.status_code == 200 else "✗"
            print(f"{status_text} {endpoint} - Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        print(f"   Keys: {list(data.keys())}")
                    elif isinstance(data, list):
                        print(f"   Array with {len(data)} items")
                except:
                    print(f"   Response length: {len(response.text)} chars")
            
        except requests.exceptions.RequestException as e:
            print(f"✗ {endpoint} - Error: {e}")

def test_webhook_data():
    """Test if we can get data from webhook/storage endpoints"""
    print("\n=== Testing Storage Endpoints ===")
    
    # Try different storage endpoints
    storage_endpoints = [
        "/applications",
        "/events",
        "/storage",
    ]
    
    for endpoint in storage_endpoints:
        try:
            url = f"{TTN_CONSOLE_URL}{endpoint}"
            response = requests.get(url, headers=TTN_HEADERS)
            
            print(f"Endpoint: {endpoint}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"Response: {json.dumps(data, indent=2)[:500]}...")
                except:
                    print(f"Response text: {response.text[:200]}...")
            else:
                print(f"Error: {response.text}")
            print("-" * 50)
            
        except Exception as e:
            print(f"Error testing {endpoint}: {e}")

def main():
    """Main function to run TTN API requests"""
    print("=== The Things Network (TTN) API Client ===")
    print(f"Using API Key: {TTN_API_KEY[:15]}...")
    print(f"Base URL: {TTN_CONSOLE_URL}")
    
    # Test user authentication first
    print("\n1. Testing API key authentication...")
    user_info = get_user_info()
    
    # List available endpoints
    print("\n2. Testing available endpoints...")
    list_available_endpoints()
    
    # Try to get applications
    print("\n3. Fetching TTN applications...")
    applications = get_ttn_applications()
    
    if not applications:
        print("\n4. Testing storage endpoints...")
        test_webhook_data()
    
    print("\n=== API Key Troubleshooting ===")
    print("If you're getting 404 errors, try these steps:")
    print("1. Verify your API key has the right permissions")
    print("2. Check if you need to specify a specific application ID")
    print("3. Your API key might be application-specific, not universal")
    print("4. Try creating a new API key with 'Read application traffic' permissions")

if __name__ == "__main__":
    main()