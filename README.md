# 🎙️ AI-Driven Interview Coaching System

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An intelligent, voice-enabled interview preparation platform that simulates real interview scenarios and provides automated answer evaluation, emotion analysis, and detailed feedback using state-of-the-art AI models.

---

## 📌 Project Overview

The **AI-Driven Interview Coaching System** is a web-based application designed to help candidates prepare for technical and non-technical interviews. The system conducts mock interviews through voice interaction, evaluates candidate responses using advanced AI models, analyzes emotional cues, and generates structured feedback to improve interview performance.

The platform aims to replicate real interview pressure while providing objective, AI-driven assessment and personalized improvement suggestions.

---

## 🎯 Objectives

- Simulate real interview scenarios using voice-based interaction  
- Automatically transcribe spoken answers into text  
- Evaluate answers for correctness, relevance, and depth  
- Detect emotional state such as confidence or nervousness  
- Provide structured and actionable feedback  
- Help candidates improve both **content quality** and **communication skills**

---

## 🧠 AI Models Used

### 1. **Whisper (Speech-to-Text)**
- **Model:** `whisper-1` (OpenAI)
- **Purpose:** Converts spoken interview answers into text
- **Why:** High accuracy, noise tolerance, and strong performance across accents

### 2. **Gemini Pro (Answer Evaluation)**
- **Model:** Google **Gemini Pro**
- **Purpose:**
  - Evaluates candidate answers
  - Assesses relevance, correctness, clarity, and completeness
  - Generates structured evaluation results
- **Why:** Strong reasoning and evaluation capability for open-ended responses

### 3. **RoBERTa (Emotion Detection)**
- **Model:** `RoBERTa-base` fine-tuned for emotion classification
- **Source:** Hugging Face emotion-finetuned RoBERTa models
- **Purpose:**
  - Detects emotional state from transcribed answers
  - Identifies confidence, nervousness, neutrality, or emotional tone
- **Why:** Context-aware transformer model suitable for subtle emotional cues

---

## 🔁 System Workflow

```
Candidate Voice Input
        ↓
Whisper-1 (Speech-to-Text)
        ↓
Transcribed Answer
        ↓
    ├── Gemini Pro → Answer Evaluation & Scoring
    ├── RoBERTa → Emotion Detection
        ↓
Combined Feedback & Performance Summary
```

---

## 🚀 Key Features

- 🎙️ **Voice-based mock interviews** - Natural conversation flow
- 📝 **Automatic speech-to-text transcription** - Powered by Whisper
- 📊 **AI-driven answer evaluation** - Using Gemini Pro
- 😊 **Emotion detection from responses** - RoBERTa-based analysis
- 📄 **Structured feedback and scoring** - Actionable insights
- 📈 **Session-wise performance summary** - Track improvement over time
- 🌐 **Web-based, platform-independent access** - Works on any modern browser
- 📋 **Resume upload & parsing** - Tailored questions based on your profile
- 👤 **User authentication & profiles** - Personalized experience
- 🔔 **Real-time notifications** - Stay updated on your progress
- 📊 **Interactive dashboard** - Visualize your performance metrics
- ⚙️ **Customizable settings** - Adjust interview preferences

---

## 🧩 Technologies & Frameworks

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** | User interface and component management |
| **Vite** | Fast build tool and development server |
| **MediaRecorder API** | Browser-based audio recording |
| **Web Audio API** | Microphone access and audio handling |
| **HTML/CSS/JavaScript** | Core web technologies |
| **Context API** | State management (UserContext) |

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.9+** | Backend programming language |
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server for FastAPI |

### AI/ML Libraries & APIs
| Library/API | Purpose |
|-------------|---------|
| **OpenAI API** | Whisper speech-to-text |
| **Google Gemini API** | Answer evaluation |
| **Hugging Face Transformers** | RoBERTa model loading |
| **PyTorch** | Deep learning backend |
| **sounddevice** | Audio recording |
| **soundfile** | Audio file I/O |
| **pydub** | Audio processing and conversion |
| **OpenCV** | Video processing (future enhancements) |
| **Pandas/NumPy/SciPy** | Data handling |
| **Matplotlib/Seaborn** | Visualization |
| **Scikit-learn** | ML metrics |

---

## 🖥️ Application Type

- **Web Application**
- Accessible via modern web browsers
- Requires microphone permission for voice input
- Cross-platform compatible

---

## ⚙️ Installation & Setup

### Prerequisites
- **Python 3.9 or higher**
- **Node.js and npm**
- **FFmpeg** (required for audio processing)
- **OpenAI API key** (for Whisper)
- **Google Gemini API key**

#### Installing FFmpeg
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

---

### 1️⃣ Backend Setup

#### Clone the Repository
```bash
git clone https://github.com/atharvadk/AI-Interview-Coach.git
cd AI-Interview-Coach
```

#### Navigate to Backend Directory
```bash
cd backend
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

Or manually install:
```bash
pip install openai-whisper torch>=2.1.0 transformers>=4.40.0 sounddevice>=0.4.9 soundfile>=0.12.1 numpy>=1.24.0 scipy>=1.11.0 pydub>=0.25.1 python-multipart huggingface_hub>=0.17.1 streamlit>=1.30.0 fastapi>=0.110.0 uvicorn>=0.29.0 opencv-python>=4.8.0 Pillow>=10.0.0 pandas>=2.1.0 matplotlib>=3.8.0 seaborn>=0.12.2 scikit-learn>=1.3.0
```

#### Configure API Keys
Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Run Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
✅ Backend API running at `http://localhost:8000`

---

### 2️⃣ Frontend Setup

#### Open a New Terminal
(Keep the backend server running)

#### Navigate to Frontend Directory
```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Backend API Endpoint
Create or update `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000
```

#### Start React Development Server
```bash
npm start
```
✅ React app running at `http://localhost:3000`

---

### Running Both Servers

You need **two terminal windows** running simultaneously:

**Terminal 1 (Backend):**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

---

## 💻 Usage

### Quick Start Guide

**Ensure both servers are running:**
- ✅ Backend: `http://localhost:8000` 
- ✅ Frontend: `http://localhost:3000`

### Starting an Interview

1. **Launch the Application**
   - Navigate to `http://localhost:3000` in your browser
   - Allow microphone access when prompted

2. **Begin Interview Session**
   - Click "Start Interview"
   - Interview questions will appear one by one

3. **Record Your Responses**
   - Click the microphone button to start recording
   - Speak your answer clearly and confidently
   - Click stop when finished

4. **Receive Real-Time Feedback**
   - View automatic transcription of your answer
   - Get AI-generated evaluation from Gemini Pro
   - See emotion analysis results from RoBERTa

5. **Review Performance Summary**
   - Access comprehensive session summary
   - Review individual question performance
   - Identify strengths and areas for improvement
   - Download detailed feedback report

### Example Workflow

```
Question: "Tell me about yourself"
    ↓
[Record Audio] → Whisper Transcription
    ↓
Transcribed Text → Gemini Pro Evaluation + RoBERTa Emotion Detection
    ↓
Feedback: "Well-structured response with relevant examples. 
           Confident tone detected. Score: 8/10
           Suggestions: Add more technical depth..."
```

---

## 📊 Output & Feedback

The system provides:

- ✅ **Answer Quality Evaluation** - Relevance, correctness, clarity, completeness
- ✅ **Emotional State Analysis** - Confidence level, nervousness indicators
- ✅ **Strengths Identification** - What you did well
- ✅ **Areas for Improvement** - Specific suggestions
- ✅ **Overall Performance Summary** - Session-wise tracking
- ✅ **Scoring Metrics** - Quantitative assessment

---

## 📂 Project Structure

```
AI-Interview-Coach/
│
├── backend/
│   ├── app/
│   │   └── routes/
│   │       ├── __pycache__/
│   │       ├── auth.py              # Authentication routes
│   │       ├── feedback.py          # Feedback generation routes
│   │       ├── files.py             # File upload/download handling
│   │       └── sessions.py          # Session management routes
│   │
│   ├── services/
│   │   ├── __pycache__/
│   │   ├── analysis.py              # Answer analysis service
│   │   ├── audio_processing.py      # Audio utilities (sounddevice, pydub)
│   │   ├── gemini_client.py         # Gemini Pro API integration
│   │   ├── question_bank.py         # Interview questions management
│   │   ├── resume_parser.py         # Resume parsing functionality
│   │   ├── session_store.py         # Session data management
│   │   └── sessions.py              # Session handling logic
│   │
│   ├── data/                        # Data storage directory
│   ├── uploads/                     # Uploaded files (audio, resumes)
│   ├── config.py                    # Configuration settings
│   ├── main.py                      # FastAPI application entry point
│   ├── .gitkeep                     # Git placeholder files
│   ├── test.py                      # Backend tests
│   ├── test.webm                    # Test audio file
│   └── requirements.txt             # Python dependencies
│
├── frontend/
│   ├── node_modules/                # npm packages
│   ├── public/                      # Static files
│   │   └── index.html               # HTML template
│   │
│   ├── src/
│   │   ├── assets/                  # Images, fonts, etc.
│   │   │
│   │   ├── components/
│   │   │   ├── FeedbackDashboard.jsx    # Feedback visualization
│   │   │   ├── Navbar.jsx               # Navigation bar
│   │   │   ├── Notification.jsx         # Notification system
│   │   │   ├── ProgressBar.jsx          # Progress indicator
│   │   │   ├── QuestionPanel.jsx        # Question display
│   │   │   └── ResumeUploadWidget.jsx   # Resume upload component
│   │   │
│   │   ├── contexts/
│   │   │   └── UserContext.jsx          # User state management
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.css            # Dashboard styles
│   │   │   ├── Dashboard.jsx            # Main dashboard
│   │   │   ├── Home.css                 # Home page styles
│   │   │   ├── Home.jsx                 # Landing page
│   │   │   ├── Interview.jsx            # Interview interface
│   │   │   ├── Profile.jsx              # User profile
│   │   │   ├── ResumeUpload.jsx         # Resume upload page
│   │   │   ├── SessionSummary.jsx       # Session results
│   │   │   └── Settings.jsx             # User settings
│   │   │
│   │   ├── services/
│   │   │   ├── App.css                  # Global styles
│   │   │   ├── App.jsx                  # Root component
│   │   │   └── index.css                # Base styles
│   │   │
│   │   └── main.jsx                     # React entry point
│   │
│   ├── .env                         # Environment variables (API URL)
│   ├── .gitkeep                     # Git placeholder
│   ├── eslint.config.js             # ESLint configuration
│   ├── index.html                   # Main HTML file
│   ├── package-lock.json            # npm lock file
│   ├── package.json                 # npm dependencies
│   ├── README.md                    # Frontend documentation
│   └── vite.config.js               # Vite configuration
│
├── models/                          # ML models (if stored locally)
├── report/                          # Project reports/documentation
├── uploads/                         # Global uploads directory
├── venv/                            # Python virtual environment
│
├── .gitignore                       # Git ignore rules
├── backend.zip                      # Backend archive
├── frontend.zip                     # Frontend archive
├── package-lock.json                # Root package lock
├── README.md                        # This file
└── requirements.txt                 # Root Python dependencies
```

---

## 🌟 What Makes This Project Unique

| Feature | Description |
|---------|-------------|
| **Gemini Pro Integration** | Uses Google's latest LLM specifically for answer evaluation, not generic scoring |
| **RoBERTa Emotion Analysis** | Context-aware emotion detection from transcribed text |
| **Fully Voice-Driven** | Complete interview workflow through voice interaction |
| **Multi-Model AI Pipeline** | Combines three specialized AI models for comprehensive assessment |
| **Technical + Emotional Intelligence** | Evaluates both content quality and communication confidence |
| **End-to-End Automation** | No manual evaluation required |
| **Real Interview Simulation** | Replicates actual interview pressure and scenarios |

---

## 🧪 Use Cases

- 🎓 **Placement Preparation** - Practice for campus placements
- 💼 **Technical Interview Practice** - Prepare for coding and technical rounds
- 🗣️ **Soft-Skill Improvement** - Enhance communication and confidence
- 📊 **Self-Assessment** - Evaluate job readiness objectively
- 🏫 **Academic Demonstration** - Showcase AI + NLP integration
- 👨‍🏫 **Educational Tool** - Assist students in interview preparation

---

## 📌 Future Enhancements

- [ ] 📹 **Facial Expression Analysis** - Using OpenCV for visual cues
- [ ] 🌍 **Multi-Language Support** - Interviews in multiple languages
- [ ] 🎚️ **Adaptive Difficulty** - Questions adjust based on performance
- [ ] 📊 **Analytics Dashboard** - Comprehensive performance tracking
- [ ] 👔 **Recruiter Mode** - Custom interview configuration
- [ ] 🎯 **Domain-Specific Interviews** - Tailored for different industries
- [ ] 📄 **PDF Report Export** - Downloadable detailed reports
- [ ] 🔄 **Mock Interview Scheduling** - Timed practice sessions

---

## ⚠️ Current Limitations

- Requires stable internet connection for AI API calls
- English language only (currently)
- Predefined question sets
- No real-time facial expression analysis yet

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 🔑 API Keys Required

You need the following API keys:

- **OpenAI API Key** (for Whisper) - [Get it here](https://platform.openai.com/api-keys)
- **Google Gemini API Key** - [Get it here](https://ai.google.dev/)

Set them as environment variables in your `.env` file:

```env
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Atharva Kavade**  
Artificial Intelligence and Data Science  
Vishwakarma Institute of Technology, Pune

- GitHub: [@atharvadk](https://github.com/atharvadk)

**Srushti Kasurde**  
Artificial Intelligence and Data Science  
Vishwakarma Institute of Technology, Pune

- GitHub: [@srushti1010-kasurde](https://github.com/srushti1010-kasurde)

- Repository: [AI-Interview-Coach](https://github.com/atharvadk/AI-Interview-Coach)

---

## 🙏 Acknowledgments

- **OpenAI** for the Whisper speech recognition model
- **Google** for the Gemini Pro API
- **Hugging Face** for the emotion-finetuned RoBERTa model
- **FastAPI** and **React** communities for excellent frameworks
- All contributors and testers

---

## 🏁 Conclusion

The AI-Driven Interview Coaching System demonstrates the practical application of speech processing, large language models, and emotion-aware NLP in building intelligent educational tools. By combining Whisper, Gemini Pro, and RoBERTa, the system delivers a realistic, automated, and insightful interview preparation experience.

---

## 📧 Contact

For questions, suggestions, or collaboration:
- 🐛 Issues: [GitHub Issues](https://github.com/atharvadk/AI-Interview-Coach/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/atharvadk/AI-Interview-Coach/discussions)

---

<div align="center">

**⭐ Star this repository if it helped you ace your interviews!**

Built with ❤️ to help everyone succeed in their career journey

</div>
