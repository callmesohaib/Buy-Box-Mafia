import { useState, useEffect } from "react"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fadeInDown, fadeInUp, buttonHover } from "../animations/animation"
import ProgressSteps from "../components/contract/ProgressSteps"
import ContractForm from "../components/contract/ContractForm"
import ContractPreview from "../components/contract/ContractPreview"
import SignatureStep from "../components/contract/SignatureStep"
import SubmitStep from "../components/contract/SubmitStep"

export default function ContractPreparation() {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialStep = parseInt(query.get('step')) || 0;
  const [currentStep, setCurrentStepState] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const initialContractData = (location.state && location.state.contractData) ? location.state.contractData : {};
  const [contractData, setContractData] = useState(initialContractData);
  const [errors, setErrors] = useState({});
  const mlsNumber = dealId;
  console.log("MLS Number:", mlsNumber);
  const [propertyData, setPropertyData] = useState(null);

  useEffect(() => {
    if (!mlsNumber) return;
    setIsLoading(true);
    setPropertyData(null);
    fetch(`https://api.repliers.io/listings/${mlsNumber}`, {
      headers: {
        'REPLIERS-API-KEY': '41MCTXQRjF5HUStcQkFuNfYhGU56Je',
        'accept': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch property');
        return res.json();
      })
      .then((data) => {

        setPropertyData(data);
        console.log("Fetched property data:", data);
        setIsLoading(false);
      })
      .catch((e) => {
        setPropertyData(null);
        setIsLoading(false);
      });
  }, [mlsNumber]);


  // Update contractData state when propertyData changes
  useEffect(() => {
    if (propertyData) {
      setContractData(prev => ({
        ...prev,
        mlsNumber: propertyData?.mlsNumber || '',
        propertyAddress: propertyData?.address
          ? `${propertyData.address.streetNumber || ''} ${propertyData.address.streetName || ''} ${propertyData.address.streetSuffix || ''}, ${propertyData.address.city || ''}, ${propertyData.address.state || ''} ${propertyData.address.zip || ''}`.replace(/ +/g, ' ').trim()
          : '',
        propertyCity: propertyData?.address?.city || '',
        propertyState: propertyData?.address?.area || '',
        propertyCountry: propertyData?.address?.country || '',
        propertyPrice: propertyData?.originalPrice || '',
        propertyType: propertyData?.type || '',
        propertyZoning: propertyData?.zoning || '',
        propertyClass: propertyData?.class || '',
        listPrice: propertyData?.listPrice || '',
        listDate: propertyData?.listDate || '',
        status: propertyData?.status || '',
      }));
    }
  }, [propertyData]);

  // Update URL and pass contractData as state when step changes
  const setCurrentStep = (step, data = contractData) => {
    setCurrentStepState(step);
    const params = new URLSearchParams(location.search);
    params.set('step', step);
    navigate({ search: params.toString() }, { replace: true, state: { contractData: data } });
  };




  useEffect(() => {
    // Only update state if not initial mount
    if (currentStep !== initialStep) {
      setCurrentStep(currentStep, contractData);
    }
    // eslint-disable-next-line
  }, [contractData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Keep state in sync with URL if user changes it manually
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlStep = parseInt(params.get('step')) || 0;
    if (urlStep !== currentStep) {
      setCurrentStepState(urlStep);
    }
    // eslint-disable-next-line
  }, [location.search]);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1, contractData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1, contractData);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      navigate("/submit/22", { state: { contractData } })
    }, 3000)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ContractForm
            formData={contractData}
            setFormData={setContractData}
            errors={errors}
            setErrors={setErrors}
          />
        )
      case 1:
        return <ContractPreview contractData={contractData} formData={contractData} dealId={dealId} />
      case 2:
        return <SignatureStep />
      case 3:
        return <SubmitStep isLoading={isLoading} handleSubmit={handleSubmit} />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] pt-5 pb-8 overflow-x-hidden"
    >
      <div className="w-[90%] mx-auto max-w-full">
        {/* Header */}
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
          <p className="text-[var(--secondary-gray-text)]">Deal ID: #{dealId}</p>
        </motion.div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />

        {/* Step Content */}
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

        {/* Navigation Buttons */}
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
            {currentStep === 3 ? "Submit" : "Next"}
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}