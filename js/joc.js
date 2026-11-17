/* Passaparaula Valencià — lògica del joc (JavaScript sense llibreries) */
(function () {
  "use strict";

  var SEGONS = 200;
  var CLAU = "passaparaula-valencia-records";

  // ---------- Regles ----------
  /** Minúscules, sense accents, apòstrofs, articles inicials ni símbols. */
  function normalitza(text) {
    return text
      .toLowerCase()
      .replace(/[’`´]/g, "'")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/^(l'|el\s+|la\s+|els\s+|les\s+)/, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function esCorrecta(text, pista) {
    var donada = normalitza(text);
    if (!donada) return false;
    return pista.answers.some(function (a) { return normalitza(a) === donada; });
  }

  function construeixRosco(aleatori) {
    aleatori = aleatori || Math.random;
    return LETTERS.map(function (lletra) {
      var opcions = CLUE_BANK[lletra];
      var p = opcions[Math.min(opcions.length - 1, Math.floor(aleatori() * opcions.length))];
      return { letter: p.letter, type: p.type, clue: p.clue, answers: p.answers, status: "pending", given: "" };
    });
  }

  /** Més encerts primer, després menys errades, després més temps sobrant. */
  function ordenaRecords(llista, limit) {
    return llista.slice().sort(function (a, b) {
      return b.correct - a.correct || a.wrong - b.wrong || b.timeLeft - a.timeLeft;
    }).slice(0, limit || 5);
  }

  function carregaRecords() {
    try { return JSON.parse(localStorage.getItem(CLAU) || "[]"); } catch (e) { return []; }
  }

  // ---------- Estat ----------
  var items = construeixRosco(function () { return 0; });
  var actual = 0;
  var temps = SEGONS;
  var fase = "intro"; // intro | playing | feedback | finished
  var rellotge = null;
  var espera = null;
  var ultimRecord = null;

  // ---------- Elements ----------
  var $ = function (id) { return document.getElementById(id); };
  var pantalles = { intro: $("pantalla-inici"), joc: $("pantalla-joc"), final: $("pantalla-final") };
  var campNom = $("nom");
  var campResposta = $("resposta");

  function escapa(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function compte() {
    var c = 0, e = 0;
    items.forEach(function (i) { if (i.status === "correct") c++; else if (i.status === "wrong") e++; });
    return { correct: c, wrong: e, remaining: items.length - c - e };
  }

  // ---------- Dibuix ----------
  function pintaRosco(contenidor, actiu) {
    var n = items.length;
    var html = items.map(function (it, i) {
      var angle = (-90 + (i * 360) / n) * (Math.PI / 180);
      var classes = "lletra";
      if (it.status === "skipped") classes += " passada";
      if (it.status === "correct") classes += " encert";
      if (it.status === "wrong") classes += " error";
      if (actiu && i === actual && (fase === "playing" || fase === "feedback")) classes += " actual";
      var x = (50 + 44 * Math.cos(angle)).toFixed(3);
      var y = (50 + 44 * Math.sin(angle)).toFixed(3);
      return '<div class="' + classes + '" style="left:' + x + "%;top:" + y + '%" aria-label="Lletra ' + it.letter + '">' + it.letter + "</div>";
    }).join("");
    var t = actiu ? temps : SEGONS;
    html += '<div class="rellotge"><span class="rellotge-num' + (t <= 20 ? " poc" : "") + '" aria-label="Temps restant">' + t +
      '</span><span class="rellotge-text">segons</span></div>';
    contenidor.innerHTML = html;
  }

  function pintaMarcador() {
    var c = compte();
    var html =
      '<div class="casella encerts"><div class="casella-num">' + c.correct + '</div><div class="casella-nom">Encerts</div></div>' +
      '<div class="casella errades"><div class="casella-num">' + c.wrong + '</div><div class="casella-nom">Errades</div></div>' +
      '<div class="casella pendents"><div class="casella-num">' + c.remaining + '</div><div class="casella-nom">Pendents</div></div>';
    document.querySelectorAll(".marcador").forEach(function (m) { m.innerHTML = html; });
  }

  function pintaRecords() {
    var llista = ordenaRecords(carregaRecords());
    var html = '<h3 class="targeta-titol">Millors marcadors</h3>';
    if (!llista.length) {
      html += '<p class="buit">Encara no hi ha cap partida. Sigues la primera persona!</p>';
    } else {
      html += "<ol>" + llista.map(function (r, i) {
        return '<li class="' + (r.date === ultimRecord ? "nou" : "") + '"><span class="pos">' + (i + 1) +
          '</span><span class="nom">' + escapa(r.name) + '</span><span class="ok">' + r.correct +
          ' ✓</span><span class="ko">' + r.wrong + ' ✗</span><span class="t">' + r.timeLeft + "s</span></li>";
      }).join("") + "</ol>";
    }
    document.querySelectorAll(".records").forEach(function (el) { el.innerHTML = html; });
  }

  function pintaPregunta() {
    var it = items[actual];
    $("lletra-actual").textContent = it.letter;
    $("tipus-pista").textContent = (it.type === "starts" ? "Comença per " : "Conté la ") + it.letter;
    $("pista").textContent = it.clue;
    var targeta = $("pregunta");
    targeta.classList.remove("pop");
    void targeta.offsetWidth; // reinicia l'animació
    targeta.classList.add("pop");
  }

  function mostra(nom) {
    pantalles.intro.hidden = nom !== "intro";
    pantalles.joc.hidden = nom !== "joc";
    pantalles.final.hidden = nom !== "final";
    window.scrollTo(0, 0);
  }

  // ---------- Flux de joc ----------
  function seguentObert(desDe) {
    var n = items.length;
    for (var k = 1; k <= n; k++) {
      var idx = (desDe + k) % n;
      var s = items[idx].status;
      if (s === "pending" || s === "skipped") return idx;
    }
    return -1;
  }

  function comenca() {
    clearTimeout(espera);
    localStorage.setItem(CLAU + "-name", campNom.value.trim());
    items = construeixRosco();
    actual = 0;
    temps = SEGONS;
    ultimRecord = null;
    fase = "playing";
    mostra("joc");
    $("avis").hidden = true;
    $("form-resposta").hidden = false;
    campResposta.value = "";
    pintaMarcador();
    pintaPregunta();
    pintaRosco($("rosco-joc"), true);
    clearInterval(rellotge);
    rellotge = setInterval(tic, 1000);
    campResposta.focus();
  }

  function tic() {
    if (fase !== "playing") return; // el rellotge s'atura mentre es mostra la correcció
    temps = Math.max(0, temps - 1);
    pintaRosco($("rosco-joc"), true);
    if (temps === 0) acaba();
  }

  function avanca(desDe) {
    var idx = seguentObert(desDe);
    if (idx === -1) return acaba();
    actual = idx;
    fase = "playing";
    $("avis").hidden = true;
    $("form-resposta").hidden = false;
    pintaPregunta();
    pintaRosco($("rosco-joc"), true);
    campResposta.focus();
  }

  function passa() {
    if (fase !== "playing") return;
    items[actual].status = "skipped";
    campResposta.value = "";
    avanca(actual);
  }

  function respon() {
    if (fase !== "playing") return;
    var text = campResposta.value;
    if (!text.trim()) return passa();
    var it = items[actual];
    var ok = esCorrecta(text, it);
    it.status = ok ? "correct" : "wrong";
    it.given = text;
    campResposta.value = "";
    fase = "feedback";
    var avis = $("avis");
    avis.className = "avis " + (ok ? "be" : "mal");
    avis.textContent = ok ? "Correcte!" : "Error! Era: " + it.answers[0];
    avis.hidden = false;
    $("form-resposta").hidden = true;
    pintaMarcador();
    pintaRosco($("rosco-joc"), true);
    var desDe = actual;
    espera = setTimeout(function () { avanca(desDe); }, ok ? 900 : 2200);
  }

  function acaba() {
    if (fase === "finished") return;
    fase = "finished";
    clearInterval(rellotge);
    clearTimeout(espera);
    var c = compte();
    var rec = { name: campNom.value.trim() || "Anònim", correct: c.correct, wrong: c.wrong, timeLeft: temps, date: new Date().toISOString() };
    localStorage.setItem(CLAU, JSON.stringify(ordenaRecords(carregaRecords().concat([rec]), 10)));
    ultimRecord = rec.date;

    $("final-titol").textContent = c.remaining === 0 && c.wrong === 0 ? "Rosco complet!" : c.correct + " encerts";
    $("final-temps").textContent = temps === 0 ? "S'ha acabat el temps." : "Et sobraven " + temps + " segons.";
    $("llista-respostes").innerHTML = items.map(function (it) {
      var cls = it.status === "correct" ? "encert" : it.status === "wrong" ? "error" : "";
      return '<li><span class="bola ' + cls + '">' + it.letter + '</span><span><span class="sol">' + escapa(it.answers[0]) + "</span>" +
        (it.status === "wrong" ? '<span class="dit">Vas dir: ' + escapa(it.given) + "</span>" : "") + "</span></li>";
    }).join("");
    pintaMarcador();
    pintaRecords();
    mostra("final");
  }

  function tornaInici() {
    fase = "intro";
    pintaRosco($("rosco-inici"), false);
    pintaRecords();
    mostra("intro");
  }

  // ---------- Esdeveniments ----------
  $("form-nom").addEventListener("submit", function (e) { e.preventDefault(); comenca(); });
  $("form-resposta").addEventListener("submit", function (e) { e.preventDefault(); respon(); });
  $("boto-passa").addEventListener("click", passa);
  $("boto-plantar").addEventListener("click", acaba);
  $("boto-reinicia").addEventListener("click", comenca);
  $("boto-inici").addEventListener("click", tornaInici);

  // ---------- Inici ----------
  $("num-lletres").textContent = items.length;
  $("segons-regla").textContent = SEGONS + " segons";
  campNom.value = localStorage.getItem(CLAU + "-name") || "";
  tornaInici();
})();
