/* sonder. — respuestas preparadas y detección sencilla de temas.
   Las claves se comparan sin acentos; coinciden con el inicio de una palabra (p. ej. "cansad" → cansada). */
(function (SU) {
  'use strict';

  SU.data.topics = [
    { id: 'recuerdo', k: ['recuerdo', 'recuerdos', 'me acuerdo', 'cuando era nina', 'cuando era chica', 'de nina', 'de pequena', 'de chiquita', 'infancia', 'hace anos', 'nostalgi'],
      lines: ['Los recuerdos así son como fotos que nadie más puede ver.', 'Qué bonito que ese recuerdo siga tan vivo.', 'Hay recuerdos que regresan justo cuando hacen falta.', 'Me gusta cómo los recuerdos explican partes de nosotros.'] },
    { id: 'sueno', k: ['sueno', 'suenos', 'sonar', 'me gustaria', 'quisiera', 'algun dia', 'meta', 'metas', 'futuro', 'lograr', 'quiero ser', 'planes', 'proyecto'],
      lines: ['Lo que deseas también dice mucho de quién eres.', 'Ojalá ese sueño se vaya acercando poco a poco.', 'Decirlo en voz alta (o escribirlo) ya es un primer paso.', 'Ese tipo de sueños merecen tomarse en serio.'] },
    { id: 'familia', k: ['mama', 'papa', 'familia', 'hermano', 'hermana', 'abuel', 'tia ', 'tio ', 'prima', 'primo', 'mami', 'papi'],
      lines: ['La familia deja huellas en todo lo que somos, de muchas formas.', 'Qué bonito cuando las personas de casa también son refugio.', 'Las personas con las que crecemos se quedan en pequeños gestos nuestros.'] },
    { id: 'amistad', k: ['amiga', 'amigo', 'amistad', 'mejor amiga', 'compas', 'companer'],
      lines: ['Las amistades buenas son de las cosas más valiosas que hay.', 'Una buena amistad es como un hogar que se puede llevar a todos lados.', 'Qué bonito tener personas así cerca.'] },
    { id: 'amor', k: ['amor', 'enamor', 'pareja', 'novio', 'novia', 'carino', 'corazon', 'romant', 'crush'],
      lines: ['El cariño se nota en los detalles, casi nunca en las grandes palabras.', 'Querer bonito es de las cosas más valientes.', 'Qué bonito hablar de cariño sin miedo.'] },
    { id: 'miedo', k: ['miedo', 'nervios', 'ansiedad', 'ansios', 'me preocupa', 'preocup', 'insegur', 'temor', 'me da pena'],
      lines: ['Sentir miedo no quita que seas valiente.', 'Las preocupaciones pesan un poco menos cuando se escriben.', 'Está bien no tenerlo todo resuelto.'] },
    { id: 'cansancio', k: ['cansad', 'agotad', 'estres', 'sin energia', 'sin ganas', 'desvel', 'abrumad', 'harta', 'pesad'],
      lines: ['Descansar no es rendirse, es recargar.', 'Ojalá hoy te toque un rato de calma de verdad.', 'A veces el cuerpo pide pausa antes que la mente.', 'Los días pesados también se terminan.'] },
    { id: 'triste', k: ['triste', 'tristeza', 'llorar', 'llore', 'lloro', 'dolio', 'me duele', 'extrano', 'extranar', 'sola ', 'vacio'],
      lines: ['Gracias por dejar aquí algo que pesa. No tienes que cargarlo sola.', 'Está bien estar triste un rato. No tienes que apresurarte.', 'Extrañar es una forma de seguir queriendo.'] },
    { id: 'feliz', k: ['feliz', 'felicidad', 'contenta', 'alegre', 'alegria', 'emocionad', 'me encanto', 'genial', 'increible'],
      lines: ['Qué bonito leerte así de contenta.', 'La alegría se contagia hasta por escrito.', 'Guarda este momento, de esos hacen falta más.'] },
    { id: 'musica', k: ['musica', 'cancion', 'cantar', 'canto', 'banda', 'artista', 'playlist', 'escuchar', 'album', 'concierto', 'spotify'],
      lines: ['La música tiene esa forma de decir lo que uno no sabe cómo.', 'Hay canciones que se vuelven lugares.', 'Ahora quiero saber qué canción pondrías en este momento.'] },
    { id: 'comida', k: ['comida', 'comer', 'cafe', 'chocolate', 'pan ', 'pan dulce', 'tacos', 'pizza', 'postre', 'helado', 'cocinar', 'dulce', 'galleta', 'sushi', 'pastel'],
      lines: ['La comida que nos gusta es una forma de cariño propio.', 'Esto me dio hambre inmediatamente.', 'Hay sabores que se sienten como abrazo.'] },
    { id: 'viaje', k: ['viaje', 'viajar', 'pais', 'ciudad', 'playa', 'mar ', 'montana', 'avion', 'japon', 'europa', 'paris', 'corea', 'conocer el mundo'],
      lines: ['Hay lugares que uno ya conoce antes de ir, de tanto imaginarlos.', 'Ojalá ese lugar te encuentre pronto.', 'Viajar es una forma de conocerse en otro escenario.'] },
    { id: 'cielo', k: ['cielo', 'luna', 'estrella', 'lluvia', 'atardecer', 'amanecer', 'flores', 'arbol', 'naturaleza', 'nubes', 'noche'],
      lines: ['El cielo tiene una forma muy suya de acomodar las cosas.', 'Qué bonito detenerse a mirar eso.', 'Hay algo en la naturaleza que pone todo en su tamaño real.'] },
    { id: 'libros', k: ['libro', 'leer', 'lectura', 'novela', 'poema', 'poesia', 'escribir', 'escritura', 'escribo'],
      lines: ['Las palabras que nos encuentran en el momento justo se quedan para siempre.', 'Leer y escribir son formas de conocerse por dentro.', 'Ojalá esas palabras te sigan acompañando.'] },
    { id: 'arte', k: ['dibuj', 'pintar', 'pintura', 'arte', 'fotografia', 'crear', 'disenar', 'manualidad', 'bailar', 'baile'],
      lines: ['Crear algo es dejar un pedacito de ti afuera.', 'Qué bonito tener una forma de expresarte así.', 'El arte no tiene que ser perfecto para ser importante.'] },
    { id: 'animales', k: ['perro', 'perrit', 'gato', 'gatit', 'mascota', 'animal', 'conejo', 'pajaro', 'hamster'],
      lines: ['Los animales tienen una forma de querer que no pide nada.', 'Ahora necesito saber cómo se llama.', 'Las mascotas son de las mejores compañías que existen.'] },
    { id: 'humor', k: ['jaja', 'jeje', 'risa', 'reir', 'chiste', 'gracioso', 'tonteria', 'meme', 'xd'],
      lines: ['Reírse de cosas pequeñas es un superpoder.', 'Esto me sacó una sonrisa, gracias.', 'La risa es de las cosas que mejor se comparten.'] },
    { id: 'escuela', k: ['escuela', 'clase', 'universidad', 'uni ', 'examen', 'tarea', 'trabajo', 'maestr', 'estudiar', 'carrera', 'prepa'],
      lines: ['Ojalá todo eso que estás aprendiendo te lleve a donde quieres.', 'Las responsabilidades pesan, pero también dicen mucho de lo que estás construyendo.', 'Ánimo con eso, en serio.'] },
    { id: 'cambio', k: ['cambie', 'cambio', 'cambiar', 'crecer', 'creci', 'aprendi', 'antes pensaba', 'madur'],
      lines: ['Cambiar de idea también es una forma de crecer.', 'Qué bonito poder ver cuánto has cambiado.', 'Las personas que se permiten cambiar son las más interesantes.'] },
    { id: 'personas', k: ['conocer', 'persona', 'gente', 'alguien', 'historia', 'los demas'],
      lines: ['Conocer a alguien de verdad lleva tiempo, y ese tiempo vale la pena.', 'Las personas son mucho más de lo que muestran a primera vista.', 'Qué bonito interesarse por las historias de los demás.'] },
    { id: 'calma', k: ['calma', 'paz', 'tranquil', 'respirar', 'silencio', 'descansar'],
      lines: ['Esa calma que describes suena a un lugar muy bonito.', 'La paz también se construye con cosas sencillas.', 'Ojalá esa tranquilidad te encuentre seguido.'] }
  ];

  /* Si alguien escribe algo que suena a riesgo real, las cuentas no fingen poder ayudar. */
  SU.data.crisis = {
    k: ['suicid', 'matarme', 'quitarme la vida', 'hacerme dano', 'no quiero vivir', 'quiero morir', 'morirme', 'cortarme', 'lastimarme'],
    text: 'Lo que escribiste importa muchísimo. Soy una cuenta ficticia y no puedo acompañarte como lo haría una persona. Si estás pasando por algo así, por favor habla hoy con alguien de confianza o llama a la Línea de la Vida: 800 911 2000 (México, gratis, 24 h).'
  };

  /* Reglas que se aplican en todas las conversaciones de mensajes directos */
  SU.data.dmGlobal = [
    { k: ['eres real', 'eres un bot', 'eres bot', 'bot', 'persona real', 'eres ia', 'inteligencia artificial', 'eres una persona', 'quien eres', 'eres humano', 'chatgpt'],
      r: 'Soy una cuenta ficticia, parte de esta experiencia. Mis respuestas están preparadas de antemano: nadie está escribiendo en tiempo real. 🙂' },
    { k: ['quien hizo', 'quien creo', 'quien la hizo', 'quien te hizo', 'creador', 'quien programo', 'quien diseno', 'de quien es'],
      r: 'Eso no me toca contarlo a mí. Pero dicen que la respuesta está en el centro de cierto mapa.' },
    { k: ['gracias', 'grax', 'thank'], r: '¡De nada! 🤍', soft: true },
    { k: ['hola', 'holi', 'buenas', 'que onda', 'hey'], r: '¡Hola! 👋', soft: true }
  ];

  /* Respuestas cortas cuando la usuaria responde a un comentario */
  SU.data.thanks = ['🤍', '¡Gracias a ti!', 'Jaja sí', 'Totalmente 🙌', 'Me alegra que te haya gustado.', '✨'];
})(window.SU);
