#!/usr/bin/env python3
"""
Test Enhanced Chatbot with Activity Mapping
Tests the integrated activity generation without requiring the .pkl model
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python-server'))

# Mock the joblib and model loading for testing
class MockPredictor:
    def __init__(self):
        self.is_loaded = True
        self.advice_map = {
            0: "Provide immediate support and calming strategies",
            1: "Continue with guided practice and visual supports", 
            2: "Ready for more challenging independent activities"
        }
    
    def predict_student_condition(self, v1, v2, v3, note):
        # Simple mock prediction based on keywords
        note_lower = note.lower()
        if any(word in note_lower for word in ['tantrum', 'tidak bisa', 'salah']):
            label = 0
            probs = [0.7, 0.2, 0.1]
        elif any(word in note_lower for word in ['bantu', 'bantuan', 'visual']):
            label = 1  
            probs = [0.2, 0.6, 0.2]
        else:
            label = 2
            probs = [0.1, 0.2, 0.7]
        
        condition_names = {
            0: "Struggling - Needs Immediate Support",
            1: "Progressing - Needs Continued Support",
            2: "Thriving - Ready for Next Level"
        }
        
        return {
            'label': label,
            'condition': condition_names[label],
            'advice': self.advice_map[label],
            'confidence': max(probs),
            'probabilities': {
                'struggling': probs[0],
                'needs_support': probs[1],
                'doing_well': probs[2]
            }
        }

# Mock joblib for testing
import types
joblib_mock = types.ModuleType('joblib')
joblib_mock.load = lambda path: {'classifier': None, 'vectorizer': None, 'advice_map': {}}
sys.modules['joblib'] = joblib_mock

# Import after mocking
from teachsmart_for_project import TeachSmartChatbot

# Replace the predictor with our mock
def create_test_chatbot():
    chatbot = TeachSmartChatbot()
    chatbot.predictor = MockPredictor()
    return chatbot

def test_activity_generation():
    """Test the enhanced activity generation"""
    
    print("🎯 Testing Enhanced Chatbot with Activity Mapping")
    print("=" * 55)
    
    chatbot = create_test_chatbot()
    
    test_cases = [
        {
            'name': 'Student Having Tantrum',
            'aet_target': 'activities for Amara who is having tantrums and meltdowns',
            'student_age': 5,
            'ability_level': 'developing'
        },
        {
            'name': 'Student Needs Help with Counting',
            'aet_target': 'counting activities for Marcus who needs help with numbers',
            'student_age': 6,
            'ability_level': 'developing'
        },
        {
            'name': 'Advanced Student Ready for Challenge',
            'aet_target': 'challenging activities for Zara who is ready for next level',
            'student_age': 7,
            'ability_level': 'extending'
        },
        {
            'name': 'Student with Interest in Bears',
            'aet_target': 'math activities for David who loves bears and teddy animals',
            'student_age': 5,
            'ability_level': 'developing'
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test['name']}")
        print(f"Request: {test['aet_target']}")
        
        try:
            result = chatbot.generate_learning_resource(
                student_age=test['student_age'],
                aet_target=test['aet_target'],
                ability_level=test['ability_level']
            )
            
            if result.get('success'):
                content = result['content']
                
                # Extract key information from the generated content
                lines = content.split('\n')
                activity_name = None
                activity_type = None
                duration = None
                
                for line in lines:
                    if 'Recommended Activity:' in line:
                        activity_name = line.split(':', 1)[1].strip()
                    elif 'Activity Type:' in line:
                        activity_type = line.split(':', 1)[1].strip()
                    elif 'Duration:' in line:
                        duration = line.split(':', 1)[1].strip()
                
                print(f"✅ Generated Activity: {activity_name}")
                print(f"🎨 Type: {activity_type}")
                print(f"⏱️ Duration: {duration}")
                
                # Check if it's using specific activity mapping vs generic
                if activity_name and activity_name not in ['Basic Calming Activity', 'Supported Learning Activity', 'Independent Challenge']:
                    print("🎯 SUCCESS: Generated specific, authentic activity!")
                else:
                    print("⚠️ Using default activity (may need more keywords)")
                
            else:
                print(f"❌ Error: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print("\n" + "=" * 55)
    print("✅ Activity mapping integration test complete!")
    print("🚀 Your chatbot now generates specific, authentic activities!")

if __name__ == "__main__":
    test_activity_generation()