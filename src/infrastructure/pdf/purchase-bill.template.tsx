import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { PurchaseBill } from "@/domain/repositories/purchases.repository";

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 8,
    fontFamily: "Courier",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 12,
  },
  logo: {
    fontSize: 20,
    fontFamily: "Courier-Bold",
    color: "#000000",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  billTitle: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 10,
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
    fontSize: 7,
    color: "#9ca3af",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 9,
    color: "#000000",
    marginBottom: 5,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: "Courier-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 5,
    letterSpacing: 0.8,
  },
  addressBlock: {
    fontSize: 8,
    lineHeight: 1.3,
    color: "#000000",
  },
  addressLine: {
    marginBottom: 2,
  },
  partyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  partySection: {
    flex: 1,
    marginRight: 10,
  },
  partySectionRight: {
    flex: 1,
    marginLeft: 10,
  },
  table: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: "#f9fafb",
    borderBottom: "1.5 solid #e5e7eb",
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: "Courier-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: "0.5 solid #f3f4f6",
  },
  tableCell: {
    fontSize: 8,
    color: "#000000",
  },
  col1: { width: "10%" },
  col2: { width: "45%" },
  col3: { width: "15%" },
  col4: { width: "15%" },
  col5: { width: "15%" },
  summary: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1 solid #e5e7eb",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  summaryLabel: {
    width: "30%",
    fontSize: 8,
    color: "#6b7280",
    textAlign: "right",
    marginRight: 12,
  },
  summaryValue: {
    width: "15%",
    fontSize: 8,
    color: "#000000",
    textAlign: "right",
  },
  totalRow: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 3,
    backgroundColor: "#f9fafb",
  },
  totalLabel: {
    fontSize: 9,
    fontFamily: "Courier-Bold",
    color: "#000000",
  },
  totalValue: {
    fontSize: 10,
    fontFamily: "Courier-Bold",
    color: "#000000",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 25,
    right: 25,
    paddingTop: 8,
    borderTop: "1 solid #e5e7eb",
    textAlign: "center",
  },
});

interface PurchaseBillPDFProps {
  bill: PurchaseBill;
  organization: {
    id: string;
    legalName: string;
    tradeName?: string | null;
    subcity?: string | null;
    cityRegion?: string | null;
    country?: string;
    tin?: string | null;
    vatNumber?: string | null;
    phone?: string | null;
    email?: string | null;
  };
}

export const PurchaseBillPDF: React.FC<PurchaseBillPDFProps> = ({
  bill,
  organization,
}) => {
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `ETB ${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-ET", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            {organization.tradeName || organization.legalName}
          </Text>
          <Text style={styles.billTitle}>Purchase Bill</Text>
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataLeft}>
            <Text style={styles.metaLabel}>BILL NUMBER</Text>
            <Text style={styles.metaValue}>{bill.number}</Text>
            <Text style={styles.metaLabel}>DATE</Text>
            <Text style={styles.metaValue}>{formatDate(bill.createdAt)}</Text>
            <Text style={styles.metaLabel}>STATUS</Text>
            <Text style={styles.metaValue}>{bill.status}</Text>
          </View>
          <View style={styles.metadataRight}>
            <Text style={styles.metaLabel}>PAYMENT METHOD</Text>
            <Text style={styles.metaValue}>{bill.paymentMethod}</Text>
            {bill.paymentRef && (
              <>
                <Text style={styles.metaLabel}>PAYMENT REFERENCE</Text>
                <Text style={styles.metaValue}>{bill.paymentRef}</Text>
              </>
            )}
          </View>
        </View>

        {/* Vendor and Company Info (Side by Side) */}
        <View style={styles.partyContainer}>
          {/* Vendor Info (FROM) */}
          <View style={styles.partySection}>
            <Text style={styles.sectionTitle}>FROM (Vendor)</Text>
            <View style={styles.addressBlock}>
              {bill.vendorLegalName && (
                <Text style={styles.addressLine}>
                  {bill.vendorLegalName}
                  {bill.vendorTradeName &&
                    bill.vendorTradeName !== bill.vendorLegalName &&
                    ` (${bill.vendorTradeName})`}
                </Text>
              )}
              {(bill.vendorSubcity ||
                bill.vendorCityRegion ||
                bill.vendorCountry) && (
                <Text style={styles.addressLine}>
                  {[bill.vendorSubcity, bill.vendorCityRegion, bill.vendorCountry]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              {bill.vendorTin && (
                <Text style={styles.addressLine}>TIN: {bill.vendorTin}</Text>
              )}
              {bill.vendorVatNumber && (
                <Text style={styles.addressLine}>
                  VAT: {bill.vendorVatNumber}
                </Text>
              )}
              {bill.vendorPhone && (
                <Text style={styles.addressLine}>Phone: {bill.vendorPhone}</Text>
              )}
            </View>
          </View>

          {/* Company Info (TO) */}
          <View style={styles.partySectionRight}>
            <Text style={styles.sectionTitle}>TO (Company)</Text>
            <View style={styles.addressBlock}>
              {organization.legalName && (
                <Text style={styles.addressLine}>
                  {organization.legalName}
                  {organization.tradeName &&
                    organization.tradeName !== organization.legalName &&
                    ` (${organization.tradeName})`}
                </Text>
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
                  Phone: {organization.phone}
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

        {/* Reason */}
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.sectionTitle}>REASON</Text>
          <View style={styles.addressBlock}>
            <Text>{bill.reason}</Text>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>
              DESCRIPTION
            </Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>QUANTITY</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>
              UNIT PRICE
            </Text>
            <Text style={[styles.tableHeaderText, styles.col5]}>TOTAL</Text>
          </View>
          {bill.lines?.map((line, index) => (
            <View key={line.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.col2]}>
                {line.description}
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {line.quantity} {line.unit}
              </Text>
              <Text style={[styles.tableCell, styles.col4]}>
                {formatCurrency(line.unitPrice)}
              </Text>
              <Text style={[styles.tableCell, styles.col5]}>
                {formatCurrency(line.lineTotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(bill.subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (15%):</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(bill.vatAmount)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(bill.total)}</Text>
          </View>
          {bill.withheldAmount && Number(bill.withheldAmount) > 0 && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Withholding Tax ({bill.withheldPct}%):
                </Text>
                <Text style={styles.summaryValue}>
                  -{formatCurrency(bill.withheldAmount)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Net Paid:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(bill.netPaid)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Payment Details */}
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
          <View style={styles.addressBlock}>
            {bill.paymentMethod && (
              <Text style={styles.addressLine}>
                Method: {bill.paymentMethod}
              </Text>
            )}
            {bill.paymentRef && (
              <Text style={styles.addressLine}>
                Reference: {bill.paymentRef}
              </Text>
            )}
          </View>
        </View>

        {/* Personnel Info */}
        {(bill.createdBy || bill.reviewedBy || bill.authorizedBy) && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>PERSONNEL</Text>
            <View style={styles.addressBlock}>
              {bill.createdBy && (
                <Text style={styles.addressLine}>
                  Created By: {bill.createdBy}
                </Text>
              )}
              {bill.reviewedBy && (
                <Text style={styles.addressLine}>
                  Reviewed By: {bill.reviewedBy}
                </Text>
              )}
              {bill.authorizedBy && (
                <Text style={styles.addressLine}>
                  Authorized By: {bill.authorizedBy}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Footer with Branding */}
        <View style={styles.footer}>
          <View style={styles.addressBlock}>
            <Text>
              <Text style={{ fontFamily: "Courier-Bold" }}>Balance</Text>
              <Text> by </Text>
              <Text style={{ fontFamily: "Courier-Bold" }}>YOLET Labs</Text>
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
