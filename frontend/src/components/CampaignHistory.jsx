import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import React from "react";

export default function CampaignHistory() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/campaigns`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "sending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "sending":
        return "Sending";
      case "pending":
        return "Pending";
      default:
        return "Failed";
    }
  };

  const getDeliveryRate = (sent, total) => {
    if (total === 0) return 0;
    return Math.round((sent / total) * 100);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Campaign History
            </h1>
            <p className="mt-2 text-gray-600">
              Track your campaign performance and delivery stats
            </p>
          </div>
          <Link
            to="/campaigns/create"
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Users className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No campaigns yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first campaign.
            </p>
            <div className="mt-6">
              <Link
                to="/campaigns/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <li key={campaign._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(campaign.status)}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {campaign.message.substring(0, 100)}
                            {campaign.message.length > 100 ? "..." : ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-6">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {campaign.audienceSize} recipients
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                          {campaign.sentCount} sent
                        </div>
                        {campaign.failedCount > 0 && (
                          <div className="flex items-center">
                            <XCircle className="w-4 h-4 mr-1 text-red-500" />
                            {campaign.failedCount} failed
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "sending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStatusText(campaign.status)}
                      </span>

                      {campaign.status === "completed" && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {getDeliveryRate(
                              campaign.sentCount,
                              campaign.audienceSize
                            )}
                            % delivered
                          </div>
                          <div className="text-xs text-gray-500">
                            {campaign.sentCount} of {campaign.audienceSize}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
