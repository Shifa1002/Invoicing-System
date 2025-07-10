import nodemailer from 'nodemailer';
import { format } from 'date-fns';

class EmailService {
  constructor() {
   this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendInvoiceEmail(invoice, client, pdfBuffer = null) {
    try {
      const mailOptions = {
        from: `"Invoice System" <${process.env.SMTP_USER}>`,
        to: client.email,
        subject: `Invoice #${invoice.invoiceNumber} - ${client.name}`,
        html: this.generateInvoiceEmailHTML(invoice, client),
        attachments: pdfBuffer ? [
          {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          }
        ] : [],
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Invoice email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw error;
    }
  }

  async sendContractEmail(contract, client, pdfBuffer = null) {
    try {
      const mailOptions = {
        from: `"Invoice System" <${process.env.SMTP_USER}>`,
        to: client.email,
        subject: `Contract: ${contract.title} - ${client.name}`,
        html: this.generateContractEmailHTML(contract, client),
        attachments: pdfBuffer ? [
          {
            filename: `contract-${contract._id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          }
        ] : [],
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Contract email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending contract email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"Invoice System" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Welcome to Invoice System',
        html: this.generateWelcomeEmailHTML(user),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  generateInvoiceEmailHTML(invoice, client) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice #${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
            .amount { font-size: 24px; font-weight: bold; color: #1976d2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice #${invoice.invoiceNumber}</h1>
            </div>
            <div class="content">
              <p>Dear ${client.name},</p>
              <p>Please find attached your invoice for the amount of <span class="amount">$${invoice.totalAmount?.toFixed(2) || '0.00'}</span>.</p>
              <p><strong>Invoice Details:</strong></p>
              <ul>
                <li>Invoice Number: ${invoice.invoiceNumber}</li>
                <li>Issue Date: ${format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</li>
                <li>Due Date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</li>
                <li>Status: ${invoice.status}</li>
              </ul>
              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>Thank you for your business!</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Invoice System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  generateContractEmailHTML(contract, client) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Contract: ${contract.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
            .amount { font-size: 24px; font-weight: bold; color: #1976d2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Contract: ${contract.title}</h1>
            </div>
            <div class="content">
              <p>Dear ${client.name},</p>
              <p>Please find attached your contract for the amount of <span class="amount">$${contract.totalAmount?.toFixed(2) || '0.00'}</span>.</p>
              <p><strong>Contract Details:</strong></p>
              <ul>
                <li>Title: ${contract.title}</li>
                <li>Start Date: ${format(new Date(contract.startDate), 'MMM dd, yyyy')}</li>
                <li>End Date: ${format(new Date(contract.endDate), 'MMM dd, yyyy')}</li>
                <li>Status: ${contract.status}</li>
              </ul>
              <p>Please review the contract and let us know if you have any questions.</p>
              <p>Thank you for choosing our services!</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Invoice System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  generateWelcomeEmailHTML(user) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Invoice System</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Invoice System!</h1>
            </div>
            <div class="content">
              <p>Dear ${user.name},</p>
              <p>Welcome to Invoice System! Your account has been successfully created.</p>
              <p>You can now:</p>
              <ul>
                <li>Create and manage clients</li>
                <li>Add products and services</li>
                <li>Generate contracts and invoices</li>
                <li>Track payments and revenue</li>
                <li>Export data in PDF and CSV formats</li>
              </ul>
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              <p>Best regards,<br>The Invoice System Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Invoice System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default new EmailService(); 