import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import Company from '../models/Company.js';
import Experience from '../models/Experience.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { adminGuard } from '../middleware/adminGuard.js';
import { slugify } from '../utils/slugify.js';
import { uploadLogo, uploadPdf, getPublicFileUrl, uploadsDir } from '../utils/upload.js';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many upload requests, please try again later' },
});

router.use(verifyFirebaseToken, adminGuard);

router.get('/companies', async (_req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    console.error('Admin list companies error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

router.post('/companies', uploadLimiter, uploadLogo.single('logo'), async (req, res) => {
  try {
    const { name, description, website, rounds } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const slug = slugify(name);
    const existing = await Company.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) {
      return res.status(409).json({ message: 'Company with this name already exists' });
    }

    let parsedRounds = [];
    if (rounds) {
      try {
        parsedRounds = typeof rounds === 'string' ? JSON.parse(rounds) : rounds;
      } catch {
        return res.status(400).json({ message: 'Invalid rounds JSON' });
      }
    }

    const logoUrl = req.file ? getPublicFileUrl(req, req.file.filename) : '';

    const company = await Company.create({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      website: website?.trim() || '',
      logoUrl,
      rounds: parsedRounds,
    });

    res.status(201).json(company);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: error.message || 'Failed to create company' });
  }
});

router.put('/companies/:id', uploadLimiter, uploadLogo.single('logo'), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const { name, description, website, isActive, rounds } = req.body;

    if (name?.trim()) {
      const slug = slugify(name);
      const duplicate = await Company.findOne({
        _id: { $ne: company._id },
        $or: [{ name: name.trim() }, { slug }],
      });
      if (duplicate) {
        return res.status(409).json({ message: 'Company with this name already exists' });
      }
      company.name = name.trim();
      company.slug = slug;
    }

    if (description !== undefined) company.description = description.trim();
    if (website !== undefined) company.website = website.trim();
    if (isActive !== undefined) company.isActive = isActive === 'true' || isActive === true;

    if (rounds !== undefined) {
      try {
        company.rounds = typeof rounds === 'string' ? JSON.parse(rounds) : rounds;
      } catch {
        return res.status(400).json({ message: 'Invalid rounds JSON' });
      }
    }

    if (req.file) {
      company.logoUrl = getPublicFileUrl(req, req.file.filename);
    }

    await company.save();
    res.json(company);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: error.message || 'Failed to update company' });
  }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.isActive = false;
    await company.save();
    res.json({ message: 'Company deactivated successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Failed to deactivate company' });
  }
});

router.post(
  '/companies/:id/experiences',
  uploadLimiter,
  uploadPdf.single('pdf'),
  async (req, res) => {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const { title, year, role, college, branch } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({ message: 'Title is required' });
      }
      if (!year) {
        return res.status(400).json({ message: 'Year is required' });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'PDF file is required' });
      }

      const experience = await Experience.create({
        company: company._id,
        title: title.trim(),
        year: Number(year),
        role: role?.trim() || '',
        college: college?.trim() || null,
        branch: branch?.trim() || null,
        pdfUrl: req.file.filename,
        fileName: req.file.originalname,
        uploadedBy: req.user._id,
      });

      res.status(201).json(experience);
    } catch (error) {
      console.error('Upload experience error:', error);
      res.status(500).json({ message: error.message || 'Failed to upload experience' });
    }
  }
);

router.delete('/experiences/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    const filePath = path.join(uploadsDir, experience.pdfUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await experience.deleteOne();
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ message: 'Failed to delete experience' });
  }
});

export default router;
