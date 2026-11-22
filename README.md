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

- `index.html` — página única (secciones: inicio, nosotros, qué aprenden, un día aquí, matrículas, preguntas, contacto).
- `assets/css/styles.css` — estilos y paleta de marca (variables `--teal`, `--red`, `--navy`).
- `assets/js/main.js` — menú móvil y animaciones al hacer scroll.
- `assets/img/` — logo e ilustraciones optimizadas a partir del branding original.

## Pendiente por confirmar con el jardín

- Dirección y mapa, horarios y edades/niveles.
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
