import Contract from '../models/Contract.js';
import { exportToCSV } from '../services/csvService.js';
import PDFService from '../services/pdfService.js';
import mongoose from 'mongoose';
import fs from 'fs';

// Get all contracts
export const getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find().populate('client', 'name email');
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get contract by ID
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('client', 'name email');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create contract
export const createContract = async (req, res) => {
  try {
    const contract = new Contract({ ...req.body, createdBy: req.user._id });
    const saved = await contract.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update contract
export const updateContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    res.status(200).json(contract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete contract (soft delete)
export const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    res.status(200).json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export contracts as CSV
export const exportContractsCSV = async (req, res) => {
  try {
    const contracts = await Contract.find().populate('client', 'name email');
    const fields = ['_id', 'title', 'client.name', 'startDate', 'endDate', 'totalAmount'];
    const filePath = exportToCSV(contracts, fields, 'contracts');
    res.download(filePath, () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export contract as PDF (stub)
export const exportContractPDF = async (req, res) => {
  // TODO: Implement PDF export for contract
  res.status(501).json({ message: 'PDF export for contract not implemented yet.' });
};