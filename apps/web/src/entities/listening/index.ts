// Public API of the Listening entity (ADR-0010): the Listening domain model,
// the device storage of sessions and attempts (ADR-0014), and the Exam audio
// download. Server-only content loading has its own entry points
// (content.server.ts; keys.server.ts for the key and transcript).

export {
  type ListeningTest,
  type Part,
  type QuestionGroup,
  groupNumbers,
} from "./model/content";
export { audioBytes, mediaUrl, recordingMinutes } from "./model/media";
export { type QuestionUnit, questionUnits, unitOf } from "./model/units";
export {
  type CheckResult,
  type CheckedAnswers,
  LISTENING_SCORING_RULES_VERSION,
  type PracticeRawScore,
  type Outcome,
  type Signal,
  checkAttempt,
  checkUnits,
} from "./model/scoring";
export {
  type Answer,
  CHECK_MS,
  type ExamClock,
  type ListeningEvent,
  type ListeningSession,
  type Mode,
  SPEEDS,
  type Speed,
  answeredNumbers,
  apply,
  examClock,
  startSession,
} from "./model/session";
export { loadSessions, saveSession } from "./api/session-storage";
export type { ListeningKey, Transcript } from "./model/content";
export {
  type Correction,
  type ReviewOffer,
  type UnitOutcome,
  currentResult,
  latestRecord,
  positionCounts,
  reviewOffer,
  unitOutcomes,
  wasInterrupted,
} from "./model/results";
export {
  type FirstTry,
  type ListeningAttempt,
  type ResultRecord,
  UNKNOWN_FIRST_TRY,
  attemptFromSession,
} from "./model/attempts";
export {
  type History,
  commitFinishedSession,
  deviceHistory,
  recordResult,
  settleStoredSessions,
} from "./api/history";
export {
  type DownloadProgress,
  type DownloadedAudio,
  cleanUpAudioCache,
  downloadTestAudio,
} from "./api/audio-download";
export { ListeningContext, useListening } from "./ui/listening-context";
