# getkyc
This is a simple KYC pipeline.

Deployment link: https://angelic-freedom-production-dd63.up.railway.app

## directory structure
```
├── backend
│   ├── account
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── manager.py
│   │   ├── models.py
│   │   ├── permissions.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── backend
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── kyc
│   │   ├── utils
│   │   │   └── validators.py
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── reviewer
│   │   ├── utils
│   │   │   ├── helper.py
│   │   │   └── state_machine.py
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── staticfiles
│   ├── Procfile
│   ├── manage.py
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── api
│   │   │   └── client.js
│   │   ├── components
│   │   │   ├── Layout.jsx
│   │   │   └── UI.jsx
│   │   ├── context
│   │   │   └── AuthContext.jsx
│   │   ├── pages
│   │   │   ├── merchant
│   │   │   │   ├── BusinessPage.jsx
│   │   │   │   ├── DocumentsPage.jsx
│   │   │   │   ├── NotificationsPage.jsx
│   │   │   │   ├── OverviewPage.jsx
│   │   │   │   └── SubmissionPage.jsx
│   │   │   ├── reviewer
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── NotificationsPage.jsx
│   │   │   │   ├── QueuePage.jsx
│   │   │   │   └── SubmissionDetailPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── index.js
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
├── .gitignore
├── EXPLAINER.md
├── README.md
└── requirements.txt
```






## Project Setup Guide
### Prerequisites
Make sure you have these installed:
Python 3.11+
Node.js 18+
Git

### 1 — Clone the Repository
```
git clone https://github.com/himanchal-103/getkyc.git
cd getkyc
```

### 2 — Backend Setup
Create and activate virtual environment
```
python3 -m venv env
source env/bin/activate        # Mac/Linux
```

Install dependencies
```
pip install -r requirements.txt
```

Create environment file
Create backend/.env with the following:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:3000
```

Run migrations
```
cd backend
python3 manage.py migrate
```
Create superuser (optional)
```
python3 manage.py createsuperuser
```
Start backend server
```
python3 manage.py runserver
Backend runs at http://localhost:8000
```

### 3 — Frontend Setup
Open a new terminal:
```
cd frontend
npm install
```

Create environment file
Create frontend/.env with:
```
env
REACT_APP_API_URL=http://localhost:8000
```

Start frontend server
```
bash
npm start
Frontend runs at http://localhost:3000
```
