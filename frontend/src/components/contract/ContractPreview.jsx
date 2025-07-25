import { motion } from "framer-motion"
import { FileText, Download, Printer } from "lucide-react"
import { fadeInUp, fadeInLeft, fadeInRight } from "../../animations/animation"

export default function ContractPreview({ contractData,formData, dealId }) {
const currentDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

  const generatePDFPreview = () => {
    return `PURCHASE AND SALES AGREEMENT
DATED: ${currentDate}
PARTIES: ${contractData.sellerName || "_____________________________________"}, as the Seller, ${contractData.scoutName || "_____________________"}, and or assigns, as the buyer
(collectively referred to herein as the “Parties”). Buyer and Seller which terms may be singular or plural and will include the heirs,
successors, personal representatives and assigns, hereby agree that the Seller shall sell and Buyer shall buy the following legally
described Property.
THE PROPERTY DESCRIBED AS: ${contractData.propertyAddress || "_________________________________________________________"} (Street address)
City of ${contractData.propertyCity || "______________________"} State of ${contractData.propertyState || "_____"} Country of ${contractData.propertyCountry || "___________"}
Assessor’s Parcel Number: ${formData.apn || "_______________________"}
FINANCING/TERMS/PURCHASE PRICE:
The Purchase Price Offered is: $${contractData.propertyPrice || "______________"}.00.
Deposit(s) to be held in escrow by ${contractData.escrowHolder || "___________"}. Deposit to be placed into escrow prior to the closing of escrow in the amount of: $${contractData.earnestMoney || "________________"}.00.
[ ] If checked All Cash Purchase.
[ ] If checked Subject to Existing Mortgages/Loans: See Addendum #_____
[ ] If checked Seller Financing and Terms: See Addendum #_____
CONSIDERATION RECEIPT AND SUFFICIENCY: Seller hereby acknowledges and accepts the amount of consideration as the
total consideration for the sale of the property to Buyer. Seller is satisfied as to the amount of consideration and acknowledges the
consideration to be a sufficient amount to purchase the aforementioned Property.
TITLE INSURANCE: Seller will provide a policy of owner’s title insurance insuring marketable title at closing free and clear of all
liens and encumbrances, except as to those usual limitations such as zoning, setback requirements and general utility, sewer, and drainage
easements of record upon which the improvements do not encroach, and leases and other encumbrances specified in this Agreement.
CLOSING DATE: This transaction shall be closed and the Deed and other Closing Papers delivered in __________ days following the
date of final acceptance or on ${contractData.closingDate || "_______________, 20_____"}, or sooner, unless extended by other provisions of this Purchase and Sales
Agreement, or by written agreement of the Parties and also at the sole option of the buyer.
ITEMS INCLUDED OR EXCLUDED: Included, if present, as part of the property sale: all real estate, buildings, improvements,
appurtenances (rights and privileges), kitchen appliances (including refrigerator), and Fixtures. Fixtures include all things which are
attached to the structure(s) by nails, screws, or other permanent fasteners, including, but not limited to all of the following, if present:
attached light fixtures and bulbs, ceiling fans, attached mirrors; heating and cooling equipment and thermostats; plumbing fixtures and
equipment; all doors and storm doors; all windows, screens, and storm windows; all window treatments (draperies, curtains, blinds,
shades, etc.) and hardware; all wall-to-wall carpet; all built-in kitchen appliances and stove; all bathroom fixtures; gas logs, fireplace
doors and attached screens; all security system components and controls; garage door openers and all remote controls; swimming pool
and its equipment; awnings; permanently installed outdoor cooking grills; all fencing, landscaping and outdoor lighting; and mail boxes.
OCCUPANCY: Exclusive irrevocable possession and occupancy shall be delivered to Buyer, Buyer’s Assignees, or Buyer’s
Agents at 5:00 PM on [ ] the date this agreement is signed by Seller, [ ] on the date of Close of Escrow, [ ] on ________________,
20______ or [ ] no later than ___________ days after Close of Escrow.
[ ] If checked Property shall be vacant at least __________ days prior to Close of Escrow.
[ ] If checked Property is intended to be rented or occupied beyond closing, the fact and terms thereof shall be stated herein.
CONDITION OF PROPERTY: Buyer agrees to purchase the Property “as is” that is, with all defects which may exist, except as
otherwise provided in the Agreement and the Due Diligence Period provision.
INSPECTION OF PROPERTY: Buyer shall have until the close of escrow to complete all Buyer investigations of the Property and
approve all matters affecting the Property. Buyer may in Buyer’s sole and absolute discretion, give notice of termination of this
Agreement at any time prior to the close of escrow, and upon such termination, all deposits held in escrow shall be returned to Buyer,
regardless of whether Buyer has elected to have an inspection performed.
COSTS: Buyer shall pay for all normal closing costs. Costs shall not include property taxes, voluntary or involuntary liens against the
property.
NON-AGENCY RELATIONSHIP: A principal with Buyer is a Department of Real Estate Licensee. An Agency relationship between
Buyer and Seller does not exist. Seller should seek advice from their legal counsel prior to agreeing to the terms of this Agreement.
TIME FOR ACCEPTANCE AND EFFECTIVE DATE: This Offer shall be deemed revoked unless the Offer is signed by Seller
indicating an Acceptance and a copy of the Signed Offer is received by the Buyer on or before _____:01 PM, on __________, 20_____.
If a copy of the Signed Offer is not received by Buyer on or before the Date and Time stated above, the aforesaid Deposit(s) shall be, at
the option of the Buyer, returned to Buyer and this offer shall thereafter be null and void.
ASSIGNABILITY: Buyer may assign this Agreement.
RESELL: Seller is aware that Buyer intends on reselling the property for a profit. All profits made by Buyer during this transaction
relating to the reselling of the property are the sole interest of and solely owned by the Buyer.
NOT A LOAN TO SELLER TRANSACTION: Seller acknowledges that the buyer is not lending to the seller any monies and this
Purchase and Sales Agreement is an agreement to purchase the aforementioned Property only. All monies shall be given to the seller on
the day escrow closes.
SECURITY DEPOSITS: Security deposits, if any, shall be paid to the Buyer. All deposits and/or rents collected shall be prorated and
said prorations paid to Buyer.
LIENS: Seller shall, both as to the Property and Personally being sold hereunder, furnish to Buyer at time of closing an affidavit
attesting to the absence, unless otherwise provided for herein, of any financing statements, claims of lien or potential lienors known or
reasonably expected to be known to Seller and further attesting that there have been no improvements to the Property for ninety days
immediately preceding date of closing.
PLACE OF CLOSING: ${contractData.placeOfClosing || "_________________________________________________________"}.
TIME: Time is of the essence of this Agreement. Any reference herein to time periods of less than six days shall in the computation
thereof, exclude Saturdays, Sundays and legal holidays, and any time period provided for herein which shall end on a Saturday, Sunday
or legal holiday shall extend to 5:00 p.m. of the next business day.
BREACH: If this contract is breached by Buyer, all damages resulting therefrom to Seller and to Broker(s), including their reasonable
attorney's fees, costs, and the commissions hereinafter specified, shall be paid by Buyer. The Seller, however, may elect to retain the
earnest money as liquidated damages. If this contract is breached by Seller, Seller shall pay 10% of the contract price directly to buyer to
make whole the Buyer for any and all expenditures made marketing, time devoted to the project and any additional expenditures made in
furtherance of this Purchase Agreement. All damages resulting therefrom to Buyer, including their reasonable attorney's fees, costs, and
the commissions hereinafter specified. The foregoing shall not preclude an action for specific performance of this contract.
MEMORANDUM OF CONTRACT RECORDABLE, PERSONS BOUND AND NOTICE: Buyer may cause to be recorded, at
Buyer's option and expense, in the public records of the county in which the property is located, an executed Memorandum of Contract.
This Agreement shall bind and inure to the benefit of the Parties hereto and their successors in interest. Whenever the context permits,
singular shall include plural and one gender shall include all. Notice given by or to the attorney for either party shall be as effective as if
given by or to said party.
PRORATIONS AND INSURANCE: Taxes, assessments, rent, interest, insurance and other expenses and revenue of the Property shall
be prorated as of date of closing. Buyer shall have the option of taking over any existing policies of insurance on the Property, if
assumable, in which event premiums shall be prorated. The cash at closing shall be increased or decreased as may be required by said
prorations. All references in the Agreement to prorations as of date of closing will be deemed date of occupancy if occupancy occurs
prior to closing, unless otherwise provided for herein. Seller agrees to carry casualty insurance until the Property is conveyed to the
Buyer.
MODIFICATION: No prior or present agreements or representations shall be binding upon any of the Parties hereto unless incorporated
in this Agreement. No modification or change in this Agreement shall be valid or binding upon the Parties unless in writing, executed by
the Parties to be bound thereby.
CLERICAL ERROR WAIVER: In the event the Buyer at any time discovers that any of the documents executed in connection with
this transaction contain an error caused by clerical mistake, calculation error, computer malfunction, printing error or similar error, all
parties agree, upon notice from the Buyer, to re-execute any documents that are necessary to correct such error(s). Seller agrees that no
party to this transaction will be liable to the Seller for any damages incurred by the Buyer that are directly or indirectly caused by any
such error(s).
MARKETING: Seller authorizes Buyer to market property during escrow for Buyer's benefit. Marketing is defined as, but not limited
to, placing the property for sale in the Real Estate Multiple Listing Service (MLS), advertising in the Newspaper or other periodical, and
placing a for sale sign on the property.
MEETING OF THE MINDS ACKNOWLEDGEMENT: Seller has thoroughly and completely reviewed the Purchase and Sales
Agreement and understands completely all terms and conditions contained therein. Seller further acknowledges having no confusion,
uncertainty about any aspect of the Purchase and Sales Agreement and has sufficient experience in real estate transacting to be able to
sign the Agreement with absolute confidence in Seller’s ability to comprehend all matters related to it and to the sale of the property.
Seller further understands and agrees to have been given sufficient time to read through this Agreement and has also been given the
opportunity to seek advice from Seller’s legal counsel prior to agreeing to the terms of this Purchase and Sales Agreement. The Buyer,
their representatives, or Seller’s current situation has not forced Seller into signing this Agreement.
MUTUALLY DRAFTED: If an ambiguity or question of intent or interpretation arises, then this Agreement will accordingly be
construed as drafted jointly by the Parties.
DISCLOSURES AND SPECIAL PROVISIONS:
Earnest money shall remain refundable through due diligence period.
INTEGRATION: It is expressly understood and agreed that this instrument contains the entire agreement between Seller and
Buyer and that, except as otherwise provided herein, there are no oral or collateral conditions, agreements or representations, all
such having been incorporated and resolved into this agreement. Unless otherwise specified herein or new construction is
involved, the property is purchased "as is" and Seller neither makes nor implies any warranty as to the condition of the
premises. All conditions of this contract shall be satisfied at or before closing; and neither Seller or their associates assume any
obligation or liability for the performance or satisfaction of any such condition after closing.
_____________________________ _______________
Buyer                       Date
_____________________________ _______________
Buyer                       Date
_____________________________ _______________
Seller                      Date
_____________________________ _______________
Seller                      Date
`
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
    >
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
            <button className="p-2 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]">
              <Download size={16} />
            </button>
            <button className="p-2 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]">
              <Printer size={16} />
            </button>
          </div>
        </div>
        <div className="bg-[var(--primary-gray-bg)] rounded-lg p-4 h-96 overflow-y-auto border border-[var(--tertiary-gray-bg)]">
          <pre className="text-sm text-[var(--primary-gray-text)] whitespace-pre-wrap font-mono">
            {generatePDFPreview()}
          </pre>
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
          <div className="flex items-center justify-between p-3 bg-[var(--primary-gray-bg)] rounded-lg">
            <span className="text-sm font-medium text-[var(--primary-gray-text)]">Status</span>
            <span className="text-sm font-semibold text-[var(--gold)]">Draft</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 