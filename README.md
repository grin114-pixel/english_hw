# 영문학당

영문학당 알림장 PWA 앱입니다.

## 시작하기

### 1. Supabase 설정

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase_schema.sql` 내용을 실행
3. Project Settings > API에서 `URL`과 `anon key` 복사

### 2. 환경변수 설정

`.env` 파일을 수정하세요:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 실행

```bash
npm install
npm run dev
```

### 4. 빌드 (배포용)

```bash
npm run build
```

## 기능

- **알림장 카드**: 날짜 + 체크리스트 항목으로 구성된 알림장
- **오늘의 숙제**: 여러 알림장의 항목을 선택해 하나의 숙제 카드로 생성
- **PWA**: 홈 화면에 추가해 앱처럼 사용 가능
- **실시간 저장**: Supabase에 자동 저장
