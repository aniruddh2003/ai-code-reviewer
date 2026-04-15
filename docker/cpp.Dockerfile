FROM gcc:12-bullseye

WORKDIR /app

# Install basic utilities and download json library
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    wget \
    && mkdir -p /usr/include/nlohmann \
    && wget -O /usr/include/nlohmann/json.hpp https://github.com/nlohmann/json/releases/download/v3.11.2/json.hpp \
    && rm -rf /var/lib/apt/lists/*

# Compile and run the C++ program
CMD g++ -o /tmp/program script.cpp && /tmp/program
