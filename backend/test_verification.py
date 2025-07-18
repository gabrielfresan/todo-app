#!/usr/bin/env python3
"""
Test script for email verification functionality
This will test the new endpoints without running the full server
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000/auth"

def test_registration_flow():
    """Test the complete registration with email verification flow"""
    
    test_email = "test@example.com"
    test_name = "Test User"
    test_password = "password123"
    
    print("🧪 Testing Email Verification Flow")
    print("=" * 50)
    
    # Step 1: Register user (should create unverified user and send email)
    print("1. Testing registration...")
    register_data = {
        "email": test_email,
        "name": test_name,
        "password": test_password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=register_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 201:
            print("   ✅ Registration successful - email verification required")
        else:
            print("   ❌ Registration failed")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Step 2: Try to login without verification (should fail)
    print("\n2. Testing login without verification...")
    login_data = {
        "email": test_email,
        "password": test_password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 401:
            print("   ✅ Login correctly blocked for unverified email")
        else:
            print("   ❌ Login should have been blocked")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 3: Verify email with correct code
    print("\n3. Testing email verification...")
    # In a real scenario, you'd get this code from the email
    # For testing, use any 6-digit code since we're not running the server
    verify_data = {
        "email": test_email,
        "code": "123456"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/verify-email", json=verify_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ Email verification successful")
            access_token = response.json().get('access_token')
        else:
            print("   ❌ Email verification failed")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Step 4: Login after verification (should work)
    print("\n4. Testing login after verification...")
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ Login successful after verification")
        else:
            print("   ❌ Login failed after verification")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n🎉 Test completed!")

def test_email_validation():
    """Test email validation"""
    print("\n📧 Testing Email Validation")
    print("=" * 30)
    
    invalid_emails = [
        "invalid-email",
        "@example.com",
        "test@",
        "test.example.com",
        ""
    ]
    
    for email in invalid_emails:
        register_data = {
            "email": email,
            "name": "Test User",
            "password": "password123"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/register", json=register_data)
            print(f"   Email: '{email}' -> Status: {response.status_code}")
            
            if response.status_code == 400:
                print(f"      ✅ Correctly rejected")
            else:
                print(f"      ❌ Should have been rejected")
        except Exception as e:
            print(f"   ❌ Error testing {email}: {e}")

if __name__ == "__main__":
    print("📝 Email Verification Test Suite")
    print("Note: Make sure your Flask server is running on localhost:5000")
    print()
    
    test_email_validation()
    test_registration_flow()