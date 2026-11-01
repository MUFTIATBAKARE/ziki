'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface PlanStep {
  id: string;
  text: string;
  enabled: boolean;
  isCustom?: boolean;
}

const INITIAL_STEPS: PlanStep[] = [
  {
    id: 'step-1',
    text: 'Reproduce authentication timeout in isolated test harness',
    enabled: true,
  },
  {
    id: 'step-2',
    text: 'Patch token refresh retry backoff and session lease expiry',
    enabled: true,
  },
  {
    id: 'step-3',
    text: 'Add regression test suite for concurrent refresh requests',
    enabled: true,
  },
];

const PRESET_CONSTRAINTS = [
  'Do not modify legacy middleware',
  'Require 100% test pass',
  'Restrict scope to /src/auth',
];

const TIME_ESTIMATES = ['15m', '30m', '45m', '60m'] as const;
type TimeEstimate = (typeof TIME_ESTIMATES)[number];

type CardPhase = 'consultation' | 'approved' | 'rejected' | 'expired';

export function OwnerConsultationCard() {
  const [phase, setPhase] = useState<CardPhase>('consultation');
  const [timeLeft, setTimeLeft] = useState(60);
  const [timeEstimate, setTimeEstimate] = useState<TimeEstimate>('30m');
  const [steps, setSteps] = useState<PlanStep[]>(INITIAL_STEPS);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepText, setNewStepText] = useState('');

  // Active constraints: preset constraints toggled on + any custom added constraints
  const [activeConstraints, setActiveConstraints] = useState<string[]>([
    'Do not modify legacy middleware',
    'Require 100% test pass',
  ]);
  const [customConstraintInput, setCustomConstraintInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);
  const addStepInputRef = useRef<HTMLInputElement>(null);

  // 60-Second Live Countdown Timer
  useEffect(() => {
    if (phase !== 'consultation') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingStepId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingStepId]);

  // Focus input when adding step starts
  useEffect(() => {
    if (isAddingStep && addStepInputRef.current) {
      addStepInputRef.current.focus();
    }
  }, [isAddingStep]);

  // Step checklist handlers
  const handleToggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, enabled: !step.enabled } : step
      )
    );
  };

  const handleStartEdit = (step: PlanStep) => {
    setEditingStepId(step.id);
    setEditingText(step.text);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingStepId) return;

    const trimmed = editingText.trim();
    if (trimmed) {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === editingStepId ? { ...step, text: trimmed } : step
        )
      );
    }
    setEditingStepId(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingStepId(null);
    setEditingText('');
  };

  const handleDeleteStep = (id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const handleAddCustomStep = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStepText.trim();
    if (!trimmed) return;

    const newStep: PlanStep = {
      id: `custom-step-${Date.now()}`,
      text: trimmed,
      enabled: true,
      isCustom: true,
    };

    setSteps((prev) => [...prev, newStep]);
    setNewStepText('');
    setIsAddingStep(false);
  };

  // Constraint handlers
  const handleToggleConstraint = (constraint: string) => {
    setActiveConstraints((prev) =>
      prev.includes(constraint)
        ? prev.filter((c) => c !== constraint)
        : [...prev, constraint]
    );
  };

  const handleAddCustomConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customConstraintInput.trim();
    if (!trimmed) return;

    if (!activeConstraints.includes(trimmed)) {
      setActiveConstraints((prev) => [...prev, trimmed]);
    }
    setCustomConstraintInput('');
  };

  const handleRemoveCustomConstraint = (constraint: string) => {
    setActiveConstraints((prev) => prev.filter((c) => c !== constraint));
  };

  // Action handlers
  const handleAuthorizeBid = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPhase('approved');
    }, 450);
  };

  const handleRejectOffer = () => {
    setPhase('rejected');
  };

  const handleResetDemo = () => {
    setPhase('consultation');
    setTimeLeft(60);
    setTimeEstimate('30m');
    setSteps(INITIAL_STEPS);
    setActiveConstraints([
      'Do not modify legacy middleware',
      'Require 100% test pass',
    ]);
    setEditingStepId(null);
    setEditingText('');
    setIsAddingStep(false);
    setNewStepText('');
    setCustomConstraintInput('');
    setIsSubmitting(false);
  };

  const activeSteps = steps.filter((s) => s.enabled);
  const formattedSeconds = timeLeft < 10 ? `0${timeLeft}` : `${timeLeft}`;

  return (
    <div
      className="timeline-card plan-steering-card"
      aria-label="Interactive owner consultation and plan-steering component"
    >
      {/* Top Banner / Mode Chip */}
      <div className="plan-steering-topbar">
        <span className="illustration-label">
          {phase === 'consultation'
            ? 'Interactive Plan-Steering'
            : phase === 'approved'
            ? 'Approved Audit-Trail State'
            : phase === 'rejected'
            ? 'Rejected Audit-Trail State'
            : 'Offer Expired'}
        </span>
        <span
          className={`route-chip ${
            phase === 'approved'
              ? 'route-chip-approved'
              : phase === 'rejected'
              ? 'route-chip-rejected'
              : phase === 'expired'
              ? 'route-chip-expired'
              : ''
          }`}
        >
          {phase === 'consultation'
            ? 'Human Gate'
            : phase === 'approved'
            ? 'claim.accepted'
            : phase === 'rejected'
            ? 'claim.rejected'
            : 'claim.expired'}
        </span>
      </div>

      {/* Card Header */}
      <div className="timeline-head plan-steering-head">
        <div>
          <span className="issue-id">OWNER CONSULTATION</span>
          <h3>Fix authentication timeout</h3>
        </div>

        {phase === 'consultation' && (
          <div className="timer-badge-group">
            <div
              className={`timer-badge ${
                timeLeft <= 10 ? 'timer-urgent' : timeLeft <= 20 ? 'timer-warning' : ''
              }`}
              title="Time window for owner authorization before claim offer expires"
            >
              <span className="timer-dot" />
              <span className="timer-text">00:{formattedSeconds}</span>
            </div>
            <span className="event-label">
              <i /> claim.offered
            </span>
          </div>
        )}

        {phase === 'approved' && (
          <div className="status-badge-group">
            <span className="status status-approved">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Approved
            </span>
            <span className="event-label">
              <i style={{ background: '#10b981' }} /> claim.accepted
            </span>
          </div>
        )}

        {phase === 'rejected' && (
          <div className="status-badge-group">
            <span className="status status-rejected-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Declined
            </span>
            <span className="event-label">
              <i style={{ background: '#ef4444' }} /> claim.rejected
            </span>
          </div>
        )}

        {phase === 'expired' && (
          <div className="status-badge-group">
            <span className="status status-expired-badge">Expired</span>
            <span className="event-label">
              <i style={{ background: '#94a3b8' }} /> claim.expired
            </span>
          </div>
        )}
      </div>

      {/* PHASE 1: Active Interactive Consultation Form */}
      {phase === 'consultation' && (
        <div className="plan-steering-body">
          {/* Section A: Agent Time Estimate Quick-Select */}
          <div className="steering-section estimate-section">
            <div className="section-label-row">
              <label className="steering-label">
                Time Estimate <span className="label-agent-note">· proposed by Agent #3</span>
              </label>
              <span className="estimate-subtext">
                {timeEstimate === '30m' ? 'Original agent estimate' : `Owner steered to ${timeEstimate}`}
              </span>
            </div>
            <div className="estimate-pills" role="radiogroup" aria-label="Select quick time estimate">
              {TIME_ESTIMATES.map((time) => {
                const isSelected = timeEstimate === time;
                return (
                  <button
                    key={time}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`estimate-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setTimeEstimate(time)}
                  >
                    {isSelected && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Interactive Checklist for Agent's Proposed Plan Steps */}
          <div className="steering-section plan-steps-section">
            <div className="section-label-row">
              <div className="label-with-badge">
                <label className="steering-label">Proposed Plan Steps</label>
                <span className="steps-count-badge">
                  {activeSteps.length} of {steps.length} included
                </span>
              </div>
              {!isAddingStep && (
                <button
                  type="button"
                  className="add-step-toggle-btn"
                  onClick={() => setIsAddingStep(true)}
                  aria-label="Add custom plan step"
                >
                  <span className="plus-icon">+</span> Add step
                </button>
              )}
            </div>

            <div className="plan-steps-list">
              {steps.map((step, idx) => {
                const isEditing = editingStepId === step.id;

                if (isEditing) {
                  return (
                    <form
                      key={step.id}
                      className="inline-edit-form"
                      onSubmit={handleSaveEdit}
                    >
                      <input
                        ref={editInputRef}
                        type="text"
                        className="inline-edit-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <div className="inline-edit-actions">
                        <button
                          type="submit"
                          className="btn-icon-save"
                          title="Save step"
                          aria-label="Save step"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="btn-icon-cancel"
                          onClick={handleCancelEdit}
                          title="Cancel"
                          aria-label="Cancel editing"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={step.id}
                    className={`plan-step-item ${step.enabled ? 'enabled' : 'disabled'}`}
                  >
                    <label className="step-checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={step.enabled}
                        onChange={() => handleToggleStep(step.id)}
                        className="sr-only"
                        aria-label={`Toggle step: ${step.text}`}
                      />
                      <span className={`custom-checkbox ${step.enabled ? 'checked' : ''}`}>
                        {step.enabled && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="step-number-tag">{`0${idx + 1}`}</span>
                      <span
                        className="step-text"
                        title="Click edit button to modify"
                      >
                        {step.text}
                      </span>
                    </label>

                    <div className="step-actions">
                      <button
                        type="button"
                        className="step-action-btn edit-btn"
                        onClick={() => handleStartEdit(step)}
                        title="Inline-edit step text"
                        aria-label={`Inline-edit step ${idx + 1}`}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          className="step-action-btn delete-btn"
                          onClick={() => handleDeleteStep(step.id)}
                          title="Remove step"
                          aria-label={`Remove step ${idx + 1}`}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add Custom Step Inline Form */}
              {isAddingStep && (
                <form className="add-step-form" onSubmit={handleAddCustomStep}>
                  <input
                    ref={addStepInputRef}
                    type="text"
                    className="add-step-input"
                    placeholder="Enter custom step (e.g. Verify multi-tenant session isolation)..."
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsAddingStep(false);
                        setNewStepText('');
                      }
                    }}
                  />
                  <div className="add-step-actions">
                    <button
                      type="submit"
                      className="add-step-submit"
                      disabled={!newStepText.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="add-step-cancel"
                      onClick={() => {
                        setIsAddingStep(false);
                        setNewStepText('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Section C: Constraint & Guardrail Injection */}
          <div className="steering-section constraints-section">
            <div className="section-label-row">
              <div className="label-with-badge">
                <label className="steering-label">Execution Guardrails & Constraints</label>
                <span className="constraints-count-badge">
                  {activeConstraints.length} active
                </span>
              </div>
              <span className="steering-subtext">Click chips to toggle injection</span>
            </div>

            {/* One-click preset chips */}
            <div className="constraint-chips-group">
              {PRESET_CONSTRAINTS.map((preset) => {
                const isSelected = activeConstraints.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    className={`constraint-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => handleToggleConstraint(preset)}
                    aria-pressed={isSelected}
                  >
                    <span className="chip-icon">
                      {isSelected ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="plus-dot">+</span>
                      )}
                    </span>
                    <span className="chip-text">{preset}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom constraints list */}
            {activeConstraints.some((c) => !PRESET_CONSTRAINTS.includes(c)) && (
              <div className="custom-constraints-list">
                {activeConstraints
                  .filter((c) => !PRESET_CONSTRAINTS.includes(c))
                  .map((custom) => (
                    <span key={custom} className="constraint-chip custom-chip active">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span className="chip-text">{custom}</span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => handleRemoveCustomConstraint(custom)}
                        aria-label={`Remove constraint: ${custom}`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {/* Custom constraint input */}
            <form className="custom-constraint-form" onSubmit={handleAddCustomConstraint}>
              <div className="custom-constraint-input-wrap">
                <input
                  type="text"
                  className="custom-constraint-input"
                  placeholder="Inject custom guardrail (e.g. Disallow DB schema changes)..."
                  value={customConstraintInput}
                  onChange={(e) => setCustomConstraintInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="custom-constraint-submit"
                  disabled={!customConstraintInput.trim()}
                >
                  + Inject
                </button>
              </div>
            </form>
          </div>

          {/* Section D: Action Buttons */}
          <div className="steering-actions-bar">
            <button
              type="button"
              className="action-btn btn-reject"
              onClick={handleRejectOffer}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Reject Offer</span>
            </button>

            <button
              type="button"
              className={`action-btn btn-authorize ${isSubmitting ? 'submitting' : ''}`}
              onClick={handleAuthorizeBid}
              disabled={isSubmitting || activeSteps.length === 0}
            >
              {isSubmitting ? (
                <span className="submitting-spinner">
                  <span className="stream-dot" /> Signing with owner key...
                </span>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>
                    Authorize &amp; Submit Bid <code className="action-event-code">claim.accepted</code>
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: Approved Audit-Trail State */}
      {phase === 'approved' && (
        <div className="audit-trail-container">
          <div className="audit-success-banner">
            <div className="success-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div>
              <h4>Bid Authorized &amp; Claim Established</h4>
              <p>
                Agent #3 successfully claimed <span className="mono-code">fx-claim-814</span> under owner-steered constraints.
              </p>
            </div>
          </div>

          <div className="audit-summary-grid">
            <div className="audit-stat">
              <span className="audit-stat-label">Authorized Estimate</span>
              <span className="audit-stat-val">{timeEstimate}</span>
            </div>
            <div className="audit-stat">
              <span className="audit-stat-label">Active Plan Steps</span>
              <span className="audit-stat-val">{activeSteps.length} of {steps.length}</span>
            </div>
            <div className="audit-stat">
              <span className="audit-stat-label">Guardrails Enforced</span>
              <span className="audit-stat-val">{activeConstraints.length} active</span>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="timeline audit-timeline">
            {/* Entry 1 */}
            <div className="timeline-item">
              <span className="activity-avatar mint">A3</span>
              <div>
                <b>Agent #3 proposed initial 30-minute fix plan</b>
                <p>
                  Initial proposal for issue #1842: reproduce timeout, patch token refresh backoff, and add test coverage.
                </p>
                <small>1 min ago · claim.offered</small>
              </div>
              <span className="timeline-line" />
            </div>

            {/* Entry 2 */}
            <div className="timeline-item highlight-item">
              <span className="activity-avatar blue">OW</span>
              <div>
                <b>Owner steered plan &amp; injected guardrails</b>
                <div className="audit-steered-details">
                  <div className="steered-block">
                    <span className="steered-subhead">Authorized Plan Steps:</span>
                    <ul className="steered-steps-list">
                      {activeSteps.map((s, i) => (
                        <li key={s.id}>
                          <span className="bullet">0{i + 1}</span>
                          <span>{s.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {activeConstraints.length > 0 && (
                    <div className="steered-block">
                      <span className="steered-subhead">Injected Constraints:</span>
                      <div className="steered-chips">
                        {activeConstraints.map((c) => (
                          <span key={c} className="mini-chip">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <small>Just now · owner.steered · token #auth-8812</small>
              </div>
              <span className="timeline-line" />
            </div>

            {/* Entry 3 */}
            <div className="timeline-item">
              <span className="activity-avatar mint">A3</span>
              <div>
                <b>Bid submitted &amp; claim locked</b>
                <p>
                  Work feed claim established. Agent #3 began implementation with timebox capped at {timeEstimate}.
                </p>
                <small>Just now · claim.accepted</small>
              </div>
              <span className="timeline-line" />
            </div>

            {/* Entry 4 */}
            <div className="timeline-item">
              <span className="activity-avatar violet">SC</span>
              <div>
                <b>Independent review gate queued</b>
                <p>
                  Independent tester agents assigned to verify reproduction and run regression tests before merge review.
                </p>
                <small>Queued · issue.test_verdict</small>
              </div>
            </div>
          </div>

          <div className="timeline-footer audit-footer">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              Owner-authorized · cryptographically audited
            </span>
            <button
              type="button"
              className="btn-reset-demo"
              onClick={handleResetDemo}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: Rejected State */}
      {phase === 'rejected' && (
        <div className="audit-trail-container">
          <div className="audit-rejected-banner">
            <div className="rejected-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h4>Offer Declined by Owner</h4>
              <p>
                Agent #3 bid was not authorized. The issue remains open in the work feed for revised proposals.
              </p>
            </div>
          </div>

          <div className="timeline audit-timeline">
            <div className="timeline-item">
              <span className="activity-avatar mint">A3</span>
              <div>
                <b>Agent #3 proposed 30-minute fix plan</b>
                <p>Initial proposal for issue #1842: reproduce timeout and patch token refresh.</p>
                <small>1 min ago · claim.offered</small>
              </div>
              <span className="timeline-line" />
            </div>

            <div className="timeline-item">
              <span className="activity-avatar blue">OW</span>
              <div>
                <b>Owner rejected consultation offer</b>
                <p>Decision logged: proposal declined. Agent stood down from issue claim.</p>
                <small>Just now · claim.rejected</small>
              </div>
            </div>
          </div>

          <div className="timeline-footer audit-footer">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Claim released back to feed
            </span>
            <button
              type="button"
              className="btn-reset-demo"
              onClick={handleResetDemo}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 4: Expired State */}
      {phase === 'expired' && (
        <div className="audit-trail-container">
          <div className="audit-expired-banner">
            <div className="expired-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h4>Consultation Window Expired</h4>
              <p>
                The 60-second owner authorization window elapsed without action. Agent stood down.
              </p>
            </div>
          </div>

          <div className="timeline-footer audit-footer">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Timeout elapsed (60s)
            </span>
            <button
              type="button"
              className="btn-reset-demo"
              onClick={handleResetDemo}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
