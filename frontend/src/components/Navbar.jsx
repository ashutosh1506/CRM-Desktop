import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Users, Database, Target, History, LogOut, User } from "lucide-react";
import React from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigation = [
    { name: "Dashboard", href: "/", icon: Users },
    { name: "Data Ingestion", href: "/data-ingestion", icon: Database },
    { name: "Create Campaign", href: "/campaigns/create", icon: Target },
    { name: "Campaign History", href: "/campaigns/history", icon: History },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Xeno CRM</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user?.picture && (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.picture || "/placeholder.svg"}
                  alt={user.name}
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
