FROM python:3.10-slim

WORKDIR /app

COPY ./src /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["sleep", "infinity"]
