import React from 'react';
import { FaPrint } from 'react-icons/fa';
import jsPDF from 'jspdf';

const PrintInvoice = ({ order }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = async () => {
    if (!order) {
      alert('No order data available');
      return;
    }

    try {
      console.log('Starting PDF generation...');
      console.log('Order data:', order);
      console.log('Products array:', order.products);

      // Create PDF with error handling
      let doc;
      try {
        doc = new jsPDF();
        console.log('PDF document created successfully');
      } catch (pdfError) {
        console.error('Error creating PDF document:', pdfError);
        alert('Error creating PDF document. Please try again.');
        return;
      }
      
      // Set font
      doc.setFont('helvetica');
      
      // Title
      doc.setFontSize(20);
      doc.text('E-Commerce Store', 105, 20, { align: 'center' });
      
      // Order Info
      doc.setFontSize(12);
      doc.text(`Order ID: ${order._id}`, 20, 40);
      doc.text(`Date: ${formatDate(order.createdAt)}`, 20, 50);
      doc.text(`Sold By: E-Commerce Store`, 20, 60);
      doc.text(`Customer: ${order.billingAddress?.fullName || 'N/A'}`, 120, 40);
      
      // Billing Address
      doc.setFontSize(12);
      doc.text('Billing Address:', 20, 80);
      doc.setFontSize(10);
      doc.text(order.billingAddress?.fullName || 'N/A', 20, 90);
      doc.text(order.billingAddress?.street || 'N/A', 20, 100);
      doc.text(`${order.billingAddress?.city || 'N/A'}, ${order.billingAddress?.state || 'N/A'} ${order.billingAddress?.zipCode || 'N/A'}`, 20, 110);
      doc.text(order.billingAddress?.country || 'N/A', 20, 120);
      
      // Shipping Address
      doc.setFontSize(12);
      doc.text('Shipping Address:', 120, 80);
      doc.setFontSize(10);
      doc.text(order.shippingAddress?.fullName || 'N/A', 120, 90);
      doc.text(order.shippingAddress?.street || 'N/A', 120, 100);
      doc.text(`${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'} ${order.shippingAddress?.zipCode || 'N/A'}`, 120, 110);
      doc.text(order.shippingAddress?.country || 'N/A', 120, 120);
      
      console.log('Addresses added to PDF');
      
      // Products Table - Professional formatting
      let startY = 140;
      
      if (order.products && order.products.length > 0) {
        console.log('Processing products for table...');
        
        // Table header with proper spacing
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Product', 20, startY);
        doc.text('Qty', 130, startY);
        doc.text('Unit Price', 150, startY);
        doc.text('Total', 180, startY);
        
        // Draw header line
        doc.line(20, startY + 2, 200, startY + 2);
        startY += 15;
        
        // Process each product with proper spacing
        order.products.forEach((item, index) => {
          console.log(`Product ${index + 1}:`, item);
          console.log('ProductId object:', item.productId);
          
          let productName = 'Product Name Unavailable';
          if (item.productId) {
            // Log all properties of productId to see the structure
            console.log('ProductId properties:', Object.keys(item.productId));
            console.log('ProductId values:', Object.values(item.productId));
            
            // Try different possible property names
            if (item.productId.name) {
              productName = item.productId.name;
            } else if (item.productId.title) {
              productName = item.productId.title;
            } else if (item.productId.productName) {
              productName = item.productId.productName;
            } else if (typeof item.productId === 'string') {
              productName = item.productId;
            }
          } else if (item.product && item.product.name) {
            productName = item.product.name;
          } else if (item.name) {
            productName = item.name;
          }
          
          const quantity = item.quantity || 0;
          const price = item.price || 0;
          const total = price * quantity;
          
          // Add product row with proper spacing
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          // Product name (with text wrapping if needed)
          const maxWidth = 100; // Width for product name column
          const productLines = doc.splitTextToSize(productName, maxWidth);
          doc.text(productLines, 20, startY);
          
          // Quantity (centered)
          doc.text(quantity.toString(), 130, startY);
          
          // Unit Price (right aligned with Rs symbol)
          doc.text(`Rs ${price.toFixed(2)}`, 150, startY);
          
          // Total (right aligned with Rs symbol)
          doc.text(`Rs ${total.toFixed(2)}`, 180, startY);
          
          console.log(`Added to table: ${productName}, Qty: ${quantity}, Price: Rs ${price}, Total: Rs ${total}`);
          
          // Move to next line with proper spacing
          const lineHeight = Math.max(12, productLines.length * 5);
          startY += lineHeight;
          
          // Add space between products
          if (index < order.products.length - 1) {
            startY += 5;
          }
        });
        
        // Draw bottom line
        doc.line(20, startY, 200, startY);
        startY += 20;
        
        console.log('Manual table created successfully');
      } else {
        console.log('No products array found');
        doc.text('No products found', 20, startY);
        startY += 20;
      }
      
      // Check if we have enough space for totals
      const pageHeight = 297; // A4 height in mm
      const currentY = startY;
      const spaceNeeded = 80; // Space needed for totals and footer
      
      if (currentY + spaceNeeded > pageHeight - 5) {
        // Add new page if not enough space
        doc.addPage();
        startY = 20;
      }
      
      // Totals with proper positioning and Rs symbols
      doc.setFontSize(12);
      doc.text(`Subtotal: Rs ${order.subtotal?.toFixed(2) || '0.00'}`, 150, startY);
      doc.text(`Shipping: Rs ${order.shippingCost?.toFixed(2) || '0.00'}`, 150, startY + 12);
      doc.text(`Tax: Rs ${order.tax?.toFixed(2) || '0.00'}`, 150, startY + 24);
      
      // Total Amount with Rs symbol and proper positioning
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const totalAmount = order.totalAmount?.toFixed(2) || '0.00';
      doc.text(`Total Amount: Rs ${totalAmount}`, 145, startY + 40);
      
      // Payment Method
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Payment Method: ${order.paymentMethod || 'N/A'}`, 20, startY + 55);
      
      // Footer with proper spacing
      doc.setFontSize(10);
      doc.text('Thank you for your purchase!', 105, startY + 75, { align: 'center' });
      
      console.log('PDF content completed, attempting to save...');
      
      // Download PDF with multiple methods
      const fileName = `Invoice_Order_${order._id.slice(-8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF as:', fileName);
      
      // Method 1: Direct save
      try {
        doc.save(fileName);
        console.log('PDF save method called successfully');
        
        // // Show success message
        // setTimeout(() => {
        //   alert('PDF downloaded successfully! Check your Downloads folder.');
        // }, 1000);
        
      } catch (saveError) {
        console.error('Direct save failed:', saveError);
        
        // Method 2: Blob download
        try {
          console.log('Trying blob download method...');
          const pdfBlob = doc.output('blob');
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          console.log('Blob download method successful');
          setTimeout(() => {
            alert('PDF downloaded successfully using alternative method!');
          }, 1000);
          
        } catch (blobError) {
          console.error('Blob download also failed:', blobError);
          
          // Method 3: Data URL
          try {
            console.log('Trying data URL method...');
            const dataUrl = doc.output('dataurlstring');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Data URL method successful');
            setTimeout(() => {
              alert('PDF downloaded successfully using data URL method!');
            }, 1000);
            
          } catch (dataUrlError) {
            console.error('All download methods failed:', dataUrlError);
            alert('All download methods failed. Please check your browser settings and try again.');
          }
        }
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}`);
      
      // Fallback: Try alternative method
      try {
        console.log('Trying fallback method...');
        const doc = new jsPDF();
        doc.text('Invoice Generation Failed', 20, 20);
        doc.text('Please try again or contact support.', 20, 30);
        doc.save('invoice_error.pdf');
        alert('Fallback PDF created. Please try the main download again.');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('PDF generation failed completely. Please check your browser console for errors.');
      }
    }
  };

  if (!order) {
    return null;
  }

  return (
    <button className="btn btn-outline-primary" onClick={handlePrint}>
      <FaPrint className="me-1" />
      Download Invoice
    </button>
  );
};

export default PrintInvoice;