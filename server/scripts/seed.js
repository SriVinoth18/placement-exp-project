import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Company from '../models/Company.js';

const sampleCompanies = [
  {
    name: 'Google',
    slug: 'google',
    description: 'Global technology company focused on search, cloud, and AI products.',
    website: 'https://careers.google.com',
    logoUrl: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    rounds: [
      {
        order: 1,
        name: 'Online Assessment',
        description: 'Two coding problems on data structures and algorithms.',
        duration: '60 mins',
        tips: 'Practice LeetCode medium problems on arrays, trees, and graphs.',
      },
      {
        order: 2,
        name: 'Technical Interview 1',
        description: 'Deep dive into DSA and problem-solving approach.',
        duration: '45 mins',
        tips: 'Think aloud and discuss time/space complexity.',
      },
      {
        order: 3,
        name: 'Technical Interview 2',
        description: 'System design or advanced coding based on role.',
        duration: '45 mins',
        tips: 'Review scalable system design basics.',
      },
      {
        order: 4,
        name: 'HR Round',
        description: 'Behavioral questions and culture fit discussion.',
        duration: '30 mins',
        tips: 'Prepare STAR format answers for leadership and teamwork.',
      },
    ],
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    description: 'Leading software company known for Azure, Office, and enterprise solutions.',
    website: 'https://careers.microsoft.com',
    logoUrl: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b',
    rounds: [
      {
        order: 1,
        name: 'Online Coding Test',
        description: 'Coding assessment on Codility or similar platform.',
        duration: '90 mins',
        tips: 'Focus on edge cases and clean code.',
      },
      {
        order: 2,
        name: 'Technical Interviews',
        description: 'Two rounds covering DSA and problem solving.',
        duration: '45 mins each',
        tips: 'Be comfortable with OOP and design patterns.',
      },
      {
        order: 3,
        name: 'AA (As Appropriate) Round',
        description: 'Final discussion with hiring manager.',
        duration: '30 mins',
        tips: 'Show passion for the team and product area.',
      },
    ],
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    description: 'E-commerce and cloud computing giant (AWS).',
    website: 'https://www.amazon.jobs',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    rounds: [
      {
        order: 1,
        name: 'Online Assessment',
        description: 'Debugging, coding, and work style survey.',
        duration: '2 hours',
        tips: 'Review Amazon Leadership Principles before HR rounds.',
      },
      {
        order: 2,
        name: 'Technical Interview',
        description: 'Leadership principle questions plus coding.',
        duration: '60 mins',
        tips: 'Use LP stories even in technical rounds.',
      },
      {
        order: 3,
        name: 'Bar Raiser / Final',
        description: 'High bar technical and behavioral evaluation.',
        duration: '60 mins',
        tips: 'Demonstrate ownership and customer obsession with examples.',
      },
    ],
  },
  {
    name: 'TCS',
    slug: 'tcs',
    description: 'Tata Consultancy Services — global IT services and consulting.',
    website: 'https://www.tcs.com/careers',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    rounds: [
      {
        order: 1,
        name: 'Aptitude & Verbal',
        description: 'Quantitative aptitude, logical reasoning, and English.',
        duration: '90 mins',
        tips: 'Practice previous year TCS NQT patterns.',
      },
      {
        order: 2,
        name: 'Technical MCQ',
        description: 'Questions from programming, DBMS, OS, and CN.',
        duration: '45 mins',
        tips: 'Revise core CS fundamentals.',
      },
      {
        order: 3,
        name: 'HR Interview',
        description: 'Resume discussion and general HR questions.',
        duration: '20 mins',
        tips: 'Know your projects and be clear about relocation.',
      },
    ],
  },
  {
    name: 'Infosys',
    slug: 'infosys',
    description: 'Global leader in next-generation digital services and consulting.',
    website: 'https://www.infosys.com/careers',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    rounds: [
      {
        order: 1,
        name: 'Online Test',
        description: 'Aptitude, reasoning, and verbal ability.',
        duration: '65 mins',
        tips: 'Time management is critical — skip hard questions.',
      },
      {
        order: 2,
        name: 'Technical Interview',
        description: 'Questions on programming, projects, and fundamentals.',
        duration: '30 mins',
        tips: 'Explain one project end-to-end confidently.',
      },
      {
        order: 3,
        name: 'HR Round',
        description: 'Background verification and offer discussion.',
        duration: '15 mins',
        tips: 'Be honest about joining timeline.',
      },
    ],
  },
  {
    name: 'Meta',
    slug: 'meta',
    description: 'Technology conglomerate and parent company of Facebook, Instagram, and WhatsApp.',
    website: 'https://www.metacareers.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    rounds: [
      {
        order: 1,
        name: 'Online Assessment',
        description: 'Coding test on HackerRank or CodeSignal.',
        duration: '70 mins',
        tips: 'Practice LeetCode medium to hard problems, focus on speed and correctness.',
      },
      {
        order: 2,
        name: 'Technical Interview 1',
        description: 'Algorithms and data structures problem solving.',
        duration: '45 mins',
        tips: 'Communicate clearly and write clean, structured code.',
      },
      {
        order: 3,
        name: 'Technical Interview 2',
        description: 'System design and product architecture scaling.',
        duration: '45 mins',
        tips: 'Read up on large scale storage, caching, and load balancing.',
      },
      {
        order: 4,
        name: 'Behavioral Round',
        description: 'Culture fit and collaboration discussions.',
        duration: '45 mins',
        tips: 'Review Meta core values and align your stories accordingly.',
      },
    ],
  },
  {
    name: 'Apple',
    slug: 'apple',
    description: 'Multinational technology company specializing in consumer electronics, software, and services.',
    website: 'https://www.apple.com/careers',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    rounds: [
      {
        order: 1,
        name: 'Technical Phone Screen',
        description: 'Basic coding, system, and design questions.',
        duration: '45 mins',
        tips: 'Brush up on basic DSA and operating system fundamentals.',
      },
      {
        order: 2,
        name: 'Technical Interview 1',
        description: 'In-depth data structures and coding accuracy.',
        duration: '60 mins',
        tips: 'Write bug-free code and consider all boundary conditions.',
      },
      {
        order: 3,
        name: 'Technical Interview 2',
        description: 'Low-level design and hardware-software integration ideas.',
        duration: '60 mins',
        tips: 'Be familiar with memory management and concurrency.',
      },
      {
        order: 4,
        name: 'Director Round',
        description: 'High-level architectural discussions and team fit.',
        duration: '45 mins',
        tips: 'Demonstrate deep technical curiosity and problem-solving passion.',
      },
    ],
  },
  {
    name: 'Netflix',
    slug: 'netflix',
    description: 'Subscription-based streaming service and media production company.',
    website: 'https://jobs.netflix.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    rounds: [
      {
        order: 1,
        name: 'Technical Screen',
        description: 'Initial algorithm design and coding.',
        duration: '60 mins',
        tips: 'Focus on efficient solutions and clean code structure.',
      },
      {
        order: 2,
        name: 'System Design',
        description: 'Scalability, streaming protocols, and microservices.',
        duration: '60 mins',
        tips: 'Learn about CDN architectures and distributed caching mechanisms.',
      },
      {
        order: 3,
        name: 'Culture Fit Round 1',
        description: 'Deep dive into Netflix Freedom & Responsibility culture.',
        duration: '45 mins',
        tips: 'Read the Netflix Culture Memo very thoroughly.',
      },
      {
        order: 4,
        name: 'Culture Fit Round 2',
        description: 'Final values alignment with leadership.',
        duration: '45 mins',
        tips: 'Show high ownership, direct communication, and transparency.',
      },
    ],
  },
  {
    name: 'Adobe',
    slug: 'adobe',
    description: 'Software company specializing in creativity, document management, and digital marketing tools.',
    website: 'https://www.adobe.com/careers',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg',
    rounds: [
      {
        order: 1,
        name: 'Online Assessment',
        description: 'Coding questions, CS fundamentals, and math puzzles.',
        duration: '90 mins',
        tips: 'Manage time well, and practice medium DSA problems.',
      },
      {
        order: 2,
        name: 'Technical Round 1',
        description: 'Data structures, algorithms, and OOP concepts.',
        duration: '60 mins',
        tips: 'Be prepared for low-level design questions and coding implementation.',
      },
      {
        order: 3,
        name: 'Technical Round 2',
        description: 'Advanced algorithms, OS, DBMS, and system architecture.',
        duration: '60 mins',
        tips: 'Review operating system basics like process synchronization and memory paging.',
      },
      {
        order: 4,
        name: 'HR & Fitment Interview',
        description: 'Background validation, communication check, and fitment.',
        duration: '30 mins',
        tips: 'Demonstrate enthusiasm and discuss your achievements clearly.',
      },
    ],
  },
  {
    name: 'Oracle',
    slug: 'oracle',
    description: 'Computer technology corporation specializing in database software, cloud systems, and enterprise products.',
    website: 'https://www.oracle.com/careers',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
    rounds: [
      {
        order: 1,
        name: 'Online Assessment',
        description: 'MCQs on CS fundamentals, SQL, and programming problems.',
        duration: '90 mins',
        tips: 'Revise database concepts and basic SQL queries.',
      },
      {
        order: 2,
        name: 'Technical Round 1',
        description: 'Core DSA questions and live coding.',
        duration: '45 mins',
        tips: 'Think aloud and show systematic testing of your solution.',
      },
      {
        order: 3,
        name: 'Technical Round 2',
        description: 'System design, database internals, and project discussion.',
        duration: '45 mins',
        tips: 'Be ready to design database schemas and write SQL queries.',
      },
      {
        order: 4,
        name: 'HR Round',
        description: 'General fitment and offer discussion.',
        duration: '30 mins',
        tips: 'Show standard behavioral skills and flexibility.',
      },
    ],
  },
];

async function seed() {
  await connectDB();

  for (const data of sampleCompanies) {
    await Company.findOneAndUpdate({ slug: data.slug }, data, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    console.log(`Seeded: ${data.name}`);
  }

  console.log('Seed completed successfully');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
