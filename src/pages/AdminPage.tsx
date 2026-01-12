import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Send, CheckCircle, Eye, 
  Instagram, Mail, Clock, Loader2, RefreshCw, ExternalLink
} from 'lucide-react';
import { 
  getAllDeliveryRequests, 
  getAllDedications,
  markAsDelivered, 
  DeliveryRequest 
} from '@/lib/adminService';
import { sendDeliveredNotification } from '@/lib/emailService';
import { cn } from '@/lib/utils';

const AdminPage = () => {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [allDedications, setAllDedications] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      // Load delivery requests
      const data = await getAllDeliveryRequests();
      setRequests(data);
      
      // Also load all dedications for debugging
      const all = await getAllDedications();
      setAllDedications(all);
      console.log('All dedications:', all);
      console.log('Delivery requests (filtered):', data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleMarkDelivered = async (request: DeliveryRequest) => {
    if (!request.id) return;
    setProcessingId(request.id);
    
    try {
      // Mark as delivered in Firebase
      await markAsDelivered(request.id);
      
      // Send email notification to sender
      if (request.senderEmail) {
        await sendDeliveredNotification(
          request.senderEmail,
          request.recipientName,
          request.recipientInstagram
        );
      }
      
      // Refresh the list
      await loadRequests();
    } catch (err) {
      console.error('Failed to mark as delivered:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Portal</h1>
              <p className="text-xs text-gray-400">Manage delivery requests</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors text-yellow-400 text-sm"
            >
              {debugMode ? 'Hide Debug' : 'Debug'}
            </button>
            <button
              onClick={loadRequests}
              disabled={loadingRequests}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <RefreshCw className={cn("w-5 h-5", loadingRequests && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Debug Panel */}
        {debugMode && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8">
            <h3 className="text-yellow-400 font-semibold mb-4">🔍 Debug Info</h3>
            <div className="space-y-2 text-sm">
              <p className="text-white">
                <strong>Total dedications in DB:</strong> {allDedications.length}
              </p>
              <p className="text-white">
                <strong>Delivery requests (deliveryMethod='deliver'):</strong> {requests.length}
              </p>
              <div className="mt-4">
                <p className="text-yellow-400 font-medium mb-2">All Dedications:</p>
                <div className="bg-black/30 rounded-lg p-3 max-h-60 overflow-auto">
                  {allDedications.length === 0 ? (
                    <p className="text-gray-400">No dedications found in database</p>
                  ) : (
                    allDedications.map((d, i) => (
                      <div key={i} className="text-xs text-gray-300 mb-2 pb-2 border-b border-white/10">
                        <p><strong>ID:</strong> {d.id}</p>
                        <p><strong>deliveryMethod:</strong> {d.deliveryMethod || 'NOT SET'}</p>
                        <p><strong>recipientName:</strong> {d.recipientName}</p>
                        <p><strong>recipientInstagram:</strong> {d.recipientInstagram || 'N/A'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-400">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.status === 'delivered').length}
                </p>
                <p className="text-sm text-gray-400">Delivered</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.viewedAt).length}
                </p>
                <p className="text-sm text-gray-400">Opened</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Delivery Requests</h2>
          </div>

          {loadingRequests ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Mail className="w-12 h-12 mb-3 opacity-50" />
              <p>No delivery requests yet</p>
              <p className="text-sm mt-1">Requests with "Deliver for me" will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              <AnimatePresence>
                {requests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Request Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            To: {request.recipientName}
                          </span>
                          {request.status === 'delivered' && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                              Delivered
                            </span>
                          )}
                          {request.viewedAt && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                              Viewed
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {request.recipientInstagram && (
                            <a 
                              href={`https://instagram.com/${request.recipientInstagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors"
                            >
                              <Instagram className="w-4 h-4" />
                              <span>@{request.recipientInstagram.replace('@', '')}</span>
                            </a>
                          )}
                          
                          {request.senderEmail && (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Mail className="w-4 h-4" />
                              <span>{request.senderEmail}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                        </div>

                        {request.senderName && !request.isAnonymous && (
                          <p className="text-sm text-gray-400">
                            From: {request.senderName}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`/view/${request.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Preview
                        </a>
                        
                        {request.status !== 'delivered' && (
                          <button
                            onClick={() => handleMarkDelivered(request)}
                            disabled={processingId === request.id}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
