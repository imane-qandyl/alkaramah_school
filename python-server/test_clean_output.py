#!/usr/bin/env python3
"""
Test script to verify the chatbot now returns ONLY model predictions
"""

import sys
sys.path.append('.')
from teachsmart_for_project import TeachSmartChatbot

def test_clean_output():
    """Test that chatbot returns only model predictions"""
    
    chatbot = TeachSmartChatbot()
    
    test_cases = [
        {
            'name': 'Turn-taking question',
            'input': {
                'student_age': 8,
                'aet_target': 'How do I teach turn-taking with autism?',
                'ability_level': 'developing'
            }
        },
        {
            'name': 'Struggling student',
            'input': {
                'student_age': 6,
                'aet_target': 'student having tantrums',
                'ability_level': 'emerging'
            }
        },
        {
            'name': 'Advanced student',
            'input': {
                'student_age': 9,
                'aet_target': 'ready for challenges',
                'ability_level': 'extending'
            }
        }
    ]
    
    print("🧪 Testing Clean Output (Model Predictions Only)")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_case['name']}")
        print("-" * 40)
        
        result = chatbot.generate_learning_resource(**test_case['input'])
        
        if result.get('success'):
            content = result.get('content', '')
            
            # Check if content contains ONLY model prediction
            lines = content.strip().split('\n')
            
            print(f"✅ Content ({len(lines)} lines):")
            print(content)
            
            # Verify it's clean (should be exactly 3 lines: condition, confidence, recommendation)
            if len(lines) == 3 and 'Predicted Condition:' in lines[0]:
                print("✅ CLEAN: Contains only model prediction")
            else:
                print("❌ DIRTY: Contains extra content")
                
        else:
            print(f"❌ FAILED: {result.get('error', 'Unknown error')}")
    
    print("\n" + "=" * 60)
    print("✅ Test completed!")

if __name__ == "__main__":
    test_clean_output()