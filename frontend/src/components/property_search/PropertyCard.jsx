import { MapPin, Hash, Star, Eye, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PropertyCard({ property, onClick }) {
  const navigate = useNavigate();



  const formatAddress = (addressObj) => {
    if (typeof addressObj === 'string') {
      return addressObj;
    }
    if (addressObj && typeof addressObj === 'object') {
      const parts = [
        addressObj.streetNumber,
        addressObj.streetDirectionPrefix,
        addressObj.streetName,
        addressObj.streetSuffix,
        addressObj.streetDirection,
        addressObj.unitNumber
      ].filter(Boolean);

      const cityStateZip = [
        addressObj.city,
        addressObj.state,
        addressObj.zip
      ].filter(Boolean).join(', ');

      return `${parts.join(' ')}${cityStateZip ? `, ${cityStateZip}` : ''}`;
    }
    return 'Address not available';
  };
  const propertyData = {
    id: property.mlsNumber || property.id || 'N/A',
    title: property.address ? formatAddress(property.address) : property.title || 'Property Listing',
    address: property.address ? formatAddress(property.address) : 'Address not available',
    apn: property.mlsNumber || property.apn || 'N/A',
    price: property.originalPrice ? `$${Number(property.originalPrice).toLocaleString()}` : property.originalPrice || 'Price not available',
    size: property.details.sqft ? `${property.details.sqft} sqft` : 'Size not available',
    propertyType: property.class || property.propertyType || 'Property',
    description: property.details.description || 'No description available',
    propertyImage: property.images && property.images.length > 0
      ? property.images[3]
      : 'https://cdn.repliers.io/sandbox/IMG-SANDBOX_4.jpg',
    propertyFeatures: property.features || []
  };
  const handlePropertyClick = (propertyId) => {
    navigate(`/valuation/${propertyId}`);
  };

  return (
    <div className="group cursor-pointer" onClick={() => onClick && onClick(property)}>
      <div className="bg-[var(--secondary-gray-bg)] rounded-2xl shadow-sm border border-[var(--tertiary-gray-bg)] overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative">
          <img
            src={propertyData.propertyImage}
            alt={propertyData.title}
            className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://cdn.repliers.io/sandbox/IMG-SANDBOX_2.jpg';
            }}
          />
          <div className="absolute bottom-3 left-3 bg-[var(--tertiary-gray-bg)] text-[var(--primary-gray-text)] text-xs font-medium px-2 py-1 rounded-lg">
            {propertyData.propertyType}
          </div>
        </div>
        <div className="p-4 sm:p-6 flex flex-col h-full">
          <h3 className="font-semibold text-white mb-2 group-hover:text-[var(--mafia-red)] transition-colors line-clamp-2">
            {propertyData.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[var(--primary-gray-text)] mb-2">
            <MapPin size={14} />
            <span className="line-clamp-1">{propertyData.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--primary-gray-text)] mb-3">
            <Hash size={14} />
            MLS: {propertyData.apn}
          </div>
          {/* <p className="text-sm text-[var(--secondary-gray-text)] mb-4 line-clamp-2">
            {propertyData.description}
          </p> */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-bold text-white">{propertyData.price}</div>
            <div className="text-sm text-[var(--primary-gray-text)]">{propertyData.size}</div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {propertyData.propertyFeatures.slice(0, 2).map((feature, idx) => (
              <span
                key={idx}
                className="text-xs bg-[var(--quaternary-gray-bg)] text-[var(--primary-gray-text)] px-2 py-1 rounded-lg font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
          <button
            className="mt-auto w-full bg-[var(--mafia-red)] hover:bg-[var(--mafia-red-hover)] text-white font-semibold py-2 rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            onClick={e => { e.stopPropagation(); handlePropertyClick(propertyData.id); }}
          >
            Run Valuation
          </button>
        </div>
      </div>
    </div>
  );
}
