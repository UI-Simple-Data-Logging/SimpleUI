#!/usr/bin/env python3
"""
Quality Control Test Data Injection Script

This script generates and injects random test data for the Quality Control system.
It creates realistic data scenarios with proper relationships between fields.
"""

import requests
import random
import json
from datetime import datetime, timedelta
import time

# Configuration Variables
NUM_RECORDS = 100           # Number of records to insert
START_PRODUCT_ID = 1000     # Starting product ID number
BASE_URL = 'http://localhost:5050/api'  # Backend API URL

# Random data arrays
OPERATORS = ['Mudit', 'Raj', 'Manav']
PROCESS_STATIONS = ['Silvering', 'Streeting', 'Final Product check']
DECISIONS = ['Yes', 'No', 'Goes to Rework']
REWORKABILITY_OPTIONS = ['Yes', 'No']
REWORKED_OPTIONS = ['Yes', 'No']

CAUSE_OF_FAILURE_OPTIONS = [
    'Voids',
    'Insufficient Filling',
    'Contamination',
    'Cracks or Scratches',
    'Operator Error',
    'Flexible Substrate defect',
    'Other'
]

AFFECTED_OUTPUT_OPTIONS = [
    'No Conductivity and circuitry',
    'Reliability',
    'Out of specs',
    'Other'
]

def generate_status_code(process_station):
    """Generate status code based on process station"""
    # Always return 3100 for Quality Control
    return '3100'

def generate_realistic_timestamp():
    """Generate a realistic timestamp within the last 30 days"""
    now = datetime.now()
    days_back = random.randint(0, 30)
    hours_back = random.randint(0, 23)
    minutes_back = random.randint(0, 59)
    
    timestamp = now - timedelta(days=days_back, hours=hours_back, minutes=minutes_back)
    return timestamp.isoformat()

def generate_quality_control_record(product_id):
    """Generate a single quality control record with realistic data"""
      # Random decision with weighted probabilities (more Yes than No/Rework)
    decision_weights = [0.7, 0.05, 0.25]  # 70% Yes, 5% No, 25% Goes to Rework
    decision = random.choices(DECISIONS, weights=decision_weights)[0]
    
    # Generate cause of failure and affected output based on decision
    cause_of_failure = []
    affected_output = []
    
    if decision in ['No', 'Goes to Rework']:
        # Select 1-3 causes of failure
        num_causes = random.randint(1, 3)
        cause_of_failure = random.sample(CAUSE_OF_FAILURE_OPTIONS, num_causes)
        
        # Select 1-2 affected outputs
        num_outputs = random.randint(1, 2)
        affected_output = random.sample(AFFECTED_OUTPUT_OPTIONS, num_outputs)    # Reworkability logic
    reworkability = 'No'
    if decision in ['No', 'Goes to Rework']:
        if decision == 'Goes to Rework':
            # 90% chance of being Yes for Goes to Rework
            reworkability_weights = [0.9, 0.1]  # 90% Yes, 10% No
            reworkability = random.choices(REWORKABILITY_OPTIONS, weights=reworkability_weights)[0]
        else:
            # Regular random choice for No decision
            reworkability = random.choice(REWORKABILITY_OPTIONS)
    
    # Reworked logic
    reworked = 'No'
    if decision == 'No' or (decision == 'Goes to Rework' and reworkability == 'Yes'):
        if decision == 'Goes to Rework' and reworkability == 'Yes':
            # 85% chance of being Yes for Goes to Rework with Yes reworkability
            reworked_weights = [0.85, 0.15]  # 85% Yes, 15% No
            reworked = random.choices(REWORKED_OPTIONS, weights=reworked_weights)[0]
        else:
            # Regular weighted choice for other cases
            reworked_weights = [0.3, 0.7]  # 30% Yes, 70% No
            reworked = random.choices(REWORKED_OPTIONS, weights=reworked_weights)[0]
    
    # Update decision if reworked is Yes (80% chance of becoming Yes)
    if reworked == 'Yes':
        final_decision_weights = [0.8, 0.2]  # 80% Yes, 20% keep original decision
        should_update_decision = random.choices([True, False], weights=final_decision_weights)[0]
        if should_update_decision:
            decision = 'Yes'
    
    # Generate comments with realistic scenarios
    comments_options = [
        "",  # Empty comment (most common)
        "Standard inspection completed without issues",
        "Minor surface imperfections noted but within tolerance",
        "Requires attention from supervisor",
        "Follow-up inspection recommended",
        "Quality issue resolved through process adjustment",
        "Equipment calibration may be needed",
        "Material batch variation observed",
        "Process parameters adjusted during run",
        "Additional testing performed to verify quality"    ]
    
    # Weight comments - 50% empty, 50% with content
    comment_weights = [0.5] + [0.05] * 9
    comments = random.choices(comments_options, weights=comment_weights)[0]
    
    process_station = random.choice(PROCESS_STATIONS)
    
    record = {
        "processType": "QualityControl",
        "processStation": process_station,
        "productId": str(product_id),
        "decision": decision,
        "reworkability": reworkability,
        "reworked": reworked,
        "causeOfFailure": cause_of_failure,
        "affectedOutput": affected_output,
        "operator": random.choice(OPERATORS),
        "statusCode": generate_status_code(process_station),
        "comments": comments,
        "timestamp": generate_realistic_timestamp()
    }
    
    return record

def inject_data():
    """Main function to inject test data"""
    print(f"Starting Quality Control Data Injection")
    print(f"Configuration:")
    print(f"   - Records to insert: {NUM_RECORDS}")
    print(f"   - Starting Product ID: {START_PRODUCT_ID}")
    print(f"   - API Endpoint: {BASE_URL}/items")
    print(f"   - Operators: {', '.join(OPERATORS)}")
    print("-" * 50)
    
    success_count = 0
    error_count = 0
    
    for i in range(NUM_RECORDS):
        product_id = START_PRODUCT_ID + i
        
        try:
            # Generate record
            record = generate_quality_control_record(product_id)
            
            # Send POST request
            response = requests.post(f"{BASE_URL}/items", json=record, timeout=10)
            
            if response.status_code == 201:
                success_count += 1
                print(f"SUCCESS [{i+1:3d}/{NUM_RECORDS}] Product {product_id}: {record['decision']} - {record['operator']}")
            else:
                error_count += 1
                print(f"ERROR [{i+1:3d}/{NUM_RECORDS}] Product {product_id}: HTTP {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            error_count += 1
            print(f"ERROR [{i+1:3d}/{NUM_RECORDS}] Product {product_id}: Network error - {str(e)}")
        except Exception as e:
            error_count += 1
            print(f"ERROR [{i+1:3d}/{NUM_RECORDS}] Product {product_id}: Unexpected error - {str(e)}")
        
        # Small delay to avoid overwhelming the server
        time.sleep(0.1)
    
    print("-" * 50)
    print(f"Data Injection Complete!")
    print(f"   Successful: {success_count}")
    print(f"   Failed: {error_count}")
    print(f"   Success Rate: {(success_count/NUM_RECORDS)*100:.1f}%")
    
    if success_count > 0:
        print(f"\nSummary of injected data:")
        print(f"   - Product IDs: {START_PRODUCT_ID} to {START_PRODUCT_ID + success_count - 1}")
        print(f"   - Process Type: Quality Control")
        print(f"   - Operators: {', '.join(OPERATORS)}")

def test_connection():
    """Test if the backend API is accessible"""
    try:
        response = requests.get(f"{BASE_URL}/items", timeout=5)
        if response.status_code == 200:
            print("Backend API is accessible")
            return True
        else:
            print(f"Backend API returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Cannot connect to backend API: {str(e)}")
        print("   Make sure the backend server is running on http://localhost:5050")
        return False

if __name__ == "__main__":
    print("Quality Control Test Data Injection Script")
    print("=" * 50)
    
    # Test connection first
    if not test_connection():
        print("\nTo start the backend server:")
        print("   1. Navigate to the backend directory")
        print("   2. Run: npm install (if not done already)")
        print("   3. Run: npm start or node server.js")
        exit(1)
    
    # Confirm injection
    print(f"\nThis will inject {NUM_RECORDS} test records into the database.")
    confirm = input("Continue? (y/N): ").lower().strip()
    
    if confirm in ['y', 'yes']:
        inject_data()
    else:
        print("Data injection cancelled.")
