import axios from "axios";
import { useEffect, useState } from "react";

export default function Filters({ label, selected, onSelectedChange }: { label: string, selected: {id: string, text: string, selectionType: "INCLUDED" | "EXCLUDED"}[], onSelectedChange: (selected: {id: string, text: string, selectionType: "INCLUDED" | "EXCLUDED"}[])=>void}) {
  const [isOption, setIsoption] = useState<boolean>(false);
  const [options, setOptions] = useState<{id: string, text: string, selectionType: "INCLUDED" | "EXCLUDED"}[]>([]);
  const [selectedOption, setSelectedOption] = useState<{id: string, text: string, selectionType: "INCLUDED" | "EXCLUDED"}[]>([]);
  const [query, setquery] = useState<string>("");
  const endpointMap: { [key: string]: string } = {
    "Job Titles":
      "https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/filter_job_title_suggestions",
    "Companies":
      "https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/filter_company_suggestions",
    "Locations":
      "https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/filter_geography_location_region_suggestions",
    "Seniority Level":
      "https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/filter_seniority_level",
    "Postal Code":
      "https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/filter_geography_location_postal_code_suggestions",
    "Years":
      "https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/filter_years_in",
  };

  useEffect(() => {
    const handleGetOptions = async () => {
      try {
        const res = await axios.post(
          endpointMap[label],
          { query: query },
          {
            headers: {
              "x-rapidapi-key":
                "31b2d865d2mshbae4e3d83ed7b3ep1a7793jsn925e29e546aa",
              "x-rapidapi-host":
                "linkedin-sales-navigator-no-cookies-required.p.rapidapi.com",
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Response for ", label, "from rapidapi: ", res.data);
        setOptions(res.data.data.map((item) => ({id: item.id, text: item.displayValue,selectionType: "INCLUDED"})));
        console.log(options);
      } catch (error) {
        console.log(
          "Error in fetching ",
          label,
          " details from rapidapi: ",
          error
        );
      }
    };

    handleGetOptions();
  }, [query, label]);

  return (
    <div className="mb-2 relative">
      <label className="text-gray-300 text-sm font-medium">{label}</label>
      <div className="relative w-48">
        <input
          className="w-full bg-[#232323] text-gray-200 border border-[#353535] rounded px-3 py-2 pr-8 appearance-none focus:outline-none"
          onClick={() => setIsoption(!isOption)}
          placeholder=""
          value={query}
          onChange={(e) => setquery(e.target.value)}
        />
        {isOption && (
          <ul>
            {options.map((option) => (
              <li
                key={option.id}
                className="px-4 py-2 hover:bg-[#232323] text-gray-100 text-sm-cursor-pointer transition"
                onClick={() => {
                  setSelectedOption((selectOption) => [
                    ...selectOption,
                    {id: option.id, text: option.text, selectionType: option.selectionType},
                  ]);
                  setOptions(options.filter((f) => f != option));
                  setIsoption(false);
                  onSelectedChange([...selected, {id: option.id, text: option.text, selectionType: "INCLUDED"}]);
                }}
              >
                {option.text}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedOption.map((option) => (
          <span
            key={option.id}
            className="bg-[#232323] text-gray-100 px-3 py-1 rounded-full text-xs flex items-center"
          >
            {option.text}
            <button
              className="ml-2 text-gray-400 hover:text-red-500 text-base font-bold"
              onClick={() => {
                setSelectedOption(
                  selectedOption.filter((soption) => soption != option)
                );
                setOptions((prev) => [...prev, option]);
              }}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
