#!/bin/bash

# Script to check what's using a specific port

PORT=${1:-3001}

echo "🔍 Checking what's using port $PORT"
echo "===================================="
echo ""

echo "Method 1: Using lsof"
echo "--------------------"
if command -v lsof &> /dev/null; then
    lsof -i :$PORT || echo "No process found with lsof"
else
    echo "lsof not installed"
fi
echo ""

echo "Method 2: Using netstat"
echo "-----------------------"
if command -v netstat &> /dev/null; then
    netstat -tlnp | grep :$PORT || echo "No process found with netstat"
else
    echo "netstat not installed"
fi
echo ""

echo "Method 3: Using ss"
echo "------------------"
if command -v ss &> /dev/null; then
    ss -tlnp | grep :$PORT || echo "No process found with ss"
else
    echo "ss not installed"
fi
echo ""

echo "Method 4: Using fuser"
echo "---------------------"
if command -v fuser &> /dev/null; then
    fuser $PORT/tcp 2>/dev/null || echo "No process found with fuser"
else
    echo "fuser not installed"
fi
echo ""

echo "Getting detailed process information..."
echo "--------------------------------------"
PID=$(lsof -ti:$PORT 2>/dev/null || netstat -tlnp 2>/dev/null | grep :$PORT | awk '{print $7}' | cut -d'/' -f1 | head -1)

if [ ! -z "$PID" ]; then
    echo "Process ID: $PID"
    echo ""
    echo "Process details:"
    ps aux | grep "^[^ ]* *$PID " || ps -p $PID -o pid,ppid,cmd,user,etime
    echo ""
    echo "To kill this process, run:"
    echo "  kill $PID"
    echo "  # or if that doesn't work:"
    echo "  kill -9 $PID"
else
    echo "Could not find process ID for port $PORT"
fi

