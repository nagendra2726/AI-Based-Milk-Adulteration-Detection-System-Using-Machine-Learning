document.addEventListener('DOMContentLoaded', () => {
    
    // ═══════════ THEME & NAV ═══════════
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('milkpure-theme') || 'dark-mode';
    if (savedTheme === 'light-mode') body.classList.add('light-mode');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            localStorage.setItem('milkpure-theme', body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode');
        });
    }

    // --- MOBILE MENU ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ═══════════ INDUSTRIAL TELEMETRY ═══════════
    const sliders = ['ph', 'fat', 'lactometer', 'density', 'conductivity', 'snf'];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        const display = document.getElementById(id + 'Val');
        if (slider && display) {
            slider.addEventListener('input', () => { display.textContent = slider.value; });
        }
    });

    // ═══════════ ANALYTICAL ENGINE ═══════════
    const detectForm = document.getElementById('detectForm');
    if (detectForm) {
        const randomizeBtn = document.getElementById('randomizeBtn');
        const placeholderState = document.getElementById('placeholderState');
        const resultState = document.getElementById('resultState');
        const gaugeFill = document.getElementById('gaugeFill');
        const purityVal = document.getElementById('purityVal');
        const statusPill = document.getElementById('statusPill');
        const resAdulterant = document.getElementById('resAdulterant');
        const resRecommendation = document.getElementById('resRecommendation');

        randomizeBtn.addEventListener('click', () => {
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                el.value = val;
                document.getElementById(id + 'Val').textContent = val;
            };
            setVal('ph', (Math.random() * 0.3 + 6.5).toFixed(1));
            setVal('fat', (Math.random() * 2 + 3.5).toFixed(1));
            setVal('lactometer', Math.floor(Math.random() * 5 + 27));
            setVal('density', (Math.random() * 0.004 + 1.027).toFixed(3));
            setVal('conductivity', (Math.random() * 1.5 + 4.5).toFixed(1));
            setVal('snf', (Math.random() * 0.5 + 8.5).toFixed(1));
            showToast("Sensors Calibrated.");
        });

        detectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            placeholderState.classList.add('hidden');
            resultState.classList.add('hidden');
            document.getElementById('loadingState')?.classList.remove('hidden');

            const payload = {
                temp: document.getElementById('temp')?.value || 25.0
            };
            sliders.forEach(id => payload[id] = document.getElementById(id).value);

            try {
                const response = await fetch('/api/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Prediction failed");
                }

                setTimeout(() => {
                    document.getElementById('loadingState')?.classList.add('hidden');
                    resultState.classList.remove('hidden');
                    
                    if (result.purity === undefined || result.purity === null) {
                        throw new Error("Invalid response from AI core");
                    }

                    const pValue = parseFloat(result.purity);
                    purityVal.textContent = pValue.toFixed(1);
                    resAdulterant.textContent = result.adulterant;
                    document.getElementById('resRisk').textContent = result.risk;
                    resRecommendation.textContent = result.recommendation;
                    
                    statusPill.textContent = result.status;
                    statusPill.className = 'status-pill ' + (pValue > 80 ? 'safe' : (pValue > 40 ? 'adulterated' : 'toxic'));

                    const circumference = 2 * Math.PI * 52;
                    const offset = circumference - (pValue / 100) * circumference;
                    gaugeFill.style.strokeDashoffset = offset;
                    
                    if (pValue > 80) gaugeFill.style.stroke = 'var(--success)';
                    else if (pValue > 40) gaugeFill.style.stroke = 'var(--warning)';
                    else gaugeFill.style.stroke = 'var(--danger)';

                    announceIndustrialResult(result);
                }, 1000);
            } catch (err) {
                document.getElementById('loadingState')?.classList.add('hidden');
                placeholderState.classList.remove('hidden');
                showToast("System Error: " + err.message, "error");
            }
        });

        document.getElementById('downloadPdf')?.addEventListener('click', () => {
            showToast("Report Engine initialized. Generating PDF...");
            // Standard PDF download simulation
            const link = document.createElement('a');
            link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent("INDUSTRIAL MILK QUALITY REPORT\n" + resAdulterant.textContent + "\n" + resRecommendation.textContent);
            link.download = "MilkPure_Report.txt";
            link.click();
        });

        document.getElementById('voiceBtn')?.addEventListener('click', () => {
            showToast("Voice Assistant active.");
        });
    }

    // ═══════════ ANALYTICS ═══════════
    const distCanvas = document.getElementById('distChart');
    if (distCanvas) {
        fetch('/api/analytics').then(r => r.json()).then(stats => {
            new Chart(distCanvas, {
                type: 'bar',
                data: { labels: stats.labels, datasets: [{ label: 'Metric', data: stats.counts, backgroundColor: '#6366f150', borderColor: '#6366f1', borderWidth: 2 }] },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
        });
    }

    function showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMsg');
        if (toast && toastMsg) {
            toastMsg.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }

    function announceIndustrialResult(data) {
        if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance();
            msg.text = `Industrial Analysis Complete. Sample quality is ${data.status}. Recommendation: ${data.recommendation}`;
            window.speechSynthesis.speak(msg);
        }
    }
});
