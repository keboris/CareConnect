import { useEffect, useRef, useState } from "react";
import type { AddressInputProps, SuggestionAddress } from "../../types";
import { useLanguage } from "../../contexts";

const AddressInput: React.FC<AddressInputProps> = ({
  locationValue,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [hasSelected, setHasSelected] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionAddress[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { language } = useLanguage();

  useEffect(() => {
    setQuery(locationValue);
  }, [locationValue]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHasSelected(false);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (value.length < 3) {
        setSuggestions([]);
        return;
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          value
        )}&accept-language=${language}&format=json&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    }, 1000);
  };

  const handleSelect = (place: SuggestionAddress) => {
    const namePlace =
      (place.address.road || "") +
      (place.address.house_number ? " " + place.address.house_number : "") +
      ", " +
      (place.address.postcode ? place.address.postcode + " " : "") +
      (place.address.city || "");

    setQuery(namePlace);
    setSuggestions([]);
    setHasSelected(true);
    onSelect({
      location: namePlace,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    });
    console.log(
      "Selected place:",
      namePlace,
      parseFloat(place.lat),
      parseFloat(place.lon)
    );
  };

  const handleBlur = () => {
    if (!hasSelected) {
      setQuery("");
      onSelect({ location: "", latitude: 0, longitude: 0 });
    }
  };

  return (
    <>
      <input
        type="text"
        name="useraddress"
        value={query}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Vahrenwalder Str. 269, 30179 Hannover"
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-base-100 border border-base-300 w-full max-h-48 overflow-auto rounded-lg shadow-lg">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              className="p-2 hover:bg-base-200 cursor-pointer"
              onClick={() => handleSelect(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default AddressInput;
