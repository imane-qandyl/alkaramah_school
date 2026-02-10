/**
 * Activity Generation Mapping Rules
 * Maps prediction labels + keywords to specific activity suggestions
 */

export const activityMappingRules = {
  // Label 0: Struggling - Needs Immediate Support
  0: {
    keywords: {
      "tantrum|meltdown|marah|menangis": {
        type: "calming_sensory",
        activities: [
          {
            name: "Deep Pressure Calm Down",
            description: "Use weighted lap pad and deep breathing with favorite stuffed animal",
            materials: ["Weighted lap pad", "Soft stuffed animal", "Quiet space"],
            steps: [
              "Guide student to quiet corner with dim lighting",
              "Place weighted lap pad on student's lap",
              "Model slow breathing: 'Breathe in like smelling flowers, out like blowing bubbles'",
              "Stay nearby but give space",
              "Wait for student to signal readiness to return"
            ],
            duration: "5-10 minutes",
            level: "immediate support"
          },
          {
            name: "Sensory Movement Break",
            description: "Heavy work activities to regulate nervous system",
            materials: ["Exercise ball", "Resistance band", "Wall space"],
            steps: [
              "Wall pushes: 10 slow pushes against wall",
              "Chair pushes: push heavy chair across room",
              "Bear crawls: crawl like bear for 30 seconds",
              "Deep squats: 5 slow squats with support"
            ],
            duration: "3-5 minutes",
            level: "immediate support"
          }
        ]
      },
      "tidak bisa konsentrasi|hyperactive|tidak fokus": {
        type: "attention_regulation",
        activities: [
          {
            name: "Focus Basket Activity",
            description: "Simple sorting task with immediate success",
            materials: ["2 baskets", "5 large colorful objects", "Timer"],
            steps: [
              "Set timer for 2 minutes only",
              "Show 2 baskets: red objects and blue objects",
              "Start with just 3 objects total",
              "Celebrate each correct placement immediately",
              "Stop before student gets frustrated"
            ],
            duration: "2-3 minutes",
            level: "immediate support"
          }
        ]
      },
      "tidak mau|menolak|aggressive": {
        type: "engagement_building",
        activities: [
          {
            name: "Choice-Based Engagement",
            description: "Offer 2 simple choices to rebuild cooperation",
            materials: ["2 preferred activities", "Visual choice board"],
            steps: [
              "Present 2 choices visually: 'Do you want blocks or puzzles?'",
              "Honor the choice immediately",
              "Start with 1-minute activity",
              "End on positive note before resistance builds",
              "Gradually increase expectations"
            ],
            duration: "1-2 minutes",
            level: "immediate support"
          }
        ]
      }
    }
  },

  // Label 1: Progressing - Needs Continued Support  
  1: {
    keywords: {
      "bantu|bantuan|dengan bantuan|perlu bantuan": {
        type: "assisted_learning",
        activities: [
          {
            name: "Hand-Over-Hand Number Matching",
            description: "Match number cards 1-3 with physical guidance",
            materials: ["Large number cards 1-3", "Matching objects", "Visual supports"],
            steps: [
              "Place number card 1 on table",
              "Guide student's hand to pick up 1 object",
              "Help place object on number card",
              "Say: 'One object on number one!'",
              "Gradually reduce physical support",
              "Celebrate each success immediately"
            ],
            duration: "5-8 minutes",
            level: "developing with support"
          },
          {
            name: "Visual Schedule Following",
            description: "Complete 3-step routine with visual and verbal prompts",
            materials: ["Picture schedule", "Activity materials", "Check-off system"],
            steps: [
              "Show visual schedule with 3 pictures",
              "Point to first picture: 'First, we get our materials'",
              "Walk with student to complete step",
              "Check off completed step together",
              "Provide verbal praise for each step"
            ],
            duration: "8-10 minutes",
            level: "developing with support"
          }
        ]
      },
      "mulai memahami|sedikit bisa|kadang bisa": {
        type: "skill_building",
        activities: [
          {
            name: "Pattern Building with Support",
            description: "Create simple AB patterns with guidance",
            materials: ["2 colors of blocks", "Pattern strip", "Visual model"],
            steps: [
              "Show completed pattern: red-blue-red-blue",
              "Start new pattern with student",
              "Place first block: 'Red block first'",
              "Guide student to place blue block",
              "Continue with decreasing support",
              "Let student complete last 2 blocks independently"
            ],
            duration: "6-8 minutes",
            level: "developing with support"
          }
        ]
      },
      "visual|gambar|lihat": {
        type: "visual_learning",
        activities: [
          {
            name: "Picture-Word Matching",
            description: "Match pictures to simple words with visual supports",
            materials: ["Picture cards", "Word cards", "Matching board"],
            steps: [
              "Start with 3 familiar objects: ball, car, book",
              "Show picture of ball, point to word 'ball'",
              "Help student match picture to word",
              "Use finger to trace word while saying it",
              "Gradually add more picture-word pairs"
            ],
            duration: "7-10 minutes",
            level: "developing with support"
          }
        ]
      }
    }
  },

  // Label 2: Thriving - Ready for Next Level
  2: {
    keywords: {
      "mandiri|sendiri|bisa sendiri|independent": {
        type: "independent_challenge",
        activities: [
          {
            name: "Multi-Step Problem Solving",
            description: "Complete 4-step sequence independently",
            materials: ["Complex puzzle", "Multi-step instructions", "Self-check list"],
            steps: [
              "Present 4-step visual instruction card",
              "Student reads/interprets steps independently",
              "Provide materials but minimal guidance",
              "Student self-checks work against model",
              "Encourage problem-solving when stuck"
            ],
            duration: "12-15 minutes",
            level: "independent challenge"
          },
          {
            name: "Teaching Others Activity",
            description: "Student teaches learned skill to peer or adult",
            materials: ["Materials from mastered activity", "Teaching checklist"],
            steps: [
              "Student explains activity to peer",
              "Student demonstrates each step",
              "Student provides encouragement to peer",
              "Student problem-solves when peer struggles",
              "Celebrate teaching success"
            ],
            duration: "10-12 minutes",
            level: "independent challenge"
          }
        ]
      },
      "baik|bagus|excellent|sempurna": {
        type: "extension_activity",
        activities: [
          {
            name: "Creative Extension Challenge",
            description: "Apply learned skills in new creative way",
            materials: ["Open-ended materials", "Challenge card", "Documentation tools"],
            steps: [
              "Present open-ended challenge: 'Create your own pattern using any materials'",
              "Student chooses materials and approach",
              "Student explains their thinking process",
              "Student documents their creation",
              "Student presents to others"
            ],
            duration: "15-20 minutes",
            level: "independent challenge"
          }
        ]
      },
      "siap|ready|next level|advanced": {
        type: "advanced_skill",
        activities: [
          {
            name: "Peer Collaboration Project",
            description: "Work with peer to complete complex task",
            materials: ["Collaborative materials", "Role cards", "Project rubric"],
            steps: [
              "Assign complementary roles to each student",
              "Students plan approach together",
              "Students divide tasks and work collaboratively",
              "Students check each other's work",
              "Students present joint project"
            ],
            duration: "20-25 minutes",
            level: "independent challenge"
          }
        ]
      }
    }
  }
};

// Helper function to find matching activities
export const findMatchingActivity = (label, activityNote, studentAge = 5) => {
  const labelRules = activityMappingRules[label];
  if (!labelRules) return null;

  const noteText = activityNote.toLowerCase();
  
  // Find matching keyword pattern
  for (const [keywordPattern, activityGroup] of Object.entries(labelRules.keywords)) {
    const regex = new RegExp(keywordPattern, 'i');
    if (regex.test(noteText)) {
      // Return first activity from matching group
      const activity = activityGroup.activities[0];
      return {
        ...activity,
        type: activityGroup.type,
        matchedKeywords: keywordPattern,
        recommendedFor: `Age ${studentAge}, ${activity.level}`
      };
    }
  }
  
  // Default activity if no keywords match
  return getDefaultActivity(label, studentAge);
};

// Default activities when no keywords match
const getDefaultActivity = (label, studentAge) => {
  const defaults = {
    0: {
      name: "Basic Calming Activity",
      description: "Simple sensory break to help student regulate",
      materials: ["Quiet space", "Preferred comfort item"],
      steps: [
        "Offer quiet space away from stimulation",
        "Provide preferred comfort item",
        "Use calm, quiet voice",
        "Wait for student to self-regulate"
      ],
      duration: "5-10 minutes",
      level: "immediate support"
    },
    1: {
      name: "Supported Learning Activity",
      description: "Simple task with adult guidance",
      materials: ["Age-appropriate materials", "Visual supports"],
      steps: [
        "Present simple, clear task",
        "Provide visual and verbal prompts",
        "Offer physical guidance as needed",
        "Celebrate small successes"
      ],
      duration: "5-8 minutes", 
      level: "developing with support"
    },
    2: {
      name: "Independent Challenge",
      description: "Self-directed learning opportunity",
      materials: ["Challenging but achievable materials"],
      steps: [
        "Present clear expectations",
        "Allow independent problem-solving",
        "Provide encouragement from distance",
        "Celebrate achievement and effort"
      ],
      duration: "10-15 minutes",
      level: "independent challenge"
    }
  };
  
  return {
    ...defaults[label],
    type: "default_activity",
    recommendedFor: `Age ${studentAge}, ${defaults[label].level}`
  };
};

export default activityMappingRules;