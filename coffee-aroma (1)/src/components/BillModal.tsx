import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2, Coffee, Sparkles, FileText, Loader2 } from 'lucide-react';
import { Bill } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BillModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BillModal: React.FC<BillModalProps> = ({ bill, isOpen, onClose }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    if (!bill) return;

    // Create an isolated printable iframe to guarantee 100% full receipt printing without modal clipping
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const formattedDate = bill.date.includes('-')
      ? new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : bill.date;

    const itemsHtml = bill.items
      .map(
        (it) => `
      <tr style="border-bottom: 1px dashed #ccc;">
        <td style="padding: 5px 0; text-align: left; vertical-align: top;">
          <div style="font-weight: bold; font-size: 11px;">${it.productName}</div>
          ${
            it.selectedAddOns && it.selectedAddOns.length > 0
              ? `<div style="font-size: 9px; color: #555;">+ ${it.selectedAddOns.map((a) => `${a.name} (₹${a.price})`).join(', ')}</div>`
              : ''
          }
        </td>
        <td style="padding: 5px 0; text-align: center; vertical-align: top; font-size: 11px; font-weight: bold;">${it.quantity}</td>
        <td style="padding: 5px 0; text-align: right; vertical-align: top; font-size: 11px; font-weight: bold;">₹${it.subtotal}</td>
      </tr>
    `
      )
      .join('');

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Coffee Aroma Receipt - ${bill.billNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace;
              width: 76mm;
              margin: 2mm auto;
              padding: 4mm 3mm;
              color: #000000;
              background: #ffffff;
              font-size: 11px;
              line-height: 1.35;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .dashed-line { border-bottom: 1.5px dashed #000; margin: 8px 0; }
            .double-line { border-bottom: 2px solid #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; margin: 4px 0; }
            th { border-bottom: 1.5px solid #000; padding: 4px 0; font-size: 10px; font-weight: 800; }
            .total-row { font-size: 13px; font-weight: 900; }
            .badge { display: inline-block; padding: 3px 8px; border: 1.5px solid #000; font-size: 10px; font-weight: 800; border-radius: 4px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="center">
            <div style="font-size: 19px; font-weight: 900; letter-spacing: 1.5px;">COFFEE AROMA</div>
            <div style="font-size: 9px; margin-top: 2px;">Pimple Saudagar, Rahatani, Pune 411027</div>
            <div style="font-size: 9px; font-weight: bold;">Ph: +91 7709054465</div>
          </div>
          
          <div class="dashed-line"></div>
          
          <table style="font-size: 10px;">
            <tr>
              <td><strong>INVOICE:</strong> ${bill.billNumber}</td>
              <td class="right">${formattedDate} • ${bill.time}</td>
            </tr>
            <tr>
              <td><strong>GUEST:</strong> ${bill.customerName || 'Walk-in Guest'}</td>
              <td class="right"><strong>TABLE:</strong> ${bill.tableNo || 'Counter'}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 2px;"><strong>BILLED BY:</strong> ${bill.createdBy || 'Staff'}</td>
            </tr>
          </table>

          <div class="dashed-line"></div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">ITEM</th>
                <th style="text-align: center; width: 30px;">QTY</th>
                <th style="text-align: right; width: 55px;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="dashed-line"></div>

          <table style="font-size: 11px;">
            <tr>
              <td>Subtotal:</td>
              <td class="right">₹${bill.subtotal}</td>
            </tr>
            ${
              bill.discount > 0
                ? `
            <tr style="font-weight: bold;">
              <td>Discount:</td>
              <td class="right">-₹${bill.discount}</td>
            </tr>`
                : ''
            }
            <tr class="total-row">
              <td style="padding-top: 6px; border-top: 1.5px solid #000;">GRAND TOTAL:</td>
              <td class="right" style="padding-top: 6px; border-top: 1.5px solid #000;">₹${bill.total}</td>
            </tr>
          </table>

          <div class="dashed-line"></div>

          <div class="center" style="margin: 8px 0;">
            <div class="badge">${bill.paymentMethod} • ${bill.status}</div>
          </div>

          <div class="center" style="font-size: 9px; margin-top: 6px; line-height: 1.4;">
            <div style="font-weight: bold;">THANK YOU FOR VISITING! ☕</div>
            <div style="color: #444;">GOOD COFFEE. GOOD FOOD. GOOD MOOD.</div>
          </div>
        </body>
      </html>
    `;

    const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (doc) {
      doc.open();
      doc.write(receiptHtml);
      doc.close();
      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (e) {
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 1500);
        }
      }, 350);
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (!bill || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const printableElement = document.getElementById('printable-bill');
      if (printableElement) {
        const canvas = await html2canvas(printableElement, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: '#FFF9F2',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 80;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [pdfWidth, Math.max(120, pdfHeight + 4)],
        });

        pdf.addImage(imgData, 'PNG', 0, 2, pdfWidth, pdfHeight);
        pdf.save(`CoffeeAroma_Bill_${bill.billNumber}.pdf`);
        return;
      }
    } catch (err) {
      console.error('Canvas capture failed, falling back to direct PDF layout:', err);
    }

    // Direct vector jsPDF generation fallback
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 150 + bill.items.length * 8],
      });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(10, 9, 8);
      pdf.text('COFFEE AROMA', 40, 10, { align: 'center' });

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Pimple Saudagar, Rahatani, Pune 411027', 40, 15, { align: 'center' });
      pdf.text('Ph: +91 7709054465', 40, 19, { align: 'center' });

      pdf.setLineWidth(0.3);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(5, 22, 75, 22);

      pdf.setFont('helvetica', 'bold');
      pdf.text(`TAX INVOICE: ${bill.billNumber}`, 5, 27);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${bill.date}  ${bill.time}`, 5, 31);
      pdf.text(`Customer: ${bill.customerName || 'Walk-in Guest'}`, 5, 35);
      pdf.text(`Table: ${bill.tableNo || 'Counter'}`, 5, 39);
      pdf.text(`Billed By: ${bill.createdBy || 'Staff'}`, 5, 43);

      pdf.line(5, 46, 75, 46);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Item', 5, 50);
      pdf.text('Qty', 55, 50, { align: 'center' });
      pdf.text('Amt', 75, 50, { align: 'right' });

      pdf.line(5, 52, 75, 52);

      let yPos = 57;
      pdf.setFont('helvetica', 'normal');
      for (const it of bill.items) {
        pdf.text(it.productName.substring(0, 24), 5, yPos);
        pdf.text(String(it.quantity), 55, yPos, { align: 'center' });
        pdf.text(`Rs.${it.subtotal}`, 75, yPos, { align: 'right' });
        yPos += 6;
      }

      pdf.line(5, yPos, 75, yPos);
      yPos += 5;

      pdf.text('Subtotal:', 5, yPos);
      pdf.text(`Rs.${bill.subtotal}`, 75, yPos, { align: 'right' });
      yPos += 5;

      if (bill.discount > 0) {
        pdf.text('Discount:', 5, yPos);
        pdf.text(`-Rs.${bill.discount}`, 75, yPos, { align: 'right' });
        yPos += 5;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Grand Total:', 5, yPos);
      pdf.text(`Rs.${bill.total}`, 75, yPos, { align: 'right' });
      yPos += 7;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Payment: ${bill.paymentMethod} (${bill.status})`, 40, yPos, { align: 'center' });
      yPos += 6;

      pdf.text('Thank you for visiting Coffee Aroma! ☕', 40, yPos, { align: 'center' });

      pdf.save(`CoffeeAroma_Bill_${bill.billNumber}.pdf`);
    } catch (fallbackErr) {
      console.error('Direct PDF export error:', fallbackErr);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#160E0A] border border-[#3B2417] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-5 bg-[#0A0908] border-b border-[#3B2417] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-display font-bold text-lg text-[#FFF9F2] uppercase tracking-wider">
              ORDER CONFIRMED & INVOICE
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#21150F] hover:bg-[#B97845] text-[#FFF9F2] flex items-center justify-center transition-colors border border-[#3B2417]"
            aria-label="Close bill"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Printable Bill Receipt Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#0A0908]">
          <div
            id="printable-bill"
            className="bg-[#FFF9F2] text-[#0A0908] p-6 sm:p-8 rounded-2xl shadow-xl font-mono text-xs max-w-sm mx-auto border border-[#E8DAC8] space-y-4"
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-[#0A0908]/40">
              <div className="w-8 h-8 rounded-full bg-[#0A0908] text-[#FFF9F2] flex items-center justify-center mx-auto mb-1">
                <Coffee className="w-4 h-4" />
              </div>
              <h2 className="font-display text-xl font-extrabold uppercase tracking-widest text-[#0A0908]">
                COFFEE AROMA
              </h2>
              <p className="text-[10px] text-zinc-600">
                Pimple Saudagar, Rahatani, Pune
              </p>
              <p className="text-[10px] font-bold text-zinc-800">
                +91 7709054465
              </p>
            </div>

            {/* Bill Meta */}
            <div className="grid grid-cols-2 gap-2 text-[10px] border-b-2 border-dashed border-[#0A0908]/40 pb-3">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">TAX INVOICE / BILL NO</span>
                <span className="font-bold text-zinc-900 text-xs">{bill.billNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">DATE & TIME (IST)</span>
                <span className="font-bold text-zinc-900">
                  {bill.date.includes('-')
                    ? new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : bill.date}{' '}
                  • {bill.time}
                </span>
              </div>
              <div className="pt-1">
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">CUSTOMER</span>
                <span className="font-bold text-zinc-900 truncate block">{bill.customerName || 'Walk-in Guest'}</span>
                {bill.customerPhone && <span className="text-[9px] text-zinc-600 block">{bill.customerPhone}</span>}
              </div>
              <div className="text-right pt-1">
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">TABLE / DINE-IN</span>
                <span className="font-bold text-zinc-900">{bill.tableNo || 'Counter'}</span>
              </div>
              <div className="col-span-2 pt-1 flex items-center justify-between bg-zinc-100/80 px-2 py-1 rounded">
                <span className="text-zinc-500 text-[9px] uppercase tracking-wider font-semibold">BILLED BY / STAFF</span>
                <span className="font-bold text-zinc-900 text-[10px]">👤 {bill.createdBy || 'Staff'}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2 border-b-2 border-dashed border-[#0A0908]/40 pb-3">
              <div className="flex justify-between font-bold text-[10px] text-zinc-700">
                <span>ITEM</span>
                <div className="flex gap-4">
                  <span>QTY</span>
                  <span>AMT</span>
                </div>
              </div>

              {bill.items.map((it, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="truncate pr-2">{it.productName}</span>
                    <div className="flex gap-4 flex-shrink-0">
                      <span className="w-5 text-center">{it.quantity}</span>
                      <span className="w-12 text-right font-bold">₹{it.subtotal}</span>
                    </div>
                  </div>
                  {it.selectedAddOns && it.selectedAddOns.length > 0 && (
                    <div className="text-[9px] text-zinc-500 pl-2">
                      + {it.selectedAddOns.map(a => `${a.name} (₹${a.price})`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-xs border-b-2 border-dashed border-[#0A0908]/40 pb-3">
              <div className="flex justify-between text-zinc-600">
                <span>SUBTOTAL</span>
                <span>₹{bill.subtotal}</span>
              </div>

              {bill.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>PROMO DISCOUNT</span>
                  <span>-₹{bill.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold text-zinc-950 pt-1 border-t border-zinc-300">
                <span>GRAND TOTAL</span>
                <span>₹{bill.total}</span>
              </div>
            </div>

            {/* Payment Method & Order State */}
            <div className={`p-2.5 rounded-lg text-center space-y-1 ${
              bill.status === 'ACCEPTED'
                ? 'bg-emerald-50 border border-emerald-300'
                : bill.status === 'CANCELLED'
                ? 'bg-rose-50 border border-rose-300'
                : bill.status === 'PAID'
                ? 'bg-sky-50 border border-sky-300'
                : 'bg-amber-50 border border-amber-300'
            }`}>
              <span className="text-[9px] text-zinc-500 block uppercase font-semibold">
                PAYMENT & ORDER STATUS
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold text-xs text-zinc-900">
                  {bill.paymentMethod === 'PAY_AT_COUNTER' ? 'PAY AT COUNTER' : bill.paymentMethod}
                </span>
                <span>•</span>
                <span className={`font-mono font-black text-xs uppercase px-2 py-0.5 rounded ${
                  bill.status === 'ACCEPTED'
                    ? 'bg-emerald-600 text-white'
                    : bill.status === 'CANCELLED'
                    ? 'bg-rose-600 text-white'
                    : bill.status === 'PAID'
                    ? 'bg-sky-600 text-white'
                    : 'bg-amber-500 text-black'
                }`}>
                  {bill.status === 'ACCEPTED'
                    ? 'ACCEPTED & PREPARING'
                    : bill.status === 'CANCELLED'
                    ? 'REJECTED / CANCELLED'
                    : bill.status === 'PAID'
                    ? 'PAID & COMPLETED'
                    : 'PENDING ACCEPTANCE'}
                </span>
              </div>
            </div>

            {/* Footer Message */}
            <div className="text-center pt-2 space-y-1">
              <p className="font-bold text-xs">THANK YOU ☕</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                GOOD COFFEE. GOOD FOOD. GOOD MOOD.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#0A0908] border-t border-[#3B2417] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 py-3 rounded-full bg-[#21150F] border border-[#3B2417] hover:border-[#B97845] text-[#FFF9F2] hover:bg-[#3B2417] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            title="Download Tax Invoice in PDF format"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 text-[#C9945C] animate-spin" />
                <span>GENERATING PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-[#C9945C]" />
                <span>DOWNLOAD PDF INVOICE</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#B97845] to-[#C9945C] text-[#0A0908] text-xs font-mono font-extrabold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#B97845]/30"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT RECEIPT</span>
          </button>
        </div>

      </div>
    </div>
  );
};
