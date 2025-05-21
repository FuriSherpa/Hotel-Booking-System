import { BookingType, HotelType } from "../../../backend/src/shared/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatDate = (date: string | Date) => {
  try {
    if (!date) return "N/A";

    // If date is already a Date object, use it directly
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC", // Add timezone to ensure consistent date handling
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export const generateInvoice = (booking: BookingType, hotel: HotelType) => {
  const doc = new jsPDF();

  // Calculate values
  const numberOfNights = Math.ceil(
    Math.abs(
      new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()
    ) /
      (1000 * 60 * 60 * 24)
  );

  // Add header with background
  doc.setFillColor(51, 122, 183);
  doc.rect(0, 0, 210, 40, "F");

  // Add company logo/name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("StayEase", 20, 25);

  // Add invoice title
  doc.setFontSize(20);
  doc.text("INVOICE", 150, 25);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Add invoice metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const metadata = [
    `Invoice No: INV-${booking._id.slice(-6)}`,
    `Date: ${formatDate(booking.checkIn)}`,
    `Booking ID: ${booking._id}`,
    `Status: ${booking.status}`,
  ];
  doc.text(metadata, 20, 50);

  // Add company details (Left column)
  const companyDetails = [
    "StayEase Hotels",
    "123 Hotel Street",
    "Kathmandu, Nepal",
    "Phone: +977-1-4XXXXXX",
    "Email: info@stayease.com",
    "PAN: XXXXXXXXX",
  ];

  // Add customer details (Right column)
  const customerDetails = [
    "Bill To:",
    `${booking.firstName} ${booking.lastName}`,
    `Contact: ${booking.email}`,
    `Adults: ${booking.adultCount}`,
    `Children: ${booking.childCount}`,
  ];

  doc.setFontSize(10);
  doc.text(companyDetails, 20, 70);
  doc.text(customerDetails, 120, 70);

  // Add hotel details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Hotel Information", 20, 110);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    [
      `${hotel.name}`,
      `${hotel.address}, ${hotel.city}`,
      `Rating: ${hotel.starRating} Stars`,
    ],
    20,
    120
  );

  // Create table data
  const totalAmount = booking.totalCost;
  const baseAmount = totalAmount / (1 + 0.1 + 0.13); // Reverse calculate base amount
  const serviceCharge = baseAmount * 0.1; // 10% Service Charge
  const serviceTax = baseAmount * 0.13; // 13% Service Tax

  const tableData = [
    ["Description", "Nights", "Rate (Rs)", "Amount (Rs)"],
    [
      "Room Charges",
      numberOfNights.toString(),
      (baseAmount / numberOfNights).toFixed(2),
      baseAmount.toFixed(2),
    ],
    ["Service Charge (10%)", "", "", serviceCharge.toFixed(2)],
    ["Service Tax (13%)", "", "", serviceTax.toFixed(2)],
    ["Total Amount", "", "", totalAmount.toFixed(2)],
  ];

  // Add table
  let finalY = 140;
  autoTable(doc, {
    startY: finalY,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: "grid",
    headStyles: {
      fillColor: [51, 122, 183],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    didDrawPage: (data) => {
      if (data.cursor) {
        finalY = data.cursor.y;
      } else {
        finalY = 140; // fallback value if cursor is null
      }
    },
  });

  // Add stay details
  doc.setFontSize(10);
  doc.text(
    [
      `Check-in: ${formatDate(booking.checkIn)}`,
      `Check-out: ${formatDate(booking.checkOut)}`,
      `Duration: ${numberOfNights} night${numberOfNights > 1 ? "s" : ""}`,
    ],
    20,
    finalY + 20
  );

  // Update terms and conditions
  doc.setFontSize(8);
  doc.text(
    [
      "Terms & Conditions:",
      "1. This is a computer-generated invoice and does not require a signature.",
      "2. Payment is non-refundable unless cancelled according to our cancellation policy.",
      "3. Check-in time is 2:00 PM and check-out time is 12:00 PM.",
      "4. All prices include 10% Service Charge and 13% Service Tax.",
      "5. For any queries, please contact our customer support.",
    ],
    20,
    250
  );

  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Thank you for choosing StayEase Hotels!", 105, 285, {
    align: "center",
  });

  return doc;
};

export const downloadInvoice = (booking: BookingType, hotel: HotelType) => {
  const doc = generateInvoice(booking, hotel);
  doc.save(`StayEase-Invoice-${booking._id.slice(-6)}.pdf`);
};
