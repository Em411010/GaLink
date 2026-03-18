import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatbotAPI } from "../services/api";

// Detect if a message is predominantly Filipino/Tagalog
const TAGALOG_WORDS = new Set([
  "po","opo","ho","mga","ang","ng","sa","ay","ko","mo","ka","na","naman","lang","din",
  "rin","pala","talaga","ba","daw","raw","muna","pa","siya","kami","tayo","kayo","sila",
  "nila","namin","natin","ninyo","at","pero","kasi","may","wala","hindi","oo","yung",
  "yun","ito","iyan","dito","doon","paano","bakit","ano","salamat","kumusta","mayroon",
  "kuya","ate","manong","nanay","tatay","penge","pwede","gusto","kailangan","trabaho",
  "bahay","saan","kailan","sino","ganito","ganyan","hayop","tao","bata","sige","huwag",
  "paki","nandito","nandoon","talaga","sobra","grabe","ayos","ayaw","okei","ok","di",
]);

// Detect if a message is predominantly Cebuano/Bisaya
const CEBUANO_WORDS = new Set([
  // Core grammar / particles
  "ug","naa","naay","dili","bitaw","mao","maoy","ba","man","ra","lang","na",
  "unta","kaha","sad","pod","pud","gani","diay","baya","hinoon",
  // Question words
  "unsa","asa","ngano","kinsa","kanus-a","kanusa","pila","hain",
  // Pronouns
  "ako","ikaw","siya","kami","kita","kamo","sila",
  "nako","nimo","niya","namo","nato","ninyo","nila",
  "akoa","imo","iya","among","ato","inyo","ilang",
  "kanako","kanimo","kaniya","kanamo","kanato","kaninyo","kanila",
  // Verbs / common words
  "adto","adtoa","dali","kari","mari","ari","ngadto",
  "aduna","wala","walay","naay","naa","anaa","dinhi","didto","nganhi",
  "gusto","ganahan","kinahanglan","nagkinahanglan","pwede","mahimo",
  "maayo","daotan","nindot","gwapa","gwapo","lisod","sayon","daghan",
  "gamay","dako","gamay","taas","mubo","bata","tigulang",
  "kaon","inom","tulog","lakaw","sige","balik","sulod","gawas",
  // Greetings / expressions
  "kumusta","musta","salamat","pasaylo","palihug","pakiusap",
  "ambot","puhon","basin","bisan","sana","unta",
  "grabe","grabi","graby","sakit","hinaot","maayo","nindot",
  "ayaw","ayaw-a","ayawg",
  // People / family
  "bay","bai","pare","mars","bes","idol",
  "manoy","manang","kuya","ate","mama","papa","nanay","tatay",
  "lolo","lola","tiyo","tiya","igso","igsuon",
  // Places / home
  "balay","eskwelahan","ospital","merkado","simbahan",
  "tiil","kamot","ulo","tiyan","lawas",
  // Numbers (give hints)
  "usa","duha","tulo","upat","lima","unom","pito","walo","siyam","napulo",
  // Intensifiers / connectors
  "gayod","gyud","jud","kaayo","labi","labing","kay","tungod","busa",
  "karon","ganina","ugma","gahapon","karong","gabii","buntag","hapon",
  // Problem/work related
  "trabaho","trabahoan","problema","serbisyo","bayad","presyo","kuarta",
  "tabang","tabangan","ayuda","tulong","pag-ayo","pag-abli",
  "nabuak","nabali","nasira","nauba","nahulog","nasunog",
]);

// Returns 'taglish', 'cebuano', or null
function detectDialect(text) {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  const tagHits = words.filter((w) => TAGALOG_WORDS.has(w)).length;
  const cebHits = words.filter((w) => CEBUANO_WORDS.has(w)).length;
  if (cebHits >= 2) return "cebuano";
  if (tagHits >= 2) return "taglish";
  return null;
}

// Strip markdown bold/italic asterisks so AI replies render as clean plain text
function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")  // **bold**
    .replace(/\*(.+?)\*/g, "$1")       // *italic*
    .replace(/#+\s/g, "")              // ### headings
    .replace(/`(.+?)`/g, "$1");        // `code`
}

const WELCOME_MSG = {
  role: "assistant",
  content:
    "Hi! I'm GaLink AI, and I'm really glad you're here. Whatever you're dealing with right now, you don't have to figure it out alone — just tell me what's going on and I'll find exactly the right person to help you.",
};

const useChatbotStore = create(
 persist(
 (set, get) => ({
  messages: [WELCOME_MSG],
  interpretation: null,
  pendingInterpretation: null,   // saved while waiting for user confirmation
  pendingRecommendations: [],    // saved while waiting for user confirmation
  recommendations: [],
  isLoading: false,
  phase: "idle",                 // 'idle' | 'confirming' | 'clarifying'
  clarifyingContext: "",         // original vague message, combined with follow-up for re-interpretation
  clarifyRounds: 0,              // how many times we've asked for clarification (capped at 1)
  forceTaglish: false,           // legacy — replaced by detectedDialect
  detectedDialect: null,         // null | 'taglish' | 'cebuano' — set after 2nd user message
  userMessageCount: 0,           // tracks how many messages the user has sent

  sendMessage: async (userMessage, meta = {}) => {
    const { phase, pendingInterpretation, pendingRecommendations, clarifyingContext } = get();
    const currentMessages = get().messages;
    const newUserMsg = { role: "user", content: userMessage, ...meta };
    const newMessages = [...currentMessages, newUserMsg];

    // Track user message count; detect language on every message until dialect is identified
    const newCount = get().userMessageCount + 1;
    // Re-detect dialect on every message so responses match the user's current language
    const newDialect = detectDialect(userMessage); // 'taglish' | 'cebuano' | null (English)
    set({ messages: newMessages, isLoading: true, userMessageCount: newCount, detectedDialect: newDialect });

    // ── Phase 2: user just responded to the confirmation question ──
    if (phase === "confirming") {
      const skillList = pendingInterpretation?.requiredSkills?.join(", ") || "the right skills";
      const count = pendingRecommendations.length;

      const replyText =
        newDialect === "cebuano"
          ? count > 0
            ? `Nindot! Nakit-an nako ang ${count} skilled worker${count !== 1 ? "s" : ""} nga makatabang sa imong ${pendingInterpretation?.summary || "problema"}. Tan-awa sa tuo ug pwede kang mag-message diretso, bay!`
            : `Gusto ko gyud nga makahatag ug husto nga tawo para kanimo, pero wala pa koy nakita nga exact match para sa ${skillList} karon. Ayaw surender — sulayi nga i-describe pag-usab ang imong problema, o balik ra puhon kay naa pay bag-ong workers nga mosali!`
          : newDialect === "taglish"
          ? count > 0
            ? `Ayos! Nahanap ko ang ${count} skilled worker${count !== 1 ? "s" : ""} na makakatulong sa yo sa ${pendingInterpretation?.summary || "ito"}. Sana mahanap mo ang tamang tao — tingnan mo sa kanan at pwede kang mag-message directly!`
            : `Gusto ko talagang mahanap ang tamang tao para sa yo, pero wala akong nakitang exact match para sa ${skillList} ngayon. Huwag mag-give up — subukan mong i-describe ulit ang problema mo, o bumalik ka later dahil may mga bagong workers na nagsasali araw-araw!`
          : count > 0
            ? `Wonderful! I found ${count} skilled worker${count !== 1 ? "s" : ""} who can genuinely help you with ${pendingInterpretation?.summary || "this"}. I really hope one of them makes things easier for you — check the list on the right and feel free to message them directly!`
            : `I really want to help you find the right person, but I wasn't able to find an exact match for ${skillList} right now. Don't give up — try describing your problem a little differently and I'll search again, or check back soon as new workers join every day!`;

      set({
        messages: [...newMessages, { role: "assistant", content: replyText }],
        interpretation: pendingInterpretation,
        recommendations: pendingRecommendations,
        pendingInterpretation: null,
        pendingRecommendations: [],
        phase: "idle",
        clarifyRounds: 0,
        isLoading: false,
      });
      return;
    }

    // ── Phase 'clarifying': user answered the follow-up — combine with original vague message for richer context ──
    if (phase === "clarifying") {
      // Merge original vague message + clarification answer so AI has full picture
      const combinedMessage = clarifyingContext
        ? `${clarifyingContext}. More specifically: ${userMessage}`
        : userMessage;
      set({ phase: "idle", clarifyingContext: "" });

      // Re-run interpret with the enriched combined message
      try {
        const res = await chatbotAPI.interpret(combinedMessage, newDialect);
        const { interpretation, recommendations } = res.data;

        if (!interpretation.needsService) {
          const goodbye = interpretation.empathyLine
            ? interpretation.empathyLine.replace(/[*_#`]/g, "").trim()
            : "Alright, no worries! Feel free to come back anytime.";
          set({ messages: [...newMessages, { role: "assistant", content: goodbye }], phase: "idle", isLoading: false });
          return;
        }

        // If still generic after clarification, force proceed — never ask more than once
        if (interpretation.isGeneric) {
          // Override: treat it as a valid request with whatever skills we can infer
          interpretation.isGeneric = false;
          if (!interpretation.requiredSkills?.length) {
            interpretation.requiredSkills = ["General Repair"];
          }
        }

        const skillList = interpretation.requiredSkills?.join(", ") || "general skills";
        const empathy = interpretation.empathyLine ? interpretation.empathyLine.replace(/[*_#`]/g, "").trim() : "";
        const confirmText =
          newDialect === "cebuano"
            ? (empathy ? empathy + "\n\n" : "") +
              `Murag kinahanglan ka ug tabang sa ${interpretation.summary}, ug gusto nako nga masiguro nga husto ang akong pilion para kanimo. ` +
              `Sa akong hunahuna, adunay ${skillList} ang angay nga tawo para niini.\n\n` +
              `Husto ba? Sulti lang ug "oo" ug ipakita nako ang mga matches, o dugangi ug details kung adunay kulang, bay!`
            : newDialect === "taglish"
            ? (empathy ? empathy + "\n\n" : "") +
              `Parang kailangan mo ng tulong sa ${interpretation.summary}, at gusto kong masiguro na tama ang choice ko para sa yo. ` +
              `Sa tingin ko, may ${skillList} ang tamang tao para dito.\n\n` +
              `Tama ba? Sabihin mo lang "oo" at ipapakita ko na ang mga matches, o dagdag ka pa ng details kung may kulang!`
            : (empathy ? empathy + "\n\n" : "") +
              `It sounds like what you really need is help with ${interpretation.summary}, and I want to make sure I get this right for you. ` +
              `I'm thinking someone with ${skillList} would be the perfect fit.\n\n` +
              `Does that sound about right? Just say "yes" and I'll show you the matches, or share more details if there's anything I missed!`;
        set({
          messages: [...newMessages, { role: "assistant", content: confirmText }],
          pendingInterpretation: interpretation,
          pendingRecommendations: recommendations,
          phase: "confirming",
          isLoading: false,
        });
      } catch {
        set({
          messages: [...newMessages, { role: "assistant", content: newDialect === "cebuano" ? "Sorry, medyo naay problema. Pwede ba nimong i-ulit ang imong problema?" : newDialect === "taglish" ? "Sorry, medyo nagka-problema. Pwede mo bang ulitin ang iyong problema?" : "Sorry, I had a little trouble with that. Could you try describing your problem again?" }],
          phase: "idle", isLoading: false,
        });
      }
      return;
    }

    // ── Phase 1 (idle / post-clarifying): interpret the user's request ──
    try {
      const res = await chatbotAPI.interpret(userMessage, newDialect);
      const { interpretation, recommendations } = res.data;

      // ── Case A: user no longer needs a service ──
      if (!interpretation.needsService) {
        const goodbye = interpretation.empathyLine
          ? interpretation.empathyLine.replace(/[*_#`]/g, "").trim()
          : "Alright, no worries! Feel free to come back anytime you need help.";
        set({
          messages: [...newMessages, { role: "assistant", content: goodbye }],
          phase: "idle",
          isLoading: false,
        });
        return;
      }

      // ── Case B: problem is too generic — ask a clarifying question (only once) ──
      if (interpretation.isGeneric && get().clarifyRounds === 0) {
        const q = interpretation.clarificationQuestion
          ? interpretation.clarificationQuestion.replace(/[*_#`]/g, "").trim()
          : "Could you describe your problem in a bit more detail so I can find the right person for you?";
        set({
          messages: [...newMessages, { role: "assistant", content: q }],
          phase: "clarifying",
          clarifyingContext: userMessage,
          clarifyRounds: 1,
          isLoading: false,
        });
        return;
      }
      // If generic but already asked once, force-proceed
      if (interpretation.isGeneric) {
        interpretation.isGeneric = false;
        if (!interpretation.requiredSkills?.length) {
          interpretation.requiredSkills = ["General Repair"];
        }
      }

      // ── Case C: clear problem — empathise then soft-confirm ──
      const skillList = interpretation.requiredSkills?.join(", ") || "general skills";

      const empathy = interpretation.empathyLine
        ? interpretation.empathyLine.replace(/[*_#`]/g, "").trim()
        : "";

      const confirmText =
        newDialect === "cebuano"
          ? (empathy ? empathy + "\n\n" : "") +
            `Murag kinahanglan ka ug tabang sa ${interpretation.summary}, ug gusto nako nga masiguro nga husto ang akong pilion para kanimo. ` +
            `Sa akong hunahuna, adunay ${skillList} ang angay nga tawo para niini.\n\n` +
            `Husto ba? Sulti lang ug "oo" ug ipakita nako ang mga matches, o dugangi ug details kung adunay kulang, bay!`
          : newDialect === "taglish"
          ? (empathy ? empathy + "\n\n" : "") +
            `Parang kailangan mo ng tulong sa ${interpretation.summary}, at gusto kong masiguro na tama ang choice ko para sa yo. ` +
            `Sa tingin ko, may ${skillList} ang tamang tao para dito.\n\n` +
            `Tama ba? Sabihin mo lang "oo" at ipapakita ko na ang mga matches, o dagdag ka pa ng details kung may kulang!`
          : (empathy ? empathy + "\n\n" : "") +
            `It sounds like what you really need is help with ${interpretation.summary}, and I want to make sure I get this right for you. ` +
            `I'm thinking someone with ${skillList} would be the perfect fit.\n\n` +
            `Does that sound about right? Just say "yes" and I'll show you the matches, or share more details if there's anything I missed!`;

      set({
        messages: [...newMessages, { role: "assistant", content: confirmText }],
        pendingInterpretation: interpretation,
        pendingRecommendations: recommendations,
        phase: "confirming",
        isLoading: false,
      });
    } catch {
      // Fallback to general chat
      try {
        const res = await chatbotAPI.chat(newMessages.slice(-10), newDialect);
        set({
          messages: [
            ...newMessages,
            { role: "assistant", content: stripMarkdown(res.data.reply) },
          ],
          isLoading: false,
        });
      } catch {
        set({
          messages: [
            ...newMessages,
            { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again." },
          ],
          isLoading: false,
        });
      }
    }
  },

  clearChat: () =>
    set({
      messages: [WELCOME_MSG],
      interpretation: null,
      pendingInterpretation: null,
      pendingRecommendations: [],
      recommendations: [],
      phase: "idle",
      clarifyingContext: "",
      forceTaglish: false,
      detectedDialect: null,
      userMessageCount: 0,
      clarifyRounds: 0,
    }),
}),
{
  name: "galink-chat-history",
  // Only persist the message history and final recommendations — not transient state
  partialize: (state) => ({
    messages: state.messages,
    recommendations: state.recommendations,
    interpretation: state.interpretation,
    // forceTaglish and userMessageCount are intentionally NOT persisted
    // so language detection always resets fresh on each page load
  }),
}
));

export default useChatbotStore;
