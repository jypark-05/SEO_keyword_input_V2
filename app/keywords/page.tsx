"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";

function KeywordsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL에서 초기값 가져오기
  const urlMain = searchParams.get("mainKeyword") || "";
  const urlSubsRaw = searchParams.get("subKeywords") || "[]";
  let urlSubs: string[] = [];
  try {
    urlSubs = JSON.parse(urlSubsRaw);
  } catch (e) {
    urlSubs = urlSubsRaw.split(",");
  }

  const [mainKeyword, setMainKeyword] = useState(urlMain);
  const [sub1, setSub1] = useState(urlSubs[0] || "");
  const [sub2, setSub2] = useState(urlSubs[1] || "");
  const [sub3, setSub3] = useState(urlSubs[2] || "");
  const [loadingRelated, setLoadingRelated] = useState(false);

  const handleNext = async () => {
    if (!mainKeyword || !sub1 || !sub2 || !sub3) return;
    setLoadingRelated(true);
    
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
    } catch(e) {
      console.error(e);
    }
    
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("mainKeyword", mainKeyword);
    currentParams.set("subKeywords", [sub1, sub2, sub3].join(","));
    if (relatedKw) currentParams.set("relatedKeywords", relatedKw);
    
    router.push(`/topics?${currentParams.toString()}`);
  };

  const isComplete = mainKeyword.trim() !== "" && sub1.trim() !== "" && sub2.trim() !== "" && sub3.trim() !== "";

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3 text-white">키워드 직접 입력</h1>
        <p className="text-gray-400 text-sm">블로그의 핵심이 될 <span className="text-[#3182f6] font-bold">메인 키워드 1개</span>와 <br/><span className="text-teal-400 font-bold">서브 키워드 3개</span>를 직접 입력해 주세요.</p>
      </div>

      <div className="space-y-8 mb-12">
        {/* Main Keyword Section */}
        <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-[#3182f6]/30 shadow-[0_0_20px_rgba(49,130,246,0.1)]">
          <label className="block text-sm font-bold text-[#3182f6] mb-3 ml-1">메인 키워드</label>
          <input 
            value={mainKeyword} 
            onChange={(e) => setMainKeyword(e.target.value)}
            className="w-full p-4 rounded-xl bg-black/40 border border-white/5 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white placeholder-gray-700 text-[15px]"
            placeholder="예: Next.js 실무 가이드"
          />
        </div>

        {/* Sub Keywords Section */}
        <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 space-y-4">
          <label className="block text-sm font-bold text-teal-400 mb-1 ml-1">서브 키워드 (3개 필수)</label>
          <div className="space-y-3">
            <input 
              value={sub1} 
              onChange={(e) => setSub1(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/5 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all text-white placeholder-gray-700 text-[15px]"
              placeholder="서브 키워드 1 (예: SSR 최적화)"
            />
            <input 
              value={sub2} 
              onChange={(e) => setSub2(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/5 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all text-white placeholder-gray-700 text-[15px]"
              placeholder="서브 키워드 2 (예: App Router 입문)"
            />
            <input 
              value={sub3} 
              onChange={(e) => setSub3(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/5 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all text-white placeholder-gray-700 text-[15px]"
              placeholder="서브 키워드 3 (예: 리액트 쿼리 연동)"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleNext} 
          disabled={!isComplete || loadingRelated}
          className={`w-full max-w-sm py-4 rounded-[20px] font-bold text-[15px] transition-all flex justify-center items-center gap-2
            ${isComplete
              ? 'bg-[#3182f6] text-white hover:bg-[#1b64da] active:scale-[0.98] shadow-[0_8px_30px_rgba(49,130,246,0.3)]' 
              : 'bg-[#1c1c1e] text-gray-600 cursor-not-allowed border border-white/5'}`}
        >
          {loadingRelated ? "연관 검색어 분석 중..." : "주제 기획하기"}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function KeywordsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <ProgressBar step={2} />
      <Suspense fallback={<div className="p-10 text-center text-gray-500">로딩 중...</div>}>
         <KeywordsContent />
      </Suspense>
    </main>
  );
}
