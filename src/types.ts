export type Language = "English" | "Hindi" | "Marathi"

export type Screen = "splash" | "intro" | "onboarding" | "login" | "experience" | "setup" | "voiceSetup" | "home" | "voice" | "planner" | "results" | "compare" | "detail" | "journey" | "explore" | "place" | "report" | "saved" | "savedPlaces" | "profile" | "accessibilitySettings" | "voiceSettings" | "privacy" | "notifications" | "history" | "analytics" | "iot" | "search" | "language" | "academic" | "help"

export type RouteOption = {
  id: "A" | "B" | "C"
  name: string
  score: number
  time: number
  distance: string
  tone: string
  traits: string[]
  steps: {
    instruction: string
    distance: string
    stepFree: boolean
    note?: string
  }[]
}

export type BarrierReport = {
  id: string
  type: string
  status: "Under Review" | "Verified" | "Resolved" | "Rejected"
  date: string
  severity: "Low" | "Medium" | "High"
  location: string
  description: string
}

export type SavedPlaceItem = {
  id: string
  name: string
  type: string
  address: string
  score: number
  distance: string
  features: string[]
}

export type VoiceIntent = {
  kind: "route"
  destination: string
  startNavigation: boolean
} | { kind: "report"; barrier: string } | { kind: "action"; screen: Screen } | {
  kind: "unknown"
}
