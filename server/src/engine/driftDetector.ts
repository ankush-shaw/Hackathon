import * as diff from 'diff';
import type { RevisionDiff, Finding, CampaignRevision } from '../types/index.js';

export function calculateCampaignDrift(
  previousRevision: CampaignRevision,
  newContent: string,
  newScore: number,
  newFindings: Finding[]
): RevisionDiff {
  const oldContent = previousRevision.content;
  const wordDiffs = diff.diffWords(oldContent, newContent);

  const addedWords: string[] = [];
  const removedWords: string[] = [];

  for (const part of wordDiffs) {
    if (part.added) {
      addedWords.push(part.value.trim());
    } else if (part.removed) {
      removedWords.push(part.value.trim());
    }
  }

  // Detect modified claims
  const oldClaims = previousRevision.findings.map(f => f.matchedText);
  const newClaims = newFindings.map(f => f.matchedText);

  const modifiedClaims: string[] = [];
  for (const nc of newClaims) {
    if (!oldClaims.includes(nc)) {
      modifiedClaims.push(`Newly introduced claim: "${nc}"`);
    }
  }
  for (const oc of oldClaims) {
    if (!newClaims.includes(oc)) {
      modifiedClaims.push(`Resolved claim: "${oc}"`);
    }
  }

  return {
    addedWords: addedWords.filter(w => w.length > 0),
    removedWords: removedWords.filter(w => w.length > 0),
    modifiedClaims,
    scoreDiff: newScore - previousRevision.score,
    previousScore: previousRevision.score,
    newScore
  };
}

