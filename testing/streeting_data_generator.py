import requests
import json
import time
import random
from datetime import datetime

# Configuration constants
API_BASE_URL = "http://localhost:5050/api"  # Change this for production
REQUEST_INTERVAL_SECONDS = 1  # Time between requests
TOTAL_REQUESTS = 50  # Total number of records to generate

# Value ranges for random generation
TEMPERATURE_RANGE = (30.0, 40.0)  # °C - Typical industrial temperature range
SPEED_RANGE = (35.0, 45.0)  # mm/s - Typical streeting speed range

# Predefined options (based on StreetingForm.js)
DEVICE_OPTIONS = ['encoder', 'thermometer', 'manual']
PRIORITY_OPTIONS = ['L', 'M', 'H']
METRIC_OPTIONS = ['Voids', 'Conductivity', 'Thickness']

# Operators for testing
TEST_OPERATORS = ['AutoScript']

def generate_random_payload():
    """Generate a random payload for Streeting POST request"""
    
    # Generate random metrics (0 to 3 metrics can be selected)
    num_metrics = random.randint(0, len(METRIC_OPTIONS))
    selected_metrics = random.sample(METRIC_OPTIONS, num_metrics) if num_metrics > 0 else []
    
    payload = {
        "processType": "Streeting",
        "temperature": {
            "value": round(random.uniform(*TEMPERATURE_RANGE), 1),
            "unit": "°C",
            "deviceSource": "thermometer"
        },
        "speed": {
            "value": round(random.uniform(*SPEED_RANGE), 1),
            "unit": "mm/s", 
            "deviceSource": "encoder"
        },
        "priority": random.choice(PRIORITY_OPTIONS),
        "targetMetricAffected": selected_metrics,
        "operator": random.choice(TEST_OPERATORS),
        "statusCode": "2100",  # Streeting manual form (from StreetingDashboard.js)
        "reworked": "No",
        "decision": "Yes",
        "causeOfFailure": [],
        "timestamp": datetime.now().isoformat()
    }
    
    return payload

def make_post_request(payload):
    """Make POST request to the API"""
    url = f"{API_BASE_URL}/items"
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Record created successfully - ID: {data.get('_id', 'Unknown')}")
            print(f"   Temperature: {payload['temperature']['value']}°C, Speed: {payload['speed']['value']}mm/s")
            print(f"   Operator: {payload['operator']}, Priority: {payload['priority']}")
            return True
        else:
            print(f"❌ Failed to create record - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection failed - Is the server running at {API_BASE_URL}?")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_api_connection():
    """Test if the API is accessible"""
    url = f"{API_BASE_URL}/items"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print(f"✅ API connection successful - Found {len(response.json())} existing records")
            return True
        else:
            print(f"⚠️  API responded with status {response.status_code}")
            return True  # Still accessible, just different status
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to API at {API_BASE_URL}")
        print("   Make sure the backend server is running on the correct port")
        return False
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False

def main():
    """Main function to run the data generation script"""
    print("🧪 Streeting Data Generator for SimpleUI")
    print("=" * 50)
    print(f"API URL: {API_BASE_URL}")
    print(f"Request Interval: {REQUEST_INTERVAL_SECONDS} seconds")
    print(f"Total Requests: {TOTAL_REQUESTS}")
    print(f"Temperature Range: {TEMPERATURE_RANGE[0]}°C to {TEMPERATURE_RANGE[1]}°C")
    print(f"Speed Range: {SPEED_RANGE[0]}mm/s to {SPEED_RANGE[1]}mm/s")
    print("=" * 50)
    
    # Test API connection first
    if not test_api_connection():
        print("\n⛔ Exiting due to API connection failure")
        return
    
    print(f"\n🚀 Starting data generation...")
    print("Press Ctrl+C to stop early\n")
    
    successful_requests = 0
    failed_requests = 0
    
    try:
        for i in range(1, TOTAL_REQUESTS + 1):
            print(f"📝 Request {i}/{TOTAL_REQUESTS}")
            
            # Generate and send payload
            payload = generate_random_payload()
            success = make_post_request(payload)
            
            if success:
                successful_requests += 1
            else:
                failed_requests += 1
            
            # Wait before next request (except for the last one)
            if i < TOTAL_REQUESTS:
                print(f"⏳ Waiting {REQUEST_INTERVAL_SECONDS} seconds...\n")
                time.sleep(REQUEST_INTERVAL_SECONDS)
            else:
                print()
                
    except KeyboardInterrupt:
        print("\n\n⏹️  Script stopped by user")
    
    # Summary
    print("=" * 50)
    print("📊 SUMMARY")
    print(f"✅ Successful requests: {successful_requests}")
    print(f"❌ Failed requests: {failed_requests}")
    print(f"📈 Success rate: {(successful_requests/(successful_requests+failed_requests)*100):.1f}%")
    print("=" * 50)

if __name__ == "__main__":
    main()