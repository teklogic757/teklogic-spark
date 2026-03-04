export interface WeightedCriterionDefinition {
    name: string
    weight: number
}

export type CriterionScoreValue =
    | number
    | {
        score?: number | null
    }
    | null
    | undefined

export type CriterionScoreMap = Record<string, CriterionScoreValue>

export interface CanonicalScoreDetails {
    score: number
    weightedScore: number
    modelOverallScore: number | null
    deltaFromModel: number | null
    hasMaterialMismatch: boolean
}

const MIN_SCORE = 0
const MAX_SCORE = 100
const MATERIAL_MISMATCH_THRESHOLD = 1

export function normalizeScore(value: number): number {
    return Math.round(Math.min(MAX_SCORE, Math.max(MIN_SCORE, value)))
}

function getCriterionScore(entry: CriterionScoreValue): number {
    if (typeof entry === 'number') {
        return normalizeScore(entry)
    }

    if (entry && typeof entry === 'object' && typeof entry.score === 'number') {
        return normalizeScore(entry.score)
    }

    return 0
}

export function computeCanonicalWeightedScore(
    criteria: WeightedCriterionDefinition[],
    criteriaScores: CriterionScoreMap,
    modelOverallScore?: number | null
): CanonicalScoreDetails {
    const weightedScore = criteria.reduce((sum, criterion) => {
        const criterionScore = getCriterionScore(criteriaScores[criterion.name])
        return sum + (criterionScore * criterion.weight)
    }, 0)

    const score = normalizeScore(weightedScore)
    const normalizedModelScore =
        typeof modelOverallScore === 'number' && Number.isFinite(modelOverallScore)
            ? normalizeScore(modelOverallScore)
            : null
    const deltaFromModel = normalizedModelScore === null
        ? null
        : Math.abs(score - normalizedModelScore)

    return {
        score,
        weightedScore,
        modelOverallScore: normalizedModelScore,
        deltaFromModel,
        hasMaterialMismatch: deltaFromModel !== null && deltaFromModel >= MATERIAL_MISMATCH_THRESHOLD,
    }
}
