# Burbujas Mágicas Kindergarten — sitio web

Sitio estático (HTML + CSS + JS, sin build) del jardín infantil, pensado para atraer
matrículas 2027. Se publica gratis con GitHub Pages:
<https://nicolasdcubillos.github.io/burbujas-magicas-kindergarten/>

## Desarrollo local

```powershell
python -m http.server 8000
```

Abre <http://localhost:8000>.

## Estructura

- `index.html` — página única (secciones: inicio, nosotros, niveles, qué aprenden, un día aquí, matrículas, ubicación, preguntas, contacto).
- `assets/css/styles.css` — estilos y paleta de marca (variables `--teal`, `--red`, `--navy`).
- `assets/js/main.js` — menú móvil y animaciones al hacer scroll.
- `assets/img/` — logo e ilustraciones optimizadas a partir del branding original.
- `docs/PERFIL-JARDIN.md` — perfil del jardín (datos confirmados, propuestas y pendientes) para que personas y agentes generen contenido sin inventar datos.
- `docs/presentacion-burbujas-magicas.pdf` — presentación del jardín (16:9). Fuente en `docs/presentacion/`; se regenera con `python docs/presentacion/build.py` (requiere Playwright).

## Pendiente por confirmar con el jardín

- Dirección confirmada por el jardín: Calle 152 #7B-58, Bogotá (aparece en hero, ubicación, contacto, footer, FAQ, mapa y JSON-LD). Falta confirmar horarios.
- Cursos confirmados: Soñadores 1, Soñadores 2, Exploradores (3 a 4 años), Aventureros y Preparatorio. Faltan las edades de los demás y las descripciones de cada curso (son propuesta).
- Condiciones y porcentaje del descuento por pago anticipado del año (hoy solo se menciona, sin cifras).
- Fotos reales (con autorización de las familias) para reemplazar/complementar las ilustraciones.
- Revisar los textos de `index.html`: son propuestas genéricas, no datos oficiales.
- Si se usa un dominio propio, actualizar `canonical`, `og:*`, `robots.txt` y `sitemap.xml`.

## Hook de commits

`.githooks/commit-msg` elimina las líneas `Co-authored-by:` de Copilot y conserva
coautores humanos. Se activa por clone con:

```powershell
git config --local core.hooksPath .githooks
```

Prueba: `node --test .\.githooks\tests.cjs`
