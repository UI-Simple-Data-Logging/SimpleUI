import requests
import json
import time
import random
from datetime import datetime

# Configuration constants
API_BASE_URL = "http://localhost:5050/api"  # Change this for production
REQUEST_INTERVAL_SECONDS = 2  # Time between requests
TOTAL_REQUESTS = False  # Set to False for continuous generation, or a number for limited requests
MAX_REQUESTS = 100  # Only used if TOTAL_REQUESTS is not False

# Sensor value ranges for random generation
TEMPERATURE_RANGE = (25.0, 45.0)  # °C - Industrial temperature range
SPEED_RANGE = (30.0, 50.0)  # mm/s - Production speed range
SQUEEGEE_SPEED_RANGE = (20.0, 40.0)  # mm/s - Squeegee speed range
PRINT_PRESSURE_RANGE = (8000.0, 12000.0)  # N/m² - Print pressure range
INK_VISCOSITY_RANGE = (15.0, 25.0)  # cP - Ink viscosity range

# Device sources for sensors
DEVICE_SOURCES = {
    'temperature': ['thermometer', 'thermal_sensor', 'infrared'],
    'speed': ['encoder', 'optical_sensor', 'manual'],
    'squeegee_speed': ['encoder', 'speed_sensor'],
    'print_pressure': ['pressure_sensor', 'force_gauge'],
    'ink_viscosity': ['viscometer', 'rheometer']
}

# Quality control decision weights (realistic manufacturing rates)
DECISION_WEIGHTS = [0.85, 0.10, 0.05]  # [Yes, No, Goes to Rework]
DECISION_OPTIONS = ['Yes', 'No', 'Goes to Rework']

# Operators for testing
TEST_OPERATORS = ['SensorBot', 'AutoSensor', 'LiveData']

# Process types
PROCESS_TYPES = ['silvering', 'streeting']  # Use existing process types for sensor data

def generate_sensor_payload():
    """Generate a realistic sensor data payload"""
    
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
      # Quality decision based on sensor values (simulate realistic defect patterns)
    decision_prob = calculate_quality_decision_probability(
        base_temp, speed_value, squeegee_speed, print_pressure, ink_viscosity
    )
    decision = random.choices(DECISION_OPTIONS, weights=decision_prob)[0]
    
    payload = {
        "processType": random.choice(PROCESS_TYPES),
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

def calculate_quality_decision_probability(temp, speed, squeegee_speed, pressure, viscosity):
    """Calculate realistic quality decision probability based on sensor values"""
    
    # Define optimal ranges (where pass rate is highest)
    optimal_temp = (TEMPERATURE_RANGE[0] + TEMPERATURE_RANGE[1]) / 2
    optimal_speed = (SPEED_RANGE[0] + SPEED_RANGE[1]) / 2
    optimal_pressure = (PRINT_PRESSURE_RANGE[0] + PRINT_PRESSURE_RANGE[1]) / 2
    optimal_viscosity = (INK_VISCOSITY_RANGE[0] + INK_VISCOSITY_RANGE[1]) / 2
    
    # Calculate deviations from optimal
    temp_dev = abs(temp - optimal_temp) / (TEMPERATURE_RANGE[1] - TEMPERATURE_RANGE[0])
    speed_dev = abs(speed - optimal_speed) / (SPEED_RANGE[1] - SPEED_RANGE[0])
    pressure_dev = abs(pressure - optimal_pressure) / (PRINT_PRESSURE_RANGE[1] - PRINT_PRESSURE_RANGE[0])
    visc_dev = abs(viscosity - optimal_viscosity) / (INK_VISCOSITY_RANGE[1] - INK_VISCOSITY_RANGE[0])
    
    # Calculate overall deviation (0 = perfect, 1 = maximum deviation)
    overall_deviation = (temp_dev + speed_dev + pressure_dev + visc_dev) / 4
    
    # Adjust probabilities based on deviation
    base_pass_rate = 0.85
    pass_rate = max(0.60, base_pass_rate - (overall_deviation * 0.30))  # 60-85% pass rate
    fail_rate = min(0.25, (1 - pass_rate) * 0.7)  # Most failures go to rework
    rework_rate = 1 - pass_rate - fail_rate
    
    return [pass_rate, fail_rate, rework_rate]

def generate_failure_causes(temp, speed, pressure, viscosity):
    """Generate realistic failure causes based on sensor values"""
    causes = []
    
    if temp > (TEMPERATURE_RANGE[0] + TEMPERATURE_RANGE[1]) / 2 + 5:
        causes.append('High Temperature')
    elif temp < (TEMPERATURE_RANGE[0] + TEMPERATURE_RANGE[1]) / 2 - 5:
        causes.append('Low Temperature')
    
    if speed > (SPEED_RANGE[0] + SPEED_RANGE[1]) / 2 + 5:
        causes.append('Excessive Speed')
    elif speed < (SPEED_RANGE[0] + SPEED_RANGE[1]) / 2 - 5:
        causes.append('Insufficient Speed')
    
    if pressure > (PRINT_PRESSURE_RANGE[0] + PRINT_PRESSURE_RANGE[1]) / 2 + 1000:
        causes.append('High Pressure')
    elif pressure < (PRINT_PRESSURE_RANGE[0] + PRINT_PRESSURE_RANGE[1]) / 2 - 1000:
        causes.append('Low Pressure')
    
    if viscosity > (INK_VISCOSITY_RANGE[0] + INK_VISCOSITY_RANGE[1]) / 2 + 2:
        causes.append('High Viscosity')
    elif viscosity < (INK_VISCOSITY_RANGE[0] + INK_VISCOSITY_RANGE[1]) / 2 - 2:
        causes.append('Low Viscosity')
    
    # Add some random causes if no specific issues
    if not causes:
        random_causes = ['Material Defect', 'Equipment Drift', 'Environmental Factor']
        if random.random() < 0.3:  # 30% chance of random cause
            causes.append(random.choice(random_causes))
    
    return causes

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
            print(f"✅ Sensor data logged - ID: {data.get('_id', 'Unknown')}")
            print(f"   🌡️  Temp: {payload['temperature']['value']}°C | "
                  f"⚡ Speed: {payload['speed']['value']}mm/s | "
                  f"💧 Visc: {payload['inkViscosity']['value']}cP")
            print(f"   🔧 Process: {payload['processType']} | "
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
    print("=" * 60)
    print(f"API URL: {API_BASE_URL}")
    print(f"Request Interval: {REQUEST_INTERVAL_SECONDS} seconds")
    print(f"Continuous Mode: {'Yes' if TOTAL_REQUESTS is False else 'No'}")
    if TOTAL_REQUESTS is not False:
        print(f"Total Requests: {TOTAL_REQUESTS}")
    print(f"Temperature Range: {TEMPERATURE_RANGE[0]}°C to {TEMPERATURE_RANGE[1]}°C")
    print(f"Speed Range: {SPEED_RANGE[0]} to {SPEED_RANGE[1]} mm/s")
    print(f"Pressure Range: {PRINT_PRESSURE_RANGE[0]} to {PRINT_PRESSURE_RANGE[1]} N/m²")
    print(f"Viscosity Range: {INK_VISCOSITY_RANGE[0]} to {INK_VISCOSITY_RANGE[1]} cP")
    print("=" * 60)
    
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
    print("=" * 60)
    print("📊 SENSOR DATA GENERATION SUMMARY")
    print(f"✅ Successful readings: {successful_requests}")
    print(f"❌ Failed readings: {failed_requests}")
    if successful_requests + failed_requests > 0:
        success_rate = (successful_requests/(successful_requests+failed_requests)*100)
        print(f"📈 Success rate: {success_rate:.1f}%")
    print(f"⏱️  Total runtime: {request_count * REQUEST_INTERVAL_SECONDS} seconds")
    print("=" * 60)

if __name__ == "__main__":
    main()
