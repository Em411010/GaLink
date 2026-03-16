import OpenAI from "openai";

let _openai = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

/**
 * Interpret a user's problem description using GPT.
 * Returns structured data: problemType, requiredSkills, urgencyLevel, locationRelevant.
 */
export async function interpretProblem(userMessage, dialect = null) {
  const languageOverride =
    dialect === "cebuano"
      ? "\n\nLANGUAGE OVERRIDE: The user is writing in Cebuano/Bisaya. ALL string fields (empathyLine, clarificationQuestion, summary) MUST be in natural Cebuano/Bisaya. Use warm Bisaya expressions like 'Bay', 'maayo', 'nindot', 'dili', 'mao ba?'. No English or Tagalog."
      : dialect === "taglish"
      ? "\n\nLANGUAGE OVERRIDE: The user is writing in Filipino/Tagalog. ALL string fields (empathyLine, clarificationQuestion, summary) MUST be in natural Taglish (Filipino-English mix). Keep it warm and conversational. No pure English."
      : "\n\nLANGUAGE OVERRIDE: The user is writing in English. ALL string fields (empathyLine, clarificationQuestion, summary) MUST be in English only. Do NOT use any Filipino, Tagalog, or Cebuano words.";
  const systemPrompt = `You are GaLink's problem interpretation engine for Filipino users.
Analyze the user's message and return structured JSON.

Always respond in valid JSON with exactly these fields:
{
  "needsService": true | false,
  "isGeneric": true | false,
  "clarificationQuestion": "string or empty",
  "empathyLine": "string or empty",
  "problemType": "string",
  "requiredSkills": ["skill1", "skill2"],
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH",
  "locationRelevant": true | false,
  "summary": "one-line summary"
}

LANGUAGE MATCHING RULE (applies to ALL string fields — empathyLine, clarificationQuestion, summary):
Detect the language the user is writing in and respond accordingly:
- If the user writes mostly in English → respond in English
- If the user writes mostly in Filipino/Tagalog → respond in Taglish (natural Filipino-English mix)
- If the user writes mostly in Cebuano/Bisaya → respond in Cebuano/Bisaya
Always match the user's current message language. If they switch languages between messages, switch with them.

Rules:

1. "needsService" = FALSE when the user says the problem is resolved, they no longer need help, or they're just wrapping up the conversation. Phrases: "ok na", "ayos na", "nayos ko na", "never mind", "forget it", "di na kailangan", "thanks anyway", "solved na", "maayos na". For these, write a warm, genuine empathyLine that celebrates their resolution and leaves the door open. Leave all other fields as defaults.

2. "isGeneric" = TRUE in TWO situations:

   A) The message is completely vague with no category at all: "help", "tulong", "may problema", "kailangan ko ng tao", "may issue", "need someone", single-word or two-word messages with no context.

   B) The message names a BROAD CATEGORY but NOT the specific problem. You cannot pick a skill or trade without asking more. Examples of broad-category-but-still-generic messages:
      - "may problema sa bahay" / "house problem" / "may sira sa bahay ko" → house is huge: could be electrical, plumbing, roofing, carpentry, painting, pest control, etc.
      - "may problema sa kuryente" → still broad: is it a tripped breaker, broken outlet, no power in one room, flickering lights, short circuit?
      - "may tubig" / "water problem" → is it a leaking pipe, low pressure, no hot water, flooding, clogged drain?
      - "may sira sa sasakyan" / "car problem" → engine, brakes, aircon, tires, electrical?
      - "may problema sa trabaho" / "work problem" / "office problem" → IT, HR, legal, design?
      - "may sira" → broken what exactly?
      - "need repair" → repair of what?
      - "something is broken at home" → broken what?
      - Any message where you could name 3+ completely different trades that might apply.

   For ALL isGeneric=true cases, write a warm clarificationQuestion that:
      - First, genuinely acknowledges their situation with warmth (don't skip this!)
      - Then asks ONE specific, targeted follow-up tailored to the category they mentioned (if any)
      - Is conversational and encouraging, never clinical or robotic
      - Examples by category:
        * House/home: "Oh no, house problems can really disrupt your day-to-day! To make sure I find exactly the right person for you, could you tell me what's specifically happening? Is it something like a leaking pipe, an electrical issue, a broken door or window, pest problems, or something else? Just describe what you're seeing and I'll take it from there!"
        * Electrical/kuryente: "Electrical problems can definitely be worrying, especially when you're not sure what's causing it. To find you the right electrician, could you describe what's happening? For example, is it tripped breakers, a broken outlet, flickering lights, or no power in a specific area?"
        * Water/tubig/plumbing: "Water issues at home can be such a headache! To point you to the right plumber, can you tell me more? Is it a leaking pipe, clogged drain, low water pressure, a dripping faucet, or something else?"
        * Car/sasakyan: "Car troubles are so stressful, especially when you rely on it every day. To find the right mechanic, can you describe what's wrong? Is it the engine, brakes, aircon, tires, or something else?"
        * Generic/unknown: "I really want to help you find the right person! Could you tell me a little more about what's going on? Just describe what you're seeing or what's broken, and I'll figure out who can fix it for you."
      Leave requiredSkills empty for all isGeneric=true cases.

3. For all other messages where the specific problem IS clear: needsService=true, isGeneric=false. Write a rich, genuine empathyLine (2 sentences max) that:
   - First, specifically names or mirrors what they're going through (never say just "that sounds tough" — be specific!)
   - Second, reassures them that help is on the way and they're in the right place
   - Uses warm, conversational Filipino-aware language (light Taglish is ok if natural)
   - Examples:
     * "A broken roof during rainy season is incredibly stressful — you shouldn't have to worry about water getting inside your home. You're in the right place!"
     * "Electrical issues can feel really scary, especially when you're not sure what's causing it. Don't worry, we've got skilled electricians who can handle this safely."
     * "Running a business and dealing with a POS breakdown at the same time is so much to handle. Let's get you the right tech right away!"

Examples:
- "may problema sa bahay" → {"needsService":true,"isGeneric":true,"clarificationQuestion":"Oh no, house problems can really throw off your whole day! To make sure I find exactly the right person for you, can you tell me what's specifically happening? Is it something like a leaking pipe, an electrical issue, a broken door or ceiling, pest problems, or something else? Just describe what you're seeing and I'll take it from there!","empathyLine":"","problemType":"","requiredSkills":[],"urgencyLevel":"LOW","locationRelevant":false,"summary":""}
- "may sira sa kuryente" → {"needsService":true,"isGeneric":true,"clarificationQuestion":"Electrical issues can be really worrying, I completely understand! To connect you with the right electrician, could you tell me a little more about what's happening? For example, is it a tripped breaker, a dead outlet, flickering lights, or no power in a specific room?","empathyLine":"","problemType":"","requiredSkills":[],"urgencyLevel":"LOW","locationRelevant":false,"summary":""}
- "help" → {"needsService":true,"isGeneric":true,"clarificationQuestion":"Of course, I'm right here with you! To make sure I find exactly the right person, could you tell me a little more about what's going on? Is it something at home — like a repair or plumbing issue — or more of a professional service like tech or design? Just tell me in your own words, no worries!","empathyLine":"","problemType":"","requiredSkills":[],"urgencyLevel":"LOW","locationRelevant":false,"summary":""}
- "ayos na, salamat" → {"needsService":false,"isGeneric":false,"clarificationQuestion":"","empathyLine":"That's wonderful to hear! You took care of it — that's great. We're always here whenever you need a hand with anything.","problemType":"","requiredSkills":[],"urgencyLevel":"LOW","locationRelevant":false,"summary":""}
- "My sink has been leaking nonstop since yesterday" → {"needsService":true,"isGeneric":false,"clarificationQuestion":"","empathyLine":"A non-stop leaking sink is so stressful — the constant dripping and worry about water damage is a lot to deal with overnight. Let's get this sorted for you right away!","problemType":"Plumbing repair","requiredSkills":["Plumbing","Pipe Fitting","Leak Detection"],"urgencyLevel":"HIGH","locationRelevant":true,"summary":"Leaking sink repair"}${languageOverride}`;

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.5,
    max_tokens: 600,
  });

  const content = completion.choices[0]?.message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch {
    return {
      needsService: true,
      isGeneric: false,
      clarificationQuestion: "",
      empathyLine: "",
      problemType: "General",
      requiredSkills: [],
      urgencyLevel: "MEDIUM",
      locationRelevant: false,
      summary: content,
    };
  }
}

/**
 * Chat with the AI assistant (general conversation / guidance).
 */
export async function chatWithAI(messages, dialect = null) {
  const languageNote =
    dialect === "cebuano"
      ? "\n\nLANGUAGE OVERRIDE: The user's current message is in Cebuano/Bisaya. Respond ENTIRELY in natural Cebuano/Bisaya. Use warm Bisaya expressions like 'Bay', 'Maayo kaayo!', 'Ayaw kabalaka', 'Nindot!'. No English or Tagalog."
      : dialect === "taglish"
      ? "\n\nLANGUAGE OVERRIDE: The user's current message is in Filipino/Tagalog. Respond in natural Taglish (Filipino-English mix). Keep it warm and conversational. No pure English."
      : "\n\nLANGUAGE OVERRIDE: The user's current message is in English. Respond ENTIRELY in English. Do NOT use any Filipino, Tagalog, or Cebuano words whatsoever.";
  const systemPrompt = `You are GaLink AI, a warm and genuinely caring AI assistant for Filipino users looking for skilled workers and freelancers.

Your personality:
- You feel like a trusted friend or ate/kuya who truly listens and understands
- You ALWAYS acknowledge and validate the user's feelings or situation before anything else — never jump straight to solutions
- You reflect back what you heard with empathy (e.g. "That must be really stressful..." or "I completely understand how frustrating that is...")
- You speak in a warm, conversational tone — natural, not corporate or robotic
- You can use light Taglish when it feels natural (e.g. "No worries ha!", "Kaya mo yan!") but keep it professional
- You guide users gently toward describing their problem so you can find the right person for them
- When someone seems stressed or frustrated, slow down and be more gentle
- When someone is excited (e.g. starting a business), match their energy with encouragement

IMPORTANT RULES:
- NEVER use markdown. No asterisks, bold, bullet dashes, headers, or backticks. Plain conversational text only.
- Never be dismissive. Every problem matters, big or small.
- Keep responses concise — 2 to 4 sentences max unless the user needs more support.
- Always end with either a gentle question to learn more, or a reassurance that help is on the way.
- LANGUAGE MATCHING: Respond in the language indicated by the LANGUAGE note below. If English, respond in English. If Tagalog, respond in Taglish (Filipino-English mix). If Cebuano, respond in Cebuano/Bisaya. Always match the user's current message.${languageNote}`;

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    temperature: 0.75,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";
}

/**
 * Extract skills and experience from resume text.
 */
export async function extractResumeData(resumeText) {
  const systemPrompt = `You are a resume parsing engine. Extract structured data from resumes.
Always respond in valid JSON with exactly these fields:
{
  "skills": ["skill1", "skill2", ...],
  "experienceYears": <number>,
  "summary": "brief professional summary"
}`;

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Parse this resume:\n\n${resumeText}` },
    ],
    temperature: 0.2,
    max_tokens: 500,
  });

  const content = completion.choices[0]?.message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch {
    return { skills: [], experienceYears: 0, summary: "" };
  }
}

/**
 * Analyze reel content description and extract relevant tags / skills.
 */
export async function analyzeReelContent(description, transcription = "") {
  const systemPrompt = `You are a content analysis engine for freelancer work reels.
Given a reel's description and optional transcription, extract relevant tags and skills.
Always respond in valid JSON:
{
  "tags": ["tag1", "tag2"],
  "detectedSkills": ["skill1", "skill2"]
}`;

  const userContent = `Description: ${description}\n${transcription ? `Transcription: ${transcription}` : ""}`;

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  const content = completion.choices[0]?.message?.content || "{}";
  try {
    return JSON.parse(content);
  } catch {
    return { tags: [], detectedSkills: [] };
  }
}

/**
 * Generate seminar/workshop recommendations for a user based on their skills.
 * For unverified/no-skills users, returns tech, handcraft, and random Metro Manila seminars.
 */
export async function recommendSeminars(userSkills = [], badgeLevel = 0) {
  const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const hasSkills = userSkills.length > 0;

  const context = hasSkills
    ? `The user is a Filipino freelancer/worker with these skills: ${userSkills.slice(0, 6).join(", ")}. Badge level: ${badgeLevel}.`
    : `The user is a new/unverified user in Metro Manila with no profile skills yet (badge level: ${badgeLevel}).`;

  // Real Philippine Facebook pages with working events tabs
  const REAL_FB_PAGES = {
    Tech: [
      { organizer: "DICT Philippines", link: "https://www.facebook.com/dict.gov.ph/events" },
      { organizer: "Google Developer Groups Philippines", link: "https://www.facebook.com/gdgph/events" },
      { organizer: "AWS User Group Philippines", link: "https://www.facebook.com/AWSUGPhilippines/events" },
      { organizer: "Philippine Software Industry Association", link: "https://www.facebook.com/psiaorgph/events" },
      { organizer: "TechTalks.ph Community", link: "https://www.facebook.com/techtalksPH/events" },
    ],
    Trades: [
      { organizer: "TESDA Philippines", link: "https://www.facebook.com/TESDA.Official/events" },
      { organizer: "DOLE Philippines", link: "https://www.facebook.com/doleph/events" },
      { organizer: "TESDA Metro Manila", link: "https://www.facebook.com/TESDAMetroManila/events" },
      { organizer: "Philippine Institute of Electrical Engineers", link: "https://www.facebook.com/piee.org.ph/events" },
    ],
    Business: [
      { organizer: "DTI Philippines", link: "https://www.facebook.com/DTIPhilippines/events" },
      { organizer: "Philippine Chamber of Commerce and Industry", link: "https://www.facebook.com/philippinechamber/events" },
      { organizer: "Go Negosyo", link: "https://www.facebook.com/GoNegosyo/events" },
      { organizer: "Philippine Franchise Association", link: "https://www.facebook.com/PhilFranchise/events" },
    ],
    Creative: [
      { organizer: "Creative Economy Council of the Philippines", link: "https://www.facebook.com/creativeph/events" },
      { organizer: "Philippine Graphic Arts Guild", link: "https://www.facebook.com/pgag.ph/events" },
      { organizer: "Film Academy of the Philippines", link: "https://www.facebook.com/FilmAcademyPH/events" },
    ],
    "Soft Skills": [
      { organizer: "PMAP – People Management Association of the Philippines", link: "https://www.facebook.com/pmaphrm/events" },
      { organizer: "Toastmasters Philippines", link: "https://www.facebook.com/ToastmastersPhilippines/events" },
      { organizer: "Dale Carnegie Philippines", link: "https://www.facebook.com/DaleCarnegiePhilippines/events" },
    ],
  };

  const pagesJson = JSON.stringify(REAL_FB_PAGES);

  const systemPrompt = `You are a seminar and workshop recommender for Filipino workers and freelancers in Metro Manila.
Today's date: ${today}.

${context}

You have access to these REAL Philippine Facebook event pages, organized by category:
${pagesJson}

Generate 5 realistic, relevant seminar/workshop recommendations for this user.
${!hasSkills ? "Include: 2 Tech, 2 Trades, 1 Business." : "Tailor 3 seminars to their skills, add 2 complementary growth seminars."}

Rules:
- For the "link" field, you MUST use one of the exact URLs from the list above. Match the category.
- For the "organizer" field, use the matching organizer name from the list.
- All other fields (title, date, description, etc.) can be AI-generated to fit the context.
- Dates must be in ${new Date().getFullYear()} or later.

Respond ONLY with a valid JSON array of exactly 5 objects:
[
  {
    "title": "Full seminar/workshop title",
    "organizer": "Organizer name from the list",
    "category": "Tech | Trades | Business | Creative | Soft Skills",
    "date": "e.g. March 15, 2026",
    "location": "Venue name, City (or Online)",
    "isOnline": true | false,
    "fee": "Free | ₱XXX",
    "description": "2–3 sentences on what attendees will learn.",
    "skills": ["skill1", "skill2"],
    "link": "exact URL from the list above"
  }
]`;

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate seminar recommendations now." },
    ],
    temperature: 0.8,
    max_tokens: 1200,
  });

  const raw = completion.choices[0]?.message?.content || "[]";
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}
