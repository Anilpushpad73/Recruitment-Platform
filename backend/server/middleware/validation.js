import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  handleValidationErrors
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const profileUpdateValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each skill cannot exceed 50 characters'),
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'junior', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),
  body('linkedinUrl')
    .optional()
    .isURL()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)
    .withMessage('Please enter a valid LinkedIn URL'),
  body('githubUrl')
    .optional()
    .isURL()
    .matches(/^https?:\/\/(www\.)?github\.com\/.*$/)
    .withMessage('Please enter a valid GitHub URL'),
  body('portfolioUrl')
    .optional()
    .isURL()
    .withMessage('Please enter a valid portfolio URL'),
  body('resumeUrl')
    .optional()
    .isURL()
    .withMessage('Please enter a valid resumeUrl URL'),
  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects must be an array'),
  body('projects.*.title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Project title cannot exceed 100 characters'),
  body('projects.*.description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Project description cannot exceed 1000 characters'),
  body('education')
    .optional()
    .isArray()
    .withMessage('Education must be an array'),
  body('education.*.institution')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Institution name cannot exceed 100 characters'),
  body('education.*.degree')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Degree cannot exceed 100 characters'),
  body('education.*.field')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Field of study cannot exceed 100 characters'),
  body('education.*.grade')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Grade cannot exceed 20 characters'),
  body('education.*.achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('education.*.achievements.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each achievement cannot exceed 200 characters'),

  handleValidationErrors
];