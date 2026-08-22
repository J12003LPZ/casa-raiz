export const LANGUAGE_STORAGE_KEY = 'casa-raiz-language'

const menuPreviewImages = {
  yuca: 'https://cdn.pixabay.com/photo/2014/12/06/03/41/cassava-558755_1280.jpg',
  pulpo: 'https://images.unsplash.com/photo-1764397514746-e58523d0eaff?auto=format&fit=crop&w=1200&q=90',
  beet: 'https://images.unsplash.com/photo-1765100022784-5e72b418d34b?auto=format&fit=crop&w=1200&q=90',
  tunaTostada: 'https://images.unsplash.com/photo-1769830644804-0ede2ee32a62?auto=format&fit=crop&w=1200&q=90',
  shortRib: 'https://images.unsplash.com/photo-1747972312968-daeb233e6bcb?auto=format&fit=crop&w=1200&q=90',
  negroni: 'https://images.unsplash.com/photo-1752141930096-ac8292d6a15a?auto=format&fit=crop&w=1200&q=90',
  passionSpritz: 'https://images.unsplash.com/photo-1763647724791-55fa2b79af82?auto=format&fit=crop&w=1200&q=90',
  pineappleMargarita: 'https://images.unsplash.com/photo-1746787674060-c1ebf9bfe70a?auto=format&fit=crop&w=1200&q=90',
  chocolate: 'https://images.unsplash.com/photo-1776763019245-2de2352cce7e?auto=format&fit=crop&w=1200&q=90',
  tresLeches: 'https://images.unsplash.com/photo-1673974798330-23e8f4c9ae05?auto=format&fit=crop&w=1200&q=90',
}

export function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en'

  const stored = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === 'en' || stored === 'es') return stored

  return window.navigator?.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export const translations = {
  en: {
    nav: { menu: 'Menu', story: 'Our Story', events: 'Events', contact: 'Contact', reserve: 'Reserve a Table', primaryLabel: 'Primary navigation', mobileOpen: 'Open menu', homeLabel: 'Casa Raíz home' },
    language: { label: 'Language', english: 'Switch to English', spanish: 'Switch to Spanish' },
    brandSubtitle: 'Latin American Cuisine',
    hero: { kicker: 'Contemporary Latin American cuisine', line1: 'Flavors with roots.', line2: 'Moments worth remembering.', body: 'Seasonal ingredients, live fire, and inherited recipes served with a contemporary point of view in Brooklyn.', explore: 'Explore Menu', location: 'Brooklyn, NY', hours: 'Tue-Sun from 5 PM', imageAlt: 'Grilled steak plated with herbs in a candlelit restaurant' },
    dishes: {
        title: 'Plates made with intention.', intro: 'Recognizable ingredients. Precise technique. Plenty of fire.', fullMenu: 'View full menu',
        carousel: { carouselLabel: 'Featured plates carousel', previous: 'Previous plate', next: 'Next plate', swipeHint: 'Drag or swipe the top plate', viewDetails: 'View details for', detailsCue: 'Details', detailsKicker: 'Plate details', close: 'Close plate details', nutritionLabel: 'Estimated nutrition values', estimateBadge: 'Est. nutrition', calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat', sodium: 'Sodium', estimatedNote: 'Estimated nutrition per serving. Actual values may vary based on preparation and portion size.' },
        items: [
          { name: 'Carne Asada con Chimichurri', detail: 'Grilled skirt steak, herb chimichurri, and criolla potatoes.', price: '$32', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1500&q=88', alt: 'Grilled beef with chimichurri and potatoes' },
          { name: 'Ceviche del Mercado', detail: 'Daily catch, leche de tigre, sweet potato, and cancha corn.', price: '$24', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1400&q=88', alt: 'Fresh market-style ceviche' },
          { name: 'Mole de Temporada', detail: 'Organic chicken, dried chile mole, sesame, and rice.', price: '$28', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=88', alt: 'Seasonal mole with chicken and rice' },
          { name: 'Empanadas de la Casa', detail: 'Crisp pastry, slow-cooked beef, sofrito, and herbs.', price: '$16', image: 'https://images.unsplash.com/photo-1667450722909-68bce7072fec?auto=format&fit=crop&w=1400&q=88', alt: 'Golden empanadas arranged on a plate' },
          { name: 'Taco de Barbacoa', detail: 'Blue corn tortilla, smoked beef, avocado, onion, and cilantro.', price: '$18', image: 'https://images.unsplash.com/photo-1668724775562-f5bf6284ee12?auto=format&fit=crop&w=1400&q=88', alt: 'Barbacoa taco on a dark plate' },
          { name: 'Camarones al Ajillo', detail: 'Seared shrimp, garlic, chile, citrus, and market greens.', price: '$27', image: 'https://images.unsplash.com/photo-1642443003739-8ffd64fc3c1c?auto=format&fit=crop&w=1400&q=88', alt: 'Shrimp dish served at a Mexican restaurant' },
          { name: 'Pescado a la Plancha', detail: 'Charred fish, seasonal vegetables, lime, and herb oil.', price: '$31', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1400&q=88', alt: 'Grilled fish with vegetables and lime' },
          { name: 'Flan de Coco', detail: 'Silky coconut custard, caramel, sea salt, and citrus zest.', price: '$12', image: 'https://images.unsplash.com/photo-1541963058-f6a81ac19b70?auto=format&fit=crop&w=1400&q=88', alt: 'Plated restaurant dessert with fruit and pistachio' },
        ],
      },
      story: { kicker: 'Our story', title: 'Roots that guide us. Flavors that bring us together.', body: 'Casa Raíz began with a desire to share the richness of Latin America through honest, contemporary cooking. Family tables, markets, travel, and respect for the land shape where we begin.', quote: '“Every plate honors memory, the land, and the shared table.”', mainAlt: 'Chef preparing ingredients in a restaurant kitchen', detailAlt: 'Hands shaping masa on a leaf' },
    experience: { title: 'A night with its own rhythm.', body: 'Music with roots, precise cocktails, and hospitality that never feels rehearsed.', diningAlt: 'Warm restaurant dining room at night', cocktailAlt: 'House cocktail with citrus', guestsAlt: 'Guests sharing dinner around a table' },
    chef: { kicker: 'Our philosophy', title: 'Chef Elena Morales', role: 'Executive Chef', body: 'I believe in a kitchen that listens to the land and the season. I work with local producers, traditional techniques, and a contemporary point of view to create honest, vibrant food.', values: ['Seasonal ingredients', 'Traditional techniques', 'Local producers', 'Cooking with purpose'], alt: 'Executive Chef Elena Morales' },
    menu: {
      kicker: 'House menu', title: 'The table starts with sharing.', body: 'Our menu moves with the season, but fire and memory are always present.',
      preview: { withLabel: 'WITH:', photoPending: 'Dish photo coming soon' },
      groups: [
        { title: 'To Share', items: [
          { name: 'Yuca Frita', shortDescription: 'smoked ají aioli', price: '$12', image: menuPreviewImages.yuca, imageAlt: 'Crisp fried cassava bites served on a plate', previewDescription: 'Crisp yuca fries with a tender center, finished with smoky ají and a squeeze of lime.', accompaniments: ['Smoked ají aioli', 'Sea salt', 'Lime'] },
          { name: 'Empanadas de Hongos', shortDescription: 'fresh cheese, chimichurri', price: '$14', image: 'https://images.unsplash.com/photo-1667450722909-68bce7072fec?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Golden empanadas arranged on a plate', previewDescription: 'Wild mushrooms folded with fresh cheese in a crisp, golden crust.', accompaniments: ['Chimichurri', 'Parmesan', 'Garlic Oil'] },
          { name: 'Pulpo a la Parrilla', shortDescription: 'ají amarillo, olives', price: '$18', image: menuPreviewImages.pulpo, imageAlt: 'Grilled octopus served with greens and lemon', previewDescription: 'Charred octopus with tender edges, bright ají amarillo, and briny olives.', accompaniments: ['Ají amarillo', 'Olives', 'Citrus'] },
        ] },
        { title: 'Starters', items: [
          { name: 'Ceviche de Mercado', shortDescription: 'daily catch, sweet potato, corn', price: '$24', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Fresh market-style ceviche', previewDescription: 'Daily catch brightened with leche de tigre, sweet potato, and cancha corn.', accompaniments: ['Leche de tigre', 'Sweet potato', 'Cancha corn'] },
          { name: 'Ensalada de Remolacha', shortDescription: 'goat cheese, rosemary, honey', price: '$15', image: menuPreviewImages.beet, imageAlt: 'Roasted beet salad with creamy dressing and microgreens', previewDescription: 'Roasted beets layered with creamy goat cheese, rosemary, and a restrained touch of honey.', accompaniments: ['Goat cheese', 'Rosemary', 'Honey'] },
          { name: 'Tostada de Atún', shortDescription: 'avocado, salsa macha', price: '$16', image: menuPreviewImages.tunaTostada, imageAlt: 'Tuna tartare tostada with fresh garnish and lime', previewDescription: 'A crisp tostada topped with silky tuna, avocado, and smoky salsa macha.', accompaniments: ['Avocado', 'Salsa macha', 'Lime'] },
        ] },
        { title: 'Mains', items: [
          { name: 'Short Rib Barbacoa', shortDescription: 'charred salsa, sweet potato purée', price: '$34', image: menuPreviewImages.shortRib, imageAlt: 'Braised short rib plated with microgreens', previewDescription: 'Slow-braised short rib with deep barbacoa spice, charred salsa, and silky sweet potato purée.', accompaniments: ['Charred salsa', 'Sweet potato purée', 'Herbs'] },
          { name: 'Pescado a la Plancha', shortDescription: 'citrus, beurre blanc, vegetables', price: '$31', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Grilled fish with vegetables and lime', previewDescription: 'Plancha-seared fish with crisp edges, seasonal vegetables, citrus, and a light beurre blanc.', accompaniments: ['Citrus', 'Beurre blanc', 'Market vegetables'] },
          { name: 'Pollo en Mole', shortDescription: 'rice, beans, pickled onion', price: '$28', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Seasonal mole with chicken and rice', previewDescription: 'Roasted chicken glazed in a deep chile mole with rice, beans, and bright pickled onion.', accompaniments: ['Chile mole', 'Rice', 'Pickled onion'] },
        ] },
        { title: 'Cocktails', items: [
          { name: 'Raíz Negroni', shortDescription: 'mezcal, cacao, orange', price: '$18', image: menuPreviewImages.negroni, imageAlt: 'Negroni cocktail with orange garnish', previewDescription: 'A smoky house Negroni built around mezcal, bitter orange, and a restrained cacao finish.', accompaniments: ['Mezcal', 'Cacao', 'Orange'] },
          { name: 'Maracuyá Spritz', shortDescription: 'pisco, passion fruit, prosecco', price: '$16', image: menuPreviewImages.passionSpritz, imageAlt: 'Passion fruit cocktail with a foamy finish', previewDescription: 'Bright passion fruit and pisco lifted with chilled prosecco for a crisp, aromatic spritz.', accompaniments: ['Pisco', 'Passion fruit', 'Prosecco'] },
          { name: 'Piña & Chile Margarita', shortDescription: 'tequila, pineapple, chile', price: '$17', image: menuPreviewImages.pineappleMargarita, imageAlt: 'Pineapple cocktail served at a bar', previewDescription: 'Tequila, ripe pineapple, and chile balanced between tropical sweetness, acidity, and gentle heat.', accompaniments: ['Tequila', 'Pineapple', 'Chile'] },
        ] },
        { title: 'Desserts', items: [
          { name: 'Flan de Coco', shortDescription: 'burnt sugar, lime zest', price: '$11', image: 'https://images.unsplash.com/photo-1541963058-f6a81ac19b70?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Plated restaurant dessert with fruit and pistachio', previewDescription: 'Silky coconut custard under dark caramel, finished with sea salt and fresh lime zest.', accompaniments: ['Burnt sugar', 'Lime zest', 'Sea salt'] },
          { name: 'Chocolate 70%', shortDescription: 'olive oil, sea salt', price: '$12', image: menuPreviewImages.chocolate, imageAlt: 'Fine-dining chocolate dessert with cocoa garnish', previewDescription: 'Deep 70% chocolate with a glossy texture, fruity olive oil, and flakes of sea salt.', accompaniments: ['70% chocolate', 'Olive oil', 'Sea salt'] },
          { name: 'Tres Leches Cake', shortDescription: 'dulce de leche, berries', price: '$17', image: menuPreviewImages.tresLeches, imageAlt: 'Slice of tres leches cake with fresh raspberries', previewDescription: 'Soft milk-soaked cake with dulce de leche and bright berries to keep the finish light.', accompaniments: ['Dulce de leche', 'Berries', 'Three-milk soak'] },
        ] },
      ],
    },
    bar: {
        kicker: 'From the bar', title: 'Drinks with soul.', body: 'Signature cocktails, small-producer agave spirits, Latin American wines, and zero-proof drinks made with the same care.', cta: 'Join us tonight', selectorLabel: 'Choose a drink category',
        drinks: [
          { name: 'Signature Cocktails', detail: 'House originals shaped by Latin flavors.', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1400&q=90', alt: 'Signature cocktail in a dark, elegant bar setting' },
          { name: 'Mezcal & Tequila', detail: 'Small producers. Smoke, citrus, and character.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1400&q=90', alt: 'Agave spirit cocktail served over ice' },
          { name: 'Wine', detail: 'Bottles from expressive Latin American vineyards.', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1400&q=90', alt: 'Red wine poured into an elegant wine glass' },
          { name: 'Zero Proof', detail: 'Citrus, botanicals, texture, and no compromise.', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1400&q=90', alt: 'Zero-proof citrus drink in an elegant glass' },
        ],
      },
      reservations: { title: 'Your table is waiting.', body: 'Reserve your Casa Raíz experience.', date: 'Date', time: 'Time', guests: 'Guests', find: 'Find a Table', people: ['2 people', '3 people', '4 people', '5 people', '6+ people'], note: 'Perfect. We’ll look for the best available tables.' },
    events: { title: 'Private Events & Dining', body: 'From intimate dinners to larger celebrations, we shape the menu and the rhythm of the night around your occasion.', facts: ['Custom menus', 'Groups of 10 to 60 guests', 'Corporate and social events'], cta: 'Plan Your Event', alt: 'Private dining table set for an event' },
    reviews: { feature: '“A Brooklyn gem. The food, service, and energy are impeccable. We keep coming back.”', featureMeta: 'Guest Review', second: '“Authentic flavors with a modern point of view. Every plate tells a story.”', third: '“The best ceviche I’ve had outside Lima. Incredible hospitality.”' },
    gallery: { label: 'Casa Raíz gallery', alts: ['Plated food', 'Cocktail', 'Restaurant interior', 'Chef at work', 'Main dish'] },
    visit: { title: 'Visit us.', schedule: ['Tue-Sun from 5 PM', 'Closed Monday'], directions: 'Get directions', alt: 'Intimate restaurant dining room' },
    newsletter: { title: 'The next season starts in your inbox.', body: 'News, special events, and new menus, without the noise.', label: 'Your email', placeholder: 'name@email.com', cta: 'Subscribe', note: 'Thank you. We’ll keep you in the loop.' },
    footer: { brandBody: 'Contemporary Latin American cooking in Brooklyn.', navigation: 'Navigation', information: 'Information', hours: 'Hours', rights: '© 2026 Casa Raíz. All rights reserved.', accessibility: 'Accessibility', privacy: 'Privacy Policy', terms: 'Terms & Conditions' },
  },
  es: {
    nav: { menu: 'Menú', story: 'Nuestra Historia', events: 'Eventos', contact: 'Contacto', reserve: 'Reservar una Mesa', primaryLabel: 'Navegación principal', mobileOpen: 'Abrir menú', homeLabel: 'Inicio de Casa Raíz' },
    language: { label: 'Idioma', english: 'Cambiar a inglés', spanish: 'Cambiar a español' },
    brandSubtitle: 'Cocina Latinoamericana',
    hero: { kicker: 'Cocina latinoamericana contemporánea', line1: 'Sabores con raíces.', line2: 'Momentos para recordar.', body: 'Temporada, fuego y recetas heredadas, servidas con una mirada contemporánea en Brooklyn.', explore: 'Explorar Menú', location: 'Brooklyn, NY', hours: 'Mar-Dom desde las 5 PM', imageAlt: 'Carne a la parrilla servida con hierbas en un restaurante iluminado por velas' },
    dishes: {
        title: 'Platos hechos con intención.', intro: 'Ingredientes reconocibles. Técnicas precisas. Mucho fuego.', fullMenu: 'Ver menú completo',
        carousel: { carouselLabel: 'Carrusel de platos destacados', previous: 'Plato anterior', next: 'Siguiente plato', swipeHint: 'Arrastra o desliza el plato de arriba', viewDetails: 'Ver detalles de', detailsCue: 'Detalles', detailsKicker: 'Detalles del plato', close: 'Cerrar detalles del plato', nutritionLabel: 'Valores nutricionales estimados', estimateBadge: 'Nutrición est.', calories: 'Calorías', protein: 'Proteína', carbs: 'Carbohidratos', fat: 'Grasa', sodium: 'Sodio', estimatedNote: 'Nutrición estimada por porción. Los valores reales pueden variar según la preparación y el tamaño de la porción.' },
        items: [
          { name: 'Carne Asada con Chimichurri', detail: 'Entraña a la parrilla, chimichurri de hierbas, papas criollas.', price: '$32', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1500&q=88', alt: 'Carne asada con chimichurri y papas' },
          { name: 'Ceviche del Mercado', detail: 'Pescado del día, leche de tigre, camote, maíz cancha.', price: '$24', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1400&q=88', alt: 'Ceviche fresco estilo mercado' },
          { name: 'Mole de Temporada', detail: 'Pollo orgánico, mole de chiles secos, ajonjolí y arroz.', price: '$28', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=88', alt: 'Mole de temporada con pollo y arroz' },
          { name: 'Empanadas de la Casa', detail: 'Masa crujiente, carne cocida lentamente, sofrito y hierbas.', price: '$16', image: 'https://images.unsplash.com/photo-1667450722909-68bce7072fec?auto=format&fit=crop&w=1400&q=88', alt: 'Empanadas doradas servidas en un plato' },
          { name: 'Taco de Barbacoa', detail: 'Tortilla de maíz azul, res ahumada, aguacate, cebolla y cilantro.', price: '$18', image: 'https://images.unsplash.com/photo-1668724775562-f5bf6284ee12?auto=format&fit=crop&w=1400&q=88', alt: 'Taco de barbacoa servido en un plato oscuro' },
          { name: 'Camarones al Ajillo', detail: 'Camarones sellados, ajo, chile, cítricos y hojas del mercado.', price: '$27', image: 'https://images.unsplash.com/photo-1642443003739-8ffd64fc3c1c?auto=format&fit=crop&w=1400&q=88', alt: 'Plato de camarones servido en un restaurante mexicano' },
          { name: 'Pescado a la Plancha', detail: 'Pescado dorado, vegetales de temporada, lima y aceite de hierbas.', price: '$31', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1400&q=88', alt: 'Pescado a la plancha con vegetales y lima' },
          { name: 'Flan de Coco', detail: 'Custard de coco sedoso, caramelo, sal marina y ralladura cítrica.', price: '$12', image: 'https://images.unsplash.com/photo-1541963058-f6a81ac19b70?auto=format&fit=crop&w=1400&q=88', alt: 'Postre emplatado con fruta y pistacho' },
        ],
      },
      story: { kicker: 'Nuestra historia', title: 'Raíces que nos guían. Sabores que nos unen.', body: 'Casa Raíz nace del deseo de compartir la riqueza de América Latina a través de una cocina honesta y contemporánea. Familias, mercados, viajes y respeto por la tierra forman nuestro punto de partida.', quote: '“Cada plato honra la memoria, la tierra y la mesa compartida.”', mainAlt: 'Chef preparando ingredientes en la cocina del restaurante', detailAlt: 'Manos dando forma a masa sobre una hoja' },
    experience: { title: 'Una noche con pulso propio.', body: 'Música con raíces, cócteles precisos y hospitalidad que no se siente ensayada.', diningAlt: 'Comedor cálido del restaurante por la noche', cocktailAlt: 'Cóctel de la casa con cítricos', guestsAlt: 'Invitados compartiendo una cena' },
    chef: { kicker: 'Nuestra filosofía', title: 'Chef Elena Morales', role: 'Chef Ejecutiva', body: 'Creo en una cocina que escucha la tierra y el tiempo. Trabajo con productores locales, técnicas tradicionales y una mirada contemporánea para crear platos honestos y vibrantes.', values: ['Ingredientes de temporada', 'Técnicas tradicionales', 'Productores locales', 'Cocina con propósito'], alt: 'Chef Ejecutiva Elena Morales' },
    menu: {
      kicker: 'Carta de la casa', title: 'Comer aquí empieza con compartir.', body: 'Nuestra carta cambia con la temporada, pero el fuego y la memoria siempre están presentes.',
      preview: { withLabel: 'CON:', photoPending: 'Foto del plato próximamente' },
      groups: [
        { title: 'Para Compartir', items: [
          { name: 'Yuca Frita', shortDescription: 'alioli de ají ahumado', price: '$12', image: menuPreviewImages.yuca, imageAlt: 'Bocados crujientes de yuca frita servidos en un plato', previewDescription: 'Yuca crujiente por fuera y tierna por dentro, terminada con ají ahumado y un toque de lima.', accompaniments: ['Alioli de ají ahumado', 'Sal marina', 'Lima'] },
          { name: 'Empanadas de Hongos', shortDescription: 'queso fresco, chimichurri', price: '$14', image: 'https://images.unsplash.com/photo-1667450722909-68bce7072fec?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Empanadas doradas servidas en un plato', previewDescription: 'Hongos salteados con queso fresco dentro de una masa dorada y crujiente.', accompaniments: ['Chimichurri', 'Parmesano', 'Aceite de ajo'] },
          { name: 'Pulpo a la Parrilla', shortDescription: 'ají amarillo, aceitunas', price: '$18', image: menuPreviewImages.pulpo, imageAlt: 'Pulpo a la parrilla servido con hojas verdes y limón', previewDescription: 'Pulpo a la parrilla con bordes dorados, ají amarillo vibrante y aceitunas salinas.', accompaniments: ['Ají amarillo', 'Aceitunas', 'Cítricos'] },
        ] },
        { title: 'Entradas', items: [
          { name: 'Ceviche de Mercado', shortDescription: 'pescado del día, camote, maíz', price: '$24', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Ceviche fresco estilo mercado', previewDescription: 'Pescado del día avivado con leche de tigre, camote y maíz cancha.', accompaniments: ['Leche de tigre', 'Camote', 'Maíz cancha'] },
          { name: 'Ensalada de Remolacha', shortDescription: 'queso de cabra, romero, miel', price: '$15', image: menuPreviewImages.beet, imageAlt: 'Ensalada de remolacha asada con aderezo cremoso y microgreens', previewDescription: 'Remolachas asadas con queso de cabra cremoso, romero y un toque contenido de miel.', accompaniments: ['Queso de cabra', 'Romero', 'Miel'] },
          { name: 'Tostada de Atún', shortDescription: 'aguacate, salsa macha', price: '$16', image: menuPreviewImages.tunaTostada, imageAlt: 'Tostada de tartar de atún con guarnición fresca y lima', previewDescription: 'Tostada crujiente con atún sedoso, aguacate y salsa macha ahumada.', accompaniments: ['Aguacate', 'Salsa macha', 'Lima'] },
        ] },
        { title: 'Platos Principales', items: [
          { name: 'Short Rib Barbacoa', shortDescription: 'salsa tatemada, puré de camote', price: '$34', image: menuPreviewImages.shortRib, imageAlt: 'Short rib braseado servido con microgreens', previewDescription: 'Short rib cocido lentamente con especias de barbacoa, salsa tatemada y puré sedoso de camote.', accompaniments: ['Salsa tatemada', 'Puré de camote', 'Hierbas'] },
          { name: 'Pescado a la Plancha', shortDescription: 'cítricos, beurre blanc, vegetales', price: '$31', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Pescado a la plancha con vegetales y lima', previewDescription: 'Pescado sellado a la plancha con bordes crujientes, vegetales de temporada, cítricos y beurre blanc ligero.', accompaniments: ['Cítricos', 'Beurre blanc', 'Vegetales del mercado'] },
          { name: 'Pollo en Mole', shortDescription: 'arroz, frijoles, cebolla encurtida', price: '$28', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Mole de temporada con pollo y arroz', previewDescription: 'Pollo asado cubierto con un mole profundo de chiles, arroz, frijoles y cebolla encurtida.', accompaniments: ['Mole de chiles', 'Arroz', 'Cebolla encurtida'] },
        ] },
        { title: 'Cócteles', items: [
          { name: 'Raíz Negroni', shortDescription: 'mezcal, cacao, naranja', price: '$18', image: menuPreviewImages.negroni, imageAlt: 'Cóctel Negroni con guarnición de naranja', previewDescription: 'Un Negroni ahumado de la casa con mezcal, naranja amarga y un final sutil de cacao.', accompaniments: ['Mezcal', 'Cacao', 'Naranja'] },
          { name: 'Maracuyá Spritz', shortDescription: 'pisco, maracuyá, prosecco', price: '$16', image: menuPreviewImages.passionSpritz, imageAlt: 'Cóctel de maracuyá con acabado espumoso', previewDescription: 'Maracuyá brillante y pisco levantados con prosecco frío para un spritz fresco y aromático.', accompaniments: ['Pisco', 'Maracuyá', 'Prosecco'] },
          { name: 'Piña & Chile Margarita', shortDescription: 'tequila, piña, chile', price: '$17', image: menuPreviewImages.pineappleMargarita, imageAlt: 'Cóctel de piña servido en una barra', previewDescription: 'Tequila, piña madura y chile equilibrados entre dulzor tropical, acidez y un picante suave.', accompaniments: ['Tequila', 'Piña', 'Chile'] },
        ] },
        { title: 'Postres', items: [
          { name: 'Flan de Coco', shortDescription: 'azúcar quemada, ralladura de lima', price: '$11', image: 'https://images.unsplash.com/photo-1541963058-f6a81ac19b70?auto=format&fit=crop&w=1200&q=90', imageAlt: 'Postre emplatado con fruta y pistacho', previewDescription: 'Custard sedoso de coco bajo caramelo oscuro, terminado con sal marina y ralladura fresca de lima.', accompaniments: ['Azúcar quemada', 'Ralladura de lima', 'Sal marina'] },
          { name: 'Chocolate 70%', shortDescription: 'aceite de oliva, sal marina', price: '$12', image: menuPreviewImages.chocolate, imageAlt: 'Postre de chocolate de alta cocina con cacao', previewDescription: 'Chocolate 70% intenso y brillante con aceite de oliva frutal y escamas de sal marina.', accompaniments: ['Chocolate 70%', 'Aceite de oliva', 'Sal marina'] },
          { name: 'Tres Leches Cake', shortDescription: 'dulce de leche, frutos rojos', price: '$17', image: menuPreviewImages.tresLeches, imageAlt: 'Porción de pastel de tres leches con frambuesas frescas', previewDescription: 'Bizcocho suave empapado en tres leches con dulce de leche y frutos rojos frescos.', accompaniments: ['Dulce de leche', 'Frutos rojos', 'Tres leches'] },
        ] },
      ],
    },
    bar: {
        kicker: 'Desde la barra', title: 'Bebidas con alma.', body: 'Cócteles de autor, agaves artesanales, vinos latinoamericanos y opciones sin alcohol con el mismo cuidado.', cta: 'Ven esta noche', selectorLabel: 'Elige una categoría de bebida',
        drinks: [
          { name: 'Cócteles de Autor', detail: 'Creaciones de la casa inspiradas en sabores latinos.', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1400&q=90', alt: 'Cóctel de autor en una barra oscura y elegante' },
          { name: 'Mezcal & Tequila', detail: 'Pequeños productores. Humo, cítricos y carácter.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1400&q=90', alt: 'Cóctel de destilado de agave servido con hielo' },
          { name: 'Vinos', detail: 'Botellas de viñedos latinoamericanos con identidad.', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1400&q=90', alt: 'Vino tinto servido en una copa elegante' },
          { name: 'Sin Alcohol', detail: 'Cítricos, botánicos, textura y cero concesiones.', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1400&q=90', alt: 'Bebida cítrica sin alcohol en una copa elegante' },
        ],
      },
      reservations: { title: 'Tu mesa te espera.', body: 'Reserva tu experiencia en Casa Raíz.', date: 'Fecha', time: 'Hora', guests: 'Personas', find: 'Buscar una Mesa', people: ['2 personas', '3 personas', '4 personas', '5 personas', '6+ personas'], note: 'Perfecto. Buscaremos las mejores mesas disponibles.' },
    events: { title: 'Eventos & Comidas Privadas', body: 'Desde cenas íntimas hasta celebraciones grandes. Diseñamos el menú y el ritmo de la noche alrededor de tu ocasión.', facts: ['Menús personalizados', 'Grupos de 10 a 60 personas', 'Eventos corporativos y sociales'], cta: 'Planear tu Evento', alt: 'Mesa privada preparada para un evento' },
    reviews: { feature: '“Una joya en Brooklyn. La comida, el servicio y la vibra son impecables. Volvemos siempre.”', featureMeta: 'Reseña de invitado', second: '“Sabores auténticos con un toque moderno. Cada plato cuenta una historia.”', third: '“El mejor ceviche que he probado fuera de Lima. Increíble atención.”' },
    gallery: { label: 'Galería de Casa Raíz', alts: ['Plato servido', 'Cóctel', 'Interior del restaurante', 'Chef trabajando', 'Plato principal'] },
    visit: { title: 'Visítanos.', schedule: ['Mar-Dom desde las 5 PM', 'Cerrado los lunes'], directions: 'Cómo llegar', alt: 'Comedor íntimo del restaurante' },
    newsletter: { title: 'La próxima temporada empieza en tu inbox.', body: 'Noticias, eventos especiales y nuevos menús, sin ruido.', label: 'Tu correo electrónico', placeholder: 'nombre@email.com', cta: 'Suscribirme', note: '¡Gracias! Te mantendremos al día.' },
    footer: { brandBody: 'Cocina latinoamericana contemporánea en Brooklyn.', navigation: 'Navegación', information: 'Información', hours: 'Horario', rights: '© 2026 Casa Raíz. Todos los derechos reservados.', accessibility: 'Accesibilidad', privacy: 'Política de Privacidad', terms: 'Términos y Condiciones' },
  },
}
