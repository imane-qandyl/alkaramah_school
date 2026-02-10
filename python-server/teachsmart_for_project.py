"""
TeachSmart for Project Module
Integration with the actual trained autism therapy prediction model
"""

import json
from datetime import datetime
import random
import joblib
import numpy as np
import os
import re

class AutismTherapyPredictor:
    """Actual trained model class for autism therapy prediction"""
    
    def __init__(self, model_path='../teach_smart_chatbot.pkl'):
        """Load the trained model from .pkl file"""
        try:
            # Adjust path relative to python-server directory
            if not os.path.isabs(model_path):
                model_path = os.path.join(os.path.dirname(__file__), model_path)
            
            model_data = joblib.load(model_path)
            self.classifier = model_data['classifier']
            self.vectorizer = model_data['vectorizer']
            self.advice_map = model_data['advice_map']
            self.is_loaded = True
            print(f"✅ Trained model loaded from {model_path}")
        except Exception as e:
            print(f"❌ Error loading trained model: {e}")
            self.is_loaded = False
    
    def predict_student_condition(self, value_1, value_2, value_3, activity_note):
        """
        Predict student condition using the trained model
        """
        if not self.is_loaded:
            return {"error": "Model not loaded"}
        
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

class TeachSmartChatbot:
    """
    Enhanced chatbot class that integrates with the trained autism therapy predictor
    """
    
    def __init__(self):
        self.model_name = "TeachSmart Trained Model"
        self.version = "1.0.0"
        
        # Initialize the trained predictor
        self.predictor = AutismTherapyPredictor()
        
        # Initialize activity mapping rules
        self.activity_rules = self._load_activity_mapping_rules()
        
    def generate_learning_resource(self, student_age=8, aet_target="", context="", 
                                 ability_level="developing", format_type="worksheet", 
                                 visual_support=True, text_level="simple"):
        """
        Generate learning resource using both trained model insights and educational content
        """
        
        # Check if this is a simple greeting first
        if self._is_greeting(aet_target):
            return self._generate_greeting_response()
        
        # Simulate processing time
        import time
        time.sleep(1)
        
        # Check if this is a question that needs specific activity generation
        if self._is_activity_request(aet_target):
            return self._generate_specific_activity_response(
                aet_target, student_age, ability_level, context
            )
        
        # Generate educational content
        content = self._generate_content(student_age, aet_target, context, 
                                       ability_level, format_type, visual_support, text_level)
        
        # Add model-based insights if available
        if self.predictor.is_loaded:
            content += self._add_model_insights(aet_target, ability_level)
        
        return {
            'success': True,
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'metadata': {
                'student_age': student_age,
                'aet_target': aet_target,
                'ability_level': ability_level,
                'format_type': format_type,
                'model_available': self.predictor.is_loaded
            }
        }
    
    def predict_student_progress(self, assessment_data):
        """
        Use the trained model to predict student progress
        """
        if not self.predictor.is_loaded:
            return {
                'success': False,
                'error': 'Trained model not available'
            }
        
        try:
            result = self.predictor.predict_student_condition(
                assessment_data.get('value_1', 'salah'),
                assessment_data.get('value_2', 'salah'), 
                assessment_data.get('value_3', 'salah'),
                assessment_data.get('activity_note', '')
            )
            
            return {
                'success': True,
                'prediction': result
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _add_model_insights(self, aet_target, ability_level):
        """Add insights from the trained model to educational content"""
        
        # Create sample assessment based on ability level
        if ability_level == 'emerging':
            sample_assessment = {
                'value_1': 'salah',
                'value_2': 'salah',
                'value_3': 'benar',
                'activity_note': 'anak membutuhkan bantuan ekstra untuk memahami instruksi'
            }
        elif ability_level == 'extending':
            sample_assessment = {
                'value_1': 'benar',
                'value_2': 'benar', 
                'value_3': 'benar',
                'activity_note': 'anak dapat mengikuti instruksi dengan baik dan mandiri'
            }
        else:  # developing
            sample_assessment = {
                'value_1': 'benar',
                'value_2': 'salah',
                'value_3': 'benar', 
                'activity_note': 'anak mulai memahami dengan bantuan visual'
            }
        
        # Get prediction
        prediction_result = self.predict_student_progress(sample_assessment)
        
        if prediction_result['success']:
            prediction = prediction_result['prediction']
            return f"""

## 🤖 AI Model Insights

**Predicted Student Condition:** {prediction['condition']}
**Confidence Level:** {prediction['confidence']:.1%}

**Recommended Approach:**
{prediction['advice']}

**Assessment Probabilities:**
- Struggling: {prediction['probabilities']['struggling']:.1%}
- Needs Support: {prediction['probabilities']['needs_support']:.1%}
- Doing Well: {prediction['probabilities']['doing_well']:.1%}

*These insights are generated by your trained autism therapy prediction model.*
"""
        else:
            return "\n\n## 🤖 AI Model Insights\n*Model insights unavailable for this request.*"
    
    def _generate_content(self, student_age, aet_target, context, ability_level, 
                         format_type, visual_support, text_level):
        """Generate content based on parameters"""
        
        # Check for specific topics and provide targeted advice
        target_lower = aet_target.lower()
        
        if 'meltdown' in target_lower or 'tantrum' in target_lower:
            return self._meltdown_content()
        elif 'focus' in target_lower or 'attention' in target_lower or 'concentrate' in target_lower:
            return self._focus_content()
        else:
            return f"""# Learning Resource: {aet_target}

**Student Age:** {student_age} years
**Ability Level:** {ability_level.title()}

## Learning Objective
{aet_target}

## Implementation Activities:

### Activity 1: Introduction
- Provide clear explanation with visual supports
- Demonstrate step-by-step process
- Allow practice opportunities

### Activity 2: Guided Practice
- Offer teacher support as needed
- Encourage appropriate peer interaction
- Provide multiple ways to demonstrate understanding

### Activity 3: Independent Practice
- Allow student to work at individual pace
- Offer choices in demonstration methods
- Ensure success criteria are clearly defined

## Assessment Guidelines:
- Observe student engagement and participation
- Document progress toward stated objective
- Note effective strategies for future reference
- Plan appropriate next steps based on outcomes

## Implementation Notes:
- Maintain consistent, predictable routines
- Incorporate student interests when possible
- Provide positive reinforcement regularly
- Allow for sensory breaks as needed"""
    
    def _meltdown_content(self):
        """Generate meltdown-specific content"""
        return """# Meltdown Management: Professional Guidelines

## Understanding Meltdowns
Meltdowns are neurological responses to overwhelming situations, distinct from behavioral tantrums.

## Immediate Response Protocol:

### 1. Maintain Calm
- Use low, steady voice tone
- Avoid sudden movements
- Remain objective and professional

### 2. Ensure Safety
- Clear potential hazards from area
- Provide appropriate physical space
- Remove or reduce environmental triggers

### 3. Reduce Stimulation
- Lower lighting when possible
- Minimize noise levels
- Reduce visual distractions
- Offer noise-reducing equipment if available

## During Meltdown:

**Appropriate Actions:**
- Remain nearby while respecting personal space
- Use simple, calm language
- Offer comfort items when appropriate
- Allow natural progression of episode

**Actions to Avoid:**
- Attempting reasoning or negotiation
- Physical contact without permission
- Raising voice or showing frustration
- Making demands or giving instructions

## Post-Meltdown Recovery:

- Allow adequate recovery time
- Offer water or preferred snack
- Provide quiet environment
- Check in appropriately: "How are you feeling?"

## Professional Considerations:
- Document incidents for pattern analysis
- Meltdowns indicate communication of overwhelm
- Recovery requires patience and understanding
- Individual strategies may require adjustment"""
    
    def _focus_content(self):
        """Generate focus and attention-specific content"""
        return """# Attention and Focus: Educational Strategies

## Understanding Attention Challenges
Students with autism may experience focus difficulties due to sensory processing differences, executive function challenges, and difficulty filtering environmental distractions.

## Environmental Modifications:
- Minimize visual clutter and distractions
- Maintain consistent seating arrangements
- Provide designated quiet work areas
- Reduce background noise levels
- Utilize natural lighting when available

## Instructional Strategies:
- Break tasks into manageable components
- Use visual schedules and timing devices
- Provide clear, single-step instructions
- Incorporate movement breaks every 15-20 minutes
- Integrate student interests to maintain engagement

## Attention-Building Activities:
- Begin with 2-3 minute focused activities
- Use highly preferred activities initially
- Gradually increase duration based on success
- Incorporate appropriate sensory supports

## Behavioral Support Framework:
- Define and model attention behaviors
- Implement positive reinforcement systems
- Provide visual cues for attention expectations
- Develop self-monitoring tools for students

## Professional Considerations:
- Attention difficulties have neurological basis
- Individual attention profiles vary significantly
- Consistency and patience are essential
- Acknowledge and celebrate incremental progress"""
    
    def format_resource(self, resource_data):
        """Format the resource for display"""
        if not resource_data or not resource_data.get('success'):
            return "Error: Unable to format resource"
        
        content = resource_data.get('content', '')
        metadata = resource_data.get('metadata', {})
        
        # Check if this is a mapped activity (already formatted)
        if metadata.get('format_type') == 'mapped_activity':
            # Return content as-is since it's already properly formatted
            return content
        
        # Add header with metadata for other types
        formatted = f"""# Learning Resource

**Created:** {resource_data.get('timestamp', 'Unknown')}
**Student Age:** {metadata.get('student_age', 'Not specified')}
**Ability Level:** {metadata.get('ability_level', 'Not specified')}

---

{content}

---

*Generated by TeachSmart AI Model*
"""
        return formatted
    
    def _load_activity_mapping_rules(self):
        """Load activity mapping rules for generating specific activities"""
        return {
            0: {  # Struggling - Needs Immediate Support
                "tantrum|meltdown|marah|menangis|crying|upset": {
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
                "tidak bisa konsentrasi|hyperactive|tidak fokus|can't focus|attention": {
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
                "tidak mau|menolak|aggressive|refuses|won't participate": {
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
                },
                "turn[\\s\\-]?taking|sharing|won't share|grabbing|taking toys|teach turn|how do i teach turn": {
                    "type": "basic_social_skills",
                    "activity": {
                        "name": "Simple Turn-Taking with Timer",
                        "description": "Very basic turn-taking with highly preferred item and visual timer",
                        "materials": ["One highly preferred toy/activity", "Visual timer", "Turn-taking cards"],
                        "steps": [
                            "Start with just 10-15 seconds per turn",
                            "Use visual timer that student can see counting down",
                            "Hold up 'My Turn' card when it's student's turn",
                            "Hold up 'Your Turn' card when it's adult's turn",
                            "Immediately give item when timer goes off",
                            "Celebrate: 'Great waiting!' when student waits"
                        ],
                        "duration": "3-5 minutes total",
                        "level": "immediate support"
                    }
                }
            },
            1: {  # Progressing - Needs Continued Support
                "count|counting|numbers|math": {
                    "type": "math_support",
                    "activity": {
                        "name": "Counting Bears Adventure",
                        "description": "Use teddy bear counters in favorite colors",
                        "materials": ["Teddy bear counters", "Ice cube trays", "Number cards 1-10"],
                        "steps": [
                            "Start with 5 colorful teddy bears",
                            "Show how to place one bear in each ice cube compartment",
                            "Count together: 'One bear, two bears, three bears...'",
                            "Let student try with 3 bears first, then build up",
                            "Sing counting songs while placing bears"
                        ],
                        "duration": "8-12 minutes",
                        "level": "developing with support"
                    }
                },
                "bantu|bantuan|dengan bantuan|perlu bantuan|needs help|with help": {
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
                "turn[\\s\\-]?taking|sharing|social skills|playing with others|teach turn|how do i teach turn": {
                    "type": "social_skills_development",
                    "activity": {
                        "name": "Turn-Taking with Visual Supports",
                        "description": "Practice turn-taking with clear visual cues and structured routine",
                        "materials": ["Preferred activity/toy", "Turn-taking visual cards", "Sand timer (1-2 minutes)", "Social story about turn-taking"],
                        "steps": [
                            "Read simple social story about turn-taking first",
                            "Show 'My Turn' and 'Your Turn' cards clearly",
                            "Start with 30-second turns using sand timer",
                            "Model appropriate language: 'My turn now' and 'Your turn next'",
                            "Practice with adult first, then introduce peer if ready",
                            "Praise waiting behavior: 'Great job waiting for your turn!'",
                            "Gradually increase turn length to 1-2 minutes"
                        ],
                        "duration": "10-15 minutes",
                        "level": "developing with support"
                    }
                }
            },
            2: {  # Thriving - Ready for Next Level
                "mandiri|sendiri|bisa sendiri|independent|can do alone": {
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
                "baik|bagus|excellent|sempurna|doing well|great progress": {
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
                "siap|ready|next level|advanced|challenge": {
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
                },
                "shapes|colors|sorting|classification": {
                    "type": "advanced_academic",
                    "activity": {
                        "name": "Complex Shape Sorting Challenge",
                        "description": "Sort shapes by multiple attributes independently",
                        "materials": ["Various shapes in multiple colors and sizes", "Sorting mats", "Recording sheet"],
                        "steps": [
                            "Present shapes with 3 attributes: color, size, shape",
                            "Student creates own sorting rule",
                            "Student explains their sorting logic",
                            "Student records results on sheet",
                            "Student teaches sorting rule to peer"
                        ],
                        "duration": "15-18 minutes",
                        "level": "independent challenge"
                    }
                },
                "turn[\\s\\-]?taking|sharing|social skills|peer interaction|group work|teach turn|how do i teach turn": {
                    "type": "advanced_social_skills",
                    "activity": {
                        "name": "Flexible Turn-Taking Leadership",
                        "description": "Lead turn-taking activities with peers and teach others",
                        "materials": ["Multiple activities for choice", "Turn-taking rule cards", "Timer options", "Peer group"],
                        "steps": [
                            "Student chooses activity and explains rules to peers",
                            "Student demonstrates appropriate turn-taking language",
                            "Student helps peers negotiate turn length and order",
                            "Student models problem-solving when conflicts arise",
                            "Student leads reflection: 'How did our turn-taking go?'",
                            "Student teaches turn-taking strategies to younger students"
                        ],
                        "duration": "20-25 minutes",
                        "level": "independent challenge"
                    }
                }
            }
        }
    
    def _find_matching_activity(self, prediction_label, activity_note, student_name="Student", student_age=5, interests=None):
        """Find matching activity based on prediction label and keywords"""
        
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
            matched_activity = self._get_default_activity_for_label(prediction_label)
            matched_keywords = "default"
        
        # Personalize the activity
        personalized_activity = self._personalize_activity(
            matched_activity, student_name, student_age, interests
        )
        
        return {
            **personalized_activity,
            'matched_keywords': matched_keywords,
            'prediction_label': prediction_label
        }
    
    def _get_default_activity_for_label(self, label):
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
            if 'duration' in personalized:
                current_duration = personalized['duration']
                if '5-8' in current_duration:
                    personalized['duration'] = "8-12 minutes"
                elif '2-3' in current_duration:
                    personalized['duration'] = "5-8 minutes"
            personalized['age_note'] = "Extended for older student"
        
        # Incorporate interests if provided
        if interests:
            interest_text = ", ".join(interests)
            personalized['personalization'] = f"Incorporate {student_name}'s interests: {interest_text}"
            
            # Modify materials and steps based on interests
            if any(interest in ['bears', 'teddy'] for interest in interests):
                if "objects" in str(personalized.get('materials', [])):
                    personalized['materials'] = [m.replace("objects", "teddy bear counters") if "objects" in m else m for m in personalized['materials']]
            
            if any(interest in ['cars', 'vehicles'] for interest in interests):
                personalized['materials'].append("Toy cars for motivation")
                if personalized['name'] == "Focus Basket Activity":
                    personalized['name'] = "Car Garage Sorting"
                    personalized['description'] = personalized['description'].replace("objects", "toy cars")
            
            if any(interest in ['animals', 'pets'] for interest in interests):
                personalized['materials'].append("Animal figures or pictures")
            
            if any(interest in ['music', 'songs'] for interest in interests):
                personalized['materials'].append("Background music or songs")
                if "counting" in personalized['name'].lower():
                    personalized['steps'].append("Sing counting songs together")
        
        return personalized
    
    def _is_activity_request(self, aet_target):
        """Check if the request is asking for specific activities"""
        activity_keywords = [
            'activities', 'activity', 'kegiatan', 'latihan',
            'what can i do', 'how can i help', 'suggestions',
            'ideas', 'strategies', 'exercises',
            'how do i teach', 'how to teach', 'teaching',
            'turn-taking', 'turn taking', 'sharing', 'social skills'
        ]
        target_lower = aet_target.lower()
        return any(keyword in target_lower for keyword in activity_keywords)
    
    def _is_greeting(self, aet_target):
        """Check if the input is a simple greeting"""
        greeting_patterns = [
            r'^hello\s*[!.?]*$',
            r'^hi\s*[!.?]*$', 
            r'^hey\s*[!.?]*$',
            r'^good morning\s*[!.?]*$',
            r'^good afternoon\s*[!.?]*$',
            r'^good evening\s*[!.?]*$',
            r'^halo\s*[!.?]*$',  # Indonesian greeting
            r'^hai\s*[!.?]*$',   # Indonesian greeting
            # Also handle formatted inputs from the chat interface
            r'^teacher question:\s*(hello|hi|hey|good morning|good afternoon|good evening|halo|hai)\s*[!.?]*$',
            r'^for student .+:\s*(hello|hi|hey|good morning|good afternoon|good evening|halo|hai)\s*[!.?]*$'
        ]
        
        target_lower = aet_target.lower().strip()
        return any(re.search(pattern, target_lower, re.IGNORECASE) for pattern in greeting_patterns)
    
    def _generate_greeting_response(self):
        """Generate a simple greeting response"""
        greeting_responses = [
            "Hello! How can I assist you today?",
            "Hi there! I'm here to help you create educational resources for students with autism. What would you like to work on?",
            "Good day! I'm TeachSmart, your AI assistant for autism-friendly educational content. How can I help you today?",
            "Hello! I'm ready to help you create personalized learning activities. What's your teaching goal today?",
            "Hi! I'm here to support you with autism-friendly educational resources. What can I help you with?"
        ]
        
        import random
        response = random.choice(greeting_responses)
        
        return {
            'success': True,
            'content': response,
            'timestamp': datetime.now().isoformat(),
            'metadata': {
                'response_type': 'greeting',
                'provider': 'TeachSmart Trained Model'
            }
        }
    
    def _generate_specific_activity_response(self, aet_target, student_age, ability_level, context):
        """Generate specific activity suggestions using activity mapping"""
        
        # Extract student info from the request
        student_name = self._extract_student_name(aet_target)
        interests = self._extract_interests(aet_target)
        
        # Create sample assessment based on ability level and context
        assessment_data = self._create_sample_assessment(ability_level, context, aet_target)
        
        # Use the trained model to get prediction if available
        if self.predictor.is_loaded:
            try:
                prediction_result = self.predictor.predict_student_condition(
                    assessment_data['value_1'],
                    assessment_data['value_2'], 
                    assessment_data['value_3'],
                    assessment_data['activity_note']
                )
                
                # Generate specific activity using mapping
                activity = self._find_matching_activity(
                    prediction_result['label'],
                    assessment_data['activity_note'],
                    student_name,
                    student_age,
                    interests
                )
                
                # Format as complete response
                content = self._format_mapped_activity_response(
                    activity, prediction_result, aet_target, student_age, ability_level
                )
                
                return {
                    'success': True,
                    'content': content,
                    'timestamp': datetime.now().isoformat(),
                    'metadata': {
                        'student_age': student_age,
                        'aet_target': aet_target,
                        'ability_level': ability_level,
                        'format_type': 'mapped_activity',
                        'model_available': True,
                        'activity_type': activity.get('type', 'unknown'),
                        'prediction_label': activity.get('prediction_label', -1)
                    }
                }
                
            except Exception as e:
                print(f"Error using trained model for activity mapping: {e}")
        
        # Fallback to rule-based activity generation
        return self._generate_rule_based_activities(aet_target, student_age, ability_level, interests)
    
    def _format_mapped_activity_response(self, activity, prediction_result, aet_target, student_age, ability_level):
        """Format the mapped activity as a complete learning resource with professional design"""
        
        content = f"""# Learning Resource: {aet_target}

**Student Age:** {student_age} years
**Ability Level:** {ability_level.title()}
**Duration:** {activity['duration']}

## Recommended Activity: {activity['name']}

**Description:** {activity['description']}

### Materials Required:
"""
        
        for i, material in enumerate(activity['materials'], 1):
            content += f"{i}. {material}\n"
        
        content += f"""
### Implementation Steps:
"""
        
        for i, step in enumerate(activity['steps'], 1):
            content += f"{i}. {step}\n"
        
        # Add personalization notes if available
        if activity.get('personalization'):
            content += f"""
### Personalization Notes:
• {activity['personalization']}
"""
        
        content += f"""
### Assessment Criteria:
• Student demonstrates engagement and participation
• Student follows instructions with appropriate support level
• Student shows progress toward learning objective
• Student maintains appropriate emotional regulation

### Differentiation Options:

**For Emerging Level:**
• Provide additional visual supports and physical guidance
• Break tasks into smaller steps with extended processing time

**For Developing Level:**
• Use visual supports with moderate guidance
• Encourage gradual independence with gentle prompts

**For Extending Level:**
• Add complexity and encourage peer teaching
• Include problem-solving and creative variations

### AI Model Assessment:
**Predicted Condition:** {prediction_result['condition']}
**Confidence:** {prediction_result['confidence']:.0%}
**Recommendation:** {prediction_result['advice']}"""
        
        return content
    
    def _extract_student_name(self, text):
        """Extract student name from text"""
        # Look for patterns like "for Amara", "student Amara", "Amara will"
        name_patterns = [
            r'(?:for|student)\s+([A-Z][a-z]+)',
            r'([A-Z][a-z]+)\s+(?:will|can|needs)',
            r'([A-Z][a-z]+)\s+\d+\s*\(',  # "Amara 6 (5 years old)"
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        return "Student"
    
    def _extract_interests(self, text):
        """Extract interests from text"""
        interest_keywords = {
            'bears': ['bear', 'teddy', 'bears'],
            'cars': ['car', 'vehicle', 'truck', 'cars'],
            'animals': ['animal', 'pet', 'dog', 'cat', 'animals'],
            'music': ['music', 'song', 'singing', 'songs'],
            'colors': ['color', 'colorful', 'rainbow', 'colors'],
            'blocks': ['block', 'building', 'lego', 'blocks'],
            'books': ['book', 'story', 'reading', 'books'],
            'art': ['art', 'drawing', 'painting', 'craft']
        }
        
        found_interests = []
        text_lower = text.lower()
        
        for interest, keywords in interest_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                found_interests.append(interest)
        
        return found_interests
    
    def _create_sample_assessment(self, ability_level, context, aet_target):
        """Create sample assessment data based on ability level"""
        target_lower = aet_target.lower()
        
        # Check for specific behavioral indicators
        if any(word in target_lower for word in ['tantrum', 'meltdown', 'crying', 'upset']):
            return {
                'value_1': 'salah',
                'value_2': 'salah',
                'value_3': 'benar',
                'activity_note': 'anak tantrum dan tidak bisa konsentrasi'
            }
        elif any(word in target_lower for word in ['turn-taking', 'turn taking', 'sharing', 'social skills', 'peer interaction']):
            # Specific handling for turn-taking and social skills
            if ability_level == 'emerging':
                return {
                    'value_1': 'salah',
                    'value_2': 'salah',
                    'value_3': 'benar',
                    'activity_note': 'student needs help with turn-taking and sharing activities'
                }
            elif ability_level == 'extending':
                return {
                    'value_1': 'benar',
                    'value_2': 'benar',
                    'value_3': 'benar',
                    'activity_note': 'student ready for advanced turn-taking and peer interaction challenges'
                }
            else:  # developing
                return {
                    'value_1': 'benar',
                    'value_2': 'salah',
                    'value_3': 'benar',
                    'activity_note': 'student learning turn-taking with visual supports and sharing activities'
                }
        elif any(word in target_lower for word in ['help', 'support', 'assistance', 'bantu']):
            return {
                'value_1': 'benar',
                'value_2': 'salah',
                'value_3': 'benar',
                'activity_note': 'anak membutuhkan bantuan untuk memahami instruksi'
            }
        elif any(word in target_lower for word in ['independent', 'advanced', 'ready', 'mandiri']):
            return {
                'value_1': 'benar',
                'value_2': 'benar',
                'value_3': 'benar',
                'activity_note': 'anak dapat mengikuti instruksi dengan baik dan mandiri'
            }
        else:
            # Default based on ability level
            if ability_level == 'emerging':
                return {
                    'value_1': 'salah',
                    'value_2': 'salah',
                    'value_3': 'benar',
                    'activity_note': 'anak membutuhkan bantuan ekstra untuk memahami'
                }
            elif ability_level == 'extending':
                return {
                    'value_1': 'benar',
                    'value_2': 'benar',
                    'value_3': 'benar',
                    'activity_note': 'anak siap untuk tantangan yang lebih kompleks'
                }
            else:  # developing
                return {
                    'value_1': 'benar',
                    'value_2': 'salah',
                    'value_3': 'benar',
                    'activity_note': 'anak mulai memahami dengan bantuan visual'
                }
    
    def _generate_rule_based_activities(self, aet_target, student_age, ability_level, interests):
        """Generate activities using rule-based approach"""
        
        # Determine activity type based on target
        target_lower = aet_target.lower()
        
        if any(word in target_lower for word in ['count', 'number', 'math']):
            activities = self._get_math_activities(student_age, ability_level, interests)
        elif any(word in target_lower for word in ['shape', 'color', 'sort']):
            activities = self._get_sorting_activities(student_age, ability_level, interests)
        elif any(word in target_lower for word in ['communication', 'talk', 'speak']):
            activities = self._get_communication_activities(student_age, ability_level, interests)
        elif any(word in target_lower for word in ['calm', 'tantrum', 'upset']):
            activities = self._get_calming_activities(student_age, ability_level, interests)
        else:
            activities = self._get_general_activities(student_age, ability_level, interests)
        
        # Format as learning resource
        content = self._format_activities_as_content(activities, aet_target, student_age, ability_level)
        
        return {
            'success': True,
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'metadata': {
                'student_age': student_age,
                'aet_target': aet_target,
                'ability_level': ability_level,
                'format_type': 'specific_activities',
                'model_available': self.predictor.is_loaded
            }
        }
    
    def _get_math_activities(self, age, level, interests):
        """Get math-specific activities"""
        base_activity = {
            'name': 'Counting Practice',
            'materials': ['Objects to count', 'Number cards'],
            'duration': '5-8 minutes'
        }
        
        if 'bears' in interests:
            return [{
                **base_activity,
                'name': 'Counting Bears Adventure',
                'description': 'Use teddy bear counters in favorite colors',
                'materials': ['Teddy bear counters', 'Ice cube trays', 'Number cards 1-10'],
                'steps': [
                    'Start with 5 colorful teddy bears',
                    'Show how to place one bear in each ice cube compartment',
                    'Count together: "One bear, two bears, three bears..."',
                    'Let student try with 3 bears first, then build up',
                    'Sing counting songs while placing bears'
                ]
            }]
        else:
            return [{
                **base_activity,
                'description': f'Practice counting objects appropriate for age {age}',
                'steps': [
                    'Start with 3-5 objects',
                    'Demonstrate one-to-one correspondence',
                    'Count together slowly',
                    'Let student try independently',
                    'Gradually increase number of objects'
                ]
            }]
    
    def _get_sorting_activities(self, age, level, interests):
        """Get sorting/classification activities"""
        if 'cars' in interests:
            return [{
                'name': 'Car Garage Sorting',
                'description': 'Sort toy cars by color and size into garages',
                'materials': ['Toy cars in different colors', 'Small boxes as garages', 'Labels'],
                'steps': [
                    'Set up 4 "garages" (boxes) with color labels',
                    'Start with 2 colors only',
                    'Show: "Red cars go in the red garage"',
                    'Let student touch and explore each car',
                    'Gradually add more colors and sizes'
                ],
                'duration': '6-10 minutes'
            }]
        else:
            return [{
                'name': 'Shape and Color Sorting',
                'description': 'Sort shapes by attributes',
                'materials': ['Foam shapes', 'Sorting containers', 'Visual labels'],
                'steps': [
                    'Start with 2 shapes and 2 colors',
                    'Demonstrate sorting by one attribute',
                    'Let student practice with guidance',
                    'Gradually increase complexity',
                    'Celebrate successful sorting'
                ],
                'duration': '5-8 minutes'
            }]
    
    def _get_communication_activities(self, age, level, interests):
        """Get communication activities"""
        return [{
            'name': 'Following Instructions Practice',
            'description': 'Practice following 1-2 step instructions',
            'materials': ['Visual instruction cards', 'Simple objects', 'Reward system'],
            'steps': [
                'Start with 1-step instructions',
                'Use visual supports with words',
                'Give clear, simple directions',
                'Wait for completion before next step',
                'Celebrate successful following'
            ],
            'duration': '5-10 minutes'
        }]
    
    def _get_calming_activities(self, age, level, interests):
        """Get calming/regulation activities"""
        return [{
            'name': 'Calm Down Strategies',
            'description': 'Practice self-regulation techniques',
            'materials': ['Quiet space', 'Comfort items', 'Visual cues'],
            'steps': [
                'Create designated calm space',
                'Teach deep breathing with visual cues',
                'Offer comfort items or fidgets',
                'Practice when student is calm first',
                'Use during actual upset moments'
            ],
            'duration': '3-10 minutes as needed'
        }]
    
    def _get_general_activities(self, age, level, interests):
        """Get general developmental activities"""
        return [{
            'name': 'Skill Building Activity',
            'description': f'Age-appropriate activity for {age}-year-old at {level} level',
            'materials': ['Age-appropriate materials', 'Visual supports'],
            'steps': [
                'Present clear, simple task',
                'Provide appropriate level of support',
                'Break into manageable steps',
                'Celebrate progress and effort',
                'Adjust difficulty as needed'
            ],
            'duration': '5-10 minutes'
        }]
    
    def _format_activities_as_content(self, activities, aet_target, student_age, ability_level):
        """Format activities as learning resource content"""
        
        content = f"""# Learning Activities: {aet_target}

**Created:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Student Age:** {student_age}
**Ability Level:** {ability_level.title()}
**Format:** Specific Activities

---

## Learning Objective
{aet_target}

## Age-Appropriate Activities (Age {student_age}):

"""
        
        for i, activity in enumerate(activities, 1):
            content += f"""### Activity {i}: {activity['name']}
**Description:** {activity['description']}

**Materials Needed:**
"""
            for material in activity['materials']:
                content += f"• {material}\n"
            
            content += f"\n**Duration:** {activity['duration']}\n\n**Steps:**\n"
            
            for j, step in enumerate(activity['steps'], 1):
                content += f"{j}. {step}\n"
            
            content += "\n"
        
        content += f"""## Differentiation for {ability_level.title()} Level:
• Provide additional visual supports as needed
• Break tasks into smaller steps if necessary
• Allow extra processing time
• Offer multiple ways to demonstrate understanding

## Assessment:
• Observe student engagement and participation
• Note progress toward learning objective
• Document successful strategies for future use
• Plan next steps based on student response

## Teacher Notes:
• Maintain predictable routine and structure
• Use student's interests when possible (incorporated above)
• Provide positive reinforcement frequently
• Allow for sensory breaks as needed
• Adjust activities based on student's daily needs

---

*Generated by TeachSmart Trained Model*"""
        
        return content

# For backward compatibility, create any other classes your model might need
class ResourceGenerator(TeachSmartChatbot):
    """Alias for TeachSmartChatbot"""
    pass

class AutismEducationBot(TeachSmartChatbot):
    """Alias for TeachSmartChatbot"""
    pass

class TeachSmart(TeachSmartChatbot):
    """Main TeachSmart class - alias for TeachSmartChatbot"""
    pass

# Export commonly used classes
__all__ = ['TeachSmartChatbot', 'ResourceGenerator', 'AutismEducationBot', 'TeachSmart']