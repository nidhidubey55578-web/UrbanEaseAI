import { Language } from "../types"

export const translations: Record<Language, Record<string, string>> = {
  English: {
    // Branding
    appName: "UrbanEase",
    appAi: "AI",
    tagline: "Move Smarter. Move Freely.",
    voiceFirstLabel: "VOICE-FIRST CITY ACCESS",
    prototypeNote: "Interactive Prototype · Simulated City Accessibility Data",
    academicNotice:
      "IDEA LAB-V · Third Year Degree in Computer Engineering · 2026–2027",

    // Splash / Voice-First Entry
    splashPrompt: "Hi! How can I help you with directions?",
    splashReady: "Tap the microphone and speak",
    splashListening: "Listening…",
    splashProcessing: "Processing your request…",
    splashConfirming: "Should I start navigation?",
    splashError: "Microphone listening started",
    splashSkip: "Continue to Interactive Map",
    splashHeard: "I heard",
    splashRouteReady:
      "I selected the most accessible route to {destination}. Should I start navigation?",
    splashStarting: "Starting navigation now.",
    splashShowing: "Showing accessible routes.",
    splashStartNav: "Start navigation",
    splashViewRoutes: "View route first",
    splashTypeAlternative: "Type destination or barrier instead",
    splashTypeSubmit: "Go",
    splashTypePlaceholder: "e.g., Take me to Bandra Station, avoid stairs",

    // Intro Screen
    introBadge: "ACCESSIBILITY-FIRST MOBILITY",
    introHeading: "Move through your city on your terms.",
    introSubheading:
      "AI-powered accessible routes designed around your mobility needs, not just road distances.",
    introGetStarted: "Get Started",
    introSkip: "Skip to sign in",
    stepFree: "Step-free",
    accessibleScore: "accessible",

    // Onboarding
    onboardSkip: "Skip",
    onboardNext: "Next",
    onboardBack: "Back",
    onboardFinish: "Choose Experience",
    slide1Kicker: "PERSONALIZED MOBILITY",
    slide1Title: "Personalized accessible routes",
    slide1Text:
      "Routes shaped around how you move—not only distance and time. Filter by ramps, smooth surfaces, and elevator access.",
    slide2Kicker: "HANDS-FREE CONFIDENCE",
    slide2Title: "Voice-first accessibility",
    slide2Text:
      "Search destinations, receive turn-by-turn spoken guidance, and report urban barriers through conversational voice interactions.",
    slide3Kicker: "LIVE CITY SIGNALS",
    slide3Title: "Real-time accessibility information",
    slide3Text:
      "Know about elevators, curb conditions, transit escalators, and street obstructions before you start your journey.",
    slide4Kicker: "COMMUNITY INTELLIGENCE",
    slide4Title: "AI community reporting",
    slide4Text:
      "Turn local citizen observations into safer, barrier-free urban mobility with automated barrier classification.",

    // Login
    welcomeTitle: "Welcome to UrbanEase AI",
    welcomeSub:
      "Sign in to access your personalized accessible mobility profile.",
    createAccountTitle: "Create your account",
    createAccountSub:
      "Set up secure access to your mobility preferences across devices.",
    resetPasswordTitle: "Reset your password",
    resetPasswordSub:
      "We will send a secure reset link to your registered email address.",
    fullName: "Full name",
    emailAddress: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    agreeTerms: "I agree to the Terms of Use and Privacy Policy",
    show: "Show",
    hide: "Hide",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signInSecurely: "Sign In Securely",
    createAccount: "Create Account",
    sendResetLink: "Send Reset Link",
    newToUrbanEase: "New to UrbanEase AI?",
    alreadyHaveAccount: "Already have an account?",
    createAnAccount: "Create an account",
    backToSignIn: "Back to sign in",
    orContinueWith: "or continue with",
    continueWithGoogle: "Continue with Google",
    continuePresentation: "Continue in Presentation Mode",
    privacyReassurance:
      "Your location and mobility preferences are protected locally on device.",
    validationRequired: "Please enter a valid email and password.",
    validationCreate:
      "Fill all details, ensure a 6-character password matches, and accept terms.",
    validationReset: "Enter a valid email address.",
    simulatedGoogle: "Google sign-in simulated securely in presentation mode.",

    // Experience Selection
    chooseExperience: "Choose your experience",
    chooseExpSubtitle:
      "Select the interaction mode tailored to your needs. You can change this anytime.",
    expStandardTitle: "Standard Experience",
    expStandardDesc:
      "A balanced visual interface with comprehensive accessible maps and route comparisons.",
    expVoiceTitle: "Voice Accessibility Experience",
    expVoiceDesc:
      "High-contrast, large touch targets, and full hands-free voice assistance for blind and low-vision users.",
    expSmartTitle: "Smart Mobility Experience",
    expSmartDesc:
      "Real-time IoT sensors, public transit accessibility status, and smart city intelligence.",
    recommended: "Recommended",
    continueSetup: "Continue Setup",

    // Accessibility Setup
    mobilityProfileTitle: "Your mobility profile",
    howPreferMove: "How do you prefer to move?",
    selectPreferencesSub:
      "Select everything that helps us plan a safer, more comfortable journey for you.",
    saveAccessibilityProfile: "Save Accessibility Profile",
    preferencesPrivateNote:
      "Your preferences stay strictly on your device and are used only to tailor route recommendations.",

    // Voice Setup
    voiceSetupTitle: "Voice accessibility setup",
    voiceSetupKicker: "PROFILE CREATED FROM YOUR ANSWERS",
    readyToMove: "You're ready to move freely.",
    speakAgain: "Speak again",
    editAnswers: "Edit answers",
    doneEditing: "Done editing",
    saveProfile: "Save Profile",

    // Navigation / Bottom Bar
    navHome: "Home",
    navExplore: "Explore",
    navReport: "Report",
    navSaved: "Saved",
    navProfile: "Profile",
    navVoiceBtn: "Voice",
    speakPromptTooltip: "Speak a destination or accessibility problem",

    // Home Dashboard
    goodMorning: "Good morning",
    demoUser: "Nidhi Dubey",
    locationLabel: "Bandra West, Mumbai (Demo Location)",
    updateLocation: "Update GPS",
    searchPlaceholder: "Where would you like to go?",
    profileBannerTitle: "Personalized routes active",
    quickActions: "Quick actions",
    planRoute: "Plan route",
    voiceAssistant: "Voice assistant",
    reportBarrier: "Report barrier",
    exploreNearby: "Explore nearby",
    savedRoutes: "Saved routes",
    savedPlaces: "Saved places",
    liveCityAccessibility: "Live city accessibility",
    mostlyAccessible: "Mostly accessible nearby",
    updatedMinsAgo: "Updated 2 min ago",
    accessibleLifts: "Accessible lifts",
    activeBarriers: "Active barriers",
    areaScore: "Area score",
    accessibilityScoreSummary: "Accessibility score summary",
    tenFactors: "10 urban factors",
    stepFreeAccess: "Step-free access",
    rampsAndSlope: "Ramps & slope",
    surfaceQuality: "Surface quality",
    accessibleTransport: "Accessible transport",
    barrierConfidence: "Barrier confidence",
    recentRoute: "Recent route",
    viewSaved: "View saved",
    seeAll: "See all",
    nearbyPlaces: "Nearby accessible places",
    reportedBarriersNearby: "reported barriers nearby",
    nearestBarrierDist: "1 high · 1 medium · nearest barrier 120 m away",

    // Voice Assistant Screen
    voiceAssistantTitle: "UrbanEase Voice Assistant",
    stateReady: "Ready",
    stateListening: "Listening…",
    stateProcessing: "Understanding your request…",
    stateError: "Microphone unavailable. Type instead.",
    tapMicToBegin: "Tap the microphone to speak naturally",
    speakNaturally: "Speak naturally in English, Hindi, or Marathi",
    viewRoutes: "View routes",
    hearAgain: "Hear again",
    typeInstead: "Type instead",
    typeCommandPlaceholder: "Type a navigation or barrier command…",
    send: "Send",
    tryACommand: "Try a spoken command",

    // Route Planner
    planAccessibleRoute: "Plan an accessible route",
    startingPoint: "STARTING POINT",
    destination: "DESTINATION",
    swapLocations: "Swap starting point and destination",
    date: "DATE",
    time: "TIME",
    travelMode: "Travel mode",
    modeWalking: "Walking",
    modeTransit: "Public transit",
    modeMixed: "Mixed mode",
    profileSynced: "Profile synced",
    avoidStairs: "Avoid stairs",
    lowWalking: "Low walking",
    voiceGuidance: "Voice guidance",
    spokenAlerts: "Spoken alerts",
    wheelchairFriendly: "Wheelchair friendly",
    elderFriendly: "Elder friendly",
    visualAssistance: "Visual assistance",
    hearingAssistance: "Hearing assistance",
    stepFreeTransport: "Step-free transport",
    aiPrioritizeNote:
      "UrbanEase AI prioritizes safety and physical accessibility over standard distance.",
    findAccessibleRoute: "Find Accessible Route",
    clearRoute: "Clear inputs",

    // Route Results & Cards
    accessibleRoutes: "Accessible routes",
    currentLocation: "Current location",
    rankedFor:
      "Ranked for: step-free access, gentle slope, audio crossings, and verified tactile sidewalks.",
    routeA: "Route A · Most accessible",
    routeB: "Route B · Fastest",
    routeC: "Route C · Balanced",
    travelTime: "Travel time",
    distance: "Distance",
    stairsCount: "Stairs",
    viewRoute: "View route",
    compare: "Compare",
    startNavigation: "Start navigation",
    stairsWarning: "Some stairs on this route",
    routeSavedSuccess: "Route saved to your offline accessible routes",

    // Route Comparison
    compareRoutesTitle: "Compare routes",
    compareSubtitle:
      "Compare accessibility metrics side by side to pick the best path for your travel.",
    metricFactor: "FACTOR",
    chooseRoute: "Choose Route",

    // Route Details
    routeAccessibilityPoints: "Route accessibility landmarks",
    verifiedStatus: "Verified live",
    startJourney: "Start journey",
    saveRouteBtn: "Save route",
    reportProblem: "Report barrier on route",
    shareRoute: "Share route",

    // Active Journey
    navigatingTitle: "NAVIGATING · ROUTE",
    endJourneyPrompt: "End journey navigation?",
    endJourneyText: "Your active turn-by-turn guidance will be stopped.",
    endJourneyConfirm: "End journey",
    nextInstruction: "NEXT INSTRUCTION",
    remaining: "Remaining",
    progress: "Progress",
    accessibilityAlertTitle: "ACCESSIBILITY ALERT",
    alertDescription:
      "Temporary sidewalk obstruction reported 120 metres ahead.",
    repeat: "Repeat",
    pause: "Pause",
    resume: "Resume",
    mute: "Mute",
    unmute: "Unmute",
    recalculate: "Recalculate",
    report: "Report",
    alternateRouteApplied:
      "Accessible alternate route applied. Avoiding obstruction.",

    // Explore Accessible Places
    explorePlacesTitle: "Explore accessible places",
    searchPlacesPlaceholder: "Search accessible places, stations, parks…",
    nearMe: "Near me · 2 km",
    listView: "List",
    mapView: "Map",

    // Place Details
    placeDetailsTitle: "Place details",
    accessibilityFacilities: "Accessibility facilities",
    voiceDirections: "Voice directions",
    savePlace: "Save place",
    placeSavedSuccess: "Place saved to your accessible places",

    // Report Barrier Flow
    reportBarrierTitle: "Report an accessibility barrier",
    reportLead:
      "Help fellow citizens navigate safely by reporting broken ramps, blocked sidewalks, or elevator outages.",
    whatDidYouFind: "What barrier did you find?",
    uploadPhoto: "Upload or simulate barrier photo",
    uploadOptional: "Optional · Triggers simulated AI barrier classification",
    locationField: "LOCATION",
    descriptionField: "DESCRIPTION",
    severityField: "Severity",
    severityLow: "Low",
    severityMedium: "Medium",
    severityHigh: "High",
    reviewReport: "Review report",
    aiAnalysisTitle: "AI barrier analysis",
    aiAnalysisNote: "Prototype AI classification · Editable before submission",
    detectedType: "DETECTED BARRIER",
    confidence: "Confidence",
    suggestedAction: "Suggested action",
    confirmAnalysis: "Confirm AI Analysis",
    editReport: "Edit details",
    confirmAndSubmit: "Confirm and submit report",
    reportSuccessTitle: "Report submitted successfully",
    reportSuccessSub:
      "Thank you for contributing to an inclusive, barrier-free smart city.",
    reportIdLabel: "REPORT ID",
    underReviewNote: "Under civic review · Community map alert activated",
    viewHistory: "View report history",
    returnHome: "Return home",

    // Saved Routes & Places
    savedRoutesTitle: "Saved accessible routes",
    savedPlacesTitle: "Saved accessible places",
    routesTab: "Routes",
    placesTab: "Places",
    noSavedRoutes: "No saved routes yet",
    noSavedRoutesSub:
      "Save routes from planner or results to access them quickly offline.",
    noSavedPlaces: "No saved places yet",
    noSavedPlacesSub:
      "Bookmark accessible stations, parks, and hospitals for quick access.",
    deleteSavedPrompt: "Remove from saved?",
    deleteSavedText: "This item will be deleted from your offline saved items.",
    delete: "Delete",
    open: "Open",
    start: "Start",

    // User Profile
    profileTitle: "User Profile",
    profileActiveStatus: "Accessibility Profile Active",
    profileReadiness: "Your mobility profile is 94% optimized",
    profileStats: "9 active preferences · High safety confidence",
    openAnalytics: "Open Smart City Analytics · 1,284 reports",
    viewIotStatus: "View IoT city status · 87% operational",
    academicMappingBtn: "Academic System Mapping · IDEA LAB-V",

    // Settings Screens
    accessibilitySettingsTitle: "Accessibility Settings",
    voiceSettingsTitle: "Voice & Speech Settings",
    privacySecurityTitle: "Privacy & Security",
    notificationsTitle: "Notifications",
    reportHistoryTitle: "Report History",
    analyticsTitle: "Smart City Analytics",
    iotTitle: "IoT Live City Status",
    academicTitle: "Academic System Mapping",
    helpTitle: "Help & Support",
    languageTitle: "Language & Voice",

    // General Actions
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    back: "Back",
    clear: "Clear",
    all: "All",
    statusFilter: "Status",
  },

  Hindi: {
    // Branding
    appName: "अर्बनईज़",
    appAi: "एआई",
    tagline: "समझदारी से चलें। स्वतंत्र रूप से चलें।",
    voiceFirstLabel: "आवाज़-प्रथम शहर पहुँच",
    prototypeNote: "इंटरैक्टिव प्रोटोटाइप · सिम्युलेटेड शहर सुगम्यता डेटा",
    academicNotice: "आइडिया लैब-V · कंप्यूटर इंजीनियरिंग तृतीय वर्ष · 2026–2027",

    // Splash / Voice-First Entry
    splashPrompt: "नमस्ते! मैं आपको दिशा खोजने में कैसे मदद कर सकता हूँ?",
    splashReady: "माइक दबाएँ और बोलें",
    splashListening: "सुन रहा हूँ…",
    splashProcessing: "आपके अनुरोध को समझा जा रहा है…",
    splashConfirming: "क्या मैं नेविगेशन शुरू करूँ?",
    splashError: "माइक्रोफ़ोन सक्रिय है",
    splashSkip: "सीधे इंटरएक्टिव मैप पर जाएँ",
    splashHeard: "मैंने सुना",
    splashRouteReady:
      "{destination} के लिए सबसे सुलभ मार्ग चुना गया है। क्या मैं नेविगेशन शुरू करूँ?",
    splashStarting: "नेविगेशन अभी शुरू किया जा रहा है।",
    splashShowing: "सुलभ मार्ग दिखाए जा रहे हैं।",
    splashStartNav: "नेविगेशन शुरू करें",
    splashViewRoutes: "पहले मार्ग देखें",
    splashTypeAlternative: "इसके बजाय गंतव्य या बाधा टाइप करें",
    splashTypeSubmit: "जाएँ",
    splashTypePlaceholder: "उदा. मुझे बांद्रा स्टेशन ले चलो, सीढ़ियों से बचें",

    // Intro Screen
    introBadge: "सुगम्यता-प्रथम गतिशीलता",
    introHeading: "अपनी शर्तों पर अपने शहर में घूमें।",
    introSubheading:
      "केवल सड़क दूरी पर नहीं, आपकी शारीरिक आवश्यकताओं के अनुसार तैयार किए गए एआई सुलभ मार्ग।",
    introGetStarted: "शुरू करें",
    introSkip: "सीधे साइन इन पर जाएँ",
    stepFree: "बिना सीढ़ी",
    accessibleScore: "सुलभ",

    // Onboarding
    onboardSkip: "छोड़ें",
    onboardNext: "आगे",
    onboardBack: "पीछे",
    onboardFinish: "अनुभव चुनें",
    slide1Kicker: "व्यक्तिगत गतिशीलता",
    slide1Title: "व्यक्तिगत सुलभ मार्ग",
    slide1Text:
      "आपके चलने के तरीके के अनुसार मार्ग—केवल दूरी और समय नहीं। रैंप, समतल फुटपाथ और लिफ्ट उपलब्धता के आधार पर फ़िल्टर करें।",
    slide2Kicker: "आवाज़-सुलभता",
    slide2Title: "आवाज़-प्रथम सुगम्यता",
    slide2Text:
      "गंतव्य खोजें, हर मोड़ पर बोले गए निर्देश प्राप्त करें और आवाज़ से शहर की बाधाओं की रिपोर्ट करें।",
    slide3Kicker: "लाइव शहर संकेत",
    slide3Title: "रीयल-टाइम सुगम्यता जानकारी",
    slide3Text:
      "यात्रा शुरू करने से पहले लिफ्ट, सड़क की स्थिति और रास्ते की रुकावटों के बारे में जानें।",
    slide4Kicker: "समुदाय बुद्धिमत्ता",
    slide4Title: "AI समुदाय रिपोर्टिंग",
    slide4Text:
      "नागरिकों की जानकारी को बाधा-मुक्त शहर में बदलें, जिसमें स्वचालित AI बाधा वर्गीकरण शामिल है।",

    // Login
    welcomeTitle: "UrbanEase AI में आपका स्वागत है",
    welcomeSub: "अपनी व्यक्तिगत सुलभ गतिशीलता प्रोफ़ाइल तक पहुँचने के लिए साइन इन करें।",
    createAccountTitle: "अपना खाता बनाएँ",
    createAccountSub:
      "सभी उपकरणों पर अपनी प्राथमिकताओं के सुरक्षित उपयोग के लिए खाता बनाएँ।",
    resetPasswordTitle: "पासवर्ड रीसेट करें",
    resetPasswordSub: "हम आपके पंजीकृत ईमेल पते पर एक सुरक्षित रीसेट लिंक भेजेंगे।",
    fullName: "पूरा नाम",
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    agreeTerms: "मैं उपयोग की शर्तों और गोपनीयता नीति से सहमत हूँ",
    show: "दिखाएँ",
    hide: "छिपाएँ",
    rememberMe: "मुझे याद रखें",
    forgotPassword: "पासवर्ड भूल गए?",
    signInSecurely: "सुरक्षित साइन इन करें",
    createAccount: "खाता बनाएँ",
    sendResetLink: "रीसेट लिंक भेजें",
    newToUrbanEase: "UrbanEase AI पर नए हैं?",
    alreadyHaveAccount: "क्या पहले से खाता है?",
    createAnAccount: "खाता बनाएँ",
    backToSignIn: "साइन इन पर वापस जाएँ",
    orContinueWith: "या इसके साथ जारी रखें",
    continueWithGoogle: "Google के साथ जारी रखें",
    continuePresentation: "प्रस्तुति मोड में जारी रखें",
    privacyReassurance:
      "आपका स्थान और गतिशीलता प्राथमिकताएँ केवल आपके डिवाइस पर सुरक्षित रहती हैं।",
    validationRequired: "कृपया सही ईमेल और पासवर्ड दर्ज करें।",
    validationCreate:
      "सभी विवरण भरें, कम से कम 6 अक्षरों का पासवर्ड दोहराएँ और शर्तें स्वीकार करें।",
    validationReset: "कृपया मान्य ईमेल पता दर्ज करें।",
    simulatedGoogle: "प्रस्तुति मोड में Google साइन-इन सुरक्षित रूप से सिम्युलेट किया गया।",

    // Experience Selection
    chooseExperience: "अपना अनुभव चुनें",
    chooseExpSubtitle:
      "अपनी ज़रूरतों के अनुसार इंटरफ़ेस चुनें। इसे बाद में प्रोफ़ाइल से कभी भी बदला जा सकता है।",
    expStandardTitle: "मानक अनुभव",
    expStandardDesc: "विस्तृत सुलभ मानचित्र और मार्ग तुलना के साथ संतुलित दृश्य इंटरफ़ेस।",
    expVoiceTitle: "आवाज़ सुगम्यता अनुभव",
    expVoiceDesc:
      "दृष्टिबाधित और कम दृष्टि वाले उपयोगकर्ताओं के लिए उच्च कंट्रास्ट, बड़े बटन और पूर्ण हैंड्स-फ्री आवाज़ सहायता।",
    expSmartTitle: "स्मार्ट मोबिलिटी अनुभव",
    expSmartDesc:
      "रीयल-टाइम IoT सेंसर, सार्वजनिक परिवहन सुगम्यता स्थिति और स्मार्ट शहर विश्लेषण।",
    recommended: "अनुशंसित",
    continueSetup: "सेटअप जारी रखें",

    // Accessibility Setup
    mobilityProfileTitle: "आपकी मोबिलिटी प्रोफ़ाइल",
    howPreferMove: "आप किस तरह यात्रा करना पसंद करते हैं?",
    selectPreferencesSub:
      "वे सभी विकल्प चुनें जो आपके लिए सुरक्षित और आरामदायक यात्रा की योजना बनाने में मदद करते हैं।",
    saveAccessibilityProfile: "सुगम्यता प्रोफ़ाइल सहेजें",
    preferencesPrivateNote:
      "आपकी प्राथमिकताएँ पूरी तरह से आपके डिवाइस पर सुरक्षित रहती हैं और केवल मार्गों को अनुकूलित करने के लिए उपयोग की जाती हैं।",

    // Voice Setup
    voiceSetupTitle: "आवाज़ सुगम्यता सेटअप",
    voiceSetupKicker: "आपके उत्तरों से तैयार की गई प्रोफ़ाइल",
    readyToMove: "आप स्वतंत्र रूप से चलने के लिए तैयार हैं।",
    speakAgain: "फिर से बोलें",
    editAnswers: "उत्तर संपादित करें",
    doneEditing: "संपादन पूर्ण",
    saveProfile: "प्रोफ़ाइल सहेजें",

    // Navigation / Bottom Bar
    navHome: "होम",
    navExplore: "खोजें",
    navReport: "रिपोर्ट",
    navSaved: "सहेजे गए",
    navProfile: "प्रोफ़ाइल",
    navVoiceBtn: "आवाज़",
    speakPromptTooltip: "गंतव्य या सुगम्यता समस्या बोलकर बताएँ",

    // Home Dashboard
    goodMorning: "सुप्रभात",
    demoUser: "निधि दुबे",
    locationLabel: "बांद्रा पश्चिम, मुंबई (डेमो स्थान)",
    updateLocation: "स्थान अपडेट करें",
    searchPlaceholder: "आप कहाँ जाना चाहेंगे?",
    profileBannerTitle: "व्यक्तिगत मार्ग सक्रिय",
    quickActions: "त्वरित कार्य",
    planRoute: "मार्ग बनाएँ",
    voiceAssistant: "वॉइस सहायक",
    reportBarrier: "बाधा रिपोर्ट करें",
    exploreNearby: "आस-पास खोजें",
    savedRoutes: "सहेजे गए मार्ग",
    savedPlaces: "सहेजे गए स्थान",
    liveCityAccessibility: "शहर की लाइव सुगम्यता",
    mostlyAccessible: "आस-पास अधिकतर सुलभ",
    updatedMinsAgo: "2 मिनट पहले अपडेट",
    accessibleLifts: "सुलभ लिफ्ट",
    activeBarriers: "सक्रिय बाधाएँ",
    areaScore: "क्षेत्र स्कोर",
    accessibilityScoreSummary: "सुगम्यता स्कोर सारांश",
    tenFactors: "10 शहरी कारक",
    stepFreeAccess: "बिना सीढ़ी पहुँच",
    rampsAndSlope: "रैंप और ढलान",
    surfaceQuality: "सतह गुणवत्ता",
    accessibleTransport: "सुलभ परिवहन",
    barrierConfidence: "बाधा विश्वसनीयता",
    recentRoute: "हाल का मार्ग",
    viewSaved: "सहेजे गए देखें",
    seeAll: "सभी देखें",
    nearbyPlaces: "आस-पास के सुलभ स्थान",
    reportedBarriersNearby: "आस-पास रिपोर्ट की गई बाधाएँ",
    nearestBarrierDist: "1 उच्च · 1 मध्यम · निकटतम बाधा 120 मीटर दूर",

    // Voice Assistant Screen
    voiceAssistantTitle: "UrbanEase आवाज़ सहायक",
    stateReady: "तैयार",
    stateListening: "सुन रहा हूँ…",
    stateProcessing: "अनुरोध समझा जा रहा है…",
    stateError: "माइक्रोफ़ोन उपलब्ध नहीं है। टाइप करें।",
    tapMicToBegin: "स्वाभाविक रूप से बोलने के लिए माइक दबाएँ",
    speakNaturally: "अंग्रेज़ी, हिंदी या मराठी में स्पष्ट बोलें",
    viewRoutes: "मार्ग देखें",
    hearAgain: "फिर से सुनें",
    typeInstead: "इसके बजाय टाइप करें",
    typeCommandPlaceholder: "नेविगेशन या बाधा संबंधी आदेश लिखें…",
    send: "भेजें",
    tryACommand: "एक मौखिक निर्देश आज़माएँ",

    // Route Planner
    planAccessibleRoute: "सुलभ मार्ग की योजना बनाएँ",
    startingPoint: "प्रारंभिक स्थान",
    destination: "गंतव्य स्थान",
    swapLocations: "प्रारंभिक और गंतव्य स्थान आपस में बदलें",
    date: "तारीख",
    time: "समय",
    travelMode: "यात्रा माध्यम",
    modeWalking: "पैदल",
    modeTransit: "सार्वजनिक परिवहन",
    modeMixed: "मिश्रित माध्यम",
    profileSynced: "प्रोफ़ाइल से जुड़ा हुआ",
    avoidStairs: "सीढ़ियों से बचें",
    lowWalking: "कम पैदल चलना",
    voiceGuidance: "आवाज़ मार्गदर्शन",
    spokenAlerts: "बोले गए अलर्ट",
    wheelchairFriendly: "व्हीलचेयर अनुकूल",
    elderFriendly: "वरिष्ठ नागरिक अनुकूल",
    visualAssistance: "दृश्य सहायता",
    hearingAssistance: "श्रवण सहायता",
    stepFreeTransport: "बिना सीढ़ी परिवहन",
    aiPrioritizeNote:
      "UrbanEase AI साधारण दूरी की तुलना में सुरक्षा और शारीरिक सुगम्यता को प्राथमिकता देता है।",
    findAccessibleRoute: "सुलभ मार्ग खोजें",
    clearRoute: "जानकारी साफ़ करें",

    // Route Results & Cards
    accessibleRoutes: "सुलभ मार्ग",
    currentLocation: "वर्तमान स्थान",
    rankedFor:
      "बिना सीढ़ी, सुरक्षित ढलान, ऑडियो सिग्नल और स्पर्शनीय फुटपाथ के लिए क्रमित।",
    routeA: "मार्ग A · सबसे सुलभ",
    routeB: "मार्ग B · सबसे तेज़",
    routeC: "मार्ग C · संतुलित",
    travelTime: "यात्रा समय",
    distance: "दूरी",
    stairsCount: "सीढ़ियाँ",
    viewRoute: "मार्ग देखें",
    compare: "तुलना करें",
    startNavigation: "नेविगेशन शुरू करें",
    stairsWarning: "इस मार्ग में कुछ सीढ़ियाँ शामिल हैं",
    routeSavedSuccess: "मार्ग आपके ऑफ़लाइन सुलभ मार्गों में सहेजा गया",

    // Route Comparison
    compareRoutesTitle: "मार्गों की तुलना करें",
    compareSubtitle:
      "अपनी यात्रा के लिए सर्वोत्तम विकल्प चुनने हेतु सुगम्यता कारकों की तुलना करें।",
    metricFactor: "कारक",
    chooseRoute: "मार्ग चुनें",

    // Route Details
    routeAccessibilityPoints: "मार्ग के सुगम्यता बिंदु",
    verifiedStatus: "सत्यापित लाइव",
    startJourney: "यात्रा शुरू करें",
    saveRouteBtn: "मार्ग सहेजें",
    reportProblem: "मार्ग पर समस्या रिपोर्ट करें",
    shareRoute: "मार्ग साझा करें",

    // Active Journey
    navigatingTitle: "नेविगेशन चालू · मार्ग",
    endJourneyPrompt: "क्या यात्रा नेविगेशन समाप्त करना चाहते हैं?",
    endJourneyText: "आपका सक्रिय मोड़-दर-मोड़ मार्गदर्शन समाप्त हो जाएगा।",
    endJourneyConfirm: "यात्रा समाप्त करें",
    nextInstruction: "अगला निर्देश",
    remaining: "शेष दूरी",
    progress: "प्रगति",
    accessibilityAlertTitle: "सुगम्यता चेतावनी",
    alertDescription: "120 मीटर आगे फुटपाथ पर अस्थायी अवरोध की सूचना मिली है।",
    repeat: "दोहराएँ",
    pause: "रोकें",
    resume: "फिर शुरू करें",
    mute: "म्यूट",
    unmute: "आवाज़ खोलें",
    recalculate: "पुनर्गणना",
    report: "रिपोर्ट",
    alternateRouteApplied: "सुलभ वैकल्पिक मार्ग लागू किया गया। बाधा से बचा जा रहा है।",

    // Explore Accessible Places
    explorePlacesTitle: "सुलभ स्थान खोजें",
    searchPlacesPlaceholder: "सुलभ स्थान, स्टेशन, पार्क खोजें…",
    nearMe: "मेरे पास · 2 किमी",
    listView: "सूची",
    mapView: "मानचित्र",

    // Place Details
    placeDetailsTitle: "स्थान विवरण",
    accessibilityFacilities: "सुगम्यता सुविधाएँ",
    voiceDirections: "आवाज़ दिशा-निर्देश",
    savePlace: "स्थान सहेजें",
    placeSavedSuccess: "स्थान आपके सहेजे गए स्थानों में जोड़ा गया",

    // Report Barrier Flow
    reportBarrierTitle: "सुगम्यता बाधा रिपोर्ट करें",
    reportLead:
      "टूटे हुए रैंप, अवरुद्ध फुटपाथ या बंद लिफ्ट की सूचना देकर नागरिकों की सुरक्षित आवाजाही में मदद करें।",
    whatDidYouFind: "आपको कौन सी बाधा मिली?",
    uploadPhoto: "बाधा की फ़ोटो अपलोड या सिम्युलेट करें",
    uploadOptional: "वैकल्पिक · AI बाधा विश्लेषण शुरू करता है",
    locationField: "स्थान",
    descriptionField: "विवरण",
    severityField: "गंभीरता",
    severityLow: "कम",
    severityMedium: "मध्यम",
    severityHigh: "उच्च",
    reviewReport: "रिपोर्ट की समीक्षा करें",
    aiAnalysisTitle: "AI बाधा विश्लेषण",
    aiAnalysisNote: "प्रोटोटाइप AI वर्गीकरण · भेजने से पहले संपादन योग्य",
    detectedType: "पहचानी गई बाधा",
    confidence: "विश्वसनीयता",
    suggestedAction: "सुझाई गई कार्रवाई",
    confirmAnalysis: "AI विश्लेषण की पुष्टि करें",
    editReport: "विवरण संपादित करें",
    confirmAndSubmit: "पुष्टि करके रिपोर्ट भेजें",
    reportSuccessTitle: "रिपोर्ट सफलतापूर्वक दर्ज की गई",
    reportSuccessSub:
      "समावेशी और बाधा-मुक्त शहर निर्माण में आपके योगदान के लिए धन्यवाद।",
    reportIdLabel: "रिपोर्ट आईडी",
    underReviewNote: "समीक्षाधीन · नागरिक मानचित्र अलर्ट सक्रिय",
    viewHistory: "रिपोर्ट इतिहास देखें",
    returnHome: "होम पर लौटें",

    // Saved Routes & Places
    savedRoutesTitle: "सहेजे गए सुलभ मार्ग",
    savedPlacesTitle: "सहेजे गए सुलभ स्थान",
    routesTab: "मार्ग",
    placesTab: "स्थान",
    noSavedRoutes: "अभी कोई सहेजा गया मार्ग नहीं है",
    noSavedRoutesSub: "तेज़ी से ऑफ़लाइन उपयोग के लिए मार्गों को सहेजें।",
    noSavedPlaces: "अभी कोई सहेजा गया स्थान नहीं है",
    noSavedPlacesSub: "सुलभ स्टेशनों, पार्कों और अस्पतालों को सहेजें।",
    deleteSavedPrompt: "सहेजी गई सूची से हटाएँ?",
    deleteSavedText: "यह वस्तु आपके ऑफ़लाइन सहेजे गए डेटा से हटा दी जाएगी।",
    delete: "हटाएँ",
    open: "खोलें",
    start: "शुरू करें",

    // User Profile
    profileTitle: "उपयोगकर्ता प्रोफ़ाइल",
    profileActiveStatus: "सुगम्यता प्रोफ़ाइल सक्रिय",
    profileReadiness: "आपकी मोबिलिटी प्रोफ़ाइल 94% अनुकूलित है",
    profileStats: "9 सक्रिय प्राथमिकताएँ · उच्च सुरक्षा भरोसा",
    openAnalytics: "स्मार्ट सिटी विश्लेषण खोलें · 1,284 रिपोर्ट",
    viewIotStatus: "IoT शहर स्थिति देखें · 87% चालू",
    academicMappingBtn: "शैक्षणिक प्रणाली मैपिंग · IDEA LAB-V",

    // Settings Screens
    accessibilitySettingsTitle: "सुगम्यता सेटिंग",
    voiceSettingsTitle: "आवाज़ और संवाद सेटिंग",
    privacySecurityTitle: "गोपनीयता और सुरक्षा",
    notificationsTitle: "सूचनाएँ",
    reportHistoryTitle: "रिपोर्ट इतिहास",
    analyticsTitle: "स्मार्ट सिटी विश्लेषण",
    iotTitle: "IoT लाइव शहर स्थिति",
    academicTitle: "शैक्षणिक प्रणाली मैपिंग",
    helpTitle: "सहायता और समर्थन",
    languageTitle: "भाषा और आवाज़",

    // General Actions
    confirm: "पुष्टि करें",
    cancel: "रद्द करें",
    save: "सहेजें",
    edit: "संपादित करें",
    back: "वापस",
    clear: "साफ़ करें",
    all: "सभी",
    statusFilter: "स्थिति",
  },

  Marathi: {
    // Branding
    appName: "अर्बनईझ",
    appAi: "एआय",
    tagline: "हुशारीने चला. मुक्तपणे चला.",
    voiceFirstLabel: "आवाज-प्रथम शहर प्रवेश",
    prototypeNote: "परस्परसंवादी प्रोटोटाइप · सिम्युलेटेड शहर सुलभता डेटा",
    academicNotice: "आयडिया लॅब-V · संगणक अभियांत्रिकी तृतीय वर्ष · 2026–2027",

    // Splash / Voice-First Entry
    splashPrompt: "नमस्कार! मी तुम्हाला दिशा शोधण्यात कशी मदत करू शकतो?",
    splashReady: "माइक दाबा आणि बोला",
    splashListening: "ऐकत आहे…",
    splashProcessing: "तुमच्या विनंतीवर प्रक्रिया सुरू आहे…",
    splashConfirming: "मी नेव्हिगेशन सुरू करू का?",
    splashError: "मायक्रोफोन सक्रिय आहे",
    splashSkip: "थेट परस्परसंवादी नकाशावर जा",
    splashHeard: "मी ऐकले",
    splashRouteReady:
      "{destination} साठी सर्वात सुलभ मार्ग निवडला आहे. मी नेव्हिगेशन सुरू करू का?",
    splashStarting: "नेव्हिगेशन आता सुरू करत आहे.",
    splashShowing: "सुलभ मार्ग दाखवत आहे.",
    splashStartNav: "नेव्हिगेशन सुरू करा",
    splashViewRoutes: "आधी मार्ग पहा",
    splashTypeAlternative: "त्याऐवजी गंतव्य किंवा अडथळा टाइप करा",
    splashTypeSubmit: "सुरू करा",
    splashTypePlaceholder: "उदा. मला बांद्रा स्टेशनला घेऊन चला, पायऱ्या टाळा",

    // Intro Screen
    introBadge: "सुलभता-प्रथम गतिशीलता",
    introHeading: "तुमच्या अटींवर तुमच्या शहरात फिरा.",
    introSubheading:
      "केवळ रस्त्यांच्या अंतरावर नाही, तर तुमच्या हालचालींच्या गरजेनुसार तयार केलेले एआय सुलभ मार्ग.",
    introGetStarted: "सुरू करा",
    introSkip: "थेट साइन इन करा",
    stepFree: "पायरीविरहित",
    accessibleScore: "सुलभ",

    // Onboarding
    onboardSkip: "वगळा",
    onboardNext: "पुढे",
    onboardBack: "मागे",
    onboardFinish: "अनुभव निवडा",
    slide1Kicker: "वैयक्तिक गतिशीलता",
    slide1Title: "वैयक्तिक सुलभ मार्ग",
    slide1Text:
      "तुमच्या हालचालीनुसार तयार केलेले मार्ग—केवळ अंतर आणि वेळ नाही. रॅम्प, सपाट पृष्ठभाग आणि लिफ्टनुसार फिल्टर करा.",
    slide2Kicker: "आवाज-सुलभता",
    slide2Title: "आवाज-प्रथम सुलभता",
    slide2Text:
      "ठिकाणे शोधा, प्रत्येक वळणावर बोललेल्या सूचना मिळवा आणि आवाजाने शहरातील अडथळ्यांची नोंद करा.",
    slide3Kicker: "थेट शहर संकेत",
    slide3Title: "रिअल-टाइम सुलभता माहिती",
    slide3Text:
      "प्रवासास निघण्यापूर्वी लिफ्ट, रस्त्यांची स्थिती आणि मार्गातील अडथळ्यांची माहिती मिळवा.",
    slide4Kicker: "समुदाय बुद्धिमत्ता",
    slide4Title: "AI समुदाय अहवाल",
    slide4Text:
      "नागरिकांच्या नोंदींचे रूपांतर अडथळा-मुक्त शहरात करा, ज्यामध्ये स्वयंचलित AI अडथळा वर्गीकरण आहे.",

    // Login
    welcomeTitle: "UrbanEase AI मध्ये आपले स्वागत आहे",
    welcomeSub: "तुमच्या वैयक्तिक सुलभ मोबिलिटी प्रोफाइलसाठी साइन इन करा.",
    createAccountTitle: "तुमचे खाते तयार करा",
    createAccountSub:
      "सर्व उपकरणांवर तुमच्या प्राधान्यांच्या सुरक्षित वापरासाठी खाते तयार करा.",
    resetPasswordTitle: "पासवर्ड रीसेट करा",
    resetPasswordSub: "आम्ही तुमच्या नोंदणीकृत ईमेलवर सुरक्षित रीसेट लिंक पाठवू.",
    fullName: "पूर्ण नाव",
    emailAddress: "ईमेल पत्ता",
    password: "पासवर्ड",
    confirmPassword: "पासवर्डची पुष्टी करा",
    agreeTerms: "मी वापराच्या अटी आणि गोपनीयता धोरणाशी सहमत आहे",
    show: "दाखवा",
    hide: "लपवा",
    rememberMe: "मला लक्षात ठेवा",
    forgotPassword: "पासवर्ड विसरलात?",
    signInSecurely: "सुरक्षित साइन इन करा",
    createAccount: "खाते तयार करा",
    sendResetLink: "रीसेट लिंक पाठवा",
    newToUrbanEase: "UrbanEase AI वर नवीन आहात?",
    alreadyHaveAccount: "आधीपासून खाते आहे का?",
    createAnAccount: "खाते तयार करा",
    backToSignIn: "साइन इनवर परत जा",
    orContinueWith: "किंवा यासह सुरू ठेवा",
    continueWithGoogle: "Google सह सुरू ठेवा",
    continuePresentation: "सादरीकरण मोडमध्ये सुरू ठेवा",
    privacyReassurance:
      "तुमचे स्थान आणि मोबिलिटी प्राधान्ये केवळ तुमच्या उपकरणावर सुरक्षित राहतात.",
    validationRequired: "कृपया वैध ईमेल आणि पासवर्ड भरा.",
    validationCreate:
      "सर्व माहिती भरा, किमान 6 अक्षरांचा पासवर्ड पुन्हा तपासा आणि अटी स्वीकारा.",
    validationReset: "कृपया योग्य ईमेल पत्ता भरा.",
    simulatedGoogle: "सादरीकरण मोडमध्ये Google साइन-इन सुरक्षितपणे सिम्युलेट केले आहे.",

    // Experience Selection
    chooseExperience: "तुमचा अनुभव निवडा",
    chooseExpSubtitle:
      "तुमच्या गरजेनुसार योग्य संवाद पद्धत निवडा. हे नंतर प्रोफाइलमधून कधीही बदलता येते.",
    expStandardTitle: "मानक अनुभव",
    expStandardDesc: "तपशीलवार सुलभ नकाशे आणि मार्ग तुलनेसह संतुलित दृश्य इंटरफेस.",
    expVoiceTitle: "आवाज सुलभता अनुभव",
    expVoiceDesc:
      "दृष्टिहीन आणि कमी दृष्टी असलेल्या वापरकर्त्यांसाठी उच्च कॉन्ट्रास्ट, मोठी बटणे आणि संपूर्ण हँड्स-फ्री आवाज सहाय्य.",
    expSmartTitle: "स्मार्ट मोबिलिटी अनुभव",
    expSmartDesc:
      "रिअल-टाइम IoT सेन्सर, सार्वजनिक वाहतूक सुलभता स्थिती आणि स्मार्ट शहर विश्लेषण.",
    recommended: "शिफारस केलेले",
    continueSetup: "सेटअप पुढे सुरू ठेवा",

    // Accessibility Setup
    mobilityProfileTitle: "तुमचे मोबिलिटी प्रोफाइल",
    howPreferMove: "तुम्हाला कसे प्रवास करायला आवडते?",
    selectPreferencesSub:
      "अधिक सुरक्षित आणि सोपा प्रवास आखण्यासाठी मदत करणारे सर्व पर्याय निवडा.",
    saveAccessibilityProfile: "सुलभता प्रोफाइल जतन करा",
    preferencesPrivateNote:
      "तुमची प्राधान्ये पूर्णपणे तुमच्या उपकरणावर खाजगी राहतात आणि केवळ मार्ग वैयक्तिकृत करण्यासाठी वापरली जातात.",

    // Voice Setup
    voiceSetupTitle: "आवाज सुलभता सेटअप",
    voiceSetupKicker: "तुमच्या उत्तरांमधून तयार केलेले प्रोफाइल",
    readyToMove: "तुम्ही मुक्तपणे प्रवास करण्यासाठी तयार आहात.",
    speakAgain: "पुन्हा बोला",
    editAnswers: "उत्तरे संपादित करा",
    doneEditing: "संपादन पूर्ण",
    saveProfile: "प्रोफाइल जतन करा",

    // Navigation / Bottom Bar
    navHome: "मुख्यपृष्ठ",
    navExplore: "शोधा",
    navReport: "नोंदवा",
    navSaved: "जतन केलेले",
    navProfile: "प्रोफाइल",
    navVoiceBtn: "आवाज",
    speakPromptTooltip: "गंतव्य ठिकाण किंवा सुलभता समस्या बोला",

    // Home Dashboard
    goodMorning: "शुभ सकाळ",
    demoUser: "निधी दुबे",
    locationLabel: "वांद्रे पश्चिम, मुंबई (डेमो स्थान)",
    updateLocation: "स्थान अपडेट करा",
    searchPlaceholder: "तुम्हाला कुठे जायचे आहे?",
    profileBannerTitle: "वैयक्तिक मार्ग सक्रिय",
    quickActions: "त्वरित कृती",
    planRoute: "मार्ग तयार करा",
    voiceAssistant: "व्हॉइस सहाय्यक",
    reportBarrier: "अडथळा नोंदवा",
    exploreNearby: "जवळपास शोधा",
    savedRoutes: "जतन केलेले मार्ग",
    savedPlaces: "जतन केलेली ठिकाणे",
    liveCityAccessibility: "शहराची थेट सुलभता",
    mostlyAccessible: "जवळपास बहुतांश सुलभ",
    updatedMinsAgo: "२ मिनिटांपूर्वी अपडेट",
    accessibleLifts: "सुलभ लिफ्ट",
    activeBarriers: "सक्रिय अडथळे",
    areaScore: "क्षेत्र गुण",
    accessibilityScoreSummary: "सुलभता गुण सारांश",
    tenFactors: "१० नागरी घटक",
    stepFreeAccess: "पायरीविरहित प्रवेश",
    rampsAndSlope: "रॅम्प आणि उतार",
    surfaceQuality: "पृष्ठभाग गुणवत्ता",
    accessibleTransport: "सुलभ वाहतूक",
    barrierConfidence: "अडथळा विश्वास",
    recentRoute: "अलीकडील मार्ग",
    viewSaved: "जतन केलेले पहा",
    seeAll: "सर्व पहा",
    nearbyPlaces: "जवळपासची सुलभ ठिकाणे",
    reportedBarriersNearby: "जवळपास नोंदवलेले अडथळे",
    nearestBarrierDist: "१ उच्च · १ मध्यम · जवळचा अडथळा १२० मीटर अंतरावर",

    // Voice Assistant Screen
    voiceAssistantTitle: "UrbanEase आवाज सहाय्यक",
    stateReady: "तयार",
    stateListening: "ऐकत आहे…",
    stateProcessing: "विनंती समजून घेत आहे…",
    stateError: "मायक्रोफोन उपलब्ध नाही. टाइप करा.",
    tapMicToBegin: "सहजपणे बोलण्यासाठी माइक दाबा",
    speakNaturally: "इंग्रजी, हिंदी किंवा मराठीत स्पष्ट बोला",
    viewRoutes: "मार्ग पहा",
    hearAgain: "पुन्हा ऐका",
    typeInstead: "त्याऐवजी टाइप करा",
    typeCommandPlaceholder: "नेव्हिगेशन किंवा अडथळा आदेश लिहा…",
    send: "पाठवा",
    tryACommand: "बोलून आदेश वापरून पहा",

    // Route Planner
    planAccessibleRoute: "सुलभ मार्गाची योजना करा",
    startingPoint: "सुरुवातीचे ठिकाण",
    destination: "गंतव्य ठिकाण",
    swapLocations: "सुरुवातीचे आणि गंतव्य ठिकाण बदला",
    date: "दिनांक",
    time: "वेळ",
    travelMode: "प्रवास प्रकार",
    modeWalking: "पायी",
    modeTransit: "सार्वजनिक वाहतूक",
    modeMixed: "मिश्र प्रकार",
    profileSynced: "प्रोफाइलशी जोडलेले",
    avoidStairs: "पायऱ्या टाळा",
    lowWalking: "कमी चालणे",
    voiceGuidance: "आवाज मार्गदर्शन",
    spokenAlerts: "बोललेले अलर्ट",
    wheelchairFriendly: "व्हीलचेअर सुलभ",
    elderFriendly: "ज्येष्ठ नागरिक सुलभ",
    visualAssistance: "दृष्टी सहाय्य",
    hearingAssistance: "श्रवण सहाय्य",
    stepFreeTransport: "पायरीविरहित वाहतूक",
    aiPrioritizeNote:
      "UrbanEase AI साध्या अंतरापेक्षा सुरक्षितता आणि शारीरिक सुलभतेला प्राधान्य देते.",
    findAccessibleRoute: "सुलभ मार्ग शोधा",
    clearRoute: "माहिती साफ करा",

    // Route Results & Cards
    accessibleRoutes: "सुलभ मार्ग",
    currentLocation: "सध्याचे ठिकाण",
    rankedFor:
      "पायरीविरहित, सौम्य उतार, ऑडिओ सिग्नल आणि स्पर्शनीय पदपथांनुसार क्रमवारी.",
    routeA: "मार्ग A · सर्वात सुलभ",
    routeB: "मार्ग B · सर्वात जलद",
    routeC: "मार्ग C · संतुलित",
    travelTime: "प्रवास वेळ",
    distance: "अंतर",
    stairsCount: "पायऱ्या",
    viewRoute: "मार्ग पहा",
    compare: "तुलना करा",
    startNavigation: "नेव्हिगेशन सुरू करा",
    stairsWarning: "या मार्गावर काही पायऱ्या आहेत",
    routeSavedSuccess: "मार्ग तुमच्या ऑफलाइन सुलभ मार्गांमध्ये जतन केला गेला",

    // Route Comparison
    compareRoutesTitle: "मार्गांची तुलना करा",
    compareSubtitle: "सर्वोत्तम पर्याय निवडण्यासाठी सुलभता घटकांची तुलना करा.",
    metricFactor: "घटक",
    chooseRoute: "मार्ग निवडा",

    // Route Details
    routeAccessibilityPoints: "मार्गावरील सुलभता बिंदू",
    verifiedStatus: "सत्यापित थेट",
    startJourney: "प्रवास सुरू करा",
    saveRouteBtn: "मार्ग जतन करा",
    reportProblem: "मार्गावर समस्या नोंदवा",
    shareRoute: "मार्ग शेअर करा",

    // Active Journey
    navigatingTitle: "नेव्हिगेशन सुरू · मार्ग",
    endJourneyPrompt: "प्रवास नेव्हिगेशन समाप्त करायचे का?",
    endJourneyText: "तुमचे चालू वळणावळणाचे मार्गदर्शन थांबवले जाईल.",
    endJourneyConfirm: "प्रवास समाप्त करा",
    nextInstruction: "पुढील सूचना",
    remaining: "उर्वरित अंतर",
    progress: "प्रगती",
    accessibilityAlertTitle: "सुलभता सूचना",
    alertDescription: "१२० मीटर पुढे पदपथावर तात्पुरता अडथळा नोंदवला गेला आहे.",
    repeat: "पुन्हा सांगा",
    pause: "थांबा",
    resume: "पुन्हा सुरू करा",
    mute: "म्यूट",
    unmute: "आवाज सुरू करा",
    recalculate: "पुनर्गणना",
    report: "नोंदवा",
    alternateRouteApplied: "सुलभ पर्यायी मार्ग लागू केला. अडथळा टाळला जात आहे.",

    // Explore Accessible Places
    explorePlacesTitle: "सुलभ ठिकाणे शोधा",
    searchPlacesPlaceholder: "सुलभ ठिकाणे, स्थानके, उद्याने शोधा…",
    nearMe: "माझ्या जवळ · २ किमी",
    listView: "यादी",
    mapView: "नकाशा",

    // Place Details
    placeDetailsTitle: "ठिकाण तपशील",
    accessibilityFacilities: "सुलभता सुविधा",
    voiceDirections: "आवाज दिशा",
    savePlace: "ठिकाण जतन करा",
    placeSavedSuccess: "ठिकाण तुमच्या जतन केलेल्या ठिकाणांमध्ये जोडले",

    // Report Barrier Flow
    reportBarrierTitle: "सुलभता अडथळा नोंदवा",
    reportLead:
      "तुटलेले रॅम्प, अडवलेले पदपथ किंवा बंद लिफ्टची नोंद करून नागरिकांना सुरक्षित प्रवासात मदत करा.",
    whatDidYouFind: "तुम्हाला कोणता अडथळा आढळला?",
    uploadPhoto: "अडथळ्याचा फोटो अपलोड किंवा सिम्युलेट करा",
    uploadOptional: "पर्यायी · AI अडथळा विश्लेषण सुरू करते",
    locationField: "स्थान",
    descriptionField: "वर्णन",
    severityField: "तीव्रता",
    severityLow: "कमी",
    severityMedium: "मध्यम",
    severityHigh: "उच्च",
    reviewReport: "अहवाल तपासा",
    aiAnalysisTitle: "AI अडथळा विश्लेषण",
    aiAnalysisNote: "प्रोटोटाइप AI वर्गीकरण · पाठवण्यापूर्वी संपादन करता येते",
    detectedType: "आढळलेला अडथळा",
    confidence: "विश्वासार्हता",
    suggestedAction: "सुचवलेली कृती",
    confirmAnalysis: "AI विश्लेषणाची पुष्टी करा",
    editReport: "तपशील संपादित करा",
    confirmAndSubmit: "पुष्टी करून अहवाल पाठवा",
    reportSuccessTitle: "अहवाल यशस्वीरित्या नोंदवला गेला",
    reportSuccessSub: "समावेशक आणि अडथळामुक्त शहर बनवण्यात सहकार्य केल्याबद्दल धन्यवाद.",
    reportIdLabel: "अहवाल आयडी",
    underReviewNote: "तपासणी सुरू · नागरी नकाशा इशारा सक्रिय",
    viewHistory: "अहवाल इतिहास पहा",
    returnHome: "मुख्यपृष्ठावर परत जा",

    // Saved Routes & Places
    savedRoutesTitle: "जतन केलेले सुलभ मार्ग",
    savedPlacesTitle: "जतन केलेली सुलभ ठिकाणे",
    routesTab: "मार्ग",
    placesTab: "ठिकाणे",
    noSavedRoutes: "अद्याप कोणताही मार्ग जतन केलेला नाही",
    noSavedRoutesSub: "ऑफलाइन वापरासाठी मार्ग जतन करा.",
    noSavedPlaces: "अद्याप कोणतेही ठिकाण जतन केलेले नाही",
    noSavedPlacesSub: "सुलभ स्थानके, उद्याने आणि रुग्णालये जतन करा.",
    deleteSavedPrompt: "जतन केलेल्या यादीतून काढायचे का?",
    deleteSavedText: "ही नोंद तुमच्या ऑफलाइन डेटावरून हटवली जाईल.",
    delete: "हटवा",
    open: "उघडा",
    start: "सुरू करा",

    // User Profile
    profileTitle: "वापरकर्ता प्रोफाइल",
    profileActiveStatus: "सुलभता प्रोफाइल सक्रिय",
    profileReadiness: "तुमचे मोबिलिटी प्रोफाइल ९४% अनुकूलित आहे",
    profileStats: "९ सक्रिय प्राधान्ये · उच्च सुरक्षा विश्वास",
    openAnalytics: "स्मार्ट सिटी विश्लेषण उघडा · १,२८४ अहवाल",
    viewIotStatus: "IoT शहर स्थिती पहा · ८७% कार्यरत",
    academicMappingBtn: "शैक्षणिक प्रणाली मॅपिंग · IDEA LAB-V",

    // Settings Screens
    accessibilitySettingsTitle: "सुलभता सेटिंग्ज",
    voiceSettingsTitle: "आवाज आणि संवाद सेटिंग्ज",
    privacySecurityTitle: "गोपनीयता आणि सुरक्षा",
    notificationsTitle: "सूचना",
    reportHistoryTitle: "अहवाल इतिहास",
    analyticsTitle: "स्मार्ट सिटी विश्लेषण",
    iotTitle: "IoT थेट शहर स्थिती",
    academicTitle: "शैक्षणिक प्रणाली मॅपिंग",
    helpTitle: "मदत आणि समर्थन",
    languageTitle: "भाषा आणि आवाज",

    // General Actions
    confirm: "पुष्टी करा",
    cancel: "रद्द करा",
    save: "जतन करा",
    edit: "संपादित करा",
    back: "मागे",
    clear: "साफ करा",
    all: "सर्व",
    statusFilter: "स्थिती",
  },
}

export function t(
  lang: Language,
  key: string,
  params?: Record<string, string>,
): string {
  const dictionary = translations[lang] || translations.English
  let text = dictionary[key] || translations.English[key] || key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v)
    })
  }
  return text
}
