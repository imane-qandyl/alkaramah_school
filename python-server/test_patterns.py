#!/usr/bin/env python3
"""
Test script to verify turn-taking pattern matching
"""

import re

# Test patterns
patterns = {
    0: "turn[\\s\\-]?taking|sharing|won't share|grabbing|taking toys|teach turn|how do i teach turn",
    1: "turn[\\s\\-]?taking|sharing|social skills|playing with others|teach turn|how do i teach turn",
    2: "turn[\\s\\-]?taking|sharing|social skills|peer interaction|group work|teach turn|how do i teach turn"
}

# Test inputs
test_inputs = [
    "How do I teach turn-taking to a 7-year-old with autism?",
    "How do I teach turn taking to a child?",
    "Help with sharing and turn taking",
    "My student won't share toys",
    "Social skills and peer interaction",
    "Teaching turn-taking strategies"
]

print("🧪 Testing Turn-Taking Pattern Matching\n")

for level, pattern in patterns.items():
    print(f"Level {level} Pattern: {pattern}")
    print("-" * 50)
    
    for test_input in test_inputs:
        match = re.search(pattern, test_input.lower(), re.IGNORECASE)
        status = "✅ MATCH" if match else "❌ NO MATCH"
        if match:
            matched_text = match.group(0)
            print(f"{status}: '{test_input}' -> matched '{matched_text}'")
        else:
            print(f"{status}: '{test_input}'")
    
    print("\n")

print("🎯 Expected: All test inputs should match at least one pattern")