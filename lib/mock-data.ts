export interface MRIImage {
    url: string;
    view: string;
    sequence: string;
}

export interface Diagnosis {
    id: string;
    name: string;
    shortName: string;
    grade?: string;
    tags: string[];
    description: string;
    keyFeatures: string[];
    differentials: string[];
    mriImages: MRIImage[];
}

export interface ChatMessage {
    id: string;
    role: "student" | "ai";
    content: string;
    timestamp: Date;
}

export interface Question {
    id: string;
    mriImage: string;
    options: {
        diagnosisId: string;
        name: string;
        hint: string;
    }[];
    correctDiagnosisId: string;
    explanation: string;
}

export const diagnoses: Diagnosis[] = [
    {
        id: "gbm",
        name: "Glioblastoma Multiforme (GBM)",
        shortName: "GBM",
        grade: "Grade IV",
        tags: ["Malignant"],
        description:
            "The most common and most aggressive cancer that begins within the brain. It is characterized by high levels of cellular heterogeneity, necrosis, and microvascular proliferation.",
        keyFeatures: [
            "Irregular, thick enhancement around central necrosis.",
            "Significant peritumoral vasogenic edema.",
            "Crossing the corpus callosum (Butterfly pattern).",
            "Mass effect with midline shift.",
        ],
        differentials: ["Astrocytoma", "Abscess", "Metastasis"],
        mriImages: [
<<<<<<< HEAD
            "https://placehold.co/600x600/111111/444444.png?text=GBM+Axial+T1+C",
            "https://placehold.co/600x600/111111/444444.png?text=GBM+Sagittal+T2",
            "https://placehold.co/600x600/111111/444444.png?text=GBM+Coronal+FLAIR",
            "https://placehold.co/600x600/111111/444444.png?text=GBM+Axial+DWI",
=======
            {
                url: "https://placehold.co/600x600/0a0a0a/2a9d8f?text=AXIAL",
                view: "AXIAL",
                sequence: "T1_CONTRAST",
            },
            {
                url: "https://placehold.co/600x600/0a0a0a/2a9d8f?text=SAGITTAL",
                view: "SAGITTAL",
                sequence: "T2_FLAIR",
            },
            {
                url: "https://placehold.co/600x600/0a0a0a/2a9d8f?text=CORONAL",
                view: "CORONAL",
                sequence: "T2_FLAIR",
            },
            {
                url: "https://placehold.co/600x600/0a0a0a/2a9d8f?text=3D_RECON",
                view: "3D_RECON",
                sequence: "VOLUMETRIC",
            },
>>>>>>> b9ad394 (feat: implement Material Design 3 theme and update UI components with advanced MRI viewer functionality)
        ],
    },
    {
        id: "meningioma",
        name: "Meningioma",
        shortName: "Meningioma",
        grade: "Grade I",
        tags: ["Benign"],
        description:
            "A tumor that arises from the meninges — the membranes that surround your brain and spinal cord. Most are non-cancerous and slow-growing.",
        keyFeatures: [
            "Dural tail sign (thickening of adjacent dura).",
            "Well-circumscribed, extra-axial mass.",
            "Intense, uniform enhancement.",
            "Hyperostosis of adjacent bone.",
        ],
        differentials: ["Dural Metastasis", "Hemangiopericytoma", "Schwannoma"],
        mriImages: [
<<<<<<< HEAD
            "https://placehold.co/600x600/111111/444444.png?text=Meningioma+Axial+T1+C",
            "https://placehold.co/600x600/111111/444444.png?text=Meningioma+Coronal+T1+C",
            "https://placehold.co/600x600/111111/444444.png?text=Meningioma+Axial+T2",
=======
            {
                url: "https://placehold.co/600x600/0a0a0a/e9c46a?text=AXIAL",
                view: "AXIAL",
                sequence: "T1_CONTRAST",
            },
            {
                url: "https://placehold.co/600x600/0a0a0a/e9c46a?text=CORONAL",
                view: "CORONAL",
                sequence: "T1_CONTRAST",
            },
            {
                url: "https://placehold.co/600x600/0a0a0a/e9c46a?text=T2_AXIAL",
                view: "AXIAL",
                sequence: "T2_FLAIR",
            },
            {
                url: "https://placehold.co/600x600/0a0a0a/e9c46a?text=3D_RECON",
                view: "3D_RECON",
                sequence: "VOLUMETRIC",
            },
>>>>>>> b9ad394 (feat: implement Material Design 3 theme and update UI components with advanced MRI viewer functionality)
        ],
    },
    {
        id: "ms",
        name: "Multiple Sclerosis",
        shortName: "MS",
        tags: ["Demyelinating"],
        description:
            "A chronic disease involving the central nervous system. The immune system attacks the protective sheath (myelin) that covers nerve fibers, causing demyelination.",
        keyFeatures: [
            "Dawson's fingers (periventricular lesions perpendicular to ventricles).",
            "Ovoid lesions in juxtacortical and infratentorial regions.",
            "Open-ring enhancement in active lesions.",
            "T1 'black holes' indicating chronic axonal loss.",
        ],
        differentials: ["ADEM", "Small Vessel Disease", "Vasculitis"],
        mriImages: [
<<<<<<< HEAD
            "https://placehold.co/600x600/111111/444444.png?text=MS+Axial+FLAIR",
            "https://placehold.co/600x600/111111/444444.png?text=MS+Sagittal+FLAIR",
            "https://placehold.co/600x600/111111/444444.png?text=MS+Axial+T1+C",
=======
            {
                url: "https://placehold.co/600x600/0a0a0a/f4a261?text=AXIAL+FLAIR",
                view: "AXIAL",
                sequence: "T2_FLAIR",
            },
            {
                url: "https://placehold.co/600x600/0a0a0a/f4a261?text=SAGITTAL",
                view: "SAGITTAL",
                sequence: "T2_FLAIR",
            },
            {
                url: "https://placehold.co/600x600/0a0a0a/f4a261?text=AXIAL+T1C",
                view: "AXIAL",
                sequence: "T1_CONTRAST",
            },
            {
                url: "https://placehold.co/600x600/0a0a0a/f4a261?text=3D_RECON",
                view: "3D_RECON",
                sequence: "VOLUMETRIC",
            },
>>>>>>> b9ad394 (feat: implement Material Design 3 theme and update UI components with advanced MRI viewer functionality)
        ],
    },
];

export const initialChatMessages: ChatMessage[] = [
    {
        id: "1",
        role: "ai",
        content:
            "Hello! I'm your NeuroLearn AI assistant. I can help you understand these MRI scans and the underlying pathologies. What would you like to know about Glioblastoma today?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
        id: "2",
        role: "student",
        content: "Can you explain why the enhancement is irregular in GBM?",
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
    {
        id: "3",
        role: "ai",
        content:
            "The irregularity is primarily due to tumor necrosis. In GBM, cells grow so rapidly they outstrip their blood supply, causing central tissue death. The enhancing rim represents active, highly vascularized tumor at the periphery.",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
    },
    {
        id: "4",
        role: "student",
        content: "How do I distinguish it from a cerebral abscess on MRI?",
        timestamp: new Date(Date.now() - 1000 * 60 * 1),
    },
];

export const questions: Question[] = [
    {
        id: "q1",
        mriImage:
<<<<<<< HEAD
            "https://placehold.co/600x600/111111/444444.png?text=Question+1+MRI",
=======
            "https://placehold.co/600x600/0a0a0a/2a9d8f?text=Q1+Axial+T1C",
>>>>>>> b9ad394 (feat: implement Material Design 3 theme and update UI components with advanced MRI viewer functionality)
        options: [
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Ring-enhancing with central necrosis",
            },
            {
                diagnosisId: "astrocytoma",
                name: "Astrocytoma",
                hint: "Ill-defined, infiltrative, low-grade appearance",
            },
            {
                diagnosisId: "meningioma",
                name: "Meningioma",
                hint: "Extra-axial with dural tail sign",
            },
            {
                diagnosisId: "lymphoma",
                name: "Lymphoma",
                hint: "Periventricular, dense enhancement",
            },
        ],
        correctDiagnosisId: "astrocytoma",
        explanation:
            "The infiltrative nature and lack of clear borders observed in the T2 sequence are classic hallmarks of Grade II Astrocytoma. Unlike Glioblastoma, there is no evidence of central necrosis or thick ring enhancement. The mass effect on the lateral ventricles confirms significant volume displacement.",
    },
    {
        id: "q2",
        mriImage:
<<<<<<< HEAD
            "https://placehold.co/600x600/111111/444444.png?text=Question+2+MRI",
=======
            "https://placehold.co/600x600/0a0a0a/264653?text=Q2+Axial+T1C",
>>>>>>> b9ad394 (feat: implement Material Design 3 theme and update UI components with advanced MRI viewer functionality)
        options: [
            {
                diagnosisId: "meningioma",
                name: "Meningioma",
                hint: "Dural-based, uniform enhancement",
            },
            {
                diagnosisId: "schwannoma",
                name: "Acoustic Neuroma",
                hint: "Cerebellopontine angle, ice cream cone",
            },
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Intra-axial, necrotic center",
            },
            {
                diagnosisId: "stroke",
                name: "Ischemic Stroke",
                hint: "Vascular territory, wedge-shaped",
            },
        ],
        correctDiagnosisId: "meningioma",
        explanation:
            "This is a classic meningioma: an extra-axial, dural-based mass with intense, uniform enhancement and a visible dural tail. The mass is well-circumscribed and displaces rather than infiltrates adjacent brain.",
    },
    {
        id: "q3",
        mriImage:
<<<<<<< HEAD
            "https://placehold.co/600x600/111111/444444.png?text=Question+3+MRI",
=======
            "https://placehold.co/600x600/0a0a0a/2a9d8f?text=Q3+Sagittal+FLAIR",
>>>>>>> b9ad394 (feat: implement Material Design 3 theme and update UI components with advanced MRI viewer functionality)
        options: [
            {
                diagnosisId: "ms",
                name: "Multiple Sclerosis",
                hint: "Dawson's fingers, FLAIR hyperintensity",
            },
            {
                diagnosisId: "stroke",
                name: "Ischemic Stroke",
                hint: "Acute onset, restricted diffusion",
            },
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Large mass, ring enhancement",
            },
            {
                diagnosisId: "abscess",
                name: "Brain Abscess",
                hint: "Fever, restricted diffusion",
            },
        ],
        correctDiagnosisId: "ms",
        explanation:
            "The sagittal FLAIR image reveals multiple hyperintense ovoid lesions perpendicular to the lateral ventricles, known as Dawson's fingers, which are pathognomonic for Multiple Sclerosis.",
    },
    {
        id: "q4",
        mriImage:
            "https://placehold.co/600x600/0a0a0a/264653?text=Q4+Axial+DWI",
        options: [
            {
                diagnosisId: "abscess",
                name: "Brain Abscess",
                hint: "Smooth ring, restricted diffusion centrally",
            },
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Irregular rim, no central DWI restriction",
            },
            {
                diagnosisId: "metastasis",
                name: "Metastasis",
                hint: "Multiple lesions at grey-white junction",
            },
            {
                diagnosisId: "lymphoma",
                name: "CNS Lymphoma",
                hint: "Periventricular, homogeneous enhancement",
            },
        ],
        correctDiagnosisId: "abscess",
        explanation:
            "The DWI image shows restricted diffusion within the central cavity (bright signal on DWI, dark on ADC), which is characteristic of a pyogenic brain abscess. The smooth, thin enhancing rim distinguishes it from GBM.",
    },
    {
        id: "q5",
        mriImage: "https://placehold.co/600x600/0a0a0a/2a9d8f?text=Q5+Axial+T2",
        options: [
            {
                diagnosisId: "stroke",
                name: "Ischemic Stroke",
                hint: "Vascular territory, cortical involvement",
            },
            {
                diagnosisId: "ms",
                name: "Multiple Sclerosis",
                hint: "Periventricular white matter lesions",
            },
            {
                diagnosisId: "meningioma",
                name: "Meningioma",
                hint: "Extra-axial with dural attachment",
            },
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Ring-enhancing with edema",
            },
        ],
        correctDiagnosisId: "stroke",
        explanation:
            "The T2 hyperintensity follows a specific vascular territory (MCA distribution), demonstrating cortical and subcortical involvement typical of an ischemic stroke. The wedge-shaped, cortex-involving pattern is not seen in tumors.",
    },
    {
        id: "q6",
        mriImage:
            "https://placehold.co/600x600/0a0a0a/264653?text=Q6+Coronal+T1C",
        options: [
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Butterfly pattern across corpus callosum",
            },
            {
                diagnosisId: "meningioma",
                name: "Meningioma",
                hint: "Dural tail, uniform enhancement",
            },
            {
                diagnosisId: "astrocytoma",
                name: "Oligodendroglioma",
                hint: "Cortical, calcification, frontal lobe",
            },
            {
                diagnosisId: "metastasis",
                name: "Metastasis",
                hint: "Small lesion, large edema, ring-enhancing",
            },
        ],
        correctDiagnosisId: "gbm",
        explanation:
            "The bilateral involvement crossing the corpus callosum in a 'butterfly' pattern is highly characteristic of Glioblastoma Multiforme. This pattern occurs because GBM spreads via the white matter tracts of the corpus callosum.",
    },
    {
        id: "q7",
        mriImage:
            "https://placehold.co/600x600/0a0a0a/2a9d8f?text=Q7+Axial+T1C",
        options: [
            {
                diagnosisId: "metastasis",
                name: "Metastasis",
                hint: "Multiple ring-enhancing, grey-white junction",
            },
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Single large mass, corpus callosum crossing",
            },
            {
                diagnosisId: "abscess",
                name: "Brain Abscess",
                hint: "Fever, smooth thin rim enhancement",
            },
            {
                diagnosisId: "ms",
                name: "Multiple Sclerosis",
                hint: "Periventricular, open-ring enhancement",
            },
        ],
        correctDiagnosisId: "metastasis",
        explanation:
            "Multiple ring-enhancing lesions at the grey-white matter junction are the hallmark of cerebral metastases. The lesions are disproportionately large edema relative to lesion size, and the cortical/subcortical location distinguishes them from primary brain tumors.",
    },
    {
        id: "q8",
        mriImage:
            "https://placehold.co/600x600/0a0a0a/264653?text=Q8+Axial+FLAIR",
        options: [
            {
                diagnosisId: "lymphoma",
                name: "CNS Lymphoma",
                hint: "Periventricular, homogeneous, immune-compromised",
            },
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Necrotic center, irregular enhancement",
            },
            {
                diagnosisId: "stroke",
                name: "Ischemic Stroke",
                hint: "Vascular territory, DWI restriction",
            },
            {
                diagnosisId: "abscess",
                name: "Brain Abscess",
                hint: "Rim-enhancing, restricted diffusion centrally",
            },
        ],
        correctDiagnosisId: "lymphoma",
        explanation:
            "CNS Lymphoma typically presents as a periventricular, homogeneously enhancing mass in immunocompromised patients. Unlike GBM, it lacks central necrosis and instead shows dense, uniform enhancement due to the compact cellular architecture.",
    },
    {
        id: "q9",
        mriImage: "https://placehold.co/600x600/0a0a0a/2a9d8f?text=Q9+T2+FLAIR",
        options: [
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Ring-enhancing with central necrosis",
            },
            {
                diagnosisId: "astrocytoma",
                name: "Astrocytoma",
                hint: "Ill-defined, infiltrative, low-grade appearance",
            },
            {
                diagnosisId: "meningioma",
                name: "Meningioma",
                hint: "Extra-axial with dural tail sign",
            },
            {
                diagnosisId: "lymphoma",
                name: "Lymphoma",
                hint: "Periventricular, dense enhancement",
            },
        ],
        correctDiagnosisId: "astrocytoma",
        explanation:
            "The infiltrative nature and lack of clear borders observed in the T2 sequence are classic hallmarks of Grade II Astrocytoma. Unlike Glioblastoma, there is no evidence of central necrosis or thick ring enhancement.",
    },
    {
        id: "q10",
        mriImage:
            "https://placehold.co/600x600/0a0a0a/264653?text=Q10+Sagittal+T1",
        options: [
            {
                diagnosisId: "ms",
                name: "Multiple Sclerosis",
                hint: "Dawson's fingers, FLAIR hyperintensity",
            },
            {
                diagnosisId: "gbm",
                name: "Glioblastoma",
                hint: "Large mass, ring enhancement",
            },
            {
                diagnosisId: "meningioma",
                name: "Meningioma",
                hint: "Dural-based, uniform enhancement",
            },
            {
                diagnosisId: "stroke",
                name: "Ischemic Stroke",
                hint: "Vascular territory pattern",
            },
        ],
        correctDiagnosisId: "ms",
        explanation:
            "The sagittal T1 image shows multiple hypointense 'black holes' perpendicular to the corpus callosum, representing areas of chronic axonal loss in Multiple Sclerosis. These T1 black holes correlate with irreversible neurological disability.",
    },
];
