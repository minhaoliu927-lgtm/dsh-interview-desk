/**
 * Resume score for the prepare flow.
 *
 * The Host already runs two assessments: the resume against the job ("fit")
 * and the resume on its own ("resume"), each 0–100 by its rubric weights.
 * The flow shows one number, weighted toward the job like the original
 * 职镜 plan: fit 65%, resume 35%. A score of 80 or more opens the interview;
 * below that the user revises, or chooses to skip after seeing the score.
 */
export const PASS_SCORE = 80;
export const SCORE_WEIGHTS = Object.freeze({ fit: 0.65, resume: 0.35 });
export const SCORE_KINDS = Object.freeze(['fit', 'resume']);

/** The newest assessment of this resume version for this goal that read this job version. */
export function assessmentFor(state, kind, { goalId, resumeVersionId, jobVersionId }) {
  if (!goalId || !resumeVersionId) return null;
  return (state?.assessments || []).find(row => row.kind === kind && row.versionId === resumeVersionId && row.goalId === goalId
    && (!jobVersionId || !Array.isArray(row.inputVersions) || row.inputVersions.some(input => input.id === jobVersionId))) || null;
}

export function combinedScore(fit, resume) {
  if (typeof fit?.total !== 'number' || typeof resume?.total !== 'number') return null;
  return Math.round(fit.total * SCORE_WEIGHTS.fit + resume.total * SCORE_WEIGHTS.resume);
}

/**
 * status: 'none' (nothing run yet), 'partial' (one side missing), 'unknown'
 * (the model could not judge something, so there is no total), 'scored'.
 */
export function resumeScore(state, scope) {
  const fit = assessmentFor(state, 'fit', scope), resume = assessmentFor(state, 'resume', scope);
  const missing = SCORE_KINDS.filter(kind => !(kind === 'fit' ? fit : resume));
  const total = combinedScore(fit, resume);
  const status = missing.length === 2 ? 'none' : missing.length ? 'partial' : total === null ? 'unknown' : 'scored';
  return { fit, resume, missing, total, status, pass: total !== null && total >= PASS_SCORE, gap: total === null ? null : Math.max(0, PASS_SCORE - total) };
}

/** Earlier score of the same resume material for the same goal, for the "+N" after a revision. */
export function previousScore(state, scope, materialId) {
  if (!materialId) return null;
  const material = (state?.materials || []).find(row => row.id === materialId);
  const older = (material?.versions || []).filter(version => version.id !== scope.resumeVersionId)
    .sort((a, b) => b.revision - a.revision);
  for (const version of older) {
    const score = resumeScore(state, { ...scope, resumeVersionId: version.id });
    if (score.total !== null) return score.total;
  }
  return null;
}

/** Suggestions from both assessments, fit first, without repeats. */
export function scoreSuggestions(score, limit = 3) {
  const seen = new Set(), result = [];
  for (const row of [...(score.fit?.suggestions || []), ...(score.resume?.suggestions || [])]) {
    const text = String(row?.text || '').trim();
    if (!text || seen.has(text)) continue;
    seen.add(text); result.push(text);
  }
  return limit ? result.slice(0, limit) : result;
}

/** Instructions handed to rewrite.run: the suggestions, and the rule that facts stay. */
export function rewriteInstructions(score, t) {
  const hints = scoreSuggestions(score, 0);
  return [t('prepReviseRule'), ...hints.map(text => `- ${text}`)].join('\n').slice(0, 10_000);
}

/** A rewrite proposed for this resume version and goal that has not been accepted yet. */
export function openRewrite(state, goalId, resumeVersionId) {
  return (state?.rewrites || []).find(row => row.goalId === goalId && row.versionId === resumeVersionId && !row.acceptedVersionId) || null;
}

/** The goal this flow should use: the one it made, or one already linked to this job version. */
export function goalForJob(state, draftGoalId, jobVersionId) {
  const goals = (state?.goals || []).filter(row => row.status !== 'archived');
  return goals.find(row => row.id === draftGoalId)
    || goals.find(row => jobVersionId && row.materialLinks?.some(link => link.kind === 'job' && link.versionId === jobVersionId)) || null;
}
