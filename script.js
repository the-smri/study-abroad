(() => {
  const doc = document;

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
    if (!pills.length || !cards.length) return;

    let activeFilter = "";
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
      cards.forEach((card) => {
        const country = card.getAttribute("data-country") || "";
        const visible = !activeFilter || activeFilter === country;
        card.classList.toggle("is-hidden", !visible);
      });
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

        setActivePill(next);
        applyFilter();
        showToast(next ? `${pill.textContent.trim()} ডেস্টিনেশন দেখানো হচ্ছে` : "সব ডেস্টিনেশন দেখানো হচ্ছে");
      });
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
    doc.querySelectorAll("#tools .tool").forEach((tool) => {
      tool.style.cursor = "pointer";
      tool.addEventListener("click", () => {
        const title = tool.querySelector("b")?.textContent.trim() || "টুল";
        showToast(`${title} চালু হয়েছে`);
      });
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

  setupMenu();
  setupSmoothAnchors();
  setupAuthButtons();
  setupCountryFilter();
  setupCards();
  setupTools();
  setupFlags();
})();
