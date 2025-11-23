# PDF Genie - AI 기반 PDF 분석 플랫폼

LLM을 활용해 PDF 문서를 요약하고, 질문에 답하고, 학습 자료를 자동으로 생성하는 웹 애플리케이션입니다.

<br/>

## 주요 기능

<table>
<tr>
<td width="66%" valign="top">

**📝 PDF 요약 및 질의응답**

<img src="./public/images/home_summary.jpeg" alt="PDF 요약 화면" width="100%" />

- PDF URL만 입력하면 전체 문서 요약
- RAG 기반으로 문서 내용에 대한 추가 질문 가능
- 한국어, 영어, 중국어, 일본어 지원

<br/>

**🔬 딥리서치 모드 (로그인 사용자 전용)**

<img src="./public/images/Deep_research.png" alt="딥리서치 모드" width="100%" />

- 더 정교한 PDF 분석
- 문서 구조화 및 핵심 내용 추출
- 사용자 목적에 맞는 맞춤형 요약

</td>
<td width="33%" valign="top">

**📚 튜토리얼 자동 생성**

<img src="./public/images/Tutorial.png" alt="튜토리얼 생성" width="100%" />

- PDF를 기반으로 학습 자료 자동 생성
- Markdown 형식의 구조화된 문서
- 이미지 자동 추출 및 설명 생성
- 전체보기 모달로 편리한 열람

</td>
</tr>
</table>

<br/>

### 📦 아카이브 & 피드백

<p align="center">
  <img src="./public/images/Archive.png" alt="아카이브" width="48%" />
  <img src="./public/images/feedback_modal.jpeg" alt="피드백" width="48%" />
</p>

- 생성한 요약/튜토리얼 저장 및 관리
- 별점 및 코멘트로 서비스 품질 개선

<br/>

---

## 기술 스택

### 프론트엔드
- **Next.js 15** - App Router
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성
- **Tailwind CSS 4** - 반응형 디자인
- **Framer Motion** - 부드러운 애니메이션
- **react-markdown** - Markdown 렌더링 (GFM, 코드 하이라이팅)

### 백엔드 (별도 저장소: `ucware_Deep_research_final`)
- **FastAPI** - 고성능 API 서버
- **LangGraph** - AI 워크플로우 오케스트레이션
- **OpenAI GPT-4o** - LLM 엔진
- **ChromaDB** - 벡터 저장소
- **Redis** - 캐싱 및 피드백 저장

<br/>

---

## 빠른 시작

### 필수 조건
- Node.js 18 이상
- 백엔드 서버 실행 중 (`http://localhost:8000`)

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/CODEHakR1234/ucware-llm-website-v2.git
cd ucware-llm-website-v2

# 의존성 설치
npm install

# 환경 변수 설정
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드

```bash
npm run build
npm start
```

<br/>

---

## 사용법

### 일반 요약
1. PDF URL 입력 (예: `https://arxiv.org/pdf/1706.03762.pdf`)
2. 언어 선택 (KO/EN/CN/JP)
3. **"요약 만들기"** 클릭
4. 요약 확인 후 추가 질문 입력

### 딥리서치 & 튜토리얼
1. 로그인 후 **"딥리서치 모드로 전환"**
2. **"딥리서치 요약"** 또는 **"튜토리얼 생성"** 선택
3. 생성된 내용을 아카이브에 저장하고 재사용

<br/>

---

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # 전역 레이아웃 (AuthProvider, ArchiveProvider)
│   ├── page.tsx                # 메인 홈페이지
│   └── globals.css             # Tailwind CSS 설정
├── components/
│   ├── auth/                   # 로그인, 회원가입 모달
│   ├── common/                 # Spinner, Stars, ImagePreview, MarkdownPreview
│   ├── layout/                 # Sidebar
│   ├── pages/                  # ProfilePage, ArchivePage
│   └── PdfSummaryForm/         # 메인 폼 (요약/튜토리얼 생성)
├── contexts/                   # AuthContext, ArchiveContext
└── utils/                      # imageUtils (이미지 URL 변환)
```

<br/>

---

## API 엔드포인트

| 엔드포인트 | 메서드 | 설명 | 요청 Body |
|-----------|--------|------|-----------|
| `/api/summary` | POST | PDF 요약 또는 질문 응답 | `{file_id, pdf_url, query, lang}` |
| `/api/tutorial` | POST | 튜토리얼 자동 생성 | `{file_id, pdf_url, lang}` |
| `/api/feedback` | POST | 사용자 피드백 제출 | `{file_id, rating, comment}` |

**요청 예시**:
```json
{
  "file_id": "fid_c6a30503_1706_03762_pdf",
  "pdf_url": "https://arxiv.org/pdf/1706.03762.pdf",
  "query": "SUMMARY_ALL",
  "lang": "KO"
}
```

<br/>

---

## 배포

### Vercel (권장)
1. [Vercel](https://vercel.com)에 GitHub 저장소 연결
2. 환경 변수 설정: `NEXT_PUBLIC_API_URL`
3. Deploy 클릭

### Docker
```bash
docker build -t pdf-genie .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api.com \
  pdf-genie
```

<br/>

---

## 트러블슈팅

### "Failed to fetch" 오류
백엔드 서버가 실행 중인지 확인:
```bash
curl http://localhost:8000/api/health
```

### 이미지가 표시되지 않음
- `next.config.ts`에서 API 프록시 설정 확인
- 브라우저 콘솔에서 네트워크 탭 확인
- CORS 설정 확인

### Markdown 렌더링 문제
- 브라우저 개발자 도구에서 원본 데이터 확인
- `[IMG_X_Y]` 패턴이 올바르게 변환되는지 확인

<br/>

---

## 기여

버그 리포트나 기능 제안은 [GitHub Issues](https://github.com/CODEHakR1234/ucware-llm-website-v2/issues)로 부탁드립니다.

Pull Request 환영합니다:
1. Fork 후 feature branch 생성
2. 변경사항 commit
3. Pull Request 생성

<br/>

---

## 라이선스

MIT License

© 2025 UCWORKS

<br/>

---

<p align="center">
  <strong>개발</strong>: 이학명 (Backend) | UCWORKS Team (Frontend)
</p>

<p align="center">
  <a href="https://github.com/CODEHakR1234/ucware-llm-website-v2">GitHub Repository</a>
</p>
