FROM python:3.11

COPY requirements.txt /tmp/requirements.txt

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY ./app /app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
