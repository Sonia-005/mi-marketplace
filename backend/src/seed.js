require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Category = require('./models/Category');
const Report = require('./models/Report');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB para seed...');

  await Promise.all([
    User.deleteMany({}),
    Service.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Category.deleteMany({}),
    Report.deleteMany({}),
  ]);

  const h = (pwd) => bcrypt.hash(pwd, 10);

  // ── CATEGORÍAS ────────────────────────────────────────────────────────────
  await Category.insertMany([
    { name: 'diseño',     icon: '🎨', description: 'Logos, branding, ilustración y diseño gráfico', isActive: true },
    { name: 'desarrollo', icon: '💻', description: 'Sitios web, apps móviles y soluciones de software', isActive: true },
    { name: 'marketing',  icon: '📢', description: 'Redes sociales, SEO, ads y estrategia digital', isActive: true },
    { name: 'redacción',  icon: '✍️', description: 'Copywriting, artículos, traducciones y contenido', isActive: true },
    { name: 'video',      icon: '🎬', description: 'Edición, animación, producción audiovisual', isActive: true },
    { name: 'otro',       icon: '⭐', description: 'Servicios varios y especializados', isActive: true },
  ]);
  console.log('6 categorías insertadas');

  // ── USUARIOS ──────────────────────────────────────────────────────────────
  const admin      = await User.create({ name: 'Admin Demo',       email: 'admin@freelancelocal.com',       password: await h('Admin1234'),      role: 'admin',      isActive: true });
  await User.create({ name: 'Demo User',  email: 'demo@demo.com',    password: await h('Demo1234'), role: 'client',     isActive: true });
  await User.create({ name: 'Sonia Meza', email: 'yasper@email.com', password: await h('123456'),   role: 'freelancer', isActive: true, bio: 'Freelancer', skills: [] });
  const cliente    = await User.create({ name: 'Cliente Demo',     email: 'cliente@freelancelocal.com',     password: await h('Cliente1234'),    role: 'client',     isActive: true });
  const free1      = await User.create({ name: 'Freelancer Demo',  email: 'freelancer@freelancelocal.com',  password: await h('Freelancer1234'), role: 'freelancer', bio: 'Desarrollador web full-stack con 5 años de experiencia.', skills: ['React', 'Node.js', 'MongoDB'], isActive: true });
  const ana        = await User.create({ name: 'Ana García',       email: 'ana@freelancelocal.com',         password: await h('Ana12345'),       role: 'freelancer', bio: 'Diseñadora gráfica especializada en identidad visual.',   skills: ['Illustrator', 'Figma', 'Branding'], isActive: true });
  const carlos     = await User.create({ name: 'Carlos López',     email: 'carlos@freelancelocal.com',      password: await h('Carlos123'),      role: 'client',     isActive: true });
  const maria      = await User.create({ name: 'María Torres',     email: 'maria@freelancelocal.com',       password: await h('Maria1234'),      role: 'freelancer', bio: 'Especialista en marketing digital y SEO.',                skills: ['Marketing', 'SEO', 'Copywriting'], isActive: true });
  const pedro      = await User.create({ name: 'Pedro Ruiz',       email: 'pedro@freelancelocal.com',       password: await h('Pedro1234'),      role: 'client',     isActive: true });
  const laura      = await User.create({ name: 'Laura Méndez',     email: 'laura@freelancelocal.com',       password: await h('Laura123'),       role: 'freelancer', bio: 'Editora de video y motion graphics.',                    skills: ['Premiere', 'After Effects'], isActive: true });
  const diego      = await User.create({ name: 'Diego Silva',      email: 'diego@freelancelocal.com',       password: await h('Diego1234'),      role: 'client',     isActive: true });
  const sofia      = await User.create({ name: 'Sofía Romero',     email: 'sofia@freelancelocal.com',       password: await h('Sofia1234'),      role: 'freelancer', bio: 'Redactora creativa y traductora bilingüe.',              skills: ['Copywriting', 'Traducción', 'SEO'], isActive: true });
  const javier     = await User.create({ name: 'Javier Mora',      email: 'javier@freelancelocal.com',      password: await h('Javier123'),      role: 'client',     isBanned: true, isActive: false });
  console.log('11 usuarios creados');

  // ── SERVICIOS ─────────────────────────────────────────────────────────────
  const s = await Service.insertMany([
    // Desarrollo (free1)
    { freelancer: free1._id, title: 'Desarrollo de landing page en React',    description: 'Landing page responsive y optimizada. Incluye animaciones, formulario de contacto y despliegue en Vercel.', category: 'desarrollo', price: 300,  deliveryDays: 5,  images: ['https://images.unsplash.com/photo-1547658719-da2b51169166?w=800'], isActive: true  },
    { freelancer: free1._id, title: 'API REST con Node.js y MongoDB',          description: 'API RESTful completa con JWT, CRUD, validaciones y documentación Swagger.',                                  category: 'desarrollo', price: 500,  deliveryDays: 10, images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'], isActive: true  },
    { freelancer: free1._id, title: 'App móvil con React Native',              description: 'Aplicación móvil iOS/Android con auth, notificaciones push y backend propio.',                             category: 'desarrollo', price: 1200, deliveryDays: 21, images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800'], isActive: true  },
    { freelancer: free1._id, title: 'Consultoría técnica de 1 hora',           description: 'Sesión sobre arquitectura de software, revisión de código o planificación.',                               category: 'otro',       price: 80,   deliveryDays: 1,  images: ['https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800'],  isActive: true  },
    // Diseño (ana)
    { freelancer: ana._id,   title: 'Diseño de logo profesional',              description: '3 propuestas, revisiones ilimitadas y archivos en todos los formatos.',                                     category: 'diseño',     price: 150,  deliveryDays: 3,  images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800'], isActive: true  },
    { freelancer: ana._id,   title: 'Branding completo para startups',         description: 'Logo, paleta de colores, tipografía, tarjetas y guía de marca.',                                           category: 'diseño',     price: 450,  deliveryDays: 7,  images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800'],  isActive: true  },
    { freelancer: ana._id,   title: 'Diseño UI/UX para app en Figma',          description: 'Prototipo interactivo con flujos de usuario, wireframes y diseño final.',                                  category: 'diseño',     price: 600,  deliveryDays: 10, images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800'],  isActive: true  },
    { freelancer: ana._id,   title: 'Ilustración digital personalizada',       description: 'Ilustración a pedido: personajes, portadas, stickers.',                                                    category: 'diseño',     price: 200,  deliveryDays: 5,  images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800'], isActive: false },
    // Marketing (maria)
    { freelancer: maria._id, title: 'Gestión de redes sociales (1 mes)',       description: '3 publicaciones semanales en Instagram y Facebook con análisis de métricas.',                              category: 'marketing',  price: 200,  deliveryDays: 30, images: ['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800'], isActive: true  },
    { freelancer: maria._id, title: 'Estrategia SEO completa',                 description: 'Auditoría, investigación de keywords, optimización on-page y reporte mensual.',                           category: 'marketing',  price: 350,  deliveryDays: 14, images: ['https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800'], isActive: true  },
    { freelancer: maria._id, title: 'Campañas de Google Ads',                  description: 'Creación y gestión de campañas de búsqueda y display con seguimiento de conversiones.',                   category: 'marketing',  price: 400,  deliveryDays: 7,  images: ['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800'], isActive: true  },
    // Video (laura)
    { freelancer: laura._id, title: 'Video explicativo animado (1 min)',       description: 'Animación 2D con guión, locución en español y música de fondo.',                                          category: 'video',      price: 350,  deliveryDays: 7,  images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800'], isActive: true  },
    { freelancer: laura._id, title: 'Edición de video profesional',            description: 'Corte, color, subtítulos, música y efectos de transición para video corporativo.',                        category: 'video',      price: 180,  deliveryDays: 4,  images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800'], isActive: true  },
    // Redacción (sofia)
    { freelancer: sofia._id, title: 'Copywriting para web (5 páginas)',        description: 'Textos persuasivos y SEO para Home, About, Servicios, Blog y Contacto.',                                  category: 'redacción',  price: 250,  deliveryDays: 6,  images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800'], isActive: true  },
    { freelancer: sofia._id, title: 'Traducción español-inglés (5000 palabras)', description: 'Traducción profesional con edición y revisión, especializada en textos técnicos.',                      category: 'redacción',  price: 120,  deliveryDays: 3,  images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800'], isActive: true  },
  ]);
  console.log(`${s.length} servicios insertados`);

  // ── ÓRDENES ───────────────────────────────────────────────────────────────
  const orders = await Order.insertMany([
    { client: cliente._id, freelancer: free1._id, service: s[0]._id,  status: 'completed',  price: 300,  requirements: 'Landing para SaaS con sección de precios y testimonios.' },
    { client: carlos._id,  freelancer: ana._id,   service: s[4]._id,  status: 'completed',  price: 150,  requirements: 'Logo para agencia de viajes, colores azul y verde.' },
    { client: pedro._id,   freelancer: maria._id, service: s[8]._id,  status: 'in_progress',price: 200,  requirements: 'Manejar Instagram de restaurante, estilo informal y colorido.' },
    { client: diego._id,   freelancer: laura._id, service: s[11]._id, status: 'in_progress',price: 350,  requirements: 'Video 60s explicando app de delivery, tono dinámico.' },
    { client: cliente._id, freelancer: sofia._id, service: s[13]._id, status: 'pending',    price: 250,  requirements: 'Textos para tienda online de ropa, tono joven y moderno.' },
    { client: carlos._id,  freelancer: free1._id, service: s[1]._id,  status: 'completed',  price: 500,  requirements: 'API para e-commerce con carrito y pasarela de pagos.' },
    { client: pedro._id,   freelancer: ana._id,   service: s[5]._id,  status: 'cancelled',  price: 450,  requirements: 'Branding para startup de tecnología verde.' },
    { client: diego._id,   freelancer: sofia._id, service: s[14]._id, status: 'completed',  price: 120,  requirements: 'Traducción de manual técnico de 4000 palabras.' },
    { client: cliente._id, freelancer: free1._id, service: s[2]._id,  status: 'pending',    price: 1200, requirements: 'App de delivery de comida para iOS y Android.' },
    { client: carlos._id,  freelancer: maria._id, service: s[9]._id,  status: 'in_progress',price: 350,  requirements: 'SEO para tienda de muebles, quiero aparecer primero en Google.' },
  ]);
  console.log(`${orders.length} órdenes insertadas`);

  // ── RESEÑAS ───────────────────────────────────────────────────────────────
  const completed = orders.filter((o) => o.status === 'completed');
  await Review.insertMany([
    { order: completed[0]._id, reviewer: cliente._id, reviewed: free1._id, rating: 5, comment: 'Excelente trabajo, entregó antes del plazo y el resultado fue perfecto.' },
    { order: completed[1]._id, reviewer: carlos._id,  reviewed: ana._id,   rating: 5, comment: 'El logo superó mis expectativas, muy profesional y creativo.' },
    { order: completed[2]._id, reviewer: carlos._id,  reviewed: free1._id, rating: 4, comment: 'Muy buen trabajo en la API, documentación clara y código limpio.' },
    { order: completed[3]._id, reviewer: diego._id,   reviewed: sofia._id, rating: 5, comment: 'Traducción impecable, rápida y con excelente manejo del vocabulario técnico.' },
    { order: completed[0]._id, reviewer: cliente._id, reviewed: free1._id, rating: 4, comment: 'Buen comunicador, siempre disponible para resolver dudas.' },
  ].slice(0, completed.length));
  console.log('5 reseñas insertadas');

  // ── REPORTES ──────────────────────────────────────────────────────────────
  await Report.insertMany([
    { reporter: cliente._id, reported: free1._id, reason: 'El freelancer no entregó el trabajo en el plazo acordado.', status: 'pending' },
    { reporter: carlos._id,  service: s[8]._id,  reason: 'El servicio tiene información engañosa sobre los entregables.', status: 'reviewed' },
    { reporter: pedro._id,   reported: javier._id, reason: 'Comportamiento inapropiado en el chat.', status: 'resolved' },
  ]);
  console.log('3 reportes insertados');

  console.log('\n✅ Seed completado exitosamente');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  demo@demo.com                 / Demo1234        (client)     ← usuario de prueba');
  console.log('  yasper@email.com              / 123456          (freelancer) ← tu cuenta personal');
  console.log('  admin@freelancelocal.com      / Admin1234       (admin)');
  console.log('  cliente@freelancelocal.com    / Cliente1234     (client)');
  console.log('  freelancer@freelancelocal.com / Freelancer1234  (freelancer)');
  console.log('  ana@freelancelocal.com        / Ana12345        (freelancer)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
