import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  // Mock data for development or fallback
  const getMockCustomers = () => {
    return [
      {
        _id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "555-123-4567",
        totalSpends: 1250.75,
        visits: 5,
        status: "active",
        lastVisit: new Date().toISOString(),
      },
      {
        _id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "555-987-6543",
        totalSpends: 2340.5,
        visits: 8,
        status: "active",
        lastVisit: new Date().toISOString(),
      },
      {
        _id: "3",
        name: "Robert Johnson",
        email: "robert@example.com",
        phone: "555-567-8901",
        totalSpends: 890.25,
        visits: 3,
        status: "inactive",
        lastVisit: new Date().toISOString(),
      },
    ];
  };

  useEffect(() => {
    fetchCustomers();
  }, []);
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      // Get token from local storage
      const token = localStorage.getItem("token");

      // Make sure we have a BASE_URL
      const BASE_URL = import.meta.env.VITE_API_URL || "";

      try {
        // Make API request with proper authorization header
        const response = await axios.get(`${BASE_URL}/api/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Make sure response.data is an array
        if (Array.isArray(response.data)) {
          setCustomers(response.data);
        } else {
          console.warn("API did not return an array, using mock data instead");
          setCustomers(getMockCustomers());
        }
      } catch (apiError) {
        console.warn("API request failed, using mock data:", apiError);
        // Use mock data in development or if API fails
        setCustomers(getMockCustomers());
      }

      setLoading(false);
    } catch (error) {
      console.error("Critical error in fetchCustomers:", error);
      // Ensure customers is always an array even in case of errors
      setCustomers([]);
      toast.error("Failed to load customers");
      setLoading(false);
    }
  };

  // Ensure customers is an array before filtering
  const filteredCustomers = Array.isArray(customers)
    ? customers.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm)
      )
    : [];
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Phone</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{customer.name}</td>
                    <td className="py-2 px-4 border-b">{customer.email}</td>
                    <td className="py-2 px-4 border-b">{customer.phone}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          customer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.status || "N/A"}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        onClick={() => {
                          /* View customer details */
                        }}
                      >
                        View
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-800"
                        onClick={() => {
                          /* Edit customer */
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center">
                    {searchTerm
                      ? "No customers match your search"
                      : "No customers found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;
