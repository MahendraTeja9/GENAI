# GenAI Candidate Shortlisting System

## Project Structure
```
genai-hiring-system/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── redis_client.py
│   │   ├── models/
│   │   ├── api/
│   │   ├── services/
│   │   ├── utils/
│   │   └── schemas/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── context/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env
└── README.md
```
