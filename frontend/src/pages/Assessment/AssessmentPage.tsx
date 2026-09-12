import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assessmentsApi, CreateAssessmentPayload } from '../../api/assessments';
import { skillsApi } from '../../api/skills';
import { Skill, SkillGapAssessment, ProficiencyEnum } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

const PRESET_ROLES = [
  'Junior Data Analyst',
  'Software Engineer (Frontend)',
  'Technical Project Manager',
  'Product Specialist / Operations',
  'AI & Machine Learning Associate',
];

export const AssessmentPage: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<SkillGapAssessment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Workflow State: 'history' | 'creating' | 'results'
  const [mode, setMode] = useState<'history' | 'creating' | 'results'>('history');
  const [targetRole, setTargetRole] = useState(PRESET_ROLES[0]);
  const [skillRatings, setSkillRatings] = useState<
    { skill_id: number; required_level: ProficiencyEnum; current_level: ProficiencyEnum }[]
  >([]);
  const [activeResult, setActiveResult] = useState<SkillGapAssessment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setIsLoading(true);
      try {
        const [aList, sList] = await Promise.all([
          assessmentsApi.getAssessments(user.user_id),
          skillsApi.getAllSkills(),
        ]);
        setAssessments(aList);
        setSkills(sList);
        if (aList.length > 0) {
          setActiveResult(aList[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [user]);

  const startNewAssessment = () => {
    // Populate default 4 skills for the selected target role
    const initialSkills = skills.slice(0, 4).map((s, idx) => ({
      skill_id: s.skill_id,
      required_level: (idx % 2 === 0 ? 'advanced' : 'intermediate') as ProficiencyEnum,
      current_level: 'beginner' as ProficiencyEnum,
    }));
    setSkillRatings(initialSkills);
    setMode('creating');
  };

  const handleRatingChange = (
    skillId: number,
    field: 'required_level' | 'current_level',
    val: ProficiencyEnum
  ) => {
    setSkillRatings(
      skillRatings.map((sr) => (sr.skill_id === skillId ? { ...sr, [field]: val } : sr))
    );
  };

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload: CreateAssessmentPayload = {
        user_id: user.user_id,
        target_role: targetRole,
        skill_ratings: skillRatings,
      };
      const result = await assessmentsApi.createAssessment(payload);
      setAssessments([result, ...assessments]);
      setActiveResult(result);
      setMode('results');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Skill-Gap Assessment"
        description="Benchmark your current capabilities against specific target roles. Discover required proficiencies and prioritized learning paths."
        action={
          mode !== 'creating' ? (
            <Button variant="primary" onClick={startNewAssessment}>
              ⚡ Take New Assessment
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setMode('history')}>
              Cancel
            </Button>
          )
        }
      />

      {/* CREATE ASSESSMENT WORKFLOW */}
      {mode === 'creating' && (
        <Card padding="lg" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
            Configure Role Assessment
          </h2>
          <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
            Select your desired target position and benchmark your proficiency for each required competency.
          </p>

          <form onSubmit={handleSubmitAssessment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Select
              label="Select Desired Target Role *"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              options={PRESET_ROLES.map((r) => ({ value: r, label: r }))}
            />

            <div>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--color-gray-800)', marginBottom: 'var(--space-3)' }}>
                Required Competencies Evaluation
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {skillRatings.map((sr) => {
                  const sObj = skills.find((s) => s.skill_id === sr.skill_id);
                  return (
                    <div
                      key={sr.skill_id}
                      style={{
                        padding: 'var(--space-4)',
                        backgroundColor: 'var(--color-gray-50)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-gray-200)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--space-4)',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: '600', color: 'var(--color-gray-900)' }}>
                          {sObj?.skill_name}
                        </span>
                        <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                          {sObj?.category}
                        </span>
                      </div>

                      <Select
                        label="Required for Role"
                        value={sr.required_level}
                        onChange={(e) =>
                          handleRatingChange(sr.skill_id, 'required_level', e.target.value as ProficiencyEnum)
                        }
                        options={[
                          { value: 'beginner', label: 'Beginner' },
                          { value: 'intermediate', label: 'Intermediate' },
                          { value: 'advanced', label: 'Advanced' },
                        ]}
                      />

                      <Select
                        label="Your Current Proficiency"
                        value={sr.current_level}
                        onChange={(e) =>
                          handleRatingChange(sr.skill_id, 'current_level', e.target.value as ProficiencyEnum)
                        }
                        options={[
                          { value: 'beginner', label: 'Beginner' },
                          { value: 'intermediate', label: 'Intermediate' },
                          { value: 'advanced', label: 'Advanced' },
                        ]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <Button type="button" variant="ghost" onClick={() => setMode('history')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Calculate Readiness & Identify Gaps →
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* RESULTS & HISTORY VIEW */}
      {mode !== 'creating' && activeResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Top Score Banner */}
          <Card padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
              <ProgressRing
                score={activeResult.overall_score || 0}
                size={160}
                label={`${activeResult.overall_score || 0}% Match`}
                sublabel={activeResult.target_role}
              />

              <div style={{ maxWidth: '460px' }}>
                <Badge variant="primary" size="md">
                  Assessment Report
                </Badge>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-gray-900)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  Readiness for {activeResult.target_role}
                </h2>
                <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                  Evaluated on {new Date(activeResult.assessed_at || '').toLocaleDateString()}.
                  We have mapped your identified competency gaps directly to tailored learning courses.
                </p>
                <Link to="/recommendations">
                  <Button variant="primary">
                    🎓 View Recommended Courses for These Gaps →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Detailed Skill Gap Breakdown (Sorted by largest gap first, per UI/UX doc) */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-4)' }}>
              Detailed Gap Analysis by Skill
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {activeResult.gap_details
                ?.slice()
                .sort((a, b) => (b.gap_score || 0) - (a.gap_score || 0))
                .map((gd) => {
                  const hasGap = (gd.gap_score || 0) > 0;
                  return (
                    <Card key={gd.gap_detail_id} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <span style={{ fontWeight: '600', color: 'var(--color-gray-900)', fontSize: 'var(--font-size-base)' }}>
                            {gd.skill?.skill_name || 'Skill Competency'}
                          </span>
                          <Badge variant={hasGap ? 'warning' : 'success'} size="sm">
                            {hasGap ? 'Gap Identified' : 'Meets Target'}
                          </Badge>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', marginTop: 'var(--space-1)' }}>
                          <span>Current Level: <strong>{gd.current_level}</strong></span>
                          <span>Required: <strong>{gd.required_level}</strong></span>
                        </div>
                      </div>

                      {/* Visual 2-point gap bar */}
                      <div style={{ minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-gray-500)' }}>
                          <span>Proficiency Gap</span>
                          <span>{hasGap ? `-${Math.round(gd.gap_score || 0)} pts` : 'Optimized'}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.max(15, 100 - (gd.gap_score || 0))}%`,
                              height: '100%',
                              backgroundColor: hasGap ? 'var(--color-warning)' : 'var(--color-success)',
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Past Assessment History list */}
          {assessments.length > 1 && (
            <div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-gray-800)', marginBottom: 'var(--space-3)' }}>
                Assessment History
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
                {assessments.map((a) => (
                  <button
                    key={a.assessment_id}
                    onClick={() => setActiveResult(a)}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${activeResult?.assessment_id === a.assessment_id ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
                      backgroundColor: activeResult?.assessment_id === a.assessment_id ? 'var(--color-primary-50)' : 'var(--color-white)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      minWidth: '220px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-900)' }}>
                      {a.target_role}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                      {a.overall_score}% • {new Date(a.assessed_at || '').toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
