#!/usr/bin/env python3
"""
Test script for the trained chatbot model
Run this to verify your model works before starting the server
"""

import pickle
import os
import sys

def test_model():
    """Test the trained chatbot model"""
    print("🤖 Testing Teach Smart Chatbot Model...")
    
    # Check if model file exists
    model_path = os.path.join(os.path.dirname(__file__), '..', 'teach_smart_chatbot.pkl')
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        print("   Make sure 'teach_smart_chatbot.pkl' is in the project root directory")
        return False
    
    print(f"✅ Model file found: {model_path}")
    
    try:
        # Load the model
        print("📦 Loading model...")
        with open(model_path, 'rb') as f:
            chatbot = pickle.load(f)
        print("✅ Model loaded successfully")
        
        # Check required methods
        required_methods = ['generate_learning_resource', 'format_resource']
        for method in required_methods:
            if hasattr(chatbot, method):
                print(f"✅ Method '{method}' found")
            else:
                print(f"⚠️  Method '{method}' not found (may cause issues)")
        
        # Test resource generation
        print("\n🧪 Testing resource generation...")
        try:
            test_params = {
                'student_age': 8,
                'aet_target': 'Can identify and name basic emotions in self and others',
                'context': 'Quiet classroom with visual supports',
                'ability_level': 'developing',
                'format_type': 'worksheet',
                'visual_support': True,
                'text_level': 'simple'
            }
            
            resource = chatbot.generate_learning_resource(**test_params)
            
            if resource and resource.get('success'):
                print("✅ Resource generation successful")
                
                # Test formatting
                if hasattr(chatbot, 'format_resource'):
                    formatted = chatbot.format_resource(resource)
                    print("✅ Resource formatting successful")
                    print(f"📄 Generated content preview: {str(formatted)[:100]}...")
                else:
                    print("⚠️  format_resource method not available")
                
                return True
            else:
                print(f"❌ Resource generation failed: {resource}")
                return False
                
        except Exception as e:
            print(f"❌ Error during resource generation: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("   This might be due to:")
        print("   - Incompatible Python version")
        print("   - Missing dependencies")
        print("   - Corrupted model file")
        return False

def main():
    """Main test function"""
    print("=" * 50)
    print("🎓 Teach Smart Chatbot Model Test")
    print("=" * 50)
    
    success = test_model()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! Your model is ready to use.")
        print("💡 Next step: Run './start_server.sh' to start the server")
    else:
        print("❌ Tests failed. Please fix the issues above.")
        print("💡 Check the model file and dependencies")
    print("=" * 50)
    
    return 0 if success else 1

if __name__ == '__main__':
    sys.exit(main())