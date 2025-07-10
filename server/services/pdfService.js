import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
  constructor() {
    this.logoPath = path.join(__dirname, '../assets/logo.png');
    this.fontPath = path.join(__dirname, '../assets/fonts');
    this.tempDir = path.join(__dirname, '../temp');
    this.outputDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateInvoicePDF(invoice) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `invoice-${invoice.invoiceNumber || invoice._id}-${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc.fontSize(24).text('INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, { align: 'right' });
        doc.text(`Date: ${format(new Date(invoice.issueDate), 'MMM dd, yyyy')}`, { align: 'right' });
        doc.text(`Due Date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}`, { align: 'right' });
        doc.moveDown();

        // Client Information
        if (invoice.client) {
          doc.fontSize(14).text('Bill To:', { underline: true });
          doc.fontSize(12).text(invoice.client.name);
          if (invoice.client.email) doc.text(`Email: ${invoice.client.email}`);
          if (invoice.client.phone) doc.text(`Phone: ${invoice.client.phone}`);
          if (invoice.client.address) doc.text(`Address: ${invoice.client.address}`);
          doc.moveDown();
        }

        // Items Table
        doc.fontSize(14).text('Items:', { underline: true });
        doc.moveDown();

        // Table headers
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text('Item', 50, tableTop);
        doc.text('Quantity', 200, tableTop);
        doc.text('Unit Price', 300, tableTop);
        doc.text('Total', 400, tableTop);

        // Table content
        let currentY = tableTop + 20;
        invoice.products.forEach((item, index) => {
          const productName = item.product?.name || 'Unknown Product';
          const quantity = item.quantity || 0;
          const unitPrice = item.unitPrice || item.product?.price || 0;
          const total = quantity * unitPrice;

          doc.text(productName, 50, currentY);
          doc.text(quantity.toString(), 200, currentY);
          doc.text(`$${unitPrice.toFixed(2)}`, 300, currentY);
          doc.text(`$${total.toFixed(2)}`, 400, currentY);

          currentY += 20;
        });

        // Totals
        doc.moveDown(2);
        doc.text(`Subtotal: $${invoice.subtotal?.toFixed(2) || '0.00'}`, { align: 'right' });
        doc.text(`Tax: $${invoice.tax?.toFixed(2) || '0.00'}`, { align: 'right' });
        doc.fontSize(14).text(`Total: $${invoice.totalAmount?.toFixed(2) || '0.00'}`, { align: 'right' });

        // Payment Information
        if (invoice.paymentMode) {
          doc.moveDown(2);
          doc.fontSize(12).text('Payment Information:', { underline: true });
          doc.fontSize(10).text(`Payment Mode: ${invoice.paymentMode}`);
          if (invoice.paymentMethod) doc.text(`Payment Method: ${invoice.paymentMethod}`);
          if (invoice.paymentReference) doc.text(`Payment Reference: ${invoice.paymentReference}`);
          if (invoice.paymentDate) doc.text(`Payment Date: ${format(new Date(invoice.paymentDate), 'MMM dd, yyyy')}`);
        }

        // Notes
        if (invoice.notes) {
          doc.moveDown(2);
          doc.fontSize(12).text('Notes:', { underline: true });
          doc.fontSize(10).text(invoice.notes);
        }

        // Terms
        if (invoice.terms) {
          doc.moveDown(2);
          doc.fontSize(12).text('Terms:', { underline: true });
          doc.fontSize(10).text(invoice.terms);
        }

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateInvoicePDFBuffer(invoice) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header
        doc.fontSize(24).text('INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, { align: 'right' });
        doc.text(`Date: ${format(new Date(invoice.issueDate), 'MMM dd, yyyy')}`, { align: 'right' });
        doc.text(`Due Date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}`, { align: 'right' });
        doc.moveDown();

        // Client Information
        if (invoice.client) {
          doc.fontSize(14).text('Bill To:', { underline: true });
          doc.fontSize(12).text(invoice.client.name);
          if (invoice.client.email) doc.text(`Email: ${invoice.client.email}`);
          if (invoice.client.phone) doc.text(`Phone: ${invoice.client.phone}`);
          if (invoice.client.address) doc.text(`Address: ${invoice.client.address}`);
          doc.moveDown();
        }

        // Items Table
        doc.fontSize(14).text('Items:', { underline: true });
        doc.moveDown();

        // Table headers
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text('Item', 50, tableTop);
        doc.text('Quantity', 200, tableTop);
        doc.text('Unit Price', 300, tableTop);
        doc.text('Total', 400, tableTop);

        // Table content
        let currentY = tableTop + 20;
        invoice.products.forEach((item, index) => {
          const productName = item.product?.name || 'Unknown Product';
          const quantity = item.quantity || 0;
          const unitPrice = item.unitPrice || item.product?.price || 0;
          const total = quantity * unitPrice;

          doc.text(productName, 50, currentY);
          doc.text(quantity.toString(), 200, currentY);
          doc.text(`$${unitPrice.toFixed(2)}`, 300, currentY);
          doc.text(`$${total.toFixed(2)}`, 400, currentY);

          currentY += 20;
        });

        // Totals
        doc.moveDown(2);
        doc.text(`Subtotal: $${invoice.subtotal?.toFixed(2) || '0.00'}`, { align: 'right' });
        doc.text(`Tax: $${invoice.tax?.toFixed(2) || '0.00'}`, { align: 'right' });
        doc.fontSize(14).text(`Total: $${invoice.totalAmount?.toFixed(2) || '0.00'}`, { align: 'right' });

        // Payment Information
        if (invoice.paymentMode) {
          doc.moveDown(2);
          doc.fontSize(12).text('Payment Information:', { underline: true });
          doc.fontSize(10).text(`Payment Mode: ${invoice.paymentMode}`);
          if (invoice.paymentMethod) doc.text(`Payment Method: ${invoice.paymentMethod}`);
          if (invoice.paymentReference) doc.text(`Payment Reference: ${invoice.paymentReference}`);
          if (invoice.paymentDate) doc.text(`Payment Date: ${format(new Date(invoice.paymentDate), 'MMM dd, yyyy')}`);
        }

        // Notes
        if (invoice.notes) {
          doc.moveDown(2);
          doc.fontSize(12).text('Notes:', { underline: true });
          doc.fontSize(10).text(invoice.notes);
        }

        // Terms
        if (invoice.terms) {
          doc.moveDown(2);
          doc.fontSize(12).text('Terms:', { underline: true });
          doc.fontSize(10).text(invoice.terms);
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateContractPDF(contract) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `contract-${contract.contractNumber || contract._id}-${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc.fontSize(24).text('CONTRACT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Contract #: ${contract.contractNumber || 'N/A'}`, { align: 'right' });
        doc.text(`Title: ${contract.title}`, { align: 'right' });
        doc.text(`Start Date: ${format(new Date(contract.startDate), 'MMM dd, yyyy')}`, { align: 'right' });
        doc.text(`End Date: ${format(new Date(contract.endDate), 'MMM dd, yyyy')}`, { align: 'right' });
        doc.moveDown();

        // Client Information
        if (contract.client) {
          doc.fontSize(14).text('Client Information:', { underline: true });
          doc.fontSize(12).text(contract.client.name);
          if (contract.client.email) doc.text(`Email: ${contract.client.email}`);
          if (contract.client.phone) doc.text(`Phone: ${contract.client.phone}`);
          if (contract.client.address) doc.text(`Address: ${contract.client.address}`);
          doc.moveDown();
        }

        // Contract Details
        doc.fontSize(14).text('Contract Details:', { underline: true });
        doc.fontSize(12).text(`Status: ${contract.status}`);
        doc.text(`Payment Terms: ${contract.paymentTerms}`);
        doc.text(`Currency: ${contract.currency}`);
        doc.text(`Billing Cycle: ${contract.billingCycle}`);
        doc.text(`Auto Renew: ${contract.autoRenew ? 'Yes' : 'No'}`);
        if (contract.autoRenew) {
          doc.text(`Renewal Term: ${contract.renewalTerm} months`);
        }
        doc.moveDown();

        // Items Table
        doc.fontSize(14).text('Services/Products:', { underline: true });
        doc.moveDown();

        // Table headers
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text('Item', 50, tableTop);
        doc.text('Quantity', 200, tableTop);
        doc.text('Unit Price', 300, tableTop);
        doc.text('Total', 400, tableTop);

        // Table content
        let currentY = tableTop + 20;
        contract.products.forEach((item, index) => {
          const productName = item.product?.name || 'Unknown Product';
          const quantity = item.quantity || 0;
          const unitPrice = item.unitPrice || item.product?.price || 0;
          const total = quantity * unitPrice;

          doc.text(productName, 50, currentY);
          doc.text(quantity.toString(), 200, currentY);
          doc.text(`$${unitPrice.toFixed(2)}`, 300, currentY);
          doc.text(`$${total.toFixed(2)}`, 400, currentY);

          currentY += 20;
        });

        // Totals
        doc.moveDown(2);
        doc.text(`Subtotal: $${contract.subtotal?.toFixed(2) || '0.00'}`, { align: 'right' });
        doc.text(`Tax: $${contract.tax?.toFixed(2) || '0.00'}`, { align: 'right' });
        doc.fontSize(14).text(`Total: $${contract.totalAmount?.toFixed(2) || '0.00'}`, { align: 'right' });

        // Description
        if (contract.description) {
          doc.moveDown(2);
          doc.fontSize(12).text('Description:', { underline: true });
          doc.fontSize(10).text(contract.description);
        }

        // Terms
        if (contract.terms) {
          doc.moveDown(2);
          doc.fontSize(12).text('Terms and Conditions:', { underline: true });
          doc.fontSize(10).text(contract.terms);
        }

        // Notes
        if (contract.notes) {
          doc.moveDown(2);
          doc.fontSize(12).text('Additional Notes:', { underline: true });
          doc.fontSize(10).text(contract.notes);
        }

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateContractPDFBuffer(contract) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header
        doc.fontSize(24).text('CONTRACT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Contract #: ${contract.contractNumber || 'N/A'}`, { align: 'right' });
        doc.text(`Title: ${contract.title}`, { align: 'right' });
        doc.text(`Start Date: ${format(new Date(contract.startDate), 'MMM dd, yyyy')}`, { align: 'right' });
        doc.text(`End Date: ${format(new Date(contract.endDate), 'MMM dd, yyyy')}`, { align: 'right' });
        doc.moveDown();

        // Client Information
        if (contract.client) {
          doc.fontSize(14).text('Client Information:', { underline: true });
          doc.fontSize(12).text(contract.client.name);
          if (contract.client.email) doc.text(`Email: ${contract.client.email}`);
          if (contract.client.phone) doc.text(`Phone: ${contract.client.phone}`);
          if (contract.client.address) doc.text(`Address: ${contract.client.address}`);
          doc.moveDown();
        }

        // Contract Details
        doc.fontSize(14).text('Contract Details:', { underline: true });
        doc.fontSize(12).text(`Status: ${contract.status}`);
        doc.text(`Payment Terms: ${contract.paymentTerms}`);
        doc.text(`Currency: ${contract.currency}`);
        doc.text(`Billing Cycle: ${contract.billingCycle}`);
        doc.text(`Auto Renew: ${contract.autoRenew ? 'Yes' : 'No'}`);
        if (contract.autoRenew) {
          doc.text(`Renewal Term: ${contract.renewalTerm} months`);
        }
        doc.moveDown();

        // Items Table
        doc.fontSize(14).text('Services/Products:', { underline: true });
        doc.moveDown();

        // Table headers
        const tableTop = doc.y;
        doc.fontSize(10);
        doc.text('Item', 50, tableTop);
        doc.text('Quantity', 200, tableTop);
        doc.text('Unit Price', 300, tableTop);
        doc.text('Total', 400, tableTop);

        // Table content
        let currentY = tableTop + 20;
        contract.products.forEach((item, index) => {
          const productName = item.product?.name || 'Unknown Product';
          const quantity = item.quantity || 0;
          const unitPrice = item.unitPrice || item.product?.price || 0;
          const total = quantity * unitPrice;

          doc.text(productName, 50, currentY);
          doc.text(quantity.toString(), 200, currentY);
          doc.text(`$${unitPrice.toFixed(2)}`, 300, currentY);
          doc.text(`$${total.toFixed(2)}`, 400, currentY);

          currentY += 20;
        });

        // Totals
        doc.moveDown(2);
        doc.text(`Subtotal: $${contract.subtotal?.toFixed(2) || '0.00'}`, { align: 'right' });
        doc.text(`Tax: $${contract.tax?.toFixed(2) || '0.00'}`, { align: 'right' });
        doc.fontSize(14).text(`Total: $${contract.totalAmount?.toFixed(2) || '0.00'}`, { align: 'right' });

        // Description
        if (contract.description) {
          doc.moveDown(2);
          doc.fontSize(12).text('Description:', { underline: true });
          doc.fontSize(10).text(contract.description);
        }

        // Terms
        if (contract.terms) {
          doc.moveDown(2);
          doc.fontSize(12).text('Terms and Conditions:', { underline: true });
          doc.fontSize(10).text(contract.terms);
        }

        // Notes
        if (contract.notes) {
          doc.moveDown(2);
          doc.fontSize(12).text('Additional Notes:', { underline: true });
          doc.fontSize(10).text(contract.notes);
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new PDFService(); 