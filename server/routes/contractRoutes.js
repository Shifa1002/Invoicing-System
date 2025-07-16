import express from 'express';
import Contract from '../models/Contract.js';
import authMiddleware from '../middleware/authMiddleware.js';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contracts
 *   description: Contract operations
 */

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: Get all contracts
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contracts
 */
router.get('/', authMiddleware, async (req, res) => {
  const contracts = await Contract.find();
  res.status(200).json(contracts);
});

/**
 * @swagger
 * /api/contracts:
 *   post:
 *     summary: Create a new contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Contract created
 */
router.post('/', authMiddleware, async (req, res) => {
  const contract = new Contract(req.body);
  await contract.save();
  res.status(201).json(contract);
});

// Update contract
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: 'Error updating contract', error: err });
  }
});

// Delete contract
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    res.json({ message: 'Contract deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting contract', error: err });
  }
});

// Download contract as PDF
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('client');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=contract-${contract._id}.pdf`,
        'Content-Length': pdfData.length
      });
      res.end(pdfData);
    });
    doc.fontSize(20).text('Contract', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Contract ID: ${contract._id}`);
    doc.text(`Client: ${contract.client?.name || ''}`);
    doc.text(`Status: ${contract.status}`);
    doc.text(`Start Date: ${contract.startDate}`);
    doc.text(`End Date: ${contract.endDate}`);
    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Error generating PDF', error: err });
  }
});

export default router;
