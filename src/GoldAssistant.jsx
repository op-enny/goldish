import React, { useState, useRef } from 'react';

// ============================================
// CONFIGURATION - Reads from .env file
// ============================================
// For Vite: use import.meta.env.VITE_*
// For Create React App: use process.env.REACT_APP_*
// For Next.js: use process.env.NEXT_PUBLIC_*

const CONFIG = {
  // Toggle between real API and mock data
  USE_REAL_API: import.meta.env.VITE_USE_REAL_API === 'true',

  // OpenAI API Key from .env
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',

  // Model selection - GPT-4.1-mini recommended for best price/performance
  MODEL: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1-mini',

  // OpenAI API endpoint
  API_URL: 'https://api.openai.com/v1/chat/completions'
};

// Debug: Log config on load (remove in production)
console.log('🔧 Config:', {
  USE_REAL_API: CONFIG.USE_REAL_API,
  MODEL: CONFIG.MODEL,
  API_KEY_SET: !!CONFIG.OPENAI_API_KEY
});

// ============================================
// OPENAI VISION PROMPT - Optimized for Jewelry Analysis
// ============================================
const getAnalysisPrompt = (lang, includeStory) => `You are an expert jewelry analyst specializing in gold jewelry assessment.
Analyze this jewelry image and provide detailed pre-information.

CRITICAL RULES:
1. All estimates are NON-BINDING and for informational purposes only
2. NEVER provide exact prices or monetary valuations
3. Use ranges for weight estimates (e.g., "4.2-5.1 grams")
4. Always indicate uncertainty with phrases like "approximately", "estimated", "appears to be"
5. Use professional, neutral, consultative language
6. If uncertain about something, say "unclear" or "cannot determine from image"
7. **CRITICAL: All string values in the JSON response MUST be in ${lang}. Only the keys must remain in English.**
8. Translate technical terms (like 'Diamond', 'Round brilliant', 'Prong') to ${lang}.

DISTINGUISHING WHITE METALS (Important):
- White Gold vs Silver vs Platinum: These look very similar in photos. Look for clues:
  * Hallmarks: 750/585/375 = Gold, 925 = Silver, 950 = Platinum
  * Craftsmanship: Fine jewelry with diamonds usually uses white gold or platinum, rarely silver
  * Design complexity: Intricate designs with gemstones suggest gold/platinum
  * Rhodium plating: Bright white shine often indicates white gold with rhodium
  * If metal type is uncertain between white gold and silver, state BOTH possibilities with reasoning
- Yellow Gold is easier to identify by its warm color
- Rose Gold has a pinkish hue

${includeStory ? `STORY GENERATION (OPTIONAL OPT-IN ACTIVE):
- Write a short, fictional story about the *spirit* or *style* of this jewelry.
- **CRITICAL:** DO NOT claim it is centuries old or ancient. Instead, describe how its design *reminds* us of a certain era or captures a subtle nostalgia.
- Each time, choose a DIFFERENT style from this list:
  1) Mini anecdote (everyday moment)
  2) Craft/atelier vignette (human touch, making)
  3) Quiet city scene (modern life, subtle glow)
  4) Poetic micro-image (gentle metaphor, not heavy)
- Keep it natural and human. Avoid AI-like phrasing or overly dramatic language.
- Avoid cliches: "melancholic", "vintage soul", "timeless", "whispers", "centuries", "destiny".
- Include 1 concrete detail (e.g., "a thin milgrain edge", "a soft scratch", "warm yellow tone").
- Max 200 characters.
- "story" field in JSON must contain this text.` : ''}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):

{
  "basic": {
    "category": "Ring/Necklace/Bracelet/Earrings/Pendant/Brooch/Watch/Other",
    "metalColor": "Yellow Gold/White Gold/Rose Gold/Two-tone/Platinum/Silver/Unknown",
    "estimatedPurity": "Estimated karat with confidence (e.g., '18K (750) - high confidence' or '14K-18K range')",
    "estimatedWeight": "Weight range in grams (e.g., '4.2 - 5.1 grams')",
    "condition": "Excellent/Very Good/Good/Fair/Poor with brief note"
  },
  "gemstone": {
    "detected": true or false,
    "stoneType": "Primary stone type or null if none",
    "stoneCut": "Cut style or null",
    "stoneColor": "Color description or null",
    "stoneClarity": "Clarity assessment or null",
    "estimatedCarat": "Carat range or null (e.g., '0.40 - 0.60 ct')",
    "stoneCount": "Description of stones (e.g., '1 center + 12 accent stones') or null",
    "setting": "Setting type (Prong/Bezel/Channel/Pavé/Tension/Invisible) or null"
  },
  "design": {
    "style": "Design style (Classic/Modern/Vintage/Art Deco/Victorian/Minimalist/Bohemian/etc)",
    "era": "Estimated manufacturing period (e.g., 'Modern 2010-2020', 'Vintage 1960s-1970s', 'Antique pre-1920')",
    "origin": "Possible origin/style influence (European/Italian/Turkish/Middle Eastern/Asian/American/Unknown)",
    "craftsmanship": "Quality assessment (Exceptional/High/Good/Average/Basic) with brief note",
    "pattern": "Notable design elements or patterns"
  },
  "technical": {
    "hallmarkVisible": "Yes/No/Partially with details if visible (e.g., 'Yes - 750 stamp visible')",
    "widthThickness": "Estimated dimensions if determinable (e.g., 'Band width: ~2.5mm')",
    "specialFeatures": "Any notable features (filigree, engraving, milgrain, etc)"
  },
  "story": ${includeStory ? '"The fictional story text in ' + lang + ' (max 200 chars)"' : 'null'},
  "confidenceScore": 75
}

The confidenceScore should be 0-100 based on image quality and analysis certainty.`;

// ============================================
// TRANSLATIONS - DE, TR, AR
// ============================================
const translations = {
  de: {
    welcome: "Willkommen",
    subtitle: "Digitale Vor-Information für Ihren Goldschmuck",
    selectLanguage: "Sprache wählen",
    continue: "Weiter",
    back: "Zurück",
    importantNote: "Wichtiger Hinweis",
    disclaimer1: "Diese App bietet ausschließlich visuelle Vor-Informationen.",
    disclaimer2: "Alle Angaben sind KI-basierte Schätzungen und unverbindlich.",
    disclaimer3: "Die endgültige Bewertung erfolgt nur im Geschäft.",
    understood: "Verstanden",
    uploadTitle: "Foto hochladen",
    uploadSubtitle: "Machen Sie ein Foto oder wählen Sie aus der Galerie",
    takePhoto: "Foto aufnehmen",
    chooseGallery: "Aus Galerie wählen",
    analyzing: "Analysiere Ihr Schmuckstück...",
    analyzingSteps: [
      "Bildqualität wird geprüft...",
      "Metallanalyse läuft...",
      "Edelsteine werden erkannt...",
      "Designmerkmale werden analysiert...",
      "Bericht wird erstellt..."
    ],
    result: "Detaillierte Vor-Information",
    resultDisclaimer: "KI-basierte Schätzung • Unverbindlich",
    basicInfo: "Grundinformationen",
    category: "Kategorie",
    metalColor: "Metallfarbe",
    estimatedPurity: "Geschätzte Reinheit",
    estimatedWeight: "Geschätztes Gewicht",
    condition: "Zustand",
    gemstoneAnalysis: "Edelstein-Analyse",
    stoneType: "Steinart",
    stoneCut: "Schliff",
    stoneColor: "Farbe",
    stoneClarity: "Reinheit",
    estimatedCarat: "Geschätzte Karat",
    stoneCount: "Anzahl der Steine",
    setting: "Fassung",
    designAnalysis: "Design & Stil",
    designStyle: "Designstil",
    era: "Geschätzte Epoche",
    origin: "Mögliche Herkunft",
    craftsmanship: "Handwerkskunst",
    pattern: "Muster/Motiv",
    technicalDetails: "Technische Details",
    hallmarkVisible: "Punze sichtbar",
    widthThickness: "Breite/Stärke",
    specialFeatures: "Besonderheiten",
    goldPrices: "Aktuelle Goldpreise",
    priceDisclaimer: "Diese Preise dienen nur zur allgemeinen Information.",
    bookAppointment: "Termin vereinbaren",
    bookSubtitle: "Besuchen Sie uns für eine professionelle Bewertung",
    selectDate: "Datum wählen",
    selectTime: "Uhrzeit wählen",
    confirmBooking: "Termin bestätigen",
    bookingConfirmed: "Termin bestätigt!",
    seeYouSoon: "Wir freuen uns auf Ihren Besuch",
    addToCalendar: "Zum Kalender hinzufügen",
    startOver: "Neu starten",
    perGram: "pro Gramm",
    finalNote: "Die endgültige Bewertung ist nur im Geschäft möglich.",
    viewFullReport: "Vollständigen Bericht anzeigen",
    hideDetails: "Details ausblenden",
    aiConfidence: "KI-Zuverlässigkeit",
    analysisError: "Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.",
    noGemstone: "Keine Edelsteine erkannt",
    poweredBy: "Powered by OpenAI Vision",
    apiNotConfigured: "API nicht konfiguriert. Bitte .env Datei prüfen.",
    retryAnalysis: "Erneut versuchen",
    storyOption: "Eine Geschichte dazu?",
    storyTitle: "Die Geschichte des Schmuckstücks"
  },
  tr: {
    welcome: "Hoş Geldiniz",
    subtitle: "Altın takılarınız için dijital ön bilgilendirme",
    selectLanguage: "Dil Seçin",
    continue: "Devam",
    back: "Geri",
    importantNote: "Önemli Bilgi",
    disclaimer1: "Bu uygulama yalnızca görsel ön bilgi sağlar.",
    disclaimer2: "Tüm bilgiler yapay zeka tahminidir ve bağlayıcı değildir.",
    disclaimer3: "Kesin değerlendirme yalnızca mağazada yapılır.",
    understood: "Anladım",
    uploadTitle: "Fotoğraf Yükle",
    uploadSubtitle: "Fotoğraf çekin veya galeriden seçin",
    takePhoto: "Fotoğraf Çek",
    chooseGallery: "Galeriden Seç",
    analyzing: "Takınız analiz ediliyor...",
    analyzingSteps: [
      "Görüntü kalitesi kontrol ediliyor...",
      "Metal analizi yapılıyor...",
      "Değerli taşlar tespit ediliyor...",
      "Tasarım özellikleri inceleniyor...",
      "Rapor hazırlanıyor..."
    ],
    result: "Detaylı Ön Bilgilendirme",
    resultDisclaimer: "Yapay zeka tahmini • Bağlayıcı değildir",
    basicInfo: "Temel Bilgiler",
    category: "Kategori",
    metalColor: "Metal Rengi",
    estimatedPurity: "Tahmini Ayar",
    estimatedWeight: "Tahmini Ağırlık",
    condition: "Durum",
    gemstoneAnalysis: "Değerli Taş Analizi",
    stoneType: "Taş Türü",
    stoneCut: "Kesim",
    stoneColor: "Renk",
    stoneClarity: "Berraklık",
    estimatedCarat: "Tahmini Karat",
    stoneCount: "Taş Sayısı",
    setting: "Yuva Tipi",
    designAnalysis: "Tasarım ve Stil",
    designStyle: "Tasarım Stili",
    era: "Tahmini Dönem",
    origin: "Olası Menşei",
    craftsmanship: "İşçilik Kalitesi",
    pattern: "Desen/Motif",
    technicalDetails: "Teknik Detaylar",
    hallmarkVisible: "Ayar Damgası",
    widthThickness: "Genişlik/Kalınlık",
    specialFeatures: "Özel Özellikler",
    goldPrices: "Güncel Altın Fiyatları",
    priceDisclaimer: "Bu fiyatlar yalnızca genel bilgi amaçlıdır.",
    bookAppointment: "Randevu Al",
    bookSubtitle: "Profesyonel değerlendirme için bizi ziyaret edin",
    selectDate: "Tarih Seçin",
    selectTime: "Saat Seçin",
    confirmBooking: "Randevuyu Onayla",
    bookingConfirmed: "Randevu Onaylandı!",
    seeYouSoon: "Ziyaretinizi bekliyoruz",
    addToCalendar: "Takvime Ekle",
    startOver: "Yeniden Başla",
    perGram: "gram başına",
    finalNote: "Kesin değerlendirme yalnızca mağazada yapılabilir.",
    viewFullReport: "Tam Raporu Görüntüle",
    hideDetails: "Detayları Gizle",
    aiConfidence: "AI Güvenilirlik",
    analysisError: "Analiz başarısız. Lütfen tekrar deneyin.",
    noGemstone: "Değerli taş tespit edilmedi",
    poweredBy: "OpenAI Vision ile çalışır",
    apiNotConfigured: "API yapılandırılmamış. Lütfen .env dosyasını kontrol edin.",
    retryAnalysis: "Tekrar Dene",
    storyOption: "Hikayesini de duymak ister misiniz?",
    storyTitle: "Bu Parçanın Hikayesi"
  },
  ar: {
    welcome: "مرحباً",
    subtitle: "معلومات أولية رقمية لمجوهراتك الذهبية",
    selectLanguage: "اختر اللغة",
    continue: "متابعة",
    back: "رجوع",
    importantNote: "ملاحظة مهمة",
    disclaimer1: "هذا التطبيق يقدم معلومات مرئية أولية فقط.",
    disclaimer2: "جميع البيانات تقديرات ذكاء اصطناعي وغير ملزمة.",
    disclaimer3: "التقييم النهائي يتم فقط في المتجر.",
    understood: "فهمت",
    uploadTitle: "تحميل صورة",
    uploadSubtitle: "التقط صورة أو اختر من المعرض",
    takePhoto: "التقاط صورة",
    chooseGallery: "اختر من المعرض",
    analyzing: "جاري تحليل مجوهراتك...",
    analyzingSteps: [
      "جاري فحص جودة الصورة...",
      "جاري تحليل المعدن...",
      "جاري اكتشاف الأحجار الكريمة...",
      "جاري تحليل ميزات التصميم...",
      "جاري إعداد التقرير..."
    ],
    result: "معلومات أولية مفصلة",
    resultDisclaimer: "تقدير بالذكاء الاصطناعي • غير ملزم",
    basicInfo: "المعلومات الأساسية",
    category: "الفئة",
    metalColor: "لون المعدن",
    estimatedPurity: "النقاء المقدر",
    estimatedWeight: "الوزن المقدر",
    condition: "الحالة",
    gemstoneAnalysis: "تحليل الأحجار الكريمة",
    stoneType: "نوع الحجر",
    stoneCut: "القطع",
    stoneColor: "اللون",
    stoneClarity: "النقاء",
    estimatedCarat: "القيراط المقدر",
    stoneCount: "عدد الأحجار",
    setting: "نوع الإعداد",
    designAnalysis: "التصميم والأسلوب",
    designStyle: "أسلوب التصميم",
    era: "الحقبة المقدرة",
    origin: "المنشأ المحتمل",
    craftsmanship: "جودة الصنعة",
    pattern: "النمط/الزخرفة",
    technicalDetails: "التفاصيل التقنية",
    hallmarkVisible: "الدمغة مرئية",
    widthThickness: "العرض/السماكة",
    specialFeatures: "ميزات خاصة",
    goldPrices: "أسعار الذهب الحالية",
    priceDisclaimer: "هذه الأسعار للمعلومات العامة فقط.",
    bookAppointment: "حجز موعد",
    bookSubtitle: "زورونا للحصول على تقييم احترافي",
    selectDate: "اختر التاريخ",
    selectTime: "اختر الوقت",
    confirmBooking: "تأكيد الموعد",
    bookingConfirmed: "تم تأكيد الموعد!",
    seeYouSoon: "نتطلع لزيارتكم",
    addToCalendar: "إضافة إلى التقويم",
    startOver: "البدء من جديد",
    perGram: "للجرام",
    finalNote: "التقييم النهائي ممكن فقط في المتجر.",
    viewFullReport: "عرض التقرير الكامل",
    hideDetails: "إخفاء التفاصيل",
    aiConfidence: "موثوقية AI",
    analysisError: "فشل التحليل. يرجى المحاولة مرة أخرى.",
    noGemstone: "لم يتم اكتشاف أحجار كريمة",
    poweredBy: "يعمل بواسطة OpenAI Vision",
    apiNotConfigured: "API غير مهيأ. يرجى التحقق من ملف .env",
    retryAnalysis: "حاول مرة أخرى",
    storyOption: "هل تود سماع قصتها؟",
    storyTitle: "قصة المجوهرات"
  }
};

// ============================================
// MOCK DATA - Used when API is disabled
// ============================================
const getMockAnalysis = () => ({
  basic: {
    category: "Ring",
    metalColor: "Yellow Gold",
    estimatedPurity: "18 Karat (750) - high confidence",
    estimatedWeight: "4.2 - 5.1 grams",
    condition: "Very Good - minimal wear"
  },
  gemstone: {
    detected: true,
    stoneType: "Diamond (probable)",
    stoneCut: "Brilliant Round",
    stoneColor: "Near colorless (G-H range)",
    stoneClarity: "Eye-clean (estimated VS-SI)",
    estimatedCarat: "0.40 - 0.60 ct",
    stoneCount: "1 center stone + 12 accent stones",
    setting: "6-prong with pavé band"
  },
  design: {
    style: "Classic Solitaire with Halo",
    era: "Modern (2010-2020)",
    origin: "European craftsmanship",
    craftsmanship: "High - precise stone alignment",
    pattern: "Halo design with milgrain details"
  },
  technical: {
    hallmarkVisible: "Yes - 750 stamp visible inside band",
    widthThickness: "Band width: ~2.5mm, Height: ~7mm",
    specialFeatures: "Milgrain edge detail on band"
  },
  story: "This ring likely witnessed a secret 1970s romance in Istanbul. Its sparkle carries the melancholic joy of a love that dared to defy tradition, reminding you that true beauty acts as a bridge between hearts.",
  confidenceScore: 87
});

// ============================================
// OPENAI API FUNCTION
// ============================================
const analyzeWithOpenAI = async (base64Image, lang, includeStory) => {
  // Check if using mock data
  if (!CONFIG.USE_REAL_API) {
    console.log('📦 Using mock data (USE_REAL_API=false)');
    await new Promise(resolve => setTimeout(resolve, 3500));
    const mock = getMockAnalysis();
    if (!includeStory) mock.story = null;
    return mock;
  }

  // Check if API key is configured
  if (!CONFIG.OPENAI_API_KEY) {
    throw new Error('API_KEY_NOT_CONFIGURED');
  }

  console.log('🚀 Calling OpenAI API with model:', CONFIG.MODEL);

  try {
    const prompt = getAnalysisPrompt(lang, includeStory);
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                  detail: 'auto'
                }
              }
            ]
          }
        ],
        max_tokens: 1200,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(`API_ERROR_${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response received');

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('EMPTY_RESPONSE');
    }

    // Parse JSON response
    const analysis = JSON.parse(content);
    console.log('📊 Analysis complete, confidence:', analysis.confidenceScore);

    return analysis;

  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    throw error;
  }
};

// ============================================
// GOLD PRICES DATA
// ============================================
const goldPrices = [
  { karat: "8K (333)", price: "17.20" },
  { karat: "14K (585)", price: "38.50" },
  { karat: "18K (750)", price: "49.20" },
  { karat: "21K (875)", price: "57.40" },
  { karat: "22K (916)", price: "60.10" },
  { karat: "24K (999)", price: "65.80" }
];

const availableTimes = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

// ============================================
// MAIN COMPONENT
// ============================================
export default function GoldAssistant() {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState('tr');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [fadeIn, setFadeIn] = useState(true);
  const [showFullReport, setShowFullReport] = useState(false);
  const [includeStory, setIncludeStory] = useState(false);
  const fileInputRef = useRef(null);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // Helper functions
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0) dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      lang === 'de' ? 'de-DE' : lang === 'tr' ? 'tr-TR' : 'ar-SA',
      { weekday: 'short', day: 'numeric', month: 'short' }
    );
  };

  const handleTransition = (newStep) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(newStep);
      setFadeIn(true);
    }, 300);
  };

  // Image selection and analysis
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target.result;
      setSelectedImage(base64Image);
      setIsAnalyzing(true);
      setAnalyzingStep(0);
      setAnalysisError(null);

      // Progress animation
      const steps = t.analyzingSteps.length;
      let currentStep = 0;
      const progressInterval = setInterval(() => {
        currentStep++;
        setAnalyzingStep(currentStep);
        if (currentStep >= steps - 1) {
          clearInterval(progressInterval);
        }
      }, 700);

      try {
        // Call OpenAI API
        const result = await analyzeWithOpenAI(base64Image, lang, includeStory);
        setAnalysisResult(result);

        clearInterval(progressInterval);
        setAnalyzingStep(steps);

        setTimeout(() => {
          setIsAnalyzing(false);
          handleTransition(4);
        }, 500);

      } catch (error) {
        clearInterval(progressInterval);
        setIsAnalyzing(false);

        if (error.message === 'API_KEY_NOT_CONFIGURED') {
          setAnalysisError(t.apiNotConfigured);
        } else {
          setAnalysisError(t.analysisError);
        }
        handleTransition(2);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetApp = () => {
    setSelectedImage(null);
    setSelectedDate('');
    setSelectedTime('');
    setShowFullReport(false);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIncludeStory(false);
    handleTransition(0);
  };

  // Current analysis data
  const analysis = analysisResult || getMockAnalysis();

  // ============================================
  // STYLES - Mobile First
  // ============================================
  const styles = {
    container: {
      minHeight: '100vh',
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2319 50%, #1a1a1a 100%)',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#f8f5f0',
      direction: isRTL ? 'rtl' : 'ltr',
      WebkitOverflowScrolling: 'touch'
    },
    goldGradient: {
      background: 'linear-gradient(135deg, #d4af37 0%, #f9e077 50%, #d4af37 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    goldBorder: {
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '12px',
      background: 'rgba(212, 175, 55, 0.05)',
      backdropFilter: 'blur(10px)'
    },
    button: {
      width: '100%',
      padding: '16px 24px',
      fontSize: '18px',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      fontWeight: '600',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: 'linear-gradient(135deg, #e8c547 0%, #d4af37 100%)',
      color: '#1a1a1a',
      boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
      minHeight: '54px',
      touchAction: 'manipulation',
      letterSpacing: '0.3px'
    },
    secondaryButton: {
      width: '100%',
      padding: '16px 24px',
      fontSize: '18px',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      fontWeight: '600',
      border: '2px solid rgba(232, 197, 71, 0.6)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: 'transparent',
      color: '#e8c547',
      minHeight: '54px',
      touchAction: 'manipulation',
      letterSpacing: '0.3px'
    },
    backButton: {
      position: 'absolute',
      top: '16px',
      left: isRTL ? 'auto' : '16px',
      right: isRTL ? '16px' : 'auto',
      background: 'transparent',
      border: 'none',
      color: '#e8c547',
      fontSize: '17px',
      cursor: 'pointer',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      fontWeight: '500',
      padding: '8px',
      minWidth: '44px',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      touchAction: 'manipulation'
    },
    section: {
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.02) 100%)',
      padding: '16px',
      marginBottom: '12px'
    },
    errorBox: {
      background: 'rgba(220, 53, 69, 0.15)',
      border: '1px solid rgba(220, 53, 69, 0.4)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
      color: '#ff6b6b',
      textAlign: 'center'
    }
  };

  const keyframes = `
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes progressPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 0 rgba(232, 197, 71, 0); } 50% { box-shadow: 0 0 24px rgba(232, 197, 71, 0.35); } }
    @keyframes floatIn { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes progressFill { from { width: 0; } to { width: var(--target-width); } }
    @keyframes snap { 0% { transform: scale(1); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }
    button:hover { transform: translateY(-2px); }
    button:active { transform: translateY(0); }
  `;

  // Font definitions
  const fonts = {
    heading: "'Playfair Display', Georgia, 'Times New Roman', serif",
    body: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  // ============================================
  // SUB-COMPONENTS
  // ============================================
  const AnalysisSection = ({ title, icon, children, delay = 0 }) => (
    <div style={{ ...styles.section, animation: `fadeSlideUp 0.6s ease ${delay}s both` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(232, 197, 71, 0.25)' }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <h3 style={{ fontSize: '19px', fontWeight: '600', color: '#e8c547', margin: 0, fontFamily: fonts.heading }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  const AnalysisRow = ({ label, value, highlight = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(232, 197, 71, 0.12)', gap: '12px' }}>
      <span style={{ color: 'rgba(248, 245, 240, 0.8)', fontSize: '15px', flexShrink: 0, maxWidth: '42%', fontWeight: '400' }}>{label}</span>
      <span style={{ fontSize: '15px', fontWeight: '500', textAlign: isRTL ? 'left' : 'right', color: highlight ? '#e8c547' : '#f8f5f0', wordBreak: 'break-word' }}>
        {value || '-'}
      </span>
    </div>
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={styles.container}>
      <style>{keyframes}</style>

      {/* Progress Bar */}
      {step > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(212, 175, 55, 0.2)', zIndex: 100 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #d4af37, #f9e077)', transition: 'width 0.5s ease', width: `${((step + 1) / 8) * 100}%`, animation: 'fadeSlideDown 0.4s ease' }} />
        </div>
      )}

      <div style={{ maxWidth: '420px', margin: '0 auto', minHeight: '100vh', minHeight: '100dvh', position: 'relative', padding: '16px', paddingBottom: '32px', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.4s ease' }}>

          {/* ==================== STEP 0: Language ==================== */}
          {step === 0 && !isAnalyzing && (
            <div style={{ paddingTop: '24px', textAlign: 'center', animation: 'fadeSlideUp 0.6s ease' }}>
              <div style={{ width: '70px', height: '70px', margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37 0%, #f9e077 50%, #d4af37 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(212, 175, 55, 0.4)', animation: 'pulse 2s ease-in-out infinite' }}>
                <span style={{ fontSize: '32px' }}>💎</span>
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '600', marginBottom: '10px', fontFamily: fonts.heading, ...styles.goldGradient }}>{t.welcome}</h1>
              <p style={{ fontSize: '17px', opacity: 0.85, marginBottom: '32px', padding: '0 8px', lineHeight: '1.5' }}>{t.subtitle}</p>

              <p style={{ opacity: 0.7, fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '500' }}>{t.selectLanguage}</p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
                  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
                  { code: 'ar', flag: '🇸🇦', name: 'العربية' }
                ].map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setLang(language.code)}
                    style={{
                      flex: 1,
                      padding: '14px 8px',
                      fontSize: '16px',
                      fontFamily: fonts.body,
                      border: '2px solid rgba(232, 197, 71, 0.4)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: lang === language.code ? 'linear-gradient(135deg, #e8c547 0%, #d4af37 100%)' : 'rgba(232, 197, 71, 0.1)',
                      color: lang === language.code ? '#1a1a1a' : '#f8f5f0',
                      minHeight: '70px',
                      touchAction: 'manipulation',
                      fontWeight: '500',
                      animation: lang === language.code ? 'snap 0.22s ease' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{language.flag}</div>
                    <div style={{ fontSize: '15px' }}>{language.name}</div>
                  </button>
                ))}
              </div>

              <button onClick={() => handleTransition(1)} style={{ ...styles.button, animation: 'floatIn 0.6s ease 0.2s both' }}>{t.continue}</button>

              <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.5 }}>
                {t.poweredBy} • {CONFIG.MODEL}
              </p>
            </div>
          )}

          {/* ==================== STEP 1: Disclaimer ==================== */}
          {step === 1 && !isAnalyzing && (
            <div style={{ paddingTop: '50px', animation: 'fadeSlideUp 0.6s ease' }}>
              <button onClick={() => handleTransition(0)} style={styles.backButton}>← {t.back}</button>
              <div style={{ ...styles.goldBorder, padding: '24px', marginBottom: '24px', textAlign: 'center', animation: 'floatIn 0.6s ease 0.1s both' }}>
                <div style={{ width: '60px', height: '60px', margin: '0 auto 18px', borderRadius: '50%', border: '2px solid #e8c547', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>ℹ️</div>
                <h2 style={{ fontSize: '26px', marginBottom: '22px', fontWeight: '600', fontFamily: fonts.heading }}>{t.importantNote}</h2>
                <div style={{ textAlign: isRTL ? 'right' : 'left', fontSize: '16px', lineHeight: '1.7' }}>
                  {[t.disclaimer1, t.disclaimer2, t.disclaimer3].map((d, i) => (
                    <p key={i} style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ color: '#e8c547', flexShrink: 0, fontSize: '18px' }}>✓</span>
                      <span style={{ opacity: 0.9 }}>{d}</span>
                    </p>
                  ))}
                </div>
              </div>
              <button onClick={() => handleTransition(2)} style={{ ...styles.button, animation: 'floatIn 0.6s ease 0.25s both' }}>{t.understood}</button>
            </div>
          )}

          {/* ==================== STEP 2: Upload ==================== */}
          {step === 2 && !isAnalyzing && (
            <div style={{ paddingTop: '50px', textAlign: 'center', animation: 'fadeSlideUp 0.6s ease' }}>
              <button onClick={() => handleTransition(1)} style={styles.backButton}>← {t.back}</button>
              <h2 style={{ fontSize: '28px', marginBottom: '10px', fontWeight: '600', fontFamily: fonts.heading }}>{t.uploadTitle}</h2>
              <p style={{ opacity: 0.8, marginBottom: '24px', fontSize: '16px' }}>{t.uploadSubtitle}</p>

              {analysisError && (
                <div style={styles.errorBox}>
                  <p style={{ marginBottom: '12px', fontSize: '16px' }}>{analysisError}</p>
                  <button
                    onClick={() => setAnalysisError(null)}
                    style={{ ...styles.secondaryButton, padding: '12px 20px', fontSize: '16px', width: 'auto', minHeight: '44px' }}
                  >
                    {t.retryAnalysis}
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(232, 197, 71, 0.5)',
                  borderRadius: '16px',
                  padding: '32px 20px',
                  cursor: 'pointer',
                  background: 'linear-gradient(90deg, rgba(232, 197, 71, 0.05), rgba(232, 197, 71, 0.12), rgba(232, 197, 71, 0.05))',
                  backgroundSize: '200% 100%',
                  marginBottom: '16px',
                  transition: 'all 0.2s ease',
                  touchAction: 'manipulation',
                  animation: 'shimmer 3.5s ease-in-out infinite'
                }}
              >
                <div style={{ width: '68px', height: '68px', margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(232, 197, 71, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>📷</div>
                <p style={{ fontSize: '18px', color: '#e8c547', marginBottom: '8px', fontWeight: '500' }}>{t.takePhoto}</p>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>JPG, PNG, WEBP</p>
              </div>

              <div
                onClick={() => setIncludeStory(!includeStory)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  marginBottom: '16px', cursor: 'pointer',
                  background: 'rgba(232, 197, 71, 0.08)', padding: '16px', borderRadius: '10px',
                  minHeight: '52px', touchAction: 'manipulation',
                  border: '1px solid rgba(232, 197, 71, 0.2)'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '4px',
                  border: '2px solid #e8c547',
                  background: includeStory ? '#e8c547' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {includeStory && <span style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '600' }}>✓</span>}
                </div>
                <span style={{ fontSize: '16px', color: includeStory ? '#e8c547' : '#f8f5f0', fontWeight: '500' }}>{t.storyOption}</span>
              </div>

              <button onClick={() => fileInputRef.current?.click()} style={{ ...styles.secondaryButton, animation: 'floatIn 0.6s ease 0.2s both' }}>
                {t.chooseGallery}
              </button>
            </div>
          )}

          {/* ==================== ANALYZING ==================== */}
          {isAnalyzing && (
            <div style={{ paddingTop: '80px', textAlign: 'center', animation: 'fadeSlideUp 0.6s ease' }}>
              {selectedImage && (
                <img src={selectedImage} alt="Uploaded" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '16px', marginBottom: '32px' }} />
              )}
              <div style={{ width: '64px', height: '64px', border: '3px solid rgba(232, 197, 71, 0.25)', borderTop: '3px solid #e8c547', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite, glow 2.4s ease-in-out infinite' }} />
              <p style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '500', fontFamily: fonts.heading }}>{t.analyzing}</p>

              <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                {t.analyzingSteps.map((stepText, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', opacity: i <= analyzingStep ? 1 : 0.4, transition: 'opacity 0.5s ease' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: '600',
                      background: i < analyzingStep ? '#e8c547' : 'transparent',
                      border: i === analyzingStep ? '2px solid #e8c547' : '1px solid rgba(232, 197, 71, 0.4)',
                      color: i < analyzingStep ? '#1a1a1a' : '#e8c547',
                      animation: i === analyzingStep ? 'progressPulse 1s ease infinite' : 'none'
                    }}>
                      {i < analyzingStep ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '15px', textAlign: 'left' }}>{stepText}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== STEP 4: Results ==================== */}
          {step === 4 && !isAnalyzing && (
            <div style={{ paddingTop: '50px', paddingBottom: '20px', animation: 'fadeSlideUp 0.6s ease' }}>
              <button onClick={() => handleTransition(2)} style={styles.backButton}>← {t.back}</button>

              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '26px', marginBottom: '8px', fontWeight: '600', fontFamily: fonts.heading }}>{t.result}</h2>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>{t.resultDisclaimer}</p>
              </div>

              {/* Confidence Score */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>{t.aiConfidence}:</span>
                <div style={{ width: '110px', height: '8px', borderRadius: '4px', background: 'rgba(232, 197, 71, 0.25)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, #e8c547, ${analysis.confidenceScore > 70 ? '#4ade80' : '#f59e0b'})`,
                      width: `${analysis.confidenceScore}%`,
                      '--target-width': `${analysis.confidenceScore}%`,
                      animation: 'progressFill 1s ease'
                    }}
                  />
                </div>
                <span style={{ color: '#e8c547', fontWeight: '600', fontSize: '16px' }}>{analysis.confidenceScore}%</span>
              </div>

              {selectedImage && (
                <img src={selectedImage} alt="Analyzed" style={{ width: '100%', maxHeight: '140px', objectFit: 'contain', borderRadius: '10px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)' }} />
              )}

              {/* Basic Info */}
              <AnalysisSection title={t.basicInfo} icon="📋" delay={0.2}>
                <AnalysisRow label={t.category} value={analysis.basic.category} highlight />
                <AnalysisRow label={t.metalColor} value={analysis.basic.metalColor} />
                <AnalysisRow label={t.estimatedPurity} value={analysis.basic.estimatedPurity} highlight />
                <AnalysisRow label={t.estimatedWeight} value={analysis.basic.estimatedWeight} highlight />
                <AnalysisRow label={t.condition} value={analysis.basic.condition} />
              </AnalysisSection>

              {/* Story Section */}
              {analysis.story && analysis.story !== "null" && analysis.story !== null && (
                <div style={{ ...styles.section, border: '1px solid rgba(232, 197, 71, 0.5)', background: 'rgba(232, 197, 71, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '26px' }}>📜</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#e8c547', margin: 0, fontFamily: fonts.heading }}>{t.storyTitle}</h3>
                  </div>
                  <p style={{ fontStyle: 'italic', lineHeight: '1.7', fontSize: '16px' }}>
                    "{analysis.story}"
                  </p>
                </div>
              )}

              {/* Gemstone */}
              {analysis.gemstone.detected ? (
                <AnalysisSection title={t.gemstoneAnalysis} icon="💎" delay={0.3}>
                  <AnalysisRow label={t.stoneType} value={analysis.gemstone.stoneType} highlight />
                  <AnalysisRow label={t.stoneCut} value={analysis.gemstone.stoneCut} />
                  <AnalysisRow label={t.stoneColor} value={analysis.gemstone.stoneColor} />
                  <AnalysisRow label={t.stoneClarity} value={analysis.gemstone.stoneClarity} />
                  <AnalysisRow label={t.estimatedCarat} value={analysis.gemstone.estimatedCarat} highlight />
                  <AnalysisRow label={t.stoneCount} value={analysis.gemstone.stoneCount} />
                  <AnalysisRow label={t.setting} value={analysis.gemstone.setting} />
                </AnalysisSection>
              ) : (
                <AnalysisSection title={t.gemstoneAnalysis} icon="💎" delay={0.3}>
                  <p style={{ opacity: 0.75, textAlign: 'center', padding: '18px 0', fontSize: '15px' }}>{t.noGemstone}</p>
                </AnalysisSection>
              )}

              {/* Expand Button */}
              <button
                onClick={() => setShowFullReport(!showFullReport)}
                style={{ width: '100%', padding: '16px', marginBottom: '16px', fontSize: '16px', color: '#e8c547', background: 'transparent', border: '2px solid rgba(232, 197, 71, 0.4)', borderRadius: '12px', cursor: 'pointer', fontFamily: fonts.body, fontWeight: '500' }}
              >
                {showFullReport ? t.hideDetails : t.viewFullReport} {showFullReport ? '▲' : '▼'}
              </button>

              {showFullReport && (
                <>
                  <AnalysisSection title={t.designAnalysis} icon="🎨" delay={0}>
                    <AnalysisRow label={t.designStyle} value={analysis.design.style} highlight />
                    <AnalysisRow label={t.era} value={analysis.design.era} highlight />
                    <AnalysisRow label={t.origin} value={analysis.design.origin} />
                    <AnalysisRow label={t.craftsmanship} value={analysis.design.craftsmanship} />
                    <AnalysisRow label={t.pattern} value={analysis.design.pattern} />
                  </AnalysisSection>

                  <AnalysisSection title={t.technicalDetails} icon="🔍" delay={0.1}>
                    <AnalysisRow label={t.hallmarkVisible} value={analysis.technical.hallmarkVisible} />
                    <AnalysisRow label={t.widthThickness} value={analysis.technical.widthThickness} />
                    <AnalysisRow label={t.specialFeatures} value={analysis.technical.specialFeatures} />
                  </AnalysisSection>
                </>
              )}

              <p style={{ fontSize: '13px', opacity: 0.7, textAlign: 'center', marginBottom: '20px', fontStyle: 'italic' }}>⚠️ {t.finalNote}</p>
              <button onClick={() => handleTransition(5)} style={{ ...styles.button, animation: 'floatIn 0.6s ease 0.2s both' }}>{t.continue}</button>
            </div>
          )}

          {/* ==================== STEP 5: Gold Prices ==================== */}
          {step === 5 && !isAnalyzing && (
            <div style={{ paddingTop: '50px', animation: 'fadeSlideUp 0.6s ease' }}>
              <button onClick={() => handleTransition(4)} style={styles.backButton}>← {t.back}</button>
              <h2 style={{ fontSize: '26px', marginBottom: '22px', fontWeight: '600', textAlign: 'center', fontFamily: fonts.heading }}>{t.goldPrices}</h2>

              {goldPrices.map((price, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', marginBottom: '10px', borderRadius: '10px', background: 'rgba(232, 197, 71, 0.1)', border: '1px solid rgba(232, 197, 71, 0.3)', animation: `fadeSlideUp 0.5s ease ${index * 0.06}s both` }}>
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>{price.karat}</span>
                  <span style={{ color: '#e8c547', fontWeight: '600', fontSize: '16px' }}>€{price.price} <span style={{ fontSize: '13px', opacity: 0.8 }}>{t.perGram}</span></span>
                </div>
              ))}

              <p style={{ fontSize: '13px', opacity: 0.7, textAlign: 'center', margin: '16px 0 24px' }}>⚠️ {t.priceDisclaimer}</p>
              <button onClick={() => handleTransition(6)} style={styles.button}>{t.bookAppointment}</button>
            </div>
          )}

          {/* ==================== STEP 6: Booking ==================== */}
          {step === 6 && !isAnalyzing && (
            <div style={{ paddingTop: '50px', animation: 'fadeSlideUp 0.6s ease' }}>
              <button onClick={() => handleTransition(5)} style={styles.backButton}>← {t.back}</button>
              <h2 style={{ fontSize: '26px', marginBottom: '8px', fontWeight: '600', textAlign: 'center', fontFamily: fonts.heading }}>{t.bookAppointment}</h2>
              <p style={{ opacity: 0.8, marginBottom: '24px', fontSize: '15px', textAlign: 'center' }}>{t.bookSubtitle}</p>

              <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '500' }}>{t.selectDate}</p>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '22px', WebkitOverflowScrolling: 'touch' }}>
                {getAvailableDates().map((date) => (
                  <div
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    style={{
                      minWidth: '85px',
                      padding: '14px 12px',
                      textAlign: 'center',
                      border: '2px solid rgba(232, 197, 71, 0.4)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: selectedDate === date ? 'linear-gradient(135deg, #e8c547 0%, #d4af37 100%)' : 'transparent',
                      color: selectedDate === date ? '#1a1a1a' : '#f8f5f0',
                      touchAction: 'manipulation',
                      flexShrink: 0,
                      animation: selectedDate === date ? 'snap 0.22s ease' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: '600' }}>{formatDate(date)}</div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '500' }}>{t.selectTime}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: '14px 8px',
                      fontSize: '17px',
                      fontFamily: fonts.body,
                      fontWeight: '500',
                      border: '2px solid rgba(232, 197, 71, 0.4)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedTime === time ? 'linear-gradient(135deg, #e8c547 0%, #d4af37 100%)' : 'transparent',
                      color: selectedTime === time ? '#1a1a1a' : '#f8f5f0',
                      minHeight: '52px',
                      touchAction: 'manipulation',
                      animation: selectedTime === time ? 'snap 0.22s ease' : 'none'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <button onClick={() => handleTransition(7)} disabled={!selectedDate || !selectedTime} style={{ ...styles.button, opacity: (!selectedDate || !selectedTime) ? 0.5 : 1, cursor: (!selectedDate || !selectedTime) ? 'not-allowed' : 'pointer' }}>
                {t.confirmBooking}
              </button>
            </div>
          )}

          {/* ==================== STEP 7: Confirmation ==================== */}
          {step === 7 && !isAnalyzing && (
            <div style={{ paddingTop: '60px', textAlign: 'center', animation: 'fadeSlideUp 0.6s ease' }}>
              <div style={{ width: '85px', height: '85px', margin: '0 auto 26px', borderRadius: '50%', background: 'linear-gradient(135deg, #e8c547 0%, #f9e077 50%, #d4af37 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', boxShadow: '0 8px 32px rgba(232, 197, 71, 0.45)' }}>✓</div>

              <h2 style={{ fontSize: '28px', marginBottom: '14px', fontWeight: '600', fontFamily: fonts.heading }}>{t.bookingConfirmed}</h2>
              <p style={{ opacity: 0.85, marginBottom: '26px', fontSize: '17px' }}>{t.seeYouSoon}</p>

              <div style={{ ...styles.goldBorder, padding: '22px', marginBottom: '26px' }}>
                <p style={{ fontSize: '14px', opacity: 0.75, marginBottom: '8px' }}>{t.selectDate}</p>
                <p style={{ fontSize: '22px', fontWeight: '600', color: '#e8c547', marginBottom: '16px', fontFamily: fonts.heading }}>{formatDate(selectedDate)} - {selectedTime}</p>
                <p style={{ fontSize: '15px', opacity: 0.85, lineHeight: '1.6' }}>📍 Gold Schmuck GmbH<br />Musterstraße 123, 10115 Berlin</p>
              </div>

              <button style={styles.secondaryButton}>{t.addToCalendar}</button>
              <button onClick={resetApp} style={{ ...styles.secondaryButton, marginTop: '12px', border: 'none', opacity: 0.75 }}>{t.startOver}</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
