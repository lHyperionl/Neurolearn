FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY maps.db .
COPY backend/data ./data
COPY backend/docs ./docs

EXPOSE 8000

CMD ["python", "main.py"]
