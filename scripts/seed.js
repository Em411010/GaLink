import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/galink';

// ─── Schema (matches backend User.model.js) ──────────────────────────────────

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profilePhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  skills: [String],
  experience: { type: String, default: '' },
  hourlyRate: { type: Number, default: 0 },
  isFreelancer: { type: Boolean, default: false },
  isHirer: { type: Boolean, default: false },
  resumeUrl: { type: String, default: '' },
  resumeText: { type: String, default: '' },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  badgeLevel: { type: Number, default: 0 },
  phone: { type: String, default: '' },
  phoneVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  governmentId: mongoose.Schema.Types.Mixed,
  selfieUrl: { type: String, default: '' },
  selfieVerified: { type: Boolean, default: false },
  clearance: mongoose.Schema.Types.Mixed,
  portfolio: [{ title: String, description: String, imageUrl: String, link: String }],
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  imageUrl: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, content: String, createdAt: { type: Date, default: Date.now } }],
  tags: [String],
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

const reelSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  tags: [String],
  detectedSkills: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Reel = mongoose.model('Reel', reelSchema);

// ─── 30 Filipino Workers ─────────────────────────────────────────────────────

const users = [
  // ── LOW-LEVEL / SKILLED TRADES (10) ──
  {
    name: 'Mang Erning Dela Cruz',
    email: 'erning@example.com',
    bio: 'Master electrician with 20+ years. Wiring, panel installation, troubleshooting. Buong Metro Manila.',
    location: 'Quezon City, Metro Manila',
    isFreelancer: true,
    skills: ['Electrical Wiring', 'Panel Installation', 'Troubleshooting', 'Lighting', 'CCTV Installation'],
    experience: '20 years',
    hourlyRate: 350,
    averageRating: 4.8,
    totalRatings: 45,
  },
  {
    name: 'Kuya Boyet Ramos',
    email: 'boyet@example.com',
    bio: 'Carpenter & furniture maker. Custom cabinets, wooden frames, general woodwork. Mura at quality ang gawa.',
    location: 'Marikina, Metro Manila',
    isFreelancer: true,
    skills: ['Carpentry', 'Furniture Making', 'Cabinet Installation', 'Woodwork', 'Renovation'],
    experience: '15 years',
    hourlyRate: 400,
    averageRating: 5.0,
    totalRatings: 32,
  },
  {
    name: 'Tatay Domeng Bautista',
    email: 'domeng@example.com',
    bio: 'Licensed plumber. Tubero for 25 years — water line, drainage, septic tank, toilet repair.',
    location: 'Caloocan, Metro Manila',
    isFreelancer: true,
    skills: ['Plumbing', 'Pipe Fitting', 'Drainage', 'Septic Tank', 'Water Heater Installation'],
    experience: '25 years',
    hourlyRate: 300,
    averageRating: 4.6,
    totalRatings: 28,
  },
  {
    name: 'Aling Nena Villanueva',
    email: 'nena@example.com',
    bio: 'Professional house cleaner & deep cleaning specialist. Bahay, condo, office. Maasahan at matiyaga.',
    location: 'Pasig, Metro Manila',
    isFreelancer: true,
    skills: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning', 'Laundry', 'Organizing'],
    experience: '10 years',
    hourlyRate: 200,
    averageRating: 4.9,
    totalRatings: 60,
  },
  {
    name: 'Rod "Pintor" Magno',
    email: 'rod@example.com',
    bio: 'Professional painter — residential & commercial. Interior, exterior, waterproofing. Clean finish guaranteed.',
    location: 'Las Piñas, Metro Manila',
    isFreelancer: true,
    skills: ['Painting', 'Waterproofing', 'Epoxy Flooring', 'Wall Repair', 'Varnishing'],
    experience: '12 years',
    hourlyRate: 350,
    averageRating: 4.7,
    totalRatings: 38,
  },
  {
    name: 'Mang Tony Soriano',
    email: 'tony@example.com',
    bio: 'Mason & construction worker. Foundation, CHB walls, tiling, concrete finishing. Dala ko sarili kong tools.',
    location: 'Valenzuela, Metro Manila',
    isFreelancer: true,
    skills: ['Masonry', 'Tiling', 'Concrete Work', 'CHB Wall', 'Plastering'],
    experience: '18 years',
    hourlyRate: 380,
    averageRating: 4.5,
    totalRatings: 22,
  },
  {
    name: 'Jun "Welding King" Perez',
    email: 'jun@example.com',
    bio: 'Certified welder — steel gates, grills, railings, structural steel. Stick, MIG, TIG welding.',
    location: 'Taguig, Metro Manila',
    isFreelancer: true,
    skills: ['Welding', 'Steel Fabrication', 'Gate Making', 'Grillwork', 'Railing Installation'],
    experience: '14 years',
    hourlyRate: 450,
    averageRating: 4.8,
    totalRatings: 30,
  },
  {
    name: 'Lito Bernal',
    email: 'lito@example.com',
    bio: 'Aircon technician — cleaning, repair, installation. Window, split, cassette type. Freon recharging.',
    location: 'Mandaluyong, Metro Manila',
    isFreelancer: true,
    skills: ['Aircon Cleaning', 'Aircon Repair', 'Aircon Installation', 'HVAC', 'Freon Recharging'],
    experience: '8 years',
    hourlyRate: 400,
    averageRating: 4.6,
    totalRatings: 50,
  },
  {
    name: 'Danny Roofmaster Santos',
    email: 'danny@example.com',
    bio: 'Roofing specialist — yero replacement, gutter installation, waterproofing, leak repair. Walang tulo guaranteed.',
    location: 'Muntinlupa, Metro Manila',
    isFreelancer: true,
    skills: ['Roofing', 'Gutter Installation', 'Waterproofing', 'Leak Repair', 'Metal Works'],
    experience: '16 years',
    hourlyRate: 400,
    averageRating: 4.7,
    totalRatings: 25,
  },
  {
    name: 'Mang Carding Aquino',
    email: 'carding@example.com',
    bio: 'Gardener & landscaper. Lawn maintenance, pruning, plant installation, garden design. Green thumb since birth!',
    location: 'Antipolo, Rizal',
    isFreelancer: true,
    skills: ['Landscaping', 'Gardening', 'Lawn Maintenance', 'Pruning', 'Plant Installation'],
    experience: '12 years',
    hourlyRate: 250,
    averageRating: 4.9,
    totalRatings: 35,
  },

  // ── TUTORS & EDUCATORS (10) ──
  {
    name: 'Teacher Jessa Mendoza',
    email: 'jessa@example.com',
    bio: 'Licensed math tutor — Grade 1 to College Algebra. Patient and engaging teaching style. Online & face-to-face.',
    location: 'Makati, Metro Manila',
    isFreelancer: true,
    skills: ['Math Tutoring', 'Algebra', 'Calculus', 'Statistics', 'Online Teaching'],
    experience: '8 years',
    hourlyRate: 500,
    averageRating: 4.9,
    totalRatings: 55,
  },
  {
    name: 'Sir Mark Evangelista',
    email: 'mark@example.com',
    bio: 'English & Filipino language tutor. IELTS prep, business English, creative writing. LET passer.',
    location: 'Quezon City, Metro Manila',
    isFreelancer: true,
    skills: ['English Tutoring', 'IELTS Preparation', 'Filipino Language', 'Creative Writing', 'Business English'],
    experience: '6 years',
    hourlyRate: 450,
    averageRating: 4.8,
    totalRatings: 40,
  },
  {
    name: 'Ms. Patricia Lim',
    email: 'patricia@example.com',
    bio: 'Science tutor specializing in Physics & Chemistry. Board exam reviewer. Makes science fun & easy to understand.',
    location: 'Pasig, Metro Manila',
    isFreelancer: true,
    skills: ['Physics Tutoring', 'Chemistry Tutoring', 'Science Education', 'Board Exam Review', 'Lab Experiments'],
    experience: '10 years',
    hourlyRate: 550,
    averageRating: 4.7,
    totalRatings: 33,
  },
  {
    name: 'Ate Camille Reyes',
    email: 'camille@example.com',
    bio: 'Music teacher — piano, guitar, voice lessons. Classical & contemporary. Kids & adults welcome!',
    location: 'San Juan, Metro Manila',
    isFreelancer: true,
    skills: ['Piano Lessons', 'Guitar Lessons', 'Voice Training', 'Music Theory', 'Songwriting'],
    experience: '7 years',
    hourlyRate: 600,
    averageRating: 5.0,
    totalRatings: 28,
  },
  {
    name: 'Coach Ricky Torres',
    email: 'ricky@example.com',
    bio: 'CSEE & CPALE reviewer. Accounting, auditing, business law. 80%+ passing rate sa mga tutees ko.',
    location: 'Manila, Metro Manila',
    isFreelancer: true,
    skills: ['Accounting Tutoring', 'Auditing', 'Business Law', 'Board Exam Review', 'Financial Analysis'],
    experience: '9 years',
    hourlyRate: 700,
    averageRating: 4.8,
    totalRatings: 42,
  },
  {
    name: 'Teacher Bea Cruz',
    email: 'bea@example.com',
    bio: 'Early childhood educator & reading tutor. Phonics, reading comprehension, homework help. K-3 specialist.',
    location: 'Parañaque, Metro Manila',
    isFreelancer: true,
    skills: ['Reading Tutoring', 'Phonics', 'Early Childhood Education', 'Homework Help', 'Special Education'],
    experience: '5 years',
    hourlyRate: 350,
    averageRating: 4.9,
    totalRatings: 48,
  },
  {
    name: 'Kuya Kevin Tan',
    email: 'kevin@example.com',
    bio: 'Japanese language tutor — N5 to N2 level. Conversational Japanese, JLPT prep. Lived in Japan for 3 years.',
    location: 'Makati, Metro Manila',
    isFreelancer: true,
    skills: ['Japanese Language', 'JLPT Preparation', 'Translation', 'Conversational Japanese', 'Business Japanese'],
    experience: '4 years',
    hourlyRate: 600,
    averageRating: 4.7,
    totalRatings: 20,
  },
  {
    name: 'Ms. Diana Flores',
    email: 'diana@example.com',
    bio: 'Art & design teacher. Drawing, painting, digital illustration. Portfolio prep for college applicants.',
    location: 'Marikina, Metro Manila',
    isFreelancer: true,
    skills: ['Drawing Lessons', 'Painting', 'Digital Illustration', 'Art Teaching', 'Portfolio Preparation'],
    experience: '6 years',
    hourlyRate: 500,
    averageRating: 4.8,
    totalRatings: 22,
  },
  {
    name: 'Coach Enzo Navarro',
    email: 'enzo@example.com',
    bio: 'Fitness trainer & swimming instructor. Weight training, HIIT, swim lessons for all ages. Certified by PSSF.',
    location: 'Taguig, Metro Manila',
    isFreelancer: true,
    skills: ['Personal Training', 'Swimming Lessons', 'HIIT', 'Weight Training', 'Sports Coaching'],
    experience: '8 years',
    hourlyRate: 800,
    averageRating: 4.9,
    totalRatings: 37,
  },
  {
    name: 'Sir Joel Ramirez',
    email: 'joel@example.com',
    bio: 'Driving instructor — manual & automatic. LTO exam prep, defensive driving. Very patient with beginners.',
    location: 'Caloocan, Metro Manila',
    isFreelancer: true,
    skills: ['Driving Lessons', 'LTO Exam Prep', 'Defensive Driving', 'Manual Transmission', 'Automatic Transmission'],
    experience: '10 years',
    hourlyRate: 400,
    averageRating: 4.6,
    totalRatings: 58,
  },

  // ── TECH (10) ──
  {
    name: 'Maria Santos',
    email: 'maria@example.com',
    bio: 'Full-stack developer — React, Node.js, MongoDB. 5 years building web apps for startups & enterprises.',
    location: 'Makati, Metro Manila',
    isFreelancer: true,
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind CSS'],
    experience: '5 years',
    hourlyRate: 1200,
    averageRating: 4.8,
    totalRatings: 12,
  },
  {
    name: 'Carlos Garcia',
    email: 'carlos@example.com',
    bio: 'DevOps engineer & cloud architect. AWS certified. CI/CD pipelines, containerization, infrastructure as code.',
    location: 'Taguig, Metro Manila',
    isFreelancer: true,
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
    experience: '7 years',
    hourlyRate: 1500,
    averageRating: 4.7,
    totalRatings: 10,
  },
  {
    name: 'Ana Reyes',
    email: 'ana@example.com',
    bio: 'Mobile developer — React Native & Flutter. Published 10+ apps on Play Store & App Store.',
    location: 'Manila, Metro Manila',
    isFreelancer: true,
    skills: ['React Native', 'Flutter', 'Dart', 'JavaScript', 'Firebase'],
    experience: '4 years',
    hourlyRate: 1100,
    averageRating: 4.9,
    totalRatings: 15,
  },
  {
    name: 'Juan dela Cruz',
    email: 'juan@example.com',
    bio: 'UI/UX designer — Figma, Adobe XD. User research, wireframing, design systems. Nagawa na ng platform UI for 3 startups.',
    location: 'Quezon City, Metro Manila',
    isFreelancer: true,
    skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems'],
    experience: '3 years',
    hourlyRate: 900,
    averageRating: 4.5,
    totalRatings: 8,
  },
  {
    name: 'Trisha Mae Villanueva',
    email: 'trisha@example.com',
    bio: 'Data analyst & Python developer. Power BI, SQL, machine learning. Helped companies make data-driven decisions.',
    location: 'Pasig, Metro Manila',
    isFreelancer: true,
    skills: ['Python', 'SQL', 'Power BI', 'Data Analysis', 'Machine Learning', 'Pandas'],
    experience: '4 years',
    hourlyRate: 1000,
    averageRating: 4.8,
    totalRatings: 18,
  },
  {
    name: 'Miguel Hernandez',
    email: 'miguel@example.com',
    bio: 'Cybersecurity consultant. Penetration testing, network security, SOC analysis. CEH & CompTIA Security+ certified.',
    location: 'Mandaluyong, Metro Manila',
    isFreelancer: true,
    skills: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'Security Auditing', 'Ethical Hacking'],
    experience: '6 years',
    hourlyRate: 1800,
    averageRating: 4.9,
    totalRatings: 14,
  },
  {
    name: 'Ria Concepcion',
    email: 'ria@example.com',
    bio: 'Graphic designer & video editor. Branding, social media content, motion graphics. Adobe Creative Suite expert.',
    location: 'Makati, Metro Manila',
    isFreelancer: true,
    skills: ['Graphic Design', 'Video Editing', 'Motion Graphics', 'Branding', 'Adobe Premiere', 'After Effects'],
    experience: '5 years',
    hourlyRate: 800,
    averageRating: 4.7,
    totalRatings: 25,
  },
  {
    name: 'Jericho Lim',
    email: 'jericho@example.com',
    bio: 'WordPress & Shopify developer. E-commerce specialist — 50+ online stores built. SEO & speed optimization.',
    location: 'Pasay, Metro Manila',
    isFreelancer: true,
    skills: ['WordPress', 'Shopify', 'SEO', 'E-commerce', 'PHP', 'WooCommerce'],
    experience: '6 years',
    hourlyRate: 700,
    averageRating: 4.6,
    totalRatings: 35,
  },
  {
    name: 'Nikki Tan',
    email: 'nikki@example.com',
    bio: 'Social media manager & content creator. Strategy, scheduling, analytics. Handled brands with 100K+ followers.',
    location: 'San Juan, Metro Manila',
    isFreelancer: true,
    skills: ['Social Media Management', 'Content Creation', 'Copywriting', 'Analytics', 'Community Management'],
    experience: '4 years',
    hourlyRate: 600,
    averageRating: 4.8,
    totalRatings: 30,
  },
  {
    name: 'Paolo Mendoza',
    email: 'paolo@example.com',
    bio: 'Looking for talented developers and workers for my projects. Always hiring Filipino talent!',
    location: 'Pasig, Metro Manila',
    isFreelancer: false,
    skills: [],
    experience: '0',
    hourlyRate: 0,
    averageRating: 0,
    totalRatings: 0,
  },
];

// ─── Sample Videos (free public MP4s for testing) ───────────────────────────
const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
];

// ─── Sample Reels ─────────────────────────────────────────────────────────────
const reelsData = [
  {
    description: 'Panel installation done! Complete rewiring ng 2-storey house sa QC. Safe at up to code. 🔌 #electrician #panelinstallation',
    tags: ['electrical', 'construction', 'panelinstallation'],
    detectedSkills: ['Electrical Wiring', 'Panel Installation'],
    views: 1240,
    duration: 45,
    userEmail: 'erning@example.com',
  },
  {
    description: 'Custom sala set mula sa solid narra wood! Gawa ko mula simula hanggang katapusan. 🪵 DM for orders!',
    tags: ['carpentry', 'furniture', 'woodwork'],
    detectedSkills: ['Carpentry', 'Furniture Making'],
    views: 3200,
    duration: 60,
    userEmail: 'boyet@example.com',
  },
  {
    description: 'Before & after ng bathroom renovation — bagong tiles, toilet, at shower system. 🚿 #plumbing #renovation',
    tags: ['plumbing', 'renovation', 'bathroom'],
    detectedSkills: ['Plumbing', 'Tiling'],
    views: 5800,
    duration: 72,
    userEmail: 'domeng@example.com',
  },
  {
    description: 'React + Node.js full-stack app build in 60 seconds ⚡ From setup to deployment. #webdev #fullstack',
    tags: ['webdev', 'react', 'nodejs'],
    detectedSkills: ['React', 'Node.js', 'MongoDB'],
    views: 8900,
    duration: 58,
    userEmail: 'maria@example.com',
  },
  {
    description: 'UI/UX design process — wireframe to high-fidelity prototype in Figma. Watch me design a mobile app! 🎨',
    tags: ['uidesign', 'figma', 'ux'],
    detectedSkills: ['Figma', 'UI Design', 'Prototyping'],
    views: 12000,
    duration: 90,
    userEmail: 'juan@example.com',
  },
  {
    description: 'Piano recital piece by my 8-year-old student — Fur Elise, complete! 🎹 So proud of her progress!',
    tags: ['piano', 'teaching', 'music'],
    detectedSkills: ['Piano Lessons', 'Music Theory'],
    views: 4500,
    duration: 120,
    userEmail: 'camille@example.com',
  },
  {
    description: 'Aircon deep cleaning — ito yung dumi na lumalabas! 😱 Regular cleaning = mas malamig at mas matipid sa kuryente. #aircon',
    tags: ['aircon', 'cleaning', 'maintenance'],
    detectedSkills: ['Aircon Cleaning', 'HVAC'],
    views: 22000,
    duration: 55,
    userEmail: 'lito@example.com',
  },
  {
    description: 'Steel gate fabrication from scratch — design, cutting, welding, painting. 🔧 #welding #steelgate',
    tags: ['welding', 'fabrication', 'gate'],
    detectedSkills: ['Welding', 'Steel Fabrication', 'Gate Making'],
    views: 7600,
    duration: 80,
    userEmail: 'jun@example.com',
  },
  {
    description: 'Data visualization dashboard built in Python & Power BI — sales insights in minutes! 📊 #datascience',
    tags: ['python', 'powerbi', 'datascience'],
    detectedSkills: ['Python', 'Power BI', 'Data Analysis'],
    views: 6100,
    duration: 65,
    userEmail: 'trisha@example.com',
  },
  {
    description: 'Social media content strategy — how I grew a brand from 2K to 100K followers in 6 months! 🚀 #socialmedia',
    tags: ['socialmedia', 'contentcreation', 'marketing'],
    detectedSkills: ['Social Media Management', 'Content Creation', 'Analytics'],
    views: 18500,
    duration: 95,
    userEmail: 'nikki@example.com',
  },
  {
    description: 'Rooftop waterproofing — never tumulo ulit! Step-by-step process para walang leaks. 🏠 #roofing #waterproofing',
    tags: ['roofing', 'waterproofing', 'construction'],
    detectedSkills: ['Roofing', 'Waterproofing', 'Leak Repair'],
    views: 9300,
    duration: 70,
    userEmail: 'danny@example.com',
  },
  {
    description: 'AWS cloud architecture walkthrough — how I set up a scalable infra for a startup on minimal budget ☁️ #devops #aws',
    tags: ['aws', 'devops', 'cloud'],
    detectedSkills: ['AWS', 'Docker', 'CI/CD'],
    views: 14200,
    duration: 110,
    userEmail: 'carlos@example.com',
  },
];

// ─── Sample Posts (30 work-related posts with images) ─────────────────────────

const posts = [
  {
    content: 'Just finished rewiring a 3-storey commercial building in QC! 🔌 Lahat ng outlet at panel board — clean, safe, at code-compliant. 20+ years na ako sa electrical work, quality at safety lagi ang priority ko. Available pa rin for residential jobs!',
    tags: ['electrical', 'construction', 'panelinstallation'],
    imageUrl: 'https://picsum.photos/seed/electrical-panel/800/600',
    userEmail: 'erning@example.com',
  },
  {
    content: 'Custom sala set gawa sa solid narra — mula raw lumber hanggang finished product! 🪵 Hand-finished, tatagal ng dekada. Open for orders across Metro Manila. DM mo ko para sa quotation.',
    tags: ['carpentry', 'furniture', 'woodwork'],
    imageUrl: 'https://picsum.photos/seed/woodwork-sala/800/600',
    userEmail: 'boyet@example.com',
  },
  {
    content: 'Before & after ng bathroom rehab sa Pasig — bagong tiles, bowl, shower system, at complete pipework. 🚿 Masayang trabaho at masaya ang client! Licensed plumber, 25 years experience.',
    tags: ['plumbing', 'renovation', 'bathroom'],
    imageUrl: 'https://picsum.photos/seed/bathroom-reno/800/600',
    userEmail: 'domeng@example.com',
  },
  {
    content: 'Deep cleaning transformation para sa 2-bedroom condo sa Pasig! 🧹 Bago at pagkatapos — grout scrubbing, appliance degreasing, carpet shampooing. Book na for your home or office!',
    tags: ['cleaning', 'deepclean', 'condo'],
    imageUrl: 'https://picsum.photos/seed/cleaning-condo/800/600',
    userEmail: 'nena@example.com',
  },
  {
    content: 'Fresh exterior paint job sa 2-storey house sa Las Piñas! 🎨 Weathershield paint, clean lines, walang drip. Interior work din available. Libre estimate — message me para sa schedule.',
    tags: ['painting', 'exteriorpaint', 'renovation'],
    imageUrl: 'https://picsum.photos/seed/house-painting/800/600',
    userEmail: 'rod@example.com',
  },
  {
    content: 'CHB wall at concrete flooring ng bodega — done in 3 days! 🧱 Reinforced footing, plastered at painted. 18 years ako sa masonry work. Kahit malaki o maliit na project, kaya ko!',
    tags: ['masonry', 'construction', 'concrete'],
    imageUrl: 'https://picsum.photos/seed/masonry-wall/800/600',
    userEmail: 'tony@example.com',
  },
  {
    content: 'Steel security gate fabricated and installed — designed by the client, built by me! 🔩 MIG welded, primered, at powder-coated for rust resistance. Taguig area, same-week delivery available.',
    tags: ['welding', 'steelgate', 'fabrication'],
    imageUrl: 'https://picsum.photos/seed/steel-gate/800/600',
    userEmail: 'jun@example.com',
  },
  {
    content: 'Aircon deep cleaning result — shocking kung gaano karumi ang lumalabas! 😱 Hindi lang cosmetic — nakakaapekto sa cooling efficiency at kuryente. Book regular clean every 3 months. Covered ang Metro Manila!',
    tags: ['aircon', 'deepclean', 'hvac'],
    imageUrl: 'https://picsum.photos/seed/aircon-clean/800/600',
    userEmail: 'lito@example.com',
  },
  {
    content: 'Rooftop waterproofing completed sa unit sa Muntinlupa — zero leaks guaranteed! ☔ Applied 3-layer elastomeric coating with fiber mesh. Before & after photos below. 5-year workmanship warranty.',
    tags: ['roofing', 'waterproofing', 'construction'],
    imageUrl: 'https://picsum.photos/seed/roof-waterproofing/800/600',
    userEmail: 'danny@example.com',
  },
  {
    content: 'Garden makeover para sa subdivision home sa Antipolo! 🌿 Nagdagdag ng ornamental plants, lawn leveling, at stone pathway. Ang dumi ng yard bago, ang ganda na ngayon. Available across Rizal & East Metro Manila.',
    tags: ['landscaping', 'gardening', 'renovation'],
    imageUrl: 'https://picsum.photos/seed/garden-landscape/800/600',
    userEmail: 'carding@example.com',
  },
  {
    content: 'Student passed the UP Diliman entrance exam with a score of 98/100 in Math! 🎉 3 months of intensive review — personalized approach, no one-size-fits-all. Slots available for incoming Grade 12 students.',
    tags: ['mathtutoring', 'upcat', 'education'],
    imageUrl: 'https://picsum.photos/seed/math-tutoring/800/600',
    userEmail: 'jessa@example.com',
  },
  {
    content: 'My IELTS student scored Band 8.0 overall — she needed 7.5 for her UK visa application! 🇬🇧 Customized mock tests, grammar drilling, and speaking practice. IELTS & OET preparation available online.',
    tags: ['ielts', 'english', 'tutoring'],
    imageUrl: 'https://picsum.photos/seed/ielts-study/800/600',
    userEmail: 'mark@example.com',
  },
  {
    content: 'Board exam results are out — 4 out of 5 ng reviewees ko pumasa sa LET Science! 🧪 Full coverage ng Gen Science, Physics, Chemistry, and Biology. Enrollment open for the next batch.',
    tags: ['letreview', 'sciencetutoring', 'education'],
    imageUrl: 'https://picsum.photos/seed/science-lab/800/600',
    userEmail: 'patricia@example.com',
  },
  {
    content: 'My 9-year-old student just performed Moonlight Sonata at their school recital! 🎹 2 years of consistent lessons — from basic finger exercises to Beethoven. Piano lessons for kids & adults, weekends in San Juan.',
    tags: ['piano', 'musicteacher', 'kidslessons'],
    imageUrl: 'https://picsum.photos/seed/piano-lessons/800/600',
    userEmail: 'camille@example.com',
  },
  {
    content: 'Batch 2025 CPALE review results — 7 out of 8 ng group ko pumasa! 📊 Accounting, Auditing, Tax, and Business Law covered. New batch starts next month. Limited slots — message now to reserve.',
    tags: ['cpale', 'cpa', 'accounting', 'boardreview'],
    imageUrl: 'https://picsum.photos/seed/accounting-review/800/600',
    userEmail: 'ricky@example.com',
  },
  {
    content: 'Phonics reading breakthrough — my Grade 1 student went from non-reader to reading full sentences in 8 weeks! 📚 Customized reading plan using multi-sensory techniques. Home visit sessions in Parañaque & Las Piñas.',
    tags: ['phonics', 'readingtutoring', 'earlyeducation'],
    imageUrl: 'https://picsum.photos/seed/reading-kids/800/600',
    userEmail: 'bea@example.com',
  },
  {
    content: 'JLPT N3 student passed with 95%! 🇯🇵 Intensive 6-month program covering kanji, grammar, listening, and reading comprehension. Currently accepting students for N5 and N4 levels. Video call sessions available.',
    tags: ['japanese', 'jlpt', 'languagetutoring'],
    imageUrl: 'https://picsum.photos/seed/japanese-study/800/600',
    userEmail: 'kevin@example.com',
  },
  {
    content: 'Portfolio prep results — 3 out of 4 ng students ko na-accept sa their top choice architecture schools! 🖼️ We worked on figure drawing, perspective, and digital rendering using Procreate and Illustrator.',
    tags: ['artteaching', 'portfolio', 'drawing'],
    imageUrl: 'https://picsum.photos/seed/art-portfolio/800/600',
    userEmail: 'diana@example.com',
  },
  {
    content: 'Client transformation after 12 weeks of personalized training — down 8kg, body fat from 28% to 19%! 💪 Strength + cardio + nutrition plan combined. Online and face-to-face programs available in BGC area.',
    tags: ['personaltraining', 'fitness', 'weightloss'],
    imageUrl: 'https://picsum.photos/seed/fitness-training/800/600',
    userEmail: 'enzo@example.com',
  },
  {
    content: 'Student passed the LTO written exam on the FIRST try! 🚗 5-session program covering traffic signs, road rules, and defensive driving theory. Practical driving lessons available on manual and automatic.',
    tags: ['drivinginstructor', 'lto', 'driving'],
    imageUrl: 'https://picsum.photos/seed/driving-lesson/800/600',
    userEmail: 'joel@example.com',
  },
  {
    content: 'Just shipped v2.0 of an e-commerce platform for a local brand — React + Node.js + MongoDB stack! 🚀 Features: real-time inventory, COD tracking, and admin analytics dashboard. Open for freelance web dev projects.',
    tags: ['webdev', 'react', 'nodejs', 'ecommerce'],
    imageUrl: 'https://picsum.photos/seed/web-development/800/600',
    userEmail: 'maria@example.com',
  },
  {
    content: 'Migrated a startup from a single VPS to a fully containerized AWS ECS setup — zero downtime, 60% cost reduction! ☁️ Terraform + Docker + GitHub Actions CI/CD pipeline. Available for cloud architecture consultations.',
    tags: ['aws', 'devops', 'docker', 'cicd'],
    imageUrl: 'https://picsum.photos/seed/cloud-devops/800/600',
    userEmail: 'carlos@example.com',
  },
  {
    content: 'Launched a cross-platform delivery app on both App Store and Google Play — built in React Native! 📱 Real-time tracking, push notifications, and driver dashboard included. Taking on new mobile dev projects.',
    tags: ['reactnative', 'mobiledev', 'appstore'],
    imageUrl: 'https://picsum.photos/seed/mobile-app/800/600',
    userEmail: 'ana@example.com',
  },
  {
    content: 'Complete UI redesign for a fintech startup — from wireframes to dev-ready Figma components in 3 weeks! 🎨 Improved task completion rate by 40% in user testing. Available for design system and UX audit projects.',
    tags: ['uidesign', 'figma', 'uxdesign', 'fintech'],
    imageUrl: 'https://picsum.photos/seed/ui-design/800/600',
    userEmail: 'juan@example.com',
  },
  {
    content: 'Built a real-time sales intelligence dashboard in Power BI connected to 5 data sources! 📊 Automated ETL pipeline in Python, refreshes hourly. Helped the client cut reporting time from 2 days to 10 minutes.',
    tags: ['powerbi', 'python', 'dataanalytics', 'datascience'],
    imageUrl: 'https://picsum.photos/seed/data-dashboard/800/600',
    userEmail: 'trisha@example.com',
  },
  {
    content: 'Completed a penetration test for an MSME — found 3 critical vulnerabilities before they could be exploited! 🔐 SQL injection, exposed admin panel, weak session tokens — all patched and verified. VAPT reports available.',
    tags: ['cybersecurity', 'pentest', 'infosec'],
    imageUrl: 'https://picsum.photos/seed/cybersecurity/800/600',
    userEmail: 'miguel@example.com',
  },
  {
    content: 'Brand identity package delivered for a new food startup — logo, color palette, packaging mockups, and social media templates! 🎨 All in Adobe Illustrator and Photoshop. Taking new branding and video editing clients.',
    tags: ['graphicdesign', 'branding', 'logo'],
    imageUrl: 'https://picsum.photos/seed/brand-design/800/600',
    userEmail: 'ria@example.com',
  },
  {
    content: 'New Shopify store launched for a local clothing brand — custom theme, upsell funnels, and abandoned cart emails all set up! 🛒 Speed score: 94/100. First week revenue hit ₱180K. Open for e-commerce projects.',
    tags: ['shopify', 'ecommerce', 'webdev'],
    imageUrl: 'https://picsum.photos/seed/shopify-store/800/600',
    userEmail: 'jericho@example.com',
  },
  {
    content: 'Grew a local restaurant brand from 3K to 85K Instagram followers in 5 months! 🍽️ Content calendar, daily stories, collabs with micro-influencers, and paid ad optimization. Accepting new social media management retainers.',
    tags: ['socialmedia', 'instagram', 'contentcreation'],
    imageUrl: 'https://picsum.photos/seed/social-media/800/600',
    userEmail: 'nikki@example.com',
  },
  {
    content: 'Completed a full home installation: 30 LED downlights, 3 circuit breakers, and a smart switch system wired throughout a brand new house in Antipolo. 💡 Swipe to see the panel box work. Clean wiring is safe wiring!',
    tags: ['electrical', 'smartswitch', 'newhome'],
    imageUrl: 'https://picsum.photos/seed/electrical-home/800/600',
    userEmail: 'erning@example.com',
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to ${MONGODB_URI}`);

    console.log('Clearing existing data...');
    await User.deleteMany({});
    // Drop any geo indexes on location field from previous schema
    try { await mongoose.connection.collection('users').dropIndexes(); } catch (_) {}
    await Post.deleteMany({});
    await Reel.deleteMany({});

    console.log('Creating 30 users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Assign badge levels for variety:
    // Level 3 (Verified Freelancer): top-rated freelancers with clearance + rating
    // Level 2 (Freelancer): freelancers with full profile but no clearance
    // Level 1 (Hirer): identity-verified but no freelancer profile
    // Level 0: unverified client
    const badgeOverrides = {
      // Level 3 — Verified Freelancer + Hirer (passed all checks)
      'erning@example.com':  { badgeLevel: 3, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234001', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, clearance: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'NBI Clearance', verified: true, uploadedAt: new Date() }, isVerified: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'Panel Installation — QC Commercial', description: 'Complete rewiring of 2-storey building', imageUrl: 'https://picsum.photos/seed/port1/400/300' }] },
      'boyet@example.com':   { badgeLevel: 3, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234002', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, clearance: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Barangay Clearance', verified: true, uploadedAt: new Date() }, isVerified: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'Custom Narra Sala Set', description: 'Solid wood furniture made from scratch', imageUrl: 'https://picsum.photos/seed/port2/400/300' }] },
      'maria@example.com':   { badgeLevel: 3, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234003', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Passport', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, clearance: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'NBI Clearance', verified: true, uploadedAt: new Date() }, isVerified: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'E-Commerce Platform', description: 'React + Node.js full-stack build', imageUrl: 'https://picsum.photos/seed/port3/400/300', link: 'https://example.com' }] },
      'nena@example.com':    { badgeLevel: 3, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234004', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, clearance: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Police Clearance', verified: true, uploadedAt: new Date() }, isVerified: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'Deep Cleaning Service', description: 'Before & after condo deep clean', imageUrl: 'https://picsum.photos/seed/port4/400/300' }] },
      'jessa@example.com':   { badgeLevel: 3, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234005', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, clearance: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'NBI Clearance', verified: true, uploadedAt: new Date() }, isVerified: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'Math Curriculum Design', description: 'Custom learning program for K-12' }] },

      // Level 2 — Freelancer + Hirer (verified identity + full work profile)
      'domeng@example.com':  { badgeLevel: 2, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234010', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, isFreelancer: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'Bathroom Renovation', description: 'Complete bathroom rehab', imageUrl: 'https://picsum.photos/seed/port5/400/300' }] },
      'rod@example.com':     { badgeLevel: 2, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234011', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Drivers License', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, isFreelancer: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'House Exterior Paint Job', imageUrl: 'https://picsum.photos/seed/port6/400/300' }] },
      'carlos@example.com':  { badgeLevel: 2, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234012', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Passport', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, isFreelancer: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'AWS Infra for Startup', description: 'Cloud architecture design', imageUrl: 'https://picsum.photos/seed/port7/400/300', link: 'https://example.com' }] },
      'trisha@example.com':  { badgeLevel: 2, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234013', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, isFreelancer: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'Sales Dashboard', description: 'Power BI analytics dashboard' }] },
      'camille@example.com': { badgeLevel: 2, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234014', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, isFreelancer: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'Student Recital — Fur Elise' }] },
      'jun@example.com':     { badgeLevel: 2, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234015', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true, isFreelancer: true, resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf', portfolio: [{ title: 'Steel Gate Fabrication', imageUrl: 'https://picsum.photos/seed/port8/400/300' }] },

      // Level 1 — Hirer only (identity verified, no freelancer profile)
      'tony@example.com':    { badgeLevel: 1, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234020', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true },
      'lito@example.com':    { badgeLevel: 1, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234021', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Drivers License', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true },
      'kevin@example.com':   { badgeLevel: 1, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234022', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Passport', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true },
      'paolo@example.com':   { badgeLevel: 1, isHirer: true, emailVerified: true, phoneVerified: true, phone: '+639171234030', governmentId: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', type: 'Philippine National ID', verified: true, uploadedAt: new Date() }, selfieUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', selfieVerified: true },
    };

    const createdUsers = await User.insertMany(
      users.map(u => ({
        ...u,
        password: hashedPassword,
        ...(badgeOverrides[u.email] || {}),
      }))
    );
    console.log(`  ✓ Created ${createdUsers.length} users`);

    const freelancers = createdUsers.filter(u => u.isFreelancer);
    console.log(`    → ${freelancers.length} freelancers, ${createdUsers.length - freelancers.length} client(s)`);

    const userEmailMap = Object.fromEntries(createdUsers.map(u => [u.email, u]));

    console.log('Creating posts...');
    const createdPosts = await Post.insertMany(
      posts.map((p, i) => {
        const { userEmail, ...postFields } = p;
        const author = userEmail && userEmailMap[userEmail]
          ? userEmailMap[userEmail]
          : freelancers[i % freelancers.length];
        return { ...postFields, author: author._id };
      })
    );
    console.log(`  ✓ Created ${createdPosts.length} posts`);

    console.log('Creating reels...');
    const createdReels = await Reel.insertMany(
      reelsData.map((r, i) => {
        const { userEmail, ...reelFields } = r;
        const author = userEmailMap[userEmail] || freelancers[i % freelancers.length];
        return {
          ...reelFields,
          author: author._id,
          videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
          thumbnailUrl: `https://picsum.photos/seed/reel${i + 1}/400/700`,
        };
      })
    );
    console.log(`  ✓ Created ${createdReels.length} reels`);

    console.log('\n════════════════════════════════════════');
    console.log('  SEED COMPLETE — 30 Filipino Workers + Reels + Badges');
    console.log('════════════════════════════════════════');
    console.log('\nAll passwords: password123\n');

    const badgeLabels = ['Unverified', 'Hirer', 'Freelancer', 'Verified'];
    [3, 2, 1, 0].forEach(lvl => {
      const group = createdUsers.filter(u => (u.badgeLevel || 0) === lvl);
      if (group.length) {
        console.log(`\n── ${badgeLabels[lvl]} (Level ${lvl}) ──`);
        group.forEach(u => console.log(`  ${u.email.padEnd(24)} ${u.name}`));
      }
    });
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
