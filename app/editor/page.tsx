"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";

const SEO_CHECKLIST = [
  { id: 'c1', category: '기본 메타/타이틀', text: 'Title Tag: 핵심 키워드 1회 포함' },
  { id: 'c3', category: '기본 메타/타이틀', text: 'Meta Description: 요약 문장 존재, 검색 의도 설명됨' },
  { id: 'c4', category: '본문 구조(상단)', text: 'TL;DR: H1 바로 아래 요약' },
  { id: 'c5', category: '본문 구조(상단)', text: '단정형 문장: “~이다” 형태' },
  { id: 'c6', category: '본문 구조(상단)', text: '질문형 키워드: 실제 검색 질문 반영' },
  { id: 'c7', category: '분량/형식', text: '글자 수: 3,000자 이상' },
  { id: 'c8', category: '분량/형식', text: '문단 구조: 문단/리스트 적절' },
  { id: 'c9', category: '분량/형식', text: '정의 문장: “~란 무엇인가” 포함' },
  { id: 'c10', category: '본문 구조(하단)', text: 'FAQ: 5개 이상' },
  { id: 'c11', category: '태그 구조', text: 'H1 존재: 1개만 존재' },
  { id: 'c12', category: '태그 구조', text: 'H1 내용: 핵심 키워드 포함' },
  { id: 'c13', category: '태그 구조', text: 'H2 개수: 2~3개 사용' },
  { id: 'c14', category: '태그 구조', text: 'H2 구조: 논리적 흐름 유지' },
  { id: 'c15', category: 'E-E-A-T 요건', text: 'Experience: 실제 사례, 경험, 과정이 포함되었는가?' },
  { id: 'c16', category: 'E-E-A-T 요건', text: 'Expertise(1): 정의 → 원리 → 적용 → 주의사항 구조인가?' },
  { id: 'c17', category: 'E-E-A-T 요건', text: 'Expertise(2): 작성자 또는 브랜드 정보가 명확한가?' },
  { id: 'c18', category: 'E-E-A-T 요건', text: 'Authoritativeness: 동일 주제 콘텐츠와 내부 링크로 연결되었는가?' },
  { id: 'c19', category: 'E-E-A-T 요건', text: 'Trustworthiness: 최신 정보 기준으로 작성/수정되었는가?' },
  { id: 'c20', category: '신뢰성 강화', text: '최신 출처: 2022년 이후 고품질 출처 3개 이상 활용' },
  { id: 'c21', category: '신뢰성 강화', text: '참고 자료: 문서 하단에 참고 자료 리스트 포함' },
];

const groupedChecklist = SEO_CHECKLIST.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {} as Record<string, typeof SEO_CHECKLIST>);

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [done, setDone] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "guide">("editor");
  const [format, setFormat] = useState<"markdown" | "html">("markdown");
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedDocUrl, setSavedDocUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [refiningItemId, setRefiningItemId] = useState<string | null>(null);

  const courseName = searchParams.get("courseName") || "";
  const target = searchParams.get("target") || "";
  const usps = [searchParams.get("usp1"), searchParams.get("usp2"), searchParams.get("usp3")];
  const topicTitle = searchParams.get("topicTitle") || "";
  const topicDirection = searchParams.get("topicDirection") || "";
  const topicHook = searchParams.get("topicHook") || "";
  const contentType = searchParams.get("topicType") || "";

  const mainKeyword = searchParams.get("mainKeyword") || "";
  const subKeywords = searchParams.get("subKeywords")?.split(",") || [];
  const relatedKeywords = searchParams.get("relatedKeywords")?.split(",") || [];
  const useSearch = searchParams.get("useSearch") === "true";

  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current || !topicTitle) return;
    hasStarted.current = true;
    generateContent();
  }, [topicTitle]);

  const generateContent = async () => {
    setIsGenerating(true);
    setIsEvaluating(false);
    setDone(false);
    setContent("");
    setCheckedItems({});

    let generatedText = "";

    try {
      const seoGuide = localStorage.getItem("seoGuide") || "";

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainKeyword,
          subKeywords,
          relatedKeywords,
          selectedTopic: { title: topicTitle, direction: topicDirection, hook: topicHook },
          lectureInfo: courseName,
          usps,
          target,
          seoGuide,
          useSearch
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "글 생성 중 오류가 발생했습니다.");
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done: doneReading } = await reader.read();
        if (doneReading) break;
        const chunk = decoder.decode(value, { stream: true });
        
        // SOURCES_JSON 체크 (스트림 마지막에 전달됨)
        if (chunk.includes("SOURCES_JSON:")) {
          const parts = chunk.split("SOURCES_JSON:");
          const textPart = parts[0];
          const jsonPart = parts[1];
          
          generatedText += textPart;
          setContent(generatedText);
          
          try {
            const sources = JSON.parse(jsonPart);
            setGroundingSources(sources);
          } catch (e) {
            console.error("Failed to parse sources JSON", e);
          }
        } else {
          generatedText += chunk;
          setContent(generatedText);
        }
      }
    } catch (error: any) {
      console.error(error);
      setContent(error.message || "글 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsGenerating(false);
      setDone(true);
      return;
    } 

    setIsGenerating(false);
    
    // --- Start AI Evaluation ---
    setIsEvaluating(true);
    try {
      const evalRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: generatedText, mainKeyword })
      });
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        if (!evalData.error) {
          setCheckedItems(evalData);
        }
      }
    } catch (evalErr) {
      console.error("Evaluation failed", evalErr);
    } finally {
      setIsEvaluating(false);
      setDone(true);
    }
  };

  const charCount = content.length;
  
  // 공백 및 대소문자 정규화 (탐지 확률 향상)
  const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedContent = normalize(content);

  const mainKeywordIncluded = mainKeyword 
    ? normalizedContent.includes(normalize(mainKeyword)) 
    : false;

  const convertToHtmlText = (markdown: string) => {
    const lines = markdown.split('\n');
    let htmlOutput = `<style>

.fc-maintext {
    font-size: 52px; 
    letter-spacing:-0.2px;
    line-height:135%
}
@media screen and (max-width: 767px) {
    .fc-maintext {
        font-size: 40px; 
        letter-spacing:-0.15px;
    }
    .br-delete br {
        display: none;
    }
}


.fc-h1 {
    font-size: 40px; 
    letter-spacing:-0.2px;
}
@media screen and (max-width: 767px) {
    .fc-h1 {
        font-size: 32px; 
        letter-spacing:-0.2px;
    }
    .br-delete br {
        display: none;
    }
}

.fc-h2 {
    font-size: 32px; 
    letter-spacing:-0.2px;
}
@media screen and (max-width: 767px) {
    .fc-h2 {
        font-size: 28px; 
        letter-spacing:-0.15px;
    }
    .br-delete br {
        display: none;
    }
}

.fc-h3 {
    font-size: 28px; 
    letter-spacing:-0.15px;
}
@media screen and (max-width: 767px) {
    .fc-h3 {
        font-size: 24px; 
        letter-spacing:-0.15px;
    }
    .br-delete br {
        display: none;
    }
}

.fc-h4 {
    font-size: 24px; 
    letter-spacing:-0.15px;
}
@media screen and (max-width: 767px) {
    .fc-h4 {
        font-size: 20px; 
        letter-spacing:-0.15px;
    }
    .br-delete br {
        display: none;
    }
}

.fc-h5 {
    font-size: 20px; 
    letter-spacing:-0.15px;
}
@media screen and (max-width: 767px) {
    .fc-h5 {
        font-size: 16px; 
        letter-spacing:-0.1px;
    }
    .br-delete br {
        display: none;
    }
}

.fc-h6 {
    font-size: 18px; 
    letter-spacing:-0.1px;
    font-weight:500;
}
@media screen and (max-width: 767px) {
    .fc-h6 {
        font-size: 16px; 
    }
    .br-delete br {
        display: none;
    }
}

.fc-con {
    font-size: 14px; 
    letter-spacing:-0.1px;
    display:inline-block;
}
@media screen and (max-width: 767px) {
    .fc-con {
        font-size: 12px; 
    }
    .br-delete br {
        display: none;
    }
}


.tag-1 {
font-weight: 700;
letter-spacing: -.1px;
color: #43E6FF;
padding: 5px 10px;
border-radius:5px;
border:1px solid #43E6FF;
display:inline-block;
}

.tag-2 {
font-size: 14px;
font-weight: 700;
letter-spacing: -.1px;
color: #fff;
background: #3593FF;
padding: 10px 16px;
border-radius:40px;
display:inline-block;
}

.tag-3 {
font-size: 16px;
font-weight: 700;
letter-spacing: -.1px;
color: #43E6FF;
background: #051618;
padding: 5px 10px;
border-radius:5px;
border:1px solid #43E6FF;
display:inline-block;
}

.tag-4 {
font-size: 16px;
font-weight: 700;
letter-spacing: -.1px;
color: #43E6FF;
background: #0B3C56;
padding: 5px 10px;
border-radius:5px;
border:1px solid #43E6FF;
display:inline-block;
}

.kdc-label {
font-size: 14px;
font-weight: 700;
letter-spacing: -.1px;
color: #FFDD7F;
background: #000;
padding: 5px 10px;
border-radius:40px;
display:inline-block;
}

.button_challenge {
font-size: 14px;
font-weight: 700;
letter-spacing: -.1px;
color:#997100;
background:  #43E6FF;
padding: 11px 22px;
border-radius:10px;
transition: 0.2s ease-in-out;
margin-top:16px;
}
.button_challenge:hover {
background: #fff;
color:#997100;
}

.button {
letter-spacing: -.1px;
color:#010101;
background:  #43E6FF;
padding: 30px 35px 28px 35px;
border-radius:50px;
transition: 0.2s ease-in-out;
}
.button:hover {
background: #fff;
color:#010101;
}

</style>

<style>
  /* 기본: 숨김(데스크탑/태블릿) */
  .mobile-br { display: none; }

  /* 모바일(예: 768px 이하)에서만 보이게 */
  @media (max-width: 768px) {
    .mobile-br { display: block; }
  }
</style>

`;

    lines.forEach((line, index) => {
      let trimmed = line.trim();
      if (!trimmed) {
        // 단락 사이의 간격을 더 넓히기 위해 br(줄바꿈)을 2번 연속 삽입합니다.
        htmlOutput += "<br><br>";
        if (index < lines.length - 1) htmlOutput += "\n";
        return;
      }

      // markdown 볼드를 html <b> 로 치환
      trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      
      if (trimmed.startsWith('# ')) {
        htmlOutput += `<span class="fc-h1"><b>${trimmed.replace(/^# /, '').trim()}</b></span><br><br>`;
        // H1 바로 아래에 서브 키워드를 태그 형태로 삽입
        if (subKeywords && subKeywords.length > 0) {
           const tagsHtml = subKeywords.slice(0, 3).map((k: string) => 
             `<span style="color: #a0a0a0; border: 1px solid ed234b; background: #eeeeee; border-radius: 30px; margin-right: 5px; text-align: center; font-size: 15px; padding: 10px 25px 10px 25px;  display: inline-block; margin-bottom: 3px;">#${k.trim()}</span>`
           ).join('\n');
           htmlOutput += `<div style="display: flex; flex-wrap: wrap; margin-bottom: 24px;">\n${tagsHtml}\n</div>`;
        }
      } else if (trimmed.startsWith('## ')) {
        // H2에 굵기와 포인트 컬러(#FC1C49) 적용
        htmlOutput += `<span class="fc-h2" style="color: #FC1C49"><b>${trimmed.replace(/^## /, '').trim()}</b></span><br>`; 
      } else if (trimmed.startsWith('### ')) {
        htmlOutput += `<span class="fc-h2"><b>${trimmed.replace(/^### /, '').trim()}</b></span><br>`; 
      } else if (trimmed.startsWith('#### ')) {
        htmlOutput += `<span class="fc-h3"><b>${trimmed.replace(/^#### /, '').trim()}</b></span><br>`;
      } else if (trimmed.startsWith('##### ')) {
        htmlOutput += `<span class="fc-h3"><b>${trimmed.replace(/^##### /, '').trim()}</b></span><br>`;
      } else if (trimmed.startsWith('---')) {
        // 스크린샷과 유사한 스타일의 가로선
        htmlOutput += `<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;"><br>`;
      } else {
        htmlOutput += `<span class="fc-h6">${trimmed}</span><br>`;
      }
      
      if (index < lines.length - 1) htmlOutput += "\n";
    });

    return htmlOutput;
  };

  const copyToClipboard = () => {
    const textToCopy = format === 'html' ? convertToHtmlText(content) : content;
    navigator.clipboard.writeText(textToCopy);
    alert(format === 'html' ? "HTML 소스코드가 클립보드에 복사되었습니다!" : "마크다운이 클립보드에 복사되었습니다!");
  };

  const saveToGoogle = async () => {
    setIsSaving(true);
    setSaveError("");
    setSavedDocUrl(null);
    try {
      const res = await fetch("/api/save-to-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          courseName,
          contentType,
          target,
          mainKeyword,
          subKeywords,
          topicTitle,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "저장 실패");
      } else {
        setSavedDocUrl(data.docUrl);
      }
    } catch (err) {
      console.error(err);
      setSaveError("서버와의 통신에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFix = async (itemId: string, itemText: string) => {
    if (isGenerating || isEvaluating || refiningItemId) return;
    setRefiningItemId(itemId);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          taskText: itemText,
          mainKeyword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "수정 중 오류가 발생했습니다.");
      } else if (data.updatedContent) {
        setContent(data.updatedContent);
        // Re-evaluate after fix
        setIsEvaluating(true);
        const evalRes = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: data.updatedContent, mainKeyword })
        });
        if (evalRes.ok) {
          const evalData = await evalRes.json();
          setCheckedItems(evalData);
        }
        setIsEvaluating(false);
      }
    } catch (err) {
      console.error(err);
      alert("서버와 통신에 실패했습니다.");
    } finally {
      setRefiningItemId(null);
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
      <div className="flex flex-col md:flex-row gap-6 h-full min-h-[700px]">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1c1c1e] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
          <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex justify-between items-center backdrop-blur-md">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white mb-2">블로그 에디터</h1>
              <div className="flex items-center gap-2 bg-[#2c2c2e] p-1 rounded-[12px] border border-white/5">
                <button 
                  onClick={() => setFormat('markdown')}
                  className={`px-4 py-1.5 text-[12px] font-bold rounded-[8px] transition-all ${format === 'markdown' ? 'bg-[#3182f6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  Markdown
                </button>
                <button 
                  onClick={() => setFormat('html')}
                  className={`px-4 py-1.5 text-[12px] font-bold rounded-[8px] transition-all ${format === 'html' ? 'bg-[#3182f6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  HTML Code
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/topics?${searchParams.toString()}`)}
                className="px-4 py-2.5 rounded-[18px] font-bold text-[13px] text-gray-400 hover:text-white border border-white/5 hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                주제 다시 선택
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!done}
                className={`px-5 py-2.5 rounded-[18px] font-bold text-[13px] transition-all flex items-center gap-2
                  ${done ? 'bg-[#3182f6] text-white hover:bg-[#1b64da] active:scale-95 shadow-[0_4px_15px_rgba(49,130,246,0.25)]' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                복사하기
              </button>
            </div>
          </div>

          <div className="w-full h-[2px] bg-transparent z-10 overflow-hidden shrink-0">
            {isGenerating && (
              <div className="h-full bg-[#3182f6] w-1/3 animate-[slide_1.5s_ease-in-out_infinite]" style={{ animationName: 'slide' }}></div>
            )}
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes slide {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
          `}} />

            <textarea
              className={`w-full flex-1 p-8 bg-transparent outline-none resize-none text-[15px] leading-relaxed placeholder-gray-600 ${format === 'html' ? 'text-[#30d158] font-mono whitespace-pre-wrap' : 'text-[#f5f5f7] font-sans'}`}
              value={format === 'html' ? convertToHtmlText(content) : content}
              onChange={(e) => {
                if (format === 'markdown') setContent(e.target.value);
              }}
              readOnly={format === 'html'}
              placeholder="AI가 블로그 내용을 작성하고 있습니다..."
            />

            {/* Grounding Sources (실시간 검색 출처) */}
            {groundingSources.length > 0 && (
              <div className="mx-8 mb-8 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3182f6]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#3182f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-400">검증된 실시간 검색 소스</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {groundingSources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] text-gray-500 hover:text-[#3182f6] hover:border-[#3182f6]/30 transition-all flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {source.title.length > 30 ? source.title.substring(0, 30) + "..." : source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-[#1c1c1e] border border-white/5 rounded-[32px] p-7 shadow-xl">
            <h3 className="font-bold text-[15px] mb-6 text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3182f6]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              생성 현황
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <p className="text-[13px] font-medium text-gray-500">상태</p>
                <p className="text-[14px] font-bold">
                  {isGenerating ? <span className="text-[#3182f6] animate-pulse">본문 생성 중...</span> : 
                   isEvaluating ? <span className="text-orange-400 animate-pulse">AI 검수 중...</span> : 
                   done ? <span className="text-[#30d158]">작성 및 검수 완료</span> : 
                   <span className="text-gray-400">대기 중</span>}
                </p>
              </div>

              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <p className="text-[13px] font-medium text-gray-500">글자 수</p>
                <p className="text-2xl font-bold tracking-tight text-white">{charCount.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-3 block">메인 키워드 최적화</p>
                <div className="bg-[#2c2c2e] p-3.5 rounded-2xl border border-white/5 space-y-3">
                  <p className="text-[14px] font-bold text-white truncate">{mainKeyword || "입력 없음"}</p>
                  <div className="flex items-center">
                    {mainKeywordIncluded ? (
                      <span className="text-[12px] font-bold text-[#30d158] bg-[#30d158]/10 px-2.5 py-1 rounded-full border border-[#30d158]/20 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        성공적으로 삽입됨
                      </span>
                    ) : (
                      <span className="text-[12px] font-bold text-[#ff453a] bg-[#ff453a]/10 px-2.5 py-1 rounded-full border border-[#ff453a]/20 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        아직 감지되지 않음
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {subKeywords.length > 0 && (
                <div>
                  <p className="text-[13px] font-medium text-gray-500 mb-3 block">서브 키워드 최적화</p>
                  <div className="flex flex-wrap gap-2">
                    {subKeywords.map((kw, i) => {
                      const included = normalizedContent.includes(normalize(kw));
                      return (
                        <span key={i} className={`text-[12px] font-bold px-3 py-1.5 rounded-full transition-colors ${included ? 'text-[#30d158] bg-[#30d158]/10 border border-[#30d158]/20' : 'text-gray-400 bg-white/5 border border-white/5'}`}>
                          {kw}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {relatedKeywords.length > 0 && (
                 <div>
                   <p className="text-[13px] font-medium text-gray-500 mb-3 block">연관 검색어 최적화 (3회 이상)</p>
                   <div className="flex flex-wrap gap-2">
                     {relatedKeywords.map((kw, i) => {
                       const count = (normalizedContent.match(new RegExp(normalize(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
                       const pass = count >= 3;
                       return (
                         <span key={i} className={`text-[12px] font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${pass ? 'text-[#30d158] bg-[#30d158]/10 border border-[#30d158]/20' : count > 0 ? 'text-orange-400 bg-orange-400/10 border border-orange-400/20' : 'text-gray-400 bg-white/5 border border-white/5'}`}>
                           {kw} <span className="text-[10px] ml-1 bg-black/20 px-1.5 py-0.5 rounded-md">{count}</span>
                         </span>
                       );
                     })}
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* Google Docs 저장 */}
          {done && (
            <div className="bg-[#1c1c1e] border border-white/5 rounded-[32px] p-6 shadow-xl">
              <h3 className="font-bold text-[15px] mb-4 text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#34a853]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 9V3.5L18.5 9H13zM7 13h10v2H7v-2zm0 4h7v2H7v-2z"/>
                </svg>
                Google Docs 저장
              </h3>

              {savedDocUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-[#30d158]/10 border border-[#30d158]/20 rounded-2xl px-4 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#30d158] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <span className="text-[12px] font-bold text-[#30d158]">저장 및 아카이빙 완료!</span>
                  </div>
                  <a href={savedDocUrl} target="_blank" rel="noopener noreferrer"
                    className="block w-full py-3 rounded-[16px] font-bold text-[13px] text-center bg-[#34a853]/20 text-[#34a853] hover:bg-[#34a853]/30 transition-all border border-[#34a853]/20">
                    📄 Google Docs에서 열기
                  </a>
                </div>
              ) : saveError ? (
                <div className="space-y-3">
                  <div className="bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-2xl px-4 py-3">
                    <span className="text-[12px] text-[#ff453a]">{saveError}</span>
                  </div>
                  <button onClick={saveToGoogle} className="w-full py-3 rounded-[16px] font-bold text-[13px] bg-white/10 text-white hover:bg-white/20 transition-all">
                    다시 시도
                  </button>
                </div>
              ) : (
                <button
                  onClick={saveToGoogle}
                  disabled={isSaving}
                  className={`w-full py-3.5 rounded-[16px] font-bold text-[13px] transition-all flex items-center justify-center gap-2
                    ${isSaving ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-[#34a853]/20 text-[#34a853] hover:bg-[#34a853]/30 border border-[#34a853]/20 active:scale-[0.98]'}`}
                >
                  {isSaving ? (
                    <><div className="w-4 h-4 border-2 border-[#34a853] border-t-transparent rounded-full animate-spin"></div> 저장 중...</>
                  ) : (
                    <>Google Docs에 저장 + Sheets 아카이빙</>
                  )}
                </button>
              )}
            </div>
          )}

          <div className="bg-[#1c1c1e] border border-white/5 rounded-[32px] p-6 mt-auto">
            <button
              onClick={generateContent}
              disabled={isGenerating || isEvaluating}
              className={`w-full py-4 rounded-[20px] font-bold text-[14px] transition-all active:scale-[0.98]
                 ${(isGenerating || isEvaluating) ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20 hover:shadow-lg'}`}
            >
              새로 생성하기
            </button>
          </div>
        </div>
      </div>

      {/* SEO Checklist Area (검수 중이거나 완료 시 표시) */}
      {(isEvaluating || done) && (
        <div className="mt-8 bg-[#1c1c1e] border border-white/5 rounded-[32px] p-8 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
          <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {isEvaluating ? (
                  <div className="w-6 h-6 border-2 border-[#3182f6] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3182f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {isEvaluating ? 'AI가 SEO 가이드라인 준수 여부를 검토 중입니다...' : 'SEO 가이드라인 최종 체크리스트'}
              </h2>
              <p className="text-[13px] text-gray-400 mt-2 ml-9">
                {isEvaluating ? '작성된 글의 논리 구조와 E-E-A-T 요건 등을 평가하고 있습니다. (약 10~15초 소요)' : 'AI가 요건을 직접 분석하여 자체 평가한 가이드라인 준수 결과입니다.'}
              </p>
            </div>
            {!isEvaluating && (
              <div className="bg-[#2c2c2e] px-5 py-2.5 rounded-2xl border border-white/10 text-[14px] font-bold flex items-center gap-3">
                <span className="text-gray-400">통과 항목</span>
                <span className="text-[16px] text-[#3182f6] tracking-tight">{Object.values(checkedItems).filter(Boolean).length} <span className="text-gray-500 text-[13px]">/ {SEO_CHECKLIST.length}</span></span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(groupedChecklist).map(([category, items]) => (
              <div key={category} className="bg-white/[0.02] border border-white/5 rounded-[24px] p-5 hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                {isEvaluating && <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10"></div>}
                <h3 className="font-bold text-[14px] text-white mb-5 flex items-center gap-2 px-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isEvaluating ? 'bg-gray-500 animate-pulse' : 'bg-[#3182f6]'}`}></div>
                  {category}
                </h3>
                <div className="space-y-4 px-1">
                  {items.map(item => {
                    const isChecked = !!checkedItems[item.id];
                    return (
                      <div key={item.id} className="flex items-start gap-3 relative">
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all duration-300
                          ${isEvaluating ? 'border-gray-700 bg-black/20' : isChecked ? 'bg-[#3182f6] border-[#3182f6]' : 'border-red-500/50 bg-red-500/10'}`}>
                          {isEvaluating ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-ping"></div>
                          ) : isChecked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                          <span className={`text-[13px] leading-relaxed transition-all duration-300 select-none
                            ${isEvaluating ? 'text-gray-500' : isChecked ? 'text-gray-300' : 'text-red-400/90 font-medium'}`}>
                            {item.text}
                          </span>
                          {!isEvaluating && !isChecked && done && (
                            <button
                              onClick={() => handleFix(item.id, item.text)}
                              disabled={!!refiningItemId}
                              className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all flex items-center gap-1
                                ${refiningItemId === item.id 
                                  ? 'bg-[#3182f6]/10 border-[#3182f6]/30 text-[#3182f6] animate-pulse' 
                                  : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 active:scale-95'}`}
                            >
                              {refiningItemId === item.id ? (
                                <><div className="w-2 h-2 border-1 border-[#3182f6] border-t-transparent rounded-full animate-spin"></div> 수정 중...</>
                              ) : (
                                <>자동 수정(Fix) ✨</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <ProgressBar step={3} />
      <Suspense fallback={<div className="p-10 text-center text-gray-500">로딩 중...</div>}>
        <EditorContent />
      </Suspense>
    </main>
  );
}
