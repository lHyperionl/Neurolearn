const Footer = () => {
    return (
        <footer className="mt-auto py-8 border-t border-[#3c494e] bg-[#0c0e11]">
            <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="font-mono text-[10px] text-[#859398] tracking-widest uppercase">
                    © 2024 NEUROLEARN // CLINICAL_PROTOCOL_V4
                </div>
                <div className="flex gap-6">
                    <a
                        className="font-mono text-[10px] text-[#859398] hover:text-[#a8e8ff] uppercase transition-colors"
                        href="#"
                    >
                        Privacy_Policy
                    </a>
                    <a
                        className="font-mono text-[10px] text-[#859398] hover:text-[#a8e8ff] uppercase transition-colors"
                        href="#"
                    >
                        Terminal_Docs
                    </a>
                    <a
                        className="font-mono text-[10px] text-[#859398] hover:text-[#a8e8ff] uppercase transition-colors"
                        href="#"
                    >
                        Support_Link
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
