// Public API of the level-check entity (ADR-0010, ADR-0011): the result
// model, the records on the device and the state cookie. The section in
// progress is a Reading session, stored by the Reading entity; the page that
// owns the check composes the two.

export {
  LEVEL_RULES_VERSION,
  type Level,
  type LevelCheckResult,
  type ScoredPosition,
  levelCheckResult,
} from "./model/level";
export {
  type FinishedSection,
  type LevelCheckAttempt,
  type LevelCheckResultRecord,
  type Skill,
  latestAttempt,
} from "./model/records";
export {
  type LevelCheckState,
  NO_LEVEL_CHECK,
  type SectionState,
} from "./model/state";
export { type LevelCheckHistory, deviceLevelCheckHistory } from "./api/history";
export { readLevelCheckState, saveLevelCheckState } from "./api/state-cookie";
export { setLevelCheckSectionState } from "./api/actions";
