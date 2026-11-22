import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  UserPlus,
  HeartHandshake,
  MessageCircle,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface PodQuestion {
  id: string;
  author: string;
  question: string;
  timestamp: string;
  answer?: {
    author: string;
    text: string;
    role: string;
  };
}

export interface LearningPod {
  podId: string;
  name: string;
  focusArea: string;
  membersCount: number;
  maxMembers: number;
  nextFlashSession: string;
  mentorName: string;
  description: string;
  questions: PodQuestion[];
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
    description:
      'Weekly sprint pod breaking down pandas transformations, real-world case studies, and resume portfolio reviews.',
    questions: [
      {
        id: 'q-101',
        author: 'Amina Rao',
        question: 'How should I structure my GitHub portfolio for returnee roles without enterprise experience?',
        timestamp: 'Yesterday',
        answer: {
          author: 'Dr. Sunita Sharma',
          role: 'Lead Mentor',
          text: 'Focus on 2 end-to-end projects with clear business impact summaries in the README, robust data cleaning pipelines, and SQL CTE scripts rather than 10 generic tutorial notebooks.',
        },
      },
      {
        id: 'q-102',
        author: 'Meera K.',
        question: 'Which SQL window functions are most commonly tested in initial screening rounds?',
        timestamp: '2 days ago',
        answer: {
          author: 'Dr. Sunita Sharma',
          role: 'Lead Mentor',
          text: 'DENSE_RANK() vs RANK(), running totals using SUM() OVER (PARTITION BY ... ORDER BY ...), and LAG/LEAD for month-over-month retention.',
        },
      },
    ],
  },
  {
    podId: 'pod-2',
    name: 'Frontend Architect Sisters',
    focusArea: 'React 19 & TypeScript Systems',
    membersCount: 3,
    maxMembers: 5,
    nextFlashSession: 'Thursday, 7:30 PM IST',
    mentorName: 'Priya Patel',
    description:
      'Collaborative code reviews, mock technical interview prep, and accessible design system building.',
    questions: [
      {
        id: 'q-201',
        author: 'Kavita S.',
        question: 'Is native React Context sufficient for state management in multi-view dashboards?',
        timestamp: '3 days ago',
        answer: {
          author: 'Priya Patel',
          role: 'Frontend Lead',
          text: 'Yes! Just make sure to memoize actions separately from state so child consumers do not trigger re-render cascades.',
        },
      },
    ],
  },
  {
    podId: 'pod-3',
    name: 'Returnee Runway Pod',
    focusArea: 'Career Re-entry & Project Leadership',
    membersCount: 2,
    maxMembers: 4,
    nextFlashSession: 'Saturday, 11:00 AM IST',
    mentorName: 'Ananya Roy',
    description:
      'Safe, empowering peer space for mothers and returnees building their confidence, agile skills, and corporate presence.',
    questions: [
      {
        id: 'q-301',
        author: 'Sunidhi B.',
        question: 'How should I talk about my 4-year caregiving break in behavioral interviews?',
        timestamp: 'Yesterday',
        answer: {
          author: 'Ananya Roy',
          role: 'People Operations Director',
          text: 'Frame it positively as strategic multi-stakeholder management, deliberate continuous learning, and 100% renewed commitment. Never apologize for giving care.',
        },
      },
    ],
  },
];

export const SisterhoodPods: React.FC = () => {
  const toast = useToast();
  const [pods, setPods] = useState<LearningPod[]>(INITIAL_PODS);
  const [joinedPodId, setJoinedPodId] = useState<string | null>('pod-1');
  const [expandedPodId, setExpandedPodId] = useState<string | null>('pod-1');
  const [questionInputs, setQuestionInputs] = useState<Record<string, string>>({});

  const handleJoin = (podId: string) => {
    setJoinedPodId(podId);
    setExpandedPodId(podId);
    setPods((prev) =>
      prev.map((p) =>
        p.podId === podId && p.membersCount < p.maxMembers
          ? { ...p, membersCount: p.membersCount + 1 }
          : p
      )
    );
    const pod = pods.find((p) => p.podId === podId);
    toast.success(`You have successfully joined "${pod?.name || 'the pod'}"!`, 'Sisterhood Pod');
  };

  const handleInputChange = (podId: string, value: string) => {
    setQuestionInputs((prev) => ({ ...prev, [podId]: value }));
  };

  const handleAskQuestion = (podId: string) => {
    const text = questionInputs[podId]?.trim();
    if (!text) {
      toast.warning('Please enter a question before submitting.', 'Empty Question');
      return;
    }

    const newQuestion: PodQuestion = {
      id: `q-${Date.now()}`,
      author: 'Amina Rao (You)',
      question: text,
      timestamp: 'Just now',
    };

    setPods((prev) =>
      prev.map((p) =>
        p.podId === podId ? { ...p, questions: [newQuestion, ...p.questions] } : p
      )
    );

    setQuestionInputs((prev) => ({ ...prev, [podId]: '' }));
    toast.success(
      'Your question has been added to the Flash AMA agenda! The mentor will address it in the upcoming session.',
      'Question Queued'
    );
  };

  return (
    <Card
      padding="lg"
      variant="glass"
      style={{ border: '1px solid rgba(8, 127, 140, 0.25)', marginBottom: 'var(--space-8)' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartHandshake size={20} style={{ color: 'var(--color-primary-600)' }} />
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 800,
                color: 'var(--color-gray-900)',
              }}
            >
              Sisterhood Learning Pods & Micro-Mentorship Circles
            </h2>
            <Badge variant="primary" size="sm">
              Peer Support
            </Badge>
          </div>
          <p
            style={{
              color: 'var(--color-gray-600)',
              fontSize: 'var(--font-size-sm)',
              marginTop: '4px',
            }}
          >
            Learn with peers, not in isolation. Join a micro-pod of 4-5 women tackling the exact same
            skill roadmap with bi-weekly 15-minute mentor flash AMAs and peer discussions.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-5)',
        }}
      >
        {pods.map((pod) => {
          const isJoined = joinedPodId === pod.podId;
          const isExpanded = expandedPodId === pod.podId;
          const isFull = pod.membersCount >= pod.maxMembers;
          const inputValue = questionInputs[pod.podId] || '';

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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <Badge variant={isJoined ? 'success' : isFull ? 'neutral' : 'accent'} size="sm">
                    {isJoined ? 'Joined Member' : `${pod.membersCount}/${pod.maxMembers} Members`}
                  </Badge>
                  <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontWeight: 600 }}>
                    Mentor: <strong style={{ color: 'var(--color-gray-800)' }}>{pod.mentorName}</strong>
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 800,
                    color: 'var(--color-gray-900)',
                    marginBottom: '4px',
                  }}
                >
                  {pod.name}
                </h3>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-primary-700)',
                    marginBottom: '8px',
                  }}
                >
                  {pod.focusArea}
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-gray-600)',
                    lineHeight: 1.5,
                    marginBottom: '14px',
                  }}
                >
                  {pod.description}
                </p>

                {/* Next Flash AMA time */}
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-gray-50)',
                    border: '1px solid var(--color-gray-200)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    color: 'var(--color-gray-700)',
                    marginBottom: '14px',
                  }}
                >
                  <Clock size={13} style={{ color: 'var(--color-accent-600)' }} />
                  <span>
                    Next Flash AMA: <strong>{pod.nextFlashSession}</strong>
                  </span>
                </div>

                {/* Expandable Q&A Thread Toggle */}
                <div style={{ marginBottom: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedPodId(isExpanded ? null : pod.podId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--color-primary-600)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>
                      {isExpanded ? 'Hide Discussion & AMA Q&A' : `View Q&A & Discussion (${pod.questions.length})`}
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Expanded Q&A Content */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        maxHeight: '260px',
                        overflowY: 'auto',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <HelpCircle size={12} /> Upcoming Flash AMA Agenda ({pod.questions.length})
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {pod.questions.map((q) => (
                          <div
                            key={q.id}
                            style={{
                              backgroundColor: '#ffffff',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '12px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px',
                              }}
                            >
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{q.author}</span>
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{q.timestamp}</span>
                            </div>
                            <div style={{ color: '#334155', marginBottom: q.answer ? '6px' : '0' }}>
                              {q.question}
                            </div>
                            {q.answer && (
                              <div
                                style={{
                                  backgroundColor: '#f0fdfa',
                                  borderLeft: '2px solid #0d9488',
                                  padding: '6px 8px',
                                  borderRadius: '0 6px 6px 0',
                                  fontSize: '11px',
                                }}
                              >
                                <span style={{ fontWeight: 700, color: '#0f766e' }}>
                                  {q.answer.author} ({q.answer.role}):{' '}
                                </span>
                                <span style={{ color: '#134e4a' }}>{q.answer.text}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Question submission form */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                        <input
                          type="text"
                          placeholder="Ask a question for upcoming AMA..."
                          value={inputValue}
                          onChange={(e) => handleInputChange(pod.podId, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAskQuestion(pod.podId);
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            fontSize: '11px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAskQuestion(pod.podId)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#087f8c',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Send size={11} /> Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-gray-100)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
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
