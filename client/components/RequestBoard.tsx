'use client';

import { useState, useEffect } from 'react';
import { OracleRequest } from '@/types';
import { mockRequests } from '@/lib/mock-data';
import { Clock, Filter, RefreshCw, ArrowUpDown, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RequestBoardProps {
  activeTab: string;
}

export default function RequestBoard({ activeTab }: RequestBoardProps) {
  const [requests, setRequests] = useState<OracleRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<OracleRequest[]>([]);
  const [sortBy, setSortBy] = useState<'createdAt' | 'deadline' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadRequests();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [requests, sortBy, sortOrder, statusFilter, domainFilter, activeTab]);

  const loadRequests = async () => {
    setIsRefreshing(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock: Add some randomness to simulate real-time updates
    const updatedRequests = mockRequests.map(req => ({
      ...req,
      // Simulate some status changes
      status: Math.random() > 0.9 && req.status === 'pending' ? 'proposed' : req.status
    }));
    
    setRequests(updatedRequests);
    setIsRefreshing(false);
  };

  const filterAndSortRequests = () => {
    let filtered = [...requests];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Filter by domain
    if (domainFilter !== 'all') {
      filtered = filtered.filter(req => req.domain === domainFilter);
    }

    // Filter by active tab
    if (activeTab !== 'all') {
      if (activeTab === 'token-prices') {
        filtered = filtered.filter(req => req.domain === 'token-price');
      } else if (activeTab === 'sports-scores') {
        filtered = filtered.filter(req => req.domain === 'sports-score');
      } else if (activeTab === 'unresolved') {
        filtered = filtered.filter(req => ['pending', 'proposed', 'disputed'].includes(req.status));
      } else if (activeTab === 'resolved') {
        filtered = filtered.filter(req => ['resolved', 'validated'].includes(req.status));
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
      }
      if (typeof bVal === 'string') {
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredRequests(filtered);
  };

  const handleSort = (column: 'createdAt' | 'deadline' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500 blinking" />;
      case 'proposed': return <span className="text-blue-500">●</span>;
      case 'resolved': return <span className="text-green-500">✓</span>;
      case 'disputed': return <span className="text-red-500">⚠</span>;
      case 'validated': return <span className="text-blue-500">✓</span>;
      default: return <span>○</span>;
    }
  };

  const formatDeadline = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff < 0) {
      return <span className="text-red-500">EXPIRED</span>;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return <span className="text-yellow-500">{hours}h {minutes}m</span>;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <div className="terminal-box p-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold terminal-glow">
            ORACLE REQUEST BOARD
          </h2>
          <div className="text-sm text-gray-400">
            // {filteredRequests.length} requests
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
          <button
            onClick={loadRequests}
            disabled={isRefreshing}
            className="retro-button flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm">FILTERS:</span>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="retro-select text-sm"
        >
          <option value="all">ALL STATUS</option>
          <option value="pending">PENDING</option>
          <option value="proposed">PROPOSED</option>
          <option value="resolved">RESOLVED</option>
          <option value="disputed">DISPUTED</option>
          <option value="validated">VALIDATED</option>
        </select>

        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="retro-select text-sm"
        >
          <option value="all">ALL DOMAINS</option>
          <option value="token-price">TOKEN PRICE</option>
          <option value="sports-score">SPORTS SCORE</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="terminal-table">
          <thead>
            <tr>
              <th className="text-left">ID</th>
              <th className="text-left">DOMAIN</th>
              <th className="text-left">REQUESTER</th>
              <th className="text-left">QUESTION</th>
              <th className="text-left">PROPOSED ANSWER</th>
              <th className="text-left cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center space-x-1">
                  <span>STATUS</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left cursor-pointer" onClick={() => handleSort('deadline')}>
                <div className="flex items-center space-x-1">
                  <span>DEADLINE</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-green-500 hover:bg-opacity-10">
                <td className="font-mono text-sm">{request.id.slice(-6)}</td>
                <td>
                  <span className="text-xs px-2 py-1 border border-green-500 rounded uppercase">
                    {request.domain.replace('-', ' ')}
                  </span>
                </td>
                <td className="font-mono text-xs">{formatAddress(request.requester)}</td>
                <td className="max-w-xs truncate">{request.question}</td>
                <td className="text-yellow-500">{request.proposedAnswer || '---'}</td>
                <td>
                  <div className={`flex items-center space-x-2 status-${request.status}`}>
                    {getStatusIcon(request.status)}
                    <span className="uppercase text-sm">{request.status}</span>
                  </div>
                </td>
                <td>{formatDeadline(request.deadline)}</td>
                <td>
                  <button
                    onClick={() => router.push(`/request/${request.id}`)}
                    className="retro-button-blue text-xs px-2 py-1 flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>VIEW</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">// NO REQUESTS FOUND</div>
          <div className="text-sm text-gray-500">
            {statusFilter !== 'all' || domainFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'No requests available at the moment'
            }
          </div>
        </div>
      )}
    </div>
  );
}