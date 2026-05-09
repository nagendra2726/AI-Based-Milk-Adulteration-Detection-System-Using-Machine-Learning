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
                const display = document.getElementById(id + 'Val');
                if (display) display.textContent = val;
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
            sliders.forEach(id => {
                const el = document.getElementById(id);
                if (el) payload[id] = el.value;
            });

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
            const link = document.createElement('a');
            link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent("INDUSTRIAL MILK QUALITY REPORT\n" + resAdulterant.textContent + "\n" + resRecommendation.textContent);
            link.download = "MilkPure_Report.txt";
            link.click();
        });

        document.getElementById('voiceBtn')?.addEventListener('click', () => {
            showToast("Voice Assistant active.");
        });
    }

    // ═══════════ HISTORY LOGIC ═══════════
    const historyBody = document.getElementById('historyBody');
    if (historyBody) {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/history');
                const history = await response.json();
                
                historyBody.innerHTML = history.length ? '' : '<tr><td colspan="5" style="text-align:center; color:var(--text-dim)">No test records found.</td></tr>';
                
                history.reverse().forEach(entry => {
                    const row = document.createElement('tr');
                    const riskClass = entry.purity > 80 ? 'success' : (entry.purity > 40 ? 'warning' : 'danger');
                    row.innerHTML = `
                        <td style="color:var(--${riskClass})">${entry.adulterant}</td>
                        <td>${entry.purity}%</td>
                        <td>${entry.risk}</td>
                        <td>${entry.confidence}%</td>
                        <td>${entry.timestamp}</td>
                    `;
                    historyBody.appendChild(row);
                });
            } catch (e) {
                console.error("History fetch failed", e);
            }
        };
        fetchHistory();
    }

    // ═══════════ ANALYTICS LOGIC ═══════════
    const distCanvas = document.getElementById('distChart');
    if (distCanvas) {
        fetch('/api/analytics').then(r => r.json()).then(stats => {
            // 1. Distribution Bar Chart
            new Chart(distCanvas, {
                type: 'bar',
                data: { 
                    labels: stats.labels, 
                    datasets: [{ 
                        label: 'Samples Detected', 
                        data: stats.counts, 
                        backgroundColor: ['rgba(98,182,203,0.8)', 'rgba(190,233,232,0.8)', 'rgba(255,255,255,0.8)', 'rgba(27,73,101,0.8)', 'rgba(85,150,165,0.8)'],
                        borderColor: ['#62B6CB', '#BEE9E8', '#FFFFFF', '#1B4965', '#5596A5'], 
                        borderWidth: 2 
                    }] 
                },
                options: { 
                    responsive: true, 
                    animation: {
                        duration: 1500,
                        easing: 'easeOutBounce'
                    },
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#BEE9E8' } }, x: { ticks: { color: '#BEE9E8' } } }
                }
            });

            // 2. Composition Pie Chart
            const pieCanvas = document.getElementById('pieChart');
            if (pieCanvas) {
                new Chart(pieCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: stats.labels,
                        datasets: [{
                            data: stats.counts,
                            backgroundColor: ['#62B6CB', '#BEE9E8', '#FFFFFF', '#1B4965', '#5596A5'],
                            borderWidth: 2,
                            borderColor: '#0B1F3B',
                            hoverOffset: 20
                        }]
                    },
                    options: { 
                        responsive: true,
                        animation: {
                            animateScale: true,
                            animateRotate: true,
                            duration: 2000,
                            easing: 'easeOutElastic'
                        },
                        plugins: { legend: { position: 'bottom', labels: { color: '#BEE9E8', font: { family: 'Outfit' } } } }
                    }
                });
            }

            // 3. Parameter Radar Chart
            const radarCanvas = document.getElementById('radarChart');
            if (radarCanvas) {
                new Chart(radarCanvas, {
                    type: 'radar',
                    data: {
                        labels: ['pH', 'Fat Content', 'Density', 'Lactometer', 'Conductivity', 'SNF'],
                        datasets: [
                            {
                                label: 'Pure Milk Avg',
                                data: [6.6, 4.5, 1.03, 30, 4.8, 8.5],
                                borderColor: '#62B6CB',
                                backgroundColor: 'rgba(98, 182, 203, 0.3)',
                                pointBackgroundColor: '#62B6CB'
                            },
                            {
                                label: 'Adulterated Avg',
                                data: [7.2, 2.1, 1.02, 22, 8.5, 5.2],
                                borderColor: '#1B4965',
                                backgroundColor: 'rgba(27, 73, 101, 0.3)',
                                pointBackgroundColor: '#1B4965'
                            }
                        ]
                    },
                    options: {
                        animation: {
                            duration: 1800,
                            easing: 'easeInOutQuart'
                        },
                        plugins: { legend: { labels: { color: '#BEE9E8' } } },
                        scales: { r: { grid: { color: 'rgba(190, 233, 232, 0.1)' }, angleLines: { color: 'rgba(190, 233, 232, 0.1)' }, pointLabels: { color: '#BEE9E8' }, ticks: { display: false } } }
                    }
                });
            }
        }).catch(err => {
            console.error("Analytics fetch failed", err);
            showToast("Failed to load market analytics.", "error");
        });
    }

    function showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMsg');
        if (toast && toastMsg) {
            toastMsg.textContent = msg;
            toast.className = 'toast ' + (type === 'error' ? 'error' : '') + ' show';
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
