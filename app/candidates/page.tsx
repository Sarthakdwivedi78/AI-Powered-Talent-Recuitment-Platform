"use client";

import Filters from "@/components/filters";
import axios from "axios";
import { useEffect, useState } from "react";

interface OptionType {
  [key: string]: string[];
}

interface FinalFilterValueType {
  id: string;
  text: string;
  selectionType: "INCLUDED" | "EXCLUDED";
}

interface FinalFilterType {
  type: string;
  values: FinalFilterValueType[];
  selectedSubFilter: number;
}

function geminiToFilterState(geminiFilters: {
  [key: string]: string | string[];
}): { [key: string]: FinalFilterValueType[] } {
  if (!geminiFilters) {
    return {};
  }
  const result: { [key: string]: FinalFilterValueType[] } = {};
  Object.entries(geminiFilters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[key] = value.map((v) => ({
        id: v,
        text: v,
        selectionType: "INCLUDED",
      }));
    } else if (typeof value === "string" && value.trim()) {
      result[key] = [
        {
          id: value,
          text: value,
          selectionType: "INCLUDED",
        },
      ];
    }
  });

  return result;
}

interface CandidateType {
  firstName: string;
  fullName: string;
  geoRegion: string;
  profilePictureDisplayImage?: string;
  navigationUrl: string;
  summary?: string;
  currentPosition?: {
    title?: string;
    companyName?: string;
    companyUrnResolutionResult?: {
      companyPictureDisplayImage?: string;
      name?: string;
      industry?: string;
      location?: string;
    };
  };
}

export default function Candidates() {
  const [addfilter, setAddfilter] = useState<boolean>(false);
  const [addfiltervalue, setAddfiltervalue] = useState("Search Filter");
  const options: OptionType = {
    "Job Titles": [],
    Companies: [],
    Locations: [],
    "Seniority Level": [],
    "Postal Code": [],
    Years: [],
  };
  const [filterOptions, setFilterOptions] = useState<string[]>(
    Object.keys(options)
  );
  const [filters, setFilters] = useState<{
    [key: string]: FinalFilterValueType[];
  }>({});
  const [finalFilters, setFinalFilters] = useState<FinalFilterType[]>([]);
  const [candidates, setCandidates] = useState<CandidateType[]>([]);
  const sampleCandidates = [
        {
          firstName: "John",
          fullName: "John Smith",
          geoRegion: "San Francisco, California, United States",
          profilePictureDisplayImage: "https://via.placeholder.com/150",
          navigationUrl: "https://www.linkedin.com/in/john-smith",
          summary:
            "Senior MERN Stack Developer with 8+ years of experience building scalable web applications. Passionate about React, Node.js, and MongoDB optimization.",
          currentPosition: {
            title: "Senior MERN Stack Developer",
            companyName: "Tech Innovators Inc",
            companyUrnResolutionResult: {
              companyPictureDisplayImage: "https://via.placeholder.com/50",
              name: "Tech Innovators Inc",
              industry: "Information Technology & Services",
              location: "San Francisco, CA",
            },
          },
        },
        {
          firstName: "Sarah",
          fullName: "Sarah Johnson",
          geoRegion: "New York City, New York, United States",
          profilePictureDisplayImage: "https://via.placeholder.com/150",
          navigationUrl: "https://www.linkedin.com/in/sarah-johnson",
          summary:
            "Full-Stack Developer specializing in React and Node.js. Led development of 10+ production-grade applications with TypeScript and modern DevOps practices.",
          currentPosition: {
            title: "Lead Full-Stack Developer",
            companyName: "Digital Solutions Co",
            companyUrnResolutionResult: {
              companyPictureDisplayImage: "https://via.placeholder.com/50",
              name: "Digital Solutions Co",
              industry: "Software Development",
              location: "New York, NY",
            },
          },
        },
      ];

  useEffect(() => {
    const geminiFilters = JSON.parse(localStorage.getItem("filters") || "{}");
    const initialFilters = geminiToFilterState(geminiFilters);
    setFilters(initialFilters);
    const usedKeys = Object.keys(initialFilters);
    setFilterOptions((prev) => prev.filter((opt) => !usedKeys.includes(opt)));
    handleApplyFilters();
  }, []);

  function handleReset() {
    setFilters({});
    setFilterOptions(Object.keys(options));
    setAddfiltervalue("Search Filter");
    setAddfilter(false);
  }

  const handleApplyFilters = async () => {
    try {
      const newFilters: FinalFilterType[] = Object.entries(filters)
        .filter(([value]) => value.length > 0)
        .map(([label, value]) => ({
          type: label,
          values: value,
          selectedSubFilter: 50,
        }));
      setFinalFilters(newFilters);
      console.log("Final Filters: ", finalFilters);
      const res = await axios.post(
        "https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/premium_search_person",
        {
          account_number: 1,
          page: 1,
          filters: newFilters,
        },
        {
          headers: {
            // "x-rapidapi-key":
            //   "96b4f29bf1msh661286b0360612bp15ae2djsnd41d1373531a",
            "x-rapidapi-host":
              "linkedin-sales-navigator-no-cookies-required.p.rapidapi.com",
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response of candidate search: ", res);
      const data = res.data.response.data;

      setCandidates(data);
    } catch (error) {
      console.log("Error in applying filter candidate search: ", error);
    }
  };

  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-[#232323] to-[#18191a] text-gray-200 font-sans">
      <aside className="w-[340px] min-h-screen bg-black/60 border-r border-[#353535] px-6 py-8 flex flex-col gap-6">
        <div className="flex gap-3 mb-3">
          <button
            onClick={handleReset}
            className="flex-1 py-2 rounded-lg bg-[#d3d3d3] text-black font-semibold shadow-inner border border-[#bdbdbd] hover:bg-[#bdbdbd] transition"
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 py-2 rounded-lg bg-[#ededed] text-black font-semibold shadow shadow-inner border border-[#bdbdbd] hover:bg-[#d6d6d6] transition"
          >
            Apply Filters
          </button>
        </div>
        <div className="mb-2 relative">
          <label className="block text-gray-300 text-sm mb-1">
            Add Filters
          </label>
          <input
            placeholder={addfiltervalue}
            // value={addfiltervalue}
            className="w-full bg-[#232323] text-gray-200 border border-[#353535] rounded px-3 py-2 pr-8 appearance-none focus:outline-none"
            onClick={() => setAddfilter(!addfilter)}
          />
          {addfilter && (
            <ul>
              {filterOptions.map((option: string) => (
                <li
                  key={option}
                  className="px-4 py-2 hover:bg-[#232323] text-gray-100 text-sm-cursor-pointer transition"
                  onClick={() => {
                    setAddfiltervalue(option);
                    setAddfilter(false);
                    setFilters((prev) => ({
                      ...prev,
                      [option]: [],
                    }));
                    setFilterOptions(
                      filterOptions.filter((x: string) => x != option)
                    );
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
        {Object.keys(filters).map((filter) => (
          <div key={filter}>
            <Filters
              label={filter}
              selected={filters[filter]}
              onSelectedChange={(selected) =>
                setFilters((prev) => ({ ...prev, [filter]: selected }))
              }
            />
          </div>
        ))}
      </aside>

      <main className="flex-1 relative p-6 bg-gradient-to-br from-[#232323] to-[#18191a]">
          <button className="absolute top-4 right-4 z-10 px-5 py-1 rounded-md bg-[#ededed] text-black font-semibold shadow-inner border border-[#bdbdbd] hover:bg-[#d6d6d6] transition">
            Done
          </button>
          <div className="grid grid-cols-1 gap-6 mt-16">
            {sampleCandidates.map((cand, i) => (
              <div
                key={i}
                className="bg-[#232323] border border-[#353535] rounded-lg p-6 flex items-center gap-6"
              >
                <img
                  src={cand.profilePictureDisplayImage || ""}
                  alt={cand.fullName}
                  className="rounded-full mr-3 object-cover"
                  width={48}
                  height={48}
                />
                <div className="flex-1">
                  <a
                    href={cand.navigationUrl}
                    target="_blank"
                    className="text-lg front-semibold text-[#ededed] hover:underline"
                  >
                    {cand.fullName}
                  </a>
                  <div className="text-gray-400 text-sm">{cand.geoRegion}</div>
                  <div className="mt-1 text-gray-300 ">
                    <span className="font-medium">
                      {cand.currentPosition?.title}
                    </span>
                    {" at "}
                    <span className="font-medium">
                      {cand.currentPosition?.companyName}
                    </span>
                    {cand.currentPosition?.companyUrnResolutionResult
                      ?.companyPictureDisplayImage && (
                      <img
                        src={
                          cand.currentPosition.companyUrnResolutionResult
                            .companyPictureDisplayImage
                        }
                        alt={cand.currentPosition.companyName || ""}
                        className="inline-block ml-2 rounded"
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                  {cand.summary && (
                    <div className="text-gray-400 text-xs mt-2 line-clamp-3">
                      {cand.summary}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
      </main>
    </div>
  );
}
