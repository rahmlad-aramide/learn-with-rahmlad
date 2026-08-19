"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNotifications } from "@/hooks/useNotifications";
import {
  BellIcon,
  TrophyIcon,
  BookOpenIcon,
  CalendarIcon,
  NewspaperIcon,
} from "lucide-react";

function typeIcon(type: string) {
  switch (type) {
    case "achievement":
      return <TrophyIcon size={16} className="text-yellow-500" />;
    case "progress":
      return <BookOpenIcon size={16} className="text-blue-500" />;
    case "reminder":
      return <CalendarIcon size={16} className="text-purple-500" />;
    default:
      return <NewspaperIcon size={16} className="text-gray-400" />;
  }
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markRead } = useNotifications(10);

  const handleOpen = () => {
    setIsOpen((v) => !v);
  };

  const handleClose = () => setIsOpen(false);

  const handleItemClick = (id: string, isRead: boolean) => {
    if (!isRead) markRead(id);
    handleClose();
  };

  return (
    <div className="relative">
      <button
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleOpen}
      >
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0 z-10 flex h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          </span>
        )}
        <BellIcon size={20} />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={handleClose}
        className="shadow-theme-lg dark:bg-gray-dark absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 sm:w-[361px] lg:right-0 dark:border-gray-800"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                {unreadCount}
              </span>
            )}
          </h5>
          <button
            onClick={handleClose}
            className="dropdown-toggle text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto mb-3">
          {notifications.length === 0 ? (
            <li className="flex flex-1 h-full items-center justify-center py-10 text-sm text-gray-400">
              No notifications yet
            </li>
          ) : (
            notifications.map((n) => (
              <li key={n.id}>
                <DropdownItem
                  onItemClick={() => handleItemClick(n.id, n.is_read)}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 px-4 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${!n.is_read ? "bg-orange-50 dark:bg-orange-500/5" : ""}`}
                >
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    {typeIcon(n.type)}
                  </span>
                  <span className="block min-w-0">
                    <span
                      className={`block truncate text-sm font-medium ${n.is_read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}
                    >
                      {n.title}
                    </span>
                    {n.message && (
                      <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                        {n.message}
                      </span>
                    )}
                    <span className="mt-1 block text-xs text-gray-400">
                      {relativeTime(n.created_at)}
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>

        <Link
          href="/notifications"
          onClick={handleClose}
          className="mt-auto block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
