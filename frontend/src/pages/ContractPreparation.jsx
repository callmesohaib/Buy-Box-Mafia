import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, PenTool } from "lucide-react"
import { fadeInDown, fadeInUp, buttonHover } from "../animations/animation"
import ProgressSteps from "../components/contract/ProgressSteps"
import ContractForm from "../components/contract/ContractForm"
import ContractPreview from "../components/contract/ContractPreview"
import SignatureStep from "../components/contract/SignatureStep"
import { generateContractPDF } from "../components/contract/ContractPreview";
import DownloadSignedPDF from "../components/contract/ContractDownload"
import { useAuth } from "../store/AuthContext"
import { useProperty } from "../store/PropertyContext"

export default function ContractPreparation() {
  const { fullAddress } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { propertyData, clearProperty, fetchProperty, updateProperty } = useProperty();

  const query = new URLSearchParams(location.search);
  const initialStep = parseInt(query.get('step')) || 0;
  const [currentStep, setCurrentStepState] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (fullAddress && initialLoad) {
      const query = decodeURIComponent(fullAddress);
      fetchProperty(query);
      setInitialLoad(false);
    }
  }, [fullAddress, fetchProperty, initialLoad]);

  const defaultDropdowns = {
    financingType: "Cash",
    surveyRequired: "Yes",
    titleInsurance: "Yes",
    inspectionPeriod: "7 days",
  };

  const dealId = propertyData?.identifier?.attomId || '';

  const initialContractData = (location.state && location.state.contractData)
    ? { ...defaultDropdowns, ...location.state.contractData }
    : { ...defaultDropdowns };

  const buyerData = location.state || {};
  const [contractData, setContractData] = useState({
    ...initialContractData,
    matchedBuyers: buyerData.matchedBuyers || [],
    buyersCount: buyerData.buyersCount || 0,
    buyerIds: buyerData.buyerIds || [],
  });

  const [formData, setFormData] = useState({
    ...initialContractData,
    matchedBuyers: buyerData.matchedBuyers || [],
    buyersCount: buyerData.buyersCount || 0,
    buyerIds: buyerData.buyerIds || [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (propertyData) {
      const updatedData = {
        apn: propertyData?.identifier.apn || '',
        propertyAddress: propertyData?.address.oneLine,
        dealId: propertyData.identifier.attomId,
        propertyCountry: propertyData?.address?.country || '',
        propertyCity: propertyData?.address?.locality || '',
        propertyState: propertyData?.address?.matchCode || '',
        propertyPrice: propertyData.sale?.amount?.saleAmt || '',
        propertyType: propertyData.summary?.propClass || '',
        propertyZoning: propertyData.lot?.zoningType || '',
        listPrice: propertyData.sale?.amount?.listPrice || '',
        listDate: propertyData.sale?.amount?.saleRecDate || '',
        scoutName: user?.name || '',
        scoutEmail: user?.email || '',
        sellerName: propertyData?.sale?.sellerName || '',
        propertySize: propertyData.building?.size.bldgSize || '',
      };

      setContractData(prev => ({
        ...prev,
        ...updatedData
      }));

      setFormData(prev => ({
        ...prev,
        ...updatedData
      }));
    }
  }, [propertyData, user]);

  useEffect(() => {
    const storedEnvelopeId = sessionStorage.getItem(`envelopeId_${fullAddress}`);
    const storedContractData = sessionStorage.getItem(`contractData_${fullAddress}`);
    const storedSigningUrl = sessionStorage.getItem(`signingUrl_${fullAddress}`);
    if (storedEnvelopeId && storedSigningUrl) {
      setContractData(prev => ({
        ...prev,
        envelopeId: storedEnvelopeId,
        signingUrl: storedSigningUrl
      }));
    }


    if (storedContractData) {
      try {
        const parsedData = JSON.parse(storedContractData);
        setContractData(prev => ({
          ...prev,
          ...parsedData,
          matchedBuyers: parsedData.matchedBuyers || prev.matchedBuyers || [],
          buyersCount: parsedData.buyersCount || prev.buyersCount || 0,
          buyerIds: parsedData.buyerIds || prev.buyerIds || []
        }));
      } catch (error) {
        console.error("Error parsing stored contract data:", error);
      }
    }
  }, [fullAddress]);

  useEffect(() => {
    if (contractData) {
      sessionStorage.setItem(`contractData_${fullAddress}`, JSON.stringify(contractData));
    }
  }, [contractData, fullAddress]);

  const setCurrentStep = (step, data = contractData) => {
    setCurrentStepState(step);
    const params = new URLSearchParams(location.search);
    params.set('step', step);
    navigate({
      pathname: `/contract/${encodeURIComponent(fullAddress)}`,
      search: params.toString()
    }, {
      replace: true,
      state: {
        contractData: {
          ...data,
          matchedBuyers: data.matchedBuyers || contractData.matchedBuyers || [],
          buyersCount: data.buyersCount || contractData.buyersCount || 0,
          buyerIds: data.buyerIds || contractData.buyerIds || [],
          dealId
        }
      }
    });
  };
useEffect(() => {
  if (currentStep !== 2 || isLoading) return;

  const fetchSigningUrl = async () => {
    const storedEnvelopeId = sessionStorage.getItem(`envelopeId_${fullAddress}`);
    const envelopeIdToUse = contractData.envelopeId || storedEnvelopeId;
    if (!envelopeIdToUse) {
      console.warn("No envelopeId available to generate signing URL");
      setCurrentStep(1); 
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/docusign/get-signing-url/${envelopeIdToUse}?fullAddress=${encodeURIComponent(fullAddress)}`);
      if (!res.ok) {
        console.error("Failed to get signing url:", await res.text());
        setCurrentStep(1);
        return;
      }

      const data = await res.json();
      setContractData(prev => ({ ...prev, envelopeId: data.envelopeId, signingUrl: data.url }));
      window.open(data.url, "_blank");
    } catch (err) {
      console.error("Error fetching signing url:", err);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  fetchSigningUrl();
}, [currentStep, contractData.envelopeId, fullAddress]);



  const nextStep = async () => {
    if (currentStep === 0) {
      setContractData(prev => ({
        ...prev,
        ...formData
      }));
    }

    if (currentStep === 1) {
      setIsLoading(true);
      try {
        const doc = generateContractPDF(contractData, formData);
        const pdfBase64 = doc.output('datauristring').split(',')[1];

        const res = await fetch("http://localhost:3001/api/docusign/create-envelope", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: "Please sign the contract",
            recipients: [{
              email: user?.email || "user@example.com",
              name: user?.name || "User Name",
              clientUserId: "123",
              anchorString: "/sn1/"
            }],
            documentBase64: pdfBase64,
            documentName: "Purchase-And-Sales-Agreement.pdf",
            fullAddress: encodeURIComponent(fullAddress),
            dealId
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to initiate DocuSign");
        }

        const data = await res.json();
        sessionStorage.setItem(`envelopeId_${fullAddress}`, data.envelopeId);

        setCurrentStep(currentStep + 1, {
          ...contractData,
          ...formData,
          envelopeId: data.envelopeId,
          matchedBuyers: contractData.matchedBuyers || [],
          buyersCount: contractData.matchedBuyers.length || 0,
          buyerIds: contractData.buyerIds || []
        });
      } catch (e) {
        console.error("DocuSign error:", e);
        alert(e.message || "Failed to prepare document. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1, {
        ...contractData,
        ...formData
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1, {
        ...contractData,
        ...formData
      });
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      navigate(`/submit/${encodeURIComponent(fullAddress)}`, {
        state: {
          contractData: {
            ...contractData,
            ...formData,
            matchedBuyers: contractData.matchedBuyers || [],
            buyersCount: contractData.matchedBuyers.length || 0,
            buyerIds: contractData.buyerIds || []
          },
          dealId
        }
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ContractForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 1:
        return (
          <ContractPreview
            contractData={contractData}
            formData={contractData}
            fullAddress={fullAddress}
            isLoading={isLoading}
          />
        );
      case 2:
        if (!contractData.signingUrl) {
          return (
            <div className="text-center">
              <div className="bg-[var(--secondary-gray-bg)] rounded-2xl p-8 shadow-sm border border-[var(--tertiary-gray-bg)] max-w-md mx-auto">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenTool size={32} className="text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Signature Not Ready</h3>
                <p className="text-[var(--primary-gray-text)] mb-6">
                  The signing URL is not available. Please go back to the previous step and try again.
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full bg-[var(--mafia-red)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--mafia-red)]/90 transition-colors"
                >
                  Go Back to Preview
                </button>
              </div>
            </div>
          );
        }
        return (
          <SignatureStep
            envelopeId={contractData.envelopeId}
            signingUrl={contractData.signingUrl}
            fullAddress={fullAddress}
          />
        );
      case 3:
        return (
          <DownloadSignedPDF
            envelopeId={contractData.envelopeId}
            contractData={contractData}
            fullAddress={fullAddress}
          />
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 font-inter flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--secondary-gray-text)] mb-4">{error}</p>
          <button
            onClick={() => navigate('/property-search')}
            className="bg-[var(--mafia-red)] text-white px-6 py-3 rounded-xl hover:bg-[var(--mafia-red-hover)] transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] pt-5 pb-8 overflow-x-hidden"
    >
      <div className="w-[90%] mx-auto max-w-full">
        <motion.div
          variants={fadeInDown}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Contract Preparation</h1>
          </div>
          <p className="text-[var(--secondary-gray-text)]">Property: {decodeURIComponent(fullAddress)}</p>
          <p className="text-[var(--secondary-gray-text)]">Deal ID: #{dealId}</p>
        </motion.div>

        <ProgressSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex items-center justify-between mt-8"
        >
          <motion.button
            variants={buttonHover}
            whileHover="whileHover"
            whileTap="whileTap"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-[var(--primary-gray-text)] hover:text-[var(--mafia-red)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]"
          >
            <ChevronLeft size={20} />
            Previous
          </motion.button>

          <motion.button
            variants={buttonHover}
            whileHover="whileHover"
            whileTap="whileTap"
            onClick={currentStep === 3 ? handleSubmit : nextStep}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--mafia-red)] text-white rounded-lg hover:bg-[var(--mafia-red)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow focus:outline-none focus:ring-2 focus:ring-[var(--mafia-red)]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {currentStep === 1 ? "Preparing Document..." : currentStep === 3 ? "Saving Deal..." : "Loading..."}
              </>
            ) : (
              <>
                {currentStep === 3 ? "Submit" : "Next"}
                <ChevronRight size={20} />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

