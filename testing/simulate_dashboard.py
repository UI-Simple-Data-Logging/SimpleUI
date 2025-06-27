#!/usr/bin/env python3
"""
Complete Manufacturing Data Simulation Script

Generates realistic test data with all sensor measurements and QC decisions.
Each record contains complete manufacturing data for one product ID.
"""

import requests
import random
import json
from datetime import datetime, timedelta
import time

# =============================================================================
# MAIN CONFIGURATION
# =============================================================================

# API Configuration
API_BASE_URL = "http://localhost:5050/api"
REQUEST_INTERVAL_SECONDS = 1
TOTAL_RECORDS = 1000
START_PRODUCT_ID = 1000
TIME_RANGE_DAYS = 45

# Sensor ranges
SQUEEGEE_SPEED_RANGE = (25.0, 55.0)  # mm/s
PRINT_PRESSURE_RANGE = (800.0, 1200.0)  # N/m²
INK_VISCOSITY_RANGE = (15.0, 35.0)  # cP
HUMIDITY_RANGE = (40.0, 60.0)  # %
TEMPERATURE_RANGE = (30.0, 40.0)  # °C
SPEED_RANGE = (35.0, 45.0)  # mm/s

# QC Operators
QC_OPERATORS = ['Inspector 1', 'Inspector 2', 'Inspector 3']

# Cause of failure options
QC_CAUSE_OF_FAILURE_OPTIONS = [
    'Voids',
    'Insufficient Filling', 
    'Contamination',
    'Cracks or Scratches',
    'Operator Error',
    'Flexible Substrate defect',
    'Other'
]

QC_CAUSE_OF_FAILURE_OPTIONS_OTHER = [
    'Other Option 1',
    'Other Option 2',
]

# Affected output options
QC_AFFECTED_OUTPUT_OPTIONS = [
    'No Conductivity and circuitry',
    'Reliability',
    'Out of specs', 
    'Other'
]

QC_AFFECTED_OUTPUT_OPTIONS_OTHER = [
    'Other Output 1',
    'Other Output 2',
]

# Device sources
DEVICE_SOURCES = {
    'squeegeeSpeed': 'clicker',
    'printPressure': 'load_cell', 
    'inkViscosity': 'viscometer',
    'humidity': 'humidity_sensor',
    'temperature': 'thermometer',
    'speed': 'encoder'
}

# =============================================================================
# QUALITY CONTROL CONFIGURATION
# =============================================================================


# QC Process Stations
QC_PROCESS_STATIONS = ['Silvering', 'Streeting', 'Final Product check']

# QC Decision weights and options
QC_DECISIONS = ['Yes', 'No', 'Goes to Rework']
QC_DECISION_WEIGHTS = [0.7, 0.05, 0.25]  # 70% Yes, 5% No, 25% Goes to Rework

# QC Reworkability weights
QC_REWORKABILITY_OPTIONS = ['Yes', 'No']
QC_REWORKABILITY_WEIGHTS_REWORK = [0.9, 0.1]  # For "Goes to Rework" decision
QC_REWORKABILITY_WEIGHTS_NO = [0.5, 0.5]     # For "No" decision

# QC Reworked weights
QC_REWORKED_OPTIONS = ['Yes', 'No']
QC_REWORKED_WEIGHTS_HIGH = [0.85, 0.15]  # High reworkability cases
QC_REWORKED_WEIGHTS_LOW = [0.3, 0.7]     # Other cases

# QC Final decision update weight
QC_FINAL_DECISION_WEIGHTS = [0.7, 0.2, 0.1]  # 70% Yes, 20% No, 10% stays "Goes to Rework"


# QC Comments options and weights
QC_COMMENTS_OPTIONS = [
    "",
    "Standard inspection completed without issues",
    "Minor surface imperfections noted but within tolerance", 
    "Requires attention from supervisor",
    "Follow-up inspection recommended",
    "Quality issue resolved through process adjustment",
    "Equipment calibration may be needed",
    "Material batch variation observed",
    "Process parameters adjusted during run",
    "Additional testing performed to verify quality"
]
QC_COMMENT_WEIGHTS = [0.5] + [0.05] * 9  # 50% empty, 50% with content

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def generate_realistic_timestamp():
    """Generate a realistic timestamp within the configured time range"""
    now = datetime.now()
    days_back = random.randint(0, TIME_RANGE_DAYS)
    hours_back = random.randint(0, 23)
    minutes_back = random.randint(0, 59)
    
    timestamp = now - timedelta(days=days_back, hours=hours_back, minutes=minutes_back)
    return timestamp.isoformat()

# =============================================================================
# DATA GENERATION FUNCTIONS
# =============================================================================

def generate_comprehensive_record(record_id):
    """Generate a comprehensive record with ALL sensor data AND QC data for each product ID"""
    
    # Generate Quality Control decision logic
    decision = random.choices(QC_DECISIONS, weights=QC_DECISION_WEIGHTS)[0]
      # Generate cause of failure and affected output based on decision
    cause_of_failure = []
    affected_output = []
    
    if decision in ['No', 'Goes to Rework']:
        num_causes = random.randint(1, 3)
        selected_causes = random.sample(QC_CAUSE_OF_FAILURE_OPTIONS, num_causes)
        
        # Handle "Other" option for cause of failure
        cause_of_failure = []
        for cause in selected_causes:
            if cause == 'Other':
                # Replace "Other" with a specific option from the other array
                other_option = random.choice(QC_CAUSE_OF_FAILURE_OPTIONS_OTHER)
                cause_of_failure.append(other_option)
            else:
                cause_of_failure.append(cause)
        
        num_outputs = random.randint(1, 2)
        selected_outputs = random.sample(QC_AFFECTED_OUTPUT_OPTIONS, num_outputs)
        
        # Handle "Other" option for affected output
        affected_output = []
        for output in selected_outputs:
            if output == 'Other':
                # Replace "Other" with a specific option from the other array
                other_option = random.choice(QC_AFFECTED_OUTPUT_OPTIONS_OTHER)
                affected_output.append(other_option)
            else:
                affected_output.append(output)
      # Reworkability logic
    reworkability = 'N/A'  # Default for products that pass initial inspection
    if decision in ['No', 'Goes to Rework']:
        if decision == 'Goes to Rework':
            reworkability = random.choices(QC_REWORKABILITY_OPTIONS, weights=QC_REWORKABILITY_WEIGHTS_REWORK)[0]
        else:
            reworkability = random.choices(QC_REWORKABILITY_OPTIONS, weights=QC_REWORKABILITY_WEIGHTS_NO)[0]
      # Reworked logic
    reworked = 'N/A'  # Default for products that pass initial inspection
    rework_outcome = 'N/A'  # Track the actual rework result separately
    
    if decision == 'No' or (decision == 'Goes to Rework' and reworkability == 'Yes'):
        if decision == 'Goes to Rework' and reworkability == 'Yes':
            reworked = random.choices(QC_REWORKED_OPTIONS, weights=QC_REWORKED_WEIGHTS_HIGH)[0]
        else:
            reworked = random.choices(QC_REWORKED_OPTIONS, weights=QC_REWORKED_WEIGHTS_LOW)[0]
        
        # Store the rework outcome before potentially updating the decision
        rework_outcome = reworked
      # Update decision if reworked is Yes (but keep original rework outcome)
    if reworked == 'Yes':
        final_outcome = random.choices(['Yes', 'No', 'Goes to Rework'], weights=QC_FINAL_DECISION_WEIGHTS)[0]
        decision = final_outcome
    
    # Generate comments and operator
    comments = random.choices(QC_COMMENTS_OPTIONS, weights=QC_COMMENT_WEIGHTS)[0]
    selected_operator = random.choice(QC_OPERATORS)
    
    # Product ID for tracking
    product_id = START_PRODUCT_ID + record_id
    
    # Build comprehensive record with ALL metrics
    record = {
        # Silvering sensor data
        "squeegeeSpeed": {
            "value": round(random.uniform(*SQUEEGEE_SPEED_RANGE), 1),
            "unit": "mm/s",
            "deviceSource": DEVICE_SOURCES['squeegeeSpeed']
        },
        "printPressure": {
            "value": round(random.uniform(*PRINT_PRESSURE_RANGE), 1),
            "unit": "N/m²",
            "deviceSource": DEVICE_SOURCES['printPressure']
        },
        "inkViscosity": {
            "value": round(random.uniform(*INK_VISCOSITY_RANGE), 1),
            "unit": "cP",
            "deviceSource": DEVICE_SOURCES['inkViscosity']
        },
        "humidity": {
            "value": round(random.uniform(*HUMIDITY_RANGE), 1),
            "unit": "%",
            "deviceSource": DEVICE_SOURCES['humidity']
        },
        
        # Streeting sensor data
        "temperature": {
            "value": round(random.uniform(*TEMPERATURE_RANGE), 1),
            "unit": "°C",
            "deviceSource": DEVICE_SOURCES['temperature']
        },
        "speed": {
            "value": round(random.uniform(*SPEED_RANGE), 1),
            "unit": "mm/s", 
            "deviceSource": DEVICE_SOURCES['speed']
        },
          # Quality Control data
        "processStation": random.choice(QC_PROCESS_STATIONS),
        "productId": str(product_id),
        "decision": decision,
        "reworkability": reworkability,
        "reworked": reworked,
        "reworkOutcome": rework_outcome,  # Track original rework result
        "causeOfFailure": cause_of_failure,
        "affectedOutput": affected_output,
        "operator": selected_operator,
        "comments": comments,
        "timestamp": generate_realistic_timestamp(),
        "processType": "QualityControl",
        "statusCode": "3100"
    }
    
    return record

# =============================================================================
# API INTERACTION FUNCTIONS
# =============================================================================

def make_post_request(payload, record_id):
    """Make POST request to the API"""
    url = f"{API_BASE_URL}/items"
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 201:
            data = response.json()
            print(f"Record created - ID: {data.get('_id', 'Unknown')}")
            return True
        else:
            print(f"Failed to create record - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"Connection failed - Is the server running at {API_BASE_URL}?")
        return False
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {str(e)}")
        return False

def test_api_connection():
    """Test if the API is accessible"""
    url = f"{API_BASE_URL}/items"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            existing_count = len(response.json())
            print(f"API connection successful - Found {existing_count} existing records")
            return True
        else:
            print(f"API responded with status {response.status_code}")
            return True
    except requests.exceptions.ConnectionError:
        print(f"Cannot connect to API at {API_BASE_URL}")
        print("   Make sure the backend server is running on the correct port")
        return False
    except Exception as e:
        print(f"API test failed: {str(e)}")
        return False

# =============================================================================
# MAIN EXECUTION FUNCTIONS
# =============================================================================

def simulate_comprehensive_data(record_count):
    """Generate complete manufacturing records with all sensor data + QC for each product"""
    print(f"\nGenerating {record_count} complete manufacturing records...")
    print("Each record contains ALL sensor data + QC decision for one product ID")
    
    successful_requests = 0
    failed_requests = 0
    
    for i in range(record_count):
        try:
            record = generate_comprehensive_record(i)
            success = make_post_request(record, i)
            
            if success:
                successful_requests += 1
            else:
                failed_requests += 1
            
            time.sleep(REQUEST_INTERVAL_SECONDS)
                
        except Exception as e:
            failed_requests += 1
            print(f"Error generating record {i+1}: {str(e)}")
    
    print(f"\nComplete Manufacturing Data Summary:")
    print(f"   Successful: {successful_requests}")
    print(f"   Failed: {failed_requests}")
    print(f"   Success Rate: {(successful_requests/(successful_requests+failed_requests)*100):.1f}%")
    
    return successful_requests, failed_requests

def main():
    """Main function to generate complete manufacturing data"""
    print("Complete Manufacturing Data Simulation")
    print("=" * 60)
    print(f"API URL: {API_BASE_URL}")
    print(f"Request Interval: {REQUEST_INTERVAL_SECONDS} seconds")
    print(f"Total Records: {TOTAL_RECORDS}")
    print(f"Time Range: Last {TIME_RANGE_DAYS} days")
    print("=" * 60)
    print("COMPLETE MANUFACTURING RECORDS:")
    print("   Each record = 1 Product ID with ALL sensor data + QC decision")
    print("   - Silvering Sensors: Squeegee Speed, Print Pressure, Ink Viscosity")
    print("   - Streeting Sensors: Temperature, Speed")
    print("   - Quality Control: Operator Decision, Reworkability, Comments")
    print("=" * 60)
    
    if not test_api_connection():
        print("\nExiting due to API connection failure")
        print("\nTo start the backend server:")
        print("   1. Navigate to the backend directory")
        print("   2. Run: npm install (if not done already)")
        print("   3. Run: npm start or node server.js")
        return
    
    print(f"\nThis will inject {TOTAL_RECORDS} complete manufacturing records:")
    print(f"   Each record contains ALL sensor measurements + QC decision")
    print(f"   Product IDs: {START_PRODUCT_ID} to {START_PRODUCT_ID + TOTAL_RECORDS - 1}")
    print(f"   Perfect for dashboard with complete manufacturing data per product")
    
    confirm = input("\nContinue? (y/n): ").lower().strip()
    
    if confirm not in ['y', 'yes']:
        print("Data simulation cancelled.")
        return
    
    print(f"\nStarting complete manufacturing data generation...")
    print("Press Ctrl+C to stop early\n")
    
    total_successful = 0
    total_failed = 0
    
    try:
        success, failed = simulate_comprehensive_data(TOTAL_RECORDS)
        total_successful += success
        total_failed += failed
        
    except KeyboardInterrupt:
        print("\n\nScript stopped by user")
    
    print("\n" + "=" * 60)
    print("COMPLETE MANUFACTURING DATA SUMMARY")
    print("=" * 60)
    print(f"Total Successful: {total_successful}")
    print(f"Total Failed: {total_failed}")
    print(f"Overall Success Rate: {(total_successful/(total_successful+total_failed)*100):.1f}%")
    print("=" * 60)

if __name__ == "__main__":
    main()
