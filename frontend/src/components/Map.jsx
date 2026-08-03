import { MapContainer, TileLayer } from "react-leaflet";
import { useEffect, useState } from "react";
import LocationMarker from "./LocationMarker.jsx";

const Map = () => {
    const [hospitals, setHospitals] = useState([]);
    const [position, setPosition] = useState(null);

    const fetchHospitals = async (lat, lng) => {
        const response = await fetch(
            `https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:${lng},${lat},5000&limit=20&apiKey=${"773c0c6350d54e5bbd0105c0773b393b"}`
        );

        const data = await response.json();

        console.log(data);

        const hospitals = data.features.map(
            (hospital) => hospital.properties.name || "Unnamed Hospital"
        );

        console.log(hospitals);

        // Store hospital data in React state
        setHospitals(hospitals);
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                setPosition([lat, lng]);

                fetchHospitals(lat, lng);
            },
            (err) => {
                console.log(err);
            }
        );
    }, []);

    if (!position) {
        return (
            <div className="h-screen flex items-center justify-center">
                Getting your Location...
            </div>
        );
    }

    return (
        <div className="relative h-screen">

            {/* Map */}
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: "100vh", width: "100%" }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationMarker position={position} />
            </MapContainer>

            {/* Hospital List */}
            <div className="absolute top-5 right-5 z-[1000] bg-white p-4 rounded-lg shadow-lg w-80 max-h-[80vh] overflow-y-auto">
                 

                <h2 className="text-xl font-bold mb-3">
                    Nearby Hospitals
                </h2>

                {hospitals.length === 0 ? (
                    <p>No hospitals found</p>
                ) : (
                    hospitals.map((hospital, index) => (
                        <div
                            key={index}
                            className="border-b py-3"
                        >
                            <p className="font-medium">
                                {hospital}
                            </p>
                        </div>
                    ))
                )}

            </div>

        </div>
    );
};

export default Map;