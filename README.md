# Student Performance Predictor

A full-stack machine-learning web application that predicts student academic performance through a web-based interface.

> **Academic Mini Project — Neural Networks & Deep Learning**
>
> This project was developed as part of an academic assignment focused on exploring AI-assisted development tools and modern technologies. AI tools were intentionally used during application development. My primary contribution was integrating, configuring, debugging, deploying, and productionizing the application, including frontend/backend integration and CI/CD.

## 🚀 Live Application

**Frontend:**  
https://student-performance-predictor.chandrashekharhs653.workers.dev

**Backend API:**  
https://student-performance-predictor-v6fq.onrender.com

**Source Code:**  
https://github.com/Chandrashekhar-cloud/student-performance-predictor

---

## 📌 About the Project

The **Student Performance Predictor** demonstrates how a machine-learning model can be integrated into a modern full-stack web application.

Users can enter relevant student information through the frontend and receive a prediction from the trained machine-learning model through the Flask backend API.

The project combines:

- Machine Learning
- Python and Flask
- React
- REST API
- Cloud deployment
- CI/CD
- AI-assisted development tools

---

## 🎯 Academic Context

This project was created as a **mini project for the Neural Networks and Deep Learning course**.

The objective of the assignment was to explore:

- AI-assisted software development
- Modern AI development tools
- Integration of AI-generated application components
- Machine-learning application development
- Cloud deployment
- The complete application development and deployment lifecycle

This repository is therefore **not presented as a fully hand-coded application**. AI tools were deliberately used as part of the development process.

---

# 🤖 AI-Assisted Development

A major part of this assignment was exploring AI tools and technologies.

### Lovable — Frontend

The frontend was developed with assistance from **Lovable**, an AI-assisted application development platform.

It was used to assist with:

- User interface development
- Frontend components
- Layout and styling
- User interaction flows
- Frontend application structure

The generated frontend was subsequently integrated with the backend API and prepared for production deployment.

### Antigravity — Backend

The backend and machine-learning application were developed with assistance from **Antigravity**, an AI-powered development environment.

It was used to assist with:

- Flask backend structure
- API implementation
- Machine-learning integration
- Backend logic
- Database-related components
- Project organization

### My Contribution

My main contribution was focused on taking the AI-assisted application and making it work as a deployed production application.

This included:

- Understanding and integrating the generated code
- Connecting frontend and backend components
- Configuring production environment variables
- Debugging application and deployment issues
- Configuring cloud services
- Deploying the backend to Render
- Deploying the frontend to Cloudflare Workers
- Setting up CI/CD workflows
- Managing Git and GitHub workflows
- Troubleshooting build and deployment failures
- Reading deployment logs
- Testing the deployed application

---

# 🏗️ Architecture

```text
                    ┌──────────────────────────┐
                    │      User / Browser      │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │     React Frontend       │
                    │     Lovable-assisted     │
                    └────────────┬─────────────┘
                                 │
                           REST API Calls
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │      Flask Backend       │
                    │     Python + ML Model    │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │   Machine Learning Model │
                    │   Student Prediction     │
                    └──────────────────────────┘
```

## Deployment Architecture

```text
                    GitHub Repository
                           │
                           │ Push to main
                           ▼
                 ┌─────────────────────┐
                 │    CI/CD Workflow   │
                 └──────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
           Render                    Cloudflare
              │                           │
              ▼                           ▼
      Flask Backend                 React Frontend
              │                           │
              ▼                           ▼
        ML Prediction             Cloudflare Workers
```

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- TanStack Start
- Tailwind CSS
- Lovable

## Backend

- Python
- Flask
- Gunicorn
- REST API
- Antigravity

## Machine Learning

- Scikit-learn
- Pandas
- NumPy
- Trained ML model

## Database

- SQLite

## Deployment

- **Cloudflare Workers** — Frontend
- **Render** — Backend
- **GitHub** — Source control and CI/CD

## Development

- Git
- GitHub
- npm
- Python
- AI-assisted development tools

---

# ☁️ Deployment

The frontend and backend are deployed separately.

## Frontend — Cloudflare Workers

The frontend is deployed using the Cloudflare-compatible Nitro build.

### Build Command

```bash
npm run build
```

### Deploy Command

```bash
npx nitro deploy --prebuilt
```

### Production URL

https://student-performance-predictor.chandrashekharhs653.workers.dev

---

## Backend — Render

The Flask backend is deployed on Render.

### Build Command

```bash
pip install -r backend/requirements.txt
```

### Start Command

```bash
gunicorn backend.app:app
```

### Production API

https://student-performance-predictor-v6fq.onrender.com

---

# 🔄 CI/CD Workflow

The project is connected to GitHub-based deployment workflows.

```text
Developer
    │
    ▼
Git changes
    │
    ▼
GitHub main branch
    │
    ├──────────────► Render
    │                    │
    │                    ▼
    │              Backend Deployment
    │
    └──────────────► Cloudflare
                         │
                         ▼
                   Frontend Build
                         │
                         ▼
                   Worker Deployment
```

The deployment configuration allows changes pushed to the repository to be built and deployed through the configured cloud platforms.

---

# 📁 Project Structure

```text
student-performance-predictor/
│
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── database.db
│   ├── requirements.txt
│   ├── Dockerfile
│   └── models/
│
├── data/
│
├── models/
│
├── public/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── lib/
│   └── routes/
│
├── render.yaml
├── package.json
├── vite.config.ts
└── README.md
```

---

# ⚙️ Running Locally

## 1. Clone the Repository

```bash
git clone https://github.com/Chandrashekhar-cloud/student-performance-predictor.git
cd student-performance-predictor
```

## 2. Install Frontend Dependencies

```bash
npm install
```

## 3. Run the Frontend

```bash
npm run dev
```

---

## 4. Run the Backend

Create a Python virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Run the Flask application:

```bash
python backend/app.py
```

---

# 🔐 Environment Configuration

The frontend uses an API base URL instead of permanently hardcoding the backend address.

Production API configuration:

```text
VITE_API_URL=https://student-performance-predictor-v6fq.onrender.com
```

This allows the frontend to communicate with the deployed Flask backend.

---

# 🧪 Testing

The backend contains validation/testing functionality.

Run:

```bash
python backend/test_validation.py
```

The deployed application was also tested to verify:

- Frontend availability
- Backend connectivity
- API requests
- Prediction functionality
- Application navigation
- Production deployment

---

# 📚 What I Learned

This project provided practical exposure to the complete lifecycle of an AI-assisted application.

Key areas explored:

- AI-assisted software development
- Understanding and integrating AI-generated code
- Frontend/backend integration
- REST API communication
- Git and GitHub workflows
- Environment configuration
- Cloudflare Workers deployment
- Render deployment
- CI/CD configuration
- Cloud deployment troubleshooting
- Reading build and deployment logs
- Production application testing

A major learning outcome was understanding how to take an application created with AI-assisted development tools and **integrate, configure, deploy, troubleshoot, and operate it as a publicly accessible application**.

---

# ⚠️ Transparency & AI Usage

This project intentionally uses AI-assisted development because exploring AI tools and technologies was part of the academic assignment.

The **frontend was developed with assistance from Lovable**, while the **backend was developed with assistance from Antigravity**.

The application was then integrated, configured, debugged, deployed, and connected to CI/CD.

Therefore, this repository is best described as an:

> **AI-assisted academic project with human-led integration, deployment, cloud configuration, troubleshooting, and DevOps implementation.**

This distinction is intentionally documented to provide transparency about how the project was developed.

---

# 👨‍💻 Author

**Chandrashekhar H S**

Computer Science Engineering — AI & ML

GitHub:  
https://github.com/Chandrashekhar-cloud

---

# 🔗 Project Links

| Resource | Link |
|---|---|
| 🌐 Live Frontend | https://student-performance-predictor.chandrashekharhs653.workers.dev |
| ⚙️ Backend API | https://student-performance-predictor-v6fq.onrender.com |
| 💻 GitHub Repository | https://github.com/Chandrashekhar-cloud/student-performance-predictor |

---

## 📄 Academic Note

This project was developed for educational purposes as part of a Neural Networks and Deep Learning assignment. The purpose was to explore machine-learning application development together with modern AI-assisted development and deployment technologies.
