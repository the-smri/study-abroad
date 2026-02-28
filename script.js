(() => {
  const doc = document;
  const root = doc.documentElement;
  const THEME_KEY = "study-abroad-theme";
  const LANG_KEY = "study-abroad-lang";

  const setupTheme = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const initialTheme = savedTheme || "light";

    const applyTheme = (theme) => {
      const nextTheme = theme === "night" ? "night" : "light";
      root.setAttribute("data-theme", nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);

      const toggle = doc.getElementById("themeToggle");
      if (toggle) {
        const isNight = nextTheme === "night";
        toggle.setAttribute("aria-pressed", String(isNight));
        
        const isEnglish = root.getAttribute("data-lang") === "en";
        const bnLabel = isNight ? "লাইট মোড চালু করুন" : "ডার্ক মোড চালু করুন";
        const enLabel = isNight ? "Turn on Light Mode" : "Turn on Dark Mode";
        
        toggle.setAttribute("data-bn-aria-label", bnLabel);
        toggle.setAttribute("data-en-aria-label", enLabel);
        toggle.setAttribute("aria-label", isEnglish ? enLabel : bnLabel);
        
        const icon = toggle.querySelector(".theme-toggle-icon");
        if (icon) icon.textContent = isNight ? "☀️" : "🌙";
      }
    };

    applyTheme(initialTheme);

    const toggle = doc.createElement("button");
    toggle.type = "button";
    toggle.id = "themeToggle";
    toggle.className = "theme-toggle";
    toggle.innerHTML = `
      <span class="theme-toggle-dot" aria-hidden="true"></span>
      <span class="theme-toggle-icon" aria-hidden="true">🌙</span>
    `;
    doc.body.appendChild(toggle);
    applyTheme(initialTheme);

    toggle.addEventListener("click", () => {
      const current =
        root.getAttribute("data-theme") === "night" ? "night" : "light";
      applyTheme(current === "night" ? "light" : "night");
    });
  };

  const setupLanguage = () => {
    const navActions = doc.querySelector(".nav-actions");
    const savedLang = localStorage.getItem(LANG_KEY);
    const initialLang = savedLang === "en" ? "en" : "bn";

    // Function to translate all elements with data-en attributes
    const translatePage = (lang) => {
      const elementsToTranslate = doc.querySelectorAll("[data-en]");

      elementsToTranslate.forEach((el) => {
        // First-time setup: Save the original Bangla text to data-bn if not already saved
        if (!el.hasAttribute("data-bn")) {
          // Be careful not to overwrite child HTML nodes if they exist inside, so we use innerHTML
          // or just simple textContent if there are no nested elements.
          // Given the structure, some elements might have spans inside. Let's use innerHTML.
          el.setAttribute("data-bn", el.innerHTML);
        }

        if (lang === "en") {
          // Apply English translation
          el.innerHTML = el.getAttribute("data-en");
        } else {
          // Revert to Bangla translation
          el.innerHTML = el.getAttribute("data-bn");
        }
      });

      // Update placeholders for inputs
      doc
        .querySelectorAll(
          "input[data-en-placeholder], textarea[data-en-placeholder]",
        )
        .forEach((el) => {
          if (!el.hasAttribute("data-bn-placeholder")) {
            el.setAttribute(
              "data-bn-placeholder",
              el.getAttribute("placeholder") || "",
            );
          }
          if (lang === "en") {
            el.setAttribute(
              "placeholder",
              el.getAttribute("data-en-placeholder"),
            );
          } else {
            el.setAttribute(
              "placeholder",
              el.getAttribute("data-bn-placeholder"),
            );
          }
        });

      // Update aria-labels
      doc
        .querySelectorAll("[data-en-aria-label]")
        .forEach((el) => {
          if (!el.hasAttribute("data-bn-aria-label")) {
            el.setAttribute(
              "data-bn-aria-label",
              el.getAttribute("aria-label") || "",
            );
          }
          if (lang === "en") {
            el.setAttribute("aria-label", el.getAttribute("data-en-aria-label"));
          } else {
            el.setAttribute("aria-label", el.getAttribute("data-bn-aria-label"));
          }
        });
    };

    const applyLanguage = (lang, { silent = false } = {}) => {
      const nextLang = lang === "en" ? "en" : "bn";
      root.setAttribute("data-lang", nextLang);
      root.setAttribute("lang", nextLang);
      localStorage.setItem(LANG_KEY, nextLang);

      const toggle = doc.getElementById("langToggle");
      if (toggle) {
        const isEnglish = nextLang === "en";
        toggle.textContent = isEnglish ? "BN" : "EN";
        toggle.setAttribute("aria-pressed", String(isEnglish));
        toggle.setAttribute(
          "aria-label",
          isEnglish ? "বাংলা ভাষায় পরিবর্তন করুন" : "Switch to English",
        );
      }

      translatePage(nextLang);

      if (!silent) {
        showToast(
          nextLang === "en"
            ? "Language switched to English"
            : "ভাষা বাংলায় পরিবর্তন করা হয়েছে",
        );
      }
    };

    // Apply translation on initial load
    applyLanguage(initialLang, { silent: true });

    if (!navActions || doc.getElementById("langToggle")) return;

    // Create the toggle button in the navbar
    const toggle = doc.createElement("button");
    toggle.type = "button";
    toggle.id = "langToggle";
    toggle.className = "lang-toggle";
    navActions.prepend(toggle);
    applyLanguage(initialLang, { silent: true });

    // Handle toggle click
    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-lang") === "en" ? "en" : "bn";
      applyLanguage(current === "en" ? "bn" : "en", { silent: false });
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

  const setupMobileAppChrome = () => {
    const existing = doc.getElementById("mobileAppNav");
    if (existing) return;

    const isHomePage =
      /index\.html$/i.test(window.location.pathname) ||
      window.location.pathname.endsWith("/") ||
      window.location.pathname === "";
    const isResourcePage = /resources\.html$/i.test(window.location.pathname);
    const isToolsPage = /tools\.html$/i.test(window.location.pathname);
    const isProfilePage = /profile\.html$/i.test(window.location.pathname);
    const nav = doc.createElement("nav");
    nav.id = "mobileAppNav";
    nav.className = "mobile-app-nav";
    nav.setAttribute("aria-label", "মোবাইল অ্যাপ ন্যাভিগেশন");

    const items = [
      {
        id: "home",
        label: "হোম",
        href: isHomePage ? "#home" : "index.html#home",
      },
      {
        id: "countries",
        label: "দেশ",
        href: isHomePage ? "#countries" : "index.html#countries",
      },
      {
        id: "tools",
        label: "টুলস",
        href: isToolsPage ? "#tools" : "tools.html#tools",
      },
      {
        id: "resources",
        label: "রিসোর্স",
        href: isResourcePage ? "#resources" : "resources.html#resources",
      },
      {
        id: "profile",
        label: "প্রোফাইল",
        href: isProfilePage ? "#home" : "profile.html",
      },
    ];

    const iconSvg = (name) => {
      if (name === "home")
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.8v-5.6H9.8V21H5a1 1 0 0 1-1-1z"/></svg>`;
      if (name === "countries")
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.6 2.3 4.1 5.6 4.1 9S14.6 18.7 12 21m0-18C9.4 5.3 7.9 8.6 7.9 12s1.5 6.7 4.1 9M4 12h16"/></svg>`;
      if (name === "tools")
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.4 6.2 3.4 3.4-8.8 8.8H5.6v-3.4zM13 7.6 16.4 4a2.4 2.4 0 0 1 3.4 3.4L16.4 11"/></svg>`;
      if (name === "resources")
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h10a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V6a2 2 0 0 1 2-2Zm0 0v12"/></svg>`;
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm-7 8.4a7 7 0 0 1 14 0"/></svg>`;
    };

    nav.innerHTML = `
      <div class="mobile-tabs">
        ${items
          .map(
            (item) => `
          <a class="mobile-tab" data-mobile-tab="${item.id}" href="${item.href}">
            <span class="mobile-icon">${iconSvg(item.id)}</span>
            <span class="mobile-label">${item.label}</span>
          </a>`,
          )
          .join("")}
      </div>
    `;

    doc.body.appendChild(nav);

    nav.querySelectorAll(".mobile-tab").forEach((tab) => {
      tab.addEventListener("click", (event) => {
        const href = tab.getAttribute("href") || "";
        if (href === "#") {
          event.preventDefault();
          showToast("প্রোফাইল ফিচার শিগগিরই আসছে");
          return;
        }
        nav
          .querySelectorAll(".mobile-tab")
          .forEach((el) => el.classList.remove("active"));
        tab.classList.add("active");
      });
    });

    const activeId = isProfilePage
      ? "profile"
      : isToolsPage
        ? "tools"
      : isResourcePage
        ? "resources"
        : isHomePage
          ? "home"
          : "countries";
    const activeTab = nav.querySelector(`[data-mobile-tab="${activeId}"]`);
    activeTab?.classList.add("active");
  };

  const setupGlobalSearch = () => {
    const navActions = doc.querySelector(".nav-actions");
    if (!navActions || doc.getElementById("globalSearchBtn")) return;

    const searchBtn = doc.createElement("button");
    searchBtn.type = "button";
    searchBtn.id = "globalSearchBtn";
    searchBtn.className = "btn outline search-trigger";
    searchBtn.setAttribute("aria-label", "সার্চ");
    searchBtn.setAttribute("data-en-aria-label", "Search");
    searchBtn.innerHTML = `
      <span class="search-trigger-orb" aria-hidden="true">
        <svg class="search-icon-svg" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="16.2" y1="16.2" x2="21" y2="21"></line>
        </svg>
      </span>
      <span class="search-trigger-text" data-en="Search">সার্চ করুন</span>
    `;
    navActions.prepend(searchBtn);

    const searchModal = doc.createElement("div");
    searchModal.className = "search-modal";
    searchModal.hidden = true;
    searchModal.innerHTML = `
      <div class="search-modal-card" role="dialog" aria-modal="true" aria-labelledby="searchModalTitle">
        <div class="search-head">
          <h5 id="searchModalTitle" data-en="Website Search">ওয়েবসাইট সার্চ</h5>
          <button type="button" class="search-close" aria-label="বন্ধ করুন" data-en-aria-label="Close">×</button>
        </div>
        <div class="search-body">
          <input id="globalSearchInput" type="search" placeholder="যেমন: ফ্রান্স, স্কলারশিপ, ভিসা, IELTS" data-en-placeholder="e.g. France, Scholarship, Visa, IELTS" autocomplete="off" />
          <div id="globalSearchMeta" class="search-meta" data-en="Enter keywords.">কোনো কীওয়ার্ড লিখুন।</div>
          <div id="globalSearchResults" class="search-results"></div>
        </div>
      </div>
    `;
    doc.body.appendChild(searchModal);

    const input = searchModal.querySelector("#globalSearchInput");
    const resultsEl = searchModal.querySelector("#globalSearchResults");
    const metaEl = searchModal.querySelector("#globalSearchMeta");
    const closeBtn = searchModal.querySelector(".search-close");
    const scrollTargets = new Map();

    const pageIndex = [
      {
        url: "index.html",
        title: "হোম",
        keywords: "বিদেশে পড়তে চাই ডেস্টিনেশন স্কলারশিপ রিসোর্স টুলস",
      },
      {
        url: "usa.html",
        title: "যুক্তরাষ্ট্র",
        keywords: "USA আমেরিকা ভিসা টিউশন OPT",
      },
      { url: "canada.html", title: "কানাডা", keywords: "Canada SDS PGWP PR" },
      {
        url: "uk.html",
        title: "যুক্তরাজ্য",
        keywords: "UK Graduate route মাস্টার্স",
      },
      {
        url: "australia.html",
        title: "অস্ট্রেলিয়া",
        keywords: "Australia subclass post study work",
      },
      {
        url: "germany.html",
        title: "জার্মানি",
        keywords: "Germany block account tuition",
      },
      {
        url: "france.html",
        title: "ফ্রান্স",
        keywords: "France Campus France APS",
      },
      { url: "italy.html", title: "ইতালি", keywords: "Italy ISEE scholarship" },
      {
        url: "sweden.html",
        title: "সুইডেন",
        keywords: "Sweden innovation scholarship",
      },
      {
        url: "denmark.html",
        title: "ডেনমার্ক",
        keywords: "Denmark green tech study",
      },
      {
        url: "china.html",
        title: "চীন",
        keywords: "China CSC scholarship Mandarin",
      },
      {
        url: "japan.html",
        title: "জাপান",
        keywords: "Japan MEXT visa language",
      },
      {
        url: "south-korea.html",
        title: "দক্ষিণ কোরিয়া",
        keywords: "Korea GKS visa scholarship",
      },
      {
        url: "india.html",
        title: "ভারত",
        keywords: "India study destination tuition",
      },
    ];

    const sectionIndex = [];
    doc
      .querySelectorAll("main h1, main h2, main h3, main h4, main p, main li")
      .forEach((node, idx) => {
        const text = (node.textContent || "").trim();
        if (!text || text.length < 6) return;
        const key = `local-${idx}`;
        scrollTargets.set(key, node);
        sectionIndex.push({
          id: key,
          type: "section",
          title: text.slice(0, 70),
          text,
          url: "#",
        });
      });

    const dataset = [
      ...pageIndex.map((p) => ({
        type: "page",
        title: p.title,
        text: `${p.title} ${p.keywords}`,
        url: p.url,
      })),
      ...sectionIndex,
    ];

    const normalize = (value) =>
      value.toLowerCase().replace(/\s+/g, " ").trim();

    const closeSearch = () => {
      searchModal.hidden = true;
    };

    const openSearch = () => {
      searchModal.hidden = false;
      window.setTimeout(() => input?.focus(), 10);
    };

    const renderResults = (query) => {
      const needle = normalize(query);
      if (!needle) {
        metaEl.textContent = "কোনো কীওয়ার্ড লিখুন।";
        resultsEl.innerHTML = "";
        return;
      }

      const ranked = dataset
        .map((item) => {
          const hay = normalize(item.text);
          const title = normalize(item.title);
          let score = 0;
          if (title.startsWith(needle)) score += 30;
          if (title.includes(needle)) score += 16;
          if (hay.includes(needle)) score += 10;
          needle.split(" ").forEach((token) => {
            if (token && hay.includes(token)) score += 2;
          });
          return { ...item, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      metaEl.textContent = ranked.length
        ? `${ranked.length}টি ফলাফল পাওয়া গেছে`
        : "কোনো ফলাফল পাওয়া যায়নি";

      resultsEl.innerHTML = ranked
        .map((item) => {
          const tag = item.type === "page" ? "পেজ" : "সেকশন";
          return `
            <button type="button" class="search-result-item" data-search-type="${item.type}" data-search-id="${item.id || ""}" data-search-url="${item.url}">
              <span class="search-result-title">${item.title}</span>
              <span class="search-result-tag">${tag}</span>
            </button>
          `;
        })
        .join("");
    };

    searchBtn.addEventListener("click", openSearch);
    closeBtn?.addEventListener("click", closeSearch);

    searchModal.addEventListener("click", (event) => {
      if (event.target === searchModal) closeSearch();
    });

    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !searchModal.hidden) closeSearch();
    });

    input?.addEventListener("input", () => renderResults(input.value));

    resultsEl?.addEventListener("click", (event) => {
      const button = event.target.closest(".search-result-item");
      if (!button) return;

      const type = button.getAttribute("data-search-type");
      const url = button.getAttribute("data-search-url") || "";
      const id = button.getAttribute("data-search-id") || "";
      closeSearch();

      if (type === "section" && id) {
        const target = scrollTargets.get(id);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (url && url !== "#") {
        window.location.href = url;
      }
    });
  };

  const setupMenu = () => {
    const menuBtn = doc.getElementById("menuToggle");
    const menu = doc.getElementById("menu");
    if (!menuBtn || !menu) return;
    const navActions = doc.querySelector(".nav-actions");

    // Put auth links inside hamburger menu for small screens.
    if (navActions && !menu.querySelector(".menu-auth-item")) {
      const authLinks = Array.from(navActions.querySelectorAll("a.btn")).filter(
        (link) => !link.classList.contains("search-trigger"),
      );

      authLinks.forEach((link) => {
        const item = doc.createElement("li");
        item.className = "menu-auth-item";
        const cloned = link.cloneNode(true);
        cloned.classList.add("menu-auth-link");
        item.appendChild(cloned);
        menu.appendChild(item);
      });
    }

    menuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.classList.toggle("open");
    });

    menu.querySelectorAll("a").forEach((link) => {
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
        const href = link.getAttribute("href") || "";
        if (href && href !== "#") return;

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

    const pills = Array.from(
      countriesSection.querySelectorAll(".pill-row .pill"),
    );
    const cards = Array.from(
      countriesSection.querySelectorAll(".cards-grid > .country-card"),
    );
    const moreBtn = countriesSection.querySelector("#countriesMoreBtn");
    if (!pills.length || !cards.length) return;

    let activeFilter = "";
    let isExpanded = false;
    const isMobileView = () => window.matchMedia("(max-width: 860px)").matches;
    const getMaxVisible = () => (isMobileView() ? 4 : 5);
    const isGermanyCard = (card) =>
      (card.getAttribute("data-url") || "").toLowerCase() === "germany.html";
    const allPill = pills.find(
      (pill) => (pill.getAttribute("data-filter") || "") === "all",
    );

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
        const filterMatch = !activeFilter || activeFilter === country;
        if (!filterMatch) return false;
        if (isMobileView() && isGermanyCard(card)) return false;
        return true;
      });

      const maxVisible = getMaxVisible();

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
        const next = value === "all" ? "" : activeFilter === value ? "" : value;
        activeFilter = next;
        isExpanded = false;

        setActivePill(next);
        applyFilter();
        showToast(
          next
            ? `${pill.textContent.trim()} ডেস্টিনেশন দেখানো হচ্ছে`
            : "সব ডেস্টিনেশন দেখানো হচ্ছে",
        );
      });
    });

    moreBtn?.addEventListener("click", () => {
      isExpanded = !isExpanded;
      applyFilter();
      showToast(
        isExpanded
          ? "আরও ডেস্টিনেশন দেখানো হচ্ছে"
          : "সংক্ষিপ্ত তালিকা দেখানো হচ্ছে",
      );
    });

    // Initial state: show all cards under "সব দেশ".
    if (allPill) {
      setActivePill("");
    }
    applyFilter();

    window.addEventListener("resize", () => {
      isExpanded = false;
      applyFilter();
    });
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
        const tag =
          card.querySelector(".tag")?.textContent.trim() || "বিস্তারিত";
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
        
        // BDT Conversion (Approx rates)
        const rates = { USD: 120, CAD: 88, GBP: 152, AUD: 80, EUR: 130, CNY: 16 };
        const rate = rates[currency] || 1;
        const netBDT = net * rate;

        result.innerHTML = `
          <div class="calculator-results">
            <p>মোট টিউশন: <b>${formatMoney(tuitionTotal, currency)}</b></p>
            <p>মোট জীবনযাত্রা খরচ: <b>${formatMoney(livingTotal, currency)}</b></p>
            <p>মোট আনুমানিক খরচ: <b>${formatMoney(gross, currency)}</b></p>
            <hr>
            <p>স্কলারশিপ বাদে নেট খরচ: <b>${formatMoney(net, currency)}</b></p>
            <p>মাসিক গড় বাজেট: <b>${formatMoney(monthlyNeed, currency)}</b></p>
            <div class="bdt-highlight" style="background: var(--soft); padding: 10px; border-radius: 8px; margin-top: 10px; border-left: 4px solid var(--green);">
              <p style="margin:0; font-size: 14px;">অনুমানিত মোট খরচ (BDT):</p>
              <h4 style="margin:5px 0 0; color: var(--green);">৳ ${Math.round(netBDT).toLocaleString("en-IN")}</h4>
            </div>
            <p style="font-size: 11px; color: var(--muted); margin-top: 10px;">* ১ ${currency} = ${rate} BDT (Approx)</p>
          </div>
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
        const overall = Number(
          bodyEl.querySelector("#ieltsOverall")?.value || 0,
        );
        const band = Number(bodyEl.querySelector("#ieltsBand")?.value || 0);
        const result = bodyEl.querySelector("#ieltsResult");
        let tips = [];

        if (overall >= 7 && band >= 6.5) {
          tips = [
            "যুক্তরাষ্ট্র (Top বিশ্ববিদ্যালয়)",
            "যুক্তরাজ্য (Russell Group)",
            "কানাডা (Masters/Research)",
            "অস্ট্রেলিয়া (Skilled programs)",
          ];
        } else if (overall >= 6.5 && band >= 6) {
          tips = [
            "কানাডা (College/University)",
            "যুক্তরাজ্য (অনেক Masters প্রোগ্রাম)",
            "অস্ট্রেলিয়া (বেশিরভাগ UG/PG)",
            "জার্মানি (English-taught programs)",
          ];
        } else if (overall >= 6 && band >= 5.5) {
          tips = [
            "কানাডা/UK এর pathway বা college route",
            "অস্ট্রেলিয়ার কিছু প্রোগ্রাম",
            "চীনের English medium programs",
          ];
        } else {
          tips = [
            "প্রথমে IELTS স্কোর উন্নত করুন",
            "প্রস্তুতি নিন: Writing + Speaking",
            "প্রি-মাস্টার্স/পাথওয়ে প্রোগ্রাম বিবেচনা করুন",
          ];
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

      bodyEl
        .querySelector("#guideDownloadBtn")
        ?.addEventListener("click", () => {
          const country = bodyEl.querySelector("#guideCountry")?.value || "দেশ";
          const type = bodyEl.querySelector("#guideType")?.value || "গাইড";
          const result = bodyEl.querySelector("#guideResult");
          const content = `বিদেশে পড়তে চাই\nদেশ: ${country}\nগাইড: ${type}\n\nচেকলিস্ট:\n1) পাসপোর্ট\n2) Academic documents\n3) ভাষা পরীক্ষার স্কোর\n4) SOP/LOR\n5) ফাইন্যান্স প্রুফ\n`;
          const blob = new Blob([content], {
            type: "text/plain;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const link = doc.createElement("a");
          link.href = url;
          link.download = `${country}-${type}.txt`;
          link.click();
          URL.revokeObjectURL(url);
          result.textContent = `${country} - ${type} গাইড ডাউনলোড হয়েছে।`;
        });
    };

    const openComparisonTool = () => {
      const section = doc.getElementById("comparison");
      if (section) {
        section.style.display = "block";
        section.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof window.renderComparison === "function") {
          window.renderComparison();
        } else {
          const fallback =
            doc.getElementById("comparisonDashboard") ||
            doc.getElementById("comparisonTable");
          if (fallback && !fallback.innerHTML.trim()) {
            fallback.innerHTML =
              '<div class="euro-empty-state">Dashboard is loading. Please try again.</div>';
          }
        }
      }
    };

    const openTool = (key) => {
      modal.hidden = false;
      if (key === "cost-calculator") openCostCalculator();
      else if (key === "ielts-checker") openIeltsChecker();
      else if (key === "visa-timeline") openVisaTimeline();
      else if (key === "pdf-guide") openPdfGuide();
      else if (key === "comparison-tool") {
        modal.hidden = true; // Use separate section for comparison
        openComparisonTool();
      }
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
    const cards = Array.from(
      section.querySelectorAll(".resources-grid .resource-card"),
    );
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
          value === "" ? pillValue === "all" : pillValue === value;
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
        const title =
          card?.querySelector("h4")?.textContent.trim() || "রিসোর্স";
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
      ]),
    );

    doc.querySelectorAll(".flag-chip").forEach((chip) => {
      chip.style.cursor = "pointer";
      chip.addEventListener("click", () => {
        const directHref = chip.getAttribute("href") || "";
        if (directHref && directHref !== "#") {
          return; // let the native navigation occur
        }

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

  const setupLogin = () => {
    const loginBtn = doc.getElementById("loginBtn");
    const loginModal = doc.getElementById("loginModal");
    const closeLoginModal = doc.getElementById("closeLoginModal");
    const loginForm = doc.getElementById("loginForm");
    const createAccountBtn = doc.getElementById("createAccountBtn");
    const modalTitle = doc.getElementById("modalTitle");
    const sampleHint = doc.getElementById("sampleHint");
    const createAccountPrompt = doc.getElementById("createAccountPrompt");

    // Sample credentials
    const SAMPLE_EMAIL = "demo@example.com";
    const SAMPLE_PASSWORD = "12345678";
    const LOGIN_KEY = "user_logged_in";
    const REGISTERED_ACCOUNTS_KEY = "registered_accounts";

    if (loginBtn) {
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Reset to login form view
        loginForm.style.display = "block";
        createAccountPrompt.style.display = "block";
        modalTitle.textContent = "লগইন";
        sampleHint.style.display = "block";
        loginModal.style.display = "block";
      });
    }

    if (closeLoginModal) {
      closeLoginModal.addEventListener("click", () => {
        loginModal.style.display = "none";
      });
    }

    // Close modal when clicking outside of it
    window.addEventListener("click", (e) => {
      if (e.target === loginModal) {
        loginModal.style.display = "none";
      }
    });

    // Handle create account button
    if (createAccountBtn) {
      createAccountBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showCreateAccountForm();
      });
    }

    function showCreateAccountForm() {
      loginForm.style.display = "none";
      createAccountPrompt.style.display = "none";
      sampleHint.style.display = "none";
      modalTitle.textContent = "অ্যাকাউন্ট তৈরি করুন";

      // Create account form HTML
      const createFormHTML = `
        <form id="createAccountForm">
          <div class="form-group">
            <label for="createEmail">ইমেইল:</label>
            <input type="email" id="createEmail" name="email" required placeholder="name@email.com">
          </div>
          <div class="form-group">
            <label for="createPassword">পাসওয়ার্ড:</label>
            <input type="password" id="createPassword" name="password" required placeholder="কমপক্ষে ৮ অক্ষর">
          </div>
          <div class="form-group">
            <label for="createName">নাম:</label>
            <input type="text" id="createName" name="name" required placeholder="আপনার নাম">
          </div>
          <button type="submit" class="btn primary" style="width: 100%; margin-bottom: 10px;">অ্যাকাউন্ট তৈরি করুন</button>
          <button type="button" id="backToLoginBtn" class="btn outline" style="width: 100%; background: none; border: 1px solid #ccc; cursor: pointer;">লগইনে ফিরে যান</button>
        </form>
      `;

      // Remove existing create form if any
      const existingForm = doc.getElementById("createAccountForm");
      if (existingForm) {
        existingForm.remove();
      }

      // Insert new form after close button
      const closeBtn = loginForm.parentElement.querySelector(".close-btn");
      const newForm = doc.createElement("div");
      newForm.innerHTML = createFormHTML;
      loginForm.parentElement.insertBefore(
        newForm.firstElementChild,
        createAccountPrompt,
      );

      // Handle back to login button
      const backToLoginBtn = doc.getElementById("backToLoginBtn");
      if (backToLoginBtn) {
        backToLoginBtn.addEventListener("click", (e) => {
          e.preventDefault();
          // Remove create form
          const createForm = doc.getElementById("createAccountForm");
          if (createForm) {
            createForm.remove();
          }
          // Show login form
          loginForm.style.display = "block";
          createAccountPrompt.style.display = "block";
          sampleHint.style.display = "block";
          modalTitle.textContent = "লগইন";
        });
      }

      // Handle create account form submission
      const createForm = doc.getElementById("createAccountForm");
      if (createForm) {
        createForm.addEventListener("submit", (e) => {
          e.preventDefault();

          const email = doc.getElementById("createEmail").value.trim();
          const password = doc.getElementById("createPassword").value.trim();
          const name = doc.getElementById("createName").value.trim();

          if (password.length < 8) {
            alert("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে।");
            return;
          }

          // Get or create registered accounts list
          let accounts = JSON.parse(
            localStorage.getItem(REGISTERED_ACCOUNTS_KEY) || "[]",
          );

          // Check if email already exists
          if (accounts.some((acc) => acc.email === email)) {
            alert("এই ইমেইল ইতিমধ্যে নিবন্ধিত। অন্য ইমেইল ব্যবহার করুন।");
            return;
          }

          // Add new account
          accounts.push({
            email: email,
            password: password,
            name: name,
            createdAt: new Date().toISOString(),
          });

          localStorage.setItem(
            REGISTERED_ACCOUNTS_KEY,
            JSON.stringify(accounts),
          );

          alert("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! এখন লগইন করুন।");

          // Clear form and go back to login
          createForm.remove();
          loginForm.style.display = "block";
          createAccountPrompt.style.display = "block";
          sampleHint.style.display = "block";
          modalTitle.textContent = "লগইন";
          doc.getElementById("email").value = "";
          doc.getElementById("password").value = "";
        });
      }
    }

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = doc.getElementById("email").value.trim();
        const password = doc.getElementById("password").value.trim();

        // Check registered accounts
        let accounts = JSON.parse(
          localStorage.getItem(REGISTERED_ACCOUNTS_KEY) || "[]",
        );
        const user = accounts.find(
          (acc) => acc.email === email && acc.password === password,
        );

        if (email === SAMPLE_EMAIL && password === SAMPLE_PASSWORD) {
          // Sample credentials
          localStorage.setItem(
            LOGIN_KEY,
            JSON.stringify({
              email: email,
              loginTime: new Date().toISOString(),
              name: "ডেমো ইউজার",
            }),
          );
          window.location.href = "profile.html";
        } else if (user) {
          // Registered user
          localStorage.setItem(
            LOGIN_KEY,
            JSON.stringify({
              email: email,
              loginTime: new Date().toISOString(),
              name: user.name,
            }),
          );
          window.location.href = "profile.html";
        } else {
          alert(
            "ইমেইল বা পাসওয়ার্ড সঠিক নয়। নমুনা: demo@example.com / 12345678",
          );
          doc.getElementById("email").value = "";
          doc.getElementById("password").value = "";
        }
      });
    }
  };

  const setupComparisonTool = () => {
    const europeCountries = [
      { country: "Germany", englishUsage: "High (Univ)", mastersScholarship: "Very High", tuition: "0 - 3,000", living: "900 - 1,100", visaSuccess: "92%", pswVisa: "18 Mo", prTime: "2-5", localLangNeeded: "High (Job)", salary: "3,500 - 4,500", taxLevel: "High", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 92, rank: 1 },
      { country: "Netherlands", englishUsage: "Very High", mastersScholarship: "Medium", tuition: "8,000 - 15,000", living: "1,100 - 1,500", visaSuccess: "95%", pswVisa: "12 Mo", prTime: "5", localLangNeeded: "Moderate", salary: "3,200 - 4,200", taxLevel: "High", spouseWork: "Yes", partTimeHours: "16 hrs/wk", totalScore: 88, rank: 2 },
      { country: "Finland", englishUsage: "High", mastersScholarship: "High", tuition: "6,000 - 12,000", living: "800 - 1,000", visaSuccess: "94%", pswVisa: "24 Mo", prTime: "4", localLangNeeded: "Moderate", salary: "3,000 - 4,000", taxLevel: "High", spouseWork: "Yes", partTimeHours: "30 hrs/wk", totalScore: 87, rank: 3 },
      { country: "Ireland", englishUsage: "Native", mastersScholarship: "Medium", tuition: "10,000 - 20,000", living: "1,200 - 1,600", visaSuccess: "90%", pswVisa: "24 Mo", prTime: "5", localLangNeeded: "No", salary: "3,000 - 4,000", taxLevel: "Med", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 85, rank: 4 },
      { country: "Sweden", englishUsage: "Very High", mastersScholarship: "High", tuition: "8,000 - 14,000", living: "900 - 1,200", visaSuccess: "88%", pswVisa: "12 Mo", prTime: "4-5", localLangNeeded: "Moderate", salary: "3,300 - 4,300", taxLevel: "High", spouseWork: "Yes", partTimeHours: "No Limit", totalScore: 84, rank: 5 },
      { country: "France", englishUsage: "Moderate", mastersScholarship: "High", tuition: "3,000 - 10,000", living: "900 - 1,300", visaSuccess: "85%", pswVisa: "12-24 Mo", prTime: "5", localLangNeeded: "Very High", salary: "2,800 - 3,800", taxLevel: "High", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 82, rank: 6 },
      { country: "Belgium", englishUsage: "High", mastersScholarship: "Medium", tuition: "1,000 - 4,000", living: "850 - 1,100", visaSuccess: "85%", pswVisa: "12 Mo", prTime: "5", localLangNeeded: "High", salary: "2,800 - 3,500", taxLevel: "Very High", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 80, rank: 7 },
      { country: "Austria", englishUsage: "High", mastersScholarship: "Medium", tuition: "1,500 - 3,000", living: "950 - 1,200", visaSuccess: "82%", pswVisa: "12 Mo", prTime: "5", localLangNeeded: "High", salary: "2,700 - 3,500", taxLevel: "High", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 78, rank: 8 },
      { country: "Spain", englishUsage: "Low-Med", mastersScholarship: "Medium", tuition: "2,000 - 5,000", living: "700 - 1,000", visaSuccess: "80%", pswVisa: "12 Mo", prTime: "5", localLangNeeded: "Very High", salary: "2,000 - 2,800", taxLevel: "Med", spouseWork: "Yes", partTimeHours: "30 hrs/wk", totalScore: 75, rank: 9 },
      { country: "Poland", englishUsage: "Moderate", mastersScholarship: "High", tuition: "2,000 - 4,000", living: "500 - 700", visaSuccess: "85%", pswVisa: "9 Mo", prTime: "5", localLangNeeded: "High", salary: "1,500 - 2,200", taxLevel: "Low", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 74, rank: 10 },
      { country: "Italy", englishUsage: "Low-Med", mastersScholarship: "Very High", tuition: "1,000 - 4,000", living: "700 - 1,000", visaSuccess: "75%", pswVisa: "12 Mo", prTime: "5", localLangNeeded: "Very High", salary: "1,800 - 2,500", taxLevel: "Med", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 73, rank: 11 },
      { country: "Denmark", englishUsage: "Very High", mastersScholarship: "Low", tuition: "10,000 - 16,000", living: "1,100 - 1,400", visaSuccess: "90%", pswVisa: "6 Mo", prTime: "5-8", localLangNeeded: "Moderate", salary: "3,800 - 4,800", taxLevel: "Very High", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 72, rank: 12 },
      { country: "Portugal", englishUsage: "Moderate", mastersScholarship: "Low", tuition: "3,000 - 7,000", living: "600 - 900", visaSuccess: "78%", pswVisa: "12 Mo", prTime: "5", localLangNeeded: "High", salary: "1,200 - 1,800", taxLevel: "Med", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 70, rank: 13 },
      { country: "Czech Rep", englishUsage: "Moderate", mastersScholarship: "Medium", tuition: "0 - 5,000", living: "600 - 850", visaSuccess: "80%", pswVisa: "9 Mo", prTime: "5", localLangNeeded: "High", salary: "1,600 - 2,300", taxLevel: "Low", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 69, rank: 14 },
      { country: "Hungary", englishUsage: "Low-Med", mastersScholarship: "Very High", tuition: "2,500 - 6,000", living: "500 - 750", visaSuccess: "85%", pswVisa: "9 Mo", prTime: "5", localLangNeeded: "Very High", salary: "1,100 - 1,600", taxLevel: "Low", spouseWork: "Yes", partTimeHours: "24 hrs/wk", totalScore: 68, rank: 15 },
      { country: "Estonia", englishUsage: "High", mastersScholarship: "High", tuition: "3,000 - 6,000", living: "600 - 800", visaSuccess: "88%", pswVisa: "9 Mo", prTime: "5", localLangNeeded: "Moderate", salary: "1,800 - 2,500", taxLevel: "Low", spouseWork: "Yes", partTimeHours: "No Limit", totalScore: 67, rank: 16 },
      { country: "Luxembourg", englishUsage: "High", mastersScholarship: "Low", tuition: "400 - 1,000", living: "1,200 - 1,700", visaSuccess: "85%", pswVisa: "9 Mo", prTime: "5", localLangNeeded: "High", salary: "4,000 - 5,500", taxLevel: "High", spouseWork: "Yes", partTimeHours: "15 hrs/wk", totalScore: 66, rank: 17 },
      { country: "Lithuania", englishUsage: "Moderate", mastersScholarship: "Medium", tuition: "2,000 - 5,000", living: "550 - 750", visaSuccess: "82%", pswVisa: "12 Mo", prTime: "5", localLangNeeded: "High", salary: "1,300 - 1,900", taxLevel: "Low", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 64, rank: 18 },
      { country: "Latvia", englishUsage: "Moderate", mastersScholarship: "Medium", tuition: "2,000 - 5,000", living: "550 - 750", visaSuccess: "80%", pswVisa: "6 Mo", prTime: "5", localLangNeeded: "High", salary: "1,200 - 1,700", taxLevel: "Low", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 62, rank: 19 },
      { country: "Slovenia", englishUsage: "Moderate", mastersScholarship: "Low", tuition: "2,000 - 4,000", living: "600 - 850", visaSuccess: "85%", pswVisa: "6 Mo", prTime: "5", localLangNeeded: "High", salary: "1,600 - 2,200", taxLevel: "Med", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 60, rank: 20 },
      { country: "Slovakia", englishUsage: "Low-Med", mastersScholarship: "Low", tuition: "2,000 - 5,000", living: "600 - 800", visaSuccess: "82%", pswVisa: "9 Mo", prTime: "5", localLangNeeded: "High", salary: "1,200 - 1,700", taxLevel: "Low", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 58, rank: 21 },
      { country: "Greece", englishUsage: "Low-Med", mastersScholarship: "Low", tuition: "1,500 - 4,000", living: "700 - 950", visaSuccess: "75%", pswVisa: "12 Mo", prTime: "5", localLangNeeded: "Very High", salary: "1,100 - 1,600", taxLevel: "Med", spouseWork: "No", partTimeHours: "20 hrs/wk", totalScore: 55, rank: 22 },
      { country: "Croatia", englishUsage: "Low-Med", mastersScholarship: "Low", tuition: "2,000 - 5,000", living: "600 - 850", visaSuccess: "80%", pswVisa: "12 Mo", prTime: "5", localLangNeeded: "High", salary: "1,200 - 1,600", taxLevel: "Med", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 54, rank: 23 },
      { country: "Romania", englishUsage: "Low-Med", mastersScholarship: "Medium", tuition: "2,000 - 5,000", living: "500 - 700", visaSuccess: "85%", pswVisa: "6 Mo", prTime: "5", localLangNeeded: "High", salary: "1,000 - 1,500", taxLevel: "Low", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 53, rank: 24 },
      { country: "Bulgaria", englishUsage: "Low-Med", mastersScholarship: "Low", tuition: "2,500 - 5,000", living: "450 - 650", visaSuccess: "80%", pswVisa: "9 Mo", prTime: "5", localLangNeeded: "High", salary: "900 - 1,400", taxLevel: "Low", spouseWork: "Yes", partTimeHours: "20 hrs/wk", totalScore: 51, rank: 25 },
      { country: "Cyprus", englishUsage: "High", mastersScholarship: "Low", tuition: "4,000 - 8,000", living: "700 - 900", visaSuccess: "78%", pswVisa: "6 Mo", prTime: "5", localLangNeeded: "Moderate", salary: "1,200 - 1,800", taxLevel: "Low", spouseWork: "No", partTimeHours: "20 hrs/wk", totalScore: 50, rank: 26 },
      { country: "Malta", englishUsage: "Native", mastersScholarship: "Low", tuition: "6,000 - 12,000", living: "800 - 1,100", visaSuccess: "75%", pswVisa: "6 Mo", prTime: "5", localLangNeeded: "No", salary: "1,500 - 2,200", taxLevel: "Med", spouseWork: "No", partTimeHours: "20 hrs/wk", totalScore: 48, rank: 27 },
    ];

    const dashboardEl =
      doc.getElementById("comparisonDashboard") ||
      doc.getElementById("comparisonTable");
    const previewEl = doc.getElementById("comparisonPreview");
    const section = doc.getElementById("comparison");
    const closeBtn = doc.getElementById("closeComparison");
    const openBtn = doc.getElementById("openDashboardBtn");
    if (!dashboardEl || !section) return;

    const parseRangeAverage = (value) => {
      const numbers = (value.match(/\d[\d,]*/g) || []).map((part) =>
        Number(part.replace(/,/g, "")),
      );
      if (!numbers.length) return 0;
      if (numbers.length === 1) return numbers[0];
      return (numbers[0] + numbers[numbers.length - 1]) / 2;
    };

    const scoreClass = (score) => {
      if (score >= 85) return "score-elite";
      if (score >= 75) return "score-strong";
      if (score >= 65) return "score-mid";
      return "score-base";
    };

    const visaClass = (visaRate) => {
      if (visaRate >= 90) return "visa-elite";
      if (visaRate >= 85) return "visa-strong";
      if (visaRate >= 80) return "visa-mid";
      return "visa-base";
    };

    const normalized = europeCountries.map((item) => ({
      ...item,
      visaRate: Number.parseInt(item.visaSuccess, 10) || 0,
      tuitionMid: parseRangeAverage(item.tuition),
      livingMid: parseRangeAverage(item.living),
      salaryMid: parseRangeAverage(item.salary),
    }));

    const sorters = {
      "score-desc": (a, b) => b.totalScore - a.totalScore || a.rank - b.rank,
      "rank-asc": (a, b) => a.rank - b.rank,
      "visa-desc": (a, b) => b.visaRate - a.visaRate || b.totalScore - a.totalScore,
      "tuition-asc": (a, b) => a.tuitionMid - b.tuitionMid || b.totalScore - a.totalScore,
      "living-asc": (a, b) => a.livingMid - b.livingMid || b.totalScore - a.totalScore,
      "salary-desc": (a, b) => b.salaryMid - a.salaryMid || b.totalScore - a.totalScore,
    };

    const state = {
      search: "",
      sort: "score-desc",
      scholarship: "all",
      spouse: "all",
    };

    const topByScore = [...normalized].sort(sorters["score-desc"])[0];
    const topByVisa = [...normalized].sort(sorters["visa-desc"])[0];
    const lowestTuition = [...normalized].sort(sorters["tuition-asc"])[0];
    const highestSalary = [...normalized].sort(sorters["salary-desc"])[0];

    const renderPreview = () => {
      if (!previewEl) return;
      const topCountries = [...normalized].sort(sorters["score-desc"]).slice(0, 6);
      previewEl.innerHTML = topCountries
        .map(
          (country) => `
          <article class="preview-country-card ${scoreClass(country.totalScore)}">
            <div class="preview-country-top">
              <span class="preview-rank">#${country.rank}</span>
              <strong>${country.country}</strong>
            </div>
            <div class="preview-track"><span style="width: ${country.totalScore}%;"></span></div>
            <div class="preview-country-meta">
              <small>Score ${country.totalScore}</small>
              <small>Visa ${country.visaSuccess}</small>
            </div>
          </article>
        `,
        )
        .join("");
    };

    const getFilteredRows = () =>
      normalized
        .filter((country) => {
          const matchesSearch =
            !state.search ||
            country.country.toLowerCase().includes(state.search) ||
            country.englishUsage.toLowerCase().includes(state.search);
          const matchesScholarship =
            state.scholarship === "all" ||
            country.mastersScholarship === state.scholarship;
          const matchesSpouse =
            state.spouse === "all" || country.spouseWork === state.spouse;
          return matchesSearch && matchesScholarship && matchesSpouse;
        })
        .sort(sorters[state.sort] || sorters["score-desc"]);

    const bindDashboardEvents = () => {
      const searchInput = dashboardEl.querySelector("#euroSearch");
      const sortSelect = dashboardEl.querySelector("#euroSort");
      const scholarshipSelect = dashboardEl.querySelector("#euroScholarship");
      const spouseSelect = dashboardEl.querySelector("#euroSpouse");

      if (searchInput) {
        searchInput.value = state.search;
        searchInput.addEventListener("input", () => {
          state.search = searchInput.value.trim().toLowerCase();
          renderDashboard();
        });
      }

      if (sortSelect) {
        sortSelect.value = state.sort;
        sortSelect.addEventListener("change", () => {
          state.sort = sortSelect.value;
          renderDashboard();
        });
      }

      if (scholarshipSelect) {
        scholarshipSelect.value = state.scholarship;
        scholarshipSelect.addEventListener("change", () => {
          state.scholarship = scholarshipSelect.value;
          renderDashboard();
        });
      }

      if (spouseSelect) {
        spouseSelect.value = state.spouse;
        spouseSelect.addEventListener("change", () => {
          state.spouse = spouseSelect.value;
          renderDashboard();
        });
      }
    };

    const renderDashboard = () => {
      const rows = getFilteredRows();
      const listMarkup = rows.length
        ? rows
            .map(
              (country) => `
              <article class="euro-row ${scoreClass(country.totalScore)}">
                <div class="euro-row-head">
                  <div class="euro-country-head">
                    <span class="euro-rank">#${country.rank}</span>
                    <h5>${country.country}</h5>
                  </div>
                  <span class="euro-score-chip">${country.totalScore}</span>
                </div>
                <div class="euro-score-track"><span style="width: ${Math.max(country.totalScore, 8)}%;"></span></div>
                <div class="euro-row-meta">
                  <span class="euro-pill ${visaClass(country.visaRate)}">Visa ${country.visaSuccess}</span>
                  <span class="euro-pill">PSW ${country.pswVisa}</span>
                  <span class="euro-pill">PR ${country.prTime} yrs</span>
                  <span class="euro-pill">Tuition EUR ${country.tuition}</span>
                  <span class="euro-pill">Living EUR ${country.living}/mo</span>
                  <span class="euro-pill">Salary EUR ${country.salary}/mo</span>
                </div>
              </article>
            `,
            )
            .join("")
        : '<div class="euro-empty-state">No country matches these filters.</div>';

      const tableRows = rows.length
        ? rows
            .map(
              (country) => `
              <tr>
                <td><strong>${country.country}</strong><small>#${country.rank}</small></td>
                <td><span class="euro-table-chip ${scoreClass(country.totalScore)}">${country.totalScore}</span></td>
                <td><span class="euro-table-chip ${visaClass(country.visaRate)}">${country.visaSuccess}</span></td>
                <td>${country.englishUsage}</td>
                <td>${country.mastersScholarship}</td>
                <td>EUR ${country.tuition}</td>
                <td>EUR ${country.living}/mo</td>
                <td>${country.pswVisa}</td>
                <td>${country.prTime}</td>
                <td>${country.localLangNeeded}</td>
                <td>EUR ${country.salary}/mo</td>
                <td>${country.taxLevel}</td>
                <td>${country.spouseWork}</td>
                <td>${country.partTimeHours}</td>
              </tr>
            `,
            )
            .join("")
        : '<tr><td colspan="14">No rows to display.</td></tr>';

      dashboardEl.innerHTML = `
        <div class="euro-kpi-grid">
          <article class="euro-kpi kpi-score">
            <span>Top Overall Score</span>
            <strong>${topByScore.country}</strong>
            <b>${topByScore.totalScore} / 100</b>
          </article>
          <article class="euro-kpi kpi-visa">
            <span>Highest Visa Success</span>
            <strong>${topByVisa.country}</strong>
            <b>${topByVisa.visaSuccess}</b>
          </article>
          <article class="euro-kpi kpi-cost">
            <span>Lowest Avg Tuition</span>
            <strong>${lowestTuition.country}</strong>
            <b>EUR ${lowestTuition.tuition}</b>
          </article>
          <article class="euro-kpi kpi-salary">
            <span>Highest Grad Salary</span>
            <strong>${highestSalary.country}</strong>
            <b>EUR ${highestSalary.salary}/mo</b>
          </article>
        </div>

        <div class="euro-controls">
          <label class="euro-control">
            <span>Search Country</span>
            <input id="euroSearch" type="search" placeholder="Country or English usage..." />
          </label>
          <label class="euro-control">
            <span>Sort By</span>
            <select id="euroSort">
              <option value="score-desc">Best overall score</option>
              <option value="rank-asc">Official rank</option>
              <option value="visa-desc">Highest visa success</option>
              <option value="tuition-asc">Lowest tuition</option>
              <option value="living-asc">Lowest living cost</option>
              <option value="salary-desc">Highest salary</option>
            </select>
          </label>
          <label class="euro-control">
            <span>Scholarship Level</span>
            <select id="euroScholarship">
              <option value="all">All levels</option>
              <option value="Very High">Very High</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <label class="euro-control">
            <span>Spouse Work</span>
            <select id="euroSpouse">
              <option value="all">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>
        </div>

        <p class="euro-results-count">${rows.length} of ${normalized.length} countries shown</p>
        <div class="euro-bar-list">${listMarkup}</div>

        <div class="euro-matrix-wrap">
          <table class="euro-matrix">
            <thead>
              <tr>
                <th>Country</th>
                <th>Score</th>
                <th>Visa</th>
                <th>English</th>
                <th>Scholarship</th>
                <th>Tuition</th>
                <th>Living</th>
                <th>PSW</th>
                <th>PR (Yrs)</th>
                <th>Local Lang</th>
                <th>Salary</th>
                <th>Tax</th>
                <th>Spouse</th>
                <th>Part-time</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      `;

      bindDashboardEvents();
    };

    const renderComparison = () => {
      renderPreview();
      renderDashboard();
    };

    window.renderComparison = renderComparison;

    openBtn?.addEventListener("click", () => {
      section.style.display = "block";
      if (typeof window.renderComparison === "function") {
        window.renderComparison();
      }
      const animPanel = section.querySelector('.comparison-panel');
      if (animPanel) animPanel.classList.add('reveal-in');
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    closeBtn?.addEventListener("click", () => {
      section.style.display = "none";
    });

    if (typeof window.renderComparison === "function") {
      window.renderComparison();
    }
  };

  const setupCountdownTimer = () => {
    const heroCopy = doc.querySelector(".hero-copy");
    if (!heroCopy) return;

    const countdownEl = doc.createElement("div");
    countdownEl.className = "countdown-container";
    countdownEl.innerHTML = `
      <div data-en="Fall 2026 Application Deadline">ফল ২০২৬ অ্যাপ্লিকেশন ডেডলাইন</div>
      <div class="countdown-grid">
        <div class="countdown-item"><span class="countdown-value" id="cd-days">00</span><span class="countdown-label">Days</span></div>
        <div class="countdown-item"><span class="countdown-value" id="cd-hours">00</span><span class="countdown-label">Hours</span></div>
        <div class="countdown-item"><span class="countdown-value" id="cd-mins">00</span><span class="countdown-label">Mins</span></div>
        <div class="countdown-item"><span class="countdown-value" id="cd-secs">00</span><span class="countdown-label">Secs</span></div>
      </div>
    `;
    heroCopy.appendChild(countdownEl);

    // Target date: Dec 15, 2026 (Typical large deadline)
    const targetDate = new Date("June 15, 2026 23:59:59").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff < 0) {
        countdownEl.innerHTML = "Deadline Passed!";
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = doc.getElementById("cd-days");
      const hEl = doc.getElementById("cd-hours");
      const mEl = doc.getElementById("cd-mins");
      const sEl = doc.getElementById("cd-secs");

      if (dEl) dEl.textContent = String(days).padStart(2, "0");
      if (hEl) hEl.textContent = String(hours).padStart(2, "0");
      if (mEl) mEl.textContent = String(mins).padStart(2, "0");
      if (sEl) sEl.textContent = String(secs).padStart(2, "0");
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  };

  const setupAIAssistant = () => {
    const trigger = doc.createElement("button");
    trigger.className = "ai-assistant-trigger";
    trigger.innerHTML = `
      <span>🤖</span>
      <span class="badge" data-en="New">নতুন</span>
    `;
    trigger.setAttribute("aria-label", "AI Assistant");
    trigger.setAttribute("data-en-aria-label", "AI Assistant");
    doc.body.appendChild(trigger);

    trigger.addEventListener("click", () => {
      showToast(
        root.getAttribute("data-lang") === "en"
          ? "AI Assistant is being prepared for the future!"
          : "এআই অ্যাসিস্ট্যান্ট ভবিষ্যতের জন্য প্রস্তুত করা হচ্ছে!",
      );
    });
  };

  const setupAnimatedIcons = () => {
    // Existing page-specific logic
    const isResourcesPage = doc.body.classList.contains("resources-page");
    const isToolsPage = doc.body.classList.contains("tools-page");
    if (isResourcesPage || isToolsPage) {
      const targets = doc.querySelectorAll(
        isResourcesPage ? ".resource-card" : ".tools .tool",
      );
      targets.forEach((el) => {
        el.classList.add("icon-card-ready");
      });
    }

    // New: Add icon hover micro-animations for homepage vivid icon boxes
    doc.querySelectorAll(
      '.resource-icon--calculator, .resource-icon--comparison, .resource-icon--roadmap, .resource-icon--visa'
    ).forEach((icon) => {
      icon.style.transition = 'transform 0.3s cubic-bezier(.34,1.56,.64,1)';
      const card = icon.closest('.resource-card, .resource-head');
      card?.addEventListener('mouseenter', () => { icon.style.transform = 'scale(1.12) rotate(-4deg)'; });
      card?.addEventListener('mouseleave', () => { icon.style.transform = ''; });
    });

    doc.querySelectorAll('.stat .icon').forEach((icon) => {
      icon.style.transition = 'transform 0.3s cubic-bezier(.34,1.56,.64,1)';
      icon.closest('.stat')?.addEventListener('mouseenter', () => { icon.style.transform = 'scale(1.15) rotate(6deg)'; });
      icon.closest('.stat')?.addEventListener('mouseleave', () => { icon.style.transform = ''; });
    });
  };

  const setupScrollRevealAnimations = () => {
    const revealTargets = doc.querySelectorAll(
      ".section-head, .panel, .resource-card, .tool, .stat, .cards-grid > *, .resources-grid > *, .blog-news-item, .team-member-1, .team-member-2, .comparison-panel, .support-summary, .site-footer",
    );
    if (!revealTargets.length) return;

    let directionIndex = 0;
    revealTargets.forEach((el, index) => {
      if (el.classList.contains("reveal-ready")) return;
      el.classList.add("reveal-ready");

      // Keep section wrappers subtle, animate content blocks with alternating directions.
      if (el.classList.contains("section") || el.classList.contains("site-footer")) {
        el.classList.add("reveal-zoom");
        return;
      }

      if (index % 5 === 0) {
        el.classList.add("reveal-zoom");
        return;
      }

      const dirClass = directionIndex % 2 === 0 ? "reveal-left" : "reveal-right";
      el.classList.add(dirClass);
      directionIndex += 1;
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      revealTargets.forEach((el) => el.classList.add("reveal-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
          } else if (entry.boundingClientRect.top > 0) {
            // Outro when user scrolls back up and item leaves viewport.
            entry.target.classList.remove("reveal-in");
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealTargets.forEach((el) => observer.observe(el));

    // Also handle new .reveal → .visible system for section zone elements
    const revealNew = doc.querySelectorAll('.reveal');
    if (revealNew.length) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
      );
      revealNew.forEach((el) => revealObserver.observe(el));
    }
  };

  setupTheme();

  setupLanguage();
  setupGlobalSearch();
  setupMobileAppChrome();
  setupMenu();
  setupSmoothAnchors();
  setupAuthButtons();
  setupCountryFilter();
  setupCards();
  setupResources();
  setupTools();
  setupFlags();
  setupLogin();
  setupComparisonTool();
  setupCountdownTimer();
  setupAIAssistant();
  setupAnimatedIcons();
  setupScrollRevealAnimations();
})();
