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
  "estimatedBudget": 0,
  "summary": "one-line summary"
}

LANGUAGE MATCHING RULE (applies to ALL string fields — empathyLine, clarificationQuestion, summary):
Detect the language the user is writing in and respond accordingly:
- If the user writes mostly in English → respond in English
- If the user writes mostly in Filipino/Tagalog → respond in Taglish (natural Filipino-English mix)
- If the user writes mostly in Cebuano/Bisaya → respond in Cebuano/Bisaya
Always match the user's current message language. If they switch languages between messages, switch with them.

BUDGET EXTRACTION:
- If the user mentions a budget amount (e.g., "budget ko ₱15,000", "around 5000", "₱2k budget"), extract the number into estimatedBudget as a plain number (e.g., 15000, 5000, 2000).
- If no budget is mentioned, set estimatedBudget to 0.
- Common currency shortcuts: "k" = 1000, "₱" prefix is PHP.

URGENCY RULES:
- HIGH: words like "emergency", "urgent", "ASAP", "right now", "ngayon na", "agad", "kailangan na", "dagdag na"
- MEDIUM: words like "this week", "soon", "sa lalong madaling panahon"
- LOW: no urgency indicators, general inquiries

Rules:

1. "needsService" = FALSE when the user says the problem is resolved, they no longer need help, or they're just wrapping up the conversation. Phrases: "ok na", "ayos na", "nayos ko na", "never mind", "forget it", "di na kailangan", "thanks anyway", "solved na", "maayos na". For these, write a warm, genuine empathyLine that celebrates their resolution and leaves the door open. Leave all other fields as defaults.

2. "isGeneric" = TRUE ONLY when the message is so vague you literally CANNOT determine a single trade/profession. Examples:
   - "help", "tulong", "may problema", "kailangan ko ng tao", "need someone" — no clue what kind of service
   - "may sira" / "something is broken" — broken what? No way to pick a trade
   - "may problema sa bahay" / "house problem" — could be anything
   - "may problema sa trabaho" / "work problem" — could be anything

   "isGeneric" = FALSE (proceed with matching) when the user mentions ANY recognizable trade, service, or specific task. Even if details are missing, you CAN identify the trade. Examples that are NOT generic:
   - "need a painter" / "paint my walls" / "painting" → Painting (NOT generic!)
   - "may problema sa kuryente" / "electrical issue" → Electrical
   - "plumbing problem" / "leaking pipe" / "clogged drain" → Plumbing
   - "need a carpenter" / "fix my door" → Carpentry
   - "aircon not working" / "AC repair" → Aircon Repair
   - "car won't start" / "brake problem" → Automotive Mechanic
   - "build a website" / "web developer" → Web Development
   - "need a tutor" / "math tutoring" → Tutoring
   RULE: If you can name ONE specific trade, it is NOT generic. Set isGeneric=false and put that trade in requiredSkills.

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
- "may problema sa bahay" → {"needsService":true,"isGeneric":true,"clarificationQuestion":"Oh no, house problems can really throw off your whole day! To make sure I find exactly the right person for you, can you tell me what's specifically happening? Is it something like a leaking pipe, an electrical issue, a broken door or ceiling, pest problems, or something else? Just describe what you're seeing and I'll take it from there!","empathyLine":"","problemType":"","requiredSkills":[],"urgencyLevel":"LOW","locationRelevant":false,"estimatedBudget":0,"summary":""}
- "may sira sa kuryente" → {"needsService":true,"isGeneric":true,"clarificationQuestion":"Electrical issues can be really worrying, I completely understand! To connect you with the right electrician, could you tell me a little more about what's happening? For example, is it a tripped breaker, a dead outlet, flickering lights, or no power in a specific room?","empathyLine":"","problemType":"","requiredSkills":[],"urgencyLevel":"LOW","locationRelevant":false,"estimatedBudget":0,"summary":""}
- "help" → {"needsService":true,"isGeneric":true,"clarificationQuestion":"Of course, I'm right here with you! To make sure I find exactly the right person, could you tell me a little more about what's going on? Is it something at home — like a repair or plumbing issue — or more of a professional service like tech or design? Just tell me in your own words, no worries!","empathyLine":"","problemType":"","requiredSkills":[],"urgencyLevel":"LOW","locationRelevant":false,"estimatedBudget":0,"summary":""}
- "ayos na, salamat" → {"needsService":false,"isGeneric":false,"clarificationQuestion":"","empathyLine":"That's wonderful to hear! You took care of it — that's great. We're always here whenever you need a hand with anything.","problemType":"","requiredSkills":[],"urgencyLevel":"LOW","locationRelevant":false,"estimatedBudget":0,"summary":""}
SKILL NORMALIZATION RULE:
For "requiredSkills", ONLY use broad trade/profession labels — never specific sub-tasks or task descriptions. Match to the TRADE, not the task. Keep to 1–2 labels max.
Examples of correct normalization:
- Fix broken door, window, cabinet, furniture → ["Carpentry"]
- Leaking pipe, clogged drain, no hot water, faucet dripping → ["Plumbing"]
- Broken outlet, rewiring, no power in room, flickering lights → ["Electrical"]
- Repaint walls, exterior/interior painting → ["Painting"]
- Aircon not cooling, AC cleaning, install aircon → ["Aircon Repair"]
- Car engine, brake problem, flat tire, transmission → ["Automotive Mechanic"]
- Build a website, fix web app, e-commerce → ["Web Development"]
- Logo, flyer, poster, social media graphics → ["Graphic Design"]
- Math/English tutoring, academic coaching → ["Tutoring"]
NEVER output sub-tasks as skills. Wrong: ["Door Repair","Pipe Fitting","Leak Detection"]. Right: ["Carpentry"], ["Plumbing"].

- "My sink has been leaking nonstop since yesterday" → {"needsService":true,"isGeneric":false,"clarificationQuestion":"","empathyLine":"A non-stop leaking sink is so stressful — the constant dripping and worry about water damage is a lot to deal with overnight. Let's get this sorted for you right away!","problemType":"Plumbing repair","requiredSkills":["Plumbing"],"urgencyLevel":"HIGH","locationRelevant":true,"estimatedBudget":0,"summary":"Leaking sink repair"}
- "Need a plumber urgently, budget is around ₱5k" → {"needsService":true,"isGeneric":false,"clarificationQuestion":"","empathyLine":"Plumbing emergencies are never fun, especially when you need someone right away. Let me find you a reliable plumber ASAP!","problemType":"Plumbing repair","requiredSkills":["Plumbing"],"urgencyLevel":"HIGH","locationRelevant":true,"estimatedBudget":5000,"summary":"Urgent plumbing repair"}${languageOverride}`;

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
      estimatedBudget: 0,
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

  // Real online workshop and seminar platforms
  const REAL_WORKSHOP_SITES = {
    Tech: [
      { organizer: "DICT e-Learning Portal", link: "https://elearning.dict.gov.ph" },
      { organizer: "TESDA Online Program (TOP)", link: "https://top.tesda.gov.ph" },
      { organizer: "Google Digital Garage", link: "https://learndigital.withgoogle.com/digitalgarage" },
      { organizer: "Coursera", link: "https://www.coursera.org/search?query=technology" },
      { organizer: "Udemy", link: "https://www.udemy.com/courses/development/" },
    ],
    Trades: [
      { organizer: "TESDA Online Program (TOP)", link: "https://top.tesda.gov.ph" },
      { organizer: "DOLE BWSC Training Portal", link: "https://bwsc.dole.gov.ph" },
      { organizer: "Coursera", link: "https://www.coursera.org/search?query=trades" },
      { organizer: "Udemy", link: "https://www.udemy.com/courses/teaching-academics/" },
    ],
    Business: [
      { organizer: "DTI SMED Training", link: "https://smed.dti.gov.ph" },
      { organizer: "Go Negosyo Events", link: "https://gonegosyo.net/events" },
      { organizer: "Coursera Business", link: "https://www.coursera.org/search?query=business" },
      { organizer: "Udemy Business", link: "https://www.udemy.com/courses/business/" },
    ],
    Creative: [
      { organizer: "Canva Design School", link: "https://www.canva.com/learn/" },
      { organizer: "Adobe Education Exchange", link: "https://edex.adobe.com" },
      { organizer: "Coursera Arts & Design", link: "https://www.coursera.org/search?query=design" },
      { organizer: "Udemy Design", link: "https://www.udemy.com/courses/design/" },
    ],
    "Soft Skills": [
      { organizer: "Dale Carnegie Training", link: "https://www.dalecarnegie.com/en/courses" },
      { organizer: "Toastmasters International", link: "https://www.toastmasters.org/find-a-club" },
      { organizer: "LinkedIn Learning", link: "https://www.linkedin.com/learning/" },
      { organizer: "Coursera Personal Development", link: "https://www.coursera.org/search?query=soft+skills" },
    ],
  };

  const sitesJson = JSON.stringify(REAL_WORKSHOP_SITES);

  const systemPrompt = `You are a seminar and workshop recommender for Filipino workers and freelancers in Metro Manila.
Today's date: ${today}.

${context}

You have access to these REAL online workshop and seminar platforms, organized by category:
${sitesJson}

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

/**
 * Batch-estimate distances between a user's location and a list of freelancer locations
 * using GPT knowledge of Philippine geography. Returns a Map of index → km.
 */
export async function estimateDistancesBatch(userLocation, freelancerLocations) {
  if (!userLocation || freelancerLocations.length === 0) return new Map();
  const list = freelancerLocations.map((loc, i) => `${i}: ${loc}`).join("\n");
  const systemPrompt = `You are a Philippine geography expert. Given a user's location and a numbered list of freelancer locations, estimate the road/travel distance in km between the user and each freelancer.

Return ONLY a valid JSON object where keys are the index numbers (as strings) and values are the estimated distance in km (integer).
Example: {"0": 5, "1": 120, "2": 45}

Be as accurate as possible using your knowledge of Philippine cities, municipalities, and provinces. If two locations are in the same municipality, return a small number like 1-5. Same province but different city: typically 10-80 km. Different provinces: estimate realistically.`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User location: ${userLocation}\n\nFreelancer locations:\n${list}` },
      ],
      temperature: 0,
      max_tokens: 500,
    });
    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const result = new Map();
    for (const [key, val] of Object.entries(parsed)) {
      result.set(parseInt(key), typeof val === "number" ? Math.round(val) : parseInt(val) || undefined);
    }
    return result;
  } catch {
    return new Map();
  }
}
