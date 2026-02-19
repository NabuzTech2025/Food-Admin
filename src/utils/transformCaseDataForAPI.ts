import type {
  AdvancedPlanTabData,
  MedicalCaseFormData,
  MedicineTabData,
  OffInterv,
  PlanTabData,
  SectionConfig,
} from "@/components/Admin/Forms/Case/types/CreateCaseForm.type";
import { camelCaseToReadable } from "./camelCaseToReadable";
import { sectionSpecificOptions } from "@/components/Admin/Forms/Case/types/constent";

export const transformCaseDataForAPI = (formData: MedicalCaseFormData) => {
  const {
    caseIntroductionTab,
    patientInformationTab,
    objectiveAssessmentTab,
    planTab,
    advancedPlanTab,
    offIntervTab,
    otherTreatmentPlanTab,
    treatmentPlanTab,
    caseMetadata,
  } = formData;

  if (!caseMetadata) {
    throw new Error("Case metadata is required but was not provided");
  }

  return {
    // Case metadata fields
    title: caseMetadata.caseName,
    description: caseMetadata.description,
    plan_type: caseMetadata.plan.toUpperCase(), // "FREE", "BASIC", "PRO"
    unitIds: parseIdsToArray(caseMetadata.unitIds),
    case_attributes: caseMetadata.attributes,
    caseIconImageUrl: caseMetadata.caseIconImageUrl as string,
    caseCoverImageUrl: caseMetadata.caseCoverImageUrl as string,
    caseDuration: caseMetadata.caseDuration,

    // Case introduction fields
    chiefComplaint: caseIntroductionTab.chiefComplaint,
    historyPresentIllness: caseIntroductionTab.historyPresentIllness,

    // These fields need to be added to your form or provided with default values
    correct_diagnosis: "Acute Myocardial Infarction (STEMI)", // Add this field to your form
    correct_dispastion: "Admit to CCU for immediate cardiac catheterization", // Add this field to your form
    author_name: "Dr. Unknown", // Get from user context
    isPaid: false,
    difficulty: "MEDIUM", // "EASY", "MEDIUM", "HARD"
    score_max: 100,

    // Category IDs - parse from caseMetadata.caseCategory
    categoryIds: parseIdsToArray(caseMetadata.caseCategory),

    // Patient data transformation
    patientData: {
      patientName: patientInformationTab.patientName,
      patientAge: patientInformationTab.patientAge,
      gender: patientInformationTab.gender,
      lastVisitDate: patientInformationTab.lastVisitDate,
      isNewPatient: patientInformationTab.isNewPatient,
      ethnicity: patientInformationTab.ethnicity,
      currentMedications: patientInformationTab.currentMedications,
      vitalSigns: patientInformationTab.vitalSigns,
      pastMedicalHistory: patientInformationTab.pastMedicalHistory,
      pastSurgicalHistory: patientInformationTab.pastSurgicalHistory,
      priorLabImaging: patientInformationTab.priorLabImaging,
      labFiles: [] as string[], // Add file upload handling if needed
      allergies: patientInformationTab.allergies,
      vaccinationRecords: transformVaccinationRecords(
        patientInformationTab.vaccinationRecords,
      ),
      familyMedicalHistory: patientInformationTab.familyMedicalHistory,
      socialHistory: patientInformationTab.socialHistory.map(
        (item) => item.value,
      ),
      reviewOfSystems: patientInformationTab.reviewOfSystems,
    },

    // Objective data transformation
    objectiveData: objectiveAssessmentTab
      ? {
          generalAppearance: objectiveAssessmentTab.generalAppearance || "",
          physicalExam: transformPhysicalExam(
            objectiveAssessmentTab.physicalExam,
          ),
        }
      : undefined,

    // Office Interventions data transformation (Tab 4)
    officeInterventions: offIntervTab
      ? transformOfficeInterventions(offIntervTab)
      : undefined,

    // Plan data transformation
    planData: planTab ? transformPlanData(planTab) : undefined,

    // Advanced Plan data transformation (NOW ONLY Lab Work, Imaging, Patient Education)
    advancedPlanData: advancedPlanTab
      ? transformAdvancedPlanData(advancedPlanTab)
      : undefined,

    // Other Treatment Plan transformation (NOW INCLUDES Screening, Vaccination, Follow-up)
    otherTreatmentPlan: otherTreatmentPlanTab
      ? transformOtherTreatmentPlanData(otherTreatmentPlanTab)
      : undefined,

    // Treatment Plan transformation
    treatmentPlanTab:
      treatmentPlanTab?.specialists && treatmentPlanTab.specialists.length > 0
        ? { specialists: treatmentPlanTab.specialists }
        : undefined,
  };
};

// ========================= Common ID Parser =========================
/**
 * Converts various data types (string, number, or array) into an array of numbers
 * @param data - Can be a number, string (comma-separated or single), or array
 * @param defaultValue - Default ID to return if data is empty (default: 1)
 * @returns Array of valid numbers
 */
const parseIdsToArray = (
  data: string | number | number[] | null | undefined,
  defaultValue: number = 1,
): number[] => {
  // If it's already an array
  if (Array.isArray(data)) {
    return data
      .map((id) => (typeof id === "number" ? id : parseInt(String(id), 10)))
      .filter((id) => !isNaN(id));
  }

  // If it's a single number
  if (typeof data === "number") {
    return data > 0 ? [data] : [defaultValue];
  }

  // If it's a string (comma-separated like "1,2,3" or single value like "1")
  if (typeof data === "string") {
    if (!data || data.trim() === "") {
      return [defaultValue]; // Default if empty
    }

    // Split by comma and convert to numbers
    return data
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id))
      .filter((id) => id > 0); // Only positive numbers
  }

  // Fallback to default if null/undefined
  return [defaultValue];
};

// ========================= Vaccination Records =========================
const transformVaccinationRecords = (
  vaccinationRecords: Record<string, string | null>,
): Record<string, string | null> => {
  const transformed: Record<string, string | null> = {};

  for (const [vaccine, value] of Object.entries(vaccinationRecords)) {
    // Check if the value is a valid date string (YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (value === null) {
      transformed[vaccine] = null;
    } else if (dateRegex.test(value)) {
      // It's a valid date string entered by user, use it
      transformed[vaccine] = value;
    } else if (!value || value.trim() === "") {
      // Empty string becomes null
      transformed[vaccine] = null;
    } else {
      // It's descriptive text (default value) - keep it as-is
      // User didn't change it, so return the original default value
      transformed[vaccine] = value;
    }
  }

  return transformed;
};

// ========================= Physical Exam Transformation =========================
const transformPhysicalExam = (
  physicalExam?: Record<
    string,
    Array<{ value: string; label: string; isCorrected?: boolean }>
  >,
): Record<string, any> => {
  const transformed: Record<string, any> = {};

  // Return empty object if physicalExam is undefined
  if (!physicalExam) {
    return transformed;
  }

  // Transform keys and filter out empty arrays
  for (const [key, value] of Object.entries(physicalExam)) {
    // Skip empty arrays
    if (!value || value.length === 0) {
      continue;
    }

    // Convert camelCase to readable format
    const transformedKey = camelCaseToReadable(key);

    // Try to find matching config with case-insensitive and flexible matching
    const sectionConfig = findSectionConfig(transformedKey);

    console.log("sectionConfig for", transformedKey, ":", sectionConfig);

    if (sectionConfig?.isNested && sectionConfig.subsections) {
      // Group by subsections dynamically
      transformed[transformedKey] = groupBySubsections(
        value,
        sectionConfig.subsections,
      );
    } else {
      // Regular flat structure for non-nested sections
      transformed[transformedKey] = value.map((item) => ({
        value: item.value,
        label: item.label,
        isCorrected: item.isCorrected || false,
      }));
    }
  }

  return transformed;
};

// ========================= Helper: Find Section Config =========================
/**
 * Find section config with flexible matching (case-insensitive, ignores spaces)
 */
const findSectionConfig = (sectionName: string): SectionConfig | undefined => {
  // Normalize: lowercase and remove spaces/special chars
  const normalize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const normalizedInput = normalize(sectionName);

  // Find matching key in sectionSpecificOptions
  const matchingKey = Object.keys(sectionSpecificOptions).find(
    (key) => normalize(key) === normalizedInput,
  );

  return matchingKey ? sectionSpecificOptions[matchingKey] : undefined;
};

// ========================= Dynamic Subsection Grouping =========================
const groupBySubsections = (
  options: Array<{ value: string; label: string; isCorrected?: boolean }>,
  subsections: Array<{
    name: string;
    options: Array<{ value: string; label: string }>;
  }>,
): Record<
  string,
  Array<{ value: string; label: string; isCorrected: boolean }>
> => {
  const grouped: Record<
    string,
    Array<{ value: string; label: string; isCorrected: boolean }>
  > = {};

  // Create a reverse lookup map: option value -> subsection name
  const valueToSubsectionMap: Record<string, string> = {};

  subsections.forEach((subsection) => {
    subsection.options.forEach((option) => {
      valueToSubsectionMap[option.value] = subsection.name;
    });
  });

  // Group the selected options by their subsection
  options.forEach((option) => {
    const subsectionName = valueToSubsectionMap[option.value];

    // Only include if we found a matching subsection
    if (subsectionName) {
      if (!grouped[subsectionName]) {
        grouped[subsectionName] = [];
      }

      grouped[subsectionName].push({
        value: option.value,
        label: option.label,
        isCorrected: option.isCorrected || false,
      });
    }
  });

  return grouped;
};

// ========================= Office Interventions Transformation =========================
const transformOfficeInterventions = (offIntervTab: OffInterv) => {
  if (!offIntervTab?.options || offIntervTab.options.length === 0) {
    return { interventions: [] };
  }

  return {
    interventions: offIntervTab.options.map((option) => ({
      name: option.name,
      isCorrected: option.isCorrected || false,
      displayOrder: option.displayNo || 0,
      performValue: option.perform || 0,
    })),
  };
};

// ========================= Plan Data Transformation =========================
const transformPlanData = (planTab: PlanTabData) => {
  // If no sections exist, return empty structure
  if (!planTab || !planTab.sections || planTab.sections.length === 0) {
    return { sections: [] };
  }

  // Transform sections array - now just pass through the simple structure
  const transformedSections = planTab.sections.map((section) => ({
    sectionName: section.sectionName,
    options: section.options, // Already an array of strings
  }));

  return {
    sections: transformedSections,
  };
};

// ========================== Advanced Plan Data Transform ====================
/**
 * Transforms Advanced Plan Tab data (Tab 6)
 * NOW ONLY HANDLES: Lab Work, Imaging, Patient Education
 * Screening, Vaccination, and Follow-up have been MOVED to Tab 7
 */
const transformAdvancedPlanData = (advancedPlanTab: AdvancedPlanTabData) => {
  // Return empty structure if no sections exist
  if (!advancedPlanTab?.sections || advancedPlanTab.sections.length === 0) {
    return { sections: [] };
  }

  return {
    sections: advancedPlanTab.sections
      .map((section) => {
        const sectionName = section.sectionName;

        // ==================== LAB WORK ====================
        if (sectionName === "Lab Work") {
          // Filter only selected options
          const selectedOptions = section.options
            .filter((option: any) => option.isSelected === true)
            .map((option: any) => ({
              optionName: option.optionName,
              isSelected: option.isSelected,
              isCorrected: option.isCorrected || false,
              file: option.file instanceof File ? undefined : option.file,
              info: option.info || "",
            }));

          // Only include section if it has selected options
          return selectedOptions.length > 0
            ? {
                sectionName: "Lab Work",
                options: selectedOptions,
              }
            : null;
        }

        // ==================== IMAGING ====================
        if (sectionName === "Imaging") {
          // Filter only selected options
          const selectedOptions = section.options
            .filter((option: any) => option.isSelected === true)
            .map((option: any) => ({
              optionName: option.optionName,
              isSelected: option.isSelected,
              isCorrected: option.isCorrected || false,
              // If file is a File object, it means it hasn't been uploaded yet
              // If it's a string, it's already a URL from the server
              file: option.file instanceof File ? undefined : option.file,
              info: option.info || "",
            }));

          // Only include section if it has selected options
          return selectedOptions.length > 0
            ? {
                sectionName: "Imaging",
                options: selectedOptions,
              }
            : null;
        }

        // ==================== IGNORE OTHER SECTIONS ====================
        // Screening, Vaccination, and Follow-up are now in Tab 7
        // If somehow they exist here, ignore them
        return null;
      })
      .filter((section) => section !== null), // Remove null sections
  };
};

// ========================== Other Treatment Plan Data Transform ====================
/**
 * Transforms Other Treatment Plan Tab data (Tab 7)
 * NOW INCLUDES: Treatment Plan Text, Screening, Vaccination, Follow-up
 */
// ========================== Medicine Data Transform ====================
/**
 * Transforms Medicine Data from Tab 7
 * Filters only selected medicines with dosage information
 */
const transformMedicineData = (medicineData?: MedicineTabData) => {
  // If no medicine data exists, return undefined
  if (
    !medicineData ||
    !medicineData.sections ||
    medicineData.sections.length === 0
  ) {
    return undefined;
  }

  const transformedSections = medicineData.sections
    .map((section) => {
      // Transform labels within each section
      const transformedLabels = section.labels
        .map((label) => {
          // Filter only selected options
          const selectedOptions = label.options
            .filter((option) => option.isSelected === true)
            .map((option) => ({
              optionName: option.optionName,
              dosage: option.dosage || [],
              frequency: option.frequency || [],
              correctDosage: option.correctDosage || "",
              correctFrequency: option.correctFrequency || "",
            }));

          // Only include label if it has selected options
          return selectedOptions.length > 0
            ? {
                labelId: label.labelId,
                labelName: label.labelName,
                options: selectedOptions,
              }
            : null;
        })
        .filter((label) => label !== null); // Remove null labels

      // Only include section if it has labels with selected options
      return transformedLabels.length > 0
        ? {
            sectionId: section.sectionId,
            sectionName: section.sectionName,
            labels: transformedLabels,
          }
        : null;
    })
    .filter((section) => section !== null); // Remove null sections

  // Return undefined if no sections have selected medicines
  return transformedSections.length > 0
    ? { sections: transformedSections }
    : undefined;
};

// ========================== Updated Other Treatment Plan Data Transform ====================
/**
 * Transforms Other Treatment Plan Tab data (Tab 7)
 * NOW INCLUDES: Treatment Plan Text, Screening, Vaccination, Follow-up, AND Medicine Data
 */
const transformOtherTreatmentPlanData = (otherTreatmentPlanTab: any) => {
  // If nothing exists, return undefined
  if (!otherTreatmentPlanTab) {
    return undefined;
  }

  const result: any = {};

  // ==================== TREATMENT PLAN TEXT ====================
  if (
    otherTreatmentPlanTab.otherTreatmentPlan &&
    otherTreatmentPlanTab.otherTreatmentPlan.trim() !== ""
  ) {
    result.otherTreatmentPlan = otherTreatmentPlanTab.otherTreatmentPlan.trim();
  }

  // ==================== SECTIONS (Screening, Vaccination, Follow-up) ====================
  if (
    otherTreatmentPlanTab.sections &&
    otherTreatmentPlanTab.sections.length > 0
  ) {
    const transformedSections = otherTreatmentPlanTab.sections
      .map((section: any) => {
        const sectionName = section.sectionName;

        // ==================== SCREENING ====================
        if (sectionName === "Screening") {
          return section.options && section.options.length > 0
            ? {
                sectionName: "Screening",
                options: section.options.map((option: any) => ({
                  screeningType: option.screeningType,
                  notes: option.notes || "",
                  isCorrected: option.isCorrected || false,
                })),
              }
            : null;
        }

        // ==================== VACCINATION ====================
        if (sectionName === "Vaccination") {
          return section.options && section.options.length > 0
            ? {
                sectionName: "Vaccination",
                options: section.options.map((option: any) => ({
                  vaccinationType: option.vaccinationType,
                  notes: option.notes || "",
                  isCorrected: option.isCorrected || false,
                })),
              }
            : null;
        }

        // ==================== FOLLOW-UP ====================
        if (sectionName === "Follow Up" || sectionName === "Follow-up") {
          const followUpValue = section.options?.[0]?.value;

          return followUpValue && followUpValue.trim() !== ""
            ? {
                sectionName: "Follow-up",
                options: [{ value: followUpValue }],
              }
            : null;
        }

        // ==================== PATIENT EDUCATION ====================
        if (sectionName === "Patient Education") {
          console.log("Patient Education section:", section);

          // Only include section if at least one option is selected
          return section.options && section.options.length > 0
            ? {
                sectionName: section.sectionName,
                options: section.options,
              }
            : null;
        }

        return null;
      })
      .filter((section: any) => section !== null);

    if (transformedSections.length > 0) {
      result.sections = transformedSections;
    }
  }

  // ==================== MEDICINE DATA ====================
  // Transform and add medicine data if it exists
  const transformedMedicineData = transformMedicineData(
    otherTreatmentPlanTab.medicineData,
  );

  if (transformedMedicineData) {
    result.medicineData = transformedMedicineData;
  }

  // Return undefined if nothing was added, otherwise return the result
  return Object.keys(result).length > 0 ? result : undefined;
};
