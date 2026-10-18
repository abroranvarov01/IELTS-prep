// Public API of the Listening entity (ADR-0010): the Listening domain model,
// the device storage of sessions and the Exam audio download. Server-only
// content loading has its own entry point (content.server.ts).

export {
  type ListeningTest,
  type Part,
  type QuestionGroup,
  groupNumbers,
} from "./model/content";
export { audioBytes, mediaUrl, recordingMinutes } from "./model/media";
export { type QuestionUnit, questionUnits, unitOf } from "./model/units";
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
export {
  type DownloadProgress,
  type DownloadedAudio,
  cleanUpAudioCache,
  downloadTestAudio,
} from "./api/audio-download";
export { ListeningContext, useListening } from "./ui/listening-context";
