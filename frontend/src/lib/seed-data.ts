import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  serverTimestamp, 
  writeBatch, 
  doc 
} from 'firebase/firestore';

const FULL_TEST_LIST = [
  // 1. Laboratory Tests (Pathology) - Blood Tests
  { category: 'Laboratory Tests', subcategory: 'Blood Tests', name: 'Complete Blood Count (CBC)', price: 500 },
  { category: 'Laboratory Tests', subcategory: 'Blood Tests', name: 'Hemoglobin (Hb)', price: 200 },
  { category: 'Laboratory Tests', subcategory: 'Blood Tests', name: 'ESR (Erythrocyte Sedimentation Rate)', price: 150 },
  { category: 'Laboratory Tests', subcategory: 'Blood Tests', name: 'Blood Group & Rh Typing', price: 250 },
  { category: 'Laboratory Tests', subcategory: 'Blood Tests', name: 'Peripheral Blood Smear', price: 400 },
  { category: 'Laboratory Tests', subcategory: 'Blood Tests', name: 'Reticulocyte Count', price: 300 },
  { category: 'Laboratory Tests', subcategory: 'Blood Tests', name: 'Coagulation Profile (PT, INR, aPTT)', price: 1200 },
  { category: 'Laboratory Tests', subcategory: 'Blood Tests', name: 'D-dimer', price: 2500 },

  // B. Biochemistry Tests
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Blood Glucose (Fasting)', price: 200 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Blood Glucose (Random)', price: 200 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Blood Glucose (PP)', price: 200 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'HbA1c', price: 800 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Lipid Profile', price: 1000 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Liver Function Test (LFT)', price: 1200 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Kidney Function Test (KFT/RFT)', price: 1100 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Electrolytes (Na+, K+, Cl-, Ca2+, Mg2+)', price: 900 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Uric Acid', price: 350 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Serum Proteins, Albumin, Globulin', price: 600 },
  { category: 'Laboratory Tests', subcategory: 'Biochemistry Tests', name: 'Cardiac Enzymes (Troponin, CK-MB, LDH)', price: 3000 },

  // C. Hormone Tests
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'Thyroid Profile (T3, T4, TSH)', price: 900 },
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'Insulin', price: 800 },
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'Cortisol', price: 1200 },
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'ACTH', price: 2000 },
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'Prolactin', price: 1000 },
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'Testosterone', price: 1500 },
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'Estrogen', price: 1500 },
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'Progesterone', price: 1500 },
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'FSH, LH', price: 1800 },
  { category: 'Laboratory Tests', subcategory: 'Hormone Tests', name: 'hCG', price: 800 },

  // D. Immunology & Serology
  { category: 'Laboratory Tests', subcategory: 'Immunology & Serology', name: 'CRP', price: 500 },
  { category: 'Laboratory Tests', subcategory: 'Immunology & Serology', name: 'Rheumatoid Factor (RF)', price: 600 },
  { category: 'Laboratory Tests', subcategory: 'Immunology & Serology', name: 'ANA, Anti-dsDNA', price: 2500 },
  { category: 'Laboratory Tests', subcategory: 'Immunology & Serology', name: 'ASO Titer', price: 600 },
  { category: 'Laboratory Tests', subcategory: 'Immunology & Serology', name: 'Immunoglobulins (IgG, IgA, IgM)', price: 3000 },
  { category: 'Laboratory Tests', subcategory: 'Immunology & Serology', name: 'Allergy Tests (IgE)', price: 4500 },

  // E. Microbiology
  { category: 'Laboratory Tests', subcategory: 'Microbiology', name: 'Blood Culture', price: 1500 },
  { category: 'Laboratory Tests', subcategory: 'Microbiology', name: 'Urine Culture', price: 1000 },
  { category: 'Laboratory Tests', subcategory: 'Microbiology', name: 'Stool Culture', price: 1000 },
  { category: 'Laboratory Tests', subcategory: 'Microbiology', name: 'Sputum AFB', price: 500 },
  { category: 'Laboratory Tests', subcategory: 'Microbiology', name: 'Gram Stain', price: 300 },
  { category: 'Laboratory Tests', subcategory: 'Microbiology', name: 'Acid-Fast Stain', price: 300 },
  { category: 'Laboratory Tests', subcategory: 'Microbiology', name: 'PCR Tests', price: 4000 },
  { category: 'Laboratory Tests', subcategory: 'Microbiology', name: 'Rapid Antigen Tests', price: 1000 },

  // 2. Urine & Stool Tests
  { category: 'Urine & Stool Tests', subcategory: 'Urine Tests', name: 'Routine Urine Examination (R/E)', price: 250 },
  { category: 'Urine & Stool Tests', subcategory: 'Urine Tests', name: 'Urine Microscopy', price: 200 },
  { category: 'Urine & Stool Tests', subcategory: 'Urine Tests', name: 'Urine Protein', price: 200 },
  { category: 'Urine & Stool Tests', subcategory: 'Urine Tests', name: 'Microalbumin', price: 800 },
  { category: 'Urine & Stool Tests', subcategory: 'Urine Tests', name: 'Pregnancy Test (Urine hCG)', price: 300 },
  { category: 'Urine & Stool Tests', subcategory: 'Urine Tests', name: 'Drug Screening', price: 2000 },
  { category: 'Urine & Stool Tests', subcategory: 'Stool Tests', name: 'Stool R/E', price: 250 },
  { category: 'Urine & Stool Tests', subcategory: 'Stool Tests', name: 'Occult Blood Test', price: 400 },
  { category: 'Urine & Stool Tests', subcategory: 'Stool Tests', name: 'Ova & Parasite Test', price: 300 },
  { category: 'Urine & Stool Tests', subcategory: 'Stool Tests', name: 'Stool Culture', price: 1000 },

  // 3. Imaging & Radiology Tests
  { category: 'Imaging & Radiology', subcategory: 'X-Ray', name: 'Chest X-ray', price: 600 },
  { category: 'Imaging & Radiology', subcategory: 'X-Ray', name: 'Abdominal X-ray', price: 800 },
  { category: 'Imaging & Radiology', subcategory: 'X-Ray', name: 'Bone X-ray', price: 700 },
  { category: 'Imaging & Radiology', subcategory: 'Ultrasound', name: 'USG Whole Abdomen', price: 1500 },
  { category: 'Imaging & Radiology', subcategory: 'Ultrasound', name: 'Pelvic Ultrasound', price: 1200 },
  { category: 'Imaging & Radiology', subcategory: 'Ultrasound', name: 'Obstetric Ultrasound', price: 1500 },
  { category: 'Imaging & Radiology', subcategory: 'Ultrasound', name: 'Doppler Study', price: 2500 },
  { category: 'Imaging & Radiology', subcategory: 'CT Scan', name: 'CT Brain', price: 4000 },
  { category: 'Imaging & Radiology', subcategory: 'CT Scan', name: 'CT Chest', price: 6000 },
  { category: 'Imaging & Radiology', subcategory: 'CT Scan', name: 'CT Abdomen', price: 7000 },
  { category: 'Imaging & Radiology', subcategory: 'CT Scan', name: 'CT Angiography', price: 12000 },
  { category: 'Imaging & Radiology', subcategory: 'MRI', name: 'MRI Brain', price: 8000 },
  { category: 'Imaging & Radiology', subcategory: 'MRI', name: 'MRI Spine', price: 9000 },
  { category: 'Imaging & Radiology', subcategory: 'MRI', name: 'MRI Knee', price: 8500 },
  { category: 'Imaging & Radiology', subcategory: 'MRI', name: 'MR Angiography', price: 15000 },
  { category: 'Imaging & Radiology', subcategory: 'Nuclear Medicine', name: 'PET Scan', price: 45000 },
  { category: 'Imaging & Radiology', subcategory: 'Nuclear Medicine', name: 'SPECT', price: 25000 },
  { category: 'Imaging & Radiology', subcategory: 'Nuclear Medicine', name: 'Bone Scan', price: 12000 },
  { category: 'Imaging & Radiology', subcategory: 'Nuclear Medicine', name: 'Thyroid Scan', price: 6000 },

  // 4. Cardiac Tests
  { category: 'Cardiac Tests', subcategory: 'Cardiac Tests', name: 'ECG', price: 400 },
  { category: 'Cardiac Tests', subcategory: 'Cardiac Tests', name: 'Echocardiography (2D Echo)', price: 2500 },
  { category: 'Cardiac Tests', subcategory: 'Cardiac Tests', name: 'Stress Test (TMT)', price: 3000 },
  { category: 'Cardiac Tests', subcategory: 'Cardiac Tests', name: 'Holter Monitoring', price: 5000 },
  { category: 'Cardiac Tests', subcategory: 'Cardiac Tests', name: 'Cardiac MRI', price: 15000 },
  { category: 'Cardiac Tests', subcategory: 'Cardiac Tests', name: 'Coronary Angiography', price: 18000 },

  // 5. Pulmonary (Lung) Tests
  { category: 'Pulmonary Tests', subcategory: 'Pulmonary Tests', name: 'Pulmonary Function Test (PFT)', price: 1500 },
  { category: 'Pulmonary Tests', subcategory: 'Pulmonary Tests', name: 'Spirometry', price: 1200 },
  { category: 'Pulmonary Tests', subcategory: 'Pulmonary Tests', name: 'Peak Flow Test', price: 500 },
  { category: 'Pulmonary Tests', subcategory: 'Pulmonary Tests', name: 'ABG (Arterial Blood Gas)', price: 1500 },
  { category: 'Pulmonary Tests', subcategory: 'Pulmonary Tests', name: 'Sleep Study (Polysomnography)', price: 15000 },

  // 6. Neurological Tests
  { category: 'Neurological Tests', subcategory: 'Neurological Tests', name: 'EEG', price: 3000 },
  { category: 'Neurological Tests', subcategory: 'Neurological Tests', name: 'EMG', price: 4000 },
  { category: 'Neurological Tests', subcategory: 'Neurological Tests', name: 'Nerve Conduction Study (NCV)', price: 4500 },
  { category: 'Neurological Tests', subcategory: 'Neurological Tests', name: 'Lumbar Puncture (CSF Analysis)', price: 5000 },

  // 7. Gastrointestinal Tests
  { category: 'Gastrointestinal Tests', subcategory: 'Gastrointestinal Tests', name: 'Endoscopy', price: 5000 },
  { category: 'Gastrointestinal Tests', subcategory: 'Gastrointestinal Tests', name: 'Colonoscopy', price: 8000 },
  { category: 'Gastrointestinal Tests', subcategory: 'Gastrointestinal Tests', name: 'Sigmoidoscopy', price: 4000 },
  { category: 'Gastrointestinal Tests', subcategory: 'Gastrointestinal Tests', name: 'Barium Swallow', price: 3000 },
  { category: 'Gastrointestinal Tests', subcategory: 'Gastrointestinal Tests', name: 'Barium Meal', price: 3500 },
  { category: 'Gastrointestinal Tests', subcategory: 'Gastrointestinal Tests', name: 'Liver Biopsy', price: 12000 },

  // 8. Reproductive & Fertility Tests
  { category: 'Reproductive & Fertility', subcategory: 'Male', name: 'Semen Analysis', price: 800 },
  { category: 'Reproductive & Fertility', subcategory: 'Male', name: 'Sperm Count', price: 600 },
  { category: 'Reproductive & Fertility', subcategory: 'Male', name: 'Testosterone Level', price: 1500 },
  { category: 'Reproductive & Fertility', subcategory: 'Female', name: 'Pap Smear', price: 1500 },
  { category: 'Reproductive & Fertility', subcategory: 'Female', name: 'HPV Test', price: 3000 },
  { category: 'Reproductive & Fertility', subcategory: 'Female', name: 'AMH', price: 3500 },
  { category: 'Reproductive & Fertility', subcategory: 'Female', name: 'Ovulation Test', price: 800 },
  { category: 'Reproductive & Fertility', subcategory: 'Female', name: 'Hysterosalpingography (HSG)', price: 5000 },

  // 9. Cancer & Tumor Marker Tests
  { category: 'Cancer & Tumor Marker', subcategory: 'Tumor Markers', name: 'PSA', price: 1200 },
  { category: 'Cancer & Tumor Marker', subcategory: 'Tumor Markers', name: 'CA-125', price: 2000 },
  { category: 'Cancer & Tumor Marker', subcategory: 'Tumor Markers', name: 'CA 19-9', price: 2000 },
  { category: 'Cancer & Tumor Marker', subcategory: 'Tumor Markers', name: 'AFP', price: 1500 },
  { category: 'Cancer & Tumor Marker', subcategory: 'Tumor Markers', name: 'CEA', price: 1500 },
  { category: 'Cancer & Tumor Marker', subcategory: 'Genetics', name: 'BRCA Genetic Test', price: 25000 },
  { category: 'Cancer & Tumor Marker', subcategory: 'Biopsy', name: 'Biopsy (FNAC)', price: 3000 },
  { category: 'Cancer & Tumor Marker', subcategory: 'Biopsy', name: 'Biopsy (Core)', price: 6000 },
  { category: 'Cancer & Tumor Marker', subcategory: 'Biopsy', name: 'Biopsy (Excision)', price: 10000 },

  // 10. Genetic & Molecular Tests
  { category: 'Genetic & Molecular', subcategory: 'Genetic Tests', name: 'Karyotyping', price: 6000 },
  { category: 'Genetic & Molecular', subcategory: 'Molecular Tests', name: 'Whole Genome Sequencing', price: 150000 },
  { category: 'Genetic & Molecular', subcategory: 'Molecular Tests', name: 'Whole Exome Sequencing', price: 80000 },
  { category: 'Genetic & Molecular', subcategory: 'Molecular Tests', name: 'PCR', price: 4000 },
  { category: 'Genetic & Molecular', subcategory: 'Molecular Tests', name: 'FISH', price: 10000 },
  { category: 'Genetic & Molecular', subcategory: 'Genetic Tests', name: 'Prenatal Genetic Screening', price: 20000 },

  // 11. Infectious Disease Tests
  { category: 'Infectious Disease', subcategory: 'Infectious Disease', name: 'HIV Test', price: 800 },
  { category: 'Infectious Disease', subcategory: 'Infectious Disease', name: 'Hepatitis B & C', price: 1500 },
  { category: 'Infectious Disease', subcategory: 'Infectious Disease', name: 'COVID-19 (RT-PCR)', price: 2500 },
  { category: 'Infectious Disease', subcategory: 'Infectious Disease', name: 'COVID-19 (Antigen)', price: 1000 },
  { category: 'Infectious Disease', subcategory: 'Infectious Disease', name: 'Dengue NS1, IgM, IgG', price: 1500 },
  { category: 'Infectious Disease', subcategory: 'Infectious Disease', name: 'Malaria Parasite Test', price: 400 },
  { category: 'Infectious Disease', subcategory: 'Infectious Disease', name: 'TB (Mantoux)', price: 300 },
  { category: 'Infectious Disease', subcategory: 'Infectious Disease', name: 'TB (GeneXpert)', price: 3000 },

  // 12. Ophthalmic (Eye) Tests
  { category: 'Ophthalmic Tests', subcategory: 'Eye Tests', name: 'Visual Acuity Test', price: 300 },
  { category: 'Ophthalmic Tests', subcategory: 'Eye Tests', name: 'Fundoscopy', price: 1000 },
  { category: 'Ophthalmic Tests', subcategory: 'Eye Tests', name: 'OCT', price: 3500 },
  { category: 'Ophthalmic Tests', subcategory: 'Eye Tests', name: 'Tonometry', price: 600 },
  { category: 'Ophthalmic Tests', subcategory: 'Eye Tests', name: 'Visual Field Test', price: 2000 },

  // 13. ENT & Audiology Tests
  { category: 'ENT & Audiology', subcategory: 'Audiology', name: 'Audiometry', price: 1500 },
  { category: 'ENT & Audiology', subcategory: 'Audiology', name: 'Tympanometry', price: 1000 },
  { category: 'ENT & Audiology', subcategory: 'ENT', name: 'Nasal Endoscopy', price: 3000 },
  { category: 'ENT & Audiology', subcategory: 'ENT', name: 'Laryngoscopy', price: 4000 },

  // 14. Orthopedic & Musculoskeletal Tests
  { category: 'Orthopedic Tests', subcategory: 'Musculoskeletal', name: 'DEXA Scan (Bone Density)', price: 3500 },
  { category: 'Orthopedic Tests', subcategory: 'Musculoskeletal', name: 'Joint Aspiration', price: 5000 },
  { category: 'Orthopedic Tests', subcategory: 'Musculoskeletal', name: 'Arthroscopy', price: 25000 },

  // 15. Psychological & Psychiatric Tests
  { category: 'Psychological Tests', subcategory: 'Psychological Tests', name: 'IQ Tests', price: 3000 },
  { category: 'Psychological Tests', subcategory: 'Psychological Tests', name: 'MMPI', price: 5000 },
  { category: 'Psychological Tests', subcategory: 'Psychological Tests', name: 'Depression Screening (PHQ-9)', price: 1000 },
  { category: 'Psychological Tests', subcategory: 'Psychological Tests', name: 'Anxiety Tests', price: 1000 },
  { category: 'Psychological Tests', subcategory: 'Psychological Tests', name: 'Cognitive Function Tests', price: 2000 },

  // 16. Preventive & Screening Tests
  { category: 'Preventive Tests', subcategory: 'Preventive Tests', name: 'Health Checkup Panels', price: 5000 },
  { category: 'Preventive Tests', subcategory: 'Preventive Tests', name: 'Newborn Screening', price: 3000 },
  { category: 'Preventive Tests', subcategory: 'Preventive Tests', name: 'Genetic Carrier Screening', price: 15000 },
  { category: 'Preventive Tests', subcategory: 'Preventive Tests', name: 'Cancer Screening Tests', price: 10000 },
];

export const seedTestsCollection = async () => {
  try {
    const testsCol = collection(db, 'available_tests');
    const snapshot = await getDocs(testsCol);
    
    // If the collection is small (means it hasn't seeded the full 110+ catalog)
    if (snapshot.size < 100) {
      console.log('Seeding comprehensive available_tests collection (Catalog upgrade)...');
      
      // Using batch writes for efficiency (max 500 per batch)
      let batch = writeBatch(db);
      let count = 0;

      for (const test of FULL_TEST_LIST) {
        const newDocRef = doc(testsCol);
        const testData: any = { ...test };
        batch.set(newDocRef, {
          ...testData,
          description: testData.description || `Diagnostic ${test.name} for clinical analysis.`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        count++;
        if (count === 400) { // Safety margin for batch limit
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }
      
      if (count > 0) {
        await batch.commit();
      }
      
      console.log(`Seeding completed with ${FULL_TEST_LIST.length} tests.`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error seeding available_tests:', error);
    return false;
  }
};
