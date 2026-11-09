/* sonder. — los ocho planetas */
(function (SU) {
  'use strict';
  SU.data.planets = [
    {
      id: 'lineas', name: 'Entre Líneas', concept: 'Lo que a veces no sabemos decir.',
      desc: 'Un espacio para expresar pensamientos, sentimientos, dudas y cosas que no siempre encontramos cómo comunicar.',
      x: -880, y: -520, r: 108, style: 'lines',
      c1: '#d4ceff', c2: '#4a4585', glow: '#a99ff0',
      reaction: { icon: '❝', label: 'Te leo' },
      accounts: ['entrelineas', 'fragmentos', 'voz_bajita'],
      welcome: { by: 'entrelineas', text: 'Bienvenida a Entre Líneas. Aquí se puede escribir a medias, borrar y volver a intentar. Nadie te va a pedir que lo expliques todo.' },
      featured: [
        { by: 'fragmentos', text: 'Hay cosas que no se dicen porque no caben en la boca. Por eso existen las cartas.' },
        { by: 'voz_bajita', text: 'escribir es otra forma de hablar bajito.' }
      ],
      followUps: ['¿Te costó escribirlo?', '¿Lo habías dicho antes en voz alta?', '¿Hay algo más que quieras dejar aquí?'],
      threadWelcomes: ['Gracias por abrir este espacio. Aquí cabe todo lo que no se dice fácil.', 'Qué buena discusión para este planeta. Me quedo a leer.'],
      discoveries: [
        { id: 'l1', trigger: 'firstReply', by: 'voz_bajita', text: 'ya escribiste aquí. eso cuenta mucho. este planeta se siente un poquito menos callado.' },
        { id: 'l2', trigger: 'revisit', by: 'entrelineas', text: 'Volviste. Hay lugares que se entienden mejor la segunda vez.' }
      ]
    },
    {
      id: 'esencia', name: 'Esencia', concept: 'Lo que te hace ser tú.',
      desc: 'Un espacio para hablar de personalidad, gustos, características, rarezas y autenticidad.',
      x: -110, y: -1050, r: 124, style: 'essence',
      c1: '#c99bff', c2: '#33155f', glow: '#a56bff',
      reaction: { icon: '✦', label: 'Muy tú' },
      accounts: ['esencia', 'sin_guion', 'otra_version'],
      welcome: { by: 'esencia', text: 'Bienvenida a Esencia. Este planeta no tiene una definición de ti: tiene espacio para que tú decidas qué contar.' },
      featured: [
        { by: 'esencia', text: 'Nadie más en el universo tiene tu combinación exacta de cosas.' },
        { by: 'otra_version', text: 'Ser tú no es un lugar al que se llega. Es una forma de caminar.' }
      ],
      followUps: ['¿Desde cuándo eres así?', '¿Quién fue la primera persona en notarlo?', '¿Qué más tendría que saber alguien para conocerte de verdad?'],
      threadWelcomes: ['¡Qué buena pregunta! Este planeta ya se siente más tuyo.', 'Me encanta que hayas abierto esto. Aquí todas las rarezas son bienvenidas.'],
      discoveries: [
        { id: 'e1', trigger: 'firstReply', by: 'esencia', text: 'Lo que escribiste quedó brillando un poco en este planeta. Así funciona aquí.' },
        { id: 'e2', trigger: 'firstThread', by: 'sin_guion', text: '¡Abriste tu propia discusión! Oficialmente este planeta ya tiene algo muy tuyo.' }
      ]
    },
    {
      id: 'detalles', name: 'Pequeños Detalles', concept: 'Las cosas pequeñas también importan.',
      desc: 'Para compartir gustos cotidianos, pequeñas alegrías, costumbres y momentos que hacen especial un día.',
      x: 760, y: -720, r: 82, style: 'details',
      c1: '#ffd3c4', c2: '#8c4a58', glow: '#f0a99a',
      reaction: { icon: '❀', label: 'Qué bonito' },
      accounts: ['pequenosdetalles', 'cafeconestrellas', 'instantes'],
      welcome: { by: 'pequenosdetalles', text: '¡Bienvenida a Pequeños Detalles! Aquí celebramos el café bien hecho, la canción justa y el olor a lluvia. Pasa, ponte cómoda.' },
      featured: [
        { by: 'instantes', text: 'El día de hoy tuvo un buen momento. A veces con uno basta.' },
        { by: 'cafeconestrellas', text: 'Los detalles no son pequeños. Son concentrados.' }
      ],
      followUps: ['¿Cuándo fue la última vez que te pasó?', '¿Qué otro detalle agregarías a la lista?', '¿Lo compartes con alguien o es solo tuyo?'],
      threadWelcomes: ['¡Qué bonita discusión! Ya quiero leer los detalles de todos.', 'Esto es justo lo que necesitaba este planeta hoy.'],
      discoveries: [
        { id: 'd1', trigger: 'firstReply', by: 'instantes', text: 'Tu respuesta acaba de entrar a mi colección de instantes favoritos.' },
        { id: 'd2', trigger: 'revisit', by: 'pequenosdetalles', text: 'Pequeño detalle: regresaste. Lo notamos 🤍' }
      ]
    },
    {
      id: 'horizontes', name: 'Horizontes', concept: 'Todo lo que todavía queda por descubrir.',
      desc: 'Un espacio para compartir sueños, aspiraciones, curiosidades, intereses, proyectos y nuevas experiencias.',
      x: 1180, y: 60, r: 118, style: 'horizon',
      c1: '#9fe6ea', c2: '#143f5c', glow: '#6fd0e0',
      reaction: { icon: '△', label: 'Vamos' },
      accounts: ['horizontes', 'mapa_abierto', 'curiosa'],
      welcome: { by: 'horizontes', text: 'Bienvenida a Horizontes. Desde aquí se ve lejos. Trae tus sueños, incluso los que todavía no sabes cómo empezar.' },
      featured: [
        { by: 'horizontes', text: 'Lo que todavía no conoces también es parte de tu historia.' },
        { by: 'curiosa', text: 'Las preguntas son mapas hacia lugares nuevos.' }
      ],
      followUps: ['¿Qué sería lo primero que harías?', '¿Qué te detiene, si es que algo te detiene?', '¿Desde cuándo lo sueñas?'],
      threadWelcomes: ['¡Uff, qué buen tema para mirar lejos!', 'Me encanta. Que se llene de sueños esta discusión.'],
      discoveries: [
        { id: 'h1', trigger: 'firstReply', by: 'horizontes', text: 'Cada cosa que escribes aquí es un punto más en el horizonte.' },
        { id: 'h2', trigger: 'firstThread', by: 'curiosa', text: '¡Una pregunta tuya! Ahora la que tiene curiosidad soy yo.' }
      ]
    },
    {
      id: 'contrapunto', name: 'Contrapunto', concept: 'Pensar también es conocerse.',
      desc: 'Un espacio para expresar opiniones, ideas, principios y maneras de interpretar el mundo.',
      x: 700, y: 830, r: 104, style: 'counter',
      c1: '#eceef5', c2: '#262a3c', glow: '#c8cbe0',
      reaction: { icon: '⇄', label: 'Buen punto' },
      accounts: ['contrapunto', 'otra_perspectiva', 'ideas_en_mesa'],
      welcome: { by: 'contrapunto', text: 'Bienvenida a Contrapunto. Aquí se piensa en voz alta, se cambia de opinión y se conversa sin pelear.' },
      featured: [
        { by: 'contrapunto', text: 'Pensar distinto no es estar en contra. Es agregar otra voz.' },
        { by: 'ideas_en_mesa', text: 'Una buena conversación no termina con un ganador.' }
      ],
      followUps: ['¿Qué te hizo pensar así?', '¿Alguna vez alguien te hizo dudarlo?', '¿Cómo se lo explicarías a alguien que piensa distinto?'],
      threadWelcomes: ['Tema en la mesa. A ver qué sale de aquí.', 'Buena discusión. Me gusta que nos hagas pensar.'],
      discoveries: [
        { id: 'c1', trigger: 'firstReply', by: 'ideas_en_mesa', text: 'Tu idea ya está en la mesa. Y se ve bien ahí.' },
        { id: 'c2', trigger: 'revisit', by: 'otra_perspectiva', text: 'Volver a una conversación también es verla desde otra perspectiva.' }
      ]
    },
    {
      id: 'refugio', name: 'El Refugio', concept: 'Un espacio donde no hace falta aparentar.',
      desc: 'Un lugar amable para expresar preocupaciones, cansancio o dudas, o simplemente tener un momento de calma.',
      x: -150, y: 1080, r: 132, style: 'refuge',
      c1: '#a9c2ff', c2: '#1b2a5e', glow: '#7f9df0',
      reaction: { icon: '⌂', label: 'Aquí estoy' },
      accounts: ['refugio', 'pausa', 'sin_juzgar'],
      welcome: { by: 'refugio', text: 'Bienvenida al Refugio. Aquí no hace falta aparentar nada. Puedes hablar, o solo quedarte un rato.' },
      featured: [
        { by: 'refugio', text: 'Si hoy fue pesado, aquí puedes dejarlo un rato.' },
        { by: 'pausa', text: 'No todo se arregla hoy. Y está bien.' }
      ],
      followUps: ['¿Hay algo pequeño que puedas hacer por ti hoy?', '¿Cómo te sientes después de escribirlo?', '¿Hay alguien con quien te sientas así de tranquila?'],
      threadWelcomes: ['Gracias por abrir este espacio. Aquí se escucha con calma.', 'Qué bueno que exista esta discusión. Nadie tiene prisa aquí.'],
      discoveries: [
        { id: 'r1', trigger: 'firstReply', by: 'refugio', text: 'Gracias por confiar en este lugar. Puedes volver cuando quieras.' },
        { id: 'r2', trigger: 'revisit', by: 'pausa', text: 'Regresaste al Refugio. Ojalá hoy sea un día más ligero.' }
      ]
    },
    {
      id: 'caos', name: 'Caos Bonito', concept: 'Porque no todo tiene que ser profundo.',
      desc: 'Para compartir ocurrencias, gustos aleatorios, humor, preguntas espontáneas y aspectos inesperados de la personalidad.',
      x: -1020, y: 640, r: 110, style: 'chaos',
      c1: '#ffb3d1', c2: '#5b2a7a', glow: '#ff9fd0',
      reaction: { icon: '✺', label: 'JAJA' },
      accounts: ['caosbonito', 'sin_contexto', 'randommente'],
      welcome: { by: 'caosbonito', text: 'BIENVENIDA A CAOS BONITO. Aquí las ideas raras son ciudadanas de primera. Ninguna pregunta es demasiado absurda.' },
      featured: [
        { by: 'randommente', text: 'Los pingüinos le regalan piedritas a quien les gusta. Esa es la energía de este planeta.' },
        { by: 'sin_contexto', text: '«no era una cuchara, era un sentimiento» — alguien, sin contexto.' }
      ],
      followUps: ['¿Quién más sabe de esto?', '¿Desde cuándo pasa esto?', '¿Cuál sería el siguiente nivel de esta idea?'],
      threadWelcomes: ['UNA NUEVA DISCUSIÓN CAÓTICA. Excelente.', 'Ok, esto va a ponerse bueno.'],
      discoveries: [
        { id: 'k1', trigger: 'firstReply', by: 'caosbonito', text: 'Nivel de caos del planeta: aumentó un 30% gracias a ti. Felicidades.' },
        { id: 'k2', trigger: 'firstThread', by: 'randommente', text: 'Abriste una discusión en Caos Bonito. Ahora eres parte del comité oficial de cosas random.' }
      ]
    },
    {
      id: 'sonder', name: 'Sonder', concept: 'Cada persona es un universo.',
      desc: 'Para reflexionar sobre identidad, experiencias humanas, relaciones entre personas y las historias que desconocemos de los demás.',
      x: -1400, y: -60, r: 138, style: 'sonder',
      c1: '#4a4f96', c2: '#0b0d2a', glow: '#ffd9a0',
      reaction: { icon: '✶', label: 'Un mundo' },
      accounts: ['sonder_archive', 'miles_de_mundos', 'observadora'],
      welcome: { by: 'sonder_archive', text: 'Bienvenida a Sonder. Sonder es darse cuenta de que cada persona que pasa a tu lado tiene una vida tan compleja como la tuya. Aquí hablamos de eso.' },
      featured: [
        { by: 'sonder_archive', text: 'Sonder (s.): darse cuenta de que cada persona con la que te cruzas vive una vida tan intensa y compleja como la tuya.' },
        { by: 'observadora', text: 'Cada ventana iluminada de noche es una historia que nunca vas a leer.' }
      ],
      followUps: ['¿Quién te enseñó a mirar así a la gente?', '¿Qué historia tuya te gustaría que alguien preguntara?', '¿Qué crees que la gente no sabe de ti a primera vista?'],
      threadWelcomes: ['Una discusión nueva para el archivo. Gracias.', 'Qué bonita pregunta. Este planeta vive de preguntas así.'],
      discoveries: [
        { id: 's1', trigger: 'firstReply', by: 'miles_de_mundos', text: 'Un mundo más ha dejado su huella en el archivo.' },
        { id: 's2', trigger: 'revisit', by: 'sonder_archive', text: 'Pista del archivo: en el centro del mapa hay una luz que se enciende con cada mundo que visitas.' }
      ]
    }
  ];
  SU.data.planetMap = {};
  SU.data.planets.forEach((p) => { SU.data.planetMap[p.id] = p; });
  SU.planet = (id) => SU.data.planetMap[id];
})(window.SU);
