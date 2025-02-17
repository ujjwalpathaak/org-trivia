import React, { useEffect, useState } from "react";
import { getAllOrgs } from "../../services";

const OrgSearch = ({ setFormData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [orgList, setOrgList] = useState([]);

  useEffect(() => {
    let cachedData = localStorage.getItem("cachedData");
    cachedData = cachedData ? JSON.parse(cachedData) : {};

    const fetchAllOrgs = async () => {
      try {
        const response = await getAllOrgs();
        const data = await response.json();

        const newCache = { ...cachedData, orgs: data.orgs };
        localStorage.setItem("cachedData", JSON.stringify(newCache));

        setOrgList(data.orgs);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    if (cachedData.orgs) {
      setOrgList(cachedData.orgs);
    } else {
      fetchAllOrgs();
    }
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      setFilteredOrgs(
        orgList.filter((org) =>
          org.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setFilteredOrgs([]);
    }
  };

  const selectOrganization = (org) => {
    setFormData((prev) => ({ ...prev, org: org._id }));
    setSearchTerm(org.name);
    setFilteredOrgs([]);
  };

  return (
    <div className="mb-5 relative">
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Organisation
      </label>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder="Search Organisation"
      />
      {filteredOrgs.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-lg shadow-lg">
          {filteredOrgs.map((org, index) => (
            <li
              key={index}
              onClick={() => selectOrganization(org)}
              className="p-2 cursor-pointer hover:bg-gray-200"
            >
              {org.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrgSearch;
