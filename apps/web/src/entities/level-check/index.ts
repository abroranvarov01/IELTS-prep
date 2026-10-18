// Public API of the level-check entity (ADR-0010, ADR-0011): the result
// model. The device storage of its sessions and results follows in M7-08.

export {
  LEVEL_RULES_VERSION,
  type Level,
  type LevelCheckResult,
  type ScoredPosition,
  levelCheckResult,
} from "./model/level";
