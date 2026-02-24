(() => {
  const doc = document;
  const root = doc.documentElement;
  const THEME_KEY = "study-abroad-theme";

  const setupTheme = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "night" : "light");

    const applyTheme = (theme) => {
      const nextTheme = theme === "night" ? "night" : "light";
      root.setAttribute("data-theme", nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);

      const toggle = doc.getElementById("themeToggle");
      if (toggle) {
        const isNight = nextTheme === "night";
        toggle.setAttribute("aria-pressed", String(isNight));
        toggle.setAttribute("aria-label", isNight ? "লাইট মোড চালু করুন" : "ডার্ক মোড চালু করুন");
        const label = toggle.querySelector(".theme-toggle-label");
        if (label) label.textContent = isNight ? "Light" : "Night";
      }
    };

    applyTheme(initialTheme);

    const toggle = doc.createElement("button");
    toggle.type = "button";
    toggle.id = "themeToggle";
    toggle.className = "theme-toggle";
    toggle.innerHTML = `
      <span class="theme-toggle-dot" aria-hidden="true"></span>
      <span class="theme-toggle-label">Night</span>
    `;
    doc.body.appendChild(toggle);
    applyTheme(initialTheme);

    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "night" ? "night" : "light";
      applyTheme(current === "night" ? "light" : "night");
    });
  };

  const showToast = (() => {
    const toast = doc.createElement("div");
    toast.className = "toast";
    doc.body.appendChild(toast);
    let timer;

    return (message) => {
      toast.textContent = message;
      toast.classList.add("show");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        toast.classList.remove("show");
      }, 2200);
    };
  })();

  const setupMenu = () => {
    const menuBtn = doc.getElementById("menuToggle");
    const menu = doc.getElementById("menu");
    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.classList.toggle("open");
    });

    menu.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", () => menu.classList.remove("open"));
    });

    doc.addEventListener("click", (event) => {
      const insideMenu = menu.contains(event.target);
      const onButton = menuBtn.contains(event.target);
      if (!insideMenu && !onButton) {
        menu.classList.remove("open");
      }
    });
  };

  const setupSmoothAnchors = () => {
    doc.querySelectorAll("a[href^='#']").forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") {
          event.preventDefault();
          return;
        }

        const target = doc.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const setupAuthButtons = () => {
    const authLinks = doc.querySelectorAll(".nav-actions a");
    authLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const label = link.textContent.trim();

        if (label.includes("নিবন্ধন")) {
          showToast("নিবন্ধন প্রক্রিয়া শুরু হচ্ছে...");
        } else {
          showToast("লগইন প্রক্রিয়া শুরু হচ্ছে...");
        }
      });
    });
  };

  const setupCountryFilter = () => {
    const countriesSection = doc.getElementById("countries");
    if (!countriesSection) return;

    const pills = Array.from(countriesSection.querySelectorAll(".pill-row .pill"));
    const cards = Array.from(countriesSection.querySelectorAll(".cards-grid > .country-card"));
    const moreBtn = countriesSection.querySelector("#countriesMoreBtn");
    if (!pills.length || !cards.length) return;

    let activeFilter = "";
    let isExpanded = false;
    const maxVisible = 5;
    const allPill = pills.find((pill) => (pill.getAttribute("data-filter") || "") === "all");

    const setActivePill = (filterValue) => {
      pills.forEach((pill) => {
        const pillFilter = pill.getAttribute("data-filter") || "";
        const shouldBeActive =
          filterValue === ""
            ? pillFilter === "all"
            : pillFilter === filterValue;
        pill.classList.toggle("active", shouldBeActive);
      });
    };

    const applyFilter = () => {
      const matchedCards = cards.filter((card) => {
        const country = card.getAttribute("data-country") || "";
        return !activeFilter || activeFilter === country;
      });

      cards.forEach((card) => card.classList.add("is-hidden"));

      matchedCards.forEach((card, index) => {
        const visible = isExpanded || index < maxVisible;
        card.classList.toggle("is-hidden", !visible);
      });

      if (!moreBtn) return;

      if (matchedCards.length <= maxVisible) {
        moreBtn.style.display = "none";
        return;
      }

      moreBtn.style.display = "inline-block";
      moreBtn.textContent = isExpanded ? "কম দেখুন" : "বিস্তারিত দেখুন";
    };

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const value = pill.getAttribute("data-filter") || "";
        const next =
          value === "all"
            ? ""
            : activeFilter === value
              ? ""
              : value;
        activeFilter = next;
        isExpanded = false;

        setActivePill(next);
        applyFilter();
        showToast(next ? `${pill.textContent.trim()} ডেস্টিনেশন দেখানো হচ্ছে` : "সব ডেস্টিনেশন দেখানো হচ্ছে");
      });
    });

    moreBtn?.addEventListener("click", () => {
      isExpanded = !isExpanded;
      applyFilter();
      showToast(isExpanded ? "আরও ডেস্টিনেশন দেখানো হচ্ছে" : "সংক্ষিপ্ত তালিকা দেখানো হচ্ছে");
    });

    // Initial state: show all cards under "সব দেশ".
    if (allPill) {
      setActivePill("");
    }
    applyFilter();
  };

  const setupCards = () => {
    doc.querySelectorAll("#countries .country-card").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", (event) => {
        const directLink = event.target.closest(".details-link");
        if (directLink) return;

        const url = card.getAttribute("data-url");
        if (url) {
          window.location.href = url;
        }
      });
    });

    doc.querySelectorAll("#resources .country-card").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const title = card.querySelector("h4")?.textContent.trim() || "ফিচার";
        const tag = card.querySelector(".tag")?.textContent.trim() || "বিস্তারিত";
        showToast(`${title} - ${tag}`);
      });
    });
  };

  const setupTools = () => {
    const tools = Array.from(doc.querySelectorAll("#tools .tool"));
    if (!tools.length) return;

    const modal = doc.createElement("div");
    modal.className = "tool-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="tool-modal-card" role="dialog" aria-modal="true" aria-labelledby="toolModalTitle">
        <div class="tool-modal-head">
          <h5 id="toolModalTitle">টুল</h5>
          <button type="button" class="tool-close" aria-label="বন্ধ করুন">×</button>
        </div>
        <div class="tool-body" id="toolModalBody"></div>
      </div>
    `;
    doc.body.appendChild(modal);

    const titleEl = modal.querySelector("#toolModalTitle");
    const bodyEl = modal.querySelector("#toolModalBody");
    const closeBtn = modal.querySelector(".tool-close");

    const closeModal = () => {
      modal.hidden = true;
      bodyEl.innerHTML = "";
    };

    closeBtn?.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    const formatMoney = (value, currency) =>
      `${currency} ${Math.round(value).toLocaleString("en-US")}`;

    const openCostCalculator = () => {
      titleEl.textContent = "খরচ ক্যালকুলেটর";
      bodyEl.innerHTML = `
        <div class="tool-grid">
          <div class="tool-field">
            <label>দেশ</label>
            <select id="costCountry">
              <option value="USD">যুক্তরাষ্ট্র</option>
              <option value="CAD">কানাডা</option>
              <option value="GBP">যুক্তরাজ্য</option>
              <option value="AUD">অস্ট্রেলিয়া</option>
              <option value="EUR">জার্মানি/ইউরোপ</option>
              <option value="CNY">চীন</option>
            </select>
          </div>
          <div class="tool-field">
            <label>বার্ষিক টিউশন</label>
            <input id="costTuition" type="number" min="0" value="20000" />
          </div>
          <div class="tool-field">
            <label>মাসিক জীবনযাত্রা খরচ</label>
            <input id="costLiving" type="number" min="0" value="1200" />
          </div>
          <div class="tool-field">
            <label>কোর্স সময়কাল (বছর)</label>
            <input id="costYears" type="number" min="1" step="0.5" value="2" />
          </div>
          <div class="tool-field">
            <label>স্কলারশিপ/ডিসকাউন্ট (মোট)</label>
            <input id="costScholarship" type="number" min="0" value="0" />
          </div>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn primary" id="costCalcBtn">হিসাব করুন</button>
          <button type="button" class="tool-btn ghost" id="costResetBtn">রিসেট</button>
        </div>
        <div class="tool-result" id="costResult">আপনার তথ্য দিয়ে হিসাব করুন।</div>
      `;

      const country = bodyEl.querySelector("#costCountry");
      const tuition = bodyEl.querySelector("#costTuition");
      const living = bodyEl.querySelector("#costLiving");
      const years = bodyEl.querySelector("#costYears");
      const scholarship = bodyEl.querySelector("#costScholarship");
      const result = bodyEl.querySelector("#costResult");

      bodyEl.querySelector("#costCalcBtn")?.addEventListener("click", () => {
        const y = Math.max(Number(years.value) || 0, 0);
        const t = Math.max(Number(tuition.value) || 0, 0);
        const l = Math.max(Number(living.value) || 0, 0);
        const s = Math.max(Number(scholarship.value) || 0, 0);
        const currency = country.value;

        const tuitionTotal = t * y;
        const livingTotal = l * 12 * y;
        const gross = tuitionTotal + livingTotal;
        const net = Math.max(gross - s, 0);
        const monthlyNeed = y ? net / (12 * y) : 0;

        result.innerHTML = `
          মোট টিউশন: <b>${formatMoney(tuitionTotal, currency)}</b><br/>
          মোট জীবনযাত্রা খরচ: <b>${formatMoney(livingTotal, currency)}</b><br/>
          মোট আনুমানিক খরচ: <b>${formatMoney(gross, currency)}</b><br/>
          স্কলারশিপ বাদে নেট খরচ: <b>${formatMoney(net, currency)}</b><br/>
          মাসিক গড় বাজেট: <b>${formatMoney(monthlyNeed, currency)}</b>
        `;
      });

      bodyEl.querySelector("#costResetBtn")?.addEventListener("click", () => {
        tuition.value = "20000";
        living.value = "1200";
        years.value = "2";
        scholarship.value = "0";
        country.value = "USD";
        result.textContent = "আপনার তথ্য দিয়ে হিসাব করুন।";
      });
    };

    const openIeltsChecker = () => {
      titleEl.textContent = "আইইএলটিএস চেকার";
      bodyEl.innerHTML = `
        <div class="tool-grid">
          <div class="tool-field">
            <label>Overall Score</label>
            <input id="ieltsOverall" type="number" min="0" max="9" step="0.5" value="6.5" />
          </div>
          <div class="tool-field">
            <label>Lowest Band</label>
            <input id="ieltsBand" type="number" min="0" max="9" step="0.5" value="6.0" />
          </div>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn primary" id="ieltsCheckBtn">রেজাল্ট দেখুন</button>
        </div>
        <div class="tool-result" id="ieltsResult">স্কোর দিয়ে উপযোগী দেশ/প্রোগ্রাম দেখুন।</div>
      `;

      bodyEl.querySelector("#ieltsCheckBtn")?.addEventListener("click", () => {
        const overall = Number(bodyEl.querySelector("#ieltsOverall")?.value || 0);
        const band = Number(bodyEl.querySelector("#ieltsBand")?.value || 0);
        const result = bodyEl.querySelector("#ieltsResult");
        let tips = [];

        if (overall >= 7 && band >= 6.5) {
          tips = ["যুক্তরাষ্ট্র (Top বিশ্ববিদ্যালয়)", "যুক্তরাজ্য (Russell Group)", "কানাডা (Masters/Research)", "অস্ট্রেলিয়া (Skilled programs)"];
        } else if (overall >= 6.5 && band >= 6) {
          tips = ["কানাডা (College/University)", "যুক্তরাজ্য (অনেক Masters প্রোগ্রাম)", "অস্ট্রেলিয়া (বেশিরভাগ UG/PG)", "জার্মানি (English-taught programs)"];
        } else if (overall >= 6 && band >= 5.5) {
          tips = ["কানাডা/UK এর pathway বা college route", "অস্ট্রেলিয়ার কিছু প্রোগ্রাম", "চীনের English medium programs"];
        } else {
          tips = ["প্রথমে IELTS স্কোর উন্নত করুন", "প্রস্তুতি নিন: Writing + Speaking", "প্রি-মাস্টার্স/পাথওয়ে প্রোগ্রাম বিবেচনা করুন"];
        }

        result.innerHTML = `<b>আপনার স্কোর অনুযায়ী সম্ভাব্য অপশন:</b><ul>${tips.map((item) => `<li>${item}</li>`).join("")}</ul>`;
      });
    };

    const openVisaTimeline = () => {
      titleEl.textContent = "ভিসা টাইমলাইন";
      bodyEl.innerHTML = `
        <div class="tool-grid">
          <div class="tool-field">
            <label>দেশ</label>
            <select id="visaCountry">
              <option value="কানাডা">কানাডা</option>
              <option value="যুক্তরাষ্ট্র">যুক্তরাষ্ট্র</option>
              <option value="যুক্তরাজ্য">যুক্তরাজ্য</option>
              <option value="অস্ট্রেলিয়া">অস্ট্রেলিয়া</option>
              <option value="জার্মানি">জার্মানি</option>
              <option value="চীন">চীন</option>
            </select>
          </div>
          <div class="tool-field">
            <label>ইনটেক মাস</label>
            <select id="visaIntake">
              <option value="সেপ্টেম্বর">সেপ্টেম্বর</option>
              <option value="জানুয়ারি">জানুয়ারি</option>
              <option value="মে">মে</option>
            </select>
          </div>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn primary" id="visaPlanBtn">টাইমলাইন তৈরি করুন</button>
        </div>
        <div class="tool-result" id="visaResult">দেশ ও ইনটেক নির্বাচন করে টাইমলাইন জেনারেট করুন।</div>
      `;

      bodyEl.querySelector("#visaPlanBtn")?.addEventListener("click", () => {
        const country = bodyEl.querySelector("#visaCountry")?.value || "দেশ";
        const intake = bodyEl.querySelector("#visaIntake")?.value || "ইনটেক";
        const result = bodyEl.querySelector("#visaResult");

        result.innerHTML = `
          <b>${country} - ${intake} ইনটেক টাইমলাইন</b>
          <ul>
            <li>ইনটেকের ১০-১২ মাস আগে: কোর্স/বিশ্ববিদ্যালয় shortlisting</li>
            <li>ইনটেকের ৮-৯ মাস আগে: IELTS + SOP + LOR প্রস্তুতি</li>
            <li>ইনটেকের ৬-৭ মাস আগে: আবেদন সাবমিট ও অফার লেটার সংগ্রহ</li>
            <li>ইনটেকের ৪-৫ মাস আগে: ফান্ড/ডকুমেন্ট ফাইনালাইজ</li>
            <li>ইনটেকের ৩-৪ মাস আগে: ভিসা আবেদন + বায়োমেট্রিকস</li>
            <li>ইনটেকের ১-২ মাস আগে: টিকিট, বাসস্থান, প্রি-ডিপারচার</li>
          </ul>
        `;
      });
    };

    const openPdfGuide = () => {
      titleEl.textContent = "পিডিএফ গাইড";
      bodyEl.innerHTML = `
        <div class="tool-grid">
          <div class="tool-field">
            <label>দেশ</label>
            <select id="guideCountry">
              <option value="যুক্তরাষ্ট্র">যুক্তরাষ্ট্র</option>
              <option value="কানাডা">কানাডা</option>
              <option value="যুক্তরাজ্য">যুক্তরাজ্য</option>
              <option value="অস্ট্রেলিয়া">অস্ট্রেলিয়া</option>
              <option value="জার্মানি">জার্মানি</option>
              <option value="চীন">চীন</option>
            </select>
          </div>
          <div class="tool-field">
            <label>গাইড টাইপ</label>
            <select id="guideType">
              <option value="ভিসা চেকলিস্ট">ভিসা চেকলিস্ট</option>
              <option value="SOP নমুনা">SOP নমুনা</option>
              <option value="স্কলারশিপ গাইড">স্কলারশিপ গাইড</option>
              <option value="ডকুমেন্ট টেমপ্লেট">ডকুমেন্ট টেমপ্লেট</option>
            </select>
          </div>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn primary" id="guideDownloadBtn">গাইড ডাউনলোড</button>
        </div>
        <div class="tool-result" id="guideResult">দেশ ও গাইড টাইপ বেছে ডাউনলোড করুন।</div>
      `;

      bodyEl.querySelector("#guideDownloadBtn")?.addEventListener("click", () => {
        const country = bodyEl.querySelector("#guideCountry")?.value || "দেশ";
        const type = bodyEl.querySelector("#guideType")?.value || "গাইড";
        const result = bodyEl.querySelector("#guideResult");
        const content = `বিদেশে পড়তে চাই\nদেশ: ${country}\nগাইড: ${type}\n\nচেকলিস্ট:\n1) পাসপোর্ট\n2) Academic documents\n3) ভাষা পরীক্ষার স্কোর\n4) SOP/LOR\n5) ফাইন্যান্স প্রুফ\n`;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = doc.createElement("a");
        link.href = url;
        link.download = `${country}-${type}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        result.textContent = `${country} - ${type} গাইড ডাউনলোড হয়েছে।`;
      });
    };

    const openTool = (key) => {
      modal.hidden = false;
      if (key === "cost-calculator") openCostCalculator();
      else if (key === "ielts-checker") openIeltsChecker();
      else if (key === "visa-timeline") openVisaTimeline();
      else if (key === "pdf-guide") openPdfGuide();
    };

    tools.forEach((tool) => {
      tool.style.cursor = "pointer";
      tool.addEventListener("click", () => {
        const key = tool.getAttribute("data-tool") || "";
        if (!key) return;
        openTool(key);
        const title = tool.querySelector("b")?.textContent.trim() || "টুল";
        showToast(`${title} চালু হয়েছে`);
      });
    });
  };

  const setupResources = () => {
    const section = doc.getElementById("resources");
    if (!section) return;

    const pills = Array.from(section.querySelectorAll(".resource-pills .pill"));
    const cards = Array.from(section.querySelectorAll(".resources-grid .resource-card"));
    let activeFilter = "";

    const applyFilter = () => {
      cards.forEach((card) => {
        const type = card.getAttribute("data-resource-type") || "";
        const visible = !activeFilter || activeFilter === type;
        card.classList.toggle("is-hidden", !visible);
      });
    };

    const setActivePill = (value) => {
      pills.forEach((pill) => {
        const pillValue = pill.getAttribute("data-resource-filter") || "";
        const shouldBeActive =
          value === ""
            ? pillValue === "all"
            : pillValue === value;
        pill.classList.toggle("active", shouldBeActive);
      });
    };

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const value = pill.getAttribute("data-resource-filter") || "";
        activeFilter = value === "all" ? "" : value;
        setActivePill(activeFilter);
        applyFilter();
      });
    });

    setActivePill("");
    applyFilter();

    section.querySelectorAll(".resource-action").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const card = btn.closest(".resource-card");
        const title = card?.querySelector("h4")?.textContent.trim() || "রিসোর্স";
        const action = btn.getAttribute("data-action") || "";

        if (action === "open-guide") {
          showToast(`${title} গাইড টুলস থেকে ডাউনলোড করতে পারবেন`);
          return;
        }

        showToast(`${title} - মূল পয়েন্ট দেখানো হয়েছে`);
      });
    });

    const planBtn = section.querySelector("#resourcePlanBtn");
    const result = section.querySelector("#resourcePlanResult");
    const country = section.querySelector("#rCountry");
    const intake = section.querySelector("#rIntake");
    const profile = section.querySelector("#rProfile");
    if (!planBtn || !result || !country || !intake || !profile) return;

    planBtn.addEventListener("click", () => {
      const c = country.value;
      const i = intake.value;
      const p = profile.value;

      result.innerHTML = `
        <b>${c} - ${i} (${p}) পার্সোনাল প্ল্যান</b>
        <ul>
          <li>মাস ১-২: বিশ্ববিদ্যালয় শর্টলিস্ট, IELTS/যোগ্যতা মূল্যায়ন</li>
          <li>মাস ৩-৪: SOP, LOR, CV এবং ডকুমেন্ট সেট তৈরি</li>
          <li>মাস ৫-৬: আবেদন সাবমিট, ফি ও অফার ট্র্যাকিং</li>
          <li>মাস ৭+: ভিসা ফাইল, ফান্ডিং, প্রি-ডিপারচার চেকলিস্ট</li>
        </ul>
      `;
    });
  };

  const setupFlags = () => {
    const countriesSection = doc.getElementById("countries");
    if (!countriesSection) return;

    const pillMap = new Map(
      Array.from(countriesSection.querySelectorAll(".pill")).map((pill) => [
        pill.getAttribute("data-filter"),
        pill,
      ])
    );

    doc.querySelectorAll(".flag-chip").forEach((chip) => {
      chip.style.cursor = "pointer";
      chip.addEventListener("click", () => {
        const filter = chip.getAttribute("data-filter") || "";
        countriesSection.scrollIntoView({ behavior: "smooth", block: "start" });

        const pill = pillMap.get(filter);
        if (pill) {
          pill.click();
        } else {
          const label = chip.querySelector("span")?.textContent.trim() || "দেশ";
          showToast(`${label} ডেস্টিনেশন`);
        }
      });
    });
  };

  setupTheme();
  setupMenu();
  setupSmoothAnchors();
  setupAuthButtons();
  setupCountryFilter();
  setupCards();
  setupResources();
  setupTools();
  setupFlags();
})();


