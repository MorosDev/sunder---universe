/* sonder. — discusiones iniciales de cada foro.
   ago: horas antes de la primera visita a sonder. · after: aparece X horas después (publicación programada).
   Las respuestas usan h: horas después de publicada la discusión (si aún no llega la hora, se muestran después). */
(function (SU) {
  'use strict';
  const D = [
    /* ---------- ENTRE LÍNEAS ---------- */
    { id: 'l-1', planet: 'lineas', type: 'Pregunta', by: 'entrelineas', ago: 50,
      title: '¿Hay algo que siempre hayas querido decir, pero nunca encontraste el momento?',
      body: 'No hace falta decir a quién ni por qué. Solo dejarlo salir, aunque sea un poquito.',
      replies: [
        { by: 'fragmentos', h: 2, t: 'Una vez quise decirle a alguien que su risa me arreglaba los días. Nunca lo dije. Sigo pensando que debí hacerlo.' },
        { by: 'voz_bajita', h: 6, t: 'a veces lo escribo en notas del celular y luego lo borro. creo que eso también cuenta.' }
      ] },
    { id: 'l-2', planet: 'lineas', type: 'Completa la frase', by: 'fragmentos', ago: 30,
      title: '«Pocas personas saben que yo…»',
      body: 'Puede ser algo tierno, algo raro o algo que nunca le has contado a nadie. Aquí nadie juzga.',
      replies: [
        { by: 'voz_bajita', h: 1, t: 'pocas personas saben que me pongo nerviosa cuando alguien me pregunta cómo estoy de verdad.' },
        { by: 'entrelineas', h: 4, t: 'Pocas personas saben que guardo boletos de cosas que me hicieron feliz.' }
      ] },
    { id: 'l-3', planet: 'lineas', type: 'Pregunta', by: 'voz_bajita', ago: 12,
      title: 'cuando no sabes cómo explicar lo que sientes, ¿qué haces?',
      body: 'yo a veces pongo una canción y dejo que ella hable por mí.',
      replies: [
        { by: 'entrelineas', h: 1, t: 'Camino. Algo pasa al caminar que acomoda las palabras.' },
        { by: 'fragmentos', h: 3, t: 'Escribo frases sueltas sin orden. Luego, a veces, tienen sentido.' }
      ] },
    { id: 'l-4', planet: 'lineas', type: 'Hilo', by: 'entrelineas', after: 20,
      title: 'Pensamientos que prefieres guardar para ti (o casi)',
      body: 'Hay pensamientos que son solo nuestros, y está bien. Pero si alguno quiere salir un ratito, este hilo es su lugar.',
      replies: [{ by: 'voz_bajita', h: 2, t: 'el mío: a veces me da miedo que la gente se dé cuenta de cuánto me importa.' }] },

    /* ---------- ESENCIA ---------- */
    { id: 'e-1', planet: 'esencia', type: 'Pregunta', by: 'esencia', ago: 44,
      title: '¿Qué característica tuya tardan en descubrir los demás?',
      body: 'Esa que solo aparece cuando ya hay confianza.',
      replies: [
        { by: 'sin_guion', h: 1, t: 'Que soy rarísima para elegir comida. Pido lo mismo nueve de cada diez veces y la décima es un experimento horrible.' },
        { by: 'otra_version', h: 5, t: 'Que soy más sensible de lo que parezco. Tardan como seis meses en notarlo.' }
      ] },
    { id: 'e-2', planet: 'esencia', type: 'Reto', by: 'sin_guion', ago: 26,
      title: 'Descríbete en tres palabras que no sean adjetivos típicos',
      body: 'Prohibido: «amable», «divertida», «responsable». Queremos cosas como «calcetines disparejos» o «tarde de lluvia».',
      replies: [
        { by: 'esencia', h: 1, t: 'Libreta, playlist, insomnio.' },
        { by: 'otra_version', h: 2, t: 'Taza fría, idea nueva, ventana.' }
      ] },
    { id: 'e-3', planet: 'esencia', type: 'Pregunta', by: 'otra_version', ago: 9,
      title: '¿En qué momentos sientes que eres más tú?',
      body: 'Con qué gente, en qué lugar, haciendo qué. A veces es algo muy pequeño.',
      replies: [
        { by: 'esencia', h: 1, t: 'Cuando canto en el coche y nadie me está viendo.' },
        { by: 'sin_guion', h: 3, t: 'Cuando estoy con mis amigos de siempre y no tengo que pensar qué decir.' }
      ] },
    { id: 'e-4', planet: 'esencia', type: 'Encuesta', by: 'esencia', after: 20,
      title: '¿Qué gusto tuyo defenderías aunque nadie lo entendiera?',
      body: 'Votación rápida. Luego cuéntanos el tuyo.',
      poll: { options: ['Una canción que todos odian', 'Una comida rarísima', 'Una película «mala» que amo', 'Un pasatiempo que nadie entiende'], votes: [1, 1, 1, 0] },
      replies: [{ by: 'sin_guion', h: 1, t: 'Voté por la comida. Papas con helado. No me arrepiento.' }] },

    /* ---------- PEQUEÑOS DETALLES ---------- */
    { id: 'd-1', planet: 'detalles', type: 'Pregunta', by: 'pequenosdetalles', ago: 40,
      title: '¿Qué cosa pequeña puede mejorar tu día inmediatamente?',
      body: 'La mía: que suene la canción que quería justo cuando prendo el radio.',
      replies: [
        { by: 'cafeconestrellas', h: 1, t: 'El primer sorbo de café cuando todavía está calientito.' },
        { by: 'instantes', h: 4, t: 'Encontrarme dinero olvidado en una chamarra. Me siento millonaria cinco minutos.' }
      ] },
    { id: 'd-2', planet: 'detalles', type: 'Reto', by: 'instantes', ago: 22,
      title: 'Describe tu día perfecto solo con detalles cotidianos',
      body: 'Nada de viajes ni lujos. Solo cosas normales que lo harían perfecto.',
      replies: [
        { by: 'pequenosdetalles', h: 2, t: 'Despertar sin alarma, pan dulce, sol en la ventana y que nadie me pida nada hasta las 12.' },
        { by: 'cafeconestrellas', h: 5, t: 'Lluvia, una cobija, una serie que ya vi y un chocolate caliente.' }
      ] },
    { id: 'd-3', planet: 'detalles', type: 'Hilo', by: 'cafeconestrellas', ago: 7,
      title: 'Gustos sencillos que nunca te cansan',
      body: 'Empiezo yo: el olor a tierra mojada. ¿Siguiente?',
      replies: [
        { by: 'instantes', h: 1, t: 'Las sábanas recién lavadas.' },
        { by: 'pequenosdetalles', h: 2, t: 'Que me manden un audio largo contándome un chisme.' }
      ] },
    { id: 'd-4', planet: 'detalles', type: 'Pregunta', by: 'pequenosdetalles', after: 20,
      title: '¿Qué pequeño detalle de alguien recuerdas con cariño?',
      body: 'Un gesto, una frase, una costumbre. Algo chiquito que se quedó.',
      replies: [{ by: 'instantes', h: 2, t: 'Mi abuela siempre me guardaba la última galleta del paquete.' }] },

    /* ---------- HORIZONTES ---------- */
    { id: 'h-1', planet: 'horizontes', type: 'Pregunta', by: 'curiosa', ago: 36,
      title: '¿Qué te gustaría aprender aunque todavía no sepas por dónde empezar?',
      body: 'Idioma, instrumento, habilidad rara… todo vale.',
      replies: [
        { by: 'horizontes', h: 1, t: 'Tocar el piano. Tengo como cuatro tutoriales guardados y cero clases tomadas.' },
        { by: 'mapa_abierto', h: 3, t: 'Japonés. Ya sé decir «gracias» y «perdón», voy bien.' }
      ] },
    { id: 'h-2', planet: 'horizontes', type: 'Imagina', by: 'mapa_abierto', ago: 18,
      title: 'Si pudieras pasar un mes en cualquier lugar, ¿dónde sería?',
      body: 'Un mes completo. Sin preocuparte por dinero ni por pendientes.',
      replies: [
        { by: 'curiosa', h: 1, t: 'Islandia, para ver auroras y preguntarle todo a la gente de ahí.' },
        { by: 'horizontes', h: 4, t: 'Una casita en la playa en Oaxaca, con libros y sin señal.' }
      ] },
    { id: 'h-3', planet: 'horizontes', type: 'Reto', by: 'horizontes', ago: 6,
      title: 'Escribe un sueño como si ya se hubiera cumplido',
      body: 'En pasado. Como si lo contaras dentro de diez años. Se siente diferente, pruébalo.',
      replies: [{ by: 'mapa_abierto', h: 1, t: 'Viajé sola por primera vez y descubrí que me caigo muy bien.' }] },
    { id: 'h-4', planet: 'horizontes', type: 'Pregunta', by: 'horizontes', after: 20,
      title: '¿Qué experiencia te gustaría vivir alguna vez?',
      body: 'Algo que quieras sentir al menos una vez en la vida.',
      replies: [
        { by: 'curiosa', h: 1, t: 'Ver una lluvia de estrellas lejos de la ciudad.' },
        { by: 'mapa_abierto', h: 3, t: 'Subirme a un globo aerostático al amanecer.' }
      ] },

    /* ---------- CONTRAPUNTO ---------- */
    { id: 'c-1', planet: 'contrapunto', type: 'Pregunta', by: 'contrapunto', ago: 48,
      title: '¿Hay alguna opinión que hayas cambiado con el tiempo?',
      body: 'Cambiar de idea es de las cosas más honestas que uno puede hacer.',
      replies: [
        { by: 'otra_perspectiva', h: 2, t: 'Antes pensaba que pedir ayuda era de débiles. Ahora creo que es de listos.' },
        { by: 'ideas_en_mesa', h: 5, t: 'Antes odiaba estar sola. Ahora a veces lo busco.' }
      ] },
    { id: 'c-2', planet: 'contrapunto', type: 'Encuesta', by: 'ideas_en_mesa', ago: 24,
      title: '¿Qué valor es indispensable en una amistad?',
      body: 'Solo puedes elegir uno. Luego defiéndelo en las respuestas.',
      poll: { options: ['Lealtad', 'Honestidad', 'Saber escuchar', 'Sentido del humor'], votes: [1, 1, 1, 0] },
      replies: [
        { by: 'contrapunto', h: 1, t: 'Voté honestidad. Sin eso, lo demás se cae.' },
        { by: 'otra_perspectiva', h: 2, t: 'Yo, saber escuchar. La honestidad sin escucha puede lastimar.' }
      ] },
    { id: 'c-3', planet: 'contrapunto', type: 'Pregunta', by: 'otra_perspectiva', ago: 10,
      title: '¿Qué tema podrías conversar durante horas?',
      body: 'Ese tema que, si alguien lo menciona, ya nadie te calla.',
      replies: [
        { by: 'ideas_en_mesa', h: 1, t: 'Por qué la gente hace lo que hace. Psicología de sobremesa.' },
        { by: 'contrapunto', h: 2, t: 'Si existe vida en otros planetas. Tengo argumentos.' }
      ] },
    { id: 'c-4', planet: 'contrapunto', type: 'Debate amable', by: 'contrapunto', after: 20,
      title: 'Una idea que consideras importante aunque no todos estén de acuerdo',
      body: 'Con respeto, con argumentos y sin pelear. Ese es el chiste de este planeta.',
      replies: [{ by: 'otra_perspectiva', h: 2, t: 'Que está bien no tener una opinión sobre todo.' }] },

    /* ---------- EL REFUGIO ---------- */
    { id: 'r-1', planet: 'refugio', type: 'Pregunta', by: 'refugio', ago: 42,
      title: '¿Qué te ayuda a recuperar un poco de calma?',
      body: 'Sin consejos de libro. Lo que de verdad te funciona.',
      replies: [
        { by: 'pausa', h: 1, t: 'Bañarme con agua calientita y no pensar en nada.' },
        { by: 'sin_juzgar', h: 4, t: 'Ordenar algo pequeño, como un cajón. Siento que ordeno mi cabeza también.' }
      ] },
    { id: 'r-2', planet: 'refugio', type: 'Pregunta', by: 'sin_juzgar', ago: 20,
      title: '¿Qué te gustaría que los demás entendieran mejor?',
      body: 'De ti, de lo que sientes, de cómo funcionas.',
      replies: [
        { by: 'refugio', h: 2, t: 'Que a veces estar callada no significa estar molesta.' },
        { by: 'pausa', h: 5, t: 'Que necesito tiempo para procesar las cosas. No es indiferencia.' }
      ] },
    { id: 'r-3', planet: 'refugio', type: 'Para un día difícil', by: 'pausa', ago: 8,
      title: '¿Qué necesitas escuchar en un día complicado?',
      body: 'Escríbelo aquí. Quizá alguien más también lo necesita.',
      replies: [
        { by: 'refugio', h: 1, t: '«No tienes que poder con todo hoy.»' },
        { by: 'sin_juzgar', h: 2, t: '«Lo estás haciendo mejor de lo que crees.»' }
      ] },
    { id: 'r-4', planet: 'refugio', type: 'Pregunta', by: 'refugio', after: 20,
      title: '¿Qué significa para ti sentirte en confianza?',
      body: 'Con una persona, en un lugar, en un momento.',
      replies: [{ by: 'sin_juzgar', h: 2, t: 'Poder quedarme en silencio sin que se sienta incómodo.' }] },

    /* ---------- CAOS BONITO ---------- */
    { id: 'k-1', planet: 'caos', type: 'Pregunta', by: 'caosbonito', ago: 34,
      title: '¿Cuál es tu gusto más aleatorio?',
      body: 'El más random. El que no tiene explicación.',
      replies: [
        { by: 'randommente', h: 1, t: 'Me gusta el sonido que hacen las bolsas de papas al abrirlas.' },
        { by: 'sin_contexto', h: 2, t: 'Ver videos de gente limpiando alfombras. Es mi meditación.' }
      ] },
    { id: 'k-2', planet: 'caos', type: 'Encuesta', by: 'randommente', ago: 16,
      title: 'Combinación extraña que te gusta',
      body: 'Vota y luego confiesa la tuya.',
      poll: { options: ['Papas con helado', 'Pizza con piña', 'Mango con chile y sal', 'Galletas con queso'], votes: [1, 0, 2, 0] },
      replies: [{ by: 'caosbonito', h: 1, t: 'Mango con chile ni siquiera es raro, es patrimonio nacional.' }] },
    { id: 'k-3', planet: 'caos', type: 'Reto', by: 'sin_contexto', ago: 5,
      title: 'Inventa una tradición absurda',
      body: 'Algo que, si fuera oficial, la gente haría cada año sin cuestionarlo.',
      replies: [
        { by: 'randommente', h: 1, t: 'El Día de Saludar a las Palomas. Todos salimos y les decimos buenos días con respeto.' },
        { by: 'caosbonito', h: 2, t: 'El Martes de Calcetines Disparejos Obligatorios.' }
      ] },
    { id: 'k-4', planet: 'caos', type: 'Pregunta', by: 'caosbonito', after: 20,
      title: '¿Qué cosa te hace reír aunque sea una tontería?',
      body: 'Ese chiste, ese video, ese recuerdo que te hace reír sola en público.',
      replies: [{ by: 'sin_contexto', h: 1, t: 'Un perro que vi una vez corriendo con un pan entero en la boca, orgullosísimo.' }] },

    /* ---------- SONDER ---------- */
    { id: 's-1', planet: 'sonder', type: 'Pregunta', by: 'sonder_archive', ago: 54,
      title: '¿Qué te gustaría que las personas preguntaran más a menudo?',
      body: 'Esa pregunta que casi nadie hace, pero que te gustaría responder.',
      replies: [
        { by: 'observadora', h: 2, t: '«¿Qué estás pensando ahora mismo?» Casi nadie lo pregunta en serio.' },
        { by: 'miles_de_mundos', h: 4, t: '«¿Qué te emociona últimamente?»' }
      ] },
    { id: 's-2', planet: 'sonder', type: 'Historias', by: 'observadora', ago: 28,
      title: 'Algo que descubriste de alguien cuando te tomaste el tiempo de conocerlo',
      body: 'Esas sorpresas que solo llegan con paciencia.',
      replies: [
        { by: 'sonder_archive', h: 1, t: 'Un señor muy serio de mi trabajo resultó escribir poemas para su esposa todos los domingos.' },
        { by: 'miles_de_mundos', h: 3, t: 'Una compañera callada tenía la risa más escandalosa del mundo. Solo había que contarle el chiste correcto.' }
      ] },
    { id: 's-3', planet: 'sonder', type: 'Pregunta', by: 'miles_de_mundos', ago: 11,
      title: '¿Qué significa para ti conocer realmente a una persona?',
      body: '¿Es saber sus gustos? ¿Sus miedos? ¿Cómo toma el café?',
      replies: [
        { by: 'observadora', h: 1, t: 'Saber qué le pasa sin que me lo diga.' },
        { by: 'sonder_archive', h: 2, t: 'Conocer sus historias pequeñas, no solo las grandes.' }
      ] },
    { id: 's-4', planet: 'sonder', type: 'Pregunta', by: 'sonder_archive', after: 20,
      title: '¿Qué historia de alguien te gustaría conocer?',
      body: 'Puede ser de alguien cercano, de un desconocido o de alguien que ya no está.',
      replies: [{ by: 'miles_de_mundos', h: 2, t: 'La de la señora que vende flores en la esquina. Siempre sonríe como si supiera algo.' }] }
  ];
  SU.data.discussions = D;
  SU.data.discussionMap = {};
  D.forEach((d) => { SU.data.discussionMap[d.id] = d; });
})(window.SU);
