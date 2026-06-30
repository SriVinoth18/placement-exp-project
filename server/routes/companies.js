import { Router } from 'express';
import Company from '../models/Company.js';
import Experience from '../models/Experience.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(verifyFirebaseToken);

router.get('/', async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true })
      .select('name slug logoUrl description')
      .sort({ name: 1 });

    res.json(companies);
  } catch (error) {
    console.error('List companies error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const company = await Company.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const experiences = await Experience.find({ company: company._id })
      .select('title year role college branch createdAt pdfUrl fileName')
      .sort({ createdAt: -1 });

    res.json({
      ...company.toObject(),
      experiences,
    });
  } catch (error) {
    console.error('Company detail error:', error);
    res.status(500).json({ message: 'Failed to fetch company details' });
  }
});

router.get('/:slug/experiences', async (req, res) => {
  try {
    const company = await Company.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const experiences = await Experience.find({ company: company._id })
      .select('title year role college branch createdAt pdfUrl fileName')
      .sort({ createdAt: -1 });

    res.json(experiences);
  } catch (error) {
    console.error('Experiences list error:', error);
    res.status(500).json({ message: 'Failed to fetch experiences' });
  }
});

export default router;

// Experience download route is in a separate export below for /api/experiences/:id/download

export const experienceDownloadRouter = Router();

experienceDownloadRouter.get('/:id/download', verifyFirebaseToken, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    const filename = path.basename(experience.pdfUrl);
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'PDF file not found on server' });
    }

    const downloadName = experience.fileName || `${experience.title}.pdf`;
    res.download(filePath, downloadName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download experience' });
  }
});
