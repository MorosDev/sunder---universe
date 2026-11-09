/* sonder. — cuentas ficticias.
   Ninguna representa a una persona real. Sus respuestas están escritas de antemano. */
(function (SU) {
  'use strict';

  /* ===== Cuentas de la red social principal (solo publican texto) ===== */
  const main = [
    {
      id: 'luzdetarde', user: 'luz.de.tarde', name: 'Marina', main: true,
      colors: ['#ffc9a3', '#b0607a'],
      bio: 'Describo atardeceres porque nunca me salen en foto. 🌅',
      posts: [
        { t: 'Hoy el cielo se puso color durazno a las 6:42. Nadie a mi alrededor volteó. Me sentí guardiana de un secreto.', d: 0, ago: 5 },
        { t: 'Teoría: la gente que se detiene a ver el cielo camina más despacio el resto del día.', d: 0, ago: 28,
          c: [{ by: 'marea', t: 'Confirmo. Yo camino tan lento que llego tarde a todo, pero feliz.' }] },
        { t: 'Atardecer de hoy: lila arriba, naranja abajo y una nube que parecía un perro dormido.', d: 9 },
        { t: 'Me gusta cuando la luz entra de lado por la ventana y todo parece de película vieja.', d: 26 },
        { t: 'Si hoy no viste el cielo, todavía estás a tiempo de que te toque mañana.', d: 50 },
        { t: 'Hay días grises que también son bonitos. Solo piden que los mires con más paciencia.', d: 75 }
      ],
      photoComments: ['Esta foto tiene una luz preciosa ✨', 'Qué bonita foto, se siente tranquila.', 'Ok, esta foto merece estar enmarcada.', 'Te ves muy bien aquí 🤍', 'La luz de esta foto me ganó.'],
      textComments: ['Me gustó mucho leer esto.', 'Esto se sintió como luz de tarde, no sé explicarlo.', 'Guardando esto para releerlo luego.', 'Qué bonito lo dijiste.'],
      dm: {
        open: ['¡Hola! Gracias por seguirme 🌅', 'Pregunta importante: ¿eres de amaneceres o de atardeceres?'],
        steps: [
          {
            rules: [
              { k: ['atardecer', 'tarde', 'atardeceres'], r: '¡Sabía que había buen gusto por aquí! Los atardeceres tienen algo de despedida bonita.' },
              { k: ['amanecer', 'amaneceres', 'manana', 'temprano'], r: 'Respeto muchísimo a la gente de amaneceres. Yo a esa hora sigo negociando con la almohada.' },
              { k: ['ambos', 'los dos', 'depende', 'las dos'], r: 'Respuesta diplomática, me gusta. Cada uno tiene su encanto.' },
              { k: ['noche', 'ninguno', 'luna'], r: 'Una persona de noche, interesante. Ahí arriba también pasan cosas bonitas.' }
            ],
            def: 'Me gusta tu respuesta. Yo soy team atardecer, por si no era obvio 😅',
            next: '¿Cuál es el cielo más bonito que recuerdas haber visto?'
          },
          {
            rules: [
              { k: ['playa', 'mar', 'oceano', 'lago'], r: 'Un cielo con agua abajo es trampa, siempre gana. 🌊' },
              { k: ['estrellas', 'noche', 'luna', 'via lactea'], r: 'Los cielos de noche cuentan doble. Ahí arriba hay más historias que en cualquier libro.' },
              { k: ['lluvia', 'nubes', 'tormenta', 'nublado'], r: 'Los cielos con nubes son los más dramáticos y los más honestos.' },
              { k: ['no se', 'no recuerdo', 'no me acuerdo'], r: 'Entonces todavía te falta verlo. Eso también es bonito: el mejor cielo puede estar por venir.' }
            ],
            def: 'Qué bonito. Me lo imaginé completo mientras lo leía.',
            next: 'Te dejo una tarea opcional: la próxima vez que veas un cielo bonito, acuérdate de que alguien por aquí también lo está mirando. 🌇'
          },
          { def: 'Me alegra mucho que me hayas escrito ✨' }
        ],
        fallback: ['Hoy el cielo se puso bonito, por si te lo perdiste.', 'Te leo 🌅', 'Recuerda que soy una cuenta ficticia de sonder.: mis respuestas ya estaban escritas. Pero lo que escribes aquí sigue siendo tuyo.']
      }
    },
    {
      id: 'nico', user: 'nicodibuja', name: 'Nico', main: true,
      colors: ['#9fe0d0', '#3b6f86'],
      bio: 'Dibujo cosas en servilletas y luego te las describo. ✏️',
      posts: [
        { t: 'Dibujo de hoy: un gato con sombrero que juzga a todos los que pasan. Se llama Licenciado.', d: 0, ago: 3,
          c: [{ by: 'tavo', t: 'Licenciado tiene más autoridad que mi jefe.' }] },
        { t: 'Tengo una libreta solo para dibujar manos. Ninguna me sale bien. La libreta se llama «intentos».', d: 0, ago: 40 },
        { t: 'Intenté dibujar el viento. Me salieron rayitas. Creo que así se ve el viento, honestamente.', d: 7 },
        { t: 'Si dibujas algo feo con cariño, deja de ser feo. Es ciencia.', d: 22 },
        { t: 'Hoy dibujé una taza de café con cara de lunes.', d: 46 },
        { t: 'Reto para quien quiera: dibuja tu desayuno como si fuera un monstruo. Yo ya hice el mío: un huevo con colmillos.', d: 70 }
      ],
      photoComments: ['Esta foto me dio ganas de dibujarla 👀✏️', 'Composición de 10, colores de 10, todo de 10.', 'Qué buena foto, en serio.', 'Guardando esta como referencia de algo bonito.'],
      textComments: ['Jajaja me gustó esto.', 'Esto lo pondría en una servilleta enmarcada.', 'Ok, esto me alegró el rato.', 'Muy bueno.'],
      dm: {
        open: ['¡Hey! Gracias por el follow ✏️', 'Tengo una pregunta seria y científica: si fueras un animal dibujado en una servilleta, ¿cuál serías?'],
        steps: [
          {
            rules: [
              { k: ['gato', 'gata', 'gatito'], r: 'Una gata, obvio. Elegante, misteriosa y que hace lo que quiere. Ya te estoy imaginando con bigotes de tinta 🐱' },
              { k: ['perro', 'perrita', 'perrito'], r: 'Un perrito feliz, de esos que dibujo con la lengua de fuera. Excelente elección.' },
              { k: ['ave', 'pajaro', 'buho', 'colibri', 'aguila'], r: 'Un ave. Muy buena: libre y con buena vista desde arriba.' },
              { k: ['conejo', 'zorro', 'oso', 'panda', 'nutria', 'pinguino'], r: 'Uff, ese animal en servilleta queda adorable. Aprobado por el comité de dibujos.' }
            ],
            def: 'Me encanta. Ya lo estoy dibujando en mi cabeza y te quedó con mucha personalidad.',
            next: 'Y si pudieras tener un dibujo tuyo colgado en cualquier lugar del mundo, ¿dónde sería?'
          },
          {
            def: 'Lugar aprobado. Pondría el dibujo ahí con un letrero que diga «no tocar, es importante».',
            next: 'Gracias por seguirme el juego. Si algún día dibujas algo, aunque sean rayitas, cuenta. 🙌'
          },
          { def: '😄' }
        ],
        fallback: ['Ahorita estoy intentando dibujar una nube con forma de nube. Es más difícil de lo que parece.', 'El gato Licenciado te manda saludos (es tan ficticio como yo).', '✏️']
      }
    },
    {
      id: 'marea', user: 'marea.lenta', name: 'Marea', main: true,
      colors: ['#a9c4ff', '#3d4f8f'],
      bio: 'Libros, té y oleaje mental. Leo despacio a propósito.',
      posts: [
        { t: 'Subrayé una frase de un libro y luego no supe por qué. Creo que me entendió antes que yo.', d: 0, ago: 14 },
        { t: 'Té de manzanilla, cobija, ventana con lluvia. Ese es el plan y no acepto cambios.', d: 0, ago: 52 },
        { t: 'Leer en voz baja es como platicar con alguien que no interrumpe.', d: 12 },
        { t: 'Hay libros que se leen y libros que se habitan.', d: 30 },
        { t: 'Recordatorio amable: no todo tiene que hacerse rápido.', d: 54 },
        { t: 'Me gusta prestar libros con notas en los márgenes. Es como dejar migajas para que alguien me encuentre.', d: 80 }
      ],
      photoComments: ['Qué foto tan tranquila, me dio paz.', 'Hay algo muy bonito en esta foto 🤍', 'Esta imagen se siente como domingo en la tarde.', 'Me encanta esta foto.'],
      textComments: ['Esto merecía subrayarse.', 'Lo leí despacio, como se debe.', 'Me quedo pensando en esto.', 'Qué bonito.'],
      dm: {
        open: ['Hola 🌊 gracias por pasar por aquí.', 'Siempre le pregunto lo mismo a quien llega: ¿hay algún libro, canción o película que sientas que te entiende?'],
        steps: [
          {
            rules: [
              { k: ['cancion', 'musica', 'album', 'canciones'], r: 'Las canciones que nos entienden son de las mejores compañías. Ponerlas a todo volumen es casi terapia 🎧' },
              { k: ['libro', 'novela', 'poema', 'poesia'], r: 'Los libros que nos entienden se vuelven medio nuestros, ¿no? Como si los hubiéramos escrito un poquito.' },
              { k: ['pelicula', 'serie', 'anime', 'peli'], r: 'Hay historias que uno vuelve a ver no por lo que pasa, sino por cómo se siente verlas.' },
              { k: ['no', 'ninguno', 'nada', 'no se'], r: 'Está bien, a veces todavía no llega. Y cuando llega, se nota.' }
            ],
            def: 'Qué bonito tener algo así. Esas cosas son como un lugar al que se puede regresar.',
            next: 'Y para un día lento, ¿qué te gusta más: té, café o algo totalmente distinto?'
          },
          {
            rules: [
              { k: ['te', 'manzanilla', 'tecito'], r: 'Team té 🍵 sabía que nos íbamos a entender.' },
              { k: ['cafe', 'cafecito', 'capuchino', 'latte'], r: 'El café también es poesía, sobre todo si está calientito y no hay prisa.' },
              { k: ['chocolate', 'champurrado', 'atole'], r: 'Algo calientito y dulce es la respuesta correcta en días fríos, no hay debate.' }
            ],
            def: 'Anotado. Esas pequeñas elecciones dicen mucho de alguien.',
            next: 'Gracias por la plática tranquila. Aquí no hay prisa para nada 🌊'
          },
          { def: '🌊' }
        ],
        fallback: ['Sigo leyendo despacio por aquí.', 'Soy una cuenta ficticia de sonder.: nadie lee en tiempo real. Pero lo que escribes aquí sigue siendo tuyo.', 'Hoy subrayé otra frase bonita. Algún día te la cuento.']
      }
    },
    {
      id: 'tavo', user: 'cafe.y.memes', name: 'Tavo', main: true,
      colors: ['#ffd27a', '#b0603b'],
      bio: 'Café, chistes malos y opiniones muy fuertes sobre el pan dulce.',
      posts: [
        { t: 'Opinión impopular: la concha de vainilla es superior. Acepto debate, no acepto chocolate.', d: 0, ago: 8,
          c: [{ by: 'nico', t: 'Voy a dibujar una concha de chocolate solo para molestarte.' }, { by: 'luzdetarde', t: 'Las dos con café a las 6 de la tarde. Fin del debate.' }] },
        { t: 'Hoy saludé a alguien que no me estaba saludando a mí. Me mudo de país.', d: 0, ago: 33 },
        { t: 'Mi café de la mañana y yo tenemos una relación de dependencia sana. Creo.', d: 5 },
        { t: 'Si el lunes fuera una persona, ya le hubiera dejado de hablar.', d: 20 },
        { t: 'Me compré una planta. Se llama Gerardo. Gerardo ya tiene más estabilidad emocional que yo.', d: 42 },
        { t: 'Dato inútil del día: los pulpos tienen tres corazones. Y yo con uno ya no puedo.', d: 66 }
      ],
      photoComments: ['¡Fotón! 🔥', 'Esta foto está demasiado buena para una red tan chiquita jaja', 'Ok, te luciste con esta foto.', 'Me alegró el día esta foto, sin exagerar.'],
      textComments: ['Jajaja totalmente.', 'Esto es contenido de calidad.', 'Me hiciste reír, no sé si era la intención pero gracias.', 'Apruebo.'],
      dm: {
        open: ['Qué onda 👋 gracias por el follow.', 'Pregunta definitiva para conocer a alguien: ¿concha de vainilla o de chocolate?'],
        steps: [
          {
            rules: [
              { k: ['vainilla', 'blanca'], r: 'SABÍA que eras de buen gusto. 🤝' },
              { k: ['chocolate', 'cafe'], r: 'Respeto tu decisión aunque esté equivocada 😌 (es broma, las dos son buenas).' },
              { k: ['ninguna', 'no me gusta', 'otro', 'otra', 'cuernito', 'dona'], r: 'Interesante. Muy interesante. Alguien con criterio propio, me gusta.' },
              { k: ['las dos', 'ambas', 'ambos'], r: 'Ambas. La respuesta de alguien que sabe vivir.' }
            ],
            def: 'Anotado en mi libreta de respuestas importantes.',
            next: 'Última pregunta seria: ¿cuál es la comida que te pone de buen humor inmediatamente?'
          },
          {
            rules: [
              { k: ['tacos', 'taco'], r: 'Tacos. Respuesta perfecta, no hay nada más que decir 🌮' },
              { k: ['pizza'], r: 'La pizza nunca falla, es como un abrazo con queso.' },
              { k: ['sushi', 'ramen'], r: 'Uff, nivel gourmet. Me caes bien.' },
              { k: ['helado', 'pastel', 'postre', 'chocolate', 'galletas'], r: 'Lo dulce arregla días. Es un hecho científico que acabo de inventar.' }
            ],
            def: 'Excelente elección, ya me dio hambre.',
            next: 'Gracias por la plática. Si un día necesitas un chiste malo, aquí estoy (soy una cuenta ficticia, pero los chistes malos son reales).'
          },
          { def: 'Jajaja' }
        ],
        fallback: ['¿Sabías que las nutrias se toman de la mano para dormir y no separarse? Te lo dejo por aquí.', 'Gerardo (mi planta) te manda saludos 🌱', 'Jajaja']
      }
    },
    {
      id: 'noctambula', user: 'noctambula', name: 'Noctámbula', main: true,
      colors: ['#c3b3ff', '#3a2f6e'],
      bio: 'Pensamientos de las 2 a. m. y canciones en repeat.',
      posts: [
        { t: '¿Por qué las ideas buenas llegan justo cuando ya apagué la luz?', d: 0, ago: 11 },
        { t: 'Canción en repeat número 47. Ya no la escucho, la habito.', d: 0, ago: 60 },
        { t: 'La noche tiene un volumen distinto. Todo se oye más de verdad.', d: 14 },
        { t: 'Pensamiento nocturno: alguien en otra ciudad está viendo la misma luna y pensando cosas parecidas.', d: 34 },
        { t: 'Hoy me prometí dormir temprano. Spoiler: no.', d: 58 },
        { t: 'Las conversaciones de madrugada son las más honestas. Será el cansancio, o será que nadie está mirando.', d: 84 }
      ],
      photoComments: ['Qué foto tan bonita 🌙', 'Tiene vibra de canción lenta esta foto.', 'Me encanta, en serio.'],
      textComments: ['Esto se siente como pensamiento de madrugada, del bueno.', 'Totalmente.', 'Lo leí y me quedé pensando un rato.']
    },
    {
      id: 'cartografo', user: 'el_cartografo', name: 'El Cartógrafo', main: true, glyphOnly: true, glyph: '✧',
      colors: ['#e9dcb8', '#4a4470'],
      bio: 'Dibujo mapas de lugares que todavía no existen.',
      special: true,
      posts: [
        { t: 'Todo mapa empieza con un punto. Luego alguien decide caminar hacia él.', d: 0, ago: 20 },
        { t: 'Estoy dibujando un mapa con ocho lugares. Ninguno está en la Tierra.', d: 0, ago: 6 },
        { t: 'Dicen que «sonder» es darte cuenta de que cada persona que pasa a tu lado tiene una vida tan compleja como la tuya.', d: 10 },
        { t: 'Si cada persona es un universo, ¿cuántos mundos tendrá alguien?', d: 28 },
        { t: 'Un mapa no te dice a dónde ir. Solo te recuerda que hay lugares.', d: 48 },
        { t: 'En el centro de mi mapa hay una luz muy pequeña. Todavía no sé qué es. Bueno, sí sé. Pero no me toca decirlo.', d: 72 }
      ],
      photoComments: ['Este lugar también merece estar en un mapa.'],
      textComments: ['✧', 'Anotado en el mapa.'],
      dm: {
        open: ['Hola. Perdón por aparecer así.', 'Dibujo mapas de lugares que todavía no existen. Bueno, uno sí existe: tiene ocho mundos y está muy cerca de aquí.'],
        steps: [
          {
            rules: [
              { k: ['donde', 'como llego', 'entrar', 'cual', 'como', 'que es'], r: 'Ve a Explorar. Hasta abajo hay una puerta que no parece puerta.' }
            ],
            def: 'No hace falta entenderlo todavía. Ve a Explorar y busca lo que hay más allá de esta red.',
            next: 'Una pista más: los ocho mundos ya están ahí, todos visibles. Lo que se descubre es lo demás.'
          },
          { def: 'Cuando hayas caminado un poco, el mapa va a empezar a dibujarse solo.' }
        ],
        fallback: ['El mapa sigue ahí, esperando.', 'No soy una persona real, soy parte de la experiencia. Pero el mapa sí lo hizo alguien real.', '✧']
      }
    }
  ];

  /* ===== Cuentas de los planetas ===== */
  const planet = [
    // ENTRE LÍNEAS
    { id: 'entrelineas', user: 'entrelineas', name: 'Entre Líneas', planet: 'lineas', glyph: '❝', colors: ['#d8d2ff', '#5a548f'], guide: true,
      bio: 'Lo que no se dice también ocupa espacio. Cuenta guía de este planeta.',
      voice: 'Reflexiva y tranquila.',
      openers: ['Te leo.', 'Gracias por dejarlo aquí.', 'Qué bonito que lo hayas escrito.'],
      lines: ['A veces escribir algo es la forma de descubrir que lo pensabas.', 'No tienes que explicarlo todo. Con dejarlo aquí ya cuenta.', 'Hay cosas que se entienden mejor dichas a medias.', 'Me gusta cómo lo dijiste. Se nota que lo pensaste.', 'Lo que escribiste tiene más de una lectura, y todas son bonitas.'] },
    { id: 'fragmentos', user: 'fragmentos', name: 'Fragmentos', planet: 'lineas', glyph: '⋯', colors: ['#c9c6e8', '#45436e'],
      bio: 'Junto pedacitos de cosas que la gente casi dice.',
      voice: 'Breve, poética, observadora.',
      openers: ['Mm.', 'Esto.', 'Guardado.'],
      lines: ['Hay frases que solo caben en una servilleta o en un mensaje que nunca se envía.', 'Lo dijiste en pocas palabras y aun así se escuchó completo.', 'Me recordó a esas notas que uno escribe y luego encuentra meses después.', 'Escribir a medias también es escribir.', 'Esto se queda en mi colección de cosas casi dichas.'] },
    { id: 'voz_bajita', user: 'voz_bajita', name: 'voz bajita', planet: 'lineas', glyph: '◌', colors: ['#e6dcf5', '#6b5c8c'],
      bio: 'hablo bajito porque así se escucha mejor.',
      voice: 'Minúsculas, suave, comprensiva.',
      openers: ['oye, gracias por compartirlo.', 'esto se sintió sincero.', 'te leí con calma.'],
      lines: ['no hace falta decirlo fuerte para que importe.', 'a veces lo más importante se dice despacito.', 'me gusta que aquí se pueda decir así, sin prisa.', 'lo que guardas también es tuyo, y está bien.', 'gracias por confiarle esto a un planeta tan callado.'] },

    // ESENCIA
    { id: 'esencia', user: 'esencia', name: 'Esencia', planet: 'esencia', glyph: '✦', colors: ['#d7b8ff', '#5b2d9e'], guide: true,
      bio: 'Lo que te hace ser tú no se explica, se nota. Cuenta guía de este planeta.',
      voice: 'Cálida y entusiasta con lo auténtico.',
      openers: ['Eso es muy tuyo.', 'Me encanta esto.', 'Qué bonito leerlo.'],
      lines: ['Las rarezas son la parte más interesante de cualquiera.', 'Eso que describes no es un detalle, es una firma.', 'Ser auténtica no es ser igual siempre, es ser tú en cada versión.', 'Me gusta cuando alguien no pide perdón por lo que le gusta.', 'Eso dice mucho de ti, y dice cosas buenas.'] },
    { id: 'sin_guion', user: 'sin_guion', name: 'Sin guion', planet: 'esencia', glyph: '∿', colors: ['#ffb8e0', '#7a3c8c'],
      bio: 'Improviso. Me equivoco con estilo.',
      voice: 'Espontánea y juguetona.',
      openers: ['Ok, esto me encantó.', '¡Dato guardado!', 'Jaja, muy bueno.'],
      lines: ['Nadie viene con instrucciones y qué bueno, sería aburridísimo.', 'La espontaneidad es una forma de honestidad.', 'Eso suena a algo que harías sin pensarlo dos veces, y me gusta.', 'Las mejores partes de alguien casi nunca salen en la presentación.', 'Me dio curiosidad saber más de esa parte de ti.'] },
    { id: 'otra_version', user: 'otra_version', name: 'Otra versión', planet: 'esencia', glyph: '◐', colors: ['#b9c0ff', '#4a3d8f'],
      bio: 'Todos tenemos varias. Ninguna es falsa.',
      voice: 'Curiosa por los cambios y matices.',
      openers: ['Interesante.', 'Me gusta esa versión.', 'Qué buena forma de verlo.'],
      lines: ['Cambiar no te hace menos tú; a veces te hace más.', 'Hay versiones de uno que solo aparecen con ciertas personas o en ciertos lugares.', 'Lo que describes suena a una versión que vale la pena cuidar.', 'Me gusta pensar que nadie termina de conocerse del todo, y eso está bien.', 'Ninguna versión cancela a la otra.'] },

    // PEQUEÑOS DETALLES
    { id: 'pequenosdetalles', user: 'pequenosdetalles', name: 'Pequeños Detalles', planet: 'detalles', glyph: '❀', colors: ['#ffd1c2', '#b0606b'], guide: true,
      bio: 'Las cosas pequeñas también importan. Cuenta guía de este planeta.',
      voice: 'Alegre y atenta.',
      openers: ['¡Qué bonito!', 'Ay, me encantó.', 'Esto es justo de lo que se trata este lugar.'],
      lines: ['Los días se arreglan con cosas pequeñitas, casi siempre.', 'Guardo este detalle en mi lista de cosas buenas.', 'Qué bonito darse cuenta de esas cosas, no todos se fijan.', 'Esos gustos sencillos son los que nunca fallan.', 'Me hiciste sonreír con algo muy simple, y eso es lo mejor.'] },
    { id: 'cafeconestrellas', user: 'cafeconestrellas', name: 'Café con estrellas', planet: 'detalles', glyph: '◎', colors: ['#f2c9a0', '#6b4a3c'],
      bio: 'Café de noche y conversaciones sin reloj.',
      voice: 'Acogedora, sensorial.',
      openers: ['Mmm, qué rico se lee eso.', 'Me encanta.', 'Esto pide un café para acompañarlo.'],
      lines: ['Hay placeres que deberían venir con su propia canción de fondo.', 'Lo apunto para mi próximo día perfecto.', 'Esto tiene sabor a domingo.', 'Las cosas pequeñas se disfrutan doble cuando uno se da cuenta de ellas.', 'Ya quiero vivir un momento así hoy.'] },
    { id: 'instantes', user: 'instantes', name: 'Instantes', planet: 'detalles', glyph: '◷', colors: ['#ffe0b0', '#a0645a'],
      bio: 'Colecciono segundos que valen la pena.',
      voice: 'Nostálgica y luminosa.',
      openers: ['Qué instante tan bonito.', 'Guardado en mi colección.', 'Esto es oro.'],
      lines: ['Los momentos así duran poco, pero se quedan mucho.', 'Hay segundos que pesan más que días enteros.', 'Me gusta que existan personas que se fijan en estas cosas.', 'Ese tipo de detalle es lo que uno recuerda años después.', 'Ojalá ese momento se repita pronto.'] },

    // HORIZONTES
    { id: 'horizontes', user: 'horizontes', name: 'Horizontes', planet: 'horizontes', glyph: '△', colors: ['#a6ecf0', '#1f6680'], guide: true,
      bio: 'Todo lo que todavía queda por descubrir. Cuenta guía de este planeta.',
      voice: 'Optimista e imaginativa.',
      openers: ['¡Me encanta esa idea!', 'Eso suena enorme, en el buen sentido.', 'Qué bonito sueño.'],
      lines: ['Los sueños grandes se empiezan con pasos muy chiquitos.', 'Escribir algo así ya es empezar a tomarlo en serio.', 'El horizonte no se acerca, pero el camino sí cambia.', 'Me encanta que tengas algo así en mente.', 'Ojalá un día puedas volver aquí a contar que lo hiciste.'] },
    { id: 'mapa_abierto', user: 'mapa_abierto', name: 'Mapa abierto', planet: 'horizontes', glyph: '⌖', colors: ['#b8f0c8', '#2f6f63'],
      bio: 'Siempre con un lugar nuevo en la lista.',
      voice: 'Viajera y entusiasta.',
      openers: ['Agregado a mi lista.', 'Uff, qué buen plan.', 'Me dieron ganas de hacer la maleta.'],
      lines: ['Los viajes empiezan mucho antes de salir: empiezan cuando uno se los imagina.', 'Hay lugares que se sienten como si nos estuvieran esperando.', 'Imaginarlo con tanto detalle ya es medio viaje.', 'Me gusta la gente que todavía tiene ganas de conocer.', 'Ese lugar va a tener suerte de que lo visites.'] },
    { id: 'curiosa', user: 'curiosa', name: 'curiosa', planet: 'horizontes', glyph: '?', colors: ['#bfe3ff', '#3e5fa0'],
      bio: 'Pregunto todo. Incluso lo que no debería.',
      voice: 'Inquieta y preguntona.',
      openers: ['¡Qué interesante!', 'Ok, ahora tengo mil preguntas.', 'Me dio curiosidad.'],
      lines: ['Lo bueno de la curiosidad es que nunca se acaba.', 'Aprender algo nuevo siempre se siente como abrir una ventana.', 'No saber por dónde empezar también es parte de empezar.', 'Me encanta cuando alguien se emociona por aprender.', 'Eso que dices me dio ganas de investigar.'] },

    // CONTRAPUNTO
    { id: 'contrapunto', user: 'contrapunto', name: 'Contrapunto', planet: 'contrapunto', glyph: '⇄', colors: ['#e8e9f0', '#3a3f55'], guide: true,
      bio: 'Pensar también es conocerse. Cuenta guía de este planeta.',
      voice: 'Analítica y respetuosa.',
      openers: ['Buen punto.', 'Interesante postura.', 'Me gusta cómo lo planteas.'],
      lines: ['Cambiar de opinión no es perder, es aprender en voz alta.', 'Las ideas se afinan mejor cuando alguien las mira desde otro lado.', 'Me gusta que defiendas lo que piensas sin cerrar la puerta a otras ideas.', 'No todos van a estar de acuerdo, y eso hace la conversación más interesante.', 'Lo que dices dice mucho de cómo te gusta tratar a la gente.'] },
    { id: 'otra_perspectiva', user: 'otra_perspectiva', name: 'Otra perspectiva', planet: 'contrapunto', glyph: '◈', colors: ['#cfd3e6', '#4b4f6e'],
      bio: 'Siempre me pregunto cómo se ve desde el otro lado.',
      voice: 'Matizada, propone otros ángulos.',
      openers: ['Interesante.', 'Lo pensé un rato.', 'Coincido en buena parte.'],
      lines: ['Desde otro ángulo, lo que dices también podría verse como una fortaleza.', 'Me hiciste pensar en algo que no había considerado.', 'Creo que hay más de una respuesta correcta, y la tuya es una.', 'Lo bonito de opinar es que nadie tiene la última palabra.', 'A veces la mejor respuesta es otra pregunta. Pero esta vez, me convenciste.'] },
    { id: 'ideas_en_mesa', user: 'ideas_en_mesa', name: 'Ideas en la mesa', planet: 'contrapunto', glyph: '▣', colors: ['#dcd6c8', '#4e4a5e'],
      bio: 'Pon tu idea en la mesa. Aquí se conversa, no se pelea.',
      voice: 'Conversadora, de sobremesa.',
      openers: ['Idea en la mesa.', 'Buena aportación.', 'Esto da para conversar.'],
      lines: ['Lo que propones se podría conversar por horas, y eso es buena señal.', 'Me gusta que pienses las cosas antes de opinarlas.', 'Una buena idea aguanta preguntas. La tuya aguanta.', 'Esto merece un café largo y una conversación sin prisa.', 'Gracias por pensar en voz alta aquí.'] },

    // EL REFUGIO
    { id: 'refugio', user: 'refugio', name: 'El Refugio', planet: 'refugio', glyph: '⌂', colors: ['#b8ccff', '#2e3f80'], guide: true,
      bio: 'Un espacio donde no hace falta aparentar. Cuenta guía de este planeta.',
      voice: 'Tranquila y cuidadosa.',
      openers: ['Gracias por contarlo.', 'Aquí estás bien.', 'Te leo con calma.'],
      lines: ['Aquí no tienes que estar bien para quedarte.', 'Está bien sentirse así. No tienes que resolverlo hoy.', 'Ojalá hoy encuentres un ratito de calma.', 'Lo que sientes tiene sentido, aunque cueste explicarlo.', 'Respira. Este lugar no se va a ir a ningún lado.'] },
    { id: 'pausa', user: 'pausa', name: 'pausa', planet: 'refugio', glyph: '‖', colors: ['#c6d8f0', '#3f5578'],
      bio: 'Cuando todo va rápido, alguien tiene que ir lento.',
      voice: 'Pausada, breve.',
      openers: ['Pausa.', 'Respira un poquito.', 'Gracias por escribir.'],
      lines: ['A veces lo único que hace falta es parar un momento.', 'Descansar también es avanzar.', 'Un día difícil no define todo lo demás.', 'Mereces un rato sin pendientes.', 'Está bien no tener ganas de todo.'] },
    { id: 'sin_juzgar', user: 'sin_juzgar', name: 'Sin juzgar', planet: 'refugio', glyph: '○', colors: ['#d0c8ff', '#40427a'],
      bio: 'Aquí nadie te va a decir cómo sentirte.',
      voice: 'Comprensiva, poco invasiva.',
      openers: ['Te escucho.', 'Sin juicio, de verdad.', 'Gracias por la confianza.'],
      lines: ['No hay forma correcta de sentir las cosas.', 'Aquí puedes decirlo tal cual, sin adornos.', 'Lo que compartes se recibe con cuidado.', 'Ser honesta con lo que sientes es valiente.', 'No necesitas justificar lo que te pasa.'] },

    // CAOS BONITO
    { id: 'caosbonito', user: 'caosbonito', name: 'Caos Bonito', planet: 'caos', glyph: '✺', colors: ['#ffb3d1', '#9b4bb0'], guide: true,
      bio: 'Porque no todo tiene que ser profundo. Cuenta guía de este planeta.',
      voice: 'Divertida y desenfadada.',
      openers: ['JAJAJA', 'Ok, esto es arte.', 'Me encantó este caos.'],
      lines: ['Esto es exactamente el tipo de caos que aceptamos aquí.', 'No entendí del todo y aun así lo apoyo.', 'Esto merece un monumento pequeño y ligeramente torcido.', 'El universo necesitaba esta información.', 'Tu cerebro tiene ideas muy buenas y muy raras, la mejor combinación.'] },
    { id: 'sin_contexto', user: 'sin_contexto', name: 'sin contexto', planet: 'caos', glyph: '¿', colors: ['#ffe08a', '#b0573b'],
      bio: 'Frases sacadas de contexto desde siempre.',
      voice: 'Absurda y observadora.',
      openers: ['Sin contexto, esto es buenísimo.', 'No preguntaré.', 'Jajaja'],
      lines: ['Si alguien lee esto sin contexto va a pensar cosas maravillosas.', 'Guardado en mi carpeta de frases sin contexto.', 'Esto fuera de contexto es poesía.', 'No sé qué está pasando pero quiero ser parte.', 'Me imagino la escena completa y me da risa.'] },
    { id: 'randommente', user: 'randommente', name: 'randommente', planet: 'caos', glyph: '⚄', colors: ['#9ff0d8', '#5a4bb0'],
      bio: 'Pienso en cosas random. Mucho.',
      voice: 'Datos curiosos y ocurrencias.',
      openers: ['Jaja qué random, me encanta.', 'Esto es muy de este planeta.', 'Ok, aprobado.'],
      lines: ['Dato random a cambio: las vacas tienen mejores amigas.', 'Lo random es solo una forma de ser original sin avisar.', 'Esto me hizo el día un 12% mejor. Lo medí.', 'Propongo que esto se vuelva tradición oficial del planeta.', 'Me encantan las combinaciones que no deberían funcionar pero funcionan.'] },

    // SONDER
    { id: 'sonder_archive', user: 'sonder_archive', name: 'Sonder Archive', planet: 'sonder', glyph: '✶', colors: ['#ffe0a8', '#2c2f66'], guide: true,
      bio: 'Archivo de historias que nunca vamos a conocer completas. Cuenta guía de este planeta.',
      voice: 'Filosófica y empática.',
      openers: ['Gracias por dejar esto en el archivo.', 'Qué bonito.', 'Esto merece guardarse.'],
      lines: ['Cada persona que pasa a tu lado carga una historia tan grande como la tuya.', 'Lo que compartiste se queda en el archivo, con cuidado.', 'Conocer a alguien es aceptar que nunca se termina de conocer.', 'Me gusta cómo miras a las personas.', 'Hay historias que solo aparecen cuando alguien pregunta con ganas.'] },
    { id: 'miles_de_mundos', user: 'miles_de_mundos', name: 'Miles de mundos', planet: 'sonder', glyph: '⊛', colors: ['#f5d0ff', '#33306e'],
      bio: 'Cada persona es un universo. Yo solo los cuento.',
      voice: 'Soñadora, cósmica.',
      openers: ['Un mundo más en el mapa.', 'Me encanta.', 'Esto es muy sonder.'],
      lines: ['Si cada persona es un universo, conocer a alguien es explorar.', 'Lo que dices me recuerda que nadie es solo lo que se ve.', 'Hay mundos que se abren despacito, y vale la pena esperar.', 'Qué bonito darse el tiempo de conocer a alguien.', 'Cada respuesta tuya agrega una estrella a este planeta.'] },
    { id: 'observadora', user: 'observadora', name: 'observadora', planet: 'sonder', glyph: '◉', colors: ['#ffd6b8', '#3a2f55'],
      bio: 'Miro a la gente con cariño. Imagino sus historias.',
      voice: 'Atenta y tierna.',
      openers: ['Qué bonita observación.', 'Mm, me quedo pensando.', 'Te leí con atención.'],
      lines: ['Las personas cuentan mucho sin decir nada; solo hay que mirar con calma.', 'Me gusta imaginar qué piensa la gente en el camión o en la fila del súper.', 'Eso que notaste dice que eres de las que se fijan.', 'Mirar con atención es una forma de cariño.', 'Ojalá más personas preguntaran como tú.'] }
  ];

  SU.data.accounts = main.concat(planet);
  SU.data.mainAccounts = main;
  SU.data.planetAccounts = planet;
  SU.data.accountMap = {};
  SU.data.accounts.forEach((a) => { SU.data.accountMap[a.id] = a; });
})(window.SU);
