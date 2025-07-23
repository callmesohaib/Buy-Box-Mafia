import PropertyCard from "./PropertyCard";

export default function PropertyResults({ properties, onCardClick }) {
    if (!properties || !Array.isArray(properties)) {
        return (
            <div className="text-center text-white py-8">
                <p>No properties found or data is loading...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {properties.map((property) => (
                <PropertyCard
                    key={property.mlsNumber || property.id || Math.random()}
                    property={property}
                    onCardClick={onCardClick}
                />
            ))}
        </div>
    );
}
