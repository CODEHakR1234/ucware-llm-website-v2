#!/bin/bash

# ────────────────────────────────
# Next.js 프로덕션 배포 스크립트
# 빌드 후 프로덕션 서버 실행
# 사용법: ./deploy-production.sh [PORT]
# 기본 포트: 3000
# ────────────────────────────────

PORT=${1:-3000}  # 인자로 포트 번호 받기, 없으면 3000

echo "🏗️  Building Next.js application for production..."

# 기존 빌드 파일 정리
if [ -d ".next" ]; then
  echo "🧹 Cleaning previous build..."
  rm -rf .next
fi

# 프로덕션 빌드 실행
echo "📦 Running production build..."
npm run build

# 빌드 성공 확인
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
else
  echo "❌ Build failed! Please check the errors above."
  exit 1
fi

echo "🔍 Checking if port $PORT is in use..."

# 기존 프로세스 종료
PID=$(sudo netstat -tulpn 2>/dev/null | grep ":$PORT" | awk '{print $7}' | cut -d'/' -f1)

if [ -n "$PID" ]; then
  echo "⚠️  Port $PORT is in use by PID $PID. Killing it..."
  sudo kill -9 $PID
  echo "✅ Process $PID has been terminated."
else
  echo "✅ Port $PORT is free."
fi

echo "🚀 Starting Next.js production server on port $PORT (background)..."

# 프로덕션 서버 실행
nohup env PORT=$PORT npm start > production_$PORT.log 2>&1 &

echo "📂 Logs are being written to production_$PORT.log"
echo "🌐 Access the production server at: http://localhost:$PORT"
echo "🎉 Production deployment completed!"

# 서버 상태 확인
sleep 3
if curl -s http://localhost:$PORT > /dev/null; then
  echo "✅ Server is running and responding!"
else
  echo "⚠️  Server might still be starting up. Check logs: tail -f production_$PORT.log"
fi
