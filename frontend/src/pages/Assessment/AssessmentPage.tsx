import React, { useState, useEffect, useCallback } from 'react';
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
import { EmptyState } from '../../components/ui/EmptyState';
import { CareerReturneeAnalyzer } from '../../components/assessment/CareerReturneeAnalyzer';
import { VoiceGuidanceButton } from '../../components/common/VoiceGuidanceButton';
import {
  Zap,
  BookOpen,
  History,
  Sliders,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'gap' | 'returnee'>('gap');
  const [targetRole, setTargetRole] = useState(PRESET_ROLES[0]);
  const [skillRatings, setSkillRatings] = useState<
    { skill_id: number; required_level: ProficiencyEnum; current_level: ProficiencyEnum }[]
  >([]);
  const [activeResult, setActiveResult] = useState<SkillGapAssessment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initData = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  useEffect(() => {
    initData();
  }, [initData]);

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
    setSkillRatings((prev) =>
      prev.map((sr) => (sr.skill_id === skillId ? { ...sr, [field]: val } : sr))
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
      setAssessments((prev) => [result, ...prev]);
      setActiveResult(result);
      setMode('results');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" color="var(--color-primary-500)" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Skill-Gap Assessment Laboratory"
        description="Benchmark your current capabilities against industry standards. Pinpoint exact competency deficits and discover customized learning roadmaps."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <VoiceGuidanceButton
              textToRead="Skill-Gap Assessment Laboratory. Benchmark your current capabilities against industry standards, or switch to the Break-to-Career Transformer to map your prior career pause experience into verified tech competencies."
              label="Audio Guidance"
            />
            {mode !== 'creating' ? (
              <Button variant="gradient" onClick={startNewAssessment}>
                <Zap size={16} /> Run New Assessment
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setMode('history')}>
                Cancel
              </Button>
            )}
          </div>
        }
      />

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('gap')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            border: `1.5px solid ${activeTab === 'gap' ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
            backgroundColor: activeTab === 'gap' ? 'var(--color-primary-50)' : 'var(--color-white)',
            color: activeTab === 'gap' ? 'var(--color-primary-700)' : 'var(--color-gray-700)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: activeTab === 'gap' ? 'var(--shadow-xs)' : 'none',
          }}
        >
          Target Role Gap Analysis
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('returnee')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            border: `1.5px solid ${activeTab === 'returnee' ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
            backgroundColor: activeTab === 'returnee' ? 'var(--color-primary-50)' : 'var(--color-white)',
            color: activeTab === 'returnee' ? 'var(--color-primary-700)' : 'var(--color-gray-700)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: activeTab === 'returnee' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🔄 Break-to-Career Transformer (Women Returnees)</span>
        </button>
      </div>

      {activeTab === 'returnee' ? (
        <CareerReturneeAnalyzer />
      ) : (
        <div>

      {/* CREATE ASSESSMENT WORKFLOW */}
      {mode === 'creating' && (
        <Card padding="lg" variant="glass" style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
            <Sliders size={20} style={{ color: 'var(--color-primary-500)' }} />
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
              Configure Role Assessment Matrix
            </h2>
          </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-gray-800)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Required Competencies Evaluation
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                  {skillRatings.length} Skills Evaluated
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {skillRatings.map((sr) => {
                  const sObj = skills.find((s) => s.skill_id === sr.skill_id);
                  return (
                    <div
                      key={sr.skill_id}
                      style={{
                        padding: 'var(--space-4)',
                        backgroundColor: 'var(--color-white)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-gray-200)',
                        boxShadow: 'var(--shadow-xs)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--space-4)',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', fontSize: '14px' }}>
                          {sObj?.skill_name}
                        </span>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                          Category: {sObj?.category || 'Technical'}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-4)' }}>
              <Button type="button" variant="ghost" onClick={() => setMode('history')}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" size="lg" isLoading={isSubmitting}>
                Calculate Readiness & Identify Gaps →
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* RESULTS & HISTORY VIEW */}
      {mode !== 'creating' && activeResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Top Score Bento Card */}
          <Card padding="lg" variant="glass">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
              <ProgressRing
                score={activeResult.overall_score || 0}
                size={180}
                strokeWidth={14}
                sublabel={activeResult.target_role}
              />

              <div style={{ maxWidth: '480px' }}>
                <Badge variant="primary" size="sm" hasDot style={{ marginBottom: '8px' }}>
                  Assessment Report
                </Badge>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em' }}>
                  Readiness: {activeResult.target_role}
                </h2>
                <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                  Evaluated on {new Date(activeResult.assessed_at || '').toLocaleDateString()}.
                  Your score reflects an objective comparison of current proficiency versus requirements. We have prioritized targeted learning pathways below to bridge these gaps.
                </p>
                <Link to="/recommendations">
                  <Button variant="gradient" size="md">
                    <BookOpen size={16} /> View Recommended Courses for These Gaps →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Detailed Skill Gap Breakdown */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
                  Competency Gap Breakdown
                </h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                  Sorted with the largest skill deficits first to optimize your learning schedule
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                {activeResult.gap_details?.length || 0} Competencies Scored
              </Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {activeResult.gap_details
                ?.slice()
                .sort((a, b) => (b.gap_score || 0) - (a.gap_score || 0))
                .map((gd) => {
                  const hasGap = (gd.gap_score || 0) > 0;
                  return (
                    <Card key={gd.gap_detail_id} padding="md" variant="glass" hoverEffect>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-gray-900)', fontSize: 'var(--font-size-base)' }}>
                              {gd.skill?.skill_name || 'Skill Competency'}
                            </span>
                            <Badge variant={hasGap ? 'coral' : 'mint'} size="sm" hasDot>
                              {hasGap ? 'Gap Identified' : 'Meets Target'}
                            </Badge>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                            <span>
                              Current: <strong style={{ color: 'var(--color-gray-800)', textTransform: 'capitalize' }}>{gd.current_level}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Required: <strong style={{ color: 'var(--color-primary-700)', textTransform: 'capitalize' }}>{gd.required_level}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Visual Gap Meter */}
                        <div style={{ minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-600)' }}>
                            <span>Proficiency Alignment</span>
                            <span style={{ color: hasGap ? 'var(--color-coral-600)' : 'var(--color-success)' }}>
                              {hasGap ? `-${Math.round(gd.gap_score || 0)} pts` : 'Optimized'}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.max(15, 100 - (gd.gap_score || 0))}%`,
                                height: '100%',
                                background: hasGap
                                  ? 'var(--gradient-coral)'
                                  : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                borderRadius: 'var(--radius-full)',
                                transition: 'width 0.8s ease',
                              }}
                            />
                          </div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                <History size={18} style={{ color: 'var(--color-gray-500)' }} />
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                  Assessment History Cycles
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
                {assessments.map((a) => (
                  <button
                    key={a.assessment_id}
                    onClick={() => setActiveResult(a)}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      border: `1.5px solid ${activeResult?.assessment_id === a.assessment_id ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
                      backgroundColor: activeResult?.assessment_id === a.assessment_id ? 'var(--color-primary-50)' : 'var(--color-white)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      minWidth: '220px',
                      transition: 'all var(--transition-fast)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-900)' }}>
                      {a.target_role}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                      {a.overall_score}% Match • {new Date(a.assessed_at || '').toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State when no assessments exist */}
      {mode !== 'creating' && !activeResult && (
        <EmptyState
          title="No skill gap assessments yet"
          description="Benchmark your current capabilities against industry standards. Pinpoint exact competency deficits and receive tailored course recommendations."
          actionLabel="Run Your First Assessment"
          onAction={startNewAssessment}
          icon={<Zap size={28} />}
        />
      )}
        </div>
      )}
    </div>
  );
};
