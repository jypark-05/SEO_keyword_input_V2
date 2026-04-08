import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [courseName, setCourseName] = useState("");
  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeyword1, setSubKeyword1] = useState("");
  const [subKeyword2, setSubKeyword2] = useState("");
  const [subKeyword3, setSubKeyword3] = useState("");
  const [target, setTarget] = useState("취업 준비생");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 뒤로가기 시 데이터 복구
  useEffect(() => {
    const urlCourse = searchParams.get("courseName");
    const urlMain = searchParams.get("mainKeyword");
    const urlTarget = searchParams.get("target");
    const urlSubsRaw = searchParams.get("subKeywords");

    if (urlCourse) setCourseName(urlCourse);
    if (urlMain) setMainKeyword(urlMain);
    if (urlTarget) setTarget(urlTarget);
    
    if (urlSubsRaw) {
      const subs = urlSubsRaw.split(",");
      if (subs[0]) setSubKeyword1(subs[0]);
      if (subs[1]) setSubKeyword2(subs[1]);
      if (subs[2]) setSubKeyword3(subs[2]);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    let relatedKw = "";
    try {
      const res = await fetch("/api/related", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mainKeyword })
      });
      const data = await res.json();
      if (data.relatedKeywords && data.relatedKeywords.length > 0) {
        relatedKw = data.relatedKeywords.join(",");
      }
    } catch (e) {
      console.error("Related keyword analysis failed", e);
    }

    const query = new URLSearchParams({
      courseName,
      mainKeyword,
      subKeywords: [subKeyword1, subKeyword2, subKeyword3].join(","),
      relatedKeywords: relatedKw,
      target,
      topicType: "정보성 콘텐츠"
    }).toString();
    
    router.push(`/topics?${query}`);
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">블로그 자동화 시작하기</h1>
        <p className="text-gray-400 text-[15px] leading-relaxed">
          강의 정보와 타겟을 입력하고, 블로그의 핵심이 될 <br/>
          <span className="text-[#3182f6] font-bold text-lg">메인 키워드</span>와 <span className="text-teal-400 font-bold text-lg">서브 키워드</span>를 기입해 주세요.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Info */}
        <div className="bg-[#1c1c1e] p-8 rounded-[32px] space-y-6 border border-white/5 shadow-2xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
            <span className="w-1.5 h-6 bg-[#3182f6] rounded-full"></span>
            기본 정보 설정
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-400 ml-1">강의명</label>
              <input required value={courseName} onChange={(e)=>setCourseName(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white placeholder-gray-700 text-[15px]" 
                placeholder="예: Next.js 14 실전 대비반" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-400 ml-1">타겟 고객군</label>
              <select value={target} onChange={(e)=>setTarget(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white text-[15px] cursor-pointer appearance-none">
                <option value="취업 준비생">취업 준비생</option>
                <option value="직장인">직장인 (이직/자기계발)</option>
                <option value="일반인">일반인 (취미/부업)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Keywords (Premium Style) */}
        <div className="bg-[#1c1c1e] p-8 rounded-[32px] border border-[#3182f6]/30 shadow-[0_0_40px_rgba(49,130,246,0.1)] space-y-6">
          <h2 className="text-lg font-bold text-[#3182f6] flex items-center gap-2 mb-2">
            <span className="w-1.5 h-6 bg-[#3182f6] rounded-full"></span>
            핵심 키워드 기입
          </h2>
          
          <div>
            <label className="block text-sm font-bold text-[#3182f6] mb-3 ml-1">메인 키워드 (1개)</label>
            <input required value={mainKeyword} onChange={(e)=>setMainKeyword(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white placeholder-gray-700 text-[15px] font-medium" 
              placeholder="가장 핵심이 되는 메인 키워드 입력" />
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-bold text-teal-400 mb-3 ml-1">서브 키워드 (3개 필수)</label>
            <div className="space-y-3">
              <input required value={subKeyword1} onChange={(e)=>setSubKeyword1(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all text-white placeholder-gray-700 text-[15px]" 
                placeholder="서브 키워드 1 (예: SEO 최적화)" />
              <input required value={subKeyword2} onChange={(e)=>setSubKeyword2(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all text-white placeholder-gray-700 text-[15px]" 
                placeholder="서브 키워드 2 (예: App Router 입문)" />
              <input required value={subKeyword3} onChange={(e)=>setSubKeyword3(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-black/50 border border-white/10 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all text-white placeholder-gray-700 text-[15px]" 
                placeholder="서브 키워드 3 (예: 리액트 쿼리 연동)" />
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isAnalyzing}
          className={`w-full p-5 rounded-[24px] font-bold text-[16px] transition-all flex justify-center items-center gap-2 shadow-[0_8px_30px_rgba(49,130,246,0.3)]
            ${isAnalyzing ? 'bg-[#1c1c1e] text-gray-500 cursor-not-allowed border border-white/5' : 'bg-[#3182f6] text-white hover:bg-[#1b64da] active:scale-[0.98]'}`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-600 border-t-[#3182f6] rounded-full animate-spin"></div>
              연관 검색어 분석 중...
            </>
          ) : (
            <>
              주제 기획하기
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <ProgressBar step={1} />
      <Suspense fallback={<div className="p-10 text-center text-gray-400">로딩 중...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
