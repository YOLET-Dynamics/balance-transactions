import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { SalesInvoice } from "@/domain/repositories/sales.repository";

const styles = StyleSheet.create({
  page: {
    padding: 15,
    paddingBottom: 45,
    fontSize: 7,
    fontFamily: "Courier",
    backgroundColor: "#ffffff",
  },
  watermark: {
    position: "absolute",
    top: "45%",
    left: "20%",
    transform: "rotate(-45deg)",
    opacity: 0.08,
    fontSize: 60,
    fontFamily: "Courier-Bold",
    color: "#10b981",
    letterSpacing: 10,
  },
  header: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    width: 60,
    height: 30,
    objectFit: "contain",
  },
  invoiceTitle: {
    fontSize: 8,
    color: "#666666",
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  paidBadge: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Courier-Bold",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: "1 solid #e5e7eb",
  },
  metadataLeft: {
    flex: 1,
  },
  metadataRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  metaLabel: {
    fontSize: 6,
    color: "#9ca3af",
    marginBottom: 1,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 7,
    color: "#000000",
    marginBottom: 4,
  },
  fiscalReceiptBox: {
    backgroundColor: "#fef3c7",
    padding: 4,
    borderRadius: 2,
    marginBottom: 4,
    borderLeft: "2 solid #f59e0b",
  },
  fiscalReceiptLabel: {
    fontSize: 6,
    color: "#92400e",
    marginBottom: 1,
    fontFamily: "Courier-Bold",
  },
  fiscalReceiptValue: {
    fontSize: 8,
    fontFamily: "Courier-Bold",
    color: "#000000",
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 6,
    fontFamily: "Courier-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.8,
  },
  addressBlock: {
    fontSize: 7,
    lineHeight: 1.3,
    color: "#000000",
  },
  addressLine: {
    marginBottom: 1,
  },
  table: {
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "#f9fafb",
    borderBottom: "1 solid #e5e7eb",
  },
  tableHeaderText: {
    fontSize: 6,
    fontFamily: "Courier-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: "0.5 solid #f3f4f6",
  },
  tableCell: {
    fontSize: 7,
    color: "#000000",
  },
  col1: { width: "10%" },
  col2: { width: "45%" },
  col3: { width: "15%" },
  col4: { width: "15%" },
  col5: { width: "15%", textAlign: "right" },
  totalsSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1 solid #e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  totalLabel: {
    fontSize: 7,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 7,
    color: "#000000",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    paddingHorizontal: 6,
    borderTop: "2 solid #000000",
  },
  grandTotalLabel: {
    fontSize: 9,
    fontFamily: "Courier-Bold",
    color: "#000000",
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: "Courier-Bold",
    color: "#10b981",
  },
  disclaimer: {
    marginTop: 8,
    padding: 6,
    backgroundColor: "#fef3c7",
    borderLeft: "2 solid #f59e0b",
    borderRadius: 2,
  },
  disclaimerTitle: {
    fontSize: 6,
    fontFamily: "Courier-Bold",
    color: "#92400e",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 7,
    color: "#78350f",
    lineHeight: 1.3,
  },
  notesSection: {
    marginTop: 8,
    padding: 6,
    backgroundColor: "#f9fafb",
    borderLeft: "2 solid #d1d5db",
    borderRadius: 2,
  },
  notesTitle: {
    fontSize: 6,
    fontFamily: "Courier-Bold",
    color: "#6b7280",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 7,
    color: "#374151",
    lineHeight: 1.3,
  },
  footer: {
    position: "absolute",
    bottom: 12,
    left: 15,
    right: 15,
    paddingTop: 6,
    borderTop: "1 solid #e5e7eb",
  },
  footerBranding: {
    textAlign: "center",
    fontSize: 6,
    color: "#9ca3af",
    marginTop: 3,
  },
  footerBrandName: {
    fontSize: 6,
    fontFamily: "Courier-Bold",
    color: "#000000",
  },
});

interface SalesInvoicePaidPDFProps {
  invoice: SalesInvoice & { lines?: any[] };
  organization: {
    legalName: string;
    tradeName?: string | null;
    subcity?: string | null;
    cityRegion?: string | null;
    country?: string | null;
    tin?: string | null;
    vatNumber?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
  };
}

export const SalesInvoicePaidPDF: React.FC<SalesInvoicePaidPDFProps> = ({
  invoice,
  organization,
}) => {
  const isCashSale = invoice.invoiceType === "Cash";
  const documentTitle = isCashSale ? "Cash Sales Attachment" : "Invoice";
  const documentNumberLabel = isCashSale ? "CSA No" : "Invoice No";

  return (
    <Document>
      <Page size="A5" orientation="portrait" style={styles.page}>
        {/* PAID Watermark */}
        <Text style={styles.watermark}>PAID</Text>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.invoiceTitle}>{documentTitle}</Text>
            <View style={styles.paidBadge}>
              <Text>✓ PAID</Text>
            </View>
          </View>
          {organization.logoUrl && (
            <Image src={organization.logoUrl} style={styles.logo} />
          )}
        </View>

        {/* Metadata Section */}
        <View style={styles.metadata}>
          <View style={styles.metadataLeft}>
            <Text style={styles.metaLabel}>{documentNumberLabel}</Text>
            <Text style={styles.metaValue}>{invoice.number}</Text>

            <Text style={styles.metaLabel}>INVOICE DATE</Text>
            <Text style={styles.metaValue}>
              {invoice.invoiceDate
                ? new Date(invoice.invoiceDate).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "N/A"}
            </Text>

            <Text style={styles.metaLabel}>PAID DATE</Text>
            <Text style={styles.metaValue}>
              {invoice.paidDate
                ? new Date(invoice.paidDate).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "N/A"}
            </Text>

            {invoice.fiscalReceiptNumber && (
              <View style={styles.fiscalReceiptBox}>
                <Text style={styles.fiscalReceiptLabel}>FISCAL RECEIPT NO</Text>
                <Text style={styles.fiscalReceiptValue}>
                  {invoice.fiscalReceiptNumber}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.metadataRight}>
            <Text style={styles.metaLabel}>FROM</Text>
            <View style={styles.addressBlock}>
              <Text style={styles.addressLine}>{organization.legalName}</Text>
              {organization.tradeName && (
                <Text style={styles.addressLine}>{organization.tradeName}</Text>
              )}
              {(organization.subcity ||
                organization.cityRegion ||
                organization.country) && (
                <Text style={styles.addressLine}>
                  {[
                    organization.subcity,
                    organization.cityRegion,
                    organization.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              {organization.tin && (
                <Text style={styles.addressLine}>TIN: {organization.tin}</Text>
              )}
              {organization.vatNumber && (
                <Text style={styles.addressLine}>
                  VAT: {organization.vatNumber}
                </Text>
              )}
              {organization.phone && (
                <Text style={styles.addressLine}>
                  Tel: {organization.phone}
                </Text>
              )}
              {organization.email && (
                <Text style={styles.addressLine}>
                  Email: {organization.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* To Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TO</Text>
          <View style={styles.addressBlock}>
            {invoice.buyerLegalName ? (
              <>
                <Text style={styles.addressLine}>{invoice.buyerLegalName}</Text>
                {invoice.buyerTradeName && (
                  <Text style={styles.addressLine}>
                    {invoice.buyerTradeName}
                  </Text>
                )}
                {invoice.buyerPhone && (
                  <Text style={styles.addressLine}>{invoice.buyerPhone}</Text>
                )}
                {invoice.buyerTin && (
                  <Text style={styles.addressLine}>
                    TIN: {invoice.buyerTin}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.addressLine}>Select customer</Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.col5]}>Total</Text>
          </View>

          {invoice.lines?.map((line: any, idx: number) => (
            <View key={line.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, styles.col2]}>
                {line.description}
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {Number(line.quantity).toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, styles.col4]}>
                ETB {Number(line.unitPrice).toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, styles.col5]}>
                ETB {Number(line.lineTotal).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              ETB {Number(invoice.subtotal).toFixed(2)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT (15%)</Text>
            <Text style={styles.totalValue}>
              ETB {Number(invoice.vatAmount).toFixed(2)}
            </Text>
          </View>

          {invoice.withheldAmount && Number(invoice.withheldAmount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Withholding ({invoice.withheldPct}%)
              </Text>
              <Text style={styles.totalValue}>
                -ETB {Number(invoice.withheldAmount).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total PAID</Text>
            <Text style={styles.grandTotalValue}>
              ETB{" "}
              {Number(invoice.netPayable).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>IMPORTANT NOTICE</Text>
          <Text style={styles.disclaimerText}>
            This {isCashSale ? "Cash" : "Credit"} Sales Attachment is not valid
            without a valid Fiscal Receipt Attached.
            {invoice.fiscalReceiptNumber &&
              ` Fiscal Receipt Number: ${invoice.fiscalReceiptNumber}`}
          </Text>
        </View>

        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Note</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.footerBranding}>
            <Text>
              <Text style={styles.footerBrandName}>Balance</Text>
              <Text> by </Text>
              <Text style={styles.footerBrandName}>YOLET Labs</Text>
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
