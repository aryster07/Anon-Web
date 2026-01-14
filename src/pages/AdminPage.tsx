import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Send, CheckCircle, Eye,
  Instagram, Mail, Clock, Loader2, RefreshCw, LogOut, Lock, AlertCircle, Link2, Check
} from 'lucide-react';
import {
  getAllDeliveryRequests,
  markAsDelivered,
  DeliveryRequest
} from '@/lib/adminService';
import { sendDeliveredNotification } from '@/lib/emailService';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { Button } from '@/components/ui/button';

const ADMIN_EMAIL = 'aryanrana762@gmail.com';

const AdminPage = () => {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Verify component mounted
  useEffect(() => {
    console.log("AdminPage mounted");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    let unsubscribe: (() => void) | undefined;
    
    try {
      console.log("Setting up auth listener...");
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("Auth state changed:", currentUser?.email);
        setUser(currentUser);
        setAuthLoading(false);
        if (currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          loadRequests();
        }
      }, (error) => {
        console.error("Auth error:", error);
        setAuthLoading(false);
        setAuthError(error.message);
      });
    } catch (error: any) {
      console.error("Failed to setup auth listener:", error);
      setAuthLoading(false);
      setAuthError(error.message || "Failed to initialize authentication");
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [mounted]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Manually update user state after successful login
      if (result.user) {
        setUser(result.user);
        if (result.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          loadRequests();
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message || "Failed to login");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRequests([]);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      // Load delivery requests
      const data = await getAllDeliveryRequests();
      console.log('Raw data from Firebase:', data);

      // Decrypt ONLY logistics data needed for admin operations:
      // - recipientInstagram: For sending DM
      // - senderEmail: For sending delivery notification (kept encrypted until needed)
      const { decryptLogistics } = await import('@/lib/encryption');

      const decryptedData = data.map(req => {
        console.log('Processing request:', req.id, 'encryptedLogistics:', req.encryptedLogistics);
        
        // Check if there's an encryptedLogistics object (new format)
        if (req.encryptedLogistics && req.encryptedLogistics.recipientInstagram) {
          const decryptedInstagram = decryptLogistics(req.encryptedLogistics.recipientInstagram);
          console.log('Decrypted Instagram:', decryptedInstagram);
          
          return {
            ...req,
            // Only decrypt Instagram ID for DM delivery
            recipientInstagram: decryptedInstagram || '',
            // Keep senderEmail encrypted until delivery action
            senderEmail: req.encryptedLogistics.senderEmail || '',
            // Mark as encrypted so we decrypt email just-in-time during delivery
            _isEncrypted: true,
            // Hide all other sensitive fields
            recipientName: '[Private]',
            senderName: '[Private]',
            message: '[Encrypted]',
          };
        }
        
        // Legacy data or no encrypted logistics - use plain recipientInstagram if available
        return {
          ...req,
          recipientInstagram: req.recipientInstagram || '',
          recipientName: '[Private]',
          senderName: '[Private]',
          message: '[Encrypted]',
        };
      });

      setRequests(decryptedData);
    } catch (err: any) {
      console.error('Failed to load requests:', err);
      setPageError(err.message || 'Failed to load delivery requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleMarkDelivered = async (request: DeliveryRequest & { _isEncrypted?: boolean }) => {
    if (!request.id) return;
    setProcessingId(request.id);

    try {
      // Mark as delivered in Firebase
      await markAsDelivered(request.id);

      // Get decrypted email just in time
      let targetEmail = request.senderEmail;
      console.log('Original senderEmail (encrypted):', targetEmail);

      if (request._isEncrypted && targetEmail) {
        const { decryptLogistics } = await import('@/lib/encryption');
        targetEmail = decryptLogistics(targetEmail);
        console.log('Decrypted senderEmail:', targetEmail);
      }

      // Send email notification to sender that their note has been delivered
      if (targetEmail && targetEmail.includes('@')) {
        console.log('Sending delivery notification to:', targetEmail);
        const emailResult = await sendDeliveredNotification(
          targetEmail,
          'your special someone', // Generic placeholder since name is encrypted
          request.recipientInstagram
        );
        console.log('Email send result:', emailResult);
      } else {
        console.warn('No valid email found for notification');
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

  const handleCopyLink = async (request: DeliveryRequest) => {
    if (!request.id) return;
    
    // Construct the dedication link (no key needed - it's fetched from Firebase)
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/view/${request.id}`;
    
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(request.id);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Page Error State
  if (pageError || authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-gray-400 mb-4">{pageError || authError}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // Auth Loading State
  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <p className="text-white">Loading Admin Panel...</p>
      </div>
    );
  }

  // Not Logged In or Not Admin
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    console.log("Rendering login screen, user:", user?.email);
    try {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access Only</h1>
            <p className="text-gray-400 mb-8">Please login with the authorized administrator account.</p>

            {user && user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-sm text-red-400">
                Access denied for {user.email}
              </div>
            )}

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-sm text-red-400">
                {authError}
              </div>
            )}

            {user ? (
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                Sign Out
              </Button>
            ) : (
              <Button onClick={handleLogin} className="w-full bg-white text-black hover:bg-gray-200">
                Login with Google
              </Button>
            )}
          </div>
        </div>
      );
    } catch (e: any) {
      console.error("Login render error:", e);
      return <div className="min-h-screen bg-red-900 text-white p-8">Error rendering login: {e.message}</div>;
    }
  }

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
              onClick={loadRequests}
              disabled={loadingRequests}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <RefreshCw className={cn("w-5 h-5", loadingRequests && "animate-spin")} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors ml-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
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
                      {/* Request Info - Only Instagram ID visible */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {request.status === 'delivered' && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                              Delivered
                            </span>
                          )}
                          {request.status === 'pending' && (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                              Pending
                            </span>
                          )}
                          {request.viewedAt && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                              Viewed
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {/* ONLY Instagram ID is visible for DM delivery */}
                          {request.recipientInstagram && (
                            <a
                              href={`https://instagram.com/${request.recipientInstagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors font-medium"
                            >
                              <Instagram className="w-4 h-4" />
                              <span>@{request.recipientInstagram.replace('@', '')}</span>
                            </a>
                          )}

                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopyLink(request)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm",
                            copiedId === request.id
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          {copiedId === request.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Link2 className="w-4 h-4" />
                              Copy Link
                            </>
                          )}
                        </button>
                        
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
