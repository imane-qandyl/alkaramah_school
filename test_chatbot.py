#!/usr/bin/env python3
"""
Interactive test script for the trained chatbot
"""

import requests
import json

def test_student_assessment():
    """Test student assessment functionality"""
    print("🧪 Testing Student Assessment")
    print("=" * 40)
    
    test_cases = [
        {
            "name": "Struggling Student",
            "data": {
                "value_1": "salah",
                "value_2": "salah",
                "value_3": "salah",
                "activity_note": "anak tidak bisa fokus dan sering menangis"
            }
        },
        {
            "name": "Student with Help",
            "data": {
                "value_1": "benar",
                "value_2": "bantu",
                "value_3": "benar", 
                "activity_note": "anak bisa dengan bantuan guru"
            }
        },
        {
            "name": "Thriving Student",
            "data": {
                "value_1": "benar",
                "value_2": "benar",
                "value_3": "benar",
                "activity_note": "anak sangat aktif dan mudah memahami"
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📝 {test_case['name']}")
        try:
            response = requests.post(
                "http://localhost:5001/predict-student",
                json=test_case['data'],
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result['success']:
                    pred = result['prediction']
                    print(f"✅ Result: {pred['condition']}")
                    print(f"📊 Confidence: {pred['confidence']:.1%}")
                    print(f"💡 Advice: {pred['advice']}")
                else:
                    print(f"❌ Error: {result.get('error', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Connection Error: {e}")

def test_resource_generation():
    """Test educational resource generation"""
    print("\n\n🎯 Testing Resource Generation")
    print("=" * 40)
    
    test_data = {
        "student_age": 7,
        "aet_target": "Help student with turn-taking in group activities",
        "ability_level": "developing",
        "format": "worksheet",
        "visual_support": True
    }
    
    try:
        response = requests.post(
            "http://localhost:5001/generate-resource",
            json=test_data,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print("✅ Resource Generated Successfully!")
                print(f"📄 Length: {len(result['content'])} characters")
                print(f"🎯 Target: {result['metadata']['aetTarget']}")
                print(f"👶 Age: {result['metadata']['targetAge']}")
                print(f"🤖 Provider: {result['metadata']['provider']}")
                
                # Show first 200 characters of content
                content_preview = result['content'][:200] + "..." if len(result['content']) > 200 else result['content']
                print(f"\n📖 Content Preview:\n{content_preview}")
            else:
                print(f"❌ Generation failed: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_server_health():
    """Test server health"""
    print("🏥 Testing Server Health")
    print("=" * 40)
    
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Server Status: {result['status']}")
            print(f"🤖 Chatbot Loaded: {result['chatbot_loaded']}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("💡 Make sure the server is running: cd python-server && python3 chatbot_server.py")

if __name__ == "__main__":
    print("🚀 TeachSmart Chatbot Test Suite")
    print("=" * 50)
    
    # Test server health first
    test_server_health()
    
    # Test student assessment
    test_student_assessment()
    
    # Test resource generation
    test_resource_generation()
    
    print("\n" + "=" * 50)
    print("✅ Testing Complete!")
    print("\n💡 To test manually:")
    print("1. Use your React Native app (AI Chat tab)")
    print("2. Use curl commands shown above")
    print("3. Run: python3 standalone_pkl_usage.py")