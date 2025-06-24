#!/usr/bin/env python3
"""
Database Format Script
This script fetches all records from the API and deletes them to clear/format the database.
Based on the API endpoints defined in frontend/src/utils/api.js
"""

import requests
import json
import sys
from typing import List, Dict, Any

# API Configuration
BASE_URL = 'http://localhost:5050/api'
ITEMS_ENDPOINT = f'{BASE_URL}/items'

def get_all_items() -> List[Dict[Any, Any]]:
    """
    Fetch all items from the API
    Returns: List of items or empty list if error
    """
    try:
        response = requests.get(ITEMS_ENDPOINT)
        response.raise_for_status()
        items = response.json()
        print(f"✓ Found {len(items)} items in database")
        return items
    except requests.exceptions.ConnectionError:
        print("✗ Error: Could not connect to the API server")
        print("  Make sure the backend server is running on localhost:5050")
        return []
    except requests.exceptions.RequestException as e:
        print(f"✗ Error fetching items: {e}")
        return []
    except json.JSONDecodeError:
        print("✗ Error: Invalid JSON response from server")
        return []

def delete_item(item_id: str) -> bool:
    """
    Delete a single item by ID
    Returns: True if successful, False otherwise
    """
    try:
        response = requests.delete(f'{ITEMS_ENDPOINT}/{item_id}')
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Error deleting item {item_id}: {e}")
        return False

def format_database():
    """
    Main function to format (clear) the database
    """
    print("=" * 50)
    print("DATABASE FORMAT SCRIPT")
    print("=" * 50)
    print("This will delete ALL records from the database!")
    
    # Ask for confirmation
    confirmation = input("\nAre you sure you want to proceed? (yes/no): ").lower().strip()
    if confirmation != 'yes':
        print("Operation cancelled.")
        return
    
    # Get all items
    print("\n1. Fetching all items...")
    items = get_all_items()
    
    if not items:
        print("No items found or unable to fetch items.")
        return
    
    # Delete each item
    print(f"\n2. Deleting {len(items)} items...")
    deleted_count = 0
    failed_count = 0
    
    for item in items:
        item_id = item.get('_id') or item.get('id')  # Handle both MongoDB _id and regular id
        if not item_id:
            print(f"✗ Skipping item without ID: {item}")
            failed_count += 1
            continue
        
        if delete_item(item_id):
            deleted_count += 1
            print(f"✓ Deleted item: {item_id}")
        else:
            failed_count += 1
    
    # Summary
    print("\n" + "=" * 50)
    print("OPERATION SUMMARY")
    print("=" * 50)
    print(f"Total items found: {len(items)}")
    print(f"Successfully deleted: {deleted_count}")
    print(f"Failed to delete: {failed_count}")
    
    if failed_count == 0:
        print("\n✓ Database successfully formatted!")
    else:
        print(f"\n⚠ Database partially formatted. {failed_count} items could not be deleted.")

def test_connection():
    """
    Test if the API server is reachable
    """
    try:
        response = requests.get(f'{BASE_URL}/items')
        print(f"✓ API server is reachable (Status: {response.status_code})")
        return True
    except requests.exceptions.ConnectionError:
        print("✗ API server is not reachable")
        print("  Make sure the backend server is running on localhost:5050")
        return False
    except Exception as e:
        print(f"✗ Error testing connection: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        # Test mode - just check connection
        print("Testing API connection...")
        test_connection()
    else:
        # Format database
        if test_connection():
            format_database()
        else:
            print("\nCannot proceed without API connection.")
            sys.exit(1)
