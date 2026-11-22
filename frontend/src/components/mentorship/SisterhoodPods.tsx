import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Users, Sparkles, Calendar, Clock, CheckCircle2, UserPlus, HeartHandshake, MessageCircle } from 'lucide-react';

interface LearningPod {
  podId: string;
  name: string;
  focusArea: string;
  membersCount: number;
  maxMembers: number;
  nextFlashSession: string;
  mentorName: string;
  description: string;
}

const INITIAL_PODS: LearningPod[] = [
  {
    podId: 'pod-1',
    name: 'Data Pioneers Circle',
    focusArea: 'Junior Data Analyst (SQL & Python)',
    membersCount: 4,
    maxMembers: 5,
    nextFlashSession: 'Tomorrow, 6:00 PM IST',
    mentorName: 'Dr. Sunita Sharma',
    description: 'Weekly sprint pod breaking down pandas transformations, real-world case studies, and resume portfolio reviews.',
  },
  {
    podId: 'pod-2',
    name: 'Frontend Architect Sisters',
    focusArea: 'React 19 & TypeScript Systems',
    membersCount: 3,
    maxMembers: 5,
    nextFlashSession: 'Thursday, 7:30 PM IST',
    mentorName: 'Priya Patel',
    description: 'Collaborative code reviews, mock technical interview prep, and accessible design system building.',
  },
  {
    podId: 'pod-3',
    name: 'Returnee Runway Pod',
    focusArea: 'Career Re-entry & Project Leadership',
    membersCount: 2,
    maxMembers: 4,
    nextFlashSession: 'Saturday, 11:00 AM IST',
    mentorName: 'Ananya Roy',
    description: 'Safe, empowering peer space for mothers and returnees building their confidence, agile skills, and corporate presence.',
  },
];

export const SisterhoodPods: React.FC = () => {
  const [pods, setPods] = useState<LearningPod[]>(INITIAL_PODS);
  const [joinedPodId, setJoinedPodId] = useState<string | null>(null);

  const handleJoin = (podId: string) => {
    setJoinedPodId(podId);
    setPods((prev) =>
      prev.map((p) =>
        p.podId === podId && p.membersCount < p.maxMembers
          ? { ...p, membersCount: p.membersCount + 1 }
          : p
      )
    );
  };

  return (
    <Card padding="lg" variant="glass" style={{ border: '1px solid rgba(8, 127, 140, 0.25)', marginBottom: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartHandshake size={20} style={{ color: 'var(--color-primary-600)' }} />
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
              Sisterhood Learning Pods & Micro-Mentorship Circles
            </h2>
            <Badge variant="primary" size="sm">Peer Support</Badge>
          </div>
          <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            Learn with peers, not in isolation. Join a micro-pod of 4-5 women tackling the exact same skill roadmap with bi-weekly 15-minute mentor flash AMAs.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 'var(--space-4)' }}>
        {pods.map((pod) => {
          const isJoined = joinedPodId === pod.podId;
          const isFull = pod.membersCount >= pod.maxMembers;

          return (
            <div
              key={pod.podId}
              style={{
                padding: 'var(--space-5)',
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-xl)',
                border: `1.5px solid ${isJoined ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
                boxShadow: isJoined ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Badge variant={isJoined ? 'success' : isFull ? 'neutral' : 'accent'} size="sm">
                    {isJoined ? 'Joined Member' : `${pod.membersCount}/${pod.maxMembers} Members`}
                  </Badge>
                  <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontWeight: 600 }}>
                    Mentor: <strong style={{ color: 'var(--color-gray-800)' }}>{pod.mentorName}</strong>
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
                  {pod.name}
                </h3>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary-700)', marginBottom: '8px' }}>
                  {pod.focusArea}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-gray-600)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {pod.description}
                </p>

                {/* Next Flash AMA time */}
                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-gray-700)', marginBottom: '14px' }}>
                  <Clock size={13} style={{ color: 'var(--color-accent-600)' }} />
                  <span>Next Flash AMA: <strong>{pod.nextFlashSession}</strong></span>
                </div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-gray-100)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="sm"
                  variant={isJoined ? 'outline' : 'primary'}
                  disabled={isFull && !isJoined}
                  onClick={() => handleJoin(pod.podId)}
                >
                  {isJoined ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Member of Pod</span>
                    </>
                  ) : isFull ? (
                    <span>Pod Full</span>
                  ) : (
                    <>
                      <UserPlus size={13} />
                      <span>Join Sisterhood Pod</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
