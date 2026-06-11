# 🧺 Tendedero

Dashboard de clima para la ropa. Te dice si colgar, entrar, cuánto tarda en secar, y qué ponerte. Con tendedero animado que se hamaca con el viento real.

---

## 🚀 Publicar sin instalar nada

Solo navegador y dos cuentas gratis.

### Paso 1 · Cuentas (5 min)
1. **GitHub** → https://github.com/signup
2. **Vercel** → https://vercel.com/signup (logueate con GitHub, así quedan conectadas)

### Paso 2 · Subir a GitHub (3 min)
1. Descomprimí `clima-ropa.zip`.
2. Andá a https://github.com/new
3. Repository name: `clima-ropa` · dejá **Public** · no marques nada más · **Create repository**
4. En la pantalla siguiente, hacé clic en el link azul **"uploading an existing file"**.
5. Arrastrá **todo el contenido** de la carpeta `clima-ropa` (los archivos y subcarpetas que están adentro, no la carpeta entera) a la zona gris.
6. Bajá y apretá **"Commit changes"**.

⚠️ El archivo `.gitignore` empieza con punto y puede estar oculto. En **Windows** → Explorador → pestaña Vista → tildá "Elementos ocultos". En **Mac** → Finder → `Cmd + Shift + .` (punto).

### Paso 3 · Vercel (2 min)
1. https://vercel.com/new
2. **Import** al lado de `clima-ropa`.
3. No toques nada. **Deploy**.
4. Esperá 1-2 minutos. Te da una URL tipo `https://clima-ropa-xxx.vercel.app`.
5. Abrila, dale **Permitir** a la ubicación.

✅ Listo.

---

## 🎨 Sobre el diseño

- **Paleta**: fondo oscuro cálido, dos acentos (coral sol + cian lluvia). Todo lo demás en escala de grises cálidos.
- **Tipografía**: Instrument Serif itálica para los veredictos, Inter para texto, JetBrains Mono para números.
- **Animaciones**: stagger de entrada, barras de lluvia que crecen, arco solar que se dibuja, prendas que se hamacan al viento (la velocidad depende del viento real).
- **Lluvia inminente**: si llueve en menos de 2h, caen gotas sobre el tendedero.

## 🔧 Modificar después

Editás cualquier archivo desde GitHub (clic → lapicito → Commit). Vercel re-deploya solo en 1-2 min. Lo principal está en `app/page.jsx`.

Stack: Next.js 14 · Tailwind · framer-motion · Open-Meteo API (gratis, sin key).
