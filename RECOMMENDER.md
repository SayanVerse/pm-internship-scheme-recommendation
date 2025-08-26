# PM Internship Recommender - Scoring Algorithm

This document describes the AI-light recommendation engine used in the PM Internship Recommender system. The algorithm uses rule-based scoring without heavy ML dependencies, making it fast, transparent, and easy to adjust.

## 🎯 Algorithm Overview

The recommendation system matches candidates with internships using a weighted scoring system that evaluates multiple compatibility factors. The final score is normalized to 0-100, with higher scores indicating better matches.

## 📊 Scoring Components

### 1. Skills Match Score (0-60 points) - 60% weight

**Algorithm**: Jaccard Similarity Index

```
Jaccard = |intersection| / |union|
Score = Jaccard × 60
```

**Implementation**:

- Compares candidate skills array with internship required skills
- Case-insensitive matching
- Rewards both breadth and depth of skill overlap

**Example**:

```
Candidate: ["JavaScript", "React", "Python", "SQL"]
Internship: ["JavaScript", "React", "Node.js", "MongoDB"]

Intersection: ["JavaScript", "React"] = 2 skills
Union: ["JavaScript", "React", "Python", "SQL", "Node.js", "MongoDB"] = 6 skills
Jaccard = 2/6 = 0.333
Skills Score = 0.333 × 60 = 20 points
```

**Tuning Parameters**:

- `SKILLS_WEIGHT = 60` - Maximum points for skills match
- Consider fuzzy matching for similar skill names (future enhancement)

### 2. Sector Interest Score (0-20 points) - 20% weight

**Primary Matching**:

- Direct sector match: 20 points
- Partial sector match: 12 points (contains/contained by)
- No match: 0 points

**Semantic Fallback**:
If no direct sector match, check for skill-based semantic alignment:

```javascript
const sectorKeywords = {
  IT: ["javascript", "python", "programming", "software", "web"],
  Healthcare: ["medical", "health", "biology", "research"],
  Agriculture: ["farming", "agriculture", "rural", "field work"],
  Education: ["teaching", "content writing", "research"],
  Finance: ["excel", "finance", "accounting", "data analysis"],
};
```

**Scoring**:

- Direct match: 20 points
- Semantic skill match: 8 points
- No match: 0 points

**Example**:

```
Candidate Interests: ["IT", "Finance"]
Internship Sector: "IT"
→ Direct match = 20 points

Candidate Interests: ["Healthcare"]
Internship Sector: "IT"
Candidate Skills: ["JavaScript", "Python"]
→ Semantic match (IT keywords in skills) = 8 points
```

### 3. Location Preference Score (0-15 points) - 15% weight

**Remote Internships**: 50% of maximum (7.5 points)

**Location Matching Hierarchy**:

1. **PIN Code Proximity** (15 points):
   - Same first 3 digits = 15 points
   - Different areas = 3 points

2. **Preferred Location Match** (12 points):
   - City/state name found in preferred locations
   - Case-insensitive partial matching

3. **Fallback** (3 points):
   - Any location data available

**Implementation**:

```javascript
function locationScore(
  candidatePin,
  preferredLocations,
  internshipCity,
  internshipState,
  internshipPin,
  isRemote,
) {
  if (isRemote) return 7.5;

  if (candidatePin && internshipPin) {
    const candidateArea = candidatePin.substring(0, 3);
    const internshipArea = internshipPin.substring(0, 3);
    if (candidateArea === internshipArea) return 15;
  }

  const locationString = `${internshipCity}, ${internshipState}`.toLowerCase();
  for (const preferred of preferredLocations) {
    if (locationString.includes(preferred.toLowerCase())) return 12;
  }

  return 3; // Fallback points
}
```

### 4. Inclusion Bonus (0-5 points) - 5% weight

**Rural Candidate Bonus**:

- Rural candidates (`ruralFlag = true`) get bonus points for sectors that typically serve rural areas
- Eligible sectors: Agriculture, Education, Public Admin
- Bonus: 5 points

**Purpose**: Encourages rural candidates to consider relevant opportunities

## 🔧 Filtering & Eligibility

Before scoring, internships are filtered for basic eligibility:

### Education Level Filter

```javascript
const EDUCATION_HIERARCHY = {
  TENTH_PLUS_TWO: 1,
  DIPLOMA: 2,
  UNDERGRADUATE: 3,
  POSTGRADUATE: 4,
};

// Candidate level must be >= required level
candidateLevel >= internshipRequiredLevel;
```

### Active & Deadline Filter

- `internship.active = true`
- `internship.deadline >= today`

## 📈 Final Scoring & Ranking

### Score Calculation

```javascript
const totalScore = Math.min(
  100,
  skillsScore + sectorScore + locationScore + inclusionBonus,
);
```

### Ranking Algorithm

1. **Primary**: Score (descending)
2. **Tie-breaker**: Deadline (ascending) - prioritize urgent deadlines

### Top Results

- Return top 5 recommendations
- Include match explanations for transparency

## 🎭 Match Explanation Generation

For each recommendation, generate up to 3 explanation bullets:

1. **Skills**: "You have X of Y required skills: [skill1, skill2, skill3]"
2. **Sector**: "Strong match with your interest in [sector] sector"
3. **Location**: "Remote work available" or "Located in your preferred area: [city, state]"

## ⚙️ Configuration & Tuning

### Adjustable Parameters

**Weights** (in `server/routes/recommend.ts`):

```javascript
const SKILLS_WEIGHT = 60; // 0-60 points
const SECTOR_WEIGHT = 20; // 0-20 points
const LOCATION_WEIGHT = 15; // 0-15 points
const INCLUSION_WEIGHT = 5; // 0-5 points
```

**Thresholds**:

```javascript
const MIN_SCORE_THRESHOLD = 10; // Minimum score to recommend
const MAX_RECOMMENDATIONS = 5; // Top N results
const SEMANTIC_BONUS = 8; // Points for semantic sector match
const RURAL_BONUS = 5; // Rural inclusion bonus
```

### Tuning Guidelines

**Increase Skills Weight** if:

- Users report irrelevant skill matches
- Want to prioritize technical fit over other factors

**Increase Sector Weight** if:

- Users want stronger alignment with career interests
- Cross-sector recommendations are unwanted

**Increase Location Weight** if:

- Geographic preferences are critical
- Remote work adoption is low

## 🔍 Performance Considerations

### Algorithm Complexity

- **Time**: O(n × m) where n = internships, m = average skills per internship
- **Space**: O(1) for scoring, O(n) for results
- **Typical runtime**: <100ms for 1000+ internships

### Optimization Opportunities

1. **Skill indexing**: Pre-compute skill vectors for faster matching
2. **Caching**: Cache scores for repeated profile/internship combinations
3. **Lazy loading**: Score only top candidates after initial filtering
4. **Batch processing**: Group similar profiles for bulk recommendations

## 📊 Monitoring & Analytics

### Key Metrics to Track

- **Score distribution**: Understand typical matching quality
- **Component contributions**: Which factors matter most
- **User feedback**: Click-through and application rates by score
- **Bias detection**: Ensure fair recommendations across demographics

### Recommended Dashboards

```
Average Scores by:
- Education level
- Geographic region
- Sector preference
- Skills count

Conversion Rates by:
- Score ranges (90-100, 80-89, etc.)
- Match explanation types
- Time to application
```

## 🚀 Future Enhancements

### Short-term (Rule-based improvements)

1. **Fuzzy skill matching**: Handle variations like "JS" vs "JavaScript"
2. **Skill synonyms**: Map related skills (e.g., "React" → "Frontend")
3. **Experience weighting**: Factor in years of experience per skill
4. **Company preference**: Consider organization type preferences

### Medium-term (Light ML)

1. **TF-IDF similarity**: Better text matching for descriptions
2. **Collaborative filtering**: "Users like you also applied to..."
3. **Learning rankings**: Adjust weights based on successful placements
4. **Seasonal adjustments**: Account for application cycles

### Long-term (Advanced ML)

1. **Embedding models**: Semantic similarity for skills/sectors
2. **Deep learning**: End-to-end recommendation neural networks
3. **Real-time learning**: Adapt to user behavior in real-time
4. **Multi-modal**: Include resume parsing, portfolio analysis

## 🔧 Troubleshooting

### Common Issues

**Low Scores Across Board**:

- Check skill name standardization
- Verify sector mapping accuracy
- Consider lowering minimum thresholds

**Geographic Bias**:

- Review PIN code proximity logic
- Add more remote opportunities
- Weight location preferences appropriately

**Skill Mismatch**:

- Audit skill taxonomy completeness
- Add common skill aliases
- Consider fuzzy matching implementation

### Debug Mode

Enable detailed scoring logs:

```javascript
const DEBUG_SCORING = process.env.DEBUG_SCORING === "true";
```

This will output detailed score breakdowns for troubleshooting.

---

**Algorithm Design**: Transparent, fast, and tunable for the PM Internship Scheme requirements.
