FROM gcc:12-bullseye

WORKDIR /app

# Install basic utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Compile and run the C++ program
CMD g++ -o /tmp/program script.cpp && /tmp/program
