// src/pages/SessionSummary.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import api from "../services/api";

export default function SessionSummary() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();

  // try these sources (priority):
  // 1) location.state.perQuestionResults
  // 2) location.state.sessionId
  // 3) ?sessionId=...
  const providedResults = state && state.perQuestionResults ? state.perQuestionResults : null;
  const providedSessionId = state && state.sessionId ? state.sessionId : null;
  const querySessionId = searchParams.get("sessionId");

  const [perQuestionResults, setPerQuestionResults] = useState(providedResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If not provided, try to fetch using sessionId
  useEffect(() => {
    const sessionToFetch = providedSessionId || querySessionId;
    if (!perQuestionResults && sessionToFetch) {
      setLoading(true);
      api.getSession(sessionToFetch)
        .then((sessionData) => {
          // sessionData shape depends on backend. We expect either:
          // { perQuestionResults: { qid: [...] } } OR the direct perQuestionResults object
          if (sessionData.perQuestionResults) {
            setPerQuestionResults(sessionData.perQuestionResults);
          } else if (sessionData.results) {
            // alternate shape
            setPerQuestionResults(sessionData.results);
          } else {
            // If backend stores chunks as array, convert to mapping {qid: [chunks]}
            // Example fallback: sessionData.chunks = [{question_id, chunkIndex, feedback}, ...]
            if (Array.isArray(sessionData.chunks)) {
              const map = {};
              sessionData.chunks.forEach(c => {
                const qid = String(c.question_id || c.questionId || c.question);
                map[qid] = map[qid] || [];
                map[qid].push({ chunkIndex: c.chunkIndex, feedback: c.feedback || c });
              });
              setPerQuestionResults(map);
            } else {
              // Last resort: set raw sessionData
              setPerQuestionResults(sessionData);
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || String(err));
          setLoading(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute aggregated metrics (same logic as earlier)
  const aggregated = useMemo(() => {
    if (!perQuestionResults) return null;

    const qIds = Object.keys(perQuestionResults);
    let overallClaritySum = 0;
    let overallConfidenceSum = 0;
    let clarityCount = 0;
    let confidenceCount = 0;
    const questionSummaries = {};

    qIds.forEach((qid) => {
      const chunks = perQuestionResults[qid] || [];
      let qClaritySum = 0;
      let qConfidenceSum = 0;
      let qCount = 0;
      const transcripts = [];

      chunks.forEach((c) => {
        const fb = c.feedback || {};
        if (typeof fb.clarity_score === "number") {
          qClaritySum += fb.clarity_score;
          qCount += 1;
        }
        if (typeof fb.confidence_score === "number") {
          qConfidenceSum += fb.confidence_score;
        }
        if (fb.transcript) {
          transcripts.push({ chunkIndex: c.chunkIndex, text: fb.transcript });
        }
      });

      const avgClarity = qCount ? qClaritySum / qCount : null;
      const avgConfidence = qCount ? qConfidenceSum / qCount : null;

      if (avgClarity !== null) {
        overallClaritySum += avgClarity;
        clarityCount += 1;
      }
      if (avgConfidence !== null) {
        overallConfidenceSum += avgConfidence;
        confidenceCount += 1;
      }

      const questionPerformance = avgClarity !== null ? Math.round(avgClarity * 100) : null;

      questionSummaries[qid] = {
        chunks,
        transcripts,
        avgClarity,
        avgConfidence,
        questionPerformance,
      };
    });

    const avgClarityOverall = clarityCount ? overallClaritySum / clarityCount : null;
    const avgConfidenceOverall = confidenceCount ? overallConfidenceSum / confidenceCount : null;

    return {
      questionSummaries,
      avgClarityOverall,
      avgConfidenceOverall,
    };
  }, [perQuestionResults]);

  // Placeholder posture / eye-tracking can be replaced by backend-provided values
  const postureScore = 78;
  const eyeTrackingScore = 85;

  const clarityPercent = aggregated && aggregated.avgClarityOverall !== null
    ? Math.round(aggregated.avgClarityOverall * 100)
    : null;

  const confidencePercent = aggregated && aggregated.avgConfidenceOverall !== null
    ? Math.round(aggregated.avgConfidenceOverall * 100)
    : null;

  const questionPerformanceAvg = aggregated
    ? (() => {
        const vals = Object.values(aggregated.questionSummaries)
          .map(q => q.questionPerformance)
          .filter(v => v !== null && v !== undefined);
        if (!vals.length) return null;
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      })()
    : null;

  return (
    <div style={{
      maxWidth: 950,
      margin: '60px auto',
      textAlign: 'center',
      backgroundColor: '#121212',
      padding: 32,
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.9)',
      color: '#e0e0e0',
      fontFamily: "'Alan', sans-serif",
    }}>
      <h2 style={{
        color: '#a37acc',
        fontWeight: '700',
        fontSize: '2rem',
        marginBottom: 24
      }}>
        Session Summary
      </h2>

      {loading && <div style={{ color: '#9b8ad6', marginBottom: 12 }}>Loading session results...</div>}
      {error && <div style={{ color: '#ff8aa1', marginBottom: 12 }}>Error: {error}</div>}

      {!perQuestionResults && !loading && !error && (
        <div style={{ color: '#f7c6ff', marginBottom: 20 }}>
          No session results were provided. Provide a <code>sessionId</code> in query string or navigate with state.
        </div>
      )}

      {/* Top-level metrics */}
      <div style={{ display: 'grid', gap: 16, marginBottom: 28 }}>
        <ProgressBar label="Posture Score" percentage={postureScore} />
        <ProgressBar label="Eye Tracking Score" percentage={eyeTrackingScore} />
        <ProgressBar label="Clarity Score" percentage={clarityPercent ?? 0} note={clarityPercent == null ? "N/A" : undefined} />
        <ProgressBar label="Confidence Score" percentage={confidencePercent ?? 0} note={confidencePercent == null ? "N/A" : undefined} />
        <ProgressBar label="Question Performance" percentage={questionPerformanceAvg ?? 0} note={questionPerformanceAvg == null ? "N/A" : undefined} />
      </div>

      {/* Per-question breakdown */}
      {aggregated ? (
        <div style={{ textAlign: 'left', marginTop: 8 }}>
          <h3 style={{ color: '#d8c9ff', marginBottom: 8 }}>Per-question breakdown</h3>
          {Object.entries(aggregated.questionSummaries).map(([qid, q]) => (
            <div key={qid} style={{ background: '#0f0d12', padding: 14, borderRadius: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Question {qid}</strong>
                <div style={{ fontSize: 13, color: '#b9a3f5' }}>
                  {q.questionPerformance !== null ? `Performance: ${q.questionPerformance}%` : 'Performance: N/A'}
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ color: '#cfc8f8', marginBottom: 8 }}>
                  <strong>Average Clarity:</strong> {q.avgClarity !== null ? q.avgClarity.toFixed(2) : "N/A"}
                  {"  "}
                  <strong style={{ marginLeft: 10 }}>Average Confidence:</strong> {q.avgConfidence !== null ? q.avgConfidence.toFixed(2) : "N/A"}
                </div>

                <div>
                  <strong>Transcripts (by chunk):</strong>
                  {q.transcripts.length === 0 && <div style={{ color: '#9b8ad6' }}>No transcript available yet.</div>}
                  {q.transcripts.map(t => (
                    <div key={t.chunkIndex} style={{ padding: 6, background: '#0b0910', borderRadius: 6, marginTop: 6 }}>
                      <div style={{ fontSize: 13, color: '#e9e6ff' }}>
                        <strong>Chunk {t.chunkIndex}:</strong> {t.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 12, color: '#b9a3f5' }}>
          Waiting for results...
        </div>
      )}

      <p style={{
        marginTop: 28,
        fontWeight: '600',
        fontSize: '1.05rem',
        color: '#b9a3f5',
      }}>
        <strong>Overall Assessment:</strong> Keep practicing — review per-question feedback and try to reduce filler words and increase clarity.
      </p>
    </div>
  );
}
