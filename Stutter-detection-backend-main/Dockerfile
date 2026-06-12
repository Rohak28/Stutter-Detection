FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    locales \
    gcc \
    libffi-dev \
    libssl-dev \
    portaudio19-dev \
    libsndfile1-dev \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

RUN pip install --upgrade pip setuptools wheel

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python - <<EOF
import nltk
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')
nltk.download('tagsets')
EOF

RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 10000

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "4", "--worker-class", "gthread", "--threads", "4", "--timeout", "300", "--keep-alive", "5", "app:app"]
