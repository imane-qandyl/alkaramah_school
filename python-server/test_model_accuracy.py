#!/usr/bin/env python3
"""
Comprehensive Model Accuracy Test
Tests the autism therapy prediction model with various scenarios
"""

import sys
sys.path.append('.')
from teachsmart_for_project import AutismTherapyPredictor
import numpy as np
from collections import Counter

def create_test_cases():
    """Create comprehensive test cases with expected outcomes"""
    return [
        # Struggling cases (should predict 0)
        {
            'input': ('salah', 'salah', 'salah', 'anak tantrum dan menolak semua aktivitas'),
            'expected': 0,
            'description': 'All wrong, tantrum, refusing'
        },
        {
            'input': ('salah', 'salah', 'benar', 'anak tidak bisa konsentrasi dan marah'),
            'expected': 0,
            'description': 'Mostly wrong, can\'t focus, angry'
        },
        {
            'input': ('salah', 'salah', 'salah', 'anak menangis dan tidak mau mengikuti instruksi'),
            'expected': 0,
            'description': 'All wrong, crying, won\'t follow instructions'
        },
        {
            'input': ('salah', 'salah', 'benar', 'anak aggressive dan tidak kooperatif'),
            'expected': 0,
            'description': 'Mostly wrong, aggressive, uncooperative'
        },
        {
            'input': ('salah', 'salah', 'salah', 'anak hyperactive dan tidak bisa duduk diam'),
            'expected': 0,
            'description': 'All wrong, hyperactive, can\'t sit still'
        },
        
        # Progressing cases (should predict 1)
        {
            'input': ('benar', 'salah', 'benar', 'anak membutuhkan bantuan untuk memahami instruksi'),
            'expected': 1,
            'description': 'Mixed performance, needs help with instructions'
        },
        {
            'input': ('benar', 'salah', 'salah', 'anak mulai memahami dengan bantuan visual'),
            'expected': 1,
            'description': 'Some success, learning with visual supports'
        },
        {
            'input': ('salah', 'benar', 'benar', 'anak kadang bisa kadang tidak, perlu dukungan'),
            'expected': 1,
            'description': 'Inconsistent performance, needs support'
        },
        {
            'input': ('benar', 'salah', 'benar', 'anak bisa dengan bantuan guru'),
            'expected': 1,
            'description': 'Mixed results, can do with teacher help'
        },
        {
            'input': ('salah', 'benar', 'salah', 'anak menunjukkan kemajuan tapi masih butuh bantuan'),
            'expected': 1,
            'description': 'Showing progress but still needs help'
        },
        
        # Thriving cases (should predict 2)
        {
            'input': ('benar', 'benar', 'benar', 'anak dapat mengikuti instruksi dengan baik dan mandiri'),
            'expected': 2,
            'description': 'All correct, follows instructions well, independent'
        },
        {
            'input': ('benar', 'benar', 'benar', 'anak sangat baik dan siap untuk tantangan lebih'),
            'expected': 2,
            'description': 'All correct, very good, ready for more challenges'
        },
        {
            'input': ('benar', 'benar', 'benar', 'anak excellent dan bisa membantu teman'),
            'expected': 2,
            'description': 'All correct, excellent, can help peers'
        },
        {
            'input': ('benar', 'benar', 'benar', 'anak mandiri dan tidak perlu bantuan'),
            'expected': 2,
            'description': 'All correct, independent, doesn\'t need help'
        },
        {
            'input': ('benar', 'benar', 'benar', 'anak sempurna dalam mengerjakan tugas'),
            'expected': 2,
            'description': 'All correct, perfect in doing tasks'
        },
        
        # Edge cases
        {
            'input': ('benar', 'benar', 'salah', 'anak hampir sempurna tapi ada sedikit kesalahan'),
            'expected': 1,  # or 2, depending on model interpretation
            'description': 'Mostly correct, almost perfect but small errors'
        },
        {
            'input': ('salah', 'salah', 'benar', 'anak mulai menunjukkan perbaikan'),
            'expected': 0,  # or 1, depending on model interpretation
            'description': 'Mostly wrong but showing improvement'
        }
    ]

def test_model_accuracy():
    """Test model accuracy with comprehensive test cases"""
    
    predictor = AutismTherapyPredictor('../teach_smart_chatbot.pkl')
    
    if not predictor.is_loaded:
        print("❌ Model not loaded")
        return
    
    test_cases = create_test_cases()
    
    print("🎯 COMPREHENSIVE MODEL ACCURACY TEST")
    print("=" * 60)
    print(f"Testing {len(test_cases)} scenarios...")
    print()
    
    correct_predictions = 0
    total_predictions = len(test_cases)
    predictions_by_class = {0: [], 1: [], 2: []}
    confidence_scores = []
    
    print("DETAILED RESULTS:")
    print("-" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        v1, v2, v3, note = test_case['input']
        expected = test_case['expected']
        description = test_case['description']
        
        # Make prediction
        result = predictor.predict_student_condition(v1, v2, v3, note)
        
        if 'error' in result:
            print(f"Test {i:2d}: ERROR - {result['error']}")
            continue
            
        predicted = result['label']
        confidence = result['confidence']
        condition = result['condition']
        
        # Check if prediction is correct
        is_correct = predicted == expected
        if is_correct:
            correct_predictions += 1
            status = "✅"
        else:
            status = "❌"
        
        # Store results for analysis
        predictions_by_class[predicted].append(confidence)
        confidence_scores.append(confidence)
        
        print(f"Test {i:2d}: {status} Expected: {expected}, Got: {predicted} ({confidence:.1%}) - {description}")
        print(f"         Condition: {condition}")
        print()
    
    # Calculate overall accuracy
    accuracy = (correct_predictions / total_predictions) * 100
    
    print("=" * 60)
    print("📊 ACCURACY SUMMARY")
    print("=" * 60)
    print(f"Overall Accuracy: {accuracy:.1f}% ({correct_predictions}/{total_predictions})")
    print(f"Average Confidence: {np.mean(confidence_scores):.1%}")
    print(f"Confidence Range: {np.min(confidence_scores):.1%} - {np.max(confidence_scores):.1%}")
    
    # Analyze predictions by class
    print("\n📈 PREDICTIONS BY CLASS:")
    class_names = {0: "Struggling", 1: "Progressing", 2: "Thriving"}
    
    for class_id, confidences in predictions_by_class.items():
        if confidences:
            avg_conf = np.mean(confidences)
            count = len(confidences)
            print(f"  {class_names[class_id]}: {count} predictions, avg confidence: {avg_conf:.1%}")
        else:
            print(f"  {class_names[class_id]}: 0 predictions")
    
    # Performance interpretation
    print("\n🎯 PERFORMANCE INTERPRETATION:")
    if accuracy >= 90:
        print("  🟢 EXCELLENT: Model is highly accurate")
    elif accuracy >= 80:
        print("  🟡 GOOD: Model performs well with room for improvement")
    elif accuracy >= 70:
        print("  🟠 FAIR: Model needs improvement")
    else:
        print("  🔴 POOR: Model needs significant retraining")
    
    return accuracy, confidence_scores

if __name__ == "__main__":
    test_model_accuracy()