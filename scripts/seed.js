import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', 'backend', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/galink';

// ─── Schemas (mirrors backend models) ────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profilePhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  skills: [String],
  serviceCategories: [String],
  experience: { type: String, default: '' },
  yearsOfExperience: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  rateType: { type: String, default: '' },
  serviceAreas: [String],
  availableDays: [String],
  availableFrom: Date,
  completedJobs: { type: Number, default: 0 },
  isFreelancer: { type: Boolean, default: false },
  isHirer: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  isOpenForWork: { type: Boolean, default: true },
  resumeUrl: { type: String, default: '' },
  resumeText: { type: String, default: '' },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  badgeLevel: { type: Number, default: 0 },
  emailVerified: { type: Boolean, default: false },
  governmentId: mongoose.Schema.Types.Mixed,
  selfieUrl: { type: String, default: '' },
  selfieVerified: { type: Boolean, default: false },
  kycStatus: { type: String, default: '' },
  kycRejectedReason: { type: String, default: '' },
  clearance: mongoose.Schema.Types.Mixed,
  clearanceStatus: { type: String, default: '' },
  clearanceRejectedReason: { type: String, default: '' },
  portfolio: [{ title: String, description: String, imageUrl: String, link: String }],
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  imageUrl: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
    replies: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      createdAt: { type: Date, default: Date.now },
    }],
  }],
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

// ─── Face profile photos (randomuser.me — stable seeded faces) ───────────────

const face = (gender, i) => `https://randomuser.me/api/portraits/${gender}/${i}.jpg`;

// ─── Sample Videos (free public MP4s) ────────────────────────────────────────

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
];

// ─── KYC placeholder images ─────────────────────────────────────────────────

const GOV_ID_IMG = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
const SELFIE_IMG = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

// ─── 40 Filipino Workers ─────────────────────────────────────────────────────

const users = [
  // ══════════════════════════════════════════════════════════════════════════
  // TECH (5)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    bio: 'Full-stack developer — React, Node.js, MongoDB. 5 years building web apps for startups & enterprises.',
    location: 'Makati, Metro Manila',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind CSS'],
    serviceCategories: ['Web Development'],
    experience: '5 years',
    yearsOfExperience: 5,
    hourlyRate: 1200,
    rateType: 'hourly',
    serviceAreas: ['Makati', 'Taguig', 'Pasig', 'Mandaluyong'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 28,
    averageRating: 4.8,
    totalRatings: 12,
    profilePhoto: face('women', 1),
  },
  {
    name: 'Carlos Garcia',
    email: 'carlos.garcia@example.com',
    bio: 'DevOps engineer & cloud architect. AWS certified. CI/CD pipelines, containerization, infrastructure as code.',
    location: 'Taguig, Metro Manila',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    serviceCategories: ['IT Support', 'Network Administration'],
    experience: '7 years',
    yearsOfExperience: 7,
    hourlyRate: 1500,
    rateType: 'hourly',
    serviceAreas: ['Taguig', 'Makati', 'Pasig'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 35,
    averageRating: 4.7,
    totalRatings: 10,
    profilePhoto: face('men', 1),
  },
  {
    name: 'Ana Reyes',
    email: 'ana.reyes@example.com',
    bio: 'Mobile developer — React Native & Flutter. Published 10+ apps on Play Store & App Store.',
    location: 'Manila, Metro Manila',
    skills: ['React Native', 'Flutter', 'Dart', 'JavaScript', 'Firebase'],
    serviceCategories: ['Mobile Development'],
    experience: '4 years',
    yearsOfExperience: 4,
    hourlyRate: 1100,
    rateType: 'hourly',
    serviceAreas: ['Manila', 'Makati', 'Quezon City'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 22,
    averageRating: 4.9,
    totalRatings: 15,
    profilePhoto: face('women', 2),
  },
  {
    name: 'Engr. Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    bio: 'UI/UX designer & front-end engineer. Figma, Adobe XD, user research, wireframing, design systems.',
    location: 'Quezon City, Metro Manila',
    skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
    serviceCategories: ['UI/UX Design'],
    experience: '3 years',
    yearsOfExperience: 3,
    hourlyRate: 900,
    rateType: 'per_project',
    serviceAreas: ['Quezon City', 'Makati', 'Manila'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 15,
    averageRating: 4.5,
    totalRatings: 8,
    profilePhoto: face('men', 2),
  },
  {
    name: 'Trisha Villanueva',
    email: 'trisha.villanueva@example.com',
    bio: 'Data analyst & Python developer. Power BI, SQL, machine learning. Helping companies make data-driven decisions.',
    location: 'Pasig, Metro Manila',
    skills: ['Python', 'SQL', 'Power BI', 'Data Analysis', 'Machine Learning'],
    serviceCategories: ['Data Science'],
    experience: '4 years',
    yearsOfExperience: 4,
    hourlyRate: 1000,
    rateType: 'hourly',
    serviceAreas: ['Pasig', 'Makati', 'Taguig', 'Mandaluyong'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 30,
    averageRating: 4.8,
    totalRatings: 18,
    profilePhoto: face('women', 3),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CARPENTRY (5)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Roberto Ramos',
    email: 'roberto.ramos@example.com',
    bio: 'Master carpenter — custom cabinets, wooden frames, general woodwork. 15 years of quality craftsmanship.',
    location: 'Marikina, Metro Manila',
    skills: ['Carpentry', 'Furniture Making', 'Cabinet Installation', 'Woodwork', 'Renovation'],
    serviceCategories: ['Carpentry'],
    experience: '15 years',
    yearsOfExperience: 15,
    hourlyRate: 400,
    rateType: 'per_project',
    serviceAreas: ['Marikina', 'Pasig', 'Quezon City', 'Antipolo'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 85,
    averageRating: 5.0,
    totalRatings: 32,
    profilePhoto: face('men', 3),
  },
  {
    name: 'Leonardo Bautista',
    email: 'leonardo.bautista@example.com',
    bio: 'Furniture craftsman specializing in solid wood tables, shelves, and custom storage solutions.',
    location: 'Valenzuela, Metro Manila',
    skills: ['Furniture Making', 'Wood Finishing', 'Carpentry', 'Custom Shelving', 'Restoration'],
    serviceCategories: ['Carpentry'],
    experience: '12 years',
    yearsOfExperience: 12,
    hourlyRate: 450,
    rateType: 'per_project',
    serviceAreas: ['Valenzuela', 'Caloocan', 'Malabon', 'Quezon City'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 65,
    averageRating: 4.7,
    totalRatings: 28,
    profilePhoto: face('men', 4),
  },
  {
    name: 'Ricardo Flores',
    email: 'ricardo.flores@example.com',
    bio: 'Interior fit-out carpenter — residential and commercial. Ceiling, partition walls, built-in closets.',
    location: 'Parañaque, Metro Manila',
    skills: ['Carpentry', 'Interior Fit-out', 'Ceiling Installation', 'Partition Walls', 'Built-in Closets'],
    serviceCategories: ['Carpentry'],
    experience: '10 years',
    yearsOfExperience: 10,
    hourlyRate: 380,
    rateType: 'per_project',
    serviceAreas: ['Parañaque', 'Las Piñas', 'Muntinlupa', 'Makati'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 50,
    averageRating: 4.6,
    totalRatings: 22,
    profilePhoto: face('men', 5),
  },
  {
    name: 'Fernando Cruz',
    email: 'fernando.cruz@example.com',
    bio: 'Door and window specialist — installation, repair, and custom woodwork. Solid and engineered wood.',
    location: 'Las Piñas, Metro Manila',
    skills: ['Door Installation', 'Window Installation', 'Carpentry', 'Wood Repair', 'Custom Woodwork'],
    serviceCategories: ['Carpentry'],
    experience: '8 years',
    yearsOfExperience: 8,
    hourlyRate: 350,
    rateType: 'negotiable',
    serviceAreas: ['Las Piñas', 'Parañaque', 'Muntinlupa', 'Cavite'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 40,
    averageRating: 4.8,
    totalRatings: 19,
    profilePhoto: face('men', 6),
  },
  {
    name: 'Eduardo Navarro',
    email: 'eduardo.navarro@example.com',
    bio: 'Roofing and wooden truss specialist. Yero installation, truss fabrication, wood framing for new builds.',
    location: 'Antipolo, Rizal',
    skills: ['Roofing', 'Truss Fabrication', 'Carpentry', 'Wood Framing', 'Yero Installation'],
    serviceCategories: ['Carpentry', 'Roofing'],
    experience: '14 years',
    yearsOfExperience: 14,
    hourlyRate: 420,
    rateType: 'per_project',
    serviceAreas: ['Antipolo', 'Marikina', 'Pasig', 'Rizal'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 70,
    averageRating: 4.9,
    totalRatings: 26,
    profilePhoto: face('men', 7),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // EDUCATION (5)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Jessica Mendoza',
    email: 'jessica.mendoza@example.com',
    bio: 'Licensed math tutor — Grade 1 to College Algebra. Patient and engaging teaching style. Online & F2F.',
    location: 'Makati, Metro Manila',
    skills: ['Math Tutoring', 'Algebra', 'Calculus', 'Statistics', 'Online Teaching'],
    serviceCategories: ['Teaching'],
    experience: '8 years',
    yearsOfExperience: 8,
    hourlyRate: 500,
    rateType: 'hourly',
    serviceAreas: ['Makati', 'Taguig', 'Pasig', 'Manila'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 120,
    averageRating: 4.9,
    totalRatings: 55,
    profilePhoto: face('women', 4),
  },
  {
    name: 'Marco Evangelista',
    email: 'marco.evangelista@example.com',
    bio: 'English & Filipino language tutor. IELTS prep, business English, creative writing. LET passer.',
    location: 'Quezon City, Metro Manila',
    skills: ['English Tutoring', 'IELTS Preparation', 'Filipino Language', 'Creative Writing', 'Business English'],
    serviceCategories: ['Teaching'],
    experience: '6 years',
    yearsOfExperience: 6,
    hourlyRate: 450,
    rateType: 'hourly',
    serviceAreas: ['Quezon City', 'Manila', 'Makati'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedJobs: 90,
    averageRating: 4.8,
    totalRatings: 40,
    profilePhoto: face('men', 8),
  },
  {
    name: 'Patricia Lim',
    email: 'patricia.lim@example.com',
    bio: 'Science tutor specializing in Physics & Chemistry. Board exam reviewer. Makes science fun & easy.',
    location: 'Pasig, Metro Manila',
    skills: ['Physics Tutoring', 'Chemistry Tutoring', 'Science Education', 'Board Exam Review', 'Lab Experiments'],
    serviceCategories: ['Teaching'],
    experience: '10 years',
    yearsOfExperience: 10,
    hourlyRate: 550,
    rateType: 'hourly',
    serviceAreas: ['Pasig', 'Makati', 'Mandaluyong', 'Taguig'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 75,
    averageRating: 4.7,
    totalRatings: 33,
    profilePhoto: face('women', 5),
  },
  {
    name: 'Beatrice Cruz',
    email: 'beatrice.cruz@example.com',
    bio: 'Early childhood educator & reading tutor. Phonics, reading comprehension, homework help. K-3 specialist.',
    location: 'Parañaque, Metro Manila',
    skills: ['Reading Tutoring', 'Phonics', 'Early Childhood Education', 'Homework Help', 'Special Education'],
    serviceCategories: ['Teaching'],
    experience: '5 years',
    yearsOfExperience: 5,
    hourlyRate: 350,
    rateType: 'hourly',
    serviceAreas: ['Parañaque', 'Las Piñas', 'Muntinlupa'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 100,
    averageRating: 4.9,
    totalRatings: 48,
    profilePhoto: face('women', 6),
  },
  {
    name: 'Diana Santos',
    email: 'diana.santos@example.com',
    bio: 'Art & design teacher. Drawing, painting, digital illustration. Portfolio prep for college applicants.',
    location: 'Marikina, Metro Manila',
    skills: ['Drawing Lessons', 'Painting', 'Digital Illustration', 'Art Teaching', 'Portfolio Preparation'],
    serviceCategories: ['Teaching'],
    experience: '6 years',
    yearsOfExperience: 6,
    hourlyRate: 500,
    rateType: 'per_project',
    serviceAreas: ['Marikina', 'Pasig', 'Quezon City'],
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    completedJobs: 45,
    averageRating: 4.8,
    totalRatings: 22,
    profilePhoto: face('women', 7),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ELECTRICIAN (5)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Ernesto Dela Cruz',
    email: 'ernesto.delacruz@example.com',
    bio: 'Master electrician with 20+ years. Wiring, panel installation, troubleshooting. Buong Metro Manila.',
    location: 'Quezon City, Metro Manila',
    skills: ['Electrical Wiring', 'Panel Installation', 'Troubleshooting', 'Lighting', 'CCTV Installation'],
    serviceCategories: ['Electrical'],
    experience: '20 years',
    yearsOfExperience: 20,
    hourlyRate: 350,
    rateType: 'negotiable',
    serviceAreas: ['Quezon City', 'Manila', 'Makati', 'Pasig', 'Mandaluyong', 'Caloocan'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedJobs: 150,
    averageRating: 4.8,
    totalRatings: 45,
    profilePhoto: face('men', 9),
  },
  {
    name: 'Antonio Soriano',
    email: 'antonio.soriano@example.com',
    bio: 'Licensed electrician — residential & commercial. Solar panel installation, smart home wiring, generator setup.',
    location: 'Mandaluyong, Metro Manila',
    skills: ['Electrical Wiring', 'Solar Panel Installation', 'Smart Home Wiring', 'Generator Setup', 'Troubleshooting'],
    serviceCategories: ['Electrical'],
    experience: '15 years',
    yearsOfExperience: 15,
    hourlyRate: 400,
    rateType: 'per_project',
    serviceAreas: ['Mandaluyong', 'Makati', 'Pasig', 'San Juan'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 95,
    averageRating: 4.7,
    totalRatings: 38,
    profilePhoto: face('men', 10),
  },
  {
    name: 'Danilo Aquino',
    email: 'danilo.aquino@example.com',
    bio: 'Industrial electrician — motor controls, PLC wiring, power distribution. Factory & warehouse specialist.',
    location: 'Caloocan, Metro Manila',
    skills: ['Industrial Wiring', 'Motor Controls', 'PLC Wiring', 'Power Distribution', 'Electrical Maintenance'],
    serviceCategories: ['Electrical'],
    experience: '18 years',
    yearsOfExperience: 18,
    hourlyRate: 500,
    rateType: 'per_project',
    serviceAreas: ['Caloocan', 'Valenzuela', 'Quezon City', 'Malabon'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 60,
    averageRating: 4.6,
    totalRatings: 20,
    profilePhoto: face('men', 11),
  },
  {
    name: 'Ramon Perez',
    email: 'ramon.perez@example.com',
    bio: 'Aircon electrician — installation, repair, cleaning. Window, split, cassette type. Freon recharging.',
    location: 'Taguig, Metro Manila',
    skills: ['Aircon Installation', 'Aircon Repair', 'Electrical Wiring', 'HVAC', 'Freon Recharging'],
    serviceCategories: ['Electrical', 'HVAC'],
    experience: '10 years',
    yearsOfExperience: 10,
    hourlyRate: 380,
    rateType: 'per_project',
    serviceAreas: ['Taguig', 'Makati', 'Pasig', 'Mandaluyong'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 110,
    averageRating: 4.8,
    totalRatings: 42,
    profilePhoto: face('men', 12),
  },
  {
    name: 'Gabriel Reyes',
    email: 'gabriel.reyes@example.com',
    bio: 'Emergency electrician — 24/7 availability. Breaker trips, power outage diagnosis, short circuit repair.',
    location: 'Pasay, Metro Manila',
    skills: ['Emergency Electrical', 'Circuit Breaker Repair', 'Power Diagnosis', 'Short Circuit Repair', 'Lighting Installation'],
    serviceCategories: ['Electrical'],
    experience: '12 years',
    yearsOfExperience: 12,
    hourlyRate: 450,
    rateType: 'negotiable',
    serviceAreas: ['Pasay', 'Makati', 'Taguig', 'Manila', 'Parañaque'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedJobs: 90,
    averageRating: 4.9,
    totalRatings: 35,
    profilePhoto: face('men', 13),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PLUMBER (5)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Domingo Bautista',
    email: 'domingo.bautista@example.com',
    bio: 'Licensed plumber — 25 years experience. Water line, drainage, septic tank, toilet repair.',
    location: 'Caloocan, Metro Manila',
    skills: ['Plumbing', 'Pipe Fitting', 'Drainage', 'Septic Tank', 'Water Heater Installation'],
    serviceCategories: ['Plumbing'],
    experience: '25 years',
    yearsOfExperience: 25,
    hourlyRate: 300,
    rateType: 'negotiable',
    serviceAreas: ['Caloocan', 'Valenzuela', 'Malabon', 'Quezon City'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 200,
    averageRating: 4.6,
    totalRatings: 28,
    profilePhoto: face('men', 14),
  },
  {
    name: 'Joel Hernandez',
    email: 'joel.hernandez@example.com',
    bio: 'Bathroom and kitchen plumber — fixture installation, leak repair, pipe replacement. Clean and reliable work.',
    location: 'Muntinlupa, Metro Manila',
    skills: ['Plumbing', 'Fixture Installation', 'Leak Repair', 'Pipe Replacement', 'Kitchen Plumbing'],
    serviceCategories: ['Plumbing'],
    experience: '12 years',
    yearsOfExperience: 12,
    hourlyRate: 350,
    rateType: 'per_project',
    serviceAreas: ['Muntinlupa', 'Las Piñas', 'Parañaque'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 80,
    averageRating: 4.7,
    totalRatings: 30,
    profilePhoto: face('men', 15),
  },
  {
    name: 'Rodel Garcia',
    email: 'rodel.garcia@example.com',
    bio: 'Water pump specialist — installation, repair, pressure tank setup. Deep well & jet pump systems.',
    location: 'San Juan, Metro Manila',
    skills: ['Water Pump Installation', 'Plumbing', 'Pressure Tank Setup', 'Deep Well Systems', 'Pump Repair'],
    serviceCategories: ['Plumbing'],
    experience: '10 years',
    yearsOfExperience: 10,
    hourlyRate: 380,
    rateType: 'per_project',
    serviceAreas: ['San Juan', 'Mandaluyong', 'Quezon City', 'Manila'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 55,
    averageRating: 4.8,
    totalRatings: 25,
    profilePhoto: face('men', 16),
  },
  {
    name: 'Nelson Torres',
    email: 'nelson.torres@example.com',
    bio: 'Sewer and drainage specialist — clogged drains, sewer line repair, drainage system installation.',
    location: 'Pasig, Metro Manila',
    skills: ['Drainage', 'Sewer Repair', 'Plumbing', 'Clog Removal', 'Pipe Installation'],
    serviceCategories: ['Plumbing'],
    experience: '15 years',
    yearsOfExperience: 15,
    hourlyRate: 320,
    rateType: 'negotiable',
    serviceAreas: ['Pasig', 'Makati', 'Mandaluyong', 'Taguig'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 95,
    averageRating: 4.5,
    totalRatings: 35,
    profilePhoto: face('men', 17),
  },
  {
    name: 'Engr. Benjamin Lim',
    email: 'benjamin.lim@example.com',
    bio: 'Commercial plumbing engineer — fire sprinkler systems, building water systems, code-compliant installations.',
    location: 'Makati, Metro Manila',
    skills: ['Commercial Plumbing', 'Fire Sprinkler', 'Building Water Systems', 'Plumbing Design', 'Code Compliance'],
    serviceCategories: ['Plumbing'],
    experience: '20 years',
    yearsOfExperience: 20,
    hourlyRate: 600,
    rateType: 'per_project',
    serviceAreas: ['Makati', 'Taguig', 'Pasig', 'Manila', 'Mandaluyong'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 45,
    averageRating: 4.9,
    totalRatings: 18,
    profilePhoto: face('men', 18),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // RANDOM SKILLS (15)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Nena Villanueva',
    email: 'nena.villanueva@example.com',
    bio: 'Professional house cleaner & deep cleaning specialist. Bahay, condo, office. Maasahan at matiyaga.',
    location: 'Pasig, Metro Manila',
    skills: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning', 'Laundry', 'Organizing'],
    serviceCategories: ['Cleaning'],
    experience: '10 years',
    yearsOfExperience: 10,
    hourlyRate: 200,
    rateType: 'per_project',
    serviceAreas: ['Pasig', 'Makati', 'Mandaluyong', 'Taguig', 'San Juan'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 180,
    averageRating: 4.9,
    totalRatings: 60,
    profilePhoto: face('women', 8),
  },
  {
    name: 'Rodrigo Magno',
    email: 'rodrigo.magno@example.com',
    bio: 'Professional painter — residential & commercial. Interior, exterior, waterproofing. Clean finish guaranteed.',
    location: 'Las Piñas, Metro Manila',
    skills: ['Painting', 'Waterproofing', 'Epoxy Flooring', 'Wall Repair', 'Varnishing'],
    serviceCategories: ['Painting'],
    experience: '12 years',
    yearsOfExperience: 12,
    hourlyRate: 350,
    rateType: 'per_project',
    serviceAreas: ['Las Piñas', 'Parañaque', 'Muntinlupa', 'Cavite'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 75,
    averageRating: 4.7,
    totalRatings: 38,
    profilePhoto: face('men', 19),
  },
  {
    name: 'Jun Perez',
    email: 'jun.perez@example.com',
    bio: 'Certified welder — steel gates, grills, railings, structural steel. Stick, MIG, TIG welding.',
    location: 'Taguig, Metro Manila',
    skills: ['Welding', 'Steel Fabrication', 'Gate Making', 'Grillwork', 'Railing Installation'],
    serviceCategories: ['Welding'],
    experience: '14 years',
    yearsOfExperience: 14,
    hourlyRate: 450,
    rateType: 'per_project',
    serviceAreas: ['Taguig', 'Makati', 'Pasig', 'Mandaluyong'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 70,
    averageRating: 4.8,
    totalRatings: 30,
    profilePhoto: face('men', 20),
  },
  {
    name: 'Carding Aquino',
    email: 'carding.aquino@example.com',
    bio: 'Gardener & landscaper. Lawn maintenance, pruning, plant installation, garden design. Green thumb!',
    location: 'Antipolo, Rizal',
    skills: ['Landscaping', 'Gardening', 'Lawn Maintenance', 'Pruning', 'Plant Installation'],
    serviceCategories: ['Landscaping'],
    experience: '12 years',
    yearsOfExperience: 12,
    hourlyRate: 250,
    rateType: 'per_project',
    serviceAreas: ['Antipolo', 'Marikina', 'Pasig', 'Rizal'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 90,
    averageRating: 4.9,
    totalRatings: 35,
    profilePhoto: face('men', 21),
  },
  {
    name: 'Camille Reyes',
    email: 'camille.reyes@example.com',
    bio: 'Music teacher — piano, guitar, voice lessons. Classical & contemporary. Kids & adults welcome!',
    location: 'San Juan, Metro Manila',
    skills: ['Piano Lessons', 'Guitar Lessons', 'Voice Training', 'Music Theory', 'Songwriting'],
    serviceCategories: ['Teaching'],
    experience: '7 years',
    yearsOfExperience: 7,
    hourlyRate: 600,
    rateType: 'hourly',
    serviceAreas: ['San Juan', 'Mandaluyong', 'Quezon City', 'Manila'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    completedJobs: 55,
    averageRating: 5.0,
    totalRatings: 28,
    profilePhoto: face('women', 9),
  },
  {
    name: 'Miguel Torres',
    email: 'miguel.torres@example.com',
    bio: 'Cybersecurity consultant. Penetration testing, network security, SOC analysis. CEH certified.',
    location: 'Mandaluyong, Metro Manila',
    skills: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'Security Auditing', 'Ethical Hacking'],
    serviceCategories: ['IT Support', 'Network Administration'],
    experience: '6 years',
    yearsOfExperience: 6,
    hourlyRate: 1800,
    rateType: 'hourly',
    serviceAreas: ['Mandaluyong', 'Makati', 'Taguig', 'Pasig'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 25,
    averageRating: 4.9,
    totalRatings: 14,
    profilePhoto: face('men', 22),
  },
  {
    name: 'Ria Concepcion',
    email: 'ria.concepcion@example.com',
    bio: 'Graphic designer & video editor. Branding, social media content, motion graphics. Adobe Suite expert.',
    location: 'Makati, Metro Manila',
    skills: ['Graphic Design', 'Video Editing', 'Motion Graphics', 'Branding', 'Adobe Premiere'],
    serviceCategories: ['Graphic Design', 'Video Editing'],
    experience: '5 years',
    yearsOfExperience: 5,
    hourlyRate: 800,
    rateType: 'per_project',
    serviceAreas: ['Makati', 'Taguig', 'Pasig'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 40,
    averageRating: 4.7,
    totalRatings: 25,
    profilePhoto: face('women', 10),
  },
  {
    name: 'Tony Soriano',
    email: 'tony.soriano@example.com',
    bio: 'Mason & construction worker. Foundation, CHB walls, tiling, concrete finishing. Own tools provided.',
    location: 'Valenzuela, Metro Manila',
    skills: ['Masonry', 'Tiling', 'Concrete Work', 'CHB Wall', 'Plastering'],
    serviceCategories: ['Masonry', 'Tiling'],
    experience: '18 years',
    yearsOfExperience: 18,
    hourlyRate: 380,
    rateType: 'per_project',
    serviceAreas: ['Valenzuela', 'Caloocan', 'Malabon', 'Quezon City'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 100,
    averageRating: 4.5,
    totalRatings: 22,
    profilePhoto: face('men', 23),
  },
  {
    name: 'Lito Bernal',
    email: 'lito.bernal@example.com',
    bio: 'Aircon technician — cleaning, repair, installation. Window, split, cassette type. Freon recharging.',
    location: 'Mandaluyong, Metro Manila',
    skills: ['Aircon Cleaning', 'Aircon Repair', 'Aircon Installation', 'HVAC', 'Freon Recharging'],
    serviceCategories: ['HVAC'],
    experience: '8 years',
    yearsOfExperience: 8,
    hourlyRate: 400,
    rateType: 'per_project',
    serviceAreas: ['Mandaluyong', 'Makati', 'San Juan', 'Pasig'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 130,
    averageRating: 4.6,
    totalRatings: 50,
    profilePhoto: face('men', 24),
  },
  {
    name: 'Danny Santos',
    email: 'danny.santos@example.com',
    bio: 'Roofing specialist — yero replacement, gutter installation, waterproofing, leak repair.',
    location: 'Muntinlupa, Metro Manila',
    skills: ['Roofing', 'Gutter Installation', 'Waterproofing', 'Leak Repair', 'Metal Works'],
    serviceCategories: ['Roofing'],
    experience: '16 years',
    yearsOfExperience: 16,
    hourlyRate: 400,
    rateType: 'per_project',
    serviceAreas: ['Muntinlupa', 'Las Piñas', 'Parañaque', 'Cavite'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completedJobs: 65,
    averageRating: 4.7,
    totalRatings: 25,
    profilePhoto: face('men', 25),
  },
  {
    name: 'Kevin Tan',
    email: 'kevin.tan@example.com',
    bio: 'Japanese language tutor — N5 to N2 level. Conversational Japanese, JLPT prep. Lived in Japan 3 years.',
    location: 'Makati, Metro Manila',
    skills: ['Japanese Language', 'JLPT Preparation', 'Translation', 'Conversational Japanese', 'Business Japanese'],
    serviceCategories: ['Teaching'],
    experience: '4 years',
    yearsOfExperience: 4,
    hourlyRate: 600,
    rateType: 'hourly',
    serviceAreas: ['Makati', 'Taguig', 'Manila'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    completedJobs: 35,
    averageRating: 4.7,
    totalRatings: 20,
    profilePhoto: face('men', 26),
  },
  {
    name: 'Nikki Tan',
    email: 'nikki.tan@example.com',
    bio: 'Social media manager & content creator. Strategy, scheduling, analytics. 100K+ follower brands handled.',
    location: 'San Juan, Metro Manila',
    skills: ['Social Media Management', 'Content Creation', 'Copywriting', 'Analytics', 'Community Management'],
    serviceCategories: ['Social Media Management', 'Content Writing'],
    experience: '4 years',
    yearsOfExperience: 4,
    hourlyRate: 600,
    rateType: 'per_project',
    serviceAreas: ['San Juan', 'Makati', 'Quezon City', 'Manila'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 50,
    averageRating: 4.8,
    totalRatings: 30,
    profilePhoto: face('women', 11),
  },
  {
    name: 'Jericho Lim',
    email: 'jericho.lim@example.com',
    bio: 'WordPress & Shopify developer. E-commerce specialist — 50+ online stores built. SEO optimization.',
    location: 'Pasay, Metro Manila',
    skills: ['WordPress', 'Shopify', 'SEO', 'E-commerce', 'PHP'],
    serviceCategories: ['Web Development'],
    experience: '6 years',
    yearsOfExperience: 6,
    hourlyRate: 700,
    rateType: 'per_project',
    serviceAreas: ['Pasay', 'Makati', 'Manila', 'Taguig'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    completedJobs: 55,
    averageRating: 4.6,
    totalRatings: 35,
    profilePhoto: face('men', 27),
  },
  {
    name: 'Engr. Ricky Torres',
    email: 'ricky.torres@example.com',
    bio: 'Fitness trainer & swimming instructor. Weight training, HIIT, swim lessons. PSSF certified.',
    location: 'Taguig, Metro Manila',
    skills: ['Personal Training', 'Swimming Lessons', 'HIIT', 'Weight Training', 'Sports Coaching'],
    serviceCategories: ['Teaching'],
    experience: '8 years',
    yearsOfExperience: 8,
    hourlyRate: 800,
    rateType: 'hourly',
    serviceAreas: ['Taguig', 'Makati', 'Pasig'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedJobs: 85,
    averageRating: 4.9,
    totalRatings: 37,
    profilePhoto: face('men', 28),
  },
  {
    name: 'Joel Ramirez',
    email: 'joel.ramirez@example.com',
    bio: 'Driving instructor — manual & automatic. LTO exam prep, defensive driving. Patient with beginners.',
    location: 'Caloocan, Metro Manila',
    skills: ['Driving Lessons', 'LTO Exam Prep', 'Defensive Driving', 'Manual Transmission', 'Automatic Transmission'],
    serviceCategories: ['Driving'],
    experience: '10 years',
    yearsOfExperience: 10,
    hourlyRate: 400,
    rateType: 'hourly',
    serviceAreas: ['Caloocan', 'Valenzuela', 'Quezon City', 'Manila'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedJobs: 150,
    averageRating: 4.6,
    totalRatings: 58,
    profilePhoto: face('men', 29),
  },
];

// ─── Posts (at least 1 per worker — 40 posts) ────────────────────────────────

const posts = [
  // TECH (5)
  { content: 'Just shipped v2.0 of an e-commerce platform for a local brand — React + Node.js + MongoDB stack! 🚀 Real-time inventory, COD tracking, and admin analytics dashboard. Open for freelance web dev projects.', tags: ['webdev', 'react', 'nodejs'], imageUrl: 'https://picsum.photos/seed/tech1/800/600', userIndex: 0 },
  { content: 'Migrated a startup from a single VPS to a fully containerized AWS ECS setup — zero downtime, 60% cost reduction! ☁️ Terraform + Docker + GitHub Actions CI/CD pipeline.', tags: ['aws', 'devops', 'docker'], imageUrl: 'https://picsum.photos/seed/tech2/800/600', userIndex: 1 },
  { content: 'Launched a cross-platform delivery app on both App Store and Google Play — built in React Native! 📱 Real-time tracking, push notifications, and driver dashboard.', tags: ['reactnative', 'mobiledev'], imageUrl: 'https://picsum.photos/seed/tech3/800/600', userIndex: 2 },
  { content: 'Complete UI redesign for a fintech startup — from wireframes to dev-ready Figma components in 3 weeks! 🎨 Improved task completion rate by 40% in user testing.', tags: ['uidesign', 'figma', 'ux'], imageUrl: 'https://picsum.photos/seed/tech4/800/600', userIndex: 3 },
  { content: 'Built a real-time sales intelligence dashboard in Power BI connected to 5 data sources! 📊 Automated ETL pipeline in Python, refreshes hourly.', tags: ['powerbi', 'python', 'data'], imageUrl: 'https://picsum.photos/seed/tech5/800/600', userIndex: 4 },

  // CARPENTRY (5)
  { content: 'Custom sala set gawa sa solid narra — mula raw lumber hanggang finished product! 🪵 Hand-finished, tatagal ng dekada. Open for orders across Metro Manila.', tags: ['carpentry', 'furniture', 'woodwork'], imageUrl: 'https://picsum.photos/seed/carp1/800/600', userIndex: 5 },
  { content: 'Delivered a complete dining set — 8-seater table with matching chairs, all from reclaimed tanguile wood. Sustainable furniture is the future! 🌿', tags: ['furniture', 'sustainable', 'woodwork'], imageUrl: 'https://picsum.photos/seed/carp2/800/600', userIndex: 6 },
  { content: 'Just finished ceiling and partition wall installation for a new office in Parañaque. Clean lines, on schedule, and within budget. 💪', tags: ['carpentry', 'fitout', 'office'], imageUrl: 'https://picsum.photos/seed/carp3/800/600', userIndex: 7 },
  { content: 'Custom-made mahogany front door installed for a client in Las Piñas! Solid construction with carved details. Built to last a lifetime. 🚪', tags: ['carpentry', 'door', 'woodwork'], imageUrl: 'https://picsum.photos/seed/carp4/800/600', userIndex: 8 },
  { content: 'Completed a wooden truss system for a new build in Antipolo — 3-bedroom house. Strong, lightweight, and properly braced. Ready for roofing! 🏠', tags: ['roofing', 'truss', 'carpentry'], imageUrl: 'https://picsum.photos/seed/carp5/800/600', userIndex: 9 },

  // EDUCATION (5)
  { content: 'Student passed the UP Diliman entrance exam with a score of 98/100 in Math! 🎉 3 months of intensive review — personalized approach works!', tags: ['mathtutoring', 'education'], imageUrl: 'https://picsum.photos/seed/edu1/800/600', userIndex: 10 },
  { content: 'My IELTS student scored Band 8.0 overall — she needed 7.5 for her UK visa! 🇬🇧 Customized mock tests, grammar drilling, and speaking practice.', tags: ['ielts', 'english', 'tutoring'], imageUrl: 'https://picsum.photos/seed/edu2/800/600', userIndex: 11 },
  { content: 'Board exam results are out — 4 out of 5 ng reviewees ko pumasa sa LET Science! 🧪 Full coverage ng Gen Science, Physics, and Chemistry.', tags: ['science', 'boardreview', 'education'], imageUrl: 'https://picsum.photos/seed/edu3/800/600', userIndex: 12 },
  { content: 'Phonics reading breakthrough — my Grade 1 student went from non-reader to reading full sentences in 8 weeks! 📚', tags: ['phonics', 'reading', 'education'], imageUrl: 'https://picsum.photos/seed/edu4/800/600', userIndex: 13 },
  { content: 'Portfolio prep results: 3 out of 4 students accepted sa their top choice architecture schools! 🖼️ Drawing, perspective, and digital rendering.', tags: ['art', 'portfolio', 'education'], imageUrl: 'https://picsum.photos/seed/edu5/800/600', userIndex: 14 },

  // ELECTRICIAN (5)
  { content: 'Completed a full home installation: 30 LED downlights, 3 circuit breakers, and a smart switch system wired throughout a brand new house in QC! 💡', tags: ['electrical', 'smartswitch', 'newhome'], imageUrl: 'https://picsum.photos/seed/elec1/800/600', userIndex: 15 },
  { content: 'Solar panel installation done for a residential home in Mandaluyong — 5kW system with battery backup. Lower electric bills starting this month! ☀️', tags: ['solar', 'electrical', 'renewable'], imageUrl: 'https://picsum.photos/seed/elec2/800/600', userIndex: 16 },
  { content: 'Factory electrical maintenance completed — motor control center rewiring, PLC panel cleanup. Zero downtime during the upgrade! ⚡', tags: ['industrial', 'electrical', 'maintenance'], imageUrl: 'https://picsum.photos/seed/elec3/800/600', userIndex: 17 },
  { content: 'Aircon installation season! Just finished 3 split-type units for a condo in BGC. Professional installation = mas malamig at matipid sa kuryente. ❄️', tags: ['aircon', 'installation', 'electrical'], imageUrl: 'https://picsum.photos/seed/elec4/800/600', userIndex: 18 },
  { content: 'Emergency call at 11 PM — breaker kept tripping due to a short circuit in the kitchen line. Found the faulty wire, repaired, all good by midnight! 🔧', tags: ['emergency', 'electrical', 'repair'], imageUrl: 'https://picsum.photos/seed/elec5/800/600', userIndex: 19 },

  // PLUMBER (5)
  { content: 'Before & after ng bathroom rehab sa Caloocan — bagong tiles, bowl, shower system, at complete pipework. 🚿 25 years experience!', tags: ['plumbing', 'renovation', 'bathroom'], imageUrl: 'https://picsum.photos/seed/plumb1/800/600', userIndex: 20 },
  { content: 'Kitchen sink and faucet replacement plus under-sink drainage fix in Muntinlupa. Quick, clean, and no leaks guaranteed! 🔧', tags: ['plumbing', 'kitchen', 'repair'], imageUrl: 'https://picsum.photos/seed/plumb2/800/600', userIndex: 21 },
  { content: 'Deep well pump installation done for a house in San Juan — strong water pressure on all floors now! Pressure tank included. 💧', tags: ['waterpump', 'plumbing', 'installation'], imageUrl: 'https://picsum.photos/seed/plumb3/800/600', userIndex: 22 },
  { content: 'Cleared a severely clogged main sewer line in Pasig — hydro jetting + camera inspection revealed root intrusion. All fixed! 🌿🔧', tags: ['drainage', 'sewer', 'plumbing'], imageUrl: 'https://picsum.photos/seed/plumb4/800/600', userIndex: 23 },
  { content: 'Fire sprinkler system installation for a new commercial building in Makati — code-compliant and inspected. Safety first! 🔥', tags: ['firesafety', 'plumbing', 'commercial'], imageUrl: 'https://picsum.photos/seed/plumb5/800/600', userIndex: 24 },

  // RANDOM SKILLS (15)
  { content: 'Deep cleaning transformation para sa 2-bedroom condo sa Pasig! 🧹 Grout scrubbing, appliance degreasing, carpet shampooing. Book now!', tags: ['cleaning', 'deepclean', 'condo'], imageUrl: 'https://picsum.photos/seed/rand1/800/600', userIndex: 25 },
  { content: 'Fresh exterior paint job sa 2-storey house sa Las Piñas! 🎨 Weathershield paint, clean lines, walang drip. Free estimate available!', tags: ['painting', 'exterior', 'renovation'], imageUrl: 'https://picsum.photos/seed/rand2/800/600', userIndex: 26 },
  { content: 'Steel security gate fabricated and installed — designed by the client, built by me! 🔩 MIG welded, primered, and powder-coated.', tags: ['welding', 'steelgate', 'fabrication'], imageUrl: 'https://picsum.photos/seed/rand3/800/600', userIndex: 27 },
  { content: 'Garden makeover para sa subdivision home sa Antipolo! 🌿 Ornamental plants, lawn leveling, and stone pathway. Available across Rizal!', tags: ['landscaping', 'gardening', 'renovation'], imageUrl: 'https://picsum.photos/seed/rand4/800/600', userIndex: 28 },
  { content: 'My 9-year-old student just performed Moonlight Sonata at their school recital! 🎹 2 years of consistent lessons — so proud!', tags: ['piano', 'music', 'teaching'], imageUrl: 'https://picsum.photos/seed/rand5/800/600', userIndex: 29 },
  { content: 'Completed a penetration test for an MSME — found 3 critical vulnerabilities before they could be exploited! 🔐 All patched and verified.', tags: ['cybersecurity', 'pentest', 'infosec'], imageUrl: 'https://picsum.photos/seed/rand6/800/600', userIndex: 30 },
  { content: 'Brand identity package delivered for a new food startup — logo, color palette, packaging mockups, and social media templates! 🎨', tags: ['design', 'branding', 'logo'], imageUrl: 'https://picsum.photos/seed/rand7/800/600', userIndex: 31 },
  { content: 'CHB wall at concrete flooring ng bodega — done in 3 days! 🧱 Reinforced footing, plastered at painted. 18 years sa masonry work.', tags: ['masonry', 'construction', 'concrete'], imageUrl: 'https://picsum.photos/seed/rand8/800/600', userIndex: 32 },
  { content: 'Aircon deep cleaning result — shocking kung gaano karumi! 😱 Regular cleaning = mas malamig at mas matipid sa kuryente.', tags: ['aircon', 'cleaning', 'maintenance'], imageUrl: 'https://picsum.photos/seed/rand9/800/600', userIndex: 33 },
  { content: 'Rooftop waterproofing completed sa unit sa Muntinlupa — zero leaks guaranteed! ☔ 3-layer elastomeric coating with fiber mesh.', tags: ['roofing', 'waterproofing', 'construction'], imageUrl: 'https://picsum.photos/seed/rand10/800/600', userIndex: 34 },
  { content: 'JLPT N3 student passed with 95%! 🇯🇵 Intensive 6-month program covering kanji, grammar, listening. Now accepting N5 students.', tags: ['japanese', 'jlpt', 'language'], imageUrl: 'https://picsum.photos/seed/rand11/800/600', userIndex: 35 },
  { content: 'Grew a local restaurant brand from 3K to 85K Instagram followers in 5 months! 🍽️ Content calendar, stories, and paid ads.', tags: ['socialmedia', 'instagram', 'marketing'], imageUrl: 'https://picsum.photos/seed/rand12/800/600', userIndex: 36 },
  { content: 'New Shopify store launched for a local clothing brand — custom theme, upsell funnels, abandoned cart emails! 🛒 Speed score: 94/100.', tags: ['shopify', 'ecommerce', 'webdev'], imageUrl: 'https://picsum.photos/seed/rand13/800/600', userIndex: 37 },
  { content: 'Client transformation after 12 weeks of personalized training — down 8kg, body fat from 28% to 19%! 💪 Programs available in BGC.', tags: ['fitness', 'training', 'transformation'], imageUrl: 'https://picsum.photos/seed/rand14/800/600', userIndex: 38 },
  { content: 'Student passed the LTO written exam on the FIRST try! 🚗 5-session program covering traffic signs, road rules, and defensive driving.', tags: ['driving', 'lto', 'lessons'], imageUrl: 'https://picsum.photos/seed/rand15/800/600', userIndex: 39 },
];

// ─── Reels (at least 1 per worker — 40 reels) ───────────────────────────────

const reelsData = [
  // TECH (5)
  { description: 'React + Node.js full-stack app build in 60 seconds ⚡ From setup to deployment. #webdev #fullstack', tags: ['webdev', 'react', 'nodejs'], detectedSkills: ['React', 'Node.js', 'MongoDB'], views: 8900, duration: 58, userIndex: 0 },
  { description: 'AWS cloud architecture walkthrough — scalable infra for a startup on minimal budget ☁️ #devops', tags: ['aws', 'devops', 'cloud'], detectedSkills: ['AWS', 'Docker', 'CI/CD'], views: 14200, duration: 110, userIndex: 1 },
  { description: 'Building a delivery app in React Native — live coding session! 📱 #mobiledev #reactnative', tags: ['reactnative', 'mobiledev'], detectedSkills: ['React Native', 'Flutter', 'Firebase'], views: 6500, duration: 90, userIndex: 2 },
  { description: 'UI/UX design process — wireframe to high-fidelity prototype in Figma 🎨 #uidesign', tags: ['uidesign', 'figma', 'ux'], detectedSkills: ['Figma', 'UI Design', 'Prototyping'], views: 12000, duration: 85, userIndex: 3 },
  { description: 'Data visualization dashboard built in Python & Power BI — sales insights in minutes! 📊', tags: ['python', 'powerbi', 'data'], detectedSkills: ['Python', 'Power BI', 'Data Analysis'], views: 6100, duration: 65, userIndex: 4 },

  // CARPENTRY (5)
  { description: 'Custom narra wood sala set — from raw lumber to finished furniture! 🪵 #carpentry #handmade', tags: ['carpentry', 'furniture'], detectedSkills: ['Carpentry', 'Furniture Making'], views: 3200, duration: 60, userIndex: 5 },
  { description: 'Reclaimed wood dining table build — sustainable and beautiful! ♻️ #woodwork #sustainable', tags: ['furniture', 'sustainable'], detectedSkills: ['Furniture Making', 'Wood Finishing'], views: 4100, duration: 75, userIndex: 6 },
  { description: 'Office partition wall installation — time lapse from start to finish! 🏢 #fitout', tags: ['carpentry', 'fitout'], detectedSkills: ['Carpentry', 'Interior Fit-out'], views: 2800, duration: 50, userIndex: 7 },
  { description: 'Hand-carved mahogany door — detail work close-up! 🚪 #craftsmanship #woodwork', tags: ['carpentry', 'door'], detectedSkills: ['Carpentry', 'Custom Woodwork'], views: 5500, duration: 45, userIndex: 8 },
  { description: 'Wooden truss fabrication for a new build — strong and precise! 🏠 #construction', tags: ['roofing', 'truss'], detectedSkills: ['Truss Fabrication', 'Carpentry'], views: 3700, duration: 55, userIndex: 9 },

  // EDUCATION (5)
  { description: 'Quick math trick — solve quadratic equations in seconds! ✏️ #mathtutoring #tips', tags: ['math', 'tutoring'], detectedSkills: ['Math Tutoring', 'Algebra'], views: 15000, duration: 40, userIndex: 10 },
  { description: 'IELTS Speaking Band 8 sample — tips for fluency and coherence! 🗣️ #ielts #english', tags: ['ielts', 'english'], detectedSkills: ['IELTS Preparation', 'English Tutoring'], views: 9800, duration: 70, userIndex: 11 },
  { description: 'Fun chemistry experiment — making elephant toothpaste with students! 🧪 #science #teaching', tags: ['science', 'education'], detectedSkills: ['Chemistry Tutoring', 'Science Education'], views: 22000, duration: 55, userIndex: 12 },
  { description: 'Phonics lesson — blending sounds CVC words! Perfect for ages 4-6 📖 #earlylearning', tags: ['phonics', 'reading'], detectedSkills: ['Phonics', 'Early Childhood Education'], views: 7200, duration: 35, userIndex: 13 },
  { description: 'Speed drawing session — portrait sketch in 5 minutes! ✍️ #art #drawing', tags: ['art', 'drawing'], detectedSkills: ['Drawing Lessons', 'Art Teaching'], views: 11500, duration: 60, userIndex: 14 },

  // ELECTRICIAN (5)
  { description: 'Panel installation done! Complete rewiring ng 2-storey house. Safe at up to code! 🔌', tags: ['electrical', 'panel'], detectedSkills: ['Electrical Wiring', 'Panel Installation'], views: 1240, duration: 45, userIndex: 15 },
  { description: 'Solar panel installation walkthrough — from mounting to inverter connection! ☀️ #solar', tags: ['solar', 'electrical'], detectedSkills: ['Solar Panel Installation', 'Electrical Wiring'], views: 8500, duration: 95, userIndex: 16 },
  { description: 'PLC wiring and motor control setup for a factory line — clean and organized! ⚡', tags: ['industrial', 'electrical'], detectedSkills: ['PLC Wiring', 'Industrial Wiring'], views: 3400, duration: 70, userIndex: 17 },
  { description: 'Aircon split-type installation — copper pipe bending, vacuum, and charging! ❄️ #aircon', tags: ['aircon', 'installation'], detectedSkills: ['Aircon Installation', 'Electrical Wiring'], views: 18000, duration: 80, userIndex: 18 },
  { description: 'Emergency electrical repair — finding a short circuit with a clamp meter! 🔍 #repair', tags: ['emergency', 'electrical'], detectedSkills: ['Emergency Electrical', 'Circuit Breaker Repair'], views: 9200, duration: 50, userIndex: 19 },

  // PLUMBER (5)
  { description: 'Bathroom renovation — complete pipework in one day! Before & after 🚿 #plumbing', tags: ['plumbing', 'renovation'], detectedSkills: ['Plumbing', 'Pipe Fitting'], views: 5800, duration: 72, userIndex: 20 },
  { description: 'Kitchen faucet replacement — quick and clean! No more drips 💧 #plumbing #diy', tags: ['plumbing', 'kitchen'], detectedSkills: ['Fixture Installation', 'Leak Repair'], views: 4200, duration: 35, userIndex: 21 },
  { description: 'Deep well pump installation and pressure tank setup — strong flow on all floors! 💧', tags: ['waterpump', 'plumbing'], detectedSkills: ['Water Pump Installation', 'Plumbing'], views: 3600, duration: 65, userIndex: 22 },
  { description: 'Hydro jetting a clogged sewer line — watch the blockage clear! 🌊 #drainage', tags: ['drainage', 'sewer'], detectedSkills: ['Drainage', 'Clog Removal'], views: 25000, duration: 55, userIndex: 23 },
  { description: 'Fire sprinkler system installation — safety check and pressure test! 🔥 #safety', tags: ['firesafety', 'plumbing'], detectedSkills: ['Fire Sprinkler', 'Commercial Plumbing'], views: 4800, duration: 80, userIndex: 24 },

  // RANDOM SKILLS (15)
  { description: 'Condo deep cleaning transformation — grout, windows, kitchen! ✨ #cleaning #satisfying', tags: ['cleaning', 'deepclean'], detectedSkills: ['Deep Cleaning', 'House Cleaning'], views: 32000, duration: 60, userIndex: 25 },
  { description: 'House exterior painting time lapse — fresh coat in one day! 🎨 #painting', tags: ['painting', 'exterior'], detectedSkills: ['Painting', 'Waterproofing'], views: 7800, duration: 50, userIndex: 26 },
  { description: 'Steel gate fabrication — cutting, welding, painting! From scrap to finish 🔧 #welding', tags: ['welding', 'fabrication'], detectedSkills: ['Welding', 'Steel Fabrication', 'Gate Making'], views: 7600, duration: 80, userIndex: 27 },
  { description: 'Garden transformation — from bare soil to paradise! 🌺 #landscaping #garden', tags: ['landscaping', 'gardening'], detectedSkills: ['Landscaping', 'Plant Installation'], views: 9300, duration: 70, userIndex: 28 },
  { description: 'Piano recital piece by my 8-year-old student — Fur Elise! 🎹 So proud of her! #music', tags: ['piano', 'music'], detectedSkills: ['Piano Lessons', 'Music Theory'], views: 4500, duration: 120, userIndex: 29 },
  { description: 'Penetration test demo — finding SQL injection in a web app 🔐 #cybersecurity #ethicalhacking', tags: ['cybersecurity', 'pentest'], detectedSkills: ['Penetration Testing', 'Cybersecurity'], views: 16500, duration: 90, userIndex: 30 },
  { description: 'Logo design process — from sketch to vector in Illustrator! 🎨 #graphicdesign #branding', tags: ['design', 'branding'], detectedSkills: ['Graphic Design', 'Branding'], views: 8400, duration: 65, userIndex: 31 },
  { description: 'CHB wall building time lapse — foundation to finish! 🧱 #masonry #construction', tags: ['masonry', 'construction'], detectedSkills: ['Masonry', 'Concrete Work'], views: 5200, duration: 55, userIndex: 32 },
  { description: 'Aircon deep cleaning — ito yung dumi na lumalabas! 😱 #aircon #satisfying', tags: ['aircon', 'cleaning'], detectedSkills: ['Aircon Cleaning', 'HVAC'], views: 45000, duration: 50, userIndex: 33 },
  { description: 'Rooftop waterproofing — step by step para walang leaks! 🏠 #waterproofing', tags: ['roofing', 'waterproofing'], detectedSkills: ['Roofing', 'Waterproofing'], views: 8900, duration: 60, userIndex: 34 },
  { description: 'Japanese greetings in 60 seconds — perfect for beginners! 🇯🇵 #nihongo #japanese', tags: ['japanese', 'language'], detectedSkills: ['Japanese Language', 'JLPT Preparation'], views: 12000, duration: 58, userIndex: 35 },
  { description: 'Social media content strategy — how I grew a brand to 100K! 🚀 #socialmedia #tips', tags: ['socialmedia', 'marketing'], detectedSkills: ['Social Media Management', 'Content Creation'], views: 18500, duration: 95, userIndex: 36 },
  { description: 'Shopify store setup speed run — theme, products, payments in 10 minutes! 🛒 #ecommerce', tags: ['shopify', 'ecommerce'], detectedSkills: ['Shopify', 'E-commerce'], views: 7200, duration: 85, userIndex: 37 },
  { description: 'HIIT workout demo — 15 minutes, no equipment needed! 💪 #fitness #workout', tags: ['fitness', 'hiit'], detectedSkills: ['Personal Training', 'HIIT'], views: 28000, duration: 110, userIndex: 38 },
  { description: 'Parallel parking tutorial — easiest technique for beginners! 🚗 #driving #lto', tags: ['driving', 'tutorial'], detectedSkills: ['Driving Lessons', 'Defensive Driving'], views: 35000, duration: 75, userIndex: 39 },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to ${MONGODB_URI}`);

    console.log('Clearing all data...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Reel.deleteMany({}),
    ]);
    // Drop any stale indexes
    try { await mongoose.connection.collection('users').dropIndexes(); } catch (_) {}
    // Clear related collections
    const collections = ['conversations', 'messages', 'notifications', 'ratings'];
    for (const col of collections) {
      try { await mongoose.connection.collection(col).deleteMany({}); } catch (_) {}
    }

    console.log('Creating 40 freelancer users (all Level 2)...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Level 2 requirements: emailVerified + KYC approved (gov ID + selfie verified) + resume + >=3 skills + hourlyRate > 0 + >=1 portfolio
    const createdUsers = await User.insertMany(
      users.map((u, i) => ({
        ...u,
        password: hashedPassword,
        isFreelancer: true,
        isHirer: true,
        isOpenForWork: true,
        emailVerified: true,
        badgeLevel: 2,
        kycStatus: 'approved',
        governmentId: {
          url: GOV_ID_IMG,
          type: ['PhilSys', 'Passport', 'Driver License', 'SSS', 'UMID'][i % 5],
          verified: true,
          uploadedAt: new Date(),
        },
        selfieUrl: SELFIE_IMG,
        selfieVerified: true,
        resumeUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
        portfolio: [{
          title: u.skills[0],
          description: `Sample work: ${u.skills.slice(0, 3).join(', ')}`,
          imageUrl: `https://picsum.photos/seed/portfolio${i}/400/300`,
        }],
      }))
    );
    console.log(`  Created ${createdUsers.length} freelancers`);

    // Admin account
    await User.create({
      name: 'GaLink Admin',
      email: 'admin@galink.ph',
      password: await bcrypt.hash('Admin@GaLink2026!', 10),
      isAdmin: true,
      isActive: true,
      emailVerified: true,
      badgeLevel: 0,
      profilePhoto: 'https://api.dicebear.com/7.x/initials/svg?seed=GaLink+Admin&backgroundColor=6366f1&textColor=ffffff',
      bio: 'Platform administrator',
    });
    console.log('  Admin account: admin@galink.ph / Admin@GaLink2026!');

    // Posts
    console.log('Creating posts (1 per worker)...');
    const createdPosts = await Post.insertMany(
      posts.map((p) => ({
        content: p.content,
        tags: p.tags,
        imageUrl: p.imageUrl,
        author: createdUsers[p.userIndex]._id,
      }))
    );
    console.log(`  Created ${createdPosts.length} posts`);

    // Reels
    console.log('Creating reels (1 per worker)...');
    const createdReels = await Reel.insertMany(
      reelsData.map((r, i) => ({
        description: r.description,
        tags: r.tags,
        detectedSkills: r.detectedSkills,
        views: r.views,
        duration: r.duration,
        author: createdUsers[r.userIndex]._id,
        videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
        thumbnailUrl: `https://picsum.photos/seed/reel${i + 1}/400/700`,
      }))
    );
    console.log(`  Created ${createdReels.length} reels`);

    // Summary
    console.log('\n════════════════════════════════════════');
    console.log('  SEED COMPLETE — 40 Filipino Workers');
    console.log('════════════════════════════════════════');
    console.log('\nAll passwords: password123');
    console.log('Admin: admin@galink.ph / Admin@GaLink2026!\n');

    const groups = [
      { label: 'Tech', range: [0, 5] },
      { label: 'Carpentry', range: [5, 10] },
      { label: 'Education', range: [10, 15] },
      { label: 'Electrician', range: [15, 20] },
      { label: 'Plumber', range: [20, 25] },
      { label: 'Random Skills', range: [25, 40] },
    ];

    groups.forEach(({ label, range }) => {
      console.log(`\n── ${label} ──`);
      createdUsers.slice(range[0], range[1]).forEach(u =>
        console.log(`  ${u.email.padEnd(36)} ${u.name} (Level ${u.badgeLevel})`)
      );
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
