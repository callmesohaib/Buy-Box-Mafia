import { motion } from "framer-motion"
import { FileText, Download } from "lucide-react"
import { fadeInUp, fadeInLeft, fadeInRight } from "../../animations/animation"
import jsPDF from "jspdf";
import { useAuth } from "../../store/AuthContext";

// Exportable PDF generator
export function generateContractPDF(contractData, formData) {
  // const { user } = useAuth();
  // console.log(user)

  console.log("FormData", formData)
  console.log("ContractData", contractData)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginLeft = 40;
  const marginTop = 40;
  const lineHeight = 16;
  const maxWidth = 515;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const drawBorder = () => {
    doc.setDrawColor(150);
    doc.setLineWidth(1.2);
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40, 'S');
  };
  doc.setFont('Times', 'bold');
  doc.setFontSize(16);
  const title = 'PURCHASE AND SALES AGREEMENT';
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;
  let y = marginTop + 10;
  drawBorder();
  doc.text(title, titleX, y);
  doc.setFont('Times', 'normal');
  doc.setFontSize(11);
  y += 30;
  const contractSections = [
    { heading: 'DATED:', content: currentDate },
    { heading: 'PARTIES:', content: `${contractData.sellerName || "______"}, as the Seller, ${contractData.scoutName || "______"}, and or assigns, as the buyer (collectively referred to herein as the "Parties"). Buyer and Seller which terms may be singular or plural and will include the heirs, successors, personal representatives and assigns, hereby agree that the Seller shall sell and Buyer shall buy the following legally described Property.` },
    { heading: 'THE PROPERTY DESCRIBED AS:', content: `${contractData.propertyAddress || "______"} (Street address)\nCity of ${contractData.propertyCity || "______"} State of ${contractData.propertyState || "______"} Country of ${contractData.propertyCountry || "______"}\nAssessor's Parcel Number: ${formData.apn || "______"}` },
    { heading: 'FINANCING/TERMS/PURCHASE PRICE:', content: `The Purchase Price Offered is: $${contractData.propertyPrice || "______"}.00.\n\nDeposit(s) to be held in escrow by ${contractData.escrowHolder || "______"}. Deposit to be placed into escrow prior to the closing of escrow in the amount of: $${contractData.earnestMoney || "______"}.00.\n\n[ ] If checked All Cash Purchase.\n[ ] If checked Subject to Existing Mortgages/Loans: See Addendum #______\n[ ] If checked Seller Financing and Terms: See Addendum #______` },
    { heading: 'CONSIDERATION RECEIPT AND SUFFICIENCY:', content: 'Seller hereby acknowledges and accepts the amount of consideration as the total consideration for the sale of the property to Buyer. Seller is satisfied as to the amount of consideration and acknowledges the consideration to be a sufficient amount to purchase the aforementioned Property.' },
    { heading: 'TITLE INSURANCE:', content: 'Seller will provide a policy of owner\'s title insurance insuring marketable title at closing free and clear of all liens and encumbrances, except as to those usual limitations such as zoning, setback requirements and general utility, sewer, and drainage easements of record upon which the improvements do not encroach, and leases and other encumbrances specified in this Agreement.' },
    { heading: 'CLOSING DATE:', content: `This transaction shall be closed and the Deed and other Closing Papers delivered in ______ days following the date of final acceptance or on ${contractData.closingDate || "______, 20______"}, or sooner, unless extended by other provisions of this Purchase and Sales Agreement, or by written agreement of the Parties and also at the sole option of the buyer.` },
    { heading: 'ITEMS INCLUDED OR EXCLUDED:', content: 'Included, if present, as part of the property sale: all real estate, buildings, improvements, appurtenances (rights and privileges), kitchen appliances (including refrigerator), and Fixtures. Fixtures include all things which are attached to the structure(s) by nails, screws, or other permanent fasteners, including, but not limited to all of the following, if present: attached light fixtures and bulbs, ceiling fans, attached mirrors; heating and cooling equipment and thermostats; plumbing fixtures and equipment; all doors and storm doors; all windows, screens, and storm windows; all window treatments (draperies, curtains, blinds, shades, etc.) and hardware; all wall-to-wall carpet; all built-in kitchen appliances and stove; all bathroom fixtures; gas logs, fireplace doors and attached screens; all security system components and controls; garage door openers and all remote controls; swimming pool and its equipment; awnings; permanently installed outdoor cooking grills; all fencing, landscaping and outdoor lighting; and mail boxes.' },
    { heading: 'OCCUPANCY:', content: 'Exclusive irrevocable possession and occupancy shall be delivered to Buyer, Buyer\'s Assignees, or Buyer\'s Agents at 5:00 PM on [ ] the date this agreement is signed by Seller, [ ] on the date of Close of Escrow, [ ] on ______, 20______ or [ ] no later than ______ days after Close of Escrow.\n[ ] If checked Property shall be vacant at least ______ days prior to Close of Escrow.\n[ ] If checked Property is intended to be rented or occupied beyond closing, the fact and terms thereof shall be stated herein.' },
    { heading: 'CONDITION OF PROPERTY:', content: 'Buyer agrees to purchase the Property "as is" that is, with all defects which may exist, except as otherwise provided in the Agreement and the Due Diligence Period provision.' },
    { heading: 'INSPECTION OF PROPERTY:', content: 'Buyer shall have until the close of escrow to complete all Buyer investigations of the Property and approve all matters affecting the Property. Buyer may in Buyer\'s sole and absolute discretion, give notice of termination of this Agreement at any time prior to the close of escrow, and upon such termination, all deposits held in escrow shall be returned to Buyer, regardless of whether Buyer has elected to have an inspection performed.' },
    { heading: 'COSTS:', content: 'Buyer shall pay for all normal closing costs. Costs shall not include property taxes, voluntary or involuntary liens against the property.' },
    { heading: 'NON-AGENCY RELATIONSHIP:', content: 'A principal with Buyer is a Department of Real Estate Licensee. An Agency relationship between Buyer and Seller does not exist. Seller should seek advice from their legal counsel prior to agreeing to the terms of this Agreement.' },
    { heading: 'TIME FOR ACCEPTANCE AND EFFECTIVE DATE:', content: 'This Offer shall be deemed revoked unless the Offer is signed by Seller indicating an Acceptance and a copy of the Signed Offer is received by the Buyer on or before ______:01 PM, on ______, 20______. If a copy of the Signed Offer is not received by Buyer on or before the Date and Time stated above, the aforesaid Deposit(s) shall be, at the option of the Buyer, returned to Buyer and this offer shall thereafter be null and void.' },
    { heading: 'NOT A LOAN TO SELLER TRANSACTION:', content: 'Seller acknowledges that the buyer is not lending to the seller any monies and this Purchase and Sales Agreement is an agreement to purchase the aforementioned Property only. All monies shall be given to the seller on the day escrow closes.' },
    { heading: 'SECURITY DEPOSITS:', content: 'Security deposits, if any, shall be paid to the Buyer. All deposits and/or rents collected shall be prorated and said prorations paid to Buyer.' },
    { heading: 'LIENS:', content: 'Seller shall, both as to the Property and Personally being sold hereunder, furnish to Buyer at time of closing an affidavit attesting to the absence, unless otherwise provided for herein, of any financing statements, claims of lien or potential lienors known or reasonably expected to be known to Seller and further attesting that there have been no improvements to the Property for ninety days immediately preceding date of closing.' },
    { heading: 'PLACE OF CLOSING:', content: contractData.placeOfClosing || "______" },
    { heading: 'TIME:', content: 'Time is of the essence of this Agreement. Any reference herein to time periods of less than six days shall in the computation thereof, exclude Saturdays, Sundays and legal holidays, and any time period provided for herein which shall end on a Saturday, Sunday or legal holiday shall extend to 5:00 p.m. of the next business day.' },
    { heading: 'BREACH:', content: 'If this contract is breached by Buyer, all damages resulting therefrom to Seller and to Broker(s), including their reasonable attorney\'s fees, costs, and the commissions hereinafter specified, shall be paid by Buyer. The Seller, however, may elect to retain the earnest money as liquidated damages. If this contract is breached by Seller, Seller shall pay 10% of the contract price directly to buyer to make whole the Buyer for any and all expenditures made marketing, time devoted to the project and any additional expenditures made in furtherance of this Purchase Agreement. All damages resulting therefrom to Buyer, including their reasonable attorney\'s fees, costs, and the commissions hereinafter specified. The foregoing shall not preclude an action for specific performance of this contract.' },
    { heading: 'MEMORANDUM OF CONTRACT RECORDABLE, PERSONS BOUND AND NOTICE:', content: 'Buyer may cause to be recorded, at Buyer\'s option and expense, in the public records of the county in which the property is located, an executed Memorandum of Contract. This Agreement shall bind and inure to the benefit of the Parties hereto and their successors in interest. Whenever the context permits, singular shall include plural and one gender shall include all. Notice given by or to the attorney for either party shall be as effective as if given by or to said party.' },
    { heading: 'PRORATIONS AND INSURANCE:', content: 'Taxes, assessments, rent, interest, insurance and other expenses and revenue of the Property shall be prorated as of date of closing. Buyer shall have the option of taking over any existing policies of insurance on the Property, if assumable, in which event premiums shall be prorated. The cash at closing shall be increased or decreased as may be required by said prorations. All references in the Agreement to prorations as of date of closing will be deemed date of occupancy if occupancy occurs prior to closing, unless otherwise provided for herein. Seller agrees to carry casualty insurance until the Property is conveyed to the Buyer.' },
    { heading: 'MODIFICATION:', content: 'No prior or present agreements or representations shall be binding upon any of the Parties hereto unless incorporated in this Agreement. No modification or change in this Agreement shall be valid or binding upon the Parties unless in writing, executed by the Parties to be bound thereby.' },
    { heading: 'CLERICAL ERROR WAIVER:', content: 'In the event the Buyer at any time discovers that any of the documents executed in connection with this transaction contain an error caused by clerical mistake, calculation error, computer malfunction, printing error or similar error, all parties agree, upon notice from the Buyer, to re-execute any documents that are necessary to correct such error(s). Seller agrees that no party to this transaction will be liable to the Seller for any damages incurred by the Buyer that are directly or indirectly caused by any such error(s).' },
    { heading: 'MARKETING:', content: 'Seller authorizes Buyer to market property during escrow for Buyer\'s benefit. Marketing is defined as, but not limited to, placing the property for sale in the Real Estate Multiple Listing Service (MLS), advertising in the Newspaper or other periodical, and placing a for sale sign on the property.' },
    { heading: 'MEETING OF THE MINDS ACKNOWLEDGEMENT:', content: 'Seller has thoroughly and completely reviewed the Purchase and Sales Agreement and understands completely all terms and conditions contained therein. Seller further acknowledges having no confusion, uncertainty about any aspect of the Purchase and Sales Agreement and has sufficient experience in real estate transacting to be able to sign the Agreement with absolute confidence in Seller\'s ability to comprehend all matters related to it and to the sale of the property. Seller further understands and agrees to have been given sufficient time to read through this Agreement and has also been given the opportunity to seek advice from Seller\'s legal counsel prior to agreeing to the terms of this Purchase and Sales Agreement. The Buyer, their representatives, or Seller\'s current situation has not forced Seller into signing this Agreement.' },
    { heading: 'MUTUALLY DRAFTED:', content: 'If an ambiguity or question of intent or interpretation arises, then this Agreement will accordingly be construed as drafted jointly by the Parties.' },
    { heading: 'DISCLOSURES AND SPECIAL PROVISIONS:', content: 'Earnest money shall remain refundable through due diligence period.' },
    { heading: 'INTEGRATION:', content: 'It is expressly understood and agreed that this instrument contains the entire agreement between Seller and Buyer and that, except as otherwise provided herein, there are no oral or collateral conditions, agreements or representations, all such having been incorporated and resolved into this agreement. Unless otherwise specified herein or new construction is involved, the property is purchased "as is" and Seller neither makes nor implies any warranty as to the condition of the premises. All conditions of this contract shall be satisfied at or before closing; and neither Seller or their associates assume any obligation or liability for the performance or satisfaction of any such condition after closing.' }
  ];
  contractSections.forEach(section => {
    doc.setFont('Times', 'bold');
    if (y + 30 > pageHeight - marginTop) {
      doc.addPage(); drawBorder(); y = marginTop + 10;
    }
    doc.text(section.heading, marginLeft, y);
    y += lineHeight;
    doc.setFont('Times', 'normal');
    const lines = doc.splitTextToSize(section.content, maxWidth);
    lines.forEach(line => {
      if (y + lineHeight > pageHeight - marginTop) {
        doc.addPage(); drawBorder(); y = marginTop + 10;
      }
      doc.text(line, marginLeft, y);
      y += lineHeight;
    });
    y += lineHeight;
  });
  if (y + 100 > pageHeight - marginTop) {
    doc.addPage(); drawBorder(); y = marginTop + 10;
  }
  doc.text('_____________________________   _______________', marginLeft, y);
  y += lineHeight;
  doc.text('Buyer                                            Date', marginLeft, y);
  y += lineHeight * 2;
  doc.text('_____________________________   _______________', marginLeft, y);
  y += lineHeight;
  doc.text('Buyer                                            Date', marginLeft, y);
  y += lineHeight * 2;
  doc.text('_____________________________   _______________', marginLeft, y);
  y += lineHeight;
  doc.text('Seller                                           Date', marginLeft, y);
  y += lineHeight * 2;
  doc.text('_____________________________   _______________', marginLeft, y);
  y += lineHeight;
  doc.text('Seller                                           Date', marginLeft, y);
  return doc;
}

export default function ContractPreview({ contractData, formData, dealId, isLoading = false }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });



  // Download PDF handler
  const handleDownloadPDF = () => {
    const doc = generateContractPDF(contractData, formData);
    doc.save('Purchase-And-Sales-Agreement.pdf');
  };

  const generateContractPreview = () => {
    return (
      <div className="contract-content">
        <h1 className="text-center font-bold mb-4">PURCHASE AND SALES AGREEMENT</h1>

        <p className="mb-4"><strong>DATED:</strong> {currentDate}</p>

        <p className="mb-4"><strong>PARTIES:</strong> {contractData.sellerName || "______"}, as the Seller, {contractData.scoutName || "______"}, and or assigns, as the buyer (collectively referred to herein as the "Parties"). Buyer and Seller which terms may be singular or plural and will include the heirs, successors, personal representatives and assigns, hereby agree that the Seller shall sell and Buyer shall buy the following legally described Property.</p>

        <p className="mb-4"><strong>THE PROPERTY DESCRIBED AS:</strong> {contractData.propertyAddress || "______"} (Street address)<br />
          City of {contractData.propertyCity || "______"} State of {contractData.propertyState || "______"} Country of {contractData.propertyCountry || "______"}<br />
          Assessor's Parcel Number: {formData.apn || "______"}</p>

        <p className="mb-4"><strong>FINANCING/TERMS/PURCHASE PRICE:</strong><br />
          The Purchase Price Offered is: ${contractData.propertyPrice || "______"}.00.<br /><br />
          Deposit(s) to be held in escrow by {contractData.escrowHolder || "______"}. Deposit to be placed into escrow prior to the closing of escrow in the amount of: ${contractData.earnestMoney || "______"}.00.<br /><br />
          [ ] If checked All Cash Purchase.<br />
          [ ] If checked Subject to Existing Mortgages/Loans: See Addendum #______<br />
          [ ] If checked Seller Financing and Terms: See Addendum #______</p>

        <p className="mb-4"><strong>CONSIDERATION RECEIPT AND SUFFICIENCY:</strong> Seller hereby acknowledges and accepts the amount of consideration as the total consideration for the sale of the property to Buyer. Seller is satisfied as to the amount of consideration and acknowledges the consideration to be a sufficient amount to purchase the aforementioned Property.</p>

        <p className="mb-4"><strong>TITLE INSURANCE:</strong> Seller will provide a policy of owner's title insurance insuring marketable title at closing free and clear of all liens and encumbrances, except as to those usual limitations such as zoning, setback requirements and general utility, sewer, and drainage easements of record upon which the improvements do not encroach, and leases and other encumbrances specified in this Agreement.</p>

        <p className="mb-4"><strong>CLOSING DATE:</strong> This transaction shall be closed and the Deed and other Closing Papers delivered in ______ days following the date of final acceptance or on {contractData.closingDate || "______, 20______"}, or sooner, unless extended by other provisions of this Purchase and Sales Agreement, or by written agreement of the Parties and also at the sole option of the buyer.</p>

        <p className="mb-4"><strong>ITEMS INCLUDED OR EXCLUDED:</strong> Included, if present, as part of the property sale: all real estate, buildings, improvements, appurtenances (rights and privileges), kitchen appliances (including refrigerator), and Fixtures. Fixtures include all things which are attached to the structure(s) by nails, screws, or other permanent fasteners, including, but not limited to all of the following, if present: attached light fixtures and bulbs, ceiling fans, attached mirrors; heating and cooling equipment and thermostats; plumbing fixtures and equipment; all doors and storm doors; all windows, screens, and storm windows; all window treatments (draperies, curtains, blinds, shades, etc.) and hardware; all wall-to-wall carpet; all built-in kitchen appliances and stove; all bathroom fixtures; gas logs, fireplace doors and attached screens; all security system components and controls; garage door openers and all remote controls; swimming pool and its equipment; awnings; permanently installed outdoor cooking grills; all fencing, landscaping and outdoor lighting; and mail boxes.</p>

        <p className="mb-4"><strong>OCCUPANCY:</strong> Exclusive irrevocable possession and occupancy shall be delivered to Buyer, Buyer's Assignees, or Buyer's Agents at 5:00 PM on [ ] the date this agreement is signed by Seller, [ ] on the date of Close of Escrow, [ ] on ______, 20______ or [ ] no later than ______ days after Close of Escrow.<br />
          [ ] If checked Property shall be vacant at least ______ days prior to Close of Escrow.<br />
          [ ] If checked Property is intended to be rented or occupied beyond closing, the fact and terms thereof shall be stated herein.</p>

        <p className="mb-4"><strong>CONDITION OF PROPERTY:</strong> Buyer agrees to purchase the Property "as is" that is, with all defects which may exist, except as otherwise provided in the Agreement and the Due Diligence Period provision.</p>

        <p className="mb-4"><strong>INSPECTION OF PROPERTY:</strong> Buyer shall have until the close of escrow to complete all Buyer investigations of the Property and approve all matters affecting the Property. Buyer may in Buyer's sole and absolute discretion, give notice of termination of this Agreement at any time prior to the close of escrow, and upon such termination, all deposits held in escrow shall be returned to Buyer, regardless of whether Buyer has elected to have an inspection performed.</p>

        <p className="mb-4"><strong>COSTS:</strong> Buyer shall pay for all normal closing costs. Costs shall not include property taxes, voluntary or involuntary liens against the property.</p>

        <p className="mb-4"><strong>NON-AGENCY RELATIONSHIP:</strong> A principal with Buyer is a Department of Real Estate Licensee. An Agency relationship between Buyer and Seller does not exist. Seller should seek advice from their legal counsel prior to agreeing to the terms of this Agreement.</p>

        <p className="mb-4"><strong>TIME FOR ACCEPTANCE AND EFFECTIVE DATE:</strong> This Offer shall be deemed revoked unless the Offer is signed by Seller indicating an Acceptance and a copy of the Signed Offer is received by the Buyer on or before ______:01 PM, on ______, 20______. If a copy of the Signed Offer is not received by Buyer on or before the Date and Time stated above, the aforesaid Deposit(s) shall be, at the option of the Buyer, returned to Buyer and this offer shall thereafter be null and void.</p>

        <p className="mb-4"><strong>NOT A LOAN TO SELLER TRANSACTION:</strong> Seller acknowledges that the buyer is not lending to the seller any monies and this Purchase and Sales Agreement is an agreement to purchase the aforementioned Property only. All monies shall be given to the seller on the day escrow closes.</p>

        <p className="mb-4"><strong>SECURITY DEPOSITS:</strong> Security deposits, if any, shall be paid to the Buyer. All deposits and/or rents collected shall be prorated and said prorations paid to Buyer.</p>

        <p className="mb-4"><strong>LIENS:</strong> Seller shall, both as to the Property and Personally being sold hereunder, furnish to Buyer at time of closing an affidavit attesting to the absence, unless otherwise provided for herein, of any financing statements, claims of lien or potential lienors known or reasonably expected to be known to Seller and further attesting that there have been no improvements to the Property for ninety days immediately preceding date of closing.</p>

        <p className="mb-4"><strong>PLACE OF CLOSING:</strong> {contractData.placeOfClosing || "______"}</p>

        <p className="mb-4"><strong>TIME:</strong> Time is of the essence of this Agreement. Any reference herein to time periods of less than six days shall in the computation thereof, exclude Saturdays, Sundays and legal holidays, and any time period provided for herein which shall end on a Saturday, Sunday or legal holiday shall extend to 5:00 p.m. of the next business day.</p>

        <p className="mb-4"><strong>BREACH:</strong> If this contract is breached by Buyer, all damages resulting therefrom to Seller and to Broker(s), including their reasonable attorney's fees, costs, and the commissions hereinafter specified, shall be paid by Buyer. The Seller, however, may elect to retain the earnest money as liquidated damages. If this contract is breached by Seller, Seller shall pay 10% of the contract price directly to buyer to make whole the Buyer for any and all expenditures made marketing, time devoted to the project and any additional expenditures made in furtherance of this Purchase Agreement. All damages resulting therefrom to Buyer, including their reasonable attorney's fees, costs, and the commissions hereinafter specified. The foregoing shall not preclude an action for specific performance of this contract.</p>

        <p className="mb-4"><strong>MEMORANDUM OF CONTRACT RECORDABLE, PERSONS BOUND AND NOTICE:</strong> Buyer may cause to be recorded, at Buyer's option and expense, in the public records of the county in which the property is located, an executed Memorandum of Contract. This Agreement shall bind and inure to the benefit of the Parties hereto and their successors in interest. Whenever the context permits, singular shall include plural and one gender shall include all. Notice given by or to the attorney for either party shall be as effective as if given by or to said party.</p>

        <p className="mb-4"><strong>PRORATIONS AND INSURANCE:</strong> Taxes, assessments, rent, interest, insurance and other expenses and revenue of the Property shall be prorated as of date of closing. Buyer shall have the option of taking over any existing policies of insurance on the Property, if assumable, in which event premiums shall be prorated. The cash at closing shall be increased or decreased as may be required by said prorations. All references in the Agreement to prorations as of date of closing will be deemed date of occupancy if occupancy occurs prior to closing, unless otherwise provided for herein. Seller agrees to carry casualty insurance until the Property is conveyed to the Buyer.</p>

        <p className="mb-4"><strong>MODIFICATION:</strong> No prior or present agreements or representations shall be binding upon any of the Parties hereto unless incorporated in this Agreement. No modification or change in this Agreement shall be valid or binding upon the Parties unless in writing, executed by the Parties to be bound thereby.</p>

        <p className="mb-4"><strong>CLERICAL ERROR WAIVER:</strong> In the event the Buyer at any time discovers that any of the documents executed in connection with this transaction contain an error caused by clerical mistake, calculation error, computer malfunction, printing error or similar error, all parties agree, upon notice from the Buyer, to re-execute any documents that are necessary to correct such error(s). Seller agrees that no party to this transaction will be liable to the Seller for any damages incurred by the Buyer that are directly or indirectly caused by any such error(s).</p>

        <p className="mb-4"><strong>MARKETING:</strong> Seller authorizes Buyer to market property during escrow for Buyer's benefit. Marketing is defined as, but not limited to, placing the property for sale in the Real Estate Multiple Listing Service (MLS), advertising in the Newspaper or other periodical, and placing a for sale sign on the property.</p>

        <p className="mb-4"><strong>MEETING OF THE MINDS ACKNOWLEDGEMENT:</strong> Seller has thoroughly and completely reviewed the Purchase and Sales Agreement and understands completely all terms and conditions contained therein. Seller further acknowledges having no confusion, uncertainty about any aspect of the Purchase and Sales Agreement and has sufficient experience in real estate transacting to be able to sign the Agreement with absolute confidence in Seller's ability to comprehend all matters related to it and to the sale of the property. Seller further understands and agrees to have been given sufficient time to read through this Agreement and has also been given the opportunity to seek advice from Seller's legal counsel prior to agreeing to the terms of this Purchase and Sales Agreement. The Buyer, their representatives, or Seller's current situation has not forced Seller into signing this Agreement.</p>

        <p className="mb-4"><strong>MUTUALLY DRAFTED:</strong> If an ambiguity or question of intent or interpretation arises, then this Agreement will accordingly be construed as drafted jointly by the Parties.</p>

        <p className="mb-4"><strong>DISCLOSURES AND SPECIAL PROVISIONS:</strong><br />
          Earnest money shall remain refundable through due diligence period.</p>

        <p className="mb-4"><strong>INTEGRATION:</strong> It is expressly understood and agreed that this instrument contains the entire agreement between Seller and Buyer and that, except as otherwise provided herein, there are no oral or collateral conditions, agreements or representations, all such having been incorporated and resolved into this agreement. Unless otherwise specified herein or new construction is involved, the property is purchased "as is" and Seller neither makes nor implies any warranty as to the condition of the premises. All conditions of this contract shall be satisfied at or before closing; and neither Seller or their associates assume any obligation or liability for the performance or satisfaction of any such condition after closing.</p>

        <div className="mt-8">
          <p>_____________________________ _______________</p>
          <p>Buyer                       Date</p>
          <p className="mt-4">_____________________________ _______________</p>
          <p>Buyer                       Date</p>
          <p className="mt-4">_____________________________ _______________</p>
          <p>Seller                      Date</p>
          <p className="mt-4">_____________________________ _______________</p>
          <p>Seller                      Date</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full relative"
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
          <div className="bg-[var(--secondary-gray-bg)] rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-2 border-[var(--mafia-red)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium">Preparing Document...</p>
            <p className="text-[var(--secondary-gray-text)] text-sm mt-2">Generating PDF and setting up DocuSign</p>
          </div>
        </div>
      )}
      {/* Contract Preview */}
      <motion.div
        variants={fadeInLeft}
        className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={20} className="text-[var(--mafia-red)]" />
            Contract Preview
          </h3>
          <div className="flex gap-2">
            <button
              className="p-2 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]"
              onClick={handleDownloadPDF}
              title="Download PDF"
            >
              <Download size={16} />
            </button>

          </div>
        </div>
        <div
          id="contract-preview-print"
          className="bg-[var(--primary-gray-bg)] rounded-lg p-4 h-96 overflow-y-auto border border-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)]"
        >
          {generateContractPreview()}
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        variants={fadeInRight}
        className="bg-[var(--secondary-gray-bg)] rounded-2xl p-6 shadow-sm border border-[var(--tertiary-gray-bg)]"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Contract Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[var(--tertiary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Deal ID</span>
            <span className="text-sm font-semibold text-[var(--mafia-red)]">#{dealId}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Property</span>
            <span className="text-sm text-white">{contractData.propertyAddress}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Offer Price</span>
            <span className="text-sm font-semibold text-[var(--green)]">
              ${contractData.propertyPrice ? Number(contractData.propertyPrice).toLocaleString() : "Not set"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Closing Date</span>
            <span className="text-sm text-white">
              {contractData.closingDate || "Not set"}
            </span>
          </div>

        </div>
      </motion.div>
    </motion.div>
  )
}