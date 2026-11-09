# sonder. — Sonder Universe

Aplicación web estática (HTML + CSS + JavaScript, sin servidor ni base de datos).
Todo se guarda en el navegador de quien la abre: `localStorage` para los datos e `IndexedDB` para las fotos.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo (por ejemplo `sonder`).
2. Sube **el contenido** de esta carpeta (que `index.html` quede en la raíz del repositorio).
3. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)` → Save.
4. En uno o dos minutos tendrás el enlace: `https://TU_USUARIO.github.io/sonder/`

Desde la terminal sería algo así:

```bash
cd sonder-universe
git init
git add .
git commit -m "sonder."
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sonder.git
git push -u origin main
```

## Instalarla como app

En el celular, al abrir el enlace en Chrome: menú **⋮ → Instalar app** (o *Agregar a la pantalla principal*). En iPhone: Safari → **Compartir → Agregar a pantalla de inicio**. También hay un botón en *Configuración → App*.
Queda con su ícono, se abre a pantalla completa y funciona sin internet. Si actualizas archivos en GitHub, la app instalada toma la versión nueva la próxima vez que se abra con internet.

## Probarla antes de regalarla

Abre el enlace con `?dev` al final (por ejemplo `https://TU_USUARIO.github.io/sonder/?dev`).
Aparece un botón pequeño **dev** con:

- **Adelantar 24 h**: hace que aparezcan las publicaciones y discusiones programadas.
- **Encender 8 líneas**: completa el mapa para probar la revelación.
- **Ver El origen**: abre la carta directamente.
- **Borrar todo**: deja la experiencia como nueva.

Sin `?dev` ese botón no existe. **Antes de mandarle el enlace, usa «Borrar todo»** en tu teléfono si estuviste probando ahí (los datos son de cada navegador, así que lo que pruebes tú no le aparece a ella de todos modos).

## Cómo se desbloquea «El origen»

Cada vez que ella entra a un planeta y abre una de sus discusiones, se enciende una línea en el mapa y la luz del centro brilla un poco más. Con los 8 planetas visitados, en el centro aparece «El origen»; al tocarlo se muestra la carta.

## Dónde editar cosas

| Qué | Archivo |
|---|---|
| La carta final | `scripts/origin.js` (constantes `LETTER` y `SIGN`) |
| Planetas, bienvenidas, descubrimientos | `data/planets.js` |
| Discusiones de cada foro | `data/discussions.js` |
| Cuentas, publicaciones y mensajes directos | `data/accounts.js` |
| Temas detectados y respuestas | `data/responses.js` |
| Colores y tipografías | `styles/main.css` (variables al inicio) |
| Nombre e ícono de la app | `manifest.webmanifest` y `assets/icons/` |
