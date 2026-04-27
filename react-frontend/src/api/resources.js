import { apiGet, apiPost } from "../api.js";

const FALLBACK_ASSESSMENT_CATALOG = {
  assessments: [
    {
      id: "phq_9",
      name: "Patient Health Questionnaire–9",
      abbreviation: "PHQ-9",
      domain: ["depressive_symptoms", "screening", "progress_monitoring"],
      ageRange: "13+",
      completionTime: "approximately 2 minutes",
      administration: "therapist_assigned_self_report",
      clientVisibility: "client_completes_only",
      therapistVisibility: "full_results",
      items: [
        { itemNumber: 1, itemIndex: 0, itemText: "Little interest or pleasure in doing things", isRiskItem: false },
        { itemNumber: 2, itemIndex: 1, itemText: "Feeling down, depressed, or hopeless", isRiskItem: false },
        { itemNumber: 3, itemIndex: 2, itemText: "Trouble falling or staying asleep, or sleeping too much", isRiskItem: false },
        { itemNumber: 4, itemIndex: 3, itemText: "Feeling tired or having little energy", isRiskItem: false },
        { itemNumber: 5, itemIndex: 4, itemText: "Poor appetite or overeating", isRiskItem: false },
        { itemNumber: 6, itemIndex: 5, itemText: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", isRiskItem: false },
        { itemNumber: 7, itemIndex: 6, itemText: "Trouble concentrating on things, such as reading the newspaper or watching television", isRiskItem: false },
        { itemNumber: 8, itemIndex: 7, itemText: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", isRiskItem: false },
        { itemNumber: 9, itemIndex: 8, itemText: "Thoughts that you would be better off dead or of hurting yourself in some way", isRiskItem: true },
      ],
      responseScale: [
        { value: 0, label: "Not at all" },
        { value: 1, label: "Several days" },
        { value: 2, label: "More than half the days" },
        { value: 3, label: "Nearly every day" },
      ],
      scoring: {
        type: "sum",
        range: { min: 0, max: 27 },
      },
      severityBands: [
        { min: 0, max: 4, label: "No or minimal depressive symptoms", severityNumericLevel: 0 },
        { min: 5, max: 9, label: "Mild depressive symptoms", severityNumericLevel: 1 },
        { min: 10, max: 14, label: "Moderate depressive symptoms", severityNumericLevel: 2 },
        { min: 15, max: 19, label: "Moderately severe depressive symptoms", severityNumericLevel: 3 },
        { min: 20, max: 27, label: "Severe depressive symptoms", severityNumericLevel: 4 },
      ],
      subscaleScores: {},
      riskFlags: [
        {
          id: "item9_self_harm",
          label: "Item 9 endorsed: thoughts of death or self-harm",
          urgency: "critical",
          trigger: {
            itemIndex: 8,
            operator: ">",
            value: 0,
          },
          action: "Trigger visible system alert, highlight in therapist-facing report, require therapist follow-up, and prevent silent storage.",
        },
      ],
      outputs: [
        "totalScore",
        "severityLabel",
        "severityNumericLevel",
        "subscaleScores",
        "riskFlags",
        "changeScore",
        "clinicallySignificantChange",
        "requiresImmediateReview",
      ],
      version: "1.0.0",
      scoringVersion: "1.0.0",
      attribution: "Patient Health Questionnaire–9 (PHQ-9), developed by Kroenke, Spitzer, and Williams, 2001. MLC does not claim ownership of this instrument.",
      disclaimer: "screening only — clinical interpretation required",
      content: {
        overviewGeneral:
          "The Patient Health Questionnaire–9 (PHQ-9) is a 9-item self-report screening and outcome-monitoring measure for depressive symptoms over the previous 2 weeks. It reflects DSM-aligned depressive symptom domains and supports severity monitoring, but does not diagnose depression on its own.",
        overview: {
          therapistFacing:
            "The PHQ-9 supports structured screening, baseline symptom measurement, treatment planning, risk visibility, and progress monitoring for adolescents and adults aged 13 years and older. It can be used in intake, treatment review, stepped care, relapse monitoring, and depressive symptom-focused care.",
          clientFriendly:
            "This questionnaire asks about common symptoms of depression during the past 2 weeks. Your answers help your therapist understand how much these symptoms may be affecting you and whether they are changing over time.",
        },
        mlcUseContext:
          "Within MLC, PHQ-9 is therapist-assigned for intake, treatment monitoring, response review, risk-focused follow-up, and structured outcome tracking. It should be reviewed with presenting concern, therapy history, risk and safety profile, daily functioning, medical context, medication status, support system, substance use, and recent stressors. Item 9 must be handled as a visible risk-related item and reviewed by therapist when endorsed.",
        administrationInstructions:
          "PHQ-9 has 9 items rated over the previous 2 weeks with: 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day. Estimated completion time is approximately 2 minutes. Intended for therapist-assigned private completion by client with therapist interpretation.",
        scoringInterpretation:
          "Total score is the sum of all 9 items (0–27). Severity ranges: 0–4 No or minimal depressive symptoms; 5–9 Mild; 10–14 Moderate; 15–19 Moderately severe; 20–27 Severe depressive symptoms. A score of 10+ is commonly used as a clinical cutoff for increased likelihood of clinically significant depressive symptoms. Change score is current minus previous score; absolute change of 5+ points is commonly treated as clinically meaningful.",
        psychometricProperties:
          "PHQ-9 has broad validation evidence across primary care, adolescent, community, and international samples. Original validation reported strong internal consistency (around Cronbach alpha .89) and short-term test-retest reliability (around .84). Psychometric values and screening performance vary by population, setting, language, and comparison standard.",
        limitationsEthics:
          "PHQ-9 is not diagnostic. Interpretation requires clinical context including functioning, medical contributors, substance effects, grief/trauma, and broader history. Item 9 endorsement requires direct therapist follow-up, but crisis decisions should rely on full risk assessment (intent, plan, means, history, protective factors, supports, and immediate safety).",
        disclaimer:
          "This is a screening and progress-monitoring tool and not a standalone diagnostic instrument. Results must be interpreted by a qualified mental health professional.",
        attribution:
          "Patient Health Questionnaire–9 (PHQ-9), developed by Kroenke, Spitzer, and Williams, 2001. MLC does not claim ownership of this instrument.",
        references: [
          "Bianchi R et al. Is the PHQ-9 a unidimensional measure of depression? Psychological Assessment, 34(6), 595–603 (2022).",
          "Johansson R et al. Depression, anxiety and their comorbidity in the Swedish general population. PeerJ, 1:e98 (2013).",
          "Kocalevent R-D et al. Standardization of PHQ-9 in the general population. General Hospital Psychiatry, 35(5), 551–555 (2013).",
          "Kroenke K, Spitzer RL, Williams JBW. The PHQ-9. Journal of General Internal Medicine, 16(9), 606–613 (2001).",
          "Martin A et al. Validity of the Brief Patient Health Questionnaire Mood Scale. General Hospital Psychiatry, 28(1), 71–77 (2006).",
          "McMillan D et al. Defining successful treatment outcome in depression using PHQ-9. Journal of Affective Disorders, 127(1), 122–129 (2010).",
          "Richardson LP et al. Evaluation of PHQ-9 for detecting major depression among adolescents. Pediatrics, 126(6), 1117–1123 (2010).",
          "Urtasun M et al. Validation and calibration of PHQ-9 in Argentina. BMC Psychiatry, 19:291 (2019).",
        ],
      },
    },
  ],
  formatVersion: "fallback-v1",
};

const buildFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

const fetchWithFormData = async (path, method, payload) => {
  const base = ((typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE : null) || 
                (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE : null) || 
                "http://127.0.0.1:8000/api").replace(/\/+$/, "");
  let token = null;
  if (typeof window !== "undefined" && window.Clerk?.session?.getToken) {
    token = await window.Clerk.session.getToken();
  }
  const res = await fetch(`${base}/${path.replace(/^\/+/, "")}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: buildFormData(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
};

export const resourcesApi = {
  listResources() {
    return apiGet("resources/");
  },
  createResource(payload) {
    return fetchWithFormData("resources/", "POST", payload);
  },
  updateResource(id, payload) {
    return fetchWithFormData(`resources/${id}/`, "PATCH", payload);
  },
  deactivateResource(id) {
    return apiPost(`resources/${id}/deactivate/`, {});
  },
  listAssignments(clientId) {
    const query = clientId ? `?client=${clientId}` : "";
    return apiGet(`resource-assignments/${query}`);
  },
  assignResource(payload) {
    return apiPost("resource-assignments/", payload);
  },
  listClientAssignments() {
    return apiGet("client-resource-assignments/");
  },
  markAssignmentViewed(id) {
    return apiPost(`client-resource-assignments/${id}/mark_viewed/`, {});
  },
  markAssignmentCompleted(id) {
    return apiPost(`client-resource-assignments/${id}/mark_completed/`, {});
  },
  listFormAssignments(clientId) {
    const query = clientId ? `?client=${clientId}` : "";
    return apiGet(`client-form-assignments/${query}`);
  },
  listAssessmentCatalog() {
    return apiGet("client-form-assignments/assessment-catalog/").catch((err) => {
      const status = err?.response?.status;
      if (status === 404) {
        return FALLBACK_ASSESSMENT_CATALOG;
      }
      throw err;
    });
  },
  assignAssessment({ assigned_to, assessment_id, due_date, instructions }) {
    return apiPost("client-form-assignments/", {
      assigned_to,
      form_type: "assessment",
      assessment_id,
      due_date,
      instructions,
    });
  },
  submitAssessmentResponse(id, response_data) {
    return apiPost(`client-form-assignments/${id}/submit_response/`, { response_data });
  },
  adminTestAdministerAssessment({ assessment_id, responses, previousScore = null }) {
    return apiPost("client-form-assignments/admin-test-administer/", {
      assessment_id,
      responses,
      previousScore,
    });
  },
};
