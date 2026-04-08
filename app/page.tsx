"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";

export default function Home() {
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [mainKeyword, setMainKeyword] = useState("");
  const [subKeyword1, setSubKeyword1] = useState("");
  const [subKeyword2, setSubKeyword2] = useState("");
  const [subKeyword3, setSubKeyword3] = useState("");
  const [target, setTarget] = useState("취업 준비생");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      courseName,
      mainKeyword,
      subKeywords: JSON.stringify([subKeyword1, subKeyword2, subKeyword3]),
      target,
      topicType: "정보성 콘텐츠"
    }).toString();
    router.push(`/keywords?${query}`);
  };

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <ProgressBar step={1} />
      <div className="flex-1 max-w-xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3 text-white">블로그 자동화 시작하기</h1>
          <p className="text-gray-400 text-sm">강의 정보와 타겟을 설정하고<br/>핵심 키워드를 직접 기입해 보세요.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1c1c1e] p-7 rounded-[32px] space-y-6 bg-opacity-70 backdrop-blur-3xl shadow-2xl border border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300 ml-1">강의명</label>
                <input required value={courseName} onChange={(e)=>setCourseName(e.target.value)} 
                  className="w-full p-4 rounded-2xl bg-black/50 border border-white/5 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white placeholder-gray-600 text-[15px]" 
                  placeholder="예: Next.js 14 실전 대비반" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300 ml-1">타겟 고객군</label>
                <select value={target} onChange={(e)=>setTarget(e.target.value)} 
                  className="w-full p-4 rounded-2xl bg-black/50 border border-white/5 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white text-[15px] cursor-pointer appearance-none">
                  <option value="취업 준비생">취업 준비생</option>
                  <option value="직장인">직장인 (이직/자기계발)</option>
                  <option value="일반인">일반인 (취미/부업)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300 ml-1">메인 키워드 (1개)</label>
              <input required value={mainKeyword} onChange={(e)=>setMainKeyword(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-black/50 border border-white/5 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white placeholder-gray-600 text-[15px]" 
                placeholder="가장 핵심이 되는 메인 키워드 입력" />
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-semibold mb-3 text-gray-300 ml-1">서브 키워드 (3개)</label>
              <div className="space-y-3">
                <input required value={subKeyword1} onChange={(e)=>setSubKeyword1(e.target.value)} 
                  className="w-full p-4 rounded-2xl bg-black/50 border border-white/5 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white placeholder-gray-600 text-[15px]" 
                  placeholder="서브 키워드 1" />
                <input required value={subKeyword2} onChange={(e)=>setSubKeyword2(e.target.value)} 
                  className="w-full p-4 rounded-2xl bg-black/50 border border-white/5 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white placeholder-gray-600 text-[15px]" 
                  placeholder="서브 키워드 2" />
                <input required value={subKeyword3} onChange={(e)=>setSubKeyword3(e.target.value)} 
                  className="w-full p-4 rounded-2xl bg-black/50 border border-white/5 focus:border-[#3182f6]/50 focus:ring-2 focus:ring-[#3182f6]/50 outline-none transition-all text-white placeholder-gray-600 text-[15px]" 
                  placeholder="서브 키워드 3" />
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-[#3182f6] text-white p-4 rounded-[20px] font-bold text-[15px] hover:bg-[#1b64da] active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-[0_8px_30px_rgba(49,130,246,0.2)]">
            연관 검색어 추출하기
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </form>
      </div>
    </main>
  );
}
