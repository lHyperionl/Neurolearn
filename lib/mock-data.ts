export interface Diagnosis {
    id: string;
    name: string;
    shortName: string;
    grade?: string;
    tags: string[];
    description: string;
    keyFeatures: string[];
    differentials: string[];
    mriImages: string[];
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
        name: "Glioblastoma Multiforme",
        shortName: "GBM",
        grade: "Grade IV",
        tags: ["High Malignancy", "WHO Class IV", "Glial Tumor"],
        description:
            "A fast-growing, aggressive type of CNS tumor that forms on the supportive tissue of the brain. It is the most common malignant brain tumor in adults.",
        keyFeatures: [
            "Ring-enhancing lesion with irregular borders",
            "Central necrosis (dark center on T1+C)",
            "Significant peritumoral vasogenic edema",
            "Mass effect with midline shift",
            "Crossing the corpus callosum (butterfly glioma)",
        ],
        differentials: ["Brain Abscess", "Metastasis", "Tumefactive MS"],
        mriImages: [
            "https://placehold.co/600x600/111111/444444.png?text=GBM+Axial+T1+C",
            "https://placehold.co/600x600/111111/444444.png?text=GBM+Sagittal+T2",
            "https://placehold.co/600x600/111111/444444.png?text=GBM+Coronal+FLAIR",
            "https://placehold.co/600x600/111111/444444.png?text=GBM+Axial+DWI",
        ],
    },
    {
        id: "meningioma",
        name: "Meningioma",
        shortName: "Meningioma",
        grade: "Grade I",
        tags: ["Extra-axial", "Benign", "Dural-based"],
        description:
            "A tumor that arises from the meninges — the membranes that surround your brain and spinal cord. Most are non-cancerous and slow-growing.",
        keyFeatures: [
            "Dural tail sign (thickening of adjacent dura)",
            "Well-circumscribed, extra-axial mass",
            "Intense, uniform enhancement",
            "CSF cleft sign",
            "Hyperostosis of adjacent bone",
        ],
        differentials: ["Dural Metastasis", "Hemangiopericytoma", "Schwannoma"],
        mriImages: [
            "https://placehold.co/600x600/111111/444444.png?text=Meningioma+Axial+T1+C",
            "https://placehold.co/600x600/111111/444444.png?text=Meningioma+Coronal+T1+C",
            "https://placehold.co/600x600/111111/444444.png?text=Meningioma+Axial+T2",
        ],
    },
    {
        id: "ms",
        name: "Multiple Sclerosis",
        shortName: "MS",
        tags: ["Demyelinating", "White Matter", "Autoimmune"],
        description:
            "A chronic disease involving the central nervous system. The immune system attacks the protective sheath (myelin) that covers nerve fibers.",
        keyFeatures: [
            "Dawson's fingers (periventricular lesions)",
            "Ovoid lesions perpendicular to ventricles",
            "Juxtacortical and infratentorial involvement",
            "Open-ring enhancement (active lesions)",
            "T1 'black holes' (chronic axonal loss)",
        ],
        differentials: ["ADEM", "Small Vessel Disease", "Vasculitis"],
        mriImages: [
            "https://placehold.co/600x600/111111/444444.png?text=MS+Axial+FLAIR",
            "https://placehold.co/600x600/111111/444444.png?text=MS+Sagittal+FLAIR",
            "https://placehold.co/600x600/111111/444444.png?text=MS+Axial+T1+C",
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
        content: "What makes GBM different from a brain abscess on T1?",
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
    },
    {
        id: "3",
        role: "ai",
        content:
            "Great question! On T1-weighted images with contrast, both can show ring enhancement. However, a brain abscess typically has a smooth, thin, regular rim of enhancement, whereas GBM usually shows a thick, irregular, 'shaggy' rim. Additionally, on Diffusion Weighted Imaging (DWI), an abscess will typically show restricted diffusion (bright signal) in its center, while the necrotic center of a GBM usually does not.",
        timestamp: new Date(Date.now() - 1000 * 60 * 1),
    },
];

export const questions: Question[] = [
    {
        id: "q1",
        mriImage:
            "https://placehold.co/600x600/111111/444444.png?text=Question+1+MRI",
        options: [
            {
                diagnosisId: "gbm",
                name: "Glioblastoma Multiforme",
                hint: "Ring-enhancing with irregular borders",
            },
            {
                diagnosisId: "abscess",
                name: "Brain Abscess",
                hint: "Smooth rim, restricted diffusion",
            },
            {
                diagnosisId: "metastasis",
                name: "Metastasis",
                hint: "Multiple lesions, junctional location",
            },
            {
                diagnosisId: "ms",
                name: "Multiple Sclerosis",
                hint: "Periventricular ovoid lesions",
            },
        ],
        correctDiagnosisId: "gbm",
        explanation:
            "The image shows a large, irregular ring-enhancing lesion with central necrosis and significant surrounding edema, characteristic of Glioblastoma Multiforme.",
    },
    {
        id: "q2",
        mriImage:
            "https://placehold.co/600x600/111111/444444.png?text=Question+2+MRI",
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
            "This is a classic meningioma: an extra-axial, dural-based mass with intense, uniform enhancement and a visible dural tail.",
    },
    {
        id: "q3",
        mriImage:
            "https://placehold.co/600x600/111111/444444.png?text=Question+3+MRI",
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
            "The sagittal FLAIR image reveals multiple hyperintense ovoid lesions perpendicular to the lateral ventricles, known as Dawson's fingers, which are pathognomonic for MS.",
    },
];
