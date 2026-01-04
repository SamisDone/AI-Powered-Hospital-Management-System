// Medical Tests Catalog - Comprehensive list of all available tests
// Organized by category for easy searching and filtering

export interface TestCatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
}

export const MEDICAL_TESTS_CATALOG: TestCatalogItem[] = [
  // Blood Tests
  { id: 'bt-001', name: 'Complete Blood Count (CBC)', category: 'Blood Tests', description: 'Measures different components of blood including RBC, WBC, platelets', price: 500 },
  { id: 'bt-002', name: 'Hemoglobin (Hb)', category: 'Blood Tests', description: 'Measures the amount of hemoglobin in blood', price: 200 },
  { id: 'bt-003', name: 'ESR (Erythrocyte Sedimentation Rate)', category: 'Blood Tests', description: 'Measures inflammation in the body', price: 250 },
  { id: 'bt-004', name: 'CRP (C-Reactive Protein)', category: 'Blood Tests', description: 'Detects inflammation or infection', price: 600 },
  { id: 'bt-005', name: 'Fasting Blood Glucose', category: 'Blood Tests', description: 'Measures blood sugar after fasting', price: 150 },
  { id: 'bt-006', name: 'Random Blood Glucose', category: 'Blood Tests', description: 'Measures blood sugar at any time', price: 150 },
  { id: 'bt-007', name: 'Postprandial Blood Glucose (PP)', category: 'Blood Tests', description: 'Measures blood sugar after eating', price: 150 },
  { id: 'bt-008', name: 'HbA1c', category: 'Blood Tests', description: 'Average blood sugar over 2-3 months', price: 800 },
  { id: 'bt-009', name: 'Lipid Profile', category: 'Blood Tests', description: 'Measures cholesterol and triglycerides', price: 700 },
  { id: 'bt-010', name: 'Liver Function Test (LFT)', category: 'Blood Tests', description: 'Assesses liver health and function', price: 900 },
  { id: 'bt-011', name: 'Kidney Function Test (KFT/RFT)', category: 'Blood Tests', description: 'Evaluates kidney function', price: 800 },
  { id: 'bt-012', name: 'Electrolytes Panel', category: 'Blood Tests', description: 'Measures Na+, K+, Cl-, Ca2+', price: 600 },
  { id: 'bt-013', name: 'Thyroid Function Test (T3, T4, TSH)', category: 'Blood Tests', description: 'Evaluates thyroid gland function', price: 1000 },
  { id: 'bt-014', name: 'Cardiac Enzymes (Troponin, CK-MB)', category: 'Blood Tests', description: 'Detects heart muscle damage', price: 1500 },
  { id: 'bt-015', name: 'Coagulation Profile (PT, INR, aPTT)', category: 'Blood Tests', description: 'Assesses blood clotting ability', price: 1200 },
  { id: 'bt-016', name: 'Blood Culture', category: 'Blood Tests', description: 'Detects bacteria in blood', price: 1000 },
  { id: 'bt-017', name: 'Blood Group & Rh Typing', category: 'Blood Tests', description: 'Determines blood type and Rh factor', price: 300 },
  { id: 'bt-018', name: 'Vitamin B12', category: 'Blood Tests', description: 'Measures vitamin B12 levels', price: 800 },
  { id: 'bt-019', name: 'Vitamin D', category: 'Blood Tests', description: 'Measures vitamin D levels', price: 1200 },
  { id: 'bt-020', name: 'Iron Studies (Ferritin, TIBC)', category: 'Blood Tests', description: 'Evaluates iron levels and storage', price: 900 },
  { id: 'bt-021', name: 'PSA (Prostate Specific Antigen)', category: 'Blood Tests', description: 'Prostate cancer screening marker', price: 1000 },
  { id: 'bt-022', name: 'CA-125', category: 'Blood Tests', description: 'Ovarian cancer marker', price: 1500 },
  { id: 'bt-023', name: 'AFP (Alpha-Fetoprotein)', category: 'Blood Tests', description: 'Liver cancer and pregnancy marker', price: 1200 },
  { id: 'bt-024', name: 'CEA (Carcinoembryonic Antigen)', category: 'Blood Tests', description: 'Colorectal cancer marker', price: 1300 },

  // Urine Tests
  { id: 'ut-001', name: 'Routine Urine Examination (R/E)', category: 'Urine Tests', description: 'General urine analysis', price: 200 },
  { id: 'ut-002', name: 'Urine Culture & Sensitivity', category: 'Urine Tests', description: 'Detects urinary tract infections', price: 600 },
  { id: 'ut-003', name: 'Urine Pregnancy Test', category: 'Urine Tests', description: 'Detects pregnancy hormones', price: 150 },
  { id: 'ut-004', name: '24-Hour Urine Test', category: 'Urine Tests', description: 'Measures substances over 24 hours', price: 500 },
  { id: 'ut-005', name: 'Microalbumin Test', category: 'Urine Tests', description: 'Early kidney damage detection', price: 400 },
  { id: 'ut-006', name: 'Drug Screening (Urine)', category: 'Urine Tests', description: 'Detects drugs in urine', price: 800 },

  // Stool Tests
  { id: 'st-001', name: 'Stool Routine Examination', category: 'Stool Tests', description: 'General stool analysis', price: 250 },
  { id: 'st-002', name: 'Stool Occult Blood Test (FOBT)', category: 'Stool Tests', description: 'Detects hidden blood in stool', price: 300 },
  { id: 'st-003', name: 'Stool Culture', category: 'Stool Tests', description: 'Identifies bacterial infections', price: 600 },
  { id: 'st-004', name: 'Ova & Parasite Test', category: 'Stool Tests', description: 'Detects parasitic infections', price: 400 },
  { id: 'st-005', name: 'Fecal Calprotectin', category: 'Stool Tests', description: 'Measures intestinal inflammation', price: 1200 },

  // Body Fluid Tests
  { id: 'bf-001', name: 'CSF Analysis', category: 'Body Fluid Tests', description: 'Cerebrospinal fluid examination', price: 1500 },
  { id: 'bf-002', name: 'Pleural Fluid Analysis', category: 'Body Fluid Tests', description: 'Lung fluid examination', price: 1000 },
  { id: 'bf-003', name: 'Ascitic Fluid Analysis', category: 'Body Fluid Tests', description: 'Abdominal fluid examination', price: 1000 },
  { id: 'bf-004', name: 'Synovial Fluid Analysis', category: 'Body Fluid Tests', description: 'Joint fluid examination', price: 1200 },
  { id: 'bf-005', name: 'Semen Analysis', category: 'Body Fluid Tests', description: 'Male fertility evaluation', price: 800 },
  { id: 'bf-006', name: 'Sputum Examination', category: 'Body Fluid Tests', description: 'Respiratory infection detection', price: 400 },

  // Imaging & Radiology
  { id: 'im-001', name: 'X-ray', category: 'Imaging & Radiology', description: 'Basic radiographic imaging', price: 500 },
  { id: 'im-002', name: 'Ultrasound (USG)', category: 'Imaging & Radiology', description: 'Sound wave imaging', price: 1500 },
  { id: 'im-003', name: 'Doppler Ultrasound', category: 'Imaging & Radiology', description: 'Blood flow imaging', price: 2000 },
  { id: 'im-004', name: 'CT Scan', category: 'Imaging & Radiology', description: 'Computed tomography imaging', price: 5000 },
  { id: 'im-005', name: 'MRI', category: 'Imaging & Radiology', description: 'Magnetic resonance imaging', price: 8000 },
  { id: 'im-006', name: 'PET Scan', category: 'Imaging & Radiology', description: 'Positron emission tomography', price: 25000 },
  { id: 'im-007', name: 'Mammography', category: 'Imaging & Radiology', description: 'Breast cancer screening', price: 2500 },
  { id: 'im-008', name: 'DEXA Scan (Bone Density)', category: 'Imaging & Radiology', description: 'Bone density measurement', price: 3000 },
  { id: 'im-009', name: 'Fluoroscopy', category: 'Imaging & Radiology', description: 'Real-time X-ray imaging', price: 3500 },
  { id: 'im-010', name: 'Angiography', category: 'Imaging & Radiology', description: 'Blood vessel imaging', price: 15000 },
  { id: 'im-011', name: 'IVU / IVP', category: 'Imaging & Radiology', description: 'Urinary tract imaging', price: 4000 },
  { id: 'im-012', name: 'Barium Studies', category: 'Imaging & Radiology', description: 'GI tract imaging', price: 3500 },

  // Cardiac Tests
  { id: 'ct-001', name: 'ECG (Electrocardiogram)', category: 'Cardiac Tests', description: 'Heart electrical activity recording', price: 500 },
  { id: 'ct-002', name: 'Echocardiography', category: 'Cardiac Tests', description: 'Heart ultrasound imaging', price: 3000 },
  { id: 'ct-003', name: 'Stress Test / TMT', category: 'Cardiac Tests', description: 'Heart function under stress', price: 3500 },
  { id: 'ct-004', name: 'Holter Monitoring', category: 'Cardiac Tests', description: '24-hour heart rhythm monitoring', price: 4000 },
  { id: 'ct-005', name: 'Cardiac CT', category: 'Cardiac Tests', description: 'Heart CT imaging', price: 8000 },
  { id: 'ct-006', name: 'Cardiac MRI', category: 'Cardiac Tests', description: 'Heart MRI imaging', price: 12000 },
  { id: 'ct-007', name: 'Coronary Angiography', category: 'Cardiac Tests', description: 'Heart blood vessel imaging', price: 20000 },

  // Neurological Tests
  { id: 'nt-001', name: 'EEG (Electroencephalogram)', category: 'Neurological Tests', description: 'Brain electrical activity recording', price: 3000 },
  { id: 'nt-002', name: 'EMG (Electromyography)', category: 'Neurological Tests', description: 'Muscle electrical activity', price: 4000 },
  { id: 'nt-003', name: 'Nerve Conduction Study (NCS)', category: 'Neurological Tests', description: 'Nerve function testing', price: 4500 },
  { id: 'nt-004', name: 'Lumbar Puncture', category: 'Neurological Tests', description: 'Spinal fluid collection', price: 5000 },
  { id: 'nt-005', name: 'Brain MRI', category: 'Neurological Tests', description: 'Brain magnetic resonance imaging', price: 10000 },
  { id: 'nt-006', name: 'Brain CT', category: 'Neurological Tests', description: 'Brain computed tomography', price: 6000 },
  { id: 'nt-007', name: 'Cognitive Function Tests', category: 'Neurological Tests', description: 'Mental function assessment', price: 2000 },

  // Pulmonary Tests
  { id: 'pt-001', name: 'Spirometry', category: 'Pulmonary Tests', description: 'Lung capacity measurement', price: 1000 },
  { id: 'pt-002', name: 'Pulmonary Function Test (PFT)', category: 'Pulmonary Tests', description: 'Comprehensive lung function', price: 2000 },
  { id: 'pt-003', name: 'Peak Flow Test', category: 'Pulmonary Tests', description: 'Breathing capacity test', price: 300 },
  { id: 'pt-004', name: 'Arterial Blood Gas (ABG)', category: 'Pulmonary Tests', description: 'Blood oxygen levels', price: 800 },
  { id: 'pt-005', name: 'Bronchoscopy', category: 'Pulmonary Tests', description: 'Airway visualization', price: 10000 },
  { id: 'pt-006', name: 'Sleep Study (Polysomnography)', category: 'Pulmonary Tests', description: 'Sleep disorder diagnosis', price: 8000 },

  // Endocrine Tests
  { id: 'et-001', name: 'Insulin Level', category: 'Endocrine Tests', description: 'Measures insulin in blood', price: 800 },
  { id: 'et-002', name: 'Cortisol Test', category: 'Endocrine Tests', description: 'Stress hormone measurement', price: 700 },
  { id: 'et-003', name: 'ACTH', category: 'Endocrine Tests', description: 'Adrenal function test', price: 1200 },
  { id: 'et-004', name: 'Prolactin', category: 'Endocrine Tests', description: 'Pituitary hormone test', price: 800 },
  { id: 'et-005', name: 'Estrogen', category: 'Endocrine Tests', description: 'Female hormone test', price: 900 },
  { id: 'et-006', name: 'Progesterone', category: 'Endocrine Tests', description: 'Female hormone test', price: 900 },
  { id: 'et-007', name: 'Testosterone', category: 'Endocrine Tests', description: 'Male hormone test', price: 1000 },
  { id: 'et-008', name: 'Growth Hormone', category: 'Endocrine Tests', description: 'Growth hormone levels', price: 1500 },
  { id: 'et-009', name: 'Parathyroid Hormone (PTH)', category: 'Endocrine Tests', description: 'Calcium regulation hormone', price: 1200 },

  // Infectious Disease Tests
  { id: 'id-001', name: 'Widal Test', category: 'Infectious Disease Tests', description: 'Typhoid fever detection', price: 400 },
  { id: 'id-002', name: 'Dengue NS1 Antigen', category: 'Infectious Disease Tests', description: 'Early dengue detection', price: 800 },
  { id: 'id-003', name: 'Dengue IgG/IgM', category: 'Infectious Disease Tests', description: 'Dengue antibody test', price: 1000 },
  { id: 'id-004', name: 'Malaria Test', category: 'Infectious Disease Tests', description: 'Malaria parasite detection', price: 500 },
  { id: 'id-005', name: 'HIV Test', category: 'Infectious Disease Tests', description: 'HIV antibody detection', price: 600 },
  { id: 'id-006', name: 'HBsAg', category: 'Infectious Disease Tests', description: 'Hepatitis B surface antigen', price: 500 },
  { id: 'id-007', name: 'Anti-HCV', category: 'Infectious Disease Tests', description: 'Hepatitis C antibody', price: 800 },
  { id: 'id-008', name: 'COVID-19 RT-PCR', category: 'Infectious Disease Tests', description: 'COVID-19 molecular test', price: 2500 },
  { id: 'id-009', name: 'COVID-19 Antigen', category: 'Infectious Disease Tests', description: 'Rapid COVID-19 test', price: 500 },
  { id: 'id-010', name: 'TB GeneXpert', category: 'Infectious Disease Tests', description: 'Tuberculosis molecular test', price: 3000 },
  { id: 'id-011', name: 'Mantoux Test', category: 'Infectious Disease Tests', description: 'TB skin test', price: 300 },
  { id: 'id-012', name: 'VDRL / RPR', category: 'Infectious Disease Tests', description: 'Syphilis screening', price: 400 },

  // Cancer & Biopsy Tests
  { id: 'cb-001', name: 'FNAC', category: 'Cancer & Biopsy', description: 'Fine needle aspiration cytology', price: 2000 },
  { id: 'cb-002', name: 'Biopsy (Core)', category: 'Cancer & Biopsy', description: 'Tissue sample examination', price: 5000 },
  { id: 'cb-003', name: 'Histopathology', category: 'Cancer & Biopsy', description: 'Tissue microscopic examination', price: 3000 },
  { id: 'cb-004', name: 'Pap Smear', category: 'Cancer & Biopsy', description: 'Cervical cancer screening', price: 800 },
  { id: 'cb-005', name: 'Bone Marrow Examination', category: 'Cancer & Biopsy', description: 'Blood cancer diagnosis', price: 8000 },

  // Genetic Tests
  { id: 'gt-001', name: 'Karyotyping', category: 'Genetic Tests', description: 'Chromosome analysis', price: 8000 },
  { id: 'gt-002', name: 'PCR Tests', category: 'Genetic Tests', description: 'DNA amplification tests', price: 3000 },
  { id: 'gt-003', name: 'BRCA Gene Test', category: 'Genetic Tests', description: 'Breast cancer gene test', price: 25000 },
  { id: 'gt-004', name: 'Prenatal Genetic Screening', category: 'Genetic Tests', description: 'Fetal genetic testing', price: 15000 },
  { id: 'gt-005', name: 'Newborn Screening', category: 'Genetic Tests', description: 'Newborn genetic tests', price: 5000 },

  // Gynecological Tests
  { id: 'gy-001', name: 'Pregnancy Test (β-hCG)', category: 'Gynecological Tests', description: 'Pregnancy hormone blood test', price: 500 },
  { id: 'gy-002', name: 'Pelvic Ultrasound', category: 'Gynecological Tests', description: 'Female pelvic imaging', price: 2000 },
  { id: 'gy-003', name: 'Amniocentesis', category: 'Gynecological Tests', description: 'Amniotic fluid testing', price: 15000 },
  { id: 'gy-004', name: 'CVS', category: 'Gynecological Tests', description: 'Chorionic villus sampling', price: 20000 },
  { id: 'gy-005', name: 'NST (Non-Stress Test)', category: 'Gynecological Tests', description: 'Fetal heart rate monitoring', price: 1500 },
  { id: 'gy-006', name: 'Fetal Anomaly Scan', category: 'Gynecological Tests', description: 'Detailed fetal ultrasound', price: 4000 },

  // Gastrointestinal Tests
  { id: 'gi-001', name: 'Endoscopy', category: 'Gastrointestinal Tests', description: 'Upper GI visualization', price: 8000 },
  { id: 'gi-002', name: 'Colonoscopy', category: 'Gastrointestinal Tests', description: 'Large intestine examination', price: 12000 },
  { id: 'gi-003', name: 'Sigmoidoscopy', category: 'Gastrointestinal Tests', description: 'Lower colon examination', price: 6000 },
  { id: 'gi-004', name: 'Liver Biopsy', category: 'Gastrointestinal Tests', description: 'Liver tissue sampling', price: 15000 },
  { id: 'gi-005', name: 'H. pylori Test', category: 'Gastrointestinal Tests', description: 'Stomach bacteria detection', price: 1000 },
  { id: 'gi-006', name: 'Urea Breath Test', category: 'Gastrointestinal Tests', description: 'H. pylori breath test', price: 1500 },

  // Orthopedic Tests
  { id: 'or-001', name: 'X-ray Joints', category: 'Orthopedic Tests', description: 'Joint radiography', price: 600 },
  { id: 'or-002', name: 'MRI Spine', category: 'Orthopedic Tests', description: 'Spinal MRI imaging', price: 10000 },
  { id: 'or-003', name: 'Bone Scan', category: 'Orthopedic Tests', description: 'Bone nuclear imaging', price: 8000 },
  { id: 'or-004', name: 'Rheumatoid Factor (RF)', category: 'Orthopedic Tests', description: 'Rheumatoid arthritis marker', price: 600 },
  { id: 'or-005', name: 'Anti-CCP', category: 'Orthopedic Tests', description: 'RA specific antibody', price: 1500 },
  { id: 'or-006', name: 'ANA Test', category: 'Orthopedic Tests', description: 'Autoimmune antibody test', price: 1200 },
  { id: 'or-007', name: 'Uric Acid Test', category: 'Orthopedic Tests', description: 'Gout marker test', price: 300 },

  // Allergy Tests
  { id: 'al-001', name: 'Skin Prick Test', category: 'Allergy Tests', description: 'Allergen skin testing', price: 2000 },
  { id: 'al-002', name: 'Patch Test', category: 'Allergy Tests', description: 'Contact allergy testing', price: 2500 },
  { id: 'al-003', name: 'IgE Level', category: 'Allergy Tests', description: 'Allergy antibody level', price: 1000 },
  { id: 'al-004', name: 'Allergy Blood Panel', category: 'Allergy Tests', description: 'Multi-allergen blood test', price: 5000 },

  // Eye Tests
  { id: 'ey-001', name: 'Visual Acuity Test', category: 'Eye Tests', description: 'Vision sharpness test', price: 200 },
  { id: 'ey-002', name: 'Refraction Test', category: 'Eye Tests', description: 'Glasses prescription', price: 300 },
  { id: 'ey-003', name: 'Fundoscopy', category: 'Eye Tests', description: 'Retina examination', price: 500 },
  { id: 'ey-004', name: 'OCT', category: 'Eye Tests', description: 'Retinal layer imaging', price: 2500 },
  { id: 'ey-005', name: 'Tonometry', category: 'Eye Tests', description: 'Eye pressure measurement', price: 400 },

  // Hearing Tests
  { id: 'hr-001', name: 'Audiometry', category: 'Hearing Tests', description: 'Hearing level assessment', price: 1000 },
  { id: 'hr-002', name: 'Tympanometry', category: 'Hearing Tests', description: 'Middle ear function test', price: 800 },
  { id: 'hr-003', name: 'OAE', category: 'Hearing Tests', description: 'Otoacoustic emissions test', price: 1200 },
  { id: 'hr-004', name: 'BERA', category: 'Hearing Tests', description: 'Brainstem auditory response', price: 3000 },

  // Preventive Screening
  { id: 'ps-001', name: 'Full Body Check-up', category: 'Preventive Screening', description: 'Comprehensive health screening', price: 5000 },
  { id: 'ps-002', name: 'Blood Pressure Measurement', category: 'Preventive Screening', description: 'BP monitoring', price: 50 },
  { id: 'ps-003', name: 'BMI Assessment', category: 'Preventive Screening', description: 'Body mass index calculation', price: 100 },
  { id: 'ps-004', name: 'Cancer Screening Panel', category: 'Preventive Screening', description: 'Multi-cancer marker tests', price: 8000 },
  { id: 'ps-005', name: 'Geriatric Health Screening', category: 'Preventive Screening', description: 'Elderly health assessment', price: 6000 },
];

// Get unique categories
export const TEST_CATEGORIES = [...new Set(MEDICAL_TESTS_CATALOG.map(t => t.category))];

// Search function
export function searchTests(query: string, category?: string): TestCatalogItem[] {
  let results = MEDICAL_TESTS_CATALOG;
  
  if (category && category !== 'all') {
    results = results.filter(t => t.category === category);
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery)
    );
  }
  
  return results;
}
