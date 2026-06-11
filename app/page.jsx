"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// CONSTANTES
// ============================================================
const PRENDAS = {
  remera:        { nombre: "Remera",         base: 2,   icon: "tshirt" },
  ropa_interior: { nombre: "Ropa interior",  base: 1.5, icon: "brief" },
  pantalon:      { nombre: "Pantalón",       base: 5,   icon: "pants" },
  toalla:        { nombre: "Toalla",         base: 6,   icon: "towel" },
  sabana:        { nombre: "Sábana",         base: 4,   icon: "sheet" },
  buzo:          { nombre: "Buzo",           base: 5,   icon: "hoodie" },
  campera:       { nombre: "Campera",        base: 8,   icon: "jacket" },
};

// ============================================================
// HELPERS
// ============================================================
function calcularSecado(base, temp, hum, wind, cloud) {
  let f = 1;
  f *= 20 / Math.max(temp, 5);
  f *= hum / 50;
  f *= 10 / Math.max(wind, 3);
  f *= 1 + (cloud / 100) * 0.5;
  return base * f;
}

function fmtHoras(h) {
  if (h < 1) return `${Math.round(h * 60)}m`;
  const horas = Math.floor(h);
  const min = Math.round((h - horas) * 60);
  return min > 0 ? `${horas}h ${min}m` : `${horas}h`;
}

function hhmm(iso) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

// ============================================================
// SVG PRENDAS (silhouettes for the clothesline)
// ============================================================
const PRENDA_SVG = {
  tshirt: (
    <path d="M2 6 L8 2 L12 4 L16 2 L22 6 L19 10 L16 9 L16 22 L8 22 L8 9 L5 10 Z" />
  ),
  brief: (
    <path d="M3 4 L21 4 L19 16 L15 12 L9 12 L5 16 Z" />
  ),
  pants: (
    <path d="M4 2 L20 2 L20 6 L18 24 L13 24 L12 12 L11 12 L10 24 L5 24 L4 6 Z" />
  ),
  towel: (
    <path d="M3 3 L21 3 L21 23 L3 23 Z M3 7 L21 7 M3 19 L21 19" fill="none" strokeWidth="0.5" />
  ),
  sheet: (
    <path d="M2 4 L22 4 L22 22 L2 22 Z" />
  ),
  hoodie: (
    <path d="M2 7 L7 2 L9 4 Q12 6 15 4 L17 2 L22 7 L19 11 L17 10 L17 23 L7 23 L7 10 L5 11 Z M9 4 Q12 8 15 4" />
  ),
  jacket: (
    <path d="M2 6 L7 2 L11 4 L12 6 L13 4 L17 2 L22 6 L20 11 L18 10 L18 23 L6 23 L6 10 L4 11 Z M12 6 L12 23" strokeWidth="0.5" />
  ),
};

function PrendaIcon({ tipo, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="currentColor">
      {PRENDA_SVG[tipo] || PRENDA_SVG.tshirt}
    </svg>
  );
}

// ============================================================
// CLOTHESLINE — el elemento firma
// ============================================================
function Clothesline({ prendaSel, viento, secadoHoras, lluviaInminente }) {
  // Más viento = sway más rápido. Clamp a un rango lindo visualmente.
  const dur = Math.max(1.6, Math.min(6, 6 - viento / 5));
  const swayDeg = Math.min(6, 1 + viento / 8);

  // Mostramos 6 prendas en el tendedero, la seleccionada destacada
  const prendasList = Object.keys(PRENDAS).slice(0, 7);

  return (
    <div className="relative w-full h-[260px] overflow-hidden">
      {/* Lluvia animada si es inminente */}
      <AnimatePresence>
        {lluviaInminente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px bg-rain/40"
                style={{
                  left: `${(i * 37) % 100}%`,
                  height: 24,
                  top: -24,
                }}
                animate={{ y: 300 }}
                transition={{
                  duration: 0.8 + (i % 5) * 0.1,
                  repeat: Infinity,
                  delay: (i * 0.07) % 1.5,
                  ease: "linear",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Postes */}
      <div className="absolute left-4 top-12 bottom-4 w-px bg-bg-line" />
      <div className="absolute right-4 top-12 bottom-4 w-px bg-bg-line" />

      {/* Cuerda (SVG con sag) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 260" preserveAspectRatio="none">
        <path
          d="M 18 60 Q 300 95 582 60"
          fill="none"
          stroke="#3a3743"
          strokeWidth="1.5"
        />
      </svg>

      {/* Prendas colgadas */}
      <div className="absolute inset-0 px-8 pt-[58px]">
        <div className="relative w-full h-full">
          {prendasList.map((k, i) => {
            const isSel = k === prendaSel;
            const total = prendasList.length;
            const x = (i + 0.5) / total;
            // Sag: la cuerda baja en el centro, así que los del medio bajan más
            const sag = Math.sin(x * Math.PI) * 18;
            const phase = (i % 3) * 0.3;
            return (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                className="absolute"
                style={{ left: `${x * 100}%`, top: sag, transform: "translateX(-50%)" }}
              >
                {/* Broche */}
                <div className="w-1.5 h-2 bg-ink-faint rounded-sm mx-auto" />
                {/* Prenda con sway */}
                <div
                  className="sway mt-[-2px]"
                  style={{
                    "--sway-dur": `${dur + phase}s`,
                    "--sway-from": `-${swayDeg}deg`,
                    "--sway-to": `${swayDeg}deg`,
                    animationDelay: `${phase}s`,
                  }}
                >
                  <PrendaIcon
                    tipo={PRENDAS[k].icon}
                    className={`w-10 h-10 transition-all duration-500 ${
                      isSel ? "text-sun drop-shadow-[0_0_12px_rgba(255,138,76,0.5)]" : "text-ink-faint"
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Caption de viento abajo */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-between px-6 text-[10px] font-mono uppercase tracking-widest text-ink-faint">
        <span>viento · {Math.round(viento)} km/h</span>
        <span>{PRENDAS[prendaSel].nombre.toLowerCase()} · {fmtHoras(secadoHoras)}</span>
      </div>
    </div>
  );
}

// ============================================================
// RAIN FORECAST — barras próximas 24h
// ============================================================
function RainForecast({ hourly, idxNow }) {
  const horas = 24;
  const bars = [];
  for (let i = 0; i < horas; i++) {
    const idx = idxNow + i;
    if (idx >= hourly.time.length) break;
    bars.push({
      hora: new Date(hourly.time[idx]).getHours(),
      prob: hourly.precipitation_probability[idx] || 0,
      mm: hourly.precipitation[idx] || 0,
      isDay: hourly.is_day[idx] === 1,
    });
  }

  return (
    <div className="w-full">
      <div className="flex items-end gap-[3px] h-20">
        {bars.map((b, i) => {
          const h = Math.max(2, (b.prob / 100) * 100);
          const intensity = b.prob / 100;
          return (
            <motion.div
              key={i}
              className="flex-1 relative group"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.015, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ transformOrigin: "bottom" }}
            >
              <div
                className="w-full rounded-sm transition-colors"
                style={{
                  height: `${h}%`,
                  background: b.prob >= 50
                    ? `rgba(109, 213, 237, ${0.5 + intensity * 0.5})`
                    : `rgba(168, 161, 149, ${0.15 + intensity * 0.3})`,
                }}
              />
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] font-mono text-ink-faint tabular">
        <span>{bars[0]?.hora}h</span>
        <span>+6h</span>
        <span>+12h</span>
        <span>+18h</span>
        <span>+24h</span>
      </div>
    </div>
  );
}

// ============================================================
// SUN ARC
// ============================================================
function SunArc({ sunrise, sunset, now }) {
  const total = sunset - sunrise;
  const elapsed = now - sunrise;
  const progress = Math.max(0, Math.min(1, elapsed / total));

  // Arc parameters
  const r = 70;
  const cx = 90;
  const cy = 90;
  const angle = Math.PI - progress * Math.PI; // de izq a der
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);

  return (
    <svg viewBox="0 0 180 100" className="w-full">
      {/* Arco completo (fondo) */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#26242e"
        strokeWidth="1"
      />
      {/* Arco recorrido */}
      <motion.path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#ff8a4c"
        strokeWidth="1.5"
        strokeDasharray={Math.PI * r}
        initial={{ strokeDashoffset: Math.PI * r }}
        animate={{ strokeDashoffset: Math.PI * r * (1 - progress) }}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
      />
      {/* Sol */}
      {progress > 0 && progress < 1 && (
        <motion.circle
          cx={sunX}
          cy={sunY}
          r={5}
          fill="#ff8a4c"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        />
      )}
      {/* Horizonte */}
      <line x1="10" y1="90" x2="170" y2="90" stroke="#26242e" strokeWidth="0.5" />
    </svg>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Home() {
  const [coords, setCoords] = useState(null);
  const [ciudad, setCiudad] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prendaSel, setPrendaSel] = useState("remera");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setCiudad("Tu ubicación");
      },
      () => setError("Permiso de ubicación denegado. Buscá una ciudad.")
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError("");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,cloud_cover,wind_speed_10m,is_day&daily=sunrise,sunset,uv_index_max&timezone=auto&past_hours=12&forecast_hours=48`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Error al obtener el clima."); setLoading(false); });
  }, [coords]);

  async function buscarCiudad(e) {
    e?.preventDefault();
    if (!busqueda.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busqueda)}&count=1&language=es`
      );
      const d = await r.json();
      if (!d.results?.length) { setError("Ciudad no encontrada."); setLoading(false); return; }
      const c = d.results[0];
      setCoords({ lat: c.latitude, lon: c.longitude });
      setCiudad(`${c.name}, ${c.country}`);
      setSearchOpen(false);
      setBusqueda("");
    } catch {
      setError("Error en la búsqueda."); setLoading(false);
    }
  }

  // ============ ANÁLISIS ============
  const analisis = useMemo(() => {
    if (!data?.current || !data?.hourly) return null;
    const c = data.current;
    const h = data.hourly;
    const ahora = new Date(c.time);
    const idxNow = Math.max(0, h.time.findIndex((t) => new Date(t) >= ahora));

    let proxLluvia = null;
    for (let i = idxNow; i < Math.min(idxNow + 24, h.time.length); i++) {
      if (h.precipitation_probability[i] >= 50 || h.precipitation[i] > 0.2) {
        proxLluvia = {
          hora: h.time[i],
          prob: h.precipitation_probability[i],
          mm: h.precipitation[i],
          horasFalta: (new Date(h.time[i]) - ahora) / 3600000,
        };
        break;
      }
    }

    let horasNublado = 0;
    for (let i = idxNow - 1; i >= 0; i--) {
      if (h.cloud_cover[i] >= 60) horasNublado++; else break;
    }

    const sunrise = new Date(data.daily.sunrise[0]);
    const sunset = new Date(data.daily.sunset[0]);
    const horasLuz = (sunset - sunrise) / 3600000;
    const horasLuzRest = Math.max(0, (sunset - ahora) / 3600000);

    const base = PRENDAS[prendaSel].base;
    const secadoHoras = calcularSecado(
      base, c.temperature_2m, c.relative_humidity_2m, c.wind_speed_10m, c.cloud_cover
    );

    const lloviendo = c.precipitation > 0.1;
    const colgarOK = !lloviendo && (!proxLluvia || proxLluvia.horasFalta >= secadoHoras) && c.temperature_2m >= 5;
    const entrarYa = lloviendo || (proxLluvia && proxLluvia.horasFalta <= 1);
    const lluviaInminente = proxLluvia && proxLluvia.horasFalta <= 2;

    // Veredicto editorial
    let verdict, sub;
    if (entrarYa) {
      verdict = lloviendo ? "Entrá ya." : "Sacala. Ahora.";
      sub = lloviendo ? "Está lloviendo." : `Llueve en ${fmtHoras(proxLluvia.horasFalta)}.`;
    } else if (colgarOK) {
      verdict = "Colgá tranquila.";
      sub = proxLluvia
        ? `Sin lluvia hasta dentro de ${fmtHoras(proxLluvia.horasFalta)}. Te alcanza.`
        : "Sin lluvia en las próximas 24h.";
    } else {
      verdict = "Mejor esperá.";
      sub = proxLluvia
        ? `Lluvia en ${fmtHoras(proxLluvia.horasFalta)} y el secado lleva ${fmtHoras(secadoHoras)}.`
        : "Condiciones flojas para colgar.";
    }

    // Outfit
    const t = c.apparent_temperature;
    let outfit;
    if (t < 5) outfit = "Campera de abrigo, bufanda, gorro.";
    else if (t < 12) outfit = "Campera y buzo. Abrigate.";
    else if (t < 18) outfit = "Buzo o campera liviana.";
    else if (t < 24) outfit = "Manga larga o camisa.";
    else if (t < 30) outfit = "Remera y pantalón liviano.";
    else outfit = "Ropa fresca, shorts, mucha agua.";
    if (proxLluvia && proxLluvia.horasFalta < 6) outfit += " Llevá paraguas.";
    if (data.daily.uv_index_max[0] >= 7) outfit += " Protector solar.";

    return {
      c, h, idxNow, proxLluvia, horasNublado, horasLuz, horasLuzRest,
      secadoHoras, colgarOK, entrarYa, lluviaInminente, verdict, sub, outfit,
      sunrise, sunset, ahora, uv: data.daily.uv_index_max[0],
    };
  }, [data, prendaSel]);

  // ============ RENDER ============
  return (
    <main className="relative min-h-screen px-5 sm:px-8 py-8 sm:py-12 max-w-6xl mx-auto" style={{ zIndex: 2 }}>
      {/* HEADER */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-go animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-dim">
            Tendedero · Live
          </span>
        </div>
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-dim hover:text-ink transition-colors"
        >
          {ciudad ? `📍 ${ciudad}` : "Elegir lugar"}
        </button>
      </header>

      {/* SEARCH */}
      <AnimatePresence>
        {searchOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={buscarCiudad}
            className="mb-8 overflow-hidden"
          >
            <div className="flex gap-2 pt-2">
              <input
                autoFocus
                className="flex-1 bg-bg-raised border border-bg-line px-4 py-3 rounded-lg text-ink placeholder:text-ink-faint focus:border-sun outline-none transition-colors"
                placeholder="Buenos Aires, Madrid, Tokyo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button className="px-5 py-3 rounded-lg bg-ink text-bg font-medium hover:bg-sun transition-colors">
                Ir
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 px-4 py-3 rounded-lg bg-stop/10 border border-stop/30 text-stop text-sm"
        >
          {error}
        </motion.div>
      )}

      {loading && !analisis && (
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Consultando el cielo...
        </div>
      )}

      {analisis && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="space-y-5"
        >
          {/* VEREDICTO HERO */}
          <motion.section
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative rounded-2xl bg-bg-raised border border-bg-line p-8 sm:p-12 overflow-hidden"
          >
            {/* Indicador de estado superior */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  analisis.entrarYa ? "bg-stop" : analisis.colgarOK ? "bg-go" : "bg-sun"
                }`}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">
                {analisis.entrarYa ? "Alerta" : analisis.colgarOK ? "Vía libre" : "Espera"}
              </span>
            </div>

            <h1 className="font-display italic text-[clamp(2.75rem,9vw,6rem)] leading-[0.95] text-ink">
              {analisis.verdict}
            </h1>
            <p className="mt-4 text-ink-dim text-lg max-w-xl">{analisis.sub}</p>

            {/* Temperatura grande a la derecha en desktop */}
            <div className="mt-8 sm:mt-0 sm:absolute sm:top-8 sm:right-10 text-right">
              <div className="font-mono text-5xl sm:text-6xl tabular text-ink">
                {Math.round(analisis.c.temperature_2m)}°
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mt-1">
                se siente {Math.round(analisis.c.apparent_temperature)}°
              </div>
            </div>
          </motion.section>

          {/* GRID: Pronóstico + Tendedero */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Pronóstico lluvia */}
            <motion.section
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 rounded-2xl bg-bg-raised border border-bg-line p-6"
            >
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
                    Lluvia · próximas 24h
                  </div>
                  <div className="font-display italic text-2xl text-ink mt-1">
                    {analisis.proxLluvia
                      ? `En ${fmtHoras(analisis.proxLluvia.horasFalta)}`
                      : "Despejado"}
                  </div>
                </div>
                {analisis.proxLluvia && (
                  <div className="text-right font-mono">
                    <div className="text-rain tabular text-xl">{Math.round(analisis.proxLluvia.prob)}%</div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-faint">prob</div>
                  </div>
                )}
              </div>
              <RainForecast hourly={analisis.h} idxNow={analisis.idxNow} />
            </motion.section>

            {/* Métricas verticales */}
            <motion.section
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 rounded-2xl bg-bg-raised border border-bg-line p-6 grid grid-cols-2 gap-4"
            >
              <Metric label="Humedad" value={`${analisis.c.relative_humidity_2m}%`} />
              <Metric label="Viento" value={`${Math.round(analisis.c.wind_speed_10m)}`} unit="km/h" />
              <Metric label="Nubes" value={`${analisis.c.cloud_cover}%`} />
              <Metric
                label="Nublado hace"
                value={analisis.horasNublado === 0 ? "—" : `${analisis.horasNublado}`}
                unit={analisis.horasNublado === 0 ? "" : "h"}
              />
            </motion.section>
          </div>

          {/* TENDEDERO (signature) */}
          <motion.section
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl bg-bg-raised border border-bg-line overflow-hidden"
          >
            <div className="px-6 pt-6 pb-2 flex items-baseline justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
                  Tendedero
                </div>
                <div className="font-display italic text-2xl text-ink mt-1">
                  Tarda{" "}
                  <span className="not-italic font-mono text-sun tabular">
                    {fmtHoras(analisis.secadoHoras)}
                  </span>
                </div>
              </div>
            </div>

            <Clothesline
              prendaSel={prendaSel}
              viento={analisis.c.wind_speed_10m}
              secadoHoras={analisis.secadoHoras}
              lluviaInminente={analisis.lluviaInminente}
            />

            {/* Selector de prenda */}
            <div className="px-6 pb-6 pt-2">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {Object.entries(PRENDAS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setPrendaSel(k)}
                    className={`shrink-0 px-3.5 py-2 rounded-full text-sm transition-all border ${
                      k === prendaSel
                        ? "bg-sun text-bg border-sun"
                        : "bg-transparent text-ink-dim border-bg-line hover:border-ink-faint hover:text-ink"
                    }`}
                  >
                    {v.nombre}
                  </button>
                ))}
              </div>
            </div>
          </motion.section>

          {/* GRID inferior: Sol + Outfit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.section
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl bg-bg-raised border border-bg-line p-6"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint mb-3">
                Sol
              </div>
              <SunArc sunrise={analisis.sunrise} sunset={analisis.sunset} now={analisis.ahora} />
              <div className="flex justify-between mt-2 font-mono text-xs tabular text-ink-dim">
                <div>
                  <div className="text-ink">{hhmm(analisis.sunrise)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-faint">sale</div>
                </div>
                <div className="text-center">
                  <div className="text-sun">{fmtHoras(analisis.horasLuzRest)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-faint">de luz</div>
                </div>
                <div className="text-right">
                  <div className="text-ink">{hhmm(analisis.sunset)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-faint">se pone</div>
                </div>
              </div>
            </motion.section>

            <motion.section
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl bg-bg-raised border border-bg-line p-6 flex flex-col"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint mb-3">
                Para salir
              </div>
              <div className="font-display italic text-2xl sm:text-3xl text-ink leading-tight flex-1">
                {analisis.outfit}
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-bg-line font-mono text-[11px] uppercase tracking-wider text-ink-dim">
                <span>UV {Math.round(analisis.uv)}</span>
                <span className="text-ink-faint">·</span>
                <span>Sensación {Math.round(analisis.c.apparent_temperature)}°</span>
              </div>
            </motion.section>
          </div>

          <footer className="text-center pt-6 pb-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
              Datos · Open-Meteo
            </div>
          </footer>
        </motion.div>
      )}
    </main>
  );
}

function Metric({ label, value, unit }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-1">
        {label}
      </div>
      <div className="font-mono tabular text-2xl text-ink">
        {value}
        {unit && <span className="text-sm text-ink-dim ml-1">{unit}</span>}
      </div>
    </div>
  );
}
