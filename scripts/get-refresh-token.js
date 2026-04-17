/**
 * Google OAuth 2.0 Refresh Token 발급 도우미 스크립트
 * 
 * 사용법: 
 * 1. 이 스크립트가 있는 폴더에서 `node get-refresh-token.js` 실행
 * 2. 화면에 출력된 링크를 브라우저에서 열고 구글 로그인
 * 3. 권한 허용 후 넘어오는 페이지의 URL에서 'code=' 뒷부분 복사
 * 4. 터미널에 붙여넣기 하면 새로운 Refresh Token 출력됨
 */

const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// .env.local 파일에서 설정 불러오기 (간이 파서)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return {};
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

const env = loadEnv();
const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('오류: .env.local 파일에서 GOOGLE_CLIENT_ID 또는 GOOGLE_CLIENT_SECRET을 찾을 수 없습니다.');
  process.exit(1);
}

// 리다이렉트 URI는 구글 콘솔에 등록된 것 중 하나여야 함 (보통 http://localhost:3000 등)
// 여기선 단순 코드 복사를 위해 'urn:ietf:wg:oauth:2.0:oob'를 쓰려 했으나 
// 최신 프로젝트는 이를 지원하지 않을 수 있으므로, 루프백 주소를 권장합니다.
// 하지만 사용자 편의를 위해 일단 빈 값을 넣고 URL을 생성합니다.
const REDIRECT_URI = 'http://localhost:3000'; 

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // 항상 리프레시 토큰을 받기 위해 강제
});

console.log('\n1. 아래 링크를 브라우저에서 열고 구글 계정으로 로그인하세요:\n');
console.log(authUrl);
console.log('\n2. 권한 허용 후 브라우저 주소창이 http://localhost:3000/?code=... 로 바뀝니다.');
console.log("3. 'code=' 뒷부분부터 '&' 앞부분까지(또는 끝까지) 영문/숫자 코드를 복사해서 아래에 입력하세요.");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n여기에 코드를 입력하세요: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n====================================');
    console.log('성공! 새로운 Refresh Token입니다:');
    console.log('\n' + tokens.refresh_token);
    console.log('\n이 값을 .env.local의 GOOGLE_REFRESH_TOKEN에 넣으세요.');
    console.log('Vercel 환경 변수도 반드시 이 값으로 업데이트해야 합니다.');
    console.log('====================================\n');
  } catch (err) {
    console.error('인증 코드 확인 중 오류 발생:', err.message);
  } finally {
    rl.close();
  }
});
