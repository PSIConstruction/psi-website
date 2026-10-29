/* ============================================================
   PSI Quote Request Questionnaire — engine
   Guided, branching, multiple-choice flow per the provided spec:
   - Q0 project-type gateway routes into one of 10 flows
   - "Other / Need guidance" always available as a fallback
   - Visual progress bar ("Question X of Y")
   - Skip logic (e.g., no shower-niche question for tub-only)
   - Universal intake block at the end of every flow
   - Compiles all answers into a single intake email
   ============================================================ */
(() => {
  "use strict";
  // Where the request is posted. A form relay is used because the site is
  // static — GitHub Pages cannot run server code of its own. Swapping the
  // provider is a one-line change here.
  const SEND = {
    endpoint: window.PSI_FORM_ENDPOINT || "https://api.web3forms.com/submit",
    accessKey: window.PSI_FORM_KEY || "",
    to: "info@psiconstructionpa.com",
  };

  const DATA = window.PSI_QUOTE;
  const root = document.getElementById("quoteApp");
  if (!root || !DATA) return;

  const state = {
    stage: "gateway", // gateway | flow | intake | done
    flowKey: null,
    gatewayChoice: null,
    qIndex: 0,
    answers: [], // [{q, a}]
    keyed: {}, // answers by question id (for skip logic)
    intake: {},
  };

  function activeQuestions() {
    const flow = DATA.flows[state.flowKey];
    if (!flow) return [];
    return flow.questions.filter((q) => !(q.skipIf && q.skipIf(state.keyed)));
  }

  function totalSteps() {
    // questions in the active flow + 1 intake step
    return (state.flowKey ? activeQuestions().length : 0) + 1;
  }

  function render() {
    root.innerHTML = "";
    if (state.stage === "gateway") return renderGateway();
    if (state.stage === "flow") return renderQuestion();
    if (state.stage === "intake") return renderIntake();
    if (state.stage === "done") return renderDone();
  }

  function progressBlock(stepNum, total, label) {
    const wrap = el("div", "quote__progress");
    const lab = el("div", "quote__progress-label");
    lab.textContent = label || `Question ${stepNum} of ${total}`;
    const bar = el("div", "quote__progress-bar");
    const fill = el("div", "quote__progress-fill");
    fill.style.width = Math.round((stepNum / total) * 100) + "%";
    bar.appendChild(fill);
    wrap.append(lab, bar);
    return wrap;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function optionButtons(options, onPick) {
    const list = el("div", "quote__opts");
    options.forEach((label) => {
      const b = el("button", "quote__opt", label);
      b.type = "button";
      b.addEventListener("click", () => onPick(label));
      list.appendChild(b);
    });
    return list;
  }

  function backButton(handler) {
    const b = el("button", "quote__back", "← Back");
    b.type = "button";
    b.addEventListener("click", handler);
    return b;
  }

  // ---------------- Gateway (Q0) ----------------
  function renderGateway() {
    root.appendChild(progressBlock(0, 1, "Let's scope your project"));
    root.appendChild(el("h3", "quote__q", DATA.gateway.q));
    root.appendChild(
      optionButtons(
        DATA.gateway.options.map((o) => o.label),
        (label) => {
          const opt = DATA.gateway.options.find((o) => o.label === label);
          state.gatewayChoice = label;
          state.answers = [{ q: DATA.gateway.q, a: label }];
          state.keyed = {};
          state.qIndex = 0;
          if (opt && opt.flow) {
            state.flowKey = opt.flow;
            state.stage = "flow";
          } else {
            // "Multiple of the above" / "Not sure yet" — straight to intake
            state.flowKey = null;
            state.stage = "intake";
          }
          render();
        },
      ),
    );
  }

  // ---------------- Flow questions ----------------
  function renderQuestion() {
    const qs = activeQuestions();
    if (state.qIndex >= qs.length) {
      state.stage = "intake";
      return render();
    }
    const q = qs[state.qIndex];
    const total = totalSteps();

    root.appendChild(progressBlock(state.qIndex + 1, total));
    root.appendChild(el("h3", "quote__q", q.q));
    if (q.note) root.appendChild(el("p", "quote__note", "(" + q.note + ")"));

    const opts = q.opts.concat(
      q.opts.includes(DATA.fallbackOption) ? [] : [DATA.fallbackOption],
    );
    root.appendChild(
      optionButtons(opts, (label) => {
        state.answers.push({ q: q.q, a: label });
        if (q.id) state.keyed[q.id] = label;
        state.qIndex++;
        render();
      }),
    );

    const controls = el("div", "quote__controls");
    controls.appendChild(
      backButton(() => {
        if (state.qIndex === 0) {
          state.stage = "gateway";
          state.answers = [];
          state.keyed = {};
        } else {
          state.qIndex--;
          const removed = state.answers.pop();
          const prevQ = qs[state.qIndex];
          if (prevQ && prevQ.id) delete state.keyed[prevQ.id];
          void removed;
        }
        render();
      }),
    );
    root.appendChild(controls);
  }

  // ---------------- Universal intake block ----------------
  function renderIntake() {
    const total = totalSteps();
    root.appendChild(
      progressBlock(
        total,
        total,
        state.flowKey
          ? `Last step — Question ${total} of ${total}`
          : "Last step — how do we reach you?",
      ),
    );
    root.appendChild(el("h3", "quote__q", "Almost done — contact details"));

    const form = el("form", "quote__form");
    DATA.intake.forEach((f) => {
      const field = el("div", "quote__field");
      const label = el("label", null, f.label + (f.required ? " *" : ""));
      label.setAttribute("for", "qf_" + f.key);
      field.appendChild(label);
      let input;
      if (f.type === "select") {
        input = document.createElement("select");
        f.opts.forEach((o) => {
          const op = document.createElement("option");
          op.value = op.textContent = o;
          input.appendChild(op);
        });
      } else if (f.type === "textarea") {
        input = document.createElement("textarea");
      } else {
        input = document.createElement("input");
        input.type = f.type;
        if (f.type === "file") {
          input.multiple = true;
          input.accept = "image/*";
        }
      }
      input.id = "qf_" + f.key;
      if (f.required) input.required = true;
      field.appendChild(input);
      form.appendChild(field);
    });

    const controls = el("div", "quote__controls");
    controls.appendChild(
      backButton(() => {
        if (state.flowKey) {
          state.stage = "flow";
          state.qIndex = Math.max(0, activeQuestions().length - 1);
          state.answers.pop();
        } else {
          state.stage = "gateway";
          state.answers = [];
        }
        render();
      }),
    );
    const submit = el("button", "btn", "Review & Send Request");
    submit.type = "submit";
    controls.appendChild(submit);
    form.appendChild(controls);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      DATA.intake.forEach((f) => {
        const input = document.getElementById("qf_" + f.key);
        if (!input) return;
        if (f.type === "file") {
          state.intake[f.key] = Array.from(input.files || [])
            .map((x) => x.name)
            .join(", ");
        } else {
          state.intake[f.key] = input.value.trim();
        }
      });
      state.stage = "done";
      render();
    });

    root.appendChild(form);
  }

  // ---------------- Summary + send ----------------
  function buildSummary() {
    const flow = state.flowKey ? DATA.flows[state.flowKey] : null;
    const lines = [];
    lines.push("PSI CONSTRUCTION — QUOTE REQUEST");
    lines.push("Project type: " + (flow ? flow.title : state.gatewayChoice));
    lines.push("");
    lines.push("— Project details —");
    state.answers.forEach((a) => lines.push(a.q + "\n  → " + a.a));
    lines.push("");
    lines.push("— Contact —");
    const labels = {
      name: "Full name",
      email: "Email",
      phone: "Phone",
      contactMethod: "Preferred contact",
      address: "Project address",
      bestTime: "Best time to reach",
      heard: "How they heard about PSI",
      notes: "Notes",
      photos: "Photos to attach",
    };
    Object.keys(labels).forEach((k) => {
      if (state.intake[k]) lines.push(labels[k] + ": " + state.intake[k]);
    });
    return lines.join("\n");
  }

  function renderDone() {
    const summary = buildSummary();
    const flow = state.flowKey ? DATA.flows[state.flowKey] : null;
    // Sending is the moment the visitor has worked towards, so the review
    // screen is replaced outright rather than annotated with a status line.
    function showConfirmation() {
      const method = (state.intake.contactMethod || "").toLowerCase();
      const how =
        method === "call" ? "a phone call"
        : method === "text" ? "a text"
        : method === "either" ? "a call or a text"
        : "email";
      const when = state.intake.bestTime
        ? " We have you down as best reached in the " +
          state.intake.bestTime.toLowerCase() + "."
        : "";

      root.innerHTML = "";
      const wrap = el("div", "quote__sent");

      wrap.innerHTML =
        '<div class="sent__burst" aria-hidden="true">' +
          Array.from({ length: 14 })
            .map(function (_, i) { return '<i style="--i:' + i + '"></i>"'; })
            .join("")
            .replace(/"/g, "") +
        '</div>' +
        '<svg class="sent__tick" viewBox="0 0 52 52" aria-hidden="true">' +
          '<circle class="sent__tick-ring" cx="26" cy="26" r="24"/>' +
          '<path class="sent__tick-mark" d="M14 27l8 8 16-16"/>' +
        '</svg>' +
        '<h3 class="sent__title">Message delivered to PSI</h3>' +
        '<p class="sent__lead">Expect an answer within 24 hours, by ' + how + "." + when + '</p>' +
        '<p class="sent__thanks">Thanks for the detail you put in — it means we can come back to you ' +
          'with real numbers rather than a guess. We appreciate the opportunity to quote your project.</p>' +
        (state.intake.photos
          ? '<p class="sent__note">Reply to our email with your photos and we will add them to the file.</p>'
          : "") +
        '<p class="sent__note">Something urgent in the meantime? Call us on ' +
          '<a href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span>&nbsp;(774)</a>.</p>';

      root.appendChild(wrap);
      wrap.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    const subject =
      "Quote Request — " +
      (flow ? flow.title : state.gatewayChoice) +
      (state.intake.name ? " — " + state.intake.name : "");

    const done = el("div", "quote__done");
    done.appendChild(el("h3", null, "Here's your request"));
    const p = el("p", "body-copy");
    p.style.margin = "0 auto 18px";
    p.textContent =
      "Review the summary below, then send it straight to us — no email app needed." +
      (state.intake.photos
        ? " We will ask for your photos in our reply."
        : "");
    done.appendChild(p);
    root.appendChild(done);

    const pre = el("div", "quote__summary");
    pre.textContent = summary;
    root.appendChild(pre);

    const controls = el("div", "quote__controls");
    controls.appendChild(
      backButton(() => {
        state.stage = "intake";
        render();
      }),
    );

    const btns = el("div");
    btns.style.display = "flex";
    btns.style.gap = "10px";
    const copyBtn = el("button", "btn btn--ghost", "Copy Summary");
    copyBtn.type = "button";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(summary).then(() => {
        copyBtn.textContent = "Copied ✓";
      });
    });
    const send = el("button", "btn", "Send to PSI");
    send.type = "button";

    const status = el("p", "quote__status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.style.margin = "10px 0 0";

    // Last resort only: if the relay cannot be reached, the visitor still has a
    // way to get the request to us rather than losing everything they typed.
    function mailtoFallback() {
      const href =
        "mailto:" + SEND.to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(summary);
      status.innerHTML =
        "We could not reach the server. " +
        '<a href="' + href + '">Open this in your email app</a> ' +
        "or call us on 570-338-8774 — your summary is above, and Copy Summary puts it on your clipboard.";
    }

    send.addEventListener("click", async () => {
      if (send.disabled) return;
      send.disabled = true;
      send.textContent = "Sending…";
      status.textContent = "";

      const payload = {
        access_key: SEND.accessKey,
        subject: subject,
        from_name: state.intake.name || "Website quote request",
        // Sent by our own verified sender; replyto points at the visitor so
        // hitting Reply in the inbox goes straight back to them. Sending *as*
        // their address would fail SPF/DKIM and land in spam.
        replyto: state.intake.email || "",
        name: state.intake.name || "",
        email: state.intake.email || "",
        phone: state.intake.phone || "",
        address: state.intake.address || "",
        contact_method: state.intake.contactMethod || "",
        best_time: state.intake.bestTime || "",
        heard: state.intake.heard || "",
        project: flow ? flow.title : state.gatewayChoice,
        message: summary,
        botcheck: "",            // honeypot — real visitors never fill this
      };

      // Attribution — this is what separates a paid ad click from an organic
      // search. psi-tracking.js stored ?gclid= in a cookie on the landing page.
      const attribution = (window.PSI_attribution && window.PSI_attribution()) || {};
      payload.gclid = attribution.gclid || "";
      payload.traffic_source = attribution.traffic_source || "";
      payload.landing_page = attribution.landing_page || "";

      try {
        const res = await fetch(SEND.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);

        // Delivery succeeded. Now record it for the ads account: fire the
        // Google Ads conversion and write a Lead_Log row carrying the GCLID.
        // Both are best-effort and cannot affect the delivery above.
        try { if (window.PSI_fireConversion) window.PSI_fireConversion(); } catch (e) {}
        try { if (window.PSI_submitLead) window.PSI_submitLead(summary, subject); } catch (e) {}

        showConfirmation();
      } catch (err) {
        send.disabled = false;
        send.textContent = "Send to PSI";
        mailtoFallback();
      }
    });

    btns.append(copyBtn, send);
    controls.appendChild(btns);
    root.appendChild(controls);
    root.appendChild(status);
  }

  // A landing page can open straight onto its own trade, skipping the
  // gateway. The flow key comes from ?flow= on the URL (an ad can link to
  // contact.html?flow=kitchen) or from data-flow on the mount point (the
  // service pages set it). An unknown key just falls back to the gateway.
  const preset =
    new URLSearchParams(location.search).get("flow") || root.dataset.flow;
  if (preset && DATA.flows[preset]) {
    state.flowKey = preset;
    state.gatewayChoice = DATA.flows[preset].title;
    state.stage = "flow";
  }

  render();
})();
