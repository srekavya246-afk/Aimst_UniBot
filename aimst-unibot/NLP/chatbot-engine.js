// AIMST University Intelligent Chatbot NLP Engine
// Supports Student Context Personalization, Priority Intent NLP & Smart Typo Detection with User Confirmation Flow
// Version 3.0 - Intelligent Intent Scoring, Fuzzy Typo Correction, and Conversational Context Resolution

class ChatbotEngine {
  constructor(knowledgeBase = []) {
    this.knowledgeBase = knowledgeBase;
    this.stopWords = new Set([
      "is", "the", "a", "an", "and", "or", "to", "in", "at", "for", "of", "on",
      "with", "by", "from", "please", "tell",
      "me", "i", "you", "your", "we", "us", "about",
      "are", "am", "there", "their", "it", "they"
    ]);

    // Session context
    this.currentSession = {
      lastIntent: null,
      lastEntities: {},
      lastCategory: null,
      pendingTypo: null // { originalQuery, typoWord, correctedWord, correctedQuery }
    };

    this.greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "greetings"];
    this.helpRequests = ["what can you do", "how can you help me", "what can i ask you", "help me", "help"];

    // Confirmation & Rejection Response Tables (Normalized strings without punctuation)
    this.confirmations = new Set([
      "yes", "yes that s right", "yes thats right", "yes that is right", "correct", "yeah", "yep",
      "that s what i meant", "thats what i meant", "that is what i meant", "yes please", "sure", "ok",
      "okay", "ya", "exact", "right", "true", "indeed", "yup"
    ]);

    this.rejections = new Set([
      "no", "nope", "that s not what i meant", "thats not what i meant", "that is not what i meant",
      "wrong", "nah", "not really", "no thanks", "no sorry"
    ]);

    // Known Domain Dictionary for Typo Correction
    this.KNOWN_DOMAIN_WORDS = [
      "scholarship", "scholarships", "exam", "exams", "examination", "examinations",
      "timetable", "timetables", "schedule", "schedules", "slip", "slips", "docket", "dockets",
      "result", "results", "grade", "grades", "transcript", "transcripts",
      "hostel", "hostels", "accommodation", "room", "rooms", "dormitory", "dorm",
      "hosteller", "hostellers", "non-hosteller", "non-hostellers", "warden",
      "vehicle", "vehicles", "sticker", "stickers", "parking", "car", "motorcycle",
      "registration", "register", "enroll", "enrollment", "course", "courses", "subject", "subjects",
      "library", "libraries", "hour", "hours", "timing", "tuition", "fee", "fees", "balance", "outstanding",
      "ptptn", "loan", "loans", "payment", "payments", "pay", "penalty", "overdue", "late",
      "finance", "bursary", "student", "affairs", "sad",
      "hall", "ticket", "pass", "status", "unpaid", "clearance", "sit",
      "map", "block", "blocks", "blocked", "campus", "clinic", "cafeteria", "canteen",
      "facilities", "facility", "gym", "sport", "sports", "study", "area"
    ];

    // Standard Non-Domain / Common Words to ignore during typo check
    this.COMMON_WORDS = new Set([
      "what", "when", "where", "how", "who", "why", "which", "is", "are", "am", "was", "were", "be", "been",
      "being", "have", "has", "had", "do", "does", "did", "can", "could", "should", "would", "will", "may",
      "might", "must", "my", "me", "i", "you", "your", "we", "us", "they", "them", "their", "a", "an", "the",
      "and", "or", "but", "if", "in", "on", "at", "to", "for", "with", "by", "about", "against", "between",
      "into", "through", "during", "before", "after", "above", "below", "from", "up", "down", "out", "off",
      "over", "under", "again", "further", "then", "once", "here", "there", "all", "any", "both", "each",
      "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
      "too", "very", "just", "don", "now", "get", "view", "see", "check", "download", "print", "apply", "much",
      "owe", "available", "open", "close", "show", "tell", "online", "hi", "hello", "hey", "need", "want",
      "sit", "take", "hour", "hours", "blocked", "sad", "gym", "sport", "sports", "thank", "thanks", "welcome"
    ]);

    // SPECIFIC OBJECT PHRASE TABLE
    this.SPECIFIC_PHRASE_MAP = [
      {
        intent: "EXAM_TIMETABLE",
        phrases: [
          "exam timetable", "examination timetable",
          "exam schedule", "examination schedule",
          "exam dates", "examination dates",
          "when are my exams", "when is my exam", "when my exam",
          "when is my exam timetable", "when is the exam timetable",
          "when is the timetable", "when is timetable", "the timetable", "timetable",
          "where is my exam timetable", "where can i see my exam timetable",
          "where can i check my exam timetable", "how can i check my exam timetable",
          "how do i check my exam timetable", "check exam timetable", "view exam timetable",
          "my exam timetable", "my exam schedule", "my exam dates", "my examination timetable",
          "my examination schedule", "when are exams", "exam date"
        ],
        objects: ["timetable"],
        antiObjects: ["slip", "docket", "result", "results", "marks", "grade", "transcript"]
      },
      {
        intent: "EXAM_SLIP",
        phrases: [
          "exam slip", "examination slip", "exam docket", "examination docket",
          "download exam slip", "print exam slip", "get exam slip", "view exam slip",
          "exam slip available", "is my exam slip", "where is my exam slip",
          "where can i get my exam slip", "how do i download my exam slip",
          "how can i download my exam slip", "can i print my exam slip",
          "can i get my exam slip", "can i view my exam slip", "my exam slip",
          "can i download my exam slip",
          "exam slip status", "my exam slip status", "status of my exam slip",
          "is my exam slip ready", "exam slip ready", "can i collect my exam slip",
          "am i allowed to take my exam slip", "why is my exam slip blocked",
          "why is my exam slip not available", "is my exam slip blocked", "exam slip blocked",
          "why my exam slip blocked", "why is exam slip blocked",
          "can i sit for my exam", "can i sit for exam", "am i allowed to sit for the exam",
          "can i take my exam", "can i take exam",
          "hall slip", "hall ticket", "exam pass"
        ],
        objects: ["slip", "docket"],
        antiObjects: ["timetable", "schedule", "result", "results", "marks", "grade"]
      },
      {
        intent: "EXAM_RESULTS",
        phrases: [
          "exam results", "examination results", "results released", "results available",
          "check results", "view results", "check my results", "see my results",
          "my exam results", "my examination results", "when are exam results",
          "when will exam results", "when will my exam results", "when are my exam results",
          "are exam results out", "are my results out"
        ],
        objects: ["result", "results", "marks", "grade", "cgpa", "gpa", "transcript"],
        antiObjects: ["timetable", "slip", "docket", "schedule"]
      },
      {
        intent: "TUITION_FEE_BALANCE",
        phrases: [
          "outstanding fee", "outstanding tuition", "how much do i owe",
          "what is my fee", "what is my outstanding", "my tuition balance",
          "fee balance", "tuition balance", "how much owe", "how much is my fee",
          "what fee do i owe", "how much fees do i need to pay", "what is my fee balance",
          "show my fee balance", "how much is my outstanding fee", "how much fee", "what is my fee",
          "show my tuition fee balance", "show me my fee balance", "tuition fee balance",
          "my fees", "my fee", "my tuition fee", "check my fee", "check my fees",
          "check my fee balance", "check my outstanding", "check my balance",
          "how much is my balance", "how much balance", "how much do i still owe",
          "how much left to pay", "how much more do i need to pay",
          "what do i still need to pay", "do i still owe", "do i owe anything",
          "do i have unpaid fees", "do i have any unpaid", "unpaid balance",
          "do i have outstanding", "do i have any outstanding", "any outstanding payment",
          "outstanding amount", "my outstanding amount", "outstanding balance",
          "my fee status", "fee status", "my account balance"
        ],
        objects: ["balance", "outstanding", "owe", "unpaid"],
        antiObjects: ["late", "penalty", "pay online", "how to pay", "how do i pay", "where can i pay", "payment method", "settle"]
      },
      {
        intent: "TUITION_FEE_PAYMENT",
        phrases: [
          "how do i pay", "how to pay", "where can i pay", "how do i pay my tuition fees",
          "how do i pay my fees", "pay my tuition", "pay my fee", "pay my university fees",
          "payment method", "settle my fee", "settle my tuition", "online payment",
          "pay online", "fee payment", "can i do it online", "do it online"
        ],
        objects: ["pay", "payment", "settle"],
        antiObjects: ["balance", "owe", "outstanding", "late", "penalty"]
      },
      {
        intent: "TUITION_FEE_LATE_PAYMENT",
        phrases: [
          "late payment", "pay late", "late fee", "penalty for late",
          "overdue fee", "fee deadline", "unpaid fee", "what happens if i pay late",
          "late payment penalty", "what happens if fee is delayed", "what happens if payment is delayed"
        ],
        objects: ["late", "overdue", "penalty", "unpaid"],
        antiObjects: ["balance", "owe", "outstanding"]
      },
      {
        intent: "HOSTEL_FEES",
        phrases: [
          "hostel fee", "hostel fees", "how much is hostel", "hostel cost",
          "hostel price", "how much does hostel cost", "accommodation fee", "accommodation cost"
        ],
        objects: ["rent"],
        antiObjects: ["apply", "application", "my room", "room number"]
      },
      {
        intent: "HOSTEL_APPLICATION",
        phrases: [
          "apply for hostel", "hostel application", "apply hostel",
          "how do i apply for hostel", "how can i get a hostel room",
          "i want hostel accommodation", "want to stay in hostel", "how to apply hostel"
        ],
        objects: [],
        antiObjects: ["how much", "my room", "room number"]
      },
      {
        intent: "HOSTEL_ROOM",
        phrases: [
          "my hostel room", "hostel room number", "what room am i",
          "what is my room number", "my room number", "my hostel block",
          "tell me my hostel", "where is my room", "where is my hostel room",
          "where is my hostel", "hostel room assignment", "my assigned room", "hostel room",
          "what is my hostel room details", "my hostel room details", "hostel room details",
          "room details", "my room details", "what is my hostel room", "where is my hostel room details",
          "hostel details", "my hostel details"
        ],
        objects: [],
        antiObjects: ["apply", "application", "how much"]
      },
      {
        intent: "VEHICLE_STICKER",
        phrases: [
          "vehicle sticker", "car sticker", "motorcycle sticker", "parking pass",
          "how do i get a vehicle sticker", "vehicle pass", "car pass", "sticker for car",
          "vechicle sticker"
        ],
        objects: ["sticker", "decal"],
        antiObjects: []
      },
      {
        intent: "CLINIC",
        phrases: [
          "clinic", "health clinic", "student health clinic", "where is the clinic",
          "clinic hours", "doctor on campus", "sick on campus", "first aid"
        ],
        objects: ["clinic"],
        antiObjects: []
      },
      {
        intent: "CAFETERIA",
        phrases: [
          "cafeteria", "canteen", "where to eat", "food on campus", "cafeteria hours",
          "eating places", "food choices"
        ],
        objects: ["cafeteria", "canteen"],
        antiObjects: []
      },
      {
        intent: "FACILITIES",
        phrases: [
          "campus facilities", "sports complex", "gym hours", "gym", "swimming pool",
          "badminton court", "badminton", "tennis court", "tennis", "sports", "sport",
          "facilities in aimst", "what facilities are available", "sports facilities"
        ],
        objects: ["facilities", "gym", "sport", "sports"],
        antiObjects: []
      },
      {
        intent: "CAMPUS_MAP",
        phrases: [
          "campus map", "university map", "aimst map", "where are the blocks",
          "where is block a", "where is block c", "where is block b", "where is block d", "where is block e",
          "block locations", "map of aimst", "show me the map", "where is the block", "campus layout",
          "where is sad office", "where is sad department", "where is sad counter"
        ],
        objects: ["map"],
        antiObjects: []
      },
      {
        intent: "PTPTN",
        phrases: [
          "ptptn", "ptptn loan", "apply for ptptn", "how do i apply for ptptn", "where do i apply for ptptn"
        ],
        objects: ["ptptn"],
        antiObjects: ["scholarship"]
      },
      {
        intent: "SCHOLARSHIP",
        phrases: [
          "scholarship", "scholarships", "apply for scholarship", "what scholarships are available",
          "what scholorships are available", "merit scholarship", "financial aid scholarship"
        ],
        objects: ["scholarship", "scholarships"],
        antiObjects: ["ptptn"]
      },
      {
        intent: "STUDY_AREA_HOURS",
        phrases: [
          "study area", "study room", "study area hours", "study area opening",
          "study area operating hours", "where can i study", "24 hour study",
          "study space", "discussion room", "study hours"
        ],
        objects: ["study area"],
        antiObjects: ["library"]
      },
      {
        intent: "LIBRARY_HOURS",
        phrases: [
          "library hours", "library operating hours", "library operating hour", "what are the library hours",
          "when does the library open", "library opening time", "library timing", "libary timing",
          "where is the library", "central library", "aimst library"
        ],
        objects: ["library"],
        antiObjects: ["study area"]
      },
      {
        intent: "NON_HOSTELLER_HOSTEL",
        phrases: [
          "non hosteller", "non hostellers", "non-hosteller", "non-hostellers",
          "can non hosteller apply for hostel", "can non hostellers apply for hostel",
          "can non hosteller apply", "can non hostellers apply",
          "non hostellers can apply for hostel", "non-hostellers can apply for hostel",
          "day scholar apply hostel", "day scholar hostel"
        ],
        objects: ["non-hosteller", "non hosteller"],
        antiObjects: []
      },
      {
        intent: "SAD_CONTACT",
        phrases: [
          "contact sad", "sad contact", "student affairs department", "what is sad", "who is sad",
          "where is sad", "sad office", "sad email", "sad phone", "contact information for student affairs",
          "student affairs contact", "how to contact sad", "contact sad department"
        ],
        objects: ["sad"],
        antiObjects: []
      }
    ];
  }

  updateKnowledgeBase(newKb) {
    this.knowledgeBase = newKb;
  }

  // Detect unnecessary, irrelevant, random, or off-topic queries
  isOffTopicQuery(cleanInput, rawInput) {
    const text = (cleanInput + " " + rawInput).toLowerCase().trim();

    const offTopicPatterns = [
      // Personal questions & bot preferences
      /\b(favorite|favourite)\b/i,
      /\b(who|what|where)\s+(is|are|was|were)\s+your\s+(favorite|favourite|creator|maker|master|owner|boss|friend|lover|boyfriend|girlfriend)\b/i,
      /^(who|what)\s+(are|is)\s+you\b/i,
      /^what\s+is\s+your\s+name\b/i,
      /^how\s+old\s+are\s+you\b/i,
      /^where\s+do\s+you\s+live\b/i,
      /^where\s+are\s+you\s+from\b/i,
      /^are\s+you\s+(a\s+)?(human|real|single|alive|robot|bot|person|ai|boy|girl|man|woman|married)\b/i,
      /^who\s+(created|made|built|developed|designed|programmed)\s+you\b/i,
      /^do\s+you\s+(eat|sleep|drink|love|like|think|feel|dream|have\s+a)\b/i,
      /^what\s+do\s+you\s+(eat|like|do\s+in\s+your\s+free\s+time)\b/i,
      /^tell\s+me\s+about\s+yourself\b/i,
      /^how\s+are\s+you\b/i,
      /^how\s+do\s+you\s+do\b/i,
      /^what'?s\s+up\b/i,
      /^sup\b/i,

      // Jokes, Stories & Entertainment
      /\b(joke|jokes)\b/i,
      /\bmake\s+me\s+laugh\b/i,
      /\b(tell|sing|recite)\b.*\b(story|song|poem|riddle)\b/i,
      /\bplay\s+a\s+game\b/i,

      // Weather & Climate
      /\b(weather|temperature|climate|forecast)\b/i,
      /\bis\s+it\s+(raining|sunny|cloudy|hot|cold)\b/i,

      // General Knowledge, Celebrities, Sports, Politics & Trivia
      /\bwho\s+is\s+the\s+richest\b/i,
      /\bwho\s+is\s+(elon\s+musk|bill\s+gates|jeff\s+bezos|mark\s+zuckerberg|donald\s+trump|joe\s+biden|barack\s+obama|taylor\s+swift|drake|ronaldo|messi|cristiano)\b/i,
      /\bwhat\s+is\s+the\s+capital\s+of\b/i,
      /\bwho\s+won\s+the\b/i,
      /\bhow\s+far\s+is\s+the\s+(sun|moon|mars)\b/i,
      /\bmeaning\s+of\s+life\b/i,
      /\b(recipe|how\s+to\s+cook|how\s+to\s+make)\s+(pizza|cake|pasta|bread|cookie|burger)\b/i,

      // Coding, Math, Essay Generation, Trading
      /\b(write|create|generate)\s+a?\s*(python|javascript|java|c\+\+|code|script|program|essay|poem|song|story)\b/i,
      /\bwhat\s+is\s+\d+\s*[\+\-\*\/]\s*\d+\b/i,
      /\b(solve|calculate)\s+\d+/i,
      /\b(crypto|bitcoin|ethereum|stocks|shares|trading|forex)\b/i
    ];

    for (const pattern of offTopicPatterns) {
      if (pattern.test(text) || pattern.test(cleanInput) || pattern.test(rawInput)) {
        return true;
      }
    }
    return false;
  }

  // Check if a query has any relevance to AIMST University / student services
  isDomainRelevant(cleanInput, rawInput) {
    const text = (cleanInput + " " + rawInput).toLowerCase();

    for (const word of this.KNOWN_DOMAIN_WORDS) {
      if (text.includes(word)) return true;
    }

    const domainTerms = [
      "aimst", "unibot", "student", "university", "faculty", "degree", "diploma", "intake", "semeling", "bedong", "kedah",
      "exam", "exams", "examination", "timetable", "schedule", "slip", "slips", "docket", "result", "grade", "transcript", "gpa", "cgpa", "marks", "hall ticket", "sit", "blocked",
      "tuition", "fee", "fees", "balance", "outstanding", "owe", "unpaid", "late", "penalty", "payment", "bursary", "finance", "cashier", "pay", "installment",
      "hostel", "accommodation", "room", "dorm", "hosteller", "non-hosteller", "block", "staircase", "warden",
      "vehicle", "car", "motorcycle", "sticker", "parking", "decal", "pass",
      "ptptn", "loan", "scholarship", "financial aid", "rebate", "merit",
      "library", "study area", "study", "hour", "hours", "operating", "clinic", "doctor", "medical", "first aid", "cafeteria", "canteen", "food", "sports complex", "gym", "sport", "sports", "swimming", "badminton", "tennis", "map", "building",
      "course", "subject", "registration", "register", "enroll", "academic", "sad", "student affairs", "portal", "cms"
    ];

    for (const term of domainTerms) {
      if (text.includes(term)) return true;
    }

    for (const entry of this.SPECIFIC_PHRASE_MAP) {
      for (const phrase of (entry.phrases || [])) {
        if (text.includes(phrase)) return true;
      }
    }

    for (const item of (this.knowledgeBase || [])) {
      if (item.question && text.includes(this.normalizeText(item.question))) return true;
      if (item.category && text.includes(item.category.toLowerCase())) return true;
      if (item.keywords) {
        for (const kw of item.keywords) {
          if (kw && text.includes(kw.toLowerCase())) return true;
        }
      }
    }

    return false;
  }

  // Levenshtein Edit Distance Calculation
  getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Check query for potential typos
  detectTypoInQuery(rawText) {
    const tokens = rawText.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);

    for (const token of tokens) {
      if (this.COMMON_WORDS.has(token) || this.KNOWN_DOMAIN_WORDS.includes(token)) {
        continue;
      }

      // Check if token is just plural or inflection of a known domain word
      const isInflection = this.KNOWN_DOMAIN_WORDS.some(dw => 
        token === dw + 's' || token === dw + 'ed' || token === dw + 'ing' || dw === token + 's'
      );
      if (isInflection) continue;

      let bestTarget = null;
      let minDistance = Infinity;

      for (const domainWord of this.KNOWN_DOMAIN_WORDS) {
        const dist = this.getLevenshteinDistance(token, domainWord);
        let maxAllowedDist = domainWord.length <= 4 ? 1 : 2;

        if (dist <= maxAllowedDist && dist < minDistance) {
          const similarity = 1 - (dist / Math.max(token.length, domainWord.length));
          if (similarity >= 0.70) {
            minDistance = dist;
            bestTarget = domainWord;
          }
        }
      }

      if (bestTarget && minDistance > 0 && bestTarget !== token) {
        return {
          typoWord: token,
          correctedWord: bestTarget
        };
      }
    }
    return null;
  }

  normalizeText(text) {
    let normalized = text.toLowerCase()
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const replacements = {
      "tution": "tuition",
      "uni": "university",
      "shedule": "schedule",
      "cant": "cannot",
      "wont": "will not",
      "dont": "do not",
      "whats": "what is",
      "whens": "when is",
      "hows": "how is"
    };

    for (const [key, val] of Object.entries(replacements)) {
      if (normalized.includes(key)) {
        normalized = normalized.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
      }
    }

    return normalized;
  }

  tokenize(text) {
    if (!text) return [];
    return text.split(' ').filter(word => word.length > 1 && !this.stopWords.has(word));
  }

  extractEntities(normalizedText) {
    const extracted = {};
    const text = normalizedText;

    if (text.includes("my") || text.includes("me") || text.includes("i ")) {
      extracted.scope = "personal";
    }
    if (text.includes("how much") || text.includes("cost") || text.includes("price") || text.includes("balance") || text.includes("owe")) {
      extracted.property = "cost_or_balance";
    }
    if (text.includes("where") || text.includes("location") || text.includes("room")) {
      extracted.property = "location";
    }
    if (text.includes("when") || text.includes("time") || text.includes("hours") || text.includes("schedule") || text.includes("date")) {
      extracted.property = "time";
    }
    if (text.includes("apply") || text.includes("register") || text.includes("enroll")) {
      extracted.action = "apply_register";
    }
    if (text.includes("pay") || text.includes("settle") || text.includes("payment")) {
      extracted.action = "pay";
    }
    if (text.includes("download") || text.includes("view") || text.includes("see") || text.includes("check")) {
      extracted.action = "view_download";
    }

    return extracted;
  }

  detectSpecificPhrases(cleanInput) {
    const results = [];

    for (const entry of this.SPECIFIC_PHRASE_MAP) {
      let phraseScore = 0;
      let objectScore = 0;
      let hasHardVeto = false;

      for (const antiObj of (entry.antiObjects || [])) {
        if (cleanInput.includes(antiObj)) {
          hasHardVeto = true;
          break;
        }
      }

      for (const phrase of (entry.phrases || [])) {
        if (cleanInput.includes(phrase)) {
          phraseScore += 60 + (phrase.split(' ').length * 10);
        }
      }

      for (const obj of (entry.objects || [])) {
        if (cleanInput.includes(obj)) {
          objectScore += 40;
        }
      }

      results.push({
        intent: entry.intent,
        phraseScore,
        objectScore,
        totalSpecificScore: phraseScore + objectScore,
        hasHardVeto
      });
    }

    return results;
  }

  isGenuinelyAmbiguous(cleanInput, specificResults, scores) {
    if (scores.length < 2) return false;
    const first = scores[0];
    const second = scores[1];

    // If both have the same question or category, NOT ambiguous
    if (this.normalizeText(first.item.question) === this.normalizeText(second.item.question)) {
      return false;
    }

    // If the top match has a strong score lead, NOT ambiguous
    if (first.score >= 35 && (first.score - second.score) >= 12) {
      return false;
    }

    const vetoedResults = specificResults.filter(r => !r.hasHardVeto);
    const topSpecific = [...vetoedResults].sort((a, b) => b.totalSpecificScore - a.totalSpecificScore);

    if (topSpecific.length > 0 && topSpecific[0].totalSpecificScore > 0) {
      const secondSpecific = topSpecific.length > 1 ? topSpecific[1].totalSpecificScore : 0;
      if (topSpecific[0].totalSpecificScore - secondSpecific >= 25) {
        return false;
      }
    }

    const topScore = scores[0].score;
    const secondScore = scores[1].score;

    return (topScore - secondScore < 8) && topScore < 28;
  }

  getItemIntent(item) {
    if (!item) return null;
    if (item.intent) return item.intent;
    return ChatbotEngine.ID_INTENT_MAP[item.id] || null;
  }

  resolveIntent(bestMatch, specificResults) {
    if (!bestMatch) return "UNKNOWN";
    if (bestMatch.intent) return bestMatch.intent;

    const viable = (specificResults || [])
      .filter(r => !r.hasHardVeto && r.totalSpecificScore > 0)
      .sort((a, b) => b.totalSpecificScore - a.totalSpecificScore);

    if (viable.length > 0 && viable[0].phraseScore >= 60) {
      return viable[0].intent;
    }

    if (ChatbotEngine.ID_INTENT_MAP[bestMatch.id]) {
      return ChatbotEngine.ID_INTENT_MAP[bestMatch.id];
    }

    if (viable.length > 0) return viable[0].intent;

    return "UNKNOWN";
  }

  processQuery(userQuery, studentProfile = null) {
    try {
      if (!userQuery || !userQuery.trim()) {
        return {
          matched: false,
          response: "Please type a question regarding AIMST University student services.",
          confidence: 0,
          suggested: this.getSuggestions()
        };
      }

      const rawInput = userQuery.trim();
      const cleanInput = this.normalizeText(rawInput);

      // --- 0. CHECK FOR THANK YOU ---
      const isThankYou = /^(thank\s*you|thanks|thank\s*u|thx|tq|tqsm|thankyou)(\s+(so\s+much|very\s+much|a\s+lot|unibot|bot|sir|madam|you|u))?[.!]?$/i.test(rawInput)
        || /^(thank\s*you|thanks|thank\s*u|thx|tq|tqsm|thankyou)\b/i.test(cleanInput)
        || /^(many\s+thanks|much\s+appreciated|thanks\s+a\s+lot)[.!]?$/i.test(rawInput);

      if (isThankYou) {
        return {
          matched: true,
          category: "General",
          response: "You're Welcome.",
          confidence: 100,
          hideFeedback: true
        };
      }

      // --- 0.1 CHECK PENDING TYPO CONFIRMATION ---
      if (this.currentSession.pendingTypo) {
        const isConfirmed = this.confirmations.has(cleanInput) || cleanInput.includes("yes") || cleanInput === "yep" || cleanInput === "ya";
        const isRejected = this.rejections.has(cleanInput) || cleanInput.includes("no") || cleanInput === "nope";

        if (isConfirmed) {
          const pending = this.currentSession.pendingTypo;
          this.currentSession.pendingTypo = null;
          return this.processQuery(pending.correctedQuery, studentProfile);
        } else if (isRejected) {
          this.currentSession.pendingTypo = null;
          return {
            matched: true,
            category: "General",
            response: "No problem. Could you rephrase your question?",
            confidence: 100
          };
        } else {
          this.currentSession.pendingTypo = null;
        }
      }

      // --- 1. GREETING SUPPORT ---
      const tokens = this.tokenize(cleanInput);
      if (this.greetings.includes(cleanInput) || (tokens.length === 1 && this.greetings.includes(tokens[0]))) {
        const name = studentProfile && studentProfile.name ? studentProfile.name : "there";
        return {
          matched: true,
          category: "General",
          response: `Hello <strong>${name}</strong>! 👋 How can I help you with AIMST student services today?`,
          confidence: 100
        };
      }

      // --- 2. GENERAL HELP ---
      if (this.helpRequests.some(hr => cleanInput.includes(hr))) {
        return {
          matched: true,
          category: "General",
          response: `I can help you with many AIMST topics, including:<br/>
          • Exam timetable, slips, and results<br/>
          • Tuition fees and payments<br/>
          • Hostel applications and rooms<br/>
          • Vehicle stickers<br/>
          • PTPTN and Scholarships<br/>
          • Library and Study Area hours<br/>
          • Course registration<br/>
          • Contacting Student Affairs (SAD)<br/><br/>
          What would you like to know?`,
          confidence: 100
        };
      }

      // --- 3. CHECK FOR UNRELATED / UNNECESSARY / OFF-TOPIC QUESTIONS ---
      if (this.isOffTopicQuery(cleanInput, rawInput)) {
        return {
          matched: false,
          response: "Sorry, I can't reply to your question.",
          confidence: 0
        };
      }

      // --- 4. CHECK FOR TYPOS BEFORE INTENT SCORING ---
      const detectedTypo = this.detectTypoInQuery(rawInput);
      if (detectedTypo) {
        const regex = new RegExp(`\\b${detectedTypo.typoWord}\\b`, 'gi');
        const correctedQuery = rawInput.replace(regex, detectedTypo.correctedWord);

        this.currentSession.pendingTypo = {
          originalQuery: rawInput,
          typoWord: detectedTypo.typoWord,
          correctedWord: detectedTypo.correctedWord,
          correctedQuery: correctedQuery
        };

        return {
          matched: true,
          isTypoConfirmation: true,
          response: `Did you mean **"${detectedTypo.correctedWord}"**?`,
          suggestedCorrection: detectedTypo.correctedWord,
          typoWord: detectedTypo.typoWord,
          confidence: 90
        };
      }

      // --- 5. CONVERSATIONAL FOLLOW-UP RESOLUTION ---
      let activeQuery = cleanInput;
      if ((cleanInput.includes("can i do it online") || cleanInput.includes("do it online") || cleanInput === "can i pay online") && this.currentSession.lastIntent === "TUITION_FEE_PAYMENT") {
        activeQuery = "how do i pay my tuition fees online";
      }

      // --- 6. SPECIFIC PHRASE DETECTION & INTENT SCORING ---
      const specificResults = this.detectSpecificPhrases(activeQuery);
      const entities = this.extractEntities(activeQuery);

      let isFollowUp = false;
      if (tokens.length <= 3 && this.currentSession.lastIntent) {
        isFollowUp = true;
      }

      let bestMatch = null;
      let highestScore = 0;
      const scores = [];

      for (const item of this.knowledgeBase) {
        let score = 0;
        let conflictPenalty = 0;

        const itemIntent = this.getItemIntent(item);
        if (itemIntent) {
          const matchedSpecific = specificResults.find(r => r.intent === itemIntent);
          if (matchedSpecific && !matchedSpecific.hasHardVeto) {
            score += matchedSpecific.totalSpecificScore;
          }
          if (matchedSpecific && matchedSpecific.hasHardVeto) {
            conflictPenalty += 80;
          }
        }

        // 1. Direct Question Evaluation (Highest Priority)
        if (item.question) {
          const itemQuestionLower = this.normalizeText(item.question);
          if (activeQuery === itemQuestionLower) {
            score += 85;
          } else if (itemQuestionLower.length > 5 && (activeQuery.includes(itemQuestionLower) || itemQuestionLower.includes(activeQuery))) {
            score += 45;
          } else {
            const qTokens = this.tokenize(itemQuestionLower);
            let qOverlap = 0;
            for (const t of tokens) {
              if (qTokens.includes(t)) qOverlap++;
            }
            if (qTokens.length > 0 && qOverlap > 0) {
              score += Math.round((qOverlap / qTokens.length) * 35);
            }
          }
        }

        // 2. Examples Evaluation
        if (item.examples && Array.isArray(item.examples)) {
          for (const ex of item.examples) {
            const normEx = this.normalizeText(ex);
            if (activeQuery === normEx) {
              score += 65;
            } else if (normEx.length > 5 && (activeQuery.includes(normEx) || normEx.includes(activeQuery))) {
              score += 30;
            }
          }
        }

        if (item.negativeKeywords) {
          for (const nk of item.negativeKeywords) {
            if (activeQuery.includes(this.normalizeText(nk))) {
              conflictPenalty += 50;
            }
          }
        }

        if (item.entities) {
          let matchedEntities = 0;
          for (const [key, values] of Object.entries(item.entities)) {
            for (const val of values) {
              if (activeQuery.includes(this.normalizeText(val))) {
                matchedEntities++;
                score += 15;
                break;
              }
            }
          }
          if (matchedEntities > 0) score += matchedEntities * 5;
        }

        // 3. Keywords Evaluation (Clean token & phrase matching)
        const keywords = item.keywords || [];
        let kwMatches = 0;
        for (const kw of keywords) {
          const kwNorm = this.normalizeText(kw);
          if (!kwNorm) continue;
          if (kwNorm.includes(' ')) {
            if (activeQuery.includes(kwNorm)) {
              kwMatches++;
              score += 18;
            }
          } else {
            if (tokens.includes(kwNorm)) {
              kwMatches++;
              score += 8;
            }
          }
        }
        if (kwMatches > 0) score += 5;

        if (isFollowUp && this.currentSession.lastIntent === item.intent) {
          score += 25;
        } else if (isFollowUp && this.currentSession.lastCategory === item.category) {
          score += 10;
        }

        const finalScore = score - conflictPenalty;

        if (finalScore > 0) {
          scores.push({ item, score: finalScore });
        }

        if (finalScore > highestScore) {
          highestScore = finalScore;
          bestMatch = item;
        }
      }

      scores.sort((a, b) => b.score - a.score);

      // --- 7. RELEVANCE EVALUATION & RESPONSE SELECTION ---
      const domainRelevant = this.isDomainRelevant(cleanInput, rawInput);

      if (!domainRelevant && (scores.length === 0 || highestScore < 15)) {
        return {
          matched: false,
          response: "Sorry, I can't reply to your question.",
          confidence: 0
        };
      }

      if (scores.length === 0 || highestScore < 10) {
        return {
          matched: false,
          isClarification: true,
          response: "I can help with AIMST student services such as examinations, tuition fees, hostel accommodation, scholarships, PTPTN, vehicle stickers, library services, and campus facilities. Could you please clarify your question?",
          confidence: 0,
          suggested: this.getSuggestions()
        };
      }

      const genuinelyAmbiguous = this.isGenuinelyAmbiguous(activeQuery, specificResults, scores);

      if (genuinelyAmbiguous) {
        return {
          matched: false,
          isClarification: true,
          response: `I can help with that. Do you mean "${scores[0].item.question}" or "${scores[1].item.question}"?`,
          confidence: 45
        };
      }

      // --- 8. PERSONALIZED STUDENT RESPONSES ---
      const intent = this.resolveIntent(bestMatch, specificResults);

      this.currentSession.lastIntent = intent;
      this.currentSession.lastCategory = bestMatch.category;
      this.currentSession.lastEntities = entities;

      if (studentProfile) {
        if (intent === "TUITION_FEE_BALANCE") {
          const fee = parseFloat(studentProfile.outstandingFee || 0);
          if (fee > 0) {
            const slipBlocked = String(studentProfile.examSlipStatus || '').trim().toLowerCase() === 'blocked';
            return {
              matched: true,
              category: bestMatch.category,
              confidence: 95,
              response: `Hello <strong>${studentProfile.name}</strong>! According to AIMST records for <em>${studentProfile.faculty}</em>, your current outstanding tuition balance is <strong style="color:var(--danger)">RM ${fee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>.<br/><br/>💳 <strong>How to settle:</strong> Online banking, credit/debit card via the student portal, or at the Finance Cashier Counter (Block C, Level 2).${slipBlocked ? `<br/><br/>⚠️ <strong>Please note:</strong> This balance is currently blocking your exam slip. It will be released automatically once payment is cleared.` : ''}`
            };
          } else {
            return {
              matched: true,
              category: bestMatch.category,
              confidence: 95,
              response: `Hi <strong>${studentProfile.name}</strong>! You have <strong style="color:var(--success)">NO outstanding tuition fees (RM 0.00)</strong>. All payments for <em>${studentProfile.faculty}</em> are fully up to date!`
            };
          }
        }

        if (intent === "EXAM_TIMETABLE") {
          return {
            matched: true,
            category: bestMatch.category,
            confidence: 95,
            response: `Hi <strong>${studentProfile.name}</strong>! Here is your official examination timetable for <strong>${studentProfile.faculty}</strong>:<br/><br/>📍 <strong>Schedule &amp; Venue:</strong> ${studentProfile.examTimetable}`
          };
        }

        if (intent === "EXAM_SLIP") {
          const slipStatus = String(studentProfile.examSlipStatus || '').trim().toLowerCase();
          const slipFee = parseFloat(studentProfile.outstandingFee || 0);
          const feeText = `RM ${slipFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

          if (slipStatus === 'available') {
            return {
              matched: true,
              category: bestMatch.category,
              isSlipAction: true,
              confidence: 95,
              response: `Good news <strong>${studentProfile.name}</strong>! Your exam slip for <em>${studentProfile.course}</em> is <strong style="color:var(--success)">AVAILABLE FOR DOWNLOAD</strong> in the CMS AIMST Portal.<br/><br/>📄 You can also download the official copy using the button below. Remember to print it and bring it to every paper together with your student ID.`
            };
          }

          if (slipStatus === 'blocked') {
            return {
              matched: true,
              category: bestMatch.category,
              confidence: 95,
              response: `Notice for <strong>${studentProfile.name}</strong>: Your exam slip is currently <strong style="color:var(--danger)">BLOCKED</strong>, so it cannot be downloaded yet.<br/><br/>⚠️ <strong>Reason:</strong> ${studentProfile.examSlipReason || 'Pending fee clearance.'}${slipFee > 0 ? `<br/>💰 <strong>Outstanding balance:</strong> <strong style="color:var(--danger)">${feeText}</strong>` : ''}<br/><br/>✅ <strong>What to do next:</strong> ${slipFee > 0 ? `Settle the ${feeText} via online banking or at the Finance Office (Block C, Level 2). Your slip is released automatically once payment is cleared in the system.` : 'Please contact the Finance Office (Block C, Level 2) to clear the block on your record.'}`
            };
          }

          return {
            matched: true,
            category: bestMatch.category,
            confidence: 95,
            response: `Hello <strong>${studentProfile.name}</strong>: Your exam slip is <strong style="color:var(--warning, #b45309)">NOT AVAILABLE</strong> at the moment.<br/><br/>ℹ️ <strong>Reason:</strong> ${studentProfile.examSlipReason || 'The Examination Division may still be updating your record.'}<br/><br/>✅ <strong>What to do next:</strong> Please check the CMS AIMST Portal again closer to the examination date, or contact the Examination Division (Block C) if it remains unavailable.`
          };
        }

        if (intent === "HOSTEL_ROOM") {
          const isHosteller = studentProfile.isHosteller === true || studentProfile.isHosteller === 'true';
          if (isHosteller) {
            const rNo = studentProfile.roomNo || 'N/A';
            const blk = studentProfile.hostelBlock || 'N/A';
            const stc = studentProfile.staircase || 'N/A';
            return {
              matched: true,
              category: bestMatch.category,
              isMapAction: true,
              confidence: 95,
              response: `Hello <strong>${studentProfile.name}</strong>! 🏠 Your room is <strong>${rNo}</strong>, <strong>${blk}</strong>, <strong>${stc}</strong>.<br/><br/>🏢 <strong>Block:</strong> ${blk}<br/>🪜 <strong>Staircase:</strong> ${stc}<br/>🚪 <strong>Room Number:</strong> ${rNo}<br/><br/>🗺️ Not sure where your block is? Open the campus map below.`
            };
          } else {
            return {
              matched: true,
              category: bestMatch.category,
              confidence: 95,
              response: `Hello <strong>${studentProfile.name}</strong>!<br/><br/>🚗 <strong>Hostel Status:</strong> <span style="color:var(--text-muted); font-weight:700;">Non-Hosteller (Day Scholar / Off-Campus)</span><br/>You do not have campus accommodation assigned. If you wish to apply for hostel accommodation, please contact the Student Affairs Department (SAD) or email <a href="mailto:hostel@aimst.edu.my">hostel@aimst.edu.my</a>.`
            };
          }
        }
      }

      return {
        matched: true,
        matchedItem: bestMatch,
        category: bestMatch.category,
        response: bestMatch.response,
        score: scores[0].score,
        confidence: Math.min(100, Math.round((scores[0].score / (scores[0].score + 20)) * 100))
      };
    } catch (err) {
      return {
        matched: false,
        response: "Sorry, I can't reply to your question.",
        confidence: 0
      };
    }
  }

  getSuggestions(limit = 4) {
    if (!this.knowledgeBase || this.knowledgeBase.length === 0) return [];
    return this.knowledgeBase.slice(0, limit).map(item => ({
      id: item.id,
      question: item.question,
      category: item.category
    }));
  }
}

// Maps built-in knowledge base row ids to their NLP intent, used when the stored
// database row has no `intent` column.
ChatbotEngine.ID_INTENT_MAP = {
  "kb-101": "EXAM_TIMETABLE",
  "kb-102": "EXAM_SLIP",
  "kb-103": "EXAM_RESULTS",
  "kb-104": "TUITION_FEE_PAYMENT",
  "kb-105": "TUITION_FEE_LATE_PAYMENT",
  "kb-105_balance": "TUITION_FEE_BALANCE",
  "kb-106": "HOSTEL_APPLICATION",
  "kb-107": "HOSTEL_FEES",
  "kb-107_room": "HOSTEL_ROOM",
  "kb-108": "VEHICLE_STICKER",
  "kb-109": "PTPTN",
  "kb-110": "LIBRARY_HOURS",
  "kb-111": "COURSE_REGISTRATION",
  "kb-112": "SAD_CONTACT",
  "kb-113": "SCHOLARSHIP",
  "kb-114": "STUDY_AREA_HOURS",
  "kb-115": "NON_HOSTELLER_HOSTEL",
  "kb-115_app": "NON_HOSTELLER_HOSTEL_APPLICATION",
  "kb-118": "FACILITIES",
  "kb-119": "CLINIC",
  "kb-120": "CAFETERIA",
  "kb-121": "CAMPUS_MAP"
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChatbotEngine };
}
