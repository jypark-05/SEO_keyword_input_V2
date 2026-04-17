import { NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * 이 라우트는 개발 환경에서 구글 Refresh Token을 안전하게 획득하기 위한 디버그 도구입니다.
 * 사용법:
 * 1. 구글 클라우드 콘솔에서 리디렉션 URI에 'http://localhost:3000/api/debug-auth' 추가
 * 2. 브라우저에서 'http://localhost:3000/api/debug-auth'로 접속
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/debug-auth"
  );

  // [1] 코드가 없는 경우: 구글 로그인 페이지로 리다이렉트
  if (!code) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
      prompt: "consent", // 리프레시 토큰 강제 발급
    });

    return NextResponse.redirect(authUrl);
  }

  // [2] 코드가 있는 경우: 토큰 교환 및 화면 출력
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; line-height: 1.6; background: #111; color: #eee;">
          <h2 style="color: #4ade80;">🚀 새로운 Refresh Token 획득 성공!</h2>
          <p>아래 토큰을 복사해서 <b>.env.local</b> 및 <b>Vercel 환경 변수</b>에 복사해 넣으세요.</p>
          
          <div style="background: #222; padding: 20px; border-radius: 8px; border: 1px solid #444; word-break: break-all;">
            <code style="color: #fbbf24; font-size: 1.2rem;">${tokens.refresh_token}</code>
          </div>
          
          <p style="margin-top: 20px; color: #888;">⚠️ 주의: 이 토큰이 노출되지 않도록 주의하시고, 사용 후에는 이 파일(app/api/debug-auth/route.ts)을 삭제하는 것이 안전합니다.</p>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
