FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
COPY . /app/backend/

RUN pip install --no-cache-dir -r requirements.txt

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
