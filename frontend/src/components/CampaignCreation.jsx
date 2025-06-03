import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Eye, Send } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";

export default function CampaignCreation() {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [rules, setRules] = useState([
    { id: "1", field: "totalSpends", operator: ">", value: "", logic: "AND" },
  ]);
  const [audienceSize, setAudienceSize] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const fieldOptions = [
    { value: "totalSpends", label: "Total Spends (₹)" },
    { value: "visits", label: "Number of Visits" },
    { value: "lastVisit", label: "Days Since Last Visit" },
  ];

  const operatorOptions = [
    { value: ">", label: "Greater than" },
    { value: "<", label: "Less than" },
    { value: ">=", label: "Greater than or equal" },
    { value: "<=", label: "Less than or equal" },
    { value: "=", label: "Equal to" },
  ];

  const addRule = () => {
    const newRule = {
      id: Date.now().toString(),
      field: "totalSpends",
      operator: ">",
      value: "",
      logic: "AND",
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id) => {
    if (rules.length > 1) {
      setRules(rules.filter((rule) => rule.id !== id));
    }
  };

  const updateRule = (id, updates) => {
    setRules(
      rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  };

  const previewAudience = async () => {
    setIsPreviewLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/campaigns/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ rules }),
        }
      );

      const data = await response.json();
      setAudienceSize(data.count);
    } catch (error) {
      toast.error("Error previewing audience");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!campaignName.trim() || !message.trim()) {
      toast.error("Please fill in campaign name and message");
      return;
    }

    if (rules.some((rule) => !rule.value.trim())) {
      toast.error("Please fill in all rule values");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/campaigns`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: campaignName,
            message,
            rules,
            audienceSize,
          }),
        }
      );

      if (response.ok) {
        toast.success("Campaign created and messages are being sent!");
        navigate("/campaigns/history");
      } else {
        toast.error("Failed to create campaign");
      }
    } catch (error) {
      toast.error("Error creating campaign");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
          <p className="mt-2 text-gray-600">
            Define your audience and create personalized campaigns
          </p>
        </div>

        <div className="space-y-6">
          {/* Campaign Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Campaign Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message Template
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hi {name}, here's a special offer for you!"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use {"{name}"} to personalize with customer names
                </p>
              </div>
            </div>
          </div>

          {/* Audience Rules */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Audience Rules
            </h3>
            <div className="space-y-4">
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    {index > 0 && (
                      <select
                        value={rule.logic}
                        onChange={(e) =>
                          updateRule(rule.id, { logic: e.target.value })
                        }
                        className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    )}

                    <select
                      value={rule.field}
                      onChange={(e) =>
                        updateRule(rule.id, { field: e.target.value })
                      }
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {fieldOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) =>
                        updateRule(rule.id, { operator: e.target.value })
                      }
                      className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {operatorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={rule.value}
                      onChange={(e) =>
                        updateRule(rule.id, { value: e.target.value })
                      }
                      className="w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Value"
                    />

                    {rules.length > 1 && (
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={addRule}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Rule
              </button>
            </div>
          </div>

          {/* Audience Preview */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Audience Preview
              </h3>
              <button
                onClick={previewAudience}
                disabled={isPreviewLoading}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewLoading ? "Loading..." : "Preview Audience"}
              </button>
            </div>

            {audienceSize !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800">
                  <span className="font-semibold">{audienceSize}</span>{" "}
                  customers match your criteria
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate("/campaigns/history")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={createCampaign}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Send className="w-4 h-4 mr-2" />
              Create & Send Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
