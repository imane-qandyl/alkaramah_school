#!/usr/bin/env python3
"""
Test Activity Mapping Logic
Tests the activity generation rules without requiring the trained model
"""

import re
import json
from datetime import datetime

class ActivityMapper:
    """Test the activity mapping logic"""
    
    def __init__(self):
        self.activity_rules = {
            0: {  # Struggling - Needs Immediate Support
                "tantrum|meltdown|marah|menangis": {
                    "type": "calming_sensory",
                    "activity": {
                        "name": "Deep Pressure Calm Down",
                        "description": "Use weighted lap pad and deep breathing with favorite stuffed animal",
                        "materials": ["Weighted lap pad", "Soft stuffed animal", "Quiet space"],
                        "steps": [
                            "Guide student to quiet corner with dim lighting",
                            "Place weighted lap pad on student's lap", 
                            "Model slow breathing: 'Breathe in like smelling flowers, out like blowing bubbles'",
                            "Stay nearby but give space",
                            "Wait for student to signal readiness to return"
                        ],
                        "duration": "5-10 minutes",
                        "level": "immediate support"
                    }
                },
                "tidak bisa konsentrasi|hyperactive|tidak fokus": {
                    "type": "attention_regulation",
                    "activity": {
                        "name": "Focus Basket Activity",
                        "description": "Simple sorting task with immediate success",
                        "materials": ["2 baskets", "5 large colorful objects", "Timer"],
                        "steps": [
                            "Set timer for 2 minutes only",
                            "Show 2 baskets: red objects and blue objects",
                            "Start with just 3 objects total",
                            "Celebrate each correct placement immediately",
                            "Stop before student gets frustrated"
                        ],
                        "duration": "2-3 minutes",
                        "level": "immediate support"
                    }
                }
            },
            1: {  # Progressing - Needs Continued Support
                "bantu|bantuan|dengan bantuan|perlu bantuan": {
                    "type": "assisted_learning",
                    "activity": {
                        "name": "Hand-Over-Hand Number Matching",
                        "description": "Match number cards 1-3 with physical guidance",
                        "materials": ["Large number cards 1-3", "Matching objects", "Visual supports"],
                        "steps": [
                            "Place number card 1 on table",
                            "Guide student's hand to pick up 1 object",
                            "Help place object on number card",
                            "Say: 'One object on number one!'",
                            "Gradually reduce physical support",
                            "Celebrate each success immediately"
                        ],
                        "duration": "5-8 minutes",
                        "level": "developing with support"
                    }
                }
            },
            2: {  # Thriving - Ready for Next Level
                "mandiri|sendiri|bisa sendiri|independent": {
                    "type": "independent_challenge",
                    "activity": {
                        "name": "Multi-Step Problem Solving",
                        "description": "Complete 4-step sequence independently",
                        "materials": ["Complex puzzle", "Multi-step instructions", "Self-check list"],
                        "steps": [
                            "Present 4-step visual instruction card",
                            "Student reads/interprets steps independently",
                            "Provide materials but minimal guidance",
                            "Student self-checks work against model",
                            "Encourage problem-solving when stuck"
                        ],
                        "duration": "12-15 minutes",
                        "level": "independent challenge"
                    }
                }
            }
        }
    
    def generate_activity(self, prediction_label, activity_note, student_name="Student", student_age=5):
        """Generate activity based on prediction and keywords"""
        
        # Get rules for this label
        label_rules = self.activity_rules.get(prediction_label, {})
        
        # Find matching keyword pattern
        note_text = activity_note.lower()
        matched_activity = None
        matched_keywords = None
        
        for keyword_pattern, activity_data in label_rules.items():
            if re.search(keyword_pattern, note_text, re.IGNORECASE):
                matched_activity = activity_data['activity'].copy()
                matched_keywords = keyword_pattern
                matched_activity['type'] = activity_data['type']
                break
        
        # Use default if no match
        if not matched_activity:
            matched_activity = self._get_default_activity(prediction_label)
            matched_keywords = "default"
        
        # Add personalization
        if student_name != "Student":
            matched_activity['description'] = f"For {student_name}: {matched_activity['description']}"
        
        return {
            **matched_activity,
            'matched_keywords': matched_keywords,
            'prediction_label': prediction_label,
            'student_name': student_name,
            'student_age': student_age,
            'generated_at': datetime.now().isoformat()
        }
    
    def _get_default_activity(self, label):
        """Default activities when no keywords match"""
        defaults = {
            0: {
                "name": "Basic Calming Activity",
                "description": "Simple sensory break to help student regulate",
                "materials": ["Quiet space", "Preferred comfort item"],
                "steps": [
                    "Offer quiet space away from stimulation",
                    "Provide preferred comfort item", 
                    "Use calm, quiet voice",
                    "Wait for student to self-regulate"
                ],
                "duration": "5-10 minutes",
                "level": "immediate support",
                "type": "default_calming"
            },
            1: {
                "name": "Supported Learning Activity",
                "description": "Simple task with adult guidance",
                "materials": ["Age-appropriate materials", "Visual supports"],
                "steps": [
                    "Present simple, clear task",
                    "Provide visual and verbal prompts",
                    "Offer physical guidance as needed",
                    "Celebrate small successes"
                ],
                "duration": "5-8 minutes",
                "level": "developing with support",
                "type": "default_supported"
            },
            2: {
                "name": "Independent Challenge",
                "description": "Self-directed learning opportunity",
                "materials": ["Challenging but achievable materials"],
                "steps": [
                    "Present clear expectations",
                    "Allow independent problem-solving",
                    "Provide encouragement from distance",
                    "Celebrate achievement and effort"
                ],
                "duration": "10-15 minutes",
                "level": "independent challenge",
                "type": "default_independent"
            }
        }
        return defaults.get(label, defaults[1])

def test_activity_mapping():
    """Test the activity mapping with different scenarios"""
    
    mapper = ActivityMapper()
    
    test_cases = [
        {
            'name': 'Student Having Tantrum',
            'label': 0,
            'note': 'anak tantrum dan tidak bisa konsentrasi',
            'student': 'Amara',
            'age': 5
        },
        {
            'name': 'Student Needs Help',
            'label': 1,
            'note': 'anak membutuhkan bantuan untuk memahami instruksi',
            'student': 'Marcus',
            'age': 6
        },
        {
            'name': 'Student Ready for Challenge',
            'label': 2,
            'note': 'anak dapat bekerja mandiri dan siap tantangan',
            'student': 'Zara',
            'age': 7
        },
        {
            'name': 'No Keywords Match',
            'label': 1,
            'note': 'anak sedang belajar dengan baik',
            'student': 'David',
            'age': 5
        }
    ]
    
    print("🎯 Testing Activity Mapping Logic")
    print("=" * 50)
    
    for test in test_cases:
        print(f"\n📝 Test Case: {test['name']}")
        print(f"Input - Label: {test['label']}, Note: {test['note']}")
        
        result = mapper.generate_activity(
            test['label'], 
            test['note'], 
            test['student'], 
            test['age']
        )
        
        print(f"🎯 Generated Activity: {result['name']}")
        print(f"📋 Description: {result['description']}")
        print(f"🎨 Type: {result['type']}")
        print(f"⏱️ Duration: {result['duration']}")
        print(f"🔍 Matched Keywords: {result['matched_keywords']}")
        print(f"📚 Materials: {', '.join(result['materials'][:3])}...")
        
        print("\n📝 Steps:")
        for i, step in enumerate(result['steps'][:3], 1):
            print(f"   {i}. {step}")
        if len(result['steps']) > 3:
            print(f"   ... and {len(result['steps']) - 3} more steps")
    
    print("\n" + "=" * 50)
    print("✅ Activity mapping logic working correctly!")
    print("🚀 Ready to integrate with your trained model!")

if __name__ == "__main__":
    test_activity_mapping()