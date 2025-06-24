import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateInvoicePDF = async (invoice, companyInfo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add company logo if exists
      if (companyInfo.logo) {
        const logoPath = path.join(__dirname, '../../uploads', companyInfo.logo);
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 45, { width: 100 });
        }
      }

      // Company Information
      doc.fontSize(20).text(companyInfo.name, 200, 50);
      doc.fontSize(10)
        .text(companyInfo.address, 200, 80)
        .text(`Phone: ${companyInfo.phone}`, 200, 95)
        .text(`Email: ${companyInfo.email}`, 200, 110)
        .text(`Tax ID: ${companyInfo.taxId}`, 200, 125);

      // Invoice Information
      doc.fontSize(20).text('INVOICE', 50, 200);
      doc.fontSize(10)
        .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 230)
        .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 245)
        .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 260)
        .text(`Status: ${invoice.status.toUpperCase()}`, 50, 275);

      // Client Information
      doc.fontSize(12).text('Bill To:', 350, 230);
      doc.fontSize(10)
        .text(invoice.client.name, 350, 250)
        .text(invoice.client.company || '', 350, 265)
        .text(invoice.client.address || '', 350, 280)
        .text(`Email: ${invoice.client.email}`, 350, 295)
        .text(`Phone: ${invoice.client.phone}`, 350, 310);

      // Items Table Header
      const tableTop = 350;
      doc.fontSize(10)
        .text('Item', 50, tableTop)
        .text('Description', 200, tableTop)
        .text('Quantity', 350, tableTop)
        .text('Unit Price', 400, tableTop)
        .text('Total', 500, tableTop);

      // Items Table Content
      let y = tableTop + 20;
      invoice.items.forEach((item, i) => {
        doc.text(item.product.name, 50, y)
          .text(item.product.description || '', 200, y)
          .text(item.quantity.toString(), 350, y)
          .text(`$${item.price.toFixed(2)}`, 400, y)
          .text(`$${item.total.toFixed(2)}`, 500, y);
        y += 20;
      });

      // Totals
      const totalsTop = y + 20;
      doc.fontSize(10)
        .text('Subtotal:', 400, totalsTop)
        .text(`$${invoice.subtotal.toFixed(2)}`, 500, totalsTop)
        .text('Tax:', 400, totalsTop + 20)
        .text(`$${invoice.tax.toFixed(2)}`, 500, totalsTop + 20)
        .text('Total:', 400, totalsTop + 40)
        .text(`$${invoice.total.toFixed(2)}`, 500, totalsTop + 40);

      // Notes
      if (invoice.notes) {
        doc.fontSize(10)
          .text('Notes:', 50, totalsTop + 80)
          .text(invoice.notes, 50, totalsTop + 100);
      }

      // Terms and Conditions
      if (invoice.contract?.terms) {
        doc.fontSize(10)
          .text('Terms and Conditions:', 50, totalsTop + 140)
          .text(invoice.contract.terms, 50, totalsTop + 160);
      }

      // Footer
      doc.fontSize(8)
        .text(
          'This is a computer-generated invoice. No signature is required.',
          50,
          700,
          { align: 'center', width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}; 