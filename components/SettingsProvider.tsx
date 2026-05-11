"use client";

import { createContext, useContext, useEffect, useState } from "react";

type FontSize = "small" | "medium" | "large";
type Language = "en" | "sk";

interface SettingsContextValue {
    fontSize: FontSize;
    language: Language;
    setFontSize: (size: FontSize) => void;
    setLanguage: (lang: Language) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
    fontSize: "medium",
    language: "en",
    setFontSize: () => {},
    setLanguage: () => {},
});

export const useSettings = () => useContext(SettingsContext);

const FONT_SIZE_CLASSES: FontSize[] = ["small", "medium", "large"];

export const translations = {
    en: {
        "settings.title": "Settings",
        "settings.subtitle": "Manage your display preferences.",
        "settings.fontSize": "Font Size",
        "settings.small": "Small",
        "settings.medium": "Medium",
        "settings.large": "Large",
        "settings.language": "Language",
        "settings.languageNote": "Language applies to Settings and Support pages. Full localisation coming soon.",
        "support.title": "Support",
        "support.subtitle": "Get help or help us improve.",
        "support.getSupport": "Get Support",
        "support.getSupportSubtitle": "Run into a problem or have an idea? Let us know.",
        "support.bugReport": "Report a Bug",
        "support.bugReportDesc": "Found something broken? Describe the issue and we'll look into it.",
        "support.bugBtn": "Open Bug Report",
        "support.featureRequest": "Suggest a Feature",
        "support.featureRequestDesc": "Have an idea that would make NeuroLearn better? We'd love to hear it.",
        "support.featureBtn": "Send Suggestion",
        "support.supportUs": "Support Us",
        "support.supportUsSubtitle": "NeuroLearn is built by students at TUKE. Your input makes it better.",
        "support.builtBy": "Built by students at the Technical University of Košice (TUKE).",
        "support.builtByDesc": "This project is open and evolving. Every bug report and feature idea directly shapes its future.",
        "support.feedbackCard": "Your feedback helps us grow",
        "support.feedbackDesc": "All ideas are welcome — big or small. We read every message.",
    },
    sk: {
        "settings.title": "Nastavenia",
        "settings.subtitle": "Spravujte svoje preferencie zobrazenia.",
        "settings.fontSize": "Veľkosť písma",
        "settings.small": "Malé",
        "settings.medium": "Stredné",
        "settings.large": "Veľké",
        "settings.language": "Jazyk",
        "settings.languageNote": "Jazyk sa vzťahuje na stránky Nastavenia a Podpora. Plná lokalizácia bude čoskoro.",
        "support.title": "Podpora",
        "support.subtitle": "Získajte pomoc alebo pomôžte nám zlepšiť sa.",
        "support.getSupport": "Získať pomoc",
        "support.getSupportSubtitle": "Narazili ste na problém alebo máte nápad? Dajte nám vedieť.",
        "support.bugReport": "Nahlásiť chybu",
        "support.bugReportDesc": "Niečo nefunguje? Opíšte problém a my sa na to pozrieme.",
        "support.bugBtn": "Otvoriť hlásenie chyby",
        "support.featureRequest": "Navrhnúť funkciu",
        "support.featureRequestDesc": "Máte nápad, ktorý by NeuroLearn vylepšil? Radi ho počujeme.",
        "support.featureBtn": "Odoslať návrh",
        "support.supportUs": "Podporiť nás",
        "support.supportUsSubtitle": "NeuroLearn vytvárajú študenti TUKE. Váš príspevok ho zlepšuje.",
        "support.builtBy": "Vytvorili študenti Technickej univerzity v Košiciach (TUKE).",
        "support.builtByDesc": "Tento projekt je otvorený a stále sa vyvíja. Každé hlásenie chyby a nápad priamo formuje jeho budúcnosť.",
        "support.feedbackCard": "Vaša spätná väzba nám pomáha rásť",
        "support.feedbackDesc": "Vitajú všetky nápady — veľké aj malé. Čítame každú správu.",
    },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [fontSize, setFontSizeState] = useState<FontSize>("medium");
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        const storedSize = localStorage.getItem("fontSize") as FontSize | null;
        const storedLang = localStorage.getItem("language") as Language | null;
        if (storedSize && FONT_SIZE_CLASSES.includes(storedSize)) {
            applyFontSize(storedSize);
            setFontSizeState(storedSize);
        }
        if (storedLang === "en" || storedLang === "sk") {
            setLanguageState(storedLang);
        }
    }, []);

    function applyFontSize(size: FontSize) {
        const html = document.documentElement;
        FONT_SIZE_CLASSES.forEach((s) => html.classList.remove(`font-size-${s}`));
        html.classList.add(`font-size-${size}`);
    }

    function setFontSize(size: FontSize) {
        localStorage.setItem("fontSize", size);
        applyFontSize(size);
        setFontSizeState(size);
    }

    function setLanguage(lang: Language) {
        localStorage.setItem("language", lang);
        setLanguageState(lang);
    }

    return (
        <SettingsContext.Provider value={{ fontSize, language, setFontSize, setLanguage }}>
            {children}
        </SettingsContext.Provider>
    );
}
