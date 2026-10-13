// AIMST University Intelligent Chatbot Knowledge Base
// Version 3.1 - Enhanced Categories & Campus Facilities Knowledge Base

const INITIAL_KNOWLEDGE_BASE = [
  {
    id: "kb-101",
    intent: "EXAM_TIMETABLE",
    question: "When is the exam timetable released?",
    examples: [
      "When is my exam timetable?",
      "Where can I see my exam schedule?",
      "When is my examination schedule?",
      "How do I check my timetable?",
      "exam timetable",
      "my exam date"
    ],
    entities: { subject: ["exam", "examination"], document: ["timetable", "schedule"] },
    negativeKeywords: ["slip", "result", "docket"],
    keywords: ["exam", "timetable", "schedule", "release", "date", "examination"],
    category: "Examination",
    response: "The examination timetable is published on the CMS portal under the Examination section. If you can not view your kindly contact to Exam Division ."
  },
  {
    id: "kb-102",
    intent: "EXAM_SLIP",
    question: "How can I view or download my exam slip?",
    examples: [
      "How do I download my exam slip?",
      "Can I get my exam docket?",
      "Where is my exam slip?",
      "Is my exam slip available?"
    ],
    entities: { subject: ["exam", "examination"], document: ["slip", "docket"], action: ["download", "view"] },
    negativeKeywords: ["timetable", "schedule", "result"],
    keywords: ["exam", "slip", "download", "view", "release", "hall", "docket"],
    category: "Examination",
    response: "If there is no outstanding tuition fee, you can view and download your exam slip on the Aimst Student Portal. If your slip is unavailable, the Exam Division may still be updating your record."
  },
  {
    id: "kb-103",
    intent: "EXAM_RESULTS",
    question: "When will semester exam results be announced?",
    examples: [
      "When are exam results released?",
      "When can I see my results?",
      "How long for exam results?"
    ],
    entities: { subject: ["exam", "examination"], document: ["result", "results", "marks", "grade", "transcript"] },
    negativeKeywords: ["timetable", "slip", "schedule", "docket"],
    keywords: ["result", "grade", "gpa", "cgpa", "marks", "transcript"],
    category: "Examination",
    response: "Exam results are released within 4 to 6 weeks after the examination period concludes. You can check your academic result directly on the Student Portal."
  },
  {
    id: "kb-104",
    intent: "TUITION_FEE_PAYMENT",
    question: "How do I pay my tuition fees?",
    examples: [
      "How do I pay my tuition?",
      "Where can I pay my fees?",
      "Can I pay my university fees online?",
      "What payment methods are available?",
      "I want to pay my tuition",
      "How do I settle my university fees?"
    ],
    entities: { subject: ["fee", "tuition"], action: ["pay", "payment", "settle"] },
    negativeKeywords: ["balance", "owe", "late", "outstanding"],
    keywords: ["tuition", "fee", "pay", "payment", "banking", "finance", "money"],
    category: "Finance",
    response: "Tuition fees can be paid via online banking transfer, credit/debit card through the online portal, or physically at the Finance Cashier Counter (Admin Block, Ground Floor). Deadlines are announced each semester."
  },
  {
    id: "kb-105",
    intent: "TUITION_FEE_LATE_PAYMENT",
    question: "What happens if tuition fee payment is delayed?",
    examples: [
      "What happens if I pay my fees late?",
      "Is there a penalty for late payment?",
      "I haven't paid my fees yet."
    ],
    entities: { subject: ["fee", "tuition"], property: ["late", "delayed", "penalty"] },
    negativeKeywords: ["balance", "owe"],
    keywords: ["late", "overdue", "deadline", "penalty", "due", "unpaid"],
    category: "Finance",
    response: "Delayed payments may incur a late payment penalty fee and prevent exam slip generation. Please contact the Finance Office if you require an installment plan."
  },
  {
    id: "kb-105_balance",
    intent: "TUITION_FEE_BALANCE",
    question: "How much is my outstanding fee?",
    examples: [
      "What is my outstanding fee?",
      "How much do I owe?",
      "What's my tuition balance?",
      "How much fee do I have to pay?"
    ],
    entities: { subject: ["fee", "tuition"], property: ["balance", "outstanding", "owe", "amount", "much"] },
    negativeKeywords: ["late", "penalty"],
    keywords: ["balance", "owe", "outstanding", "much", "amount"],
    category: "Finance",
    response: "Please provide your student matric number to check your outstanding tuition fee balance."
  },
  {
    id: "kb-106",
    intent: "HOSTEL_APPLICATION",
    question: "How do I apply for hostel accommodation?",
    examples: [
      "How do I apply for hostel?",
      "I want hostel accommodation.",
      "How can I get a hostel room?"
    ],
    entities: { subject: ["hostel", "accommodation"], action: ["apply", "get", "want"] },
    negativeKeywords: ["fee", "cost", "price", "where", "my room", "non-hosteller", "day scholar"],
    keywords: ["hostel", "apply", "accommodation", "room", "stay", "dormitory"],
    category: "Hostel",
    response: "Hostel applications open at the beginning of every New Intake. Rooms are allocated on a first-come, first-served basis."
  },
  {
    id: "kb-107",
    intent: "HOSTEL_FEES",
    question: "What are the hostel fees and payment details?",
    examples: [
      "How much is hostel?",
      "What are the hostel fees?",
      "How much does hostel cost?"
    ],
    entities: { subject: ["hostel", "accommodation"], property: ["fee", "cost", "price", "much"] },
    negativeKeywords: ["apply", "where", "my room"],
    keywords: ["hostel", "fee", "rent", "cost", "price", "room rates", "accommodation"],
    category: "Hostel",
    response: "Hostel fees vary by room type. 4-sharing room rate is RM 3,180/sem, 3-sharing room (RM 3,480/sem), 2-sharing room (RM 3,780/sem), and 2-sharing room with AC (RM 4,380/sem)."
  },
  {
    id: "kb-107_room",
    intent: "HOSTEL_ROOM",
    question: "Where is my hostel room details?",
    examples: [
      "Where is my hostel room?",
      "What room am I staying in?",
      "Tell me my hostel block.",
      "What is my room number?",
      "What is my hostel room details?"
    ],
    entities: { subject: ["hostel", "room", "block"], property: ["where", "my", "number", "details"] },
    negativeKeywords: ["apply", "fee", "cost", "much", "non-hosteller"],
    keywords: ["room", "block", "number", "where", "details"],
    category: "Hostel",
    response: "Please provide your student ID so I can look up your assigned hostel block, staircase, and room number."
  },
  {
    id: "kb-115",
    intent: "NON_HOSTELLER_HOSTEL_APPLICATION",
    question: "Can Non-Hostellers apply for hostel?",
    examples: [
      "Can Non-Hostellers apply for hostel?",
      "Can non hosteller apply for hostel?",
      "Can non-hostellers apply for hostel?",
      "I'm a day scholar, can I apply for hostel?",
      "Can non-hostellers get hostel?",
      "can non hosteller apply",
      "non hosteller"
    ],
    entities: { subject: ["hostel"], property: ["non-hosteller", "day scholar", "not hosteller"] },
    negativeKeywords: ["fee", "cost", "room number"],
    keywords: ["hostel", "apply", "accommodation", "room", "stay", "dorm", "non-hosteller"],
    category: "Hostel",
    response: "Students need to contact SAD Department for hostel information. After consulting SAD Department, student needs to visit Hostel Warden Office."
  },
  {
    id: "kb-108",
    intent: "VEHICLE_STICKER",
    question: "How do I apply for an AIMST Car or Motorcycle sticker?",
    examples: [
      "How do I get a car sticker?",
      "Where can I apply for motorcycle sticker?",
      "I need a vehicle sticker."
    ],
    entities: { subject: ["sticker", "vehicle", "car", "motorcycle"] },
    negativeKeywords: [],
    keywords: ["vehicle", "car", "motorcycle", "sticker", "parking", "pass"],
    category: "Student Services",
    response: "Vehicle stickers can be requested at the Student Affairs Department (SAD) Cafeteria left wing 1st floor after submitting copies of vehicle sticker form, MyKad Identity Number (IC), student ID card and valid driving license."
  },
  {
    id: "kb-109",
    intent: "PTPTN",
    question: "Where do I apply for PTPTN loan or related loans?",
    examples: [
      "How do I apply for PTPTN?",
      "Where can I apply for a PTPTN loan?"
    ],
    entities: { subject: ["ptptn", "loan"] },
    negativeKeywords: ["scholarship"],
    keywords: ["scholarship", "ptptn", "mied loan", "loan", "financial", "aid", "funding"],
    category: "Student Services",
    response: "PTPTN loan processing and university scholarship applications are handled by the Finance Department (Location: Admin Block, 3rd Floor). Students can also apply for PTPTN loans online via https://www.ptptn.gov.my."
  },
  {
    id: "kb-113",
    intent: "SCHOLARSHIP",
    question: "How do I apply for AIMST scholarships?",
    examples: [
      "How do I apply for scholarship?",
      "Where can I get scholarship information?",
      "What scholarships are available?"
    ],
    entities: { subject: ["scholarship"] },
    negativeKeywords: ["ptptn", "loan"],
    keywords: ["scholarship", "financial", "aid", "funding", "rebate", "merit"],
    category: "Scholarship",
    response: "A variety of scholarships are available for AIMST University students, including Merit Scholarships, Need-Based Aid, and Faculty Rebates. For details and application guidance, please visit the AIMST Finance Department (Admin Block, 3rd Floor)."
  },
  {
    id: "kb-110",
    intent: "LIBRARY_HOURS",
    question: "What are the Aimst Library operating hours?",
    examples: [
      "When does the library open?",
      "What are the library hours?",
      "Is the library open Saturday?",
      "libary timing"
    ],
    entities: { subject: ["library"], property: ["hours", "open", "close", "timing", "time"] },
    negativeKeywords: ["study area"],
    keywords: ["library", "hours", "timing", "open", "close", "weekend"],
    category: "Student Services",
    response: "Library hours: Mon–Fri 8:00 AM – 10:00 PM, Sat 9:00 AM – 6:00 PM. Sun & Public Holidays: Closed."
  },
  {
    id: "kb-111",
    intent: "COURSE_REGISTRATION",
    question: "How do I register for courses for the new semester?",
    examples: [
      "How do I register my subjects?",
      "When can I register courses?",
      "How do I enroll for next semester?"
    ],
    entities: { subject: ["course", "subject", "semester"], action: ["register", "enroll"] },
    negativeKeywords: [],
    keywords: ["course", "registration", "enroll", "register", "subject", "enrollment"],
    category: "Academic",
    response: "Course registration opens 3 weeks before the new semester on the Student Portal or assigned Whatsapp Group. Please consult your Course Coordinator prior to finalizing your registration."
  },
  {
    id: "kb-112",
    intent: "SAD_CONTACT",
    question: "How to contact information for Student Affairs Department (SAD)?",
    examples: [
      "How do I contact SAD?",
      "Where is Student Affairs?",
      "What is the SAD phone number?"
    ],
    entities: { subject: ["sad", "student affairs"], property: ["contact", "where", "phone", "number"] },
    negativeKeywords: [],
    keywords: ["contact", "sad", "student", "affair", "phone", "email", "location"],
    category: "Student Services",
    response: "Student Affairs Department (SAD): Block A, AIMST Campus, Semeling, 08100 Bedong, Kedah. Email: studentaffairs@aimst.edu.my | Tel: +60 4-429 8000."
  },
  {
    id: "kb-114",
    intent: "STUDY_AREA_HOURS",
    question: "What are the Study Area operating hours?",
    examples: [
      "What time is the study area open?",
      "When can I use the study area?",
      "study area hours"
    ],
    entities: { subject: ["study area"], property: ["hours", "open", "timing", "time"] },
    negativeKeywords: ["library"],
    keywords: ["study area", "hours", "timing", "open", "close", "weekend", "Saturday", "Sunday"],
    category: "Study Area",
    response: "All day 7:00 AM – 12:00 AM (Midnight) study areas are open in AIMST University. During public holidays, study area is closed."
  },
  {
    id: "kb-118",
    intent: "FACILITIES",
    question: "What are the facilities available in AIMST University?",
    examples: [
      "What facilities are in AIMST?",
      "Does AIMST have a sports complex?",
      "Tell me about campus facilities."
    ],
    entities: { subject: ["facilities", "sports", "gym", "lab"] },
    negativeKeywords: [],
    keywords: ["facilities", "hours", "places", "open", "close", "weekend", "gym", "badminton", "tennis", "swimming", "basketball"],
    category: "Facilities",
    response: "AIMST University features comprehensive facilities including Central Library, Dental Library, Lecture Halls, Tutorial rooms, Student Common Area, Cafeteria, Sports Complex (Gym, Swimming pool, Badminton, Tennis, Basketball, Netball, Squash, Table Tennis)."
  },
  {
    id: "kb-119",
    intent: "CLINIC",
    question: "Where is the AIMST Student Health Clinic and what are the operating hours?",
    examples: [
      "Is there a clinic on campus?",
      "What are the clinic hours?",
      "Where do I go if I am sick?"
    ],
    entities: { subject: ["clinic", "doctor", "health"] },
    negativeKeywords: [],
    keywords: ["clinic", "health", "doctor", "medical", "sick", "first aid", "hospital", "hours"],
    category: "Clinic",
    response: "The AIMST Student Health Clinic is located at the Student Center Ground Floor. Operating hours: Mon–Fri 8:30 AM – 5:00 PM. Provides basic outpatient consultation and emergency first aid for registered students."
  },
  {
    id: "kb-120",
    intent: "CAFETERIA",
    question: "What are the cafeteria operating hours and food choices?",
    examples: [
      "When does the cafeteria open?",
      "What food is available in campus cafeteria?",
      "cafeteria timing"
    ],
    entities: { subject: ["cafeteria", "food", "canteen"] },
    negativeKeywords: [],
    keywords: ["cafeteria", "canteen", "food", "dining", "eating", "lunch", "breakfast", "halal", "vegetarian"],
    category: "Cafeteria",
    response: "The AIMST Student Cafeteria is located at Student Center Level 1 & Level 2. Operating hours: Mon–Sat 7:00 AM – 9:00 PM. Offers Halal, Indian, Chinese, Western, and Vegetarian food stalls."
  },
  {
    id: "kb-121",
    intent: "CAMPUS_MAP",
    question: "Where is the AIMST University Campus Map or block locations?",
    examples: [
      "Where is Block A?",
      "Where is Block C?",
      "Where are the blocks located?",
      "Can I see the campus map?",
      "Where is SAD office located?"
    ],
    entities: { subject: ["map", "location", "block"] },
    negativeKeywords: [],
    keywords: ["map", "location", "block", "blocks", "campus map", "direction", "building"],
    category: "Facilities",
    response: "<div style='margin-bottom:0.75rem; border-radius:8px; overflow:hidden; border:1px solid rgba(2,132,199,0.3);'><img src='assets/campus_map.png' alt='AIMST Campus Map' style='width:100%; max-height:200px; object-fit:cover; display:block; cursor:pointer;' onclick='window.openCampusMapModal()' title='Click to enlarge map' /></div>Here is the official <strong>AIMST University Campus Layout & Block Directory</strong>.<br/><br/>📍 <strong>Key Locations:</strong><br/>• <strong>1. Admin Block:</strong> Finance, Exam, Marketing, IT, HR<br/>• <strong>2. Library & Study Area:</strong> Library, Nursing & Physio Labs<br/>• <strong>3. Faculty Of Dentistry:</strong> Clinics & Labs<br/>• <strong>4. FBM & FAHP:</strong> Business & Allied Health<br/>• <strong>5. Medicine, Pharmacy, Science:</strong> Anatomy & Science Labs<br/>• <strong>6. Cafeteria:</strong> Student Affairs (SAD)<br/>• <strong>7-12. Hostels:</strong> Jerai, Keriang, Teratai, Anggerik, Bunga Raya, Staff<br/>• <strong>13. Sport Complex</strong><br/><br/><button class='pill-btn open-map-btn' onclick='window.openCampusMapModal()' style='background:#0284c7; color:#fff; padding:0.5rem 1rem; border-radius:6px; font-weight:600; cursor:pointer;'><i class='fas fa-map-marked-alt'></i> View Interactive AIMST Campus Map</button>"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_KNOWLEDGE_BASE };
}
