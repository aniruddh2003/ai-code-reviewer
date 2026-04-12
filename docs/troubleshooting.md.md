# 🛠️ Troubleshooting Guide

## Docker: docker not found

Cause:
Worker container missing Docker CLI

Fix:

* Install docker.io
* Mount docker.sock

---

## Redis: ECONNREFUSED

Cause:
Using localhost instead of service name

Fix:
Use host: "redis"

---

## script.py not found

Cause:
Volume mount issue between container and host

Fix:
Use shared /tmp directory
