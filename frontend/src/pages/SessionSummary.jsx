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

  // Randomized top-level scores (70-90) — generated once on mount
  const [randomScores, setRandomScores] = useState({
    posture: 80,
    eye: 80,
    clarity: 80,
    confidence: 80,
    questionPerf: 80,
  });

  useEffect(() => {
    // helper to get random integer between min and max inclusive
    function randBetween(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    setRandomScores({
      posture: randBetween(70, 90),
      eye: randBetween(70, 90),
      clarity: randBetween(70, 90),
      confidence: randBetween(70, 90),
      questionPerf: randBetween(70, 90),
    });
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If not provided, try to fetch using sessionId
  useEffect(() => {
    const sessionToFetch = providedSessionId || querySessionId;
    if (!perQuestionResults && sessionToFetch) {
      setLoading(true);
      api.getSession(sessionToFetch)
        .then((sessionData) => {
          if (sessionData.perQuestionResults) {
            setPerQuestionResults(sessionData.perQuestionResults);
          } else if (sessionData.results) {
            setPerQuestionResults(sessionData.results);
          } else if (Array.isArray(sessionData.chunks)) {
            const map = {};
            sessionData.chunks.forEach(c => {
              const qid = String(c.question_id || c.questionId || c.question);
              map[qid] = map[qid] || [];
              map[qid].push({ chunkIndex: c.chunkIndex, feedback: c.feedback || c });
            });
            setPerQuestionResults(map);
          } else {
            setPerQuestionResults(sessionData);
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

  // Compute aggregated metrics (still computed but top-level bars will show random values)
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

      chunks.forEach((c) => {
        const fb = c.feedback || {};
        if (typeof fb.clarity_score === "number") {
          qClaritySum += fb.clarity_score;
          qCount += 1;
        }
        if (typeof fb.confidence_score === "number") {
          qConfidenceSum += fb.confidence_score;
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

  // Use the randomized scores for display and HR review
  const postureScore = randomScores.posture;
  const eyeTrackingScore = randomScores.eye;
  const clarityPercent = randomScores.clarity;
  const confidencePercent = randomScores.confidence;
  const questionPerformanceAvg = randomScores.questionPerf;

  // ==== HR-style summary generator (updated copy) ====
  function ratingLabel(pct) {
    if (pct === null || pct === undefined) return "N/A";
    if (pct >= 85) return "Excellent";
    if (pct >= 70) return "Good";
    if (pct >= 50) return "Average";
    return "Needs improvement";
  }

  function generateHRReview() {
    const postureLabel = ratingLabel(postureScore);
    const eyeLabel = ratingLabel(eyeTrackingScore);
    const clarityLabel = ratingLabel(clarityPercent);
    const confidenceLabel = ratingLabel(confidencePercent);
    const questionPerfLabel = ratingLabel(questionPerformanceAvg);

    const paragraphs = [];

    // Short, recruiter-friendly summary
    paragraphs.push(
      `Snapshot: The session shows overall *${clarityLabel}* communication and *${confidenceLabel}* presence. Physical presentation was *${postureLabel}* and camera focus was *${eyeLabel}*. Question handling appears *${questionPerfLabel}*.`
    );

    // Key strengths — concise bullets (rendered as sentences here)
    const strengths = [];
    if (clarityPercent >= 75) strengths.push("delivers answers with structure and reasonable pace");
    if (confidencePercent >= 75) strengths.push("steady vocal presence and assured tone");
    if (postureScore >= 75) strengths.push("confident posture and minimal fidgeting");
    if (eyeTrackingScore >= 75) strengths.push("good camera engagement");
    if (!strengths.length) strengths.push("engaged and willing to answer follow-ups");

    paragraphs.push(`Strengths: ${strengths.join(", ")}.`);

    // Targeted improvement items
    const improvements = [];
    if (clarityPercent < 80) improvements.push("tighten explanations — aim for 45–90 second concise answers");
    if (confidencePercent < 80) improvements.push("practice breathing and pauses to remove filler words");
    if (postureScore < 80) improvements.push("adjust seating and camera height for a more open posture");
    if (eyeTrackingScore < 80) improvements.push("place a visual marker near the camera to improve eye contact");
    if (!improvements.length) improvements.push("continue refinement by recording short mock interviews for feedback");

    paragraphs.push(`Areas to work on: ${improvements.join("; ")}.`);

    // Practical next steps
    paragraphs.push(
      "Next steps: Do 2–3 timed mock answers per day (record and review), use STAR for behavioral examples, and run one live mock interview with a peer this week."
    );

    // Short recommendation
    const passable = [clarityPercent, confidencePercent, postureScore, eyeTrackingScore, questionPerformanceAvg].every(v => v >= 75);
    if (passable) {
      paragraphs.push("Recommendation: Candidate is ready for the next technical round — recommend scheduling a focused technical interview.");
    } else {
      paragraphs.push("Recommendation: Candidate benefits from a short coaching session focused on communication before moving forward.");
    }

    paragraphs.push("Closing: The candidate shows potential; focused practice will yield quick gains.");

    return paragraphs;
  }

  const hrReviewParagraphs = generateHRReview();

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

      {/* Top-level metrics (show randomized values between 70-90) */}
      <div style={{ display: 'grid', gap: 16, marginBottom: 28 }}>
        <ProgressBar label="Posture Score" percentage={postureScore} />
        <ProgressBar label="Eye Tracking Score" percentage={eyeTrackingScore} />
        <ProgressBar label="Clarity Score" percentage={clarityPercent} note={clarityPercent == null ? "N/A" : undefined} />
        <ProgressBar label="Confidence Score" percentage={confidencePercent} note={confidencePercent == null ? "N/A" : undefined} />
        <ProgressBar label="Question Performance" percentage={questionPerformanceAvg} note={questionPerformanceAvg == null ? "N/A" : undefined} />
      </div>

      {/* HR-style general review */}
      <div style={{ textAlign: 'left', marginTop: 8, background: '#0f0d12', padding: 18, borderRadius: 12 }}>
        <h3 style={{ color: '#d8c9ff', marginBottom: 8 }}>HR Review (Summary)</h3>

        {hrReviewParagraphs.map((para, idx) => (
          <p key={idx} style={{ color: '#cfc8f8', lineHeight: 1.5, marginBottom: 12 }}>
            {para}
          </p>
        ))}

        <div style={{ marginTop: 8, color: '#b9a3f5', fontWeight: 600 }}>
          Note: Scores above are randomized (70–90) for display/testing purposes.
        </div>
      </div>

      <p style={{
        marginTop: 28,
        fontWeight: '600',
        fontSize: '1.05rem',
        color: '#b9a3f5',
      }}>
        <strong>Overall Assessment:</strong> Keep practicing — review the recommended actions and focus on concise, structured answers.
      </p>
    </div>
  );
}
