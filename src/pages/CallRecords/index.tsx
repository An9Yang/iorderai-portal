import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { mockCallRecords } from '../../mock/data';
import type { CallRecord } from '../../types';
import CallDetailModal from './CallDetailModal';

const CallRecords: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCallWindows, setActiveCallWindows] = useState<Set<string>>(new Set());
  const pageSize = 10;

  const handleGoToOrder = (orderId: string) => {
    navigate(`/orders?highlight=${orderId}`);
  };

  // Sort by time, newest first
  const sortedCalls = useMemo(() => {
    return [...mockCallRecords].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, []);

  const filteredCalls = useMemo(() => {
    return sortedCalls.filter(call => {
      const matchesSearch = call.callerPhone.includes(searchTerm) || 
        call.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
      const matchesDate = !dateFilter || call.startTime.startsWith(dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [sortedCalls, searchTerm, statusFilter, dateFilter]);

  const paginatedCalls = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCalls.slice(start, start + pageSize);
  }, [filteredCalls, currentPage]);

  const totalPages = Math.ceil(filteredCalls.length / pageSize);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      missed: 'bg-red-100 text-red-700',
      in_progress: 'bg-blue-100 text-blue-700 animate-pulse',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {t(`callRecords.status.${status}`)}
      </span>
    );
  };

  const toggleCallWindow = (callId: string) => {
    setActiveCallWindows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(callId)) {
        newSet.delete(callId);
      } else {
        newSet.add(callId);
      }
      return newSet;
    });
  };

  // Group calls by caller phone for multi-window display
  const groupedCalls = useMemo(() => {
    const groups: Record<string, CallRecord[]> = {};
    filteredCalls.forEach(call => {
      if (!groups[call.callerPhone]) {
        groups[call.callerPhone] = [];
      }
      groups[call.callerPhone].push(call);
    });
    return groups;
  }, [filteredCalls]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{t('callRecords.title')}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredCalls.length} {t('callRecords.totalCalls')}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('callRecords.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('common.all')} {t('callRecords.callStatus')}</option>
            <option value="completed">{t('callRecords.status.completed')}</option>
            <option value="missed">{t('callRecords.status.missed')}</option>
            <option value="in_progress">{t('callRecords.status.in_progress')}</option>
          </select>

          {/* Date filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Reset */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('');
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('common.reset')}
          </button>
        </div>
      </div>

      {/* Active Call Windows (Multi-window preview) */}
      {activeCallWindows.size > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {t('callRecords.activeWindows')} ({activeCallWindows.size})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from(activeCallWindows).map(callId => {
              const call = mockCallRecords.find(c => c.id === callId);
              if (!call) return null;
              return (
                <div
                  key={call.id}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCall(call)}
                >
                  {/* Mini Header */}
                  <div className="bg-blue-500 text-white px-3 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{call.callerPhone}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCallWindow(call.id);
                      }}
                      className="p-1 hover:bg-blue-600 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Mini Chat Preview */}
                  <div className="p-3 h-32 overflow-y-auto space-y-2">
                    {call.transcript.slice(-3).map(msg => (
                      <div
                        key={msg.id}
                        className={`text-xs ${msg.role === 'customer' ? 'text-left' : 'text-right'}`}
                      >
                        <span className={`inline-block px-2 py-1 rounded-lg max-w-[90%] truncate ${
                          msg.role === 'customer' 
                            ? 'bg-gray-200 text-gray-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {msg.content.length > 30 ? msg.content.slice(0, 30) + '...' : msg.content}
                        </span>
                      </div>
                    ))}
                    {call.transcript.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">{t('callRecords.noTranscript')}</p>
                    )}
                  </div>
                  
                  {/* Mini Footer */}
                  <div className="px-3 py-2 border-t border-gray-200 bg-white flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatDuration(call.duration)}</span>
                    {getStatusBadge(call.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calls table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setActiveCallWindows(new Set(paginatedCalls.map(c => c.id)));
                      } else {
                        setActiveCallWindows(new Set());
                      }
                    }}
                    checked={paginatedCalls.length > 0 && paginatedCalls.every(c => activeCallWindows.has(c.id))}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('callRecords.callId')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('callRecords.callerPhone')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('callRecords.callTime')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('callRecords.duration')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('callRecords.callStatus')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('callRecords.relatedOrder')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('orders.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={activeCallWindows.has(call.id)}
                      onChange={() => toggleCallWindow(call.id)}
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-blue-600">{call.id}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {call.callerPhone}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{formatDateTime(call.startTime)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatDuration(call.duration)}</td>
                  <td className="px-4 py-4">{getStatusBadge(call.status)}</td>
                  <td className="px-4 py-4 text-sm">
                    {call.orderId ? (
                      <button
                        onClick={() => handleGoToOrder(call.orderId!)}
                        className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800 hover:underline group"
                      >
                        {call.orderId}
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedCall(call)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {t('callRecords.viewTranscript')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredCalls.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="mt-4 text-gray-500">{t('common.noData')}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {filteredCalls.length} {t('callRecords.totalCalls')}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ←
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
};

export default CallRecords;

