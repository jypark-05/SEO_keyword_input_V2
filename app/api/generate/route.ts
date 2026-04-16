import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_SEO_GUIDE = `당신은 교육 회사의 Google SEO + AEO(Answer Engine Optimization) + GEO 전문 작가입니다.
아래 가이드를 반드시 100% 준수하여 ChatGPT, Perplexity, Gemini 등 AI 검색 엔진에서 우리 콘텐츠가 인용되고 추천되도록 블로그를 작성하세요.

▶ 글 구조 (반드시 이 순서 준수)
1. Title 태그용 제목: 화면 최상단에 "**Title**: [제목]" 형식으로 반드시 텍스트로 출력 (메인 키워드를 반드시 제목 맨 앞에 배치, 국문 20~30자)
2. Meta Description: 그 아래에 "**Meta Description**: [설명]" 형식으로 반드시 텍스트로 출력 (전략 키워드 13자 이내 배치, 국문 80~110자)
3. H1: Title과 동일하거나 유사하게 작성, 페이지당 1개 고정. **메인 키워드가 반드시 제목 맨 앞에 위치**해야 합니다.
4. 글 미리보기 (TL;DR): H1 바로 아래 문단에 --- (구분선)을 넣으세요. 먼저 이 글의 핵심 내용을 2~3문장으로 요약(TL;DR)하여 작성하고, 이어서 '### 글 미리보기' 소제목과 함께 본문 H2 제목들을 숫자 리스트 형태로 적으세요. 마지막에 다시 --- (구분선)으로 닫으세요.
5. 본문 (H2-H3): 아래 AEO 규칙을 반영하여 자연스럽고 구조적으로 작성
6. FAQ: 사람들이 가장 많이 묻는 질문 5개 이상 (PAA 전략 및 AEO 규칙 준수)
7. 결론: 본문 내용과 자연스럽게 이어지는 매력적인 소제목 사용 (예: '데이터 분석가로 거듭나는 마지막 한 걸음') 및 강의 참여 유도.

▶ AEO (Answer Engine Optimization) 최적화 규칙
AI 검색(ChatGPT, Perplexity, Google AI Overview 등)에서 콘텐츠가 인용되도록 아래 규칙을 반드시 준수하세요.

[1] 질문형 소제목 + 즉답 구조 (T2 제목 최적화)
- H2, H3 제목 중 최소 3개 이상을 사람이 직접 검색창에 입력할 법한 자연스러운 질문 형태로 작성
  예) "파이썬 입문, 독학으로도 가능할까요?" / "왜 지금 데이터 사이언스를 배워야 하나요?"
- 질문형 제목 바로 아래 첫 문단에 핵심 답변을 반드시 2~3문장으로 즉시 제시 (AI가 스니펫으로 채택하기 쉬운 구조)

[2] FAQ 섹션 강화
- FAQ는 반드시 5개 이상 포함
- 각 질문은 실제 검색창에 입력할 법한 자연어 형태로 작성 (예: "비전공자도 코딩 테스트 합격할 수 있나요?")
- 각 답변은 첫 문장에 핵심을 담고 50~150자 이내로 간결하게 작성
- FAQ 전체를 마크다운 Q&A 형식으로 구성

[3] 정의형 문장 포함 (Entity Linking)
- 메인 키워드에 대한 명확한 정의를 본문 초반에 배치 (형식: "X는 Y하는 Z이다.")
- 핵심 엔티티(기술명, 도구명, 관련 직무 등)를 명확히 언급하여 AI가 지식 그래프를 형성하기 좋게 작성

[4] 구조화된 리스트 및 표 활용
- 단계별 방법, 비교, 장단점 등은 반드시 번호형/불릿형 리스트로 작성
- 표(Table)를 최소 1개 이상 활용하여 복잡한 정보를 시각적으로 구조화

[5] 핵심 수치 강조 및 출처 활용
- 본문 내 수치와 통계는 굵은 글씨(**수치**)로 강조
- AI 검색은 구체적인 수치가 포함된 답변을 우선 인용함

[6] Conversational Connectors (대화형 연결어)
- "간단히 말해서", "결론부터 말씀드리면", "핵심은 이것입니다"와 같은 표현을 사용하여 AI 엔진이 답변의 핵심을 즉시 파악하게 함

▶ 키워드 사용 규칙
- 메인 키워드: H1과 TL;DR에 반드시 포함, 본문 전체 밀도 1~2% 유지
- 서브 키워드: H2/H3에 자연스럽게 분산 배치 (본문에 최소 3회 이상 삽입 필수)
- 연관 키워드: 본문 작성 중 각 연관 키워드를 3번 이상 포함 (문맥에 자연스럽게 녹이기)

▶ 작성 톤앤매너 (인간다운 글쓰기)
- 어휘 복잡성(Burstiness)과 문장 다양성(Perplexity)을 높여 실제 전문가가 쓴 듯한 느낌을 줍니다.
- 문체: ~해요, ~합니다 (친근한 구어체 존댓말, 실제 사람이 설명해주는 듯한 느낌)
- 금지 표현: "결론적으로", "요약하자면" 등 상투적 표현 배제
- 로봇 같은 딱딱한 나열식 문체 절대 금지 (공감 기반 서술 포함)

▶ E-E-A-T 및 신뢰성
- Experience(실제 경험/사례), Expertise(원리/적용), Authoritativeness(수치/출처), Trust(커널 아카데미) 반영
- 최신 출처(2022년 이후) 3개 이상 반드시 활용 및 하단 '참고 자료' 리스트 포함

▶ 신뢰성 강화 — 최신 출처 의무 활용 규칙
콘텐츠 작성 전, 아래 조건을 만족하는 외부 출처를 반드시 수집하고 본문에 활용하세요.
- 수집 기간: 2022년 1월 이후 자료만 허용 (최소 3개 이상)
- 허용 출처: 학술 논문, 정부/공공기관 자료, 주요 언론 기사, 업계 공식 리포트 등
- 활용 방법: 수치나 통계에 반드시 출처 명시, 인용 형식 엄수

[AEO 체크리스트 - 작성 완료 후 자체 검토]
- [ ] 질문형 H2/H3 소제목이 3개 이상이며 자연스러운 문장인가?
- [ ] 각 질문형 소제목 바로 아래 즉답 2~3문장이 있는가?
- [ ] 메인 키워드의 명확한 정의 문장이 초반에 있는가?
- [ ] FAQ가 자연어 질문 형태로 5개 이상인가?
- [ ] 각 FAQ 답변이 50~150자 이내인가?
- [ ] 수치/통계가 굵은 글씨로 강조되어 있는가?
- [ ] 단계/비교/장단점이 구조화된 리스트나 표로 정리되어 있는가?
- [ ] 핵심 엔티티와 대화형 연결어가 적절히 사용되었는가?

[최종 점검 체크리스트]
- 전체 글자 수: 공백 포함 3,000~3,500자 준수 (4,000자 초과 금지)
- H1 및 Title 맨 앞 메인 키워드 배치 확인
- 참고 자료 URL 및 문맥 내 인용 확인`;

export async function POST(req: Request) {
  try {
    const { mainKeyword, subKeywords, relatedKeywords, selectedTopic, lectureInfo, usps, target, seoGuide, useSearch } = await req.json();

    const systemPrompt = seoGuide && seoGuide.trim().length > 0 ? seoGuide : DEFAULT_SEO_GUIDE;

    const userPrompt = `
[변수]
- mainKeyword: ${mainKeyword}
- subKeywords: ${subKeywords.join(", ")}
- relatedKeywords: ${(relatedKeywords || []).join(", ")} (지시: 본문에 각 연관 키워드 최소 3번 이상 포함)
- selectedTopic: 제목("${selectedTopic.title}"), 방향성("${selectedTopic.direction}"), 훅("${selectedTopic.hook}")
- lectureInfo: ${lectureInfo}
- usps: 1. ${usps[0]}, 2. ${usps[1]}, 3. ${usps[2]}
- target: ${target}

위 변수들을 바탕으로 최적화된 블로그 글을 작성해주세요.
`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'placeholder') {
      const stream = new ReadableStream({
        async start(controller) {
          const text = "# Mock API Output\n\nThis is a mocked streaming text because the GEMINI_API_KEY is missing or set to placeholder.\n\n" + userPrompt;
          const chunks = text.split("");
          let i = 0;
          const interval = setInterval(() => {
            if (i >= chunks.length) {
              clearInterval(interval);
              controller.close();
            } else {
              controller.enqueue(new TextEncoder().encode(chunks[i]));
              i++;
            }
          }, 10);
        }
      });
      return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const stream = new ReadableStream({
      async start(controller) {
        let gatheredFacts = "";
        let gatheredSources: any[] = [];

        try {
          // [Step 1] 검색 단계 (useSearch가 활성화된 경우)
          if (useSearch) {
            try {
              // Tavily API를 사용한 실시간 검색 및 요약
              const tavilyApiKey = process.env.TAVILY_API_KEY;
              if (!tavilyApiKey) {
                throw new Error("TAVILY_API_KEY 환경변수가 설정되지 않았습니다. 서버를 재시작했는지 확인해주세요.");
              }

              const searchQuery = `${mainKeyword} 트렌드 및 최신 정보: ${selectedTopic.title}`;
              const tavilyResponse = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${tavilyApiKey}`
                },
                body: JSON.stringify({
                  query: searchQuery,
                  search_depth: "basic",
                  include_answer: true,
                  max_results: 5
                })
              });

              if (!tavilyResponse.ok) {
                throw new Error(`Tavily API 요청 실패: ${tavilyResponse.statusText}`);
              }

              const searchData = await tavilyResponse.json();
              
              // Tavily가 요약해준 최상단 answer와 개별 검색 결과를 합쳐서 팩트 구성
              gatheredFacts = "";
              if (searchData.answer) {
                gatheredFacts += `[요약]\n${searchData.answer}\n\n`;
              }
              if (searchData.results && searchData.results.length > 0) {
                gatheredFacts += searchData.results.map((r: any) => `Title: ${r.title}\nContent: ${r.content}`).join("\n\n");
                gatheredSources = searchData.results.map((r: any) => ({
                  title: r.title || "참고자료",
                  url: r.url || "#"
                }));
              } else {
                gatheredFacts = "관련된 최신 검색 결과를 찾지 못했습니다.";
              }
            } catch (searchError: any) {
              console.error("Search Phase Error:", searchError);
              // 검색은 실패해도 글쓰기는 계속 진행함
            }
          }

          // [Step 2] 작성 단계 (메인 모델 호출)
          const writerModel = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite-preview",
            systemInstruction: systemPrompt,
          });

          const finalUserPrompt = `
[수집된 실시간 정보]
${gatheredFacts || "없음 (일반 지식 기반 작성)"}

[출처 목록]
${gatheredSources.map(s => `- ${s.title}: ${s.url}`).join("\n") || "없음"}

---
위 실시간 정보를 반드시 반영하여 아래 변수를 바탕으로 블로그 글을 작성해주세요.

[변수]
- mainKeyword: ${mainKeyword}
- subKeywords: ${subKeywords.join(", ")}
- relatedKeywords: ${(relatedKeywords || []).join(", ")} (지시: 본문에 각 연관 키워드 최소 3번 이상 포함)
- selectedTopic: 제목("${selectedTopic.title}"), 방향성("${selectedTopic.direction}"), 훅("${selectedTopic.hook}")
- lectureInfo: ${lectureInfo}
- usps: 1. ${usps[0]}, 2. ${usps[1]}, 3. ${usps[2]}
- target: ${target}
`;

          const result = await writerModel.generateContentStream(finalUserPrompt);

          // 텍스트 스트리밍
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }

          // 검색 출처 데이터 전달 (클라이언트 표시용)
          if (gatheredSources.length > 0) {
            const sourcesJson = JSON.stringify(gatheredSources);
            controller.enqueue(new TextEncoder().encode(`\n\nSOURCES_JSON:${sourcesJson}`));
          }

        } catch(e: any) {
          console.error("2-Step processing error:", e);
          if (e.message?.includes("429")) {
            controller.enqueue(new TextEncoder().encode("\n\n(API 할당량이 초과되었습니다. 잠시 후 다시 시도하거나 실시간 검색 옵션을 끄고 생성해 주세요.)"));
          }
          controller.error(e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) {
    console.error("Generate API Error:", error);
    if (error.message?.includes("429")) {
      return new Response(JSON.stringify({ error: "API 할당량이 초과되었습니다. 잠시 후 다시 시도하거나 실시간 검색 옵션을 끄고 생성해 주세요. (Tip: 실시간 검색은 쿼터 소모가 많으므로 꼭 필요할 때만 켜주세요.)" }), { status: 429 });
    }
    return new Response(JSON.stringify({ error: `Failed to generate content: ${error.message}` }), { status: 500 });
  }
}
