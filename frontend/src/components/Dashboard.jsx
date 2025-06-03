import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, ShoppingCart, Target, TrendingUp } from "lucide-react";
import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalCampaigns: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(
        "Failed to load dashboard data. Please check your connection and try again."
      );

      // Set fallback demo data for better UX
      setStats({
        totalCustomers: 248,
        totalOrders: 1342,
        totalCampaigns: 6,
        recentActivity: 27,
      });
    } finally {
      setLoading(false);
    }
  };

  // Define statCards properly using stats data
  const statCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-blue-500",
      link: "/customers",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-500",
      link: "/orders",
    },
    {
      title: "Active Campaigns",
      value: stats.totalCampaigns,
      icon: Target,
      color: "bg-purple-500",
      link: "/campaigns",
    },
    {
      title: "Recent Activities",
      value: stats.recentActivity,
      icon: TrendingUp,
      color: "bg-orange-500",
      link: "/activities",
    },
  ];

  // Add debugging console logs
  // console.log("User authenticated:", !!user);
  // console.log("Stats data:", stats);
  // console.log("StatCards array:", statCards);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to your CRM platform overview
            {user && user.name ? `, ${user.name}` : ""}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to={card.link}
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`${card.color} p-3 rounded-md`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {card.title}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {card.value.toLocaleString()}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Recent activity section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {/* You would map through actual activity data here */}
                <li className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      New customer signed up
                    </p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </li>
                <li className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      New order placed
                    </p>
                    <p className="text-sm text-gray-500">4 hours ago</p>
                  </div>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
