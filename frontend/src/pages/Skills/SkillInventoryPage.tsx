import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { skillsApi } from '../../api/skills';
import { Skill, UserSkill, ProficiencyEnum } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';

export const SkillInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Skill Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyEnum>('beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [us, sList] = await Promise.all([
        skillsApi.getUserSkills(user.user_id),
        skillsApi.getAllSkills(),
      ]);
      setUserSkills(us);
      setAllSkills(sList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedSkillId === '') return;
    setIsSubmitting(true);
    try {
      const added = await skillsApi.addUserSkill(user.user_id, Number(selectedSkillId), selectedLevel);
      setUserSkills([...userSkills, added]);
      setIsModalOpen(false);
      setSelectedSkillId('');
      setSelectedLevel('beginner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLevelChange = async (userSkillId: number, newLevel: ProficiencyEnum) => {
    try {
      const updated = await skillsApi.updateUserSkill(userSkillId, newLevel);
      setUserSkills(userSkills.map((us) => (us.user_skill_id === userSkillId ? updated : us)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userSkillId: number) => {
    if (!window.confirm('Remove this skill from your inventory?')) return;
    await skillsApi.deleteUserSkill(userSkillId);
    setUserSkills(userSkills.filter((us) => us.user_skill_id !== userSkillId));
  };

  // Filter out already added skills for the dropdown
  const availableSkillsToAdd = allSkills.filter(
    (s) => !userSkills.some((us) => us.skill_id === s.skill_id)
  );

  return (
    <div>
      <PageTitle
        title="My Skill Inventory"
        description="Maintain a verified catalog of your technical competencies and soft skills. These form the baseline for role readiness assessments."
        action={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + Log New Skill
            </Button>
            {userSkills.length >= 3 && (
              <Link to="/assessment">
                <Button variant="outline">⚡ Run Assessment →</Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Guidance banner */}
      <div
        style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-primary-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-primary-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '1.5rem' }}>💡</span>
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-900)' }}>
              Tip for accurate assessment
            </h4>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-800)' }}>
              Add at least 3 to 5 skills with honest proficiency levels before taking a role readiness assessment.
            </p>
          </div>
        </div>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-primary-700)' }}>
          {userSkills.length} Skill{userSkills.length === 1 ? '' : 's'} Logged
        </span>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      ) : userSkills.length === 0 ? (
        <EmptyState
          title="No skills logged yet"
          description="Log your existing technical, management, and soft skills to unlock tailored gap assessments and course recommendations."
          actionLabel="Log Your First Skill"
          onAction={() => setIsModalOpen(true)}
          icon="🎯"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {userSkills.map((us) => (
            <Card key={us.user_skill_id} padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <Badge variant={us.skill?.category === 'Technical' ? 'primary' : 'neutral'} size="sm">
                    {us.skill?.category || 'Skill'}
                  </Badge>
                  <button
                    onClick={() => handleDelete(us.user_skill_id)}
                    aria-label={`Remove ${us.skill?.skill_name}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-gray-400)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)',
                    }}
                    title="Remove Skill"
                  >
                    🗑️
                  </button>
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-4)' }}>
                  {us.skill?.skill_name}
                </h3>
              </div>

              <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-gray-100)' }}>
                <label
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-gray-500)',
                    display: 'block',
                    marginBottom: 'var(--space-1)',
                    textTransform: 'uppercase',
                  }}
                >
                  Proficiency Level
                </label>
                <select
                  value={us.proficiency_level}
                  onChange={(e) => handleLevelChange(us.user_skill_id, e.target.value as ProficiencyEnum)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-gray-300)',
                    backgroundColor: 'var(--color-gray-50)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log a Skill to Your Profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSkill} isLoading={isSubmitting} disabled={selectedSkillId === ''}>
              Save Skill
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Select
            label="Select Skill from Catalog *"
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(Number(e.target.value))}
            options={[
              { value: '', label: '-- Choose a Skill --' },
              ...availableSkillsToAdd.map((s) => ({
                value: s.skill_id,
                label: `${s.skill_name} (${s.category || 'General'})`,
              })),
            ]}
          />

          <Select
            label="Your Current Proficiency Level *"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as ProficiencyEnum)}
            options={[
              { value: 'beginner', label: 'Beginner (Basic understanding or early learner)' },
              { value: 'intermediate', label: 'Intermediate (Practical hands-on experience)' },
              { value: 'advanced', label: 'Advanced (Proficient / Professional expertise)' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};
