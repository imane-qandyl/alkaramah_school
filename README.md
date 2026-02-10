# TeachSmart AI - Autism Education Assistant

An AI-powered educational resource generator designed specifically for autism spectrum learners, built with React Native and Expo.

## 🤖 How to Communicate with the AI Chatbot

### Getting Started with the AI Chat

The AI chatbot is your intelligent teaching assistant that can help create personalized educational resources for students with autism. Here's how to effectively communicate with it:

### 1. **Accessing the Chatbot**

- Open the app and navigate to the **"AI Chat"** tab
- The chatbot will greet you with an introduction and available capabilities
- If you're coming from a student profile, the chatbot will have context about that specific student

### 2. **Types of Conversations**

#### **General Teaching Support**
Ask questions like:
- "How do I teach turn-taking to a 7-year-old with autism?"
- "What are some visual supports for daily routines?"
- "Create a lesson plan for emotion recognition"
- "Give me behavior management strategies"

#### **Student-Specific Resources**
When accessed from a student profile, you can ask:
- "Create a lesson plan for this student"
- "What teaching strategies work best for their profile?"
- "Generate activities for their learning style"
- "Help with behavior management for this student"

#### **AET Target Development**
- "Suggest AET targets for communication skills"
- "Create activities for social interaction goals"
- "Help with independence skill development"

### 3. **Communication Tips for Best Results**

#### **Be Specific**
✅ **Good**: "Create a visual schedule for a 6-year-old with autism who struggles with transitions"
❌ **Avoid**: "Help with schedules"

#### **Provide Context**
✅ **Good**: "My student is 8 years old, has difficulty with peer interaction, and learns best with visual supports"
❌ **Avoid**: "Help with social skills"

#### **Ask Follow-up Questions**
- "Can you make this simpler for a younger child?"
- "Add more visual elements to this activity"
- "How do I adapt this for a student with sensory sensitivities?"

### 4. **What the Chatbot Can Help With**

#### **Educational Resources**
- Lesson plans and activities
- Visual supports and schedules
- Assessment tools
- Differentiated materials

#### **Teaching Strategies**
- Autism-friendly approaches
- Sensory considerations
- Communication techniques
- Behavior support methods

#### **AET Framework Support**
- Target identification
- Progress tracking ideas
- Evidence collection methods
- Outcome measurement

#### **Classroom Management**
- Environmental modifications
- Routine establishment
- Transition strategies
- Crisis prevention

### 5. **Sample Conversation Starters**

#### **For New Teachers**
- "I'm new to teaching students with autism. Where should I start?"
- "What are the most important things to know about autism in the classroom?"

#### **For Specific Challenges**
- "My student has meltdowns during transitions. How can I help?"
- "How do I teach math concepts to a visual learner with autism?"
- "What's the best way to encourage peer interaction?"

#### **For Resource Creation**
- "Create a social story about sharing toys"
- "Design a visual schedule for morning routines"
- "Make a worksheet for identifying emotions"

### 6. **Understanding AI Responses**

#### **Response Format**
The chatbot provides:
- **Structured answers** with clear headings
- **Step-by-step instructions** when appropriate
- **Teacher implementation notes**
- **Success criteria** for activities
- **Adaptation suggestions** for different needs

#### **Export Options**
For substantial responses, you can:
- **Export to PDF** for printing and sharing
- **Export to Word** for editing and customization
- Look for the "Export" button on AI responses

### 7. **Advanced Features**

#### **Student Context Integration**
When chatting from a student profile, the AI knows:
- Student's age and support levels
- Learning preferences and modalities
- Communication style and abilities
- Previous conversation history

#### **Conversation History**
- All conversations are automatically saved
- Access previous chats from student profiles
- Review and build upon past discussions

### 8. **Technical Communication**

#### **Server Connection**
The chatbot uses two AI services in priority order:
1. **Trained Chatbot Model** (Primary) - Your custom-trained model for autism education
2. **Azure OpenAI** (Fallback) - Cloud-based AI service when the trained model is unavailable

If neither service is available, the chatbot will provide a clear error message with instructions on how to start your trained model server.

#### **Connection Status**
Check AI service status in the Profile tab to ensure optimal performance.

### 9. **Best Practices**

#### **Do:**
- Be patient - AI responses may take a few seconds
- Ask for clarification if responses aren't clear
- Provide feedback on what works or doesn't work
- Use the export feature for resources you want to keep

#### **Don't:**
- Expect the AI to replace professional judgment
- Share sensitive student information
- Rely solely on AI without reviewing content
- Use responses without adapting to your specific context

### 10. **Troubleshooting Communication Issues**

#### **If the AI doesn't respond:**
- Check your internet connection
- Try rephrasing your question
- Check the AI service status in Profile tab

#### **If responses seem generic:**
- Provide more specific details about your situation
- Include student age, ability level, and specific challenges
- Ask follow-up questions for clarification

#### **If you need immediate help:**
- Use the clear chat button to start fresh
- Try simpler, more direct questions
- Check if the Python server is running (for trained model)

---

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- Expo CLI
- Python 3.x (for the trained chatbot server)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the Python server: `cd python-server && ./start_server.sh`
4. Run the app: `npx expo start`

### Configuration
- Set up Azure OpenAI credentials in the Profile tab
- Ensure the Python chatbot server is running for optimal performance

---

## 📱 Features

- **AI-Powered Chat Assistant** - Intelligent conversation with autism education expertise
- **Student Profile Management** - Track individual student needs and progress
- **Resource Generation** - Create customized educational materials
- **Export Capabilities** - Save resources as PDF or Word documents
- **Conversation History** - Review and build upon previous discussions
- **Multi-Service AI** - Redundant AI services for reliable performance

## 🎯 Target Users

- Special education teachers
- Autism specialists
- Teaching assistants
- Parents and caregivers
- Educational therapists

---

*For technical support or questions about the AI chatbot functionality, refer to the troubleshooting section above or check the AI service status in the app.*