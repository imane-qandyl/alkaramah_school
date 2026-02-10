#!/usr/bin/env python3
"""
Standalone script showing how to use the teach_smart_chatbot.pkl file
Copy this code to any project to use the trained model
"""

import joblib
import numpy as np

class AutismTherapyPredictor:
    """Simple class to use the trained .pkl model"""
    
    def __init__(self, model_path='teach_smart_chatbot.pkl'):
        """Load the trained model from .pkl file"""
        try:
            model_data = joblib.load(model_path)
            self.classifier = model_data['classifier']
            self.vectorizer = model_data['vectorizer']
            self.advice_map = model_data['advice_map']
            self.is_loaded = True
            print(f"✅ Model loaded from {model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.is_loaded = False
    
    def predict(self, value_1, value_2, value_3, activity_note):
        """
        Predict student condition
        
        Args:
            value_1: First assessment (benar/salah)
            value_2: Second assessment (benar/salah)
            value_3: Third assessment (benar/salah)
            activity_note: Description of student behavior (Indonesian)
            
        Returns:
            Dictionary with prediction results
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

# Example usage
if __name__ == "__main__":
    print("🎯 Standalone .pkl Model Usage")
    print("=" * 35)
    
    # Initialize predictor
    predictor = AutismTherapyPredictor('teach_smart_chatbot.pkl')
    
    if not predictor.is_loaded:
        print("Please ensure teach_smart_chatbot.pkl is in the current directory")
        exit(1)
    
    # Example predictions
    examples = [
        {
            'name': 'Example 1: Struggling Student',
            'value_1': 'salah',
            'value_2': 'salah', 
            'value_3': 'benar',
            'activity_note': 'anak tidak bisa konsentrasi dan sering tantrum'
        },
        {
            'name': 'Example 2: Student Making Progress',
            'value_1': 'benar',
            'value_2': 'salah',
            'value_3': 'benar',
            'activity_note': 'anak mulai memahami dengan bantuan visual'
        },
        {
            'name': 'Example 3: Student Doing Well',
            'value_1': 'benar',
            'value_2': 'benar',
            'value_3': 'benar', 
            'activity_note': 'anak dapat mengikuti instruksi dengan baik'
        }
    ]
    
    for example in examples:
        print(f"\n📝 {example['name']}")
        print(f"Input: {example['value_1']}, {example['value_2']}, {example['value_3']}")
        print(f"Note: {example['activity_note']}")
        
        result = predictor.predict(
            example['value_1'], 
            example['value_2'], 
            example['value_3'], 
            example['activity_note']
        )
        
        print(f"🎯 Result: {result['condition']}")
        print(f"📝 Advice: {result['advice']}")
        print(f"📊 Confidence: {result['confidence']:.1%}")
    
    print("\n" + "="*50)
    print("✅ You can now use this .pkl model in any project!")
    print("\nTo integrate in your application:")
    print("1. Copy teach_smart_chatbot.pkl to your project")
    print("2. Copy the AutismTherapyPredictor class")
    print("3. Use: predictor = AutismTherapyPredictor()")
    print("4. Make predictions with: predictor.predict(...)")