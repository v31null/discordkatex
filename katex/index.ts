import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { React } from "@webpack/common";

declare const katex: any;

export default definePlugin({
    name: "KaTeX-Integration",
    description: "Renders LaTeX formulas in messages using KaTeX",
    authors: [{ name: "V31NULL", id: 1108761945303158784n }],
    
    observer: null as MutationObserver | null,
    
    start() {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
        document.head.appendChild(style);

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
        script.onload = () => {
            console.log("KaTeX loaded");
            this.startObserver();
        };
        document.head.appendChild(script);
    },
    
    stop() {
        this.observer?.disconnect();
    },
    
    startObserver() {
        this.observer = new MutationObserver(() => {
            this.processMessages();
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.processMessages();
    },
    
    processMessages() {
        const messages = document.querySelectorAll('[id^="message-content-"]');
        
        messages.forEach((msg: Element) => {
            if (msg.getAttribute('data-katex-processed')) return;
            
            const text = msg.textContent;
            if (!text?.includes('$')) return;
            
            const parts = text.split(/(\$\$[^\$]+\$\$|\$[^\$]+\$)/g);
            msg.innerHTML = '';
            
            parts.forEach(part => {
                if (part.startsWith('$')) {
                    const isDisplay = part.startsWith('$$');
                    const formula = isDisplay ? part.slice(2, -2) : part.slice(1, -1);
                    
                    try {
                        const span = document.createElement('span');
                        span.innerHTML = katex.renderToString(formula, {
                            displayMode: isDisplay,
                            throwOnError: false
                        });
                        msg.appendChild(span);
                    } catch (e) {
                        msg.appendChild(document.createTextNode(part));
                    }
                } else if (part) {
                    msg.appendChild(document.createTextNode(part));
                }
            });
            
            msg.setAttribute('data-katex-processed', 'true');
        });
    }
});