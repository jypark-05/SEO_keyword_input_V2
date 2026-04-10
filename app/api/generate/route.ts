import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_SEO_GUIDE = `당신은 교육 회사의 Google SEO + GEO 최적화 블로그 전문 작가입니다.
아래 가이드를 반드시 100% 준수하여 블로그 콘텐츠를 작성하세요.

▶ 글 구조 (반드시 이 순서 준수)
1. Title 태그용 제목: 화면 최상단에 "**Title**: [제목]" 형식으로 반드시 텍스트로 출력할 것 (메인 키워드 앞부분 배치, 국문 20~30자)
2. Meta Description: 그 아래에 "**Meta Description**: [설명]" 형식으로 반드시 텍스트로 출력할 것 (전략 키워드 13자 이내 배치, 국문 80~110자)
3. H1: Title과 동일하거나 유사하게 작성, 페이지당 1개 고정
4. 글 미리보기 (TL;DR): H1 바로 아래 문단에 --- (구분선)을 넣으세요. 먼저 이 글의 핵심 내용을 2~3문장으로 요약(TL;DR)하여 작성하고, 이어서 '### 글 미리보기' 소제목과 함께 본문 H2 제목들을 숫자 리스트 형태로 적으세요. 마지막에 다시 --- (구분선)으로 닫으세요.
5. H2-1 (개념/정의): 이 주제가 무엇인지 명확하게 정의
6. H2-2 (특징/장점): 핵심 소구 포인트(USP) 3개 자연스럽게 반영
7. H2-3 (해결책/가이드): 타겟 수강생이 당장 실천할 수 있는 Action Item 제시
8. FAQ: 사람들이 가장 많이 묻는 질문 5개 이상 (PAA 전략)
9. 결론: '결론 및 CTA', '요약'과 같은 상투적인 제목 대신, 본문 내용과 자연스럽게 이어지는 매력적인 소제목을 사용하세요. (예: '데이터 분석가로 거듭나는 마지막 한 걸음', '이제 당신의 포트폴리오를 완성할 때입니다' 등) 마지막에는 강의 참여를 유도하는 문장을 자연스럽게 섞어주세요.

▶ 키워드 사용 규칙
- 메인 키워드: H1과 TL;DR에 반드시 포함, 본문 전체 밀도 1~2% 유지
- 서브 키워드: H2/H3에 자연스럽게 분산 배치 (본문에 최소 3회 이상 삽입 필수)
- 연관 키워드: 반드시 본문 작성 중 각 연관 키워드를 3번 이상 포함할 것 (문맥에 자연스럽게 녹이기)
- Title에 전략 키워드는 최대 2개, 이상적으로는 1개

▶ 작성 톤앤매너 (반드시 준수)
- 문체: ~해요, ~합니다 (전문적이면서 친근한 톤, 실제 사람이 설명해주는 듯한 부드운 구어체 사용)
- 금지 표출: "결론적으로", "요약하자면", "오늘은~" 같은 상투적 표현 철저히 배제
- 전문적이지만 쉬운 언어: "효율성이 제고됨" 대신 "업무가 훨씬 가벼워져요"처럼 일상적인 표현을 쓰되 논리적 깊이는 유지
- 공감 기반 서술: "공부하시느라 힘드시죠?", "저도 이 개념을 처음 접했을 때 참 막막했는데요" 등 독자의 마음을 어루만지는 문장을 섞어준다
- 로봇 같은 딱딱한 나열식 문체 절대 금지
- 독자 공감: 타겟 수강생의 고민을 언급하며 공감대 형성 후 해결책 제시 (페르소나 빙의)
- 굵기 강조(Bold): 문단 내에서 중요한 개념이나 전략 키워드에는 반드시 '**굵게**' 표시를 자주 사용하여 가독성을 높이세요.

▶ 콘텐츠 구성 원칙
- 90% 정보성: 글의 대부분은 메인 키워드에 대한 심도 있는 정보, 방법론, 트렌드 분석으로 채운다. 독자가 "이 블로그 하나로 다 해결됐다"라고 느낄 만큼 유익하게 작성한다.
- 10% 홍보성: 강의 관련 언급은 글의 흐름상 꼭 필요한 경우가 아니면 최하단(마무리 섹션)으로 몰아넣는다. 본문 중간에 노골적인 수강 유도 멘트를 절대 넣지 않는다.

▶ E-E-A-T 기준 준수
- Experience(경험): 실제 과정/시행착오/현장 언어 포함, 일반론만 반복 금지
- Expertise(전문성): 정의→원리→예외→적용 순서로 설명, 오해 포인트/한계까지 언급
- Authoritativeness(권위): 수치/출처/데이터 반드시 포함
- Trust(신뢰): 작성자 표기 "커널 아카데미"

▶ GEO 최적화
- TL;DR 필수 포함 (H1 바로 아래)
- 표/리스트/단계형 구조 적극 활용
- FAQ 섹션 필수 포함
- 구조화된 마크다운 사용

▶ 스키마 마크업 준수사항
- H1: 페이지당 1개 고정, 메인 키워드 앞부분 배치
- H2: 3개 적정 + FAQ H2 추가, 각 H2 아래 H3 2~3개
- H태그와 본문 단락(p)은 반드시 쌍으로 구성
- 이미지 alt태그 제안 시: 핵심 키워드 포함 문장형 작성 (단어 나열 금지)

▶ 분량 및 형식
- 최소 3,000자 이상 (가능하면 3,000~3,500자)
- 마크다운 형식 (# ## ### 사용)
- 가독성: 한 문단은 최대 3~4문장으로 제한, Bullet Point 및 인용구(>) 적극 활용
- 본문 중간 강의 홍보 금지

▶ 신뢰성 강화 — 최신 출처 의무 활용 규칙 (섹션 8)
콘텐츠 작성 전, 아래 조건을 만족하는 외부 출처를 반드시 수집하고 본문에 활용하세요.

[출처 수집 조건]
- 수집 기간: 2022년 1월 이후 ~ 현재까지 발행된 자료만 허용
- 최소 출처 수: 공신력 있는 고품질 출처 3개 이상 반드시 활용
- 허용 출처 유형 (우선순위 순):
  1. 국내외 학술 논문 (Google Scholar, RISS, DBpia, PubMed 등)
  2. 정부/공공기관 공식 발표 자료 (고용노동부, 교육부, 통계청 등)
  3. 주요 언론 기사 (한국경제, 매일경제, 조선일보, Forbes, Harvard Business Review 등)
  4. 업계 공식 리포트 (McKinsey, Gartner, LinkedIn Learning 등)
  5. 검증된 전문가 인터뷰 또는 칼럼

[출처 활용 방법]
- 수집한 출처는 본문 내 해당 주장 바로 뒤에 자연스럽게 인용
- 인용 형식: (출처명, 발행연도) 또는 "○○에 따르면 ~" 형태로 작성
- 수치나 통계 데이터는 반드시 출처 명시
- 동일 출처를 2회 이상 반복 인용 금지

[출처 검증 체크리스트]
작성 완료 후 아래 항목을 자체 검토하세요.
- [ ] 2022년 이후 출처가 3개 이상 활용되었는가?
- [ ] 각 출처는 논문/공공기관/주요 언론 중 하나에 해당하는가?
- [ ] 수치/통계 데이터에 모두 출처가 명시되었는가?
- [ ] 출처가 본문 흐름에 자연스럽게 녹아있는가?

[출력 시 추가 항목]
본문 마지막에 아래 형식으로 참고 자료 목록을 반드시 포함하세요.

---
## 참고 자료
1. [출처명](URL) (발행연도) — 상세 제목
2. [출처명](URL) (발행연도) — 상세 제목
3. [출처명](URL) (발행연도) — 상세 제목
---

[출처 신뢰성 주의사항]
- 실제로 확인할 수 없거나 불확실한 출처는 절대 만들어내지 마세요 (환각 엄격 금지).
- 사용자 프롬프트에 제공된 [수집된 실시간 정보]와 [출처 목록]을 최우선으로 분석하여 본문에 인용하세요.
- 각주나 출처 표기 시, [출처 목록]에 명시된 Title과 URL만 사용하세요.
- 제공된 실시간 정보만으로 부족할 경우 일반적인 지식은 활용하되, 구체적인 논문 제목, 저자, 링크 등을 임의로 지어내면 절대 안 됩니다.
- 본문 하단의 '참고 자료' 목록에는 [출처 목록]에 제공된 실제 URL만을 포함하세요.`;

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
