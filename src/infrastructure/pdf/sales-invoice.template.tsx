import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { SalesInvoice } from "@/domain/repositories/sales.repository";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Courier",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontFamily: "Courier-Bold",
    color: "#000000",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  invoiceTitle: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 15,
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
    fontSize: 8,
    color: "#9ca3af",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 10,
    color: "#000000",
    marginBottom: 8,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Courier-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  addressBlock: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#000000",
  },
  addressLine: {
    marginBottom: 3,
  },
  table: {
    marginBottom: 18,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f9fafb",
    borderBottom: "1.5 solid #e5e7eb",
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Courier-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottom: "0.5 solid #f3f4f6",
  },
  tableCell: {
    fontSize: 9,
    color: "#000000",
  },
  col1: { width: "10%" },
  col2: { width: "45%" },
  col3: { width: "15%" },
  col4: { width: "15%" },
  col5: { width: "15%", textAlign: "right" },
  totalsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTop: "1 solid #e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 9,
    color: "#000000",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    paddingHorizontal: 10,
    borderTop: "2 solid #000000",
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Courier-Bold",
    color: "#000000",
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: "Courier-Bold",
    color: "#000000",
  },
  notesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: "Courier-Bold",
    color: "#9ca3af",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  notesText: {
    fontSize: 9,
    color: "#000000",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    paddingTop: 12,
    borderTop: "1 solid #e5e7eb",
  },
  footerBranding: {
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 8,
  },
  footerBrandName: {
    fontSize: 8,
    fontFamily: "Courier-Bold",
    color: "#000000",
  },
  paymentDetails: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  paymentTitle: {
    fontSize: 8,
    fontFamily: "Courier-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  paymentInfo: {
    fontSize: 9,
    color: "#000000",
    lineHeight: 1.4,
  },
});

interface SalesInvoicePDFProps {
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
  };
}

export const SalesInvoicePDF: React.FC<SalesInvoicePDFProps> = ({
  invoice,
  organization,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.invoiceTitle}>Cash Sales Attachment</Text>
      </View>

      {/* Metadata Section */}
      <View style={styles.metadata}>
        <View style={styles.metadataLeft}>
          <Text style={styles.metaLabel}>CSA No</Text>
          <Text style={styles.metaValue}>{invoice.number}</Text>

          <Text style={styles.metaLabel}>ISSUE DATE</Text>
          <Text style={styles.metaValue}>
            {invoice.createdAt
              ? new Date(invoice.createdAt).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })
              : "N/A"}
          </Text>

          <Text style={styles.metaLabel}>DUE DATE</Text>
          <Text style={styles.metaValue}>
            {invoice.createdAt
              ? new Date(invoice.createdAt).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })
              : "N/A"}
          </Text>
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
              <Text style={styles.addressLine}>Tel: {organization.phone}</Text>
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
                <Text style={styles.addressLine}>{invoice.buyerTradeName}</Text>
              )}
              {invoice.buyerPhone && (
                <Text style={styles.addressLine}>{invoice.buyerPhone}</Text>
              )}
              {invoice.buyerTin && (
                <Text style={styles.addressLine}>TIN: {invoice.buyerTin}</Text>
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
          <Text style={[styles.tableHeaderText, styles.col3]}>Quantity</Text>
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
            ETB {Number(invoice.subtotal).toLocaleString()}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>VAT (15%)</Text>
          <Text style={styles.totalValue}>
            ETB {Number(invoice.vatAmount).toLocaleString()}
          </Text>
        </View>

        {invoice.withheldAmount && Number(invoice.withheldAmount) > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Withholding ({invoice.withheldPct}%)
            </Text>
            <Text style={styles.totalValue}>
              -ETB {Number(invoice.withheldAmount).toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>
            ETB{" "}
            {Number(invoice.netPayable).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      {/* Payment Details */}
      {(organization.tin || invoice.paymentMethod) && (
        <View style={styles.paymentDetails}>
          <Text style={styles.paymentTitle}>Payment Details</Text>
          <View style={styles.paymentInfo}>
            {invoice.paymentMethod && (
              <Text style={styles.addressLine}>
                Method: {invoice.paymentMethod}
              </Text>
            )}
            {invoice.paymentRef && (
              <Text style={styles.addressLine}>
                Reference: {invoice.paymentRef}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Notes */}
      {invoice.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Note</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      )}

      {/* Footer with Branding */}
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
