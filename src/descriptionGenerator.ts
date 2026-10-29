export interface DescriptionParams {
  model: string;
  price?: string | number;
  currencySymbol?: string;
  storage?: string;
  condition?: string;
  battery?: string;
  status?: string;
  notes?: string;
  tone?: string;
  length?: string;
  storeName?: string;
}

export function buildPromptAndSystemInstruction(params: DescriptionParams) {
  const {
    model,
    price,
    currencySymbol = '₡',
    storage,
    condition,
    battery,
    status,
    notes,
    tone = 'cercano',
    length = 'breve',
    storeName = 'Pixel Cero',
  } = params;

  const toneInstructions: Record<string, string> = {
    cercano:
      'Enfoque de Asesor Cercano y Confiable: Escribe con calidez, empatía y total honestidad, como un vendedor experto y amable de Costa Rica que le cuenta a un cliente de confianza cómo está realmente el artículo y por qué le va a encantar.',
    experiencia:
      'Enfoque en la Experiencia de Uso Diario: Escribe con un estilo fluido, moderno y práctico, centrándote en cómo se siente usar este artículo todos los días y la tranquilidad que brinda en la rutina.',
    oportunidad:
      'Enfoque en Oportunidad y Valor Inteligente: Escribe con entusiasmo natural y persuasivo, resaltando por qué esta unidad específica vale cada colón por su estado y el valor que representa.',
    directo:
      'Enfoque Directo, Transparente y Humano: Ve al grano con naturalidad y cercanía, dejando claros los puntos fuertes del estado real del artículo sin adornos innecesarios, ideal para quien busca comprar con total seguridad.',
  };

  const lengthInstructions: Record<string, string> = {
    breve:
      'Extensión Breve y Fluida: Redacta un único párrafo corto y ágil de 2 a 3 oraciones (aproximadamente 35 a 55 palabras) que se lea rápido y con ritmo natural en el catálogo.',
    parrafo:
      'Extensión de Párrafo Completo: Redacta un párrafo envolvente y bien hilado de 4 a 5 oraciones (aproximadamente 65 a 95 palabras) que transmita confianza y detalle cómo se conserva y se disfruta esta unidad.',
    puntos:
      'Formato de Frase + Puntos Clave: Inicia con una frase cálida y humana de 1 a 2 líneas, seguida de un salto de línea y 3 viñetas cortas (usando •) redactadas de forma conversacional y cercana (no como una lista fría de especificaciones).',
  };

  const selectedTone = toneInstructions[tone] || toneInstructions.cercano;
  const selectedLength = lengthInstructions[length] || lengthInstructions.breve;

  const formattedPrice =
    price && !isNaN(Number(price)) && Number(price) > 0
      ? `${currencySymbol}${Number(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
      : 'No especificado';

  const cleanNotes = notes ? String(notes).trim() : '';

  const systemInstruction = `Eres el redactor humano principal de "${storeName}", una tienda especializada en iPhones, dispositivos y accesorios Apple seleccionados con alto estándar de calidad.
Tu tarea es redactar la descripción de venta para un artículo basándote en los datos ingresados en la ficha.

REGLAS ESTRICTAS DE NATURALIDAD HUMANA (ANTI-IA):
1. Debe sonar 100% escrito por una persona real, amable y conocedora. Nunca uses frases robóticas o clichés de inteligencia artificial como: "¡Descubre!", "En el vertiginoso mundo actual", "No busques más", "Lleva tu experiencia al siguiente nivel", "Una joya tecnológica", "Redefine la excelencia", "Potencia sin límites" ni signos de exclamación exagerados.
2. No hagas un listado frío ni repitas mecánicamente los datos técnicos como un robot; traduce esos datos en beneficios reales y cotidianos. Si el artículo es un accesorio (como un adaptador, cable o AirPods), adáptate a su función real sin hablar de memoria ni cámaras.
3. Si el administrador incluyó apuntes o notas previas sobre esta unidad (como accesorios incluidos, detalles estéticos, origen de la batería, único dueño, garantía, etc.), intégralos de manera protagónica, fiel y fluida en la redacción.
4. Si NO hay apuntes adicionales del administrador, NO inventes accesorios (no digas que incluye caja o cargador si no se menciona en los apuntes). Basa tu redacción únicamente en las características reales proporcionadas.
5. Usa español natural, neutro-cálido (adecuado para clientes en Costa Rica y Latinoamérica, tratando al lector de "tú" o "vos/usted" suave sin exagerar modismos).
6. Devuelve ÚNICAMENTE el texto final de la descripción, sin títulos, sin comillas al inicio ni al final y sin frases introductorias como "Aquí tienes la descripción:".`;

  const prompt = `Datos recién ingresados del artículo en la ficha:
- Modelo: ${model}
- Capacidad de almacenamiento: ${storage || 'No especificada'}
- Condición estética: ${condition || 'Excelente'}
- Salud de batería: ${battery || 'No especificada'}
- Precio: ${formattedPrice}
- Disponibilidad: ${status || 'Disponible'}
${
  cleanNotes
    ? `- Apuntes / observaciones específicas del administrador sobre esta unidad (INTEGRAR OBLIGATORIAMENTE): "${cleanNotes}"`
    : '- Apuntes adicionales del administrador: Ninguno (basarse solo en los datos de arriba sin inventar accesorios extra).'
}

Instrucción de enfoque elegida por el administrador:
${selectedTone}

Instrucción de extensión y formato elegida por el administrador:
${selectedLength}

Redacta ahora la descripción humana de venta para colocarla directamente en el campo de descripción del artículo:`;

  return { systemInstruction, prompt };
}

export function buildHumanFallbackDescription(params: DescriptionParams): string {
  const model = (params.model || 'iPhone').trim();
  const rawStorage = (params.storage || '').trim();
  const isIgnoreStorage =
    !rawStorage ||
    /^(n\/a|na|no aplica|ninguna|-|0)$/i.test(rawStorage);
  const storage = isIgnoreStorage ? '' : rawStorage;

  const condition = (params.condition || 'Excelente').trim();
  const rawBattery = (params.battery || '').trim();
  const isIgnoreBattery =
    !rawBattery ||
    /^(n\/a|na|no aplica|ninguna|-|0)$/i.test(rawBattery);
  const battery = isIgnoreBattery
    ? ''
    : rawBattery.includes('%')
      ? rawBattery
      : /^\d+$/.test(rawBattery)
        ? `${rawBattery}%`
        : rawBattery;

  const cleanNotes = (params.notes || '').trim();
  const tone = params.tone || 'cercano';
  const length = params.length || 'breve';

  const modelLower = model.toLowerCase();
  const isAccessory =
    /(adaptador|cargador|cable|funda|estuche|case|magsafe|airpods|airtag|pencil|correa|protector|vidrio|cubo)/i.test(
      modelLower
    );

  const batteryNum = parseInt(battery.replace(/[^0-9]/g, ''), 10);
  const conditionLower = condition.toLowerCase();

  let formattedNotes = '';
  if (cleanNotes) {
    const normalized = cleanNotes.charAt(0).toLowerCase() + cleanNotes.slice(1);
    const endsWithPunctuation = /[.!?]$/.test(normalized);
    formattedNotes = endsWithPunctuation ? normalized : `${normalized}.`;
  }

  const pick = <T,>(options: T[]): T => options[Math.floor(Math.random() * options.length)];

  // Redacción especializada si es un accesorio (ej. Adaptador USB-C 20W, Cable, AirPods, etc.)
  if (isAccessory) {
    const accConditionPhrase =
      conditionLower.includes('nuevo') || conditionLower.includes('sellado')
        ? 'totalmente nuevo y listo para estrenar con la tranquilidad de usar un accesorio confiable'
        : `en condición ${conditionLower}, muy bien cuidado y funcionando al 100%`;

    if (length === 'puntos') {
      const intros: Record<string, string[]> = {
        cercano: [
          `Contar con un ${model} confiable hace toda la diferencia para cuidar tus dispositivos Apple todos los días.`,
          `Este ${model} es el complemento ideal para usar tus equipos con total tranquilidad y un rendimiento seguro.`,
        ],
        experiencia: [
          `Diseñado para integrarse de forma práctica en tu rutina diaria, este ${model} ofrece una respuesta estable y segura en cada uso.`,
        ],
        oportunidad: [
          `Excelente oportunidad para adquirir tu ${model} ${accConditionPhrase}, cuidando tanto tu inversión como tus dispositivos.`,
        ],
        directo: [
          `${model} ${accConditionPhrase}, verificado y disponible para entrega inmediata.`,
        ],
      };
      const intro = pick(intros[tone] || intros.cercano);
      const bullets = [
        `• Estado del artículo: Se encuentra ${accConditionPhrase}.`,
        `• Compatibilidad y seguridad: Ideal para proteger la vida útil de tus equipos Apple en el uso diario.`,
        cleanNotes
          ? `• Detalles adicionales: ${cleanNotes.charAt(0).toUpperCase() + cleanNotes.slice(1)}${/[.!?]$/.test(cleanNotes) ? '' : '.'}`
          : `• Entrega inmediata: Listo para retirar o enviar hoy mismo.`,
      ];
      return `${intro}\n\n${bullets.join('\n')}`;
    }

    if (length === 'breve') {
      const briefs: Record<string, string[]> = {
        cercano: [
          `Este ${model} se encuentra ${accConditionPhrase}, ideal para acompañar y cuidar tus equipos Apple en el día a día. ${
            cleanNotes ? `Además, toma en cuenta que ${formattedNotes}` : 'Listo para entrega inmediata con total respaldo.'
          }`,
        ],
        experiencia: [
          `Suma practicidad y seguridad a tu rutina con este ${model}, que está ${accConditionPhrase}. ${
            cleanNotes ? `Un detalle importante: ${formattedNotes}` : 'Funciona de maravilla desde el primer momento.'
          }`,
        ],
        oportunidad: [
          `Excelente opción para llevarte este ${model} ${accConditionPhrase} a un gran precio. ${
            cleanNotes ? `Destaca además porque ${formattedNotes}` : 'Una compra práctica y segura para tus dispositivos.'
          }`,
        ],
        directo: [
          `${model} ${accConditionPhrase}. ${
            cleanNotes
              ? `Observación: ${cleanNotes.charAt(0).toUpperCase() + cleanNotes.slice(1)}${/[.!?]$/.test(cleanNotes) ? '' : '.'}`
              : 'Revisado y disponible para entrega inmediata.'
          }`,
        ],
      };
      return pick(briefs[tone] || briefs.cercano);
    }

    // Párrafo completo para accesorios
    const paragraphs: Record<string, string[]> = {
      cercano: [
        `Siempre recomendamos acompañar tus dispositivos con accesorios de confianza, y este ${model} es una excelente elección porque se encuentra ${accConditionPhrase}. Está pensado para brindarte un desempeño estable, seguro y duradero todos los días without complicaciones. ${
          cleanNotes ? `Para que tengas todos los detalles claros, toma en cuenta que ${formattedNotes} ` : ''
        }Lo tenemos disponible y listo para que lo recibas con total tranquilidad.`,
      ],
      experiencia: [
        `En el uso diario, contar con este ${model} te da la comodidad y la rapidez que necesitas sin poner en riesgo tus equipos. Esta unidad se encuentra ${accConditionPhrase}, asegurando un funcionamiento parejo y confiable en casa, la oficina o de viaje. ${
          cleanNotes ? `A esto se suma que ${formattedNotes} ` : ''
        }Listo para disfrutarlo desde el primer día.`,
      ],
      oportunidad: [
        `Adquirir este ${model} ${accConditionPhrase} es una decisión inteligente para cuidar la batería y el funcionamiento de tus dispositivos Apple sin gastar de más. ${
          cleanNotes ? `Como valor agregado en esta unidad, ${formattedNotes} ` : ''
        }Es un accesorio indispensable, verificado y listo para entrega inmediata.`,
      ],
      directo: [
        `Ponemos a tu disposición este ${model} ${accConditionPhrase}. Cumple con todos los estándares para un funcionamiento seguro y eficiente en el uso cotidiano. ${
          cleanNotes
            ? `Sobre este artículo en particular: ${cleanNotes.charAt(0).toUpperCase() + cleanNotes.slice(1)}${/[.!?]$/.test(cleanNotes) ? '' : '.'} `
            : ''
        }Disponible para entrega inmediata.`,
      ],
    };
    return pick(paragraphs[tone] || paragraphs.cercano).replace(' without ', ' sin ');
  }

  // Frases humanas para la condición estética (dispositivos)
  let conditionPhrase = `se encuentra en condición ${conditionLower}, muy bien cuidado en su estética y funcionamiento`;
  if (conditionLower.includes('excelente') || conditionLower.includes('como nuevo') || conditionLower.includes('impecable')) {
    conditionPhrase = 'está sumamente cuidado, con una estética limpia que da gusto tener en mano desde el primer momento';
  } else if (conditionLower.includes('muy bueno') || conditionLower.includes('muy buena')) {
    conditionPhrase = 'se conserva en muy buen estado físico y funcionando al 100% en cada detalle';
  } else if (conditionLower.includes('bueno') || conditionLower.includes('buena')) {
    conditionPhrase = 'está 100% revisado y listo para trabajar sin fallos, ideal para darle uso diario con total confianza';
  } else if (conditionLower.includes('nuevo') || conditionLower.includes('sellado')) {
    conditionPhrase = 'se encuentra completamente impecable, listo para estrenar con total garantía y tranquilidad';
  }

  // Frases humanas para la batería
  let batteryPhrase = battery ? `con su batería al ${battery}` : 'con excelente autonomía para el día a día';
  if (!isNaN(batteryNum)) {
    if (batteryNum >= 95) {
      batteryPhrase = `con la batería prácticamente entera al ${battery} para que te olvides del cargador durante todo el día`;
    } else if (batteryNum >= 88) {
      batteryPhrase = `con un ${battery} de salud de batería que rinde súper bien toda la jornada`;
    } else {
      batteryPhrase = `con su batería al ${battery} trabajando de forma estable y confiable`;
    }
  }

  // Frases humanas para el almacenamiento
  const storagePhrase = storage
    ? `sus ${storage} de espacio te dan total comodidad para guardar fotos, videos y aplicaciones sin preocuparte por la memoria`
    : 'cuenta con espacio de sobra para tus fotos, videos y aplicaciones del día a día';

  if (length === 'puntos') {
    const introByTone: Record<string, string[]> = {
      cercano: [
        `Si andas buscando un ${model}${storage ? ` de ${storage}` : ''} en el que puedas confiar a ojos cerrados, esta unidad te va a encantar.`,
        `Este ${model}${storage ? ` de ${storage}` : ''} es de esos equipos que uno recomienda con total tranquilidad por lo bien conservado que está.`,
      ],
      experiencia: [
        `Usar este ${model}${storage ? ` de ${storage}` : ''} en el día a día es una maravilla por la fluidez de su pantalla, sus cámaras y lo bien cuidado que se siente.`,
        `Un ${model}${storage ? ` de ${storage}` : ''} pensado para acompañarte a todo ritmo, con la respuesta rápida y la calidad fotográfica que buscas.`,
      ],
      oportunidad: [
        `Llevarte este ${model}${storage ? ` de ${storage}` : ''} en este estado es una excelente oportunidad para estrenar gama alta cuidando tu bolsillo.`,
        `Pocas veces entra un ${model}${storage ? ` de ${storage}` : ''} con este equilibrio tan bueno entre cuidado estético, rendimiento y precio.`,
      ],
      directo: [
        `Este ${model}${storage ? ` de ${storage}` : ''} está completamente revisado, libre de detalles ocultos y listo para que solo le pongas tu chip.`,
        `Unidad de ${model}${storage ? ` (${storage})` : ''} probada a fondo y lista para entrega inmediata con total respaldo.`,
      ],
    };

    const intro = pick(introByTone[tone] || introByTone.cercano);
    const bullets = [
      `• Estado real: ${conditionPhrase.charAt(0).toUpperCase() + conditionPhrase.slice(1)}.`,
      `• Rendimiento y autonomía: Viene ${batteryPhrase}${storage ? `, acompañado de ${storage} de almacenamiento para guardar todo con holgura` : ''}.`,
      cleanNotes
        ? `• Detalles a tomar en cuenta: ${cleanNotes.charAt(0).toUpperCase() + cleanNotes.slice(1)}${/[.!?]$/.test(cleanNotes) ? '' : '.'}`
        : `• Listo para usar: Revisado en todos sus puntos clave (cámaras, Face ID, audio y señal) para tu tranquilidad.`,
    ];

    return `${intro}\n\n${bullets.join('\n')}`;
  }

  if (length === 'breve') {
    const briefByTone: Record<string, string[]> = {
      cercano: [
        `Este ${model}${storage ? ` de ${storage}` : ''} ${conditionPhrase} y viene ${batteryPhrase}. ${
          cleanNotes
            ? `Además, toma en cuenta que ${formattedNotes}`
            : 'Es un equipo súper noble, revisado a detalle y listo para acompañarte desde hoy.'
        }`,
        `Si buscas un ${model}${storage ? ` de ${storage}` : ''} bien cuidado, esta unidad ${conditionPhrase} y cuenta ${batteryPhrase}. ${
          cleanNotes
            ? `Como detalle importante, ${formattedNotes}`
            : 'Está listo para que lo pruebes y lo disfrutes con total confianza.'
        }`,
      ],
      experiencia: [
        `Disfruta toda la fluidez y cámaras del ${model} en una unidad que ${conditionPhrase}. Con ${
          storage || 'buen espacio'
        } y ${batteryPhrase}, tienes equipo de sobra para tu rutina${
          cleanNotes ? `; además, ${formattedNotes}` : '.'
        }`,
        `Este ${model}${storage ? ` de ${storage}` : ''} se siente ágil y cómodo en cada tarea, ${batteryPhrase} y en condición ${conditionLower}. ${
          cleanNotes
            ? `Un plus de esta unidad: ${formattedNotes}`
            : 'Ideal para quien busca rendimiento impecable todos los días.'
        }`,
      ],
      oportunidad: [
        `Excelente oportunidad para llevarte un ${model}${storage ? ` de ${storage}` : ''} que ${conditionPhrase} y se mantiene ${batteryPhrase}. ${
          cleanNotes
            ? `Destaca además porque ${formattedNotes}`
            : 'Una compra inteligente por su estado real y todo el provecho que le vas a sacar.'
        }`,
      ],
      directo: [
        `${model}${storage ? ` de ${storage}` : ''} en condición ${conditionLower}, ${batteryPhrase} y funcionando al 100% sin ningún fallo. ${
          cleanNotes
            ? `Observación de esta unidad: ${cleanNotes.charAt(0).toUpperCase() + cleanNotes.slice(1)}${/[.!?]$/.test(cleanNotes) ? '' : '.'}`
            : 'Revisado por completo y listo para entrega inmediata.'
        }`,
      ],
    };

    return pick(briefByTone[tone] || briefByTone.cercano);
  }

  // length === 'parrafo' (Párrafo completo)
  const paragraphByTone: Record<string, string[]> = {
    cercano: [
      `Este ${model}${storage ? ` de ${storage}` : ''} es de esas unidades que da gusto mostrar porque ${conditionPhrase}. Viene ${batteryPhrase}, y ${storagePhrase}. ${
        cleanNotes
          ? `Para que tengas toda la información clara sobre este equipo en particular, toma en cuenta que ${formattedNotes} `
          : ''
      }Ya pasó por nuestra revisión completa para asegurarnos de que cámaras, micrófonos, pantalla y señal funcionen como debe ser, así que puedes llevártelo con total tranquilidad.`,
      `Cuando revisamos este ${model}${storage ? ` de ${storage}` : ''}, nos gustó mucho cómo se ha conservado: ${conditionPhrase} y se mantiene ${batteryPhrase}. En el uso diario ${storagePhrase}. ${
        cleanNotes
          ? `Además, vale la pena mencionar que ${formattedNotes} `
          : ''
      }Es una opción honesta, segura y lista para que solo tengas que pasar tu información y empezar a disfrutarlo.`,
    ],
    experiencia: [
      `Tener este ${model} en el día a día se traduce en rapidez, fotos nítidas y la tranquilidad de contar con un equipo que ${conditionPhrase}. Gracias a que viene ${batteryPhrase}, te acompaña sin problema durante tu rutina, mientras que ${storagePhrase}. ${
        cleanNotes
          ? `A esto se suma que ${formattedNotes} `
          : ''
      }Cada función ha sido verificada con cuidado para que tu experiencia sea fluida desde el primer encendido.`,
    ],
    oportunidad: [
      `Si estabas esperando el momento para subir a un ${model}${storage ? ` de ${storage}` : ''} sin pagar de más, esta unidad vale muchísimo la pena porque ${conditionPhrase}. Encontrarlo ${batteryPhrase} y con ${
        storage ? `sus ${storage} de capacidad` : 'tan buen rendimiento'
      } lo convierte en una compra súper acertada a largo plazo. ${
        cleanNotes
          ? `Como valor agregado en esta unidad, ${formattedNotes} `
          : ''
      }Un teléfono completo, revisado a fondo y listo para estrenarse hoy mismo.`,
    ],
    directo: [
      `Ponemos a tu disposición este ${model}${storage ? ` de ${storage}` : ''} en condición ${conditionLower}, el cual ${conditionPhrase} y cuenta ${batteryPhrase}. A nivel práctico, ${storagePhrase}. ${
        cleanNotes
          ? `Sobre esta unidad específica: ${cleanNotes.charAt(0).toUpperCase() + cleanNotes.slice(1)}${/[.!?]$/.test(cleanNotes) ? '' : '.'} `
          : ''
      }El dispositivo fue probado en todos sus componentes clave y se entrega listo para usar desde el primer minuto.`,
    ],
  };

  return pick(paragraphByTone[tone] || paragraphByTone.cercano);
}
