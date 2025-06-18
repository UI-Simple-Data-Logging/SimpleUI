import requests
import json
from datetime import datetime, timedelta
from requests.auth import HTTPBasicAuth

# API Configuration
API_ID = "Z864D4Y76M21WZEX"  # API ID (username)
ACCESS_API_KEY = "187A539BC7ED494C80EDE7B6D01FF0522EF5C54020A748C8A0E5D812E4C14BC7"  # Access API key (password)
BASE_URL = "https://sensecap.seeed.cc/openapi"

# Authentication using basic auth
AUTH = HTTPBasicAuth(API_ID, ACCESS_API_KEY)

# Headers
HEADERS = {
    "Content-Type": "application/json"
}

# Measurement ID mappings for better readability
MEASUREMENT_NAMES = {
    "4097": "Air Temperature",
    "4200": "Motion Status", 
    "4199": "Light",
    "4209": "Accelerometer",
    "5001": "WiFi Scan"
}

def handle_response(response, endpoint_name):
    """Handle SenseCap API response format"""
    print(f"[{datetime.now()}] {endpoint_name} - Status Code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            response_data = response.json()
            
            # Check if response follows SenseCap format
            if isinstance(response_data, dict) and "code" in response_data:
                code = response_data.get("code")
                
                if code == "0":  # Successful response
                    print(f"SUCCESS: {endpoint_name}")
                    return response_data.get("data")
                else:  # Error response
                    error_msg = response_data.get("msg", "Unknown error")
                    print(f"API ERROR (Code: {code}): {error_msg}")
                    return None
            else:
                # Response doesn't follow expected format
                print(f"WARNING: Unexpected response format for {endpoint_name}")
                return response_data
                
        except json.JSONDecodeError:
            print(f"ERROR: Invalid JSON response for {endpoint_name}")
            print(f"Response text: {response.text}")
            return None
    else:
        print(f"HTTP ERROR {response.status_code} for {endpoint_name}")
        print(f"Response text: {response.text}")
        return None

def get_devices(device_type="2", group_uuid=None):
    """Get all devices from SenseCap dashboard"""
    try:
        url = f"{BASE_URL}/list_devices"
        
        # Query parameters based on API documentation
        params = {
            "device_type": device_type  # 1-gateway, 2-node(default)
        }
        
        if group_uuid:
            params["group_uuid"] = group_uuid
        
        response = requests.get(url, headers=HEADERS, params=params, auth=AUTH)
        
        devices_data = handle_response(response, "GET Devices")
        
        if devices_data is not None:
            # Print device summary
            if isinstance(devices_data, list):
                device_type_name = "Gateways" if device_type == "1" else "Nodes"
                print(f"\n=== {device_type_name} ===")
                print(f"Found {len(devices_data)} device(s):")
                for i, device in enumerate(devices_data, 1):
                    device_eui = device.get('device_eui', 'N/A')
                    device_name = device.get('device_name', 'N/A')
                    print(f"  {i}. {device_name}")
                    print(f"     EUI: {device_eui}")
                    if 'be_quota' in device:
                        print(f"     Quota: {device['be_quota']}")
                    if 'expired_time' in device:
                        print(f"     Expires: {device['expired_time']}")
                    print()
            
            return devices_data
        
        return None
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed for GET Devices: {e}")
        return None

def get_device_running_status(device_euis):
    """Get device running status for up to 50 devices"""
    try:
        url = f"{BASE_URL}/view_device_running_status"
        
        # Ensure device_euis is a list and limit to 50 devices
        if isinstance(device_euis, str):
            device_euis = [device_euis]
        
        if len(device_euis) > 50:
            print(f"WARNING: Limiting request to first 50 devices (provided {len(device_euis)})")
            device_euis = device_euis[:50]
        
        # Request body
        request_body = {
            "device_euis": device_euis
        }
        
        response = requests.post(url, headers=HEADERS, json=request_body, auth=AUTH)
        
        status_data = handle_response(response, f"POST Device Running Status")
        
        if status_data is not None:
            print(f"\n=== Device Running Status ===")
            print("Device EUI\t\t\tOnline Status\tBattery Status\tLast Message\t\t\tReport Frequency")
            print("-" * 120)
            
            if isinstance(status_data, list):
                for device_status in status_data:
                    device_eui = device_status.get('device_eui', 'N/A')
                    latest_message_time = device_status.get('latest_message_time', 'N/A')
                    online_status = device_status.get('online_status', -1)
                    battery_status = device_status.get('battery_status', -1)
                    report_frequency = device_status.get('report_frequency', -1)
                    
                    # Format status values
                    online_text = "Online" if online_status == 1 else "Offline" if online_status == 0 else "Unknown"
                    battery_text = "Good" if battery_status == 1 else "Low" if battery_status == 0 else "Unknown"
                    
                    # Format last message time
                    if latest_message_time and latest_message_time != 'N/A':
                        try:
                            formatted_time = datetime.fromisoformat(latest_message_time.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S')
                        except:
                            formatted_time = latest_message_time
                    else:
                        formatted_time = 'N/A'
                    
                    # Format report frequency
                    freq_text = f"{report_frequency}/min" if report_frequency != -1 else "Unknown"
                    
                    print(f"{device_eui}\t{online_text}\t\t{battery_text}\t\t{formatted_time}\t{freq_text}")
            else:
                print("Unexpected data format")
                print(json.dumps(status_data, indent=2))
            
            return status_data
        
        return None
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed for POST Device Running Status: {e}")
        return None

def get_latest_telemetry_data(device_eui, channel_index=None, measurement_id=None):
    """Get the latest telemetry data from a specific device"""
    try:
        url = f"{BASE_URL}/view_latest_telemetry_data"
        
        # Required and optional query parameters
        params = {
            "device_eui": device_eui  # Required
        }
        
        # Optional parameters
        if channel_index is not None:
            params["channel_index"] = channel_index
        if measurement_id is not None:
            params["measurement_id"] = measurement_id
        
        response = requests.get(url, headers=HEADERS, params=params, auth=AUTH)
        
        latest_data = handle_response(response, f"GET Latest Telemetry Data for {device_eui}")
        
        if latest_data is not None:
            print(f"\n=== Latest Telemetry Data for Device: {device_eui} ===")
            
            if isinstance(latest_data, list):
                for item in latest_data:
                    channel_index = item.get('channel_index', 'N/A')
                    measurement_id = item.get('measurement_id', 'N/A')
                    measurement_value = item.get('measurement_value', 'N/A')
                    timestamp = item.get('time', 'N/A')
                    
                    sensor_name = MEASUREMENT_NAMES.get(measurement_id, f"Sensor {measurement_id}")
                    
                    # Format the value
                    if measurement_id == "4097":  # Temperature
                        formatted_value = f"{measurement_value}°C"
                    elif measurement_id == "4200":  # Motion
                        formatted_value = "Motion Detected" if measurement_value == 1 else "No Motion"
                    elif measurement_id == "4199":  # Light
                        formatted_value = f"{measurement_value} lux"
                    elif measurement_id == "4209":  # Accelerometer
                        formatted_value = f"{measurement_value} m/s²"
                    elif measurement_id == "5001":  # WiFi Scan
                        if isinstance(measurement_value, list):
                            formatted_value = f"{len(measurement_value)} WiFi networks"
                        else:
                            formatted_value = str(measurement_value)
                    else:
                        formatted_value = str(measurement_value)
                    
                    print(f"Channel {channel_index}: {sensor_name} = {formatted_value} (at {timestamp})")
            else:
                print("Unexpected data format")
                print(json.dumps(latest_data, indent=2))
        
        return latest_data
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed for GET Latest Telemetry Data: {e}")
        return None

def parse_telemetry_data(telemetry_data, device_eui):
    """Parse and display telemetry data in a clean format"""
    if not isinstance(telemetry_data, dict) or 'list' not in telemetry_data:
        print(f"Unexpected telemetry data format for device {device_eui}")
        return
    
    data_list = telemetry_data['list']
    if len(data_list) < 2:
        print(f"No telemetry data available for device {device_eui}")
        return
    
    # First element contains channel info (measurement IDs)
    channel_info = data_list[0]
    # Second element contains the actual measurements
    measurements_data = data_list[1]
    
    print(f"\n=== Telemetry Data for Device: {device_eui} ===")
    
    # Display available sensors
    print("Available Sensors:")
    for i, sensor_info in enumerate(channel_info):
        if isinstance(sensor_info, list) and len(sensor_info) >= 2:
            channel = sensor_info[0]
            measurement_id = sensor_info[1]
            sensor_name = MEASUREMENT_NAMES.get(measurement_id, f"Unknown Sensor ({measurement_id})")
            print(f"  Channel {channel}: {sensor_name} (ID: {measurement_id})")
    
    print(f"\nSensor Readings:")
    print("-" * 80)
    
    # Process each sensor's data
    for i, sensor_data in enumerate(measurements_data):
        if i >= len(channel_info):
            break
            
        channel = channel_info[i][0]
        measurement_id = channel_info[i][1]
        sensor_name = MEASUREMENT_NAMES.get(measurement_id, f"Sensor {measurement_id}")
        
        print(f"\n{sensor_name} (Channel {channel}):")
        
        if isinstance(sensor_data, list) and len(sensor_data) > 0:
            # Display recent readings
            recent_count = min(5, len(sensor_data))
            for j in range(recent_count):
                reading = sensor_data[j]
                if isinstance(reading, list) and len(reading) >= 2:
                    value = reading[0]
                    timestamp = reading[1]
                    
                    # Format the value based on sensor type
                    if measurement_id == "4097":  # Temperature
                        formatted_value = f"{value}°C"
                    elif measurement_id == "4200":  # Motion
                        formatted_value = "Motion Detected" if value == 1 else "No Motion"
                    elif measurement_id == "4199":  # Light
                        formatted_value = f"{value} lux"
                    elif measurement_id == "4209":  # Accelerometer
                        formatted_value = f"{value} m/s²"
                    elif measurement_id == "5001":  # WiFi Scan
                        if isinstance(value, list):
                            formatted_value = f"{len(value)} WiFi networks detected"
                            # Show WiFi details
                            print(f"    {timestamp}: {formatted_value}")
                            for wifi in value[:3]:  # Show first 3 networks
                                if isinstance(wifi, dict):
                                    mac = wifi.get('mac', 'Unknown')
                                    rssi = wifi.get('rssi', 'Unknown')
                                    print(f"      - MAC: {mac}, Signal: {rssi} dBm")
                            if len(value) > 3:
                                print(f"      ... and {len(value) - 3} more networks")
                            continue
                        else:
                            formatted_value = str(value)
                    else:
                        formatted_value = str(value)
                    
                    print(f"    {timestamp}: {formatted_value}")
            
            if len(sensor_data) > recent_count:
                print(f"    ... and {len(sensor_data) - recent_count} more readings")
        else:
            print("    No data available")

def get_telemetry_data(device_eui, channel_index=None, measurement_id=None, 
                      limit=100, time_start=None, time_end=None):
    """Get telemetry data from a specific device"""
    try:
        url = f"{BASE_URL}/list_telemetry_data"
        
        # Set default time range (last 24 hours) if not specified
        if time_end is None:
            time_end = int(datetime.now().timestamp() * 1000)  # Current time in milliseconds
        if time_start is None:
            time_start = int((datetime.now() - timedelta(days=1)).timestamp() * 1000)  # 1 day ago
        
        # Required and optional query parameters
        params = {
            "device_eui": device_eui,  # Required
            "time_start": time_start,
            "time_end": time_end,
            "limit": limit
        }
        
        # Optional parameters
        if channel_index is not None:
            params["channel_index"] = channel_index
        if measurement_id is not None:
            params["measurement_id"] = measurement_id
        
        response = requests.get(url, headers=HEADERS, params=params, auth=AUTH)
        
        telemetry_data = handle_response(response, f"GET Telemetry Data for {device_eui}")
        
        if telemetry_data is not None:
            # Parse and display the data in a clean format
            parse_telemetry_data(telemetry_data, device_eui)
            return telemetry_data
        
        return None
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed for GET Telemetry Data: {e}")
        return None

def main():
    """Main function to run API requests"""
    print("=== SenseCap LoRaWAN API Client ===")
    print(f"Using API ID: {API_ID[:10]}...")
    print(f"Base URL: {BASE_URL}")
    
    # Get all devices (nodes by default)
    print("\n1. Fetching all node devices...")
    devices = get_devices(device_type="2")  # 2 = nodes
    
    # Get gateways
    print("\n2. Fetching all gateway devices...")
    gateways = get_devices(device_type="1")  # 1 = gateways
    
    # If we have devices, get their running status
    if devices and isinstance(devices, list) and len(devices) > 0:
        device_euis = [device.get('device_eui') for device in devices if device.get('device_eui')]
        
        if device_euis:
            print(f"\n3. Fetching device running status...")
            running_status = get_device_running_status(device_euis)
            
            # Get telemetry data from the first device
            first_device_eui = device_euis[0]
            print(f"\n4. Fetching telemetry data for device {first_device_eui}...")
            telemetry_data = get_telemetry_data(first_device_eui, limit=50)
            
            print(f"\n5. Fetching latest telemetry data for device {first_device_eui}...")
            latest_data = get_latest_telemetry_data(first_device_eui)
    else:
        print("\nWARNING: No devices found or devices data is not in expected format")

if __name__ == "__main__":
    main()