import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Mock data for development or fallback
  const getMockOrders = () => {
    return [
      {
        _id: "1",
        customerEmail: "john@example.com",
        amount: 249.99,
        date: "2025-05-25T14:35:00Z",
        items: ["Product A", "Product B"],
        createdAt: "2025-05-25T14:35:00Z",
      },
      {
        _id: "2",
        customerEmail: "jane@example.com",
        amount: 599.99,
        date: "2025-06-01T09:15:00Z",
        items: ["Product C", "Product D", "Product E"],
        createdAt: "2025-06-01T09:15:00Z",
      },
      {
        _id: "3",
        customerEmail: "robert@example.com",
        amount: 129.5,
        date: "2025-05-28T16:42:00Z",
        items: ["Product F"],
        createdAt: "2025-05-28T16:42:00Z",
      },
    ];
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Get token from local storage
      const token = localStorage.getItem("token");

      // Make sure we have a BASE_URL
      const BASE_URL = import.meta.env.VITE_API_URL || "";

      try {
        // First, try to get data from the API
        const response = await axios.get(`${BASE_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Make sure response.data is an array
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.warn("API did not return an array, using mock data instead");
          setOrders(getMockOrders());
        }
      } catch (apiError) {
        console.warn("API request failed, using mock data:", apiError);
        // Use mock data in development or if API fails
        setOrders(getMockOrders());

        // Only show toast error in production
        if (import.meta.env.PROD) {
          toast.error("Failed to load orders from server");
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Critical error in fetchOrders:", error);
      // Ensure orders is always an array even in case of errors
      setOrders([]);
      toast.error("Failed to load orders");
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format amount for display
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Ensure orders is an array before filtering
  const filteredOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order.customerEmail
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.items?.some((item) =>
            item.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          formatAmount(order.amount).includes(searchTerm)
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
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
          placeholder="Search orders..."
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
                <th className="py-2 px-4 border-b text-left">Order Date</th>
                <th className="py-2 px-4 border-b text-left">Customer</th>
                <th className="py-2 px-4 border-b text-left">Amount</th>
                <th className="py-2 px-4 border-b text-left">Items</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {formatDate(order.date)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {order.customerEmail}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatAmount(order.amount)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {order.items && order.items.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {order.items.slice(0, 3).map((item, index) => (
                            <li key={index} className="text-sm">
                              {item}
                            </li>
                          ))}
                          {order.items.length > 3 && (
                            <li className="text-sm text-gray-500">
                              +{order.items.length - 3} more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-gray-400">No items</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        onClick={() => {
                          /* View order details */
                        }}
                      >
                        View
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-800"
                        onClick={() => {
                          /* Print order */
                        }}
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center">
                    {searchTerm
                      ? "No orders match your search"
                      : "No orders found"}
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

export default Orders;
