// Public API of the guest's goal (ADR-0003, ADR-0010): its values and rules,
// and the cookie that keeps it.

export {
  EXAM_TYPES,
  type ExamType,
  type Goal,
  TARGET_BANDS,
  type TargetBand,
  isExamType,
  isTargetBand,
} from "./model/goal";
export { LATER, firstUnansweredQuestion } from "./model/onboarding";
export { readGoal, saveGoal } from "./api/goal-cookie";
