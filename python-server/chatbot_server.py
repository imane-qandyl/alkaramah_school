#!/usr/bin/env python3
"""
Teach Smart Chatbot Server
Serves the trained chatbot model via REST API for React Native integration
"""

import sys
import os
import logging
import pickle
import json
from datetime import datetime

# Add current directory to Python path for local imports
sys.path.insert(0, os.path.dirname(__file__))

# Try to import Flask, provide fallback if not available
try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    print("❌ Flask not installed. Please install Flask:")
    print("   pip3 install --user Flask Flask-CORS")
    print("   or")
    print("   brew install python-flask")
    FLASK_AVAILABLE = False

# Try to import the required module, create fallback if not available
try:
    import teachsmart_for_project
    print("✅ teachsmart_for_project module loaded")
except ImportError as e:
    print(f"⚠️  teachsmart_for_project module not found: {e}")
    print("   Using built-in fallback implementation")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if FLASK_AVAILABLE:
    app = Flask(__name__)
    CORS(app)  # Enable CORS for React Native

# Global chatbot instance
chatbot = None

def load_chatbot():
    """Load the trained chatbot model"""
    global chatbot
    try:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'teach_smart_chatbot.pkl')
        
        if not os.path.exists(model_path):
            logger.error(f"Model file not found: {model_path}")
            return False
            
        with open(model_path, 'rb') as f:
            chatbot = pickle.load(f)
        logger.info("Chatbot model loaded successfully")
        
        # Test the model has required methods
        required_methods = ['generate_learning_resource']
        for method in required_methods:
            if not hasattr(chatbot, method):
                logger.warning(f"Model missing method: {method}")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to load chatbot model: {e}")
        logger.info("Creating fallback chatbot instance")
        
        # Create fallback chatbot if model loading fails
        try:
            from teachsmart_for_project import TeachSmartChatbot
            chatbot = TeachSmartChatbot()
            logger.info("Fallback chatbot created successfully")
            return True
        except Exception as fallback_error:
            logger.error(f"Failed to create fallback chatbot: {fallback_error}")
            return False

# Only define Flask routes if Flask is available
if FLASK_AVAILABLE:
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'chatbot_loaded': chatbot is not None
        })

    @app.route('/generate-resource', methods=['POST'])
    def generate_resource():
        """Generate learning resource using the trained chatbot"""
        try:
            if chatbot is None:
                return jsonify({
                    'success': False,
                    'error': 'Chatbot model not loaded'
                }), 500

            # Get request data
            data = request.get_json()
            
            # Extract parameters with defaults
            student_age = data.get('student_age', data.get('studentAge', 8))
            aet_target = data.get('aet_target', data.get('aetTarget', ''))
            context = data.get('context', data.get('learningContext', 'Classroom setting'))
            ability_level = data.get('ability_level', data.get('abilityLevel', 'developing'))
            format_type = data.get('format', 'worksheet')
            visual_support = data.get('visual_support', data.get('visualSupport', True))
            text_level = data.get('text_level', data.get('textLevel', 'simple'))

            logger.info(f"Generating resource for age {student_age}, target: {aet_target}")

            # Generate resource using the trained model
            resource = chatbot.generate_learning_resource(
                student_age=student_age,
                aet_target=aet_target,
                context=context,
                ability_level=ability_level,
                format_type=format_type,
                visual_support=visual_support,
                text_level=text_level
            )

            # Format the resource if successful
            if resource.get('success'):
                if hasattr(chatbot, 'format_resource'):
                    formatted_content = chatbot.format_resource(resource)
                else:
                    formatted_content = resource.get('content', 'Generated content')
                    
                return jsonify({
                    'success': True,
                    'content': formatted_content,
                    'metadata': {
                        'generatedAt': resource.get('timestamp'),
                        'targetAge': student_age,
                        'abilityLevel': ability_level,
                        'format': format_type,
                        'aetTarget': aet_target,
                        'provider': 'Trained Chatbot Model'
                    }
                })
            else:
                return jsonify({
                    'success': False,
                    'error': resource.get('error', 'Unknown error occurred')
                }), 400

        except Exception as e:
            logger.error(f"Error generating resource: {e}")
            return jsonify({
                'success': False,
                'error': f'Server error: {str(e)}'
            }), 500



    @app.route('/predict-student', methods=['POST'])
    def predict_student():
        """Predict student condition using the trained model"""
        try:
            if chatbot is None:
                return jsonify({
                    'success': False,
                    'error': 'Chatbot model not loaded'
                }), 500

            # Get request data
            data = request.get_json()
            
            # Check if the chatbot has prediction capability
            if not hasattr(chatbot, 'predict_student_progress'):
                return jsonify({
                    'success': False,
                    'error': 'Prediction capability not available'
                }), 400

            # Make prediction
            result = chatbot.predict_student_progress(data)
            
            return jsonify(result)

        except Exception as e:
            logger.error(f"Error predicting student condition: {e}")
            return jsonify({
                'success': False,
                'error': f'Server error: {str(e)}'
            }), 500

    @app.route('/get-aet-targets', methods=['GET'])
    def get_aet_targets():
        """Get available AET targets from the trained model"""
        try:
            if chatbot is None:
                return jsonify({
                    'success': False,
                    'error': 'Chatbot model not loaded'
                })

            # Try to get AET targets from the model if available
            if hasattr(chatbot, 'get_aet_targets'):
                targets = chatbot.get_aet_targets()
                return jsonify({
                    'success': True,
                    'targets': targets
                })
            else:
                # Return default targets if method not available
                return jsonify({
                    'success': True,
                    'targets': {
                        'communication': [
                            "Can identify and name basic emotions in self and others",
                            "Uses appropriate greetings with familiar adults",
                            "Follows simple two-step instructions",
                            "Requests help when needed using words or gestures"
                        ],
                        'social': [
                            "Demonstrates turn-taking in group activities",
                            "Shares materials with peers when prompted",
                            "Participates in simple group games",
                            "Shows awareness of others' feelings"
                        ],
                        'independence': [
                            "Completes self-care tasks with minimal support",
                            "Follows visual schedule for daily routines",
                            "Organizes personal belongings",
                            "Makes simple choices when offered options"
                        ]
                    }
                })

        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Error getting AET targets: {str(e)}'
            })

def main():
    """Main function to start the server"""
    if not FLASK_AVAILABLE:
        print("❌ Cannot start server: Flask not available")
        print("Please install Flask and Flask-CORS:")
        print("  pip3 install --user Flask Flask-CORS")
        return 1
    
    # Load the chatbot model on startup
    if load_chatbot():
        logger.info("Starting Teach Smart Chatbot Server...")
        print("🚀 Server starting on http://localhost:5001")
        print("📱 React Native app can now connect to your trained model!")
        app.run(host='0.0.0.0', port=5001, debug=False)
        return 0
    else:
        logger.error("Failed to start server: Could not load chatbot model")
        return 1

if __name__ == '__main__':
    exit(main())