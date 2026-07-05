import { Router } from 'express';
import multer from 'multer';
import Experience from '../models/Experience.js';
import { verifyAdminToken } from '../middleware/verifyAdminToken.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Custom upload middleware to catch size/format errors and return 400 Bad Request
const uploadSinglePdf = upload.single('pdf');
function handlePdfUpload(req, res, next) {
  uploadSinglePdf(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Maximum file size allowed is 10 MB' });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
}

router.use(verifyAdminToken);

// 1. Fetch PDFs (with populated company and uploader name, search and companyId filters)
router.get('/', async (req, res) => {
  try {
    const { search, companyId } = req.query;
    const query = {};

    if (companyId) {
      query.company = companyId;
    }
    if (search?.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const experiences = await Experience.find(query)
      .populate('company', 'name')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(experiences);
  } catch (error) {
    console.error('List admin experiences error:', error);
    res.status(500).json({ message: 'Failed to fetch experience PDFs' });
  }
});

// 2. Upload PDF
router.post('/', handlePdfUpload, async (req, res) => {
  try {
    const { title, company, year, role, description } = req.body;

    if (!title?.trim() || !company || !year) {
      return res.status(400).json({ message: 'Title, Company, and Year are required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    const experience = await Experience.create({
      title: title.trim(),
      company,
      year: Number(year),
      role: role?.trim() || '',
      description: description?.trim() || '',
      cloudinaryUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      pdfUrl: cloudinaryResult.secure_url, // Backward compatibility
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
    });

    res.status(201).json(experience);
  } catch (error) {
    console.error('Create admin experience error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload experience PDF' });
  }
});

// 3. Edit Metadata & Replace PDF
router.put('/:id', handlePdfUpload, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience PDF not found' });
    }

    const { title, company, year, role, description } = req.body;

    if (title !== undefined) experience.title = title.trim();
    if (company !== undefined) experience.company = company;
    if (year !== undefined) experience.year = Number(year);
    if (role !== undefined) experience.role = role.trim();
    if (description !== undefined) experience.description = description.trim();

    // If replacement PDF file is supplied
    if (req.file) {
      // 1. Upload new asset
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      
      // 2. Delete old asset
      if (experience.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(experience.cloudinaryPublicId);
        } catch (cloudinaryErr) {
          console.warn('Failed to delete old Cloudinary asset:', cloudinaryErr);
        }
      }

      // 3. Update paths
      experience.cloudinaryUrl = cloudinaryResult.secure_url;
      experience.cloudinaryPublicId = cloudinaryResult.public_id;
      experience.pdfUrl = cloudinaryResult.secure_url;
      experience.fileName = req.file.originalname;
    }

    await experience.save();
    res.json(experience);
  } catch (error) {
    console.error('Update admin experience error:', error);
    res.status(500).json({ message: error.message || 'Failed to update experience PDF' });
  }
});

// 4. Delete PDF from MongoDB and Cloudinary
router.delete('/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience PDF not found' });
    }

    // Delete from Cloudinary
    if (experience.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(experience.cloudinaryPublicId);
      } catch (cloudinaryErr) {
        console.warn('Failed to delete asset from Cloudinary:', cloudinaryErr);
      }
    }

    // Delete from MongoDB
    await experience.deleteOne();
    res.json({ message: 'Experience PDF deleted successfully' });
  } catch (error) {
    console.error('Delete admin experience error:', error);
    res.status(500).json({ message: 'Failed to delete experience PDF' });
  }
});

export default router;
