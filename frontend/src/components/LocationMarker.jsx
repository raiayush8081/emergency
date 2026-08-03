import {Marker,Popup,useMap} from "react-leaflet";
import {useEffect} from "react";
const LocationMarker = ({position}) => {
    const map = useMap();
    useEffect(()=>{
        if(position){
            map.setView(position,17);
        }
    },[position,map]);
  return (
    <Marker position={position}>
        <Popup>You are here!</Popup>
    </Marker>
  )
}

export default LocationMarker