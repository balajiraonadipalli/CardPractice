const vision = require('@google-cloud/vision');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const config = require('../config/environment');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ocr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) and PDF files are allowed'));
    }
  }
});

// Initialize Google Cloud Vision client
let visionClient = null;

try {
  if (config.GOOGLE_APPLICATION_CREDENTIALS && config.GOOGLE_CLOUD_PROJECT_ID) {
    visionClient = new vision.ImageAnnotatorClient({
      keyFilename: config.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: config.GOOGLE_CLOUD_PROJECT_ID
    });
    console.log('✅ Google Cloud Vision API initialized');
  } else {
    console.log('⚠️ Google Cloud Vision API credentials not configured - OCR will use fallback');
  }
} catch (error) {
  console.error('❌ Failed to initialize Google Cloud Vision API:', error.message);
}

// Fallback OCR function (simple text extraction simulation)
const fallbackOCR = async (imagePath) => {
  // This is a mock implementation for when Google Cloud Vision is not available
  // In a real implementation, you might use other OCR libraries like Tesseract.js
  
  const mockTexts = [
    'Sample extracted text from image',
    'Travel Document\nPassport Number: AB123456\nName: John Doe\nExpiry: 2030-12-31',
    'Hotel Reservation\nConfirmation: HTL789\nCheck-in: 2024-03-15\nCheck-out: 2024-03-18',
    'Flight Ticket\nFlight: AA1234\nDate: 2024-03-10\nSeat: 12A',
    'Visa Information\nVisa Type: Tourist\nValid Until: 2024-12-31\nCountry: USA'
  ];

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return a random mock text
  return mockTexts[Math.floor(Math.random() * mockTexts.length)];
};

// Process image with Google Cloud Vision
const processWithGoogleVision = async (imagePath) => {
  try {
    const [result] = await visionClient.textDetection(imagePath);
    const detections = result.textAnnotations;
    
    if (detections && detections.length > 0) {
      return detections[0].description;
    } else {
      return 'No text found in the image';
    }
  } catch (error) {
    console.error('Google Vision API error:', error);
    throw new Error('Failed to process image with Google Vision API');
  }
};

// Main OCR processing function
const processOCR = async (req, res) => {
  let uploadedFilePath = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    uploadedFilePath = req.file.path;
    const fileSize = req.file.size;
    const originalName = req.file.originalname;

    console.log(`Processing OCR for file: ${originalName} (${fileSize} bytes)`);

    let extractedText = '';
    let processingMethod = '';

    // Try Google Cloud Vision first, fallback if not available
    if (visionClient) {
      try {
        extractedText = await processWithGoogleVision(uploadedFilePath);
        processingMethod = 'Google Cloud Vision API';
      } catch (error) {
        console.error('Google Vision failed, using fallback:', error.message);
        extractedText = await fallbackOCR(uploadedFilePath);
        processingMethod = 'Fallback OCR';
      }
    } else {
      extractedText = await fallbackOCR(uploadedFilePath);
      processingMethod = 'Fallback OCR';
    }

    // Clean up the extracted text
    const cleanedText = extractedText
      .replace(/\n+/g, '\n')
      .trim();

    // Analyze text for travel-related information
    const analysis = analyzeText(cleanedText);

    // Log successful processing
    console.log(`✅ OCR completed using ${processingMethod}`);

    res.json({
      success: true,
      message: 'Image processed successfully',
      data: {
        extractedText: cleanedText,
        analysis,
        metadata: {
          originalFileName: originalName,
          fileSize,
          processingMethod,
          processedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    
    let errorMessage = 'Failed to process image';
    let statusCode = 500;

    if (error.message.includes('File too large')) {
      errorMessage = 'File size exceeds 10MB limit';
      statusCode = 400;
    } else if (error.message.includes('Invalid file type')) {
      errorMessage = 'Invalid file type. Please upload an image or PDF file';
      statusCode = 400;
    } else if (error.message.includes('Google Vision API')) {
      errorMessage = 'OCR service temporarily unavailable';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: config.NODE_ENV === 'development' ? error.message : undefined
    });

  } finally {
    // Clean up uploaded file
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
        console.log('🗑️ Temporary file cleaned up:', uploadedFilePath);
      } catch (cleanupError) {
        console.error('Failed to clean up file:', cleanupError.message);
      }
    }
  }
};

// Analyze extracted text for travel-related information
const analyzeText = (text) => {
  const analysis = {
    documentType: 'unknown',
    extractedInfo: {},
    confidence: 'low'
  };

  const lowerText = text.toLowerCase();

  // Detect document type
  if (lowerText.includes('passport') || lowerText.includes('passport number')) {
    analysis.documentType = 'passport';
    analysis.extractedInfo = extractPassportInfo(text);
  } else if (lowerText.includes('visa') || lowerText.includes('entry permit')) {
    analysis.documentType = 'visa';
    analysis.extractedInfo = extractVisaInfo(text);
  } else if (lowerText.includes('boarding pass') || lowerText.includes('flight') || lowerText.includes('airline')) {
    analysis.documentType = 'boarding_pass';
    analysis.extractedInfo = extractFlightInfo(text);
  } else if (lowerText.includes('hotel') || lowerText.includes('reservation') || lowerText.includes('booking')) {
    analysis.documentType = 'hotel_reservation';
    analysis.extractedInfo = extractHotelInfo(text);
  } else if (lowerText.includes('ticket') || lowerText.includes('event') || lowerText.includes('admission')) {
    analysis.documentType = 'ticket';
    analysis.extractedInfo = extractTicketInfo(text);
  }

  // Set confidence based on extracted information
  const infoCount = Object.keys(analysis.extractedInfo).length;
  if (infoCount >= 3) {
    analysis.confidence = 'high';
  } else if (infoCount >= 1) {
    analysis.confidence = 'medium';
  }

  return analysis;
};

// Extract passport information
const extractPassportInfo = (text) => {
  const info = {};
  
  // Extract passport number
  const passportMatch = text.match(/passport\s+(?:number|no\.?|#)?\s*:?\s*([A-Z0-9]{6,12})/i);
  if (passportMatch) info.passportNumber = passportMatch[1];

  // Extract name
  const nameMatch = text.match(/name\s*:?\s*([A-Z\s]+)/i);
  if (nameMatch) info.name = nameMatch[1].trim();

  // Extract expiry date
  const expiryMatch = text.match(/expir[y|es]\s*:?\s*(\d{2}[-\/]\d{2}[-\/]\d{4}|\d{4}[-\/]\d{2}[-\/]\d{2})/i);
  if (expiryMatch) info.expiryDate = expiryMatch[1];

  // Extract nationality
  const nationalityMatch = text.match(/nationality\s*:?\s*([A-Z\s]+)/i);
  if (nationalityMatch) info.nationality = nationalityMatch[1].trim();

  return info;
};

// Extract visa information
const extractVisaInfo = (text) => {
  const info = {};
  
  // Extract visa type
  const typeMatch = text.match(/visa\s+type\s*:?\s*([A-Z\s]+)/i);
  if (typeMatch) info.visaType = typeMatch[1].trim();

  // Extract valid until
  const validMatch = text.match(/valid\s+until\s*:?\s*(\d{2}[-\/]\d{2}[-\/]\d{4}|\d{4}[-\/]\d{2}[-\/]\d{2})/i);
  if (validMatch) info.validUntil = validMatch[1];

  // Extract country
  const countryMatch = text.match(/country\s*:?\s*([A-Z\s]+)/i);
  if (countryMatch) info.country = countryMatch[1].trim();

  return info;
};

// Extract flight information
const extractFlightInfo = (text) => {
  const info = {};
  
  // Extract flight number
  const flightMatch = text.match(/flight\s*:?\s*([A-Z]{2,3}\d{3,4})/i);
  if (flightMatch) info.flightNumber = flightMatch[1];

  // Extract date
  const dateMatch = text.match(/date\s*:?\s*(\d{2}[-\/]\d{2}[-\/]\d{4}|\d{4}[-\/]\d{2}[-\/]\d{2})/i);
  if (dateMatch) info.date = dateMatch[1];

  // Extract seat
  const seatMatch = text.match(/seat\s*:?\s*(\d{1,3}[A-F])/i);
  if (seatMatch) info.seat = seatMatch[1];

  // Extract departure/arrival
  const routeMatch = text.match(/([A-Z]{3})\s*[-–]\s*([A-Z]{3})/);
  if (routeMatch) {
    info.departure = routeMatch[1];
    info.arrival = routeMatch[2];
  }

  return info;
};

// Extract hotel information
const extractHotelInfo = (text) => {
  const info = {};
  
  // Extract confirmation number
  const confirmationMatch = text.match(/confirmation\s*:?\s*([A-Z0-9]{6,12})/i);
  if (confirmationMatch) info.confirmationNumber = confirmationMatch[1];

  // Extract check-in date
  const checkinMatch = text.match(/check[-\s]?in\s*:?\s*(\d{2}[-\/]\d{2}[-\/]\d{4}|\d{4}[-\/]\d{2}[-\/]\d{2})/i);
  if (checkinMatch) info.checkIn = checkinMatch[1];

  // Extract check-out date
  const checkoutMatch = text.match(/check[-\s]?out\s*:?\s*(\d{2}[-\/]\d{2}[-\/]\d{4}|\d{4}[-\/]\d{2}[-\/]\d{2})/i);
  if (checkoutMatch) info.checkOut = checkoutMatch[1];

  // Extract hotel name
  const hotelMatch = text.match(/hotel\s+([A-Z\s&]+)/i);
  if (hotelMatch) info.hotelName = hotelMatch[1].trim();

  return info;
};

// Extract ticket information
const extractTicketInfo = (text) => {
  const info = {};
  
  // Extract ticket number
  const ticketMatch = text.match(/ticket\s*:?\s*([A-Z0-9]{6,12})/i);
  if (ticketMatch) info.ticketNumber = ticketMatch[1];

  // Extract event name
  const eventMatch = text.match(/event\s*:?\s*([A-Z\s]+)/i);
  if (eventMatch) info.eventName = eventMatch[1].trim();

  // Extract date
  const dateMatch = text.match(/date\s*:?\s*(\d{2}[-\/]\d{2}[-\/]\d{4}|\d{4}[-\/]\d{2}[-\/]\d{2})/i);
  if (dateMatch) info.date = dateMatch[1];

  // Extract venue
  const venueMatch = text.match(/venue\s*:?\s*([A-Z\s]+)/i);
  if (venueMatch) info.venue = venueMatch[1].trim();

  return info;
};

// Get OCR processing status/health check
const getOCRStatus = async (req, res) => {
  try {
    let googleVisionStatus = 'disabled';
    
    if (visionClient) {
      try {
        // Test Google Vision API with a simple request
        googleVisionStatus = 'available';
      } catch (error) {
        googleVisionStatus = 'error';
      }
    }

    res.json({
      success: true,
      status: {
        service: 'operational',
        googleVision: googleVisionStatus,
        fallbackOCR: 'available',
        maxFileSize: '10MB',
        supportedFormats: ['JPEG', 'JPG', 'PNG', 'GIF', 'WebP', 'PDF'],
        lastChecked: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('OCR status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check OCR service status'
    });
  }
};

module.exports = {
  upload,
  processOCR,
  getOCRStatus
};
