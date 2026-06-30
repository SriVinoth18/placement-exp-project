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
