#!/usr/bin/env python3
"""
Enhanced Activity Generator
Combines prediction model with activity mapping rules
"""

import joblib
import numpy as np
import json
import re
from datetime import datetime

class EnhancedActivityGenerator:
    """
    Combines autism therapy prediction with specific activity generation
    """
    
    def __init__(self, model_path='../teach_smart_chatbot.pkl'):
        """Load the trained model and activity mapping rules"""
        try:
            # Load trained model
            model_data = joblib.load(model_path)
            self.classifier = model_data['classifier']
            self.vectorizer = model_data['vectorizer']
            self.advice_map = model_data['advice_map']
            self.is_loaded = True
            print(f"✅ Trained model loaded from {model_path}")
            
            # Load activity mapping rules
            self.activity_rules = self._load_activity_rules()
            print(f"✅ Activity mapping rules loaded")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.is_loaded = False
    
    def _load_activity_rules(self):
        """Load activity mapping rules (simplified version for Python)"""
        return {
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
                },
                "tidak mau|menolak|aggressive": {
                    "type": "engagement_building",
                    "activity": {
                        "name": "Choice-Based Engagement",
                        "description": "Offer 2 simple choices to rebuild cooperation",
                        "materials": ["2 preferred activities", "Visual choice board"],
                        "steps": [
                            "Present 2 choices visually: 'Do you want blocks or puzzles?'",
                            "Honor the choice immediately",
                            "Start with 1-minute activity",
                            "End on positive note before resistance builds",
                            "Gradually increase expectations"
                        ],
                        "duration": "1-2 minutes",
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
                },
                "mulai memahami|sedikit bisa|kadang bisa": {
                    "type": "skill_building", 
                    "activity": {
                        "name": "Pattern Building with Support",
                        "description": "Create simple AB patterns with guidance",
                        "materials": ["2 colors of blocks", "Pattern strip", "Visual model"],
                        "steps": [
                            "Show completed pattern: red-blue-red-blue",
                            "Start new pattern with student",
                            "Place first block: 'Red block first'",
                            "Guide student to place blue block",
                            "Continue with decreasing support",
                            "Let student complete last 2 blocks independently"
                        ],
                        "duration": "6-8 minutes",
                        "level": "developing with support"
                    }
                },
                "visual|gambar|lihat": {
                    "type": "visual_learning",
                    "activity": {
                        "name": "Picture-Word Matching",
                        "description": "Match pictures to simple words with visual supports",
                        "materials": ["Picture cards", "Word cards", "Matching board"],
                        "steps": [
                            "Start with 3 familiar objects: ball, car, book",
                            "Show picture of ball, point to word 'ball'",
                            "Help student match picture to word",
                            "Use finger to trace word while saying it",
                            "Gradually add more picture-word pairs"
                        ],
                        "duration": "7-10 minutes",
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
                },
                "baik|bagus|excellent|sempurna": {
                    "type": "extension_activity",
                    "activity": {
                        "name": "Creative Extension Challenge",
                        "description": "Apply learned skills in new creative way",
                        "materials": ["Open-ended materials", "Challenge card", "Documentation tools"],
                        "steps": [
                            "Present open-ended challenge: 'Create your own pattern using any materials'",
                            "Student chooses materials and approach",
                            "Student explains their thinking process",
                            "Student documents their creation",
                            "Student presents to others"
                        ],
                        "duration": "15-20 minutes",
                        "level": "independent challenge"
                    }
                },
                "siap|ready|next level|advanced": {
                    "type": "advanced_skill",
                    "activity": {
                        "name": "Peer Collaboration Project",
                        "description": "Work with peer to complete complex task",
                        "materials": ["Collaborative materials", "Role cards", "Project rubric"],
                        "steps": [
                            "Assign complementary roles to each student",
                            "Students plan approach together",
                            "Students divide tasks and work collaboratively",
                            "Students check each other's work",
                            "Students present joint project"
                        ],
                        "duration": "20-25 minutes",
                        "level": "independent challenge"
                    }
                }
            }
        }
    
    def predict_and_generate_activity(self, value_1, value_2, value_3, activity_note, 
                                    student_name="Student", student_age=5, interests=None):
        """
        Predict student condition and generate specific activity
        """
        if not self.is_loaded:
            return {"error": "Model not loaded"}
        
        # Make prediction using existing model
        prediction_result = self._predict_condition(value_1, value_2, value_3, activity_note)
        
        if "error" in prediction_result:
            return prediction_result
        
        # Generate specific activity based on prediction + keywords
        activity = self._generate_specific_activity(
            prediction_result['label'], 
            activity_note, 
            student_name, 
            student_age, 
            interests
        )
        
        # Combine prediction and activity
        return {
            'success': True,
            'prediction': prediction_result,
            'activity': activity,
            'generated_at': datetime.now().isoformat(),
            'student_info': {
                'name': student_name,
                'age': student_age,
                'interests': interests or []
            }
        }
    
    def _predict_condition(self, value_1, value_2, value_3, activity_note):
        """Make prediction using trained model"""
        try:
            # Convert values to numeric features
            v1 = 1 if value_1.lower() == 'benar' else 0.5 if 'bantu' in value_1.lower() else 0
            v2 = 1 if value_2.lower() == 'benar' else 0.5 if 'bantu' in value_2.lower() else 0
            v3 = 1 if value_3.lower() == 'benar' else 0.5 if 'bantu' in value_3.lower() else 0
            
            # Create feature vector
            value_features = np.array([[v1, v2, v3]])
            text_features = self.vectorizer.transform([activity_note]).toarray()
            X = np.hstack([value_features, text_features])
            
            # Make prediction
            prediction = self.classifier.predict(X)[0]
            probabilities = self.classifier.predict_proba(X)[0]
            
            # Map labels to conditions
            condition_names = {
                0: "Struggling - Needs Immediate Support",
                1: "Progressing - Needs Continued Support",
                2: "Thriving - Ready for Next Level"
            }
            
            return {
                'label': int(prediction),
                'condition': condition_names[prediction],
                'advice': self.advice_map[prediction],
                'confidence': float(max(probabilities)),
                'probabilities': {
                    'struggling': float(probabilities[0]),
                    'needs_support': float(probabilities[1]) if len(probabilities) > 1 else 0.0,
                    'doing_well': float(probabilities[2]) if len(probabilities) > 2 else 0.0
                }
            }
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}
    
    def _generate_specific_activity(self, label, activity_note, student_name, student_age, interests):
        """Generate specific activity based on prediction label and keywords"""
        
        # Get rules for this label
        label_rules = self.activity_rules.get(label, {})
        
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
        
        # Use default activity if no keywords match
        if not matched_activity:
            matched_activity = self._get_default_activity(label)
            matched_keywords = "default"
        
        # Personalize the activity
        personalized_activity = self._personalize_activity(
            matched_activity, student_name, student_age, interests
        )
        
        return {
            **personalized_activity,
            'matched_keywords': matched_keywords,
            'prediction_label': label,
            'personalization_applied': True
        }
    
    def _get_default_activity(self, label):
        """Get default activity when no keywords match"""
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
    
    def _personalize_activity(self, activity, student_name, student_age, interests):
        """Add personalization based on student info"""
        personalized = activity.copy()
        
        # Add student name to description
        if student_name and student_name != "Student":
            personalized['description'] = f"For {student_name}: {personalized['description']}"
        
        # Adjust for age
        if student_age < 4:
            personalized['duration'] = "2-5 minutes"
            personalized['age_note'] = "Shortened for younger student"
        elif student_age > 8:
            personalized['duration'] = personalized.get('duration', '10-15 minutes')
            personalized['age_note'] = "Extended for older student"
        
        # Incorporate interests if provided
        if interests:
            interest_text = ", ".join(interests)
            personalized['personalization'] = f"Incorporate {student_name}'s interests: {interest_text}"
            
            # Modify materials to include interests
            if any(interest in ['cars', 'vehicles'] for interest in interests):
                personalized['materials'].append("Toy cars for motivation")
            elif any(interest in ['animals', 'pets'] for interest in interests):
                personalized['materials'].append("Animal figures or pictures")
            elif any(interest in ['music', 'songs'] for interest in interests):
                personalized['materials'].append("Background music or songs")
        
        return personalized

# Example usage
if __name__ == "__main__":
    print("🎯 Enhanced Activity Generator")
    print("=" * 40)
    
    # Initialize generator
    generator = EnhancedActivityGenerator('../teach_smart_chatbot.pkl')
    
    if not generator.is_loaded:
        print("Please ensure teach_smart_chatbot.pkl is available")
        exit(1)
    
    # Example: Student having tantrum
    print("\n📝 Example 1: Student Having Tantrum")
    result = generator.predict_and_generate_activity(
        value_1='salah',
        value_2='salah', 
        value_3='benar',
        activity_note='anak tantrum dan tidak bisa konsentrasi',
        student_name='Amara',
        student_age=5,
        interests=['bears', 'soft textures']
    )
    
    if result.get('success'):
        print(f"🎯 Prediction: {result['prediction']['condition']}")
        print(f"📋 Activity: {result['activity']['name']}")
        print(f"📝 Description: {result['activity']['description']}")
        print(f"⏱️ Duration: {result['activity']['duration']}")
        print(f"🎨 Type: {result['activity']['type']}")
    
    print("\n" + "="*50)
    print("✅ Enhanced activity generation ready!")
    print("Now your chatbot can generate specific, authentic activities!")