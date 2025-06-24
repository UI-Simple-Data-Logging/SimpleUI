import requests
import time
import random
from datetime import datetime

# ===== CONFIGURATION CONSTANTS =====
API_BASE_URL = "http://localhost:5050/api"  # Change this for production
REQUEST_INTERVAL_SECONDS = 2  # Time between requests
TOTAL_REQUESTS = False  # Set to False for continuous generation, or a number for limited requests

# ===== SENSOR VALUE RANGES =====
TEMPERATURE_RANGE = (25.0, 45.0)  # °C - Industrial temperature range
SPEED_RANGE = (30.0, 50.0)  # mm/s - Production speed range
SQUEEGEE_SPEED_RANGE = (20.0, 40.0)  # mm/s - Squeegee speed range
PRINT_PRESSURE_RANGE = (8000.0, 12000.0)  # N/m² - Print pressure range
INK_VISCOSITY_RANGE = (15.0, 25.0)  # cP - Ink viscosity range

# ===== DEVICE SOURCES =====
DEVICE_SOURCES = {
    'temperature': ['thermometer', 'thermal_sensor', 'infrared'],
    'speed': ['encoder', 'optical_sensor', 'manual'],
    'squeegee_speed': ['encoder', 'speed_sensor'],
    'print_pressure': ['pressure_sensor', 'force_gauge'],
    'ink_viscosity': ['viscometer', 'rheometer']
}

# ===== OPERATORS AND PROCESS TYPES =====
TEST_OPERATORS = ['SensorBot', 'AutoSensor', 'LiveData']
PROCESS_TYPES = ['Silvering', 'Streeting']  # Use capitalized process types to match backend enum

# ===== STATUS CODES BY PROCESS TYPE =====
STATUS_CODES = {
    'Silvering': 1100,
    'Streeting': 2100
}

def generate_sensor_payload():
    """Generate a realistic sensor data payload with correlated values"""
    
    # Generate sensor readings with realistic correlations
    base_temp = random.uniform(*TEMPERATURE_RANGE)
    
    # Speed might be affected by temperature (higher temp = slightly lower speed)
    temp_factor = (base_temp - TEMPERATURE_RANGE[0]) / (TEMPERATURE_RANGE[1] - TEMPERATURE_RANGE[0])
    speed_adjustment = (1 - temp_factor * 0.1)  # Up to 10% reduction at high temps
    speed_value = random.uniform(*SPEED_RANGE) * speed_adjustment
    
    # Squeegee speed typically correlates with main speed
    squeegee_ratio = random.uniform(0.7, 0.9)  # 70-90% of main speed
    squeegee_speed = speed_value * squeegee_ratio
    
    # Print pressure might vary with speed
    pressure_base = random.uniform(*PRINT_PRESSURE_RANGE)
    pressure_variation = (speed_value / max(SPEED_RANGE)) * 1000  # Up to 1000 N/m² variation
    print_pressure = pressure_base + random.uniform(-pressure_variation, pressure_variation)
      # Ink viscosity affected by temperature
    visc_temp_factor = (base_temp - TEMPERATURE_RANGE[0]) / (TEMPERATURE_RANGE[1] - TEMPERATURE_RANGE[0])
    base_viscosity = random.uniform(*INK_VISCOSITY_RANGE)
    ink_viscosity = base_viscosity * (1 - visc_temp_factor * 0.15)  # Lower viscosity at higher temps
    
    # Select process type and corresponding status code
    process_type = random.choice(PROCESS_TYPES)
    status_code = STATUS_CODES[process_type]
    
    payload = {
        "processType": process_type,
        "statusCode": status_code,
        "temperature": {
            "value": round(base_temp, 1),
            "unit": "°C",
            "deviceSource": random.choice(DEVICE_SOURCES['temperature'])
        },
        "speed": {
            "value": round(speed_value, 1),
            "unit": "mm/s",
            "deviceSource": random.choice(DEVICE_SOURCES['speed'])
        },
        "squeegeeSpeed": {
            "value": round(squeegee_speed, 1),
            "unit": "mm/s",
            "deviceSource": random.choice(DEVICE_SOURCES['squeegee_speed'])
        },
        "printPressure": {
            "value": round(print_pressure, 0),
            "unit": "N/m²",
            "deviceSource": random.choice(DEVICE_SOURCES['print_pressure'])
        },
        "inkViscosity": {
            "value": round(ink_viscosity, 1),
            "unit": "cP",
            "deviceSource": random.choice(DEVICE_SOURCES['ink_viscosity'])
        },
        "operator": random.choice(TEST_OPERATORS),
        "timestamp": datetime.now().isoformat()
    }
    
    return payload

def make_post_request(payload):
    """Make POST request to the API"""
    url = f"{API_BASE_URL}/items"
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Sensor data logged - ID: {data.get('_id', 'Unknown')}")
            print(f"   🌡️  Temp: {payload['temperature']['value']}°C | "
                  f"⚡ Speed: {payload['speed']['value']}mm/s | "
                  f"💧 Visc: {payload['inkViscosity']['value']}cP")
            print(f"   🔧 Process: {payload['processType']} (Status: {payload['statusCode']}) | "
                  f"👤 Operator: {payload['operator']}")
            return True
        else:
            print(f"❌ Failed to log sensor data - Status: {response.status_code}")
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
    """Main function to run the sensor data generation script"""
    print("🔧 Live Sensor Data Generator for SimpleUI")
    print("=" * 50)
    print(f"API URL: {API_BASE_URL}")
    print(f"Request Interval: {REQUEST_INTERVAL_SECONDS} seconds")
    print(f"Continuous Mode: {'Yes' if TOTAL_REQUESTS is False else f'No - {TOTAL_REQUESTS} requests'}")
    print(f"Temperature: {TEMPERATURE_RANGE[0]}°C to {TEMPERATURE_RANGE[1]}°C")
    print(f"Speed: {SPEED_RANGE[0]} to {SPEED_RANGE[1]} mm/s")
    print(f"Pressure: {PRINT_PRESSURE_RANGE[0]} to {PRINT_PRESSURE_RANGE[1]} N/m²")
    print(f"Viscosity: {INK_VISCOSITY_RANGE[0]} to {INK_VISCOSITY_RANGE[1]} cP")
    print("=" * 50)
    
    # Test API connection first
    if not test_api_connection():
        print("\n⛔ Exiting due to API connection failure")
        return
    
    print(f"\n🚀 Starting live sensor data generation...")
    print("Press Ctrl+C to stop\n")
    
    successful_requests = 0
    failed_requests = 0
    request_count = 0
    
    try:
        while True:
            request_count += 1
            
            # Check if we should stop (when TOTAL_REQUESTS is not False)
            if TOTAL_REQUESTS is not False and request_count > TOTAL_REQUESTS:
                print(f"\n✅ Completed {TOTAL_REQUESTS} requests")
                break
            
            current_time = datetime.now().strftime("%H:%M:%S")
            print(f"📊 [{current_time}] Generating sensor reading #{request_count}")
            
            # Generate and send payload
            payload = generate_sensor_payload()
            success = make_post_request(payload)
            
            if success:
                successful_requests += 1
            else:
                failed_requests += 1
            
            # Wait before next request
            print(f"⏳ Next reading in {REQUEST_INTERVAL_SECONDS} seconds...\n")
            time.sleep(REQUEST_INTERVAL_SECONDS)
                
    except KeyboardInterrupt:
        print("\n\n⏹️  Sensor data generation stopped by user")
    
    # Summary
    print("=" * 50)
    print("📊 SENSOR DATA GENERATION SUMMARY")
    print(f"✅ Successful readings: {successful_requests}")
    print(f"❌ Failed readings: {failed_requests}")
    if successful_requests + failed_requests > 0:
        success_rate = (successful_requests/(successful_requests+failed_requests)*100)
        print(f"📈 Success rate: {success_rate:.1f}%")
    print(f"⏱️  Total runtime: {request_count * REQUEST_INTERVAL_SECONDS} seconds")
    print("=" * 50)

if __name__ == "__main__":
    main()
