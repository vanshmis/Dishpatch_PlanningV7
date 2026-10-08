import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Search,
  Download,
  Plus,
  FileSpreadsheet,
  Building2,
  MapPin,
  FileCheck2,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  Truck,
  IndianRupee,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { dispatchService } from '../services/api';
import { KBOrder } from '../types';

export const KBOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<KBOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedPIFilter, setSelectedPIFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [selectedOrderForChallan, setSelectedOrderForChallan] = useState<KBOrder | null>(null);
  const [challanInput, setChallanInput] = useState('');
  const [applyToWholePI, setApplyToWholePI] = useState(true);

  // New Order Form state
  const [newOrder, setNewOrder] = useState({
    timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    piNo: '',
    partyName: 'Kendriya Bhandar - Head Office',
    orderNo: '',
    itemName: '',
    qty: 1,
    amount: 0,
    billingAddress: 'Pushpa Bhawan Madangir Road New Delhi',
    supplyNameAddress: '',
    challanNo: '',
  });

  useEffect(() => {
    const loadOrders = () => {
      setOrders(dispatchService.getKBOrders());
    };
    loadOrders();
    const unsub = dispatchService.subscribe(loadOrders);
    return () => unsub();
  }, []);

  // Unique PIs list for filter
  const uniquePIs = useMemo(() => {
    const set = new Set(orders.map((o) => o.piNo).filter(Boolean));
    return Array.from(set);
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }
      // PI filter
      if (selectedPIFilter !== 'ALL' && order.piNo !== selectedPIFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          order.piNo.toLowerCase().includes(query) ||
          order.orderNo.toLowerCase().includes(query) ||
          order.partyName.toLowerCase().includes(query) ||
          order.itemName.toLowerCase().includes(query) ||
          (order.challanNo && order.challanNo.toLowerCase().includes(query)) ||
          order.supplyNameAddress.toLowerCase().includes(query) ||
          order.billingAddress.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [orders, statusFilter, selectedPIFilter, searchQuery]);

  // KPI Calculations
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  // Handle Challan Update
  const handleOpenChallanModal = (order: KBOrder) => {
    setSelectedOrderForChallan(order);
    setChallanInput(order.challanNo || '');
    setApplyToWholePI(true);
    setIsChallanModalOpen(true);
  };

  const handleSaveChallan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForChallan) return;

    if (applyToWholePI && selectedOrderForChallan.piNo) {
      dispatchService.updateKBOrdersChallanByPI(selectedOrderForChallan.piNo, challanInput);
    } else {
      dispatchService.updateKBOrderChallan(selectedOrderForChallan.id, challanInput);
    }

    setIsChallanModalOpen(false);
    setSelectedOrderForChallan(null);
    setChallanInput('');
  };

  // Handle Add New Order Submit
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.piNo || !newOrder.orderNo || !newOrder.itemName) {
      alert('Please fill in required fields: PI No, Order No, and Item Name.');
      return;
    }

    dispatchService.addKBOrder({
      timestamp: newOrder.timestamp || new Date().toLocaleDateString('en-GB'),
      piNo: newOrder.piNo.trim(),
      partyName: newOrder.partyName.trim(),
      orderNo: newOrder.orderNo.trim(),
      itemName: newOrder.itemName.trim(),
      qty: Number(newOrder.qty) || 1,
      amount: Number(newOrder.amount) || 0,
      billingAddress: newOrder.billingAddress.trim(),
      supplyNameAddress: newOrder.supplyNameAddress.trim(),
      challanNo: newOrder.challanNo.trim(),
    });

    setIsAddModalOpen(false);
    setNewOrder({
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      piNo: '',
      partyName: 'Kendriya Bhandar - Head Office',
      orderNo: '',
      itemName: '',
      qty: 1,
      amount: 0,
      billingAddress: 'Pushpa Bhawan Madangir Road New Delhi',
      supplyNameAddress: '',
      challanNo: '',
    });
  };

  // Handle Delete
  const handleDelete = (id: string, orderNo: string) => {
    if (window.confirm(`Are you sure you want to remove item from order ${orderNo}?`)) {
      dispatchService.deleteKBOrder(id);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'PI no',
      'Party Name',
      'Order no',
      'Item name',
      'QTY',
      'Amount',
      'Billing Address',
      'Supply Name and Address',
      'Challan No',
      'Status',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.timestamp}"`,
      `"${o.piNo}"`,
      `"${o.partyName}"`,
      `"${o.orderNo}"`,
      `"${o.itemName}"`,
      o.qty,
      o.amount,
      `"${o.billingAddress}"`,
      `"${o.supplyNameAddress}"`,
      `"${o.challanNo || ''}"`,
      `"${o.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KB_Orders_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Kb Orders Registry
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-amber-700" />
              Kendriya Bhandar Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and process Key Account & KB specialized sales order dispatches, manage Challan numbers, and monitor fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            title="Download CSV Report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add New KB Order</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Card 1: Total Orders */}
        <div
          onClick={() => {
            setStatusFilter('ALL');
            setSelectedPIFilter('ALL');
          }}
          className={`p-3 bg-white rounded-xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            statusFilter === 'ALL' ? 'border-slate-400 ring-2 ring-slate-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block">
              Total KB Orders
            </span>
            <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{totalOrdersCount} Items</span>
            <span className="text-[10px] text-slate-500 font-medium">All registered items</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Pending Processing */}
        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`p-3 bg-white rounded-xl border transition-all cursor-pointer shadow-xs flex items-center justify-between border-l-4 border-l-amber-500 ${
            statusFilter === 'PENDING' ? 'ring-2 ring-amber-200 border-amber-400' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-amber-800 uppercase font-bold text-[9px] tracking-wider block">
              Pending Challan
            </span>
            <span className="text-lg font-extrabold text-amber-700 mt-0.5 block">{pendingOrders.length} Pending</span>
            <span className="text-[10px] text-amber-600 font-medium">Challan generation required</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Completed Orders */}
        <div
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-3 bg-white rounded-xl border transition-all cursor-pointer shadow-xs flex items-center justify-between border-l-4 border-l-emerald-500 ${
            statusFilter === 'COMPLETED' ? 'ring-2 ring-emerald-200 border-emerald-400' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-emerald-800 uppercase font-bold text-[9px] tracking-wider block">
              Completed Orders
            </span>
            <span className="text-lg font-extrabold text-emerald-700 mt-0.5 block">{completedOrders.length} Completed</span>
            <span className="text-[10px] text-emerald-600 font-medium">Challan mapped & dispatched</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Total Value */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block">
              Total Order Value
            </span>
            <span className="text-lg font-extrabold text-blue-900 mt-0.5 block">
              ₹{(totalAmount / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Pending: ₹{(pendingAmount / 1000).toFixed(1)}k</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100 font-bold">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pending ({pendingOrders.length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed ({completedOrders.length})</span>
            </button>
          </div>

          {/* Search & PI Filter */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* PI Selector */}
            <select
              value={selectedPIFilter}
              onChange={(e) => setSelectedPIFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All PI Numbers ({uniquePIs.length})</option>
              {uniquePIs.map((pi) => (
                <option key={pi} value={pi}>
                  {pi}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PI, Order, Item, Challan..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">PI No</th>
                <th className="py-3 px-3">Party Name</th>
                <th className="py-3 px-3">Order No</th>
                <th className="py-3 px-3">Item Name</th>
                <th className="py-3 px-2 text-right">QTY</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
                <th className="py-3 px-3">Billing Address</th>
                <th className="py-3 px-3">Supply Name & Address</th>
                <th className="py-3 px-3">Challan No</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-xs">No KB orders matching current filters</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing filters or search query</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const isCompleted = order.status === 'COMPLETED';
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !isCompleted ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* # Index */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap text-[11px]">
                        {order.timestamp}
                      </td>

                      {/* PI No */}
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-800 whitespace-nowrap text-[11.5px]">
                        {order.piNo}
                      </td>

                      {/* Party Name */}
                      <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap text-[11px]">
                        {order.partyName}
                      </td>

                      {/* Order No */}
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap text-[11px]">
                        {order.orderNo}
                      </td>

                      {/* Item Name */}
                      <td className="py-2.5 px-3 font-semibold text-slate-800 min-w-[180px]">
                        {order.itemName}
                      </td>

                      {/* QTY */}
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                          {order.qty}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        ₹{order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Billing Address */}
                      <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate text-[10.5px]" title={order.billingAddress}>
                        {order.billingAddress}
                      </td>

                      {/* Supply Name and Address */}
                      <td className="py-2.5 px-3 text-slate-700 max-w-[200px] text-[10.5px]" title={order.supplyNameAddress}>
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.supplyNameAddress}</span>
                        </div>
                      </td>

                      {/* Challan No */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {order.challanNo ? (
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10.5px] bg-indigo-50 text-indigo-800 border border-indigo-200">
                              {order.challanNo}
                            </span>
                            <button
                              onClick={() => handleOpenChallanModal(order)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                              title="Edit Challan No"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenChallanModal(order)}
                            className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-[10.5px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Challan</span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenChallanModal(order)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Update Challan"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id, order.orderNo)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div>
            Showing <span className="font-bold text-slate-900">{filteredOrders.length}</span> of{' '}
            <span className="font-bold text-slate-900">{orders.length}</span> total order items
          </div>
          <div className="flex items-center gap-4">
            <span>
              Total Qty: <strong className="text-slate-900 font-mono">{filteredOrders.reduce((s, o) => s + (o.qty || 0), 0)}</strong>
            </span>
            <span>
              Filtered Amount:{' '}
              <strong className="text-emerald-700 font-mono">
                ₹{filteredOrders.reduce((s, o) => s + (o.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* MODAL 1: Update Challan Number Modal */}
      {isChallanModalOpen && selectedOrderForChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Map Challan Number</h3>
              </div>
              <button
                onClick={() => setIsChallanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveChallan} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">PI Number:</span>
                  <span className="font-mono font-bold text-blue-900">{selectedOrderForChallan.piNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedOrderForChallan.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-medium text-slate-800">{selectedOrderForChallan.itemName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Challan Number (e.g. SSIFPL/CH/0204) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={challanInput}
                  onChange={(e) => setChallanInput(e.target.value)}
                  placeholder="Enter Challan Number..."
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 uppercase"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Entering a Challan number automatically updates Status to <strong>COMPLETED</strong>.
                </p>
              </div>

              {selectedOrderForChallan.piNo && (
                <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <input
                    type="checkbox"
                    id="applyWholePI"
                    checked={applyToWholePI}
                    onChange={(e) => setApplyToWholePI(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="applyWholePI" className="text-xs text-amber-900 font-medium cursor-pointer">
                    Apply this Challan No to <strong>all items</strong> under PI: {selectedOrderForChallan.piNo}
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChallanModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Complete</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New KB Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Add New KB Order Entry</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Timestamp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date / Timestamp</label>
                  <input
                    type="text"
                    value={newOrder.timestamp}
                    onChange={(e) => setNewOrder({ ...newOrder, timestamp: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* PI No */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PI Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SS/MT/26-27/PI-1422"
                    value={newOrder.piNo}
                    onChange={(e) => setNewOrder({ ...newOrder, piNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Order No */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KB-ORDER-0263"
                    value={newOrder.orderNo}
                    onChange={(e) => setNewOrder({ ...newOrder, orderNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Party Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Party Name</label>
                  <input
                    type="text"
                    value={newOrder.partyName}
                    onChange={(e) => setNewOrder({ ...newOrder, partyName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deepak Chakki Fresh Atta 10kg"
                  value={newOrder.itemName}
                  onChange={(e) => setNewOrder({ ...newOrder, itemName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* QTY */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">QTY (Units)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOrder.qty}
                    onChange={(e) => setNewOrder({ ...newOrder, qty: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newOrder.amount}
                    onChange={(e) => setNewOrder({ ...newOrder, amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address</label>
                <input
                  type="text"
                  value={newOrder.billingAddress}
                  onChange={(e) => setNewOrder({ ...newOrder, billingAddress: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Supply Name and Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supply Name & Delivery Address</label>
                <textarea
                  rows={2}
                  placeholder="e.g. DDA COLONY, PANCHWATI, PALAM, NEW DELHI"
                  value={newOrder.supplyNameAddress}
                  onChange={(e) => setNewOrder({ ...newOrder, supplyNameAddress: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Challan No */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Challan Number (Optional — If filled, status will be Completed)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSIFPL/CH/0204"
                  value={newOrder.challanNo}
                  onChange={(e) => setNewOrder({ ...newOrder, challanNo: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono uppercase bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add KB Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
