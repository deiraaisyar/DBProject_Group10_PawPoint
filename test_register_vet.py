#!/usr/bin/env python3
"""
Test script untuk register veterinarian dan cek apakah berhasil link dengan license_no
"""
import requests
import json

API_URL = "http://localhost:5000"

def test_register_vet():
    """Register veterinarian dengan license number"""
    
    # Data untuk register
    register_data = {
        "first_name": "Dr. Test",
        "last_name": "Veterinarian",
        "email": "drtest@pawpoint.com",
        "password": "testpass123",
        "phone_no": "08123456789",
        "role": "vet",  # atau "veterinarian"
        "license_no": "VET-2025-001"  # License yang available
    }
    
    print("=" * 60)
    print("TEST: Register Veterinarian")
    print("=" * 60)
    print(f"\n📝 Register data:")
    print(json.dumps(register_data, indent=2))
    
    try:
        # Register
        print(f"\n🔄 Sending POST request to {API_URL}/register...")
        response = requests.post(
            f"{API_URL}/register",
            json=register_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📄 Response Body: {response.text}")
        
        if response.status_code == 201:
            print("\n✅ Registration SUCCESS!")
            
            # Login untuk test
            print("\n" + "=" * 60)
            print("TEST: Login")
            print("=" * 60)
            
            login_data = {
                "email": register_data["email"],
                "password": register_data["password"]
            }
            
            login_response = requests.post(
                f"{API_URL}/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"\n📊 Login Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                login_result = login_response.json()
                print("\n✅ Login SUCCESS!")
                print(f"👤 User: {login_result.get('user', {}).get('first_name')} {login_result.get('user', {}).get('last_name')}")
                print(f"🔑 Role: {login_result.get('user', {}).get('role')}")
                print(f"🆔 User ID: {login_result.get('user', {}).get('user_id')}")
                
                # Get all veterinarians to check if linked
                token = login_result.get('access_token')
                print("\n" + "=" * 60)
                print("TEST: Check Veterinarian Record")
                print("=" * 60)
                
                vets_response = requests.get(
                    f"{API_URL}/veterinarians",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if vets_response.status_code == 200:
                    vets = vets_response.json()
                    user_id = login_result.get('user', {}).get('user_id')
                    
                    my_vet = next((v for v in vets if v['user_id'] == user_id), None)
                    
                    if my_vet:
                        print("\n✅ Veterinarian record FOUND!")
                        print(f"🆔 Veterinarian ID: {my_vet['veterinarian_id']}")
                        print(f"📋 License No: {my_vet['license_no']}")
                        print(f"👤 User ID: {my_vet['user_id']}")
                        print(f"📧 Email: {my_vet['email']}")
                        print("\n🎉 TEST PASSED! Veterinarian successfully linked!")
                    else:
                        print("\n❌ TEST FAILED! Veterinarian record NOT FOUND!")
                        print(f"Expected user_id: {user_id}")
                        print(f"Available vets: {len(vets)}")
                else:
                    print(f"\n❌ Failed to get veterinarians: {vets_response.status_code}")
            else:
                print(f"\n❌ Login FAILED: {login_response.text}")
        else:
            print(f"\n❌ Registration FAILED!")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend server!")
        print("Please make sure the Flask server is running at http://localhost:5000")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_register_vet()
