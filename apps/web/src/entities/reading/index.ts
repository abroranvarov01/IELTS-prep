// Public API of the Reading entity (ADR-0010): the Reading domain model, the
// device storage of sessions and attempts, and the running session's React
// context. Server-only content loading has its own entry points
// (content.server.ts, keys.server.ts, explanations.server.ts); test fixtures
// are in testing.ts.

export {
  type GapSegment,
  type Option,
  type Passage,
  QUESTION_COUNT,
  type QuestionGroup,
  type ReadingTest,
  STATEMENT_ANSWERS,
} from "./model/content";
export type { AnswerKey, AnswerKeyEntry } from "./model/parse-content";
export { type QuestionUnit, questionUnits, unitOf } from "./model/units";
export { exceedsWordLimit } from "./model/word-limit";
export {
  MAX_PINS,
  type Mode,
  type ReadingEvent,
  type ReadingSession,
  type SheetState,
  answeredNumbers,
  apply,
  dueWarning,
  remainingMs,
  sessionNumbers,
  startSession,
} from "./model/session";
export {
  type RetryProblem,
  retryQuestions,
  validateRetry,
} from "./model/retry";
export {
  type OptionMark,
  SCORING_RULES_VERSION,
  type Signal,
  type UnitOutcome,
  checkAttempt,
  optionMarks,
} from "./model/scoring";
export {
  type ReadingAttempt,
  type ResultRecord,
  UNKNOWN_FIRST_TRY,
  attemptFromSession,
} from "./model/attempts";
export {
  type Pattern,
  type PatternCategory,
  type PatternsView,
  patternsView,
} from "./model/patterns";
export {
  type Correction,
  currentResult,
  latestRecord,
  positionCounts,
  reviewOffer,
  unitOutcomes,
} from "./model/results";
export type { ExplanationSegment, Explanations } from "./model/explanations";
export {
  type StorageSnapshot,
  deviceStorage,
  loadSessions,
  newSessionId,
  saveSession,
  storageSnapshot,
} from "./api/session-storage";
export {
  commitFinishedSession,
  deviceHistory,
  recordResult,
  settleStoredSessions,
} from "./api/history";
export { ReadingContext, useReading } from "./ui/reading-context";
