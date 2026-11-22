import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { skillsApi } from '../../api/skills';
import { Skill, UserSkill, ProficiencyEnum } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { VoiceGuidanceButton } from '../../components/common/VoiceGuidanceButton';
import { useToast } from '../../context/ToastContext';
import {
  Target,
  Plus,
  Trash2,
  Zap,
  Lightbulb,
  Search,
} from 'lucide-react';

export const SkillInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Add Skill Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyEnum>('beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedSkillId === '') return;
    setIsSubmitting(true);
    try {
      const added = await skillsApi.addUserSkill(user.user_id, Number(selectedSkillId), selectedLevel);
      setUserSkills((prev) => [...prev, added]);
      setIsModalOpen(false);
      setSelectedSkillId('');
      setSelectedLevel('beginner');
      toast.success('Skill added to your inventory!');
    } catch {
      toast.error('Failed to log skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLevelChange = async (skillId: number, newLevel: ProficiencyEnum) => {
    try {
      const updated = await skillsApi.updateUserSkill(skillId, newLevel);
      setUserSkills((prev) => prev.map((us) => (us.skill_id === skillId ? { ...us, proficiency_level: newLevel } : us)));
      toast.info(`Proficiency updated to ${newLevel}.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update proficiency level.');
    }
  };

  const handleDelete = async (skillId: number) => {
    if (!window.confirm('Remove this skill from your inventory?')) return;
    try {
      await skillsApi.deleteUserSkill(skillId);
      setUserSkills((prev) => prev.filter((us) => us.skill_id !== skillId));
      toast.info('Skill removed from inventory.');
    } catch {
      toast.error('Failed to remove skill.');
    }
  };

  // Filter skills based on search & category
  const filteredUserSkills = userSkills.filter((us) => {
    const matchesSearch = us.skill?.skill_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      (us.skill?.category && us.skill.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Technical', 'Data', 'Design', 'Soft Skills'];

  const availableSkillsToAdd = allSkills.filter(
    (s) => !userSkills.some((us) => us.skill_id === s.skill_id)
  );

  return (
    <div>
      <PageTitle
        title="My Skill Inventory"
        description="Maintain a verified catalog of your competencies and proficiencies to power personalized readiness gap analysis."
        action={
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <VoiceGuidanceButton
              textToRead="Skill Inventory. Track and maintain a verified catalog of your technical and professional skills. Log your proficiencies to power personalized readiness gap analysis and unlock targeted job recommendations."
              label="Audio Tour"
            />
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Log New Skill
            </Button>
            {userSkills.length >= 3 && (
              <Link to="/assessment">
                <Button variant="gradient">
                  <Zap size={16} /> Run Gap Assessment
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Tip Banner with Lucide Icon */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          background: 'linear-gradient(135deg, rgba(8,127,140,0.06) 0%, rgba(167,139,250,0.08) 100%)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--glass-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lightbulb size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Tip for accurate readiness scoring
            </h4>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)' }}>
              Log at least 3 to 5 skills with realistic proficiency ratings before running an assessment against target roles.
            </p>
          </div>
        </div>
        <Badge variant="primary" size="sm" hasDot>
          {userSkills.length} Logged Skills
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--color-primary-500)' : 'var(--color-gray-200)',
                backgroundColor: selectedCategory === cat ? 'var(--color-primary-50)' : 'var(--color-white)',
                color: selectedCategory === cat ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ width: '100%', maxWidth: '280px' }}>
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <Spinner size="lg" color="var(--color-primary-500)" />
        </div>
      ) : filteredUserSkills.length === 0 ? (
        <EmptyState
          title={userSkills.length === 0 ? 'No skills logged yet' : 'No matching skills found'}
          description={
            userSkills.length === 0
              ? 'Log your technical proficiencies to unlock customized gap scoring and course recommendations.'
              : 'Try clearing your search query or selecting another category filter.'
          }
          actionLabel={userSkills.length === 0 ? 'Log Your First Skill' : 'Clear Filter'}
          onAction={() => {
            if (userSkills.length === 0) setIsModalOpen(true);
            else {
              setSearchQuery('');
              setSelectedCategory('All');
            }
          }}
          icon={<Target size={28} />}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 'var(--space-5)' }}>
          {filteredUserSkills.map((us) => (
            <Card key={us.user_skill_id} padding="md" variant="glass" hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <Badge variant={us.skill?.category === 'Technical' ? 'primary' : 'accent'} size="sm">
                  {us.skill?.category || 'Skill'}
                </Badge>
                <button
                  onClick={() => handleDelete(us.skill_id)}
                  aria-label={`Remove ${us.skill?.skill_name}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-gray-400)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-error)';
                    e.currentTarget.style.backgroundColor = 'var(--color-error-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-gray-400)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Remove Skill"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-4)' }}>
                {us.skill?.skill_name}
              </h3>

              <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-gray-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                    Proficiency
                  </span>
                  <Badge
                    variant={
                      us.proficiency_level === 'advanced'
                        ? 'mint'
                        : us.proficiency_level === 'intermediate'
                        ? 'primary'
                        : 'neutral'
                    }
                    size="sm"
                    hasDot
                  >
                    {us.proficiency_level}
                  </Badge>
                </div>

                {/* 3-level segmented button selector */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                    backgroundColor: 'var(--color-gray-100)',
                    padding: '3px',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {(['beginner', 'intermediate', 'advanced'] as ProficiencyEnum[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleLevelChange(us.skill_id, lvl)}
                      style={{
                        padding: '5px 2px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        backgroundColor: us.proficiency_level === lvl ? 'var(--color-white)' : 'transparent',
                        color: us.proficiency_level === lvl ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                        boxShadow: us.proficiency_level === lvl ? 'var(--shadow-xs)' : 'none',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
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
