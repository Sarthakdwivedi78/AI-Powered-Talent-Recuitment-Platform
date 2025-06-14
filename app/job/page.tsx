"use client";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

interface FilterType {
  [key: string]: string | string[];
}

export default function ReviewJobDescription() {
  const [jobDescription, setJobDescription] = useState("");
  const [filters, setFilters] = useState<FilterType>({});
  const [editPrompt, setEditPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const userPrompt = localStorage.getItem("prompt");
  const geminiPrompt = `
You are an expert technical recruiter. Based on the following user input, generate a detailed, professional job description for a tech role.

User Input: ${editPrompt === "" ? userPrompt : '${userPrompt}${editPrompt}'}

Format the job description as follows:
- Job Title
- Location
- Type (e.g., Full-Time, Part-Time, Contract)
- Experience Level (e.g., Mid-level, Senior, etc.)
- About Us: A brief company description (invent if not provided).
- A short summary inviting candidates to apply.
- What You'll Do: A bulleted list of 4-6 key responsibilities.
- (Optional) Qualifications or skills if mentioned by user.

Then, output a JSON object with the following fields:
{
  "job_description": "...full job description as plain text...",
  "filters": {
    "job_role": "...",
    "positions": "...",
    "years_of_experience": "...",
    "work_type": "...",
    "annual_salary_range": "...",
    "max_notice_period": "...",
    "job_location": "...",
    "closing_date": "...",
    "skills_tags": ["...", "..."],
    "search_tags": ["...", "..."]
  }
}
Return only the JSON object, no extra text.
`;

  const handleJobGeneration = async () => {
    setLoading(true);
    setError(null);

    try {
      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        maxOutputTokens: 2048,
        apiKey: "AIzaSyB9fRa0J9FwSb2jMeuvoAlR5jD5AsjDSFs",
      });

      const res = await model.invoke(["human", geminiPrompt]);
      console.log("Gemini response: ", res);
      console.log("Content response: ", res.content);
      let text = res.content.toString();
      text = text.replace(/^```json\s*/i, "");
      text = text.replace(/```\s*$/, "");
      text = text.trim();
      let parsed = null;
      try {
        parsed = JSON.parse(text);
        console.log("Result of parse: ", parsed);
        console.log("Parsed job description: ", parsed?.job_description);
        console.log("Parsed filters: ", parsed?.filters);
        setJobDescription(parsed?.job_description);
        setFilters(parsed?.filters);
        localStorage.setItem("filters", JSON.stringify(filters));
      } catch (error) {
        console.log("Error in parse: ", error);
        setError("Could not parse gemini response");
      }
    } catch (error) {
      console.log("Error in model response: ", error);
      setError("Error generating job description");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleJobGeneration();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15171a] to-[#18191a] flex flex-col">
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#232323]">
        <button onClick={()=>router.push("/")} className="text-2xl text-gray-300 hover:text-white">
          &larr;
        </button>
        <span className="text-gray-400 text-xs">Last Saved 4:00AM Jun 8</span>
        <button
          onClick={() => router.push("/candidates")}
          className="px-6 py-2 rounded-md bg-[#ededed] text-black font-semibold shadow-inner border border-[#bdbdbd] hover:bg-[#d6d6d6] transition"
        >
          Submit
        </button>
      </div>
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col justify-start p-12 pr-8">
          <div className="bg-[#18191a] border border-[#232323] rounded-xl shadow-lg w-full h-full p-8 mb-4">
            {loading ? (
              <div className="text-gray-400">Generating job description...</div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : (
              <div className="text-gray-100 text-sm font-mono">
                <ReactMarkdown>{jobDescription}</ReactMarkdown>
              </div>
            )}
          </div>
          <div className="w-full flex items-center border border-[#232323] rounded-lg bg-[#232323] px-4 py-2 mt-2">
            <input
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="flex-1 bg-transparent text-gray-200 focus:outline-none"
              placeholder="Give prompt to edit..."
            />
            <button
              className="ml-2 text-gray-400 hover:text-white text-lg"
              onClick={handleJobGeneration}
              disabled={loading}
            >
              &#8594;
            </button>
          </div>
        </div>

        <div className="w-[400px] bg-[#18191a] border-l border-[#232323] px-8 py-8 flex flex-col gap-4">
          {Object.keys(filters).map((filter) => (
            <div key={filter} className="mb-4">
              <label className="block text-gray-400 text-xs mb-1">
                {filter}
              </label>
              <input
                className="w-full bg-[#232323] text-gray-100 rounded px-3 py-2 border border-[#353535]"
                value={filters[filter]}
                readOnly
              />
            </div>
          ))}
          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1">
              Skills Tags (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(filters.skills_tags) &&
                filters.skills_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-[#232323] text-gray-100 px-3 py-1 rounded-full text-xs border border-[#353535]"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">
              Search Tags (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(filters.search_tags) &&
                filters.search_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-[#232323] text-gray-100 px-3 py-1 rounded-full text-xs border border-[#353535]"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
