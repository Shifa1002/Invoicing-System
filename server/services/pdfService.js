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
  }

  async generateInvoicePDF(invoice) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true,
        });

        // Create temp file path
        const fileName = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
        const filePath = path.join(this.tempDir, fileName);
        const writeStream = fs.createWriteStream(filePath);

        // Pipe PDF to file
        doc.pipe(writeStream);

        // Add fonts
        doc.registerFont('Regular', path.join(this.fontPath, 'Roboto-Regular.ttf'));
        doc.registerFont('Bold', path.join(this.fontPath, 'Roboto-Bold.ttf'));
        doc.registerFont('Light', path.join(this.fontPath, 'Roboto-Light.ttf'));

        // Header
        this.generateHeader(doc, invoice);

        // Client Information
        this.generateClientInfo(doc, invoice);

        // Invoice Details
        this.generateInvoiceDetails(doc, invoice);

        // Items Table
        this.generateItemsTable(doc, invoice);

        // Totals
        this.generateTotals(doc, invoice);

        // Payment Information
        if (invoice.isPaid) {
          this.generatePaymentInfo(doc, invoice);
        }

        // Notes and Terms
        if (invoice.notes || invoice.terms) {
          this.generateNotesAndTerms(doc, invoice);
        }

        // Footer
        this.generateFooter(doc, invoice);

        // Finalize PDF
        doc.end();

        writeStream.on('finish', () => {
          resolve(filePath);
        });

        writeStream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  generateHeader(doc, invoice) {
    // Logo
    if (fs.existsSync(this.logoPath)) {
      doc.image(this.logoPath, 50, 45, { width: 100 });
    }

    // Company Info
    doc
      .font('Bold')
      .fontSize(20)
      .text('INVOICE', 400, 50, { align: 'right' });

    doc
      .font('Regular')
      .fontSize(10)
      .text('Your Company Name', 400, 80, { align: 'right' })
      .text('123 Business Street', 400, 95, { align: 'right' })
      .text('City, State 12345', 400, 110, { align: 'right' })
      .text('Phone: (123) 456-7890', 400, 125, { align: 'right' })
      .text('Email: billing@yourcompany.com', 400, 140, { align: 'right' });

    // Invoice Number and Dates
    doc
      .font('Bold')
      .fontSize(12)
      .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 170, { align: 'right' })
      .font('Regular')
      .text(
        `Issue Date: ${format(new Date(invoice.issueDate), 'MMM dd, yyyy')}`,
        400,
        185,
        { align: 'right' }
      )
      .text(
        `Due Date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}`,
        400,
        200,
        { align: 'right' }
      );

    // Status
    const statusColors = {
      paid: '#4CAF50',
      pending: '#FFC107',
      draft: '#9E9E9E',
      overdue: '#F44336',
    };

    doc
      .font('Bold')
      .fontSize(12)
      .fillColor(statusColors[invoice.status] || '#000000')
      .text(invoice.status.toUpperCase(), 400, 215, { align: 'right' })
      .fillColor('#000000');

    // Line
    doc
      .moveTo(50, 250)
      .lineTo(545, 250)
      .stroke();
  }

  generateClientInfo(doc, invoice) {
    const client = invoice.contract.client;

    doc
      .font('Bold')
      .fontSize(12)
      .text('Bill To:', 50, 270);

    doc
      .font('Regular')
      .fontSize(10)
      .text(client.name, 50, 290)
      .text(client.company?.name || '', 50, 305)
      .text(client.address.street, 50, 320)
      .text(
        `${client.address.city}, ${client.address.state} ${client.address.zipCode}`,
        50,
        335
      )
      .text(client.address.country, 50, 350);

    if (client.email) {
      doc.text(`Email: ${client.email}`, 50, 365);
    }
    if (client.phone) {
      doc.text(`Phone: ${client.phone}`, 50, 380);
    }
  }

  generateInvoiceDetails(doc, invoice) {
    // Contract Information
    doc
      .font('Bold')
      .fontSize(12)
      .text('Contract Details:', 50, 420);

    doc
      .font('Regular')
      .fontSize(10)
      .text(`Contract: ${invoice.contract.title}`, 50, 440)
      .text(
        `Start Date: ${format(
          new Date(invoice.contract.startDate),
          'MMM dd, yyyy'
        )}`,
        50,
        455
      )
      .text(
        `End Date: ${format(
          new Date(invoice.contract.endDate),
          'MMM dd, yyyy'
        )}`,
        50,
        470
      );
  }

  generateItemsTable(doc, invoice) {
    // Table Header
    const tableTop = 500;
    const tableHeaders = [
      { text: 'Description', width: 200 },
      { text: 'Quantity', width: 80, align: 'right' },
      { text: 'Unit Price', width: 100, align: 'right' },
      { text: 'Discount', width: 80, align: 'right' },
      { text: 'Amount', width: 100, align: 'right' },
    ];

    let currentTop = tableTop;

    // Draw headers
    doc.font('Bold').fontSize(10);
    let currentLeft = 50;
    tableHeaders.forEach((header) => {
      doc.text(header.text, currentLeft, currentTop, {
        width: header.width,
        align: header.align || 'left',
      });
      currentLeft += header.width;
    });

    // Draw items
    doc.font('Regular').fontSize(10);
    currentTop += 20;

    invoice.items.forEach((item) => {
      if (currentTop > 700) {
        // Add new page if needed
        doc.addPage();
        currentTop = 50;
      }

      currentLeft = 50;
      const itemTotal =
        item.quantity * item.unitPrice * (1 - item.discount / 100);

      // Description
      doc.text(item.description, currentLeft, currentTop, {
        width: tableHeaders[0].width,
      });
      currentLeft += tableHeaders[0].width;

      // Quantity
      doc.text(item.quantity.toString(), currentLeft, currentTop, {
        width: tableHeaders[1].width,
        align: 'right',
      });
      currentLeft += tableHeaders[1].width;

      // Unit Price
      doc.text(`$${item.unitPrice.toFixed(2)}`, currentLeft, currentTop, {
        width: tableHeaders[2].width,
        align: 'right',
      });
      currentLeft += tableHeaders[2].width;

      // Discount
      doc.text(`${item.discount}%`, currentLeft, currentTop, {
        width: tableHeaders[3].width,
        align: 'right',
      });
      currentLeft += tableHeaders[3].width;

      // Amount
      doc.text(`$${itemTotal.toFixed(2)}`, currentLeft, currentTop, {
        width: tableHeaders[4].width,
        align: 'right',
      });

      // Item notes if any
      if (item.notes) {
        currentTop += 15;
        doc
          .font('Light')
          .fontSize(8)
          .text(item.notes, 50, currentTop, {
            width: tableHeaders[0].width,
          });
      }

      currentTop += 20;
    });

    // Draw table bottom line
    doc
      .moveTo(50, currentTop)
      .lineTo(545, currentTop)
      .stroke();
  }

  generateTotals(doc, invoice) {
    const totalsTop = 700;
    const rightAlign = 545;

    doc.font('Regular').fontSize(10);

    // Subtotal
    doc
      .text('Subtotal:', rightAlign - 150, totalsTop, { align: 'right' })
      .text(`$${invoice.subtotal.toFixed(2)}`, rightAlign, totalsTop, {
        align: 'right',
      });

    // Tax
    doc
      .text('Tax (10%):', rightAlign - 150, totalsTop + 20, { align: 'right' })
      .text(`$${invoice.tax.toFixed(2)}`, rightAlign, totalsTop + 20, {
        align: 'right',
      });

    // Total
    doc
      .font('Bold')
      .text('Total:', rightAlign - 150, totalsTop + 40, { align: 'right' })
      .text(`$${invoice.total.toFixed(2)}`, rightAlign, totalsTop + 40, {
        align: 'right',
      });
  }

  generatePaymentInfo(doc, invoice) {
    const paymentTop = 780;

    doc
      .font('Bold')
      .fontSize(12)
      .text('Payment Information:', 50, paymentTop);

    doc
      .font('Regular')
      .fontSize(10)
      .text(
        `Payment Date: ${format(
          new Date(invoice.paymentDate),
          'MMM dd, yyyy'
        )}`,
        50,
        paymentTop + 20
      )
      .text(
        `Payment Method: ${invoice.paymentMethod
          .replace('_', ' ')
          .toUpperCase()}`,
        50,
        paymentTop + 35
      )
      .text(`Reference: ${invoice.paymentReference}`, 50, paymentTop + 50);
  }

  generateNotesAndTerms(doc, invoice) {
    const notesTop = 850;
    const columnWidth = 230;

    if (invoice.notes) {
      doc
        .font('Bold')
        .fontSize(12)
        .text('Notes:', 50, notesTop);

      doc
        .font('Regular')
        .fontSize(10)
        .text(invoice.notes, 50, notesTop + 20, {
          width: columnWidth,
          align: 'justify',
        });
    }

    if (invoice.terms) {
      doc
        .font('Bold')
        .fontSize(12)
        .text('Terms & Conditions:', 50 + columnWidth + 20, notesTop);

      doc
        .font('Regular')
        .fontSize(10)
        .text(invoice.terms, 50 + columnWidth + 20, notesTop + 20, {
          width: columnWidth,
          align: 'justify',
        });
    }
  }

  generateFooter(doc, invoice) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      // Footer
      doc
        .font('Light')
        .fontSize(8)
        .text(
          'Thank you for your business!',
          50,
          doc.page.height - 50,
          { align: 'center', width: 500 }
        )
        .text(
          'This is a computer-generated document. No signature is required.',
          50,
          doc.page.height - 35,
          { align: 'center', width: 500 }
        )
        .text(
          `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm:ss')}`,
          50,
          doc.page.height - 20,
          { align: 'center', width: 500 }
        );

      // Page number
      doc
        .text(
          `Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 20,
          { align: 'right', width: 500 }
        );
    }
  }
}

export default new PDFService(); 