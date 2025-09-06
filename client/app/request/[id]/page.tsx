'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OracleRequest, AIValidationLog } from '@/types';
import { mockRequests } from '@/lib/mock-data';
import { WalletService } from '@/lib/wallet';
import { APIService } from '@/lib/api';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Tag, 
  AlertTriangle, 
  CheckCircle, 
  Bot,
  Zap,
  Shield,
  FileText
} from 'lucide-react';

export default function RequestDetail() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<OracleRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [proposedAnswer, setProposedAnswer] = useState('');
  const [showAIValidation, setShowAIValidation] = useState(false);
  const [aiLogs, setAILogs] = useState<AIValidationLog[]>([]);

  const walletService = WalletService.getInstance();
  const apiService = APIService.getInstance();

  useEffect(() => {
    if (params.id) {
      const foundRequest = mockRequests.find(req => req.id === params.id);
      if (foundRequest) {
        setRequest(foundRequest);
        setAILogs(foundRequest.aiLogs || []);
      }
    }
  }, [params.id]);

  if (!request) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="terminal-box p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">REQUEST NOT FOUND</h1>
            <button
              onClick={() => router.push('/')}
              className="retro-button"
            >
              ← BACK TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSolve = async () => {
    if (!proposedAnswer.trim()) {
      alert('Please enter a proposed answer');
      return;
    }

    setIsLoading(true);
    try {
      const txId = await walletService.resolveData(request.id, proposedAnswer);
      console.log('Transaction ID:', txId);
      
      // Update local state (in real app, this would come from blockchain events)
      setRequest(prev => prev ? {
        ...prev,
        proposedAnswer,
        status: 'proposed',
        solver: walletService.getConnection()?.address || 'unknown'
      } : null);
      
      alert('Solution submitted successfully!');
      setProposedAnswer('');
    } catch (error) {
      console.error('Failed to submit solution:', error);
      alert('Failed to submit solution. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!confirm('Are you sure you want to dispute this answer? This will require a bond.')) {
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call a dispute function
      const txId = await walletService.validateData(request.id, false);
      console.log('Dispute transaction ID:', txId);
      
      setRequest(prev => prev ? {
        ...prev,
        status: 'disputed',
        disputedAt: Date.now()
      } : null);
      
      alert('Dispute submitted successfully!');
    } catch (error) {
      console.error('Failed to dispute:', error);
      alert('Failed to submit dispute. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIValidation = async () => {
    if (!request.proposedAnswer) {
      alert('No proposed answer to validate');
      return;
    }

    setIsLoading(true);
    setShowAIValidation(true);

    try {
      // Validate with both AI services
      const geminiValidation = await apiService.validateWithAI(
        request.question,
        request.proposedAnswer,
        'gemini'
      );

      const openaiValidation = await apiService.validateWithAI(
        request.question,
        request.proposedAnswer,
        'openai'
      );

      const newLogs = [geminiValidation, openaiValidation];
      setAILogs(prev => [...prev, ...newLogs]);

      // Update request with AI validation
      const avgConfidence = (geminiValidation.confidence + openaiValidation.confidence) / 2;
      const isValid = avgConfidence > 0.75;

      if (isValid) {
        const txId = await walletService.validateData(request.id, true);
        console.log('Validation transaction ID:', txId);
        
        setRequest(prev => prev ? {
          ...prev,
          status: 'validated',
          validatedAt: Date.now(),
          validator: 'AI_CONSENSUS',
          aiLogs: newLogs
        } : null);
      }

      alert(`AI Validation Complete! Average confidence: ${Math.round(avgConfidence * 100)}%`);
    } catch (error) {
      console.error('AI validation failed:', error);
      alert('AI validation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'proposed': return 'text-blue-500';
      case 'resolved': return 'text-green-500';
      case 'disputed': return 'text-red-500';
      case 'validated': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const formatDeadline = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff < 0) {
      return { text: 'EXPIRED', color: 'text-red-500' };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { 
      text: `${hours}h ${minutes}m remaining`, 
      color: hours < 1 ? 'text-red-500' : 'text-yellow-500' 
    };
  };

  const deadline = formatDeadline(request.deadline);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="terminal-box mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="retro-button flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO DASHBOARD</span>
          </button>
          
          <div className="text-sm text-muted-foreground">
            REQUEST ID: <span className="text-primary font-mono">{request.id}</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold terminal-glow mb-2">
          REQUEST DETAILS
        </h1>
        <div className="text-sm text-muted-foreground">
          // Oracle data request • Domain: {request.domain} • Status: {request.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="terminal-box p-6">
            <h2 className="text-xl font-bold terminal-glow mb-4">BASIC INFORMATION</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-sm text-gray-400">REQUESTER</div>
                  <div className="font-mono text-sm">{formatAddress(request.requester)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-sm text-gray-400">DOMAIN</div>
                  <div className="uppercase font-bold">{request.domain.replace('-', ' ')}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-sm text-gray-400">STATUS</div>
                  <div className={`uppercase font-bold ${getStatusColor(request.status)}`}>
                    {request.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-sm text-gray-400">DEADLINE</div>
                  <div className={`font-bold ${deadline.color}`}>
                    {deadline.text}
                  </div>
                </div>
              </div>

              {request.bondAmount && (
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-400">BOND AMOUNT</div>
                    <div className="font-bold">{request.bondAmount} STX</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question */}
          <div className="terminal-box p-6">
            <h2 className="text-xl font-bold terminal-glow mb-4">QUESTION</h2>
            <div className="bg-gray-900 p-4 border border-gray-600 rounded">
              <div className="text-yellow-500 font-mono">{request.question}</div>
            </div>
          </div>

          {/* Proposed Answer */}
          {request.proposedAnswer && (
            <div className="terminal-box p-6">
              <h2 className="text-xl font-bold terminal-glow mb-4">PROPOSED ANSWER</h2>
              <div className="bg-gray-900 p-4 border border-gray-600 rounded">
                <div className="text-green-500 font-mono">{request.proposedAnswer}</div>
                {request.solver && (
                  <div className="text-xs text-gray-400 mt-2">
                    Proposed by: {formatAddress(request.solver)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions and AI */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="terminal-box p-6">
            <h2 className="text-xl font-bold terminal-glow mb-4">ACTIONS</h2>
            
            {request.status === 'pending' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">PROPOSE SOLUTION</label>
                  <textarea
                    value={proposedAnswer}
                    onChange={(e) => setProposedAnswer(e.target.value)}
                    placeholder="Enter your proposed answer..."
                    className="w-full h-24 retro-input resize-none"
                  />
                </div>
                <button
                  onClick={handleSolve}
                  disabled={isLoading || !proposedAnswer.trim()}
                  className="w-full retro-button-blue flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isLoading ? 'SUBMITTING...' : 'SOLVE REQUEST'}</span>
                </button>
              </div>
            )}

            {request.status === 'proposed' && (
              <div className="space-y-4">
                <button
                  onClick={handleDispute}
                  disabled={isLoading}
                  className="w-full retro-button-danger flex items-center justify-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isLoading ? 'SUBMITTING...' : 'DISPUTE ANSWER'}</span>
                </button>

                <button
                  onClick={handleAIValidation}
                  disabled={isLoading}
                  className="w-full retro-button flex items-center justify-center space-x-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>{isLoading ? 'VALIDATING...' : 'VALIDATE WITH AI'}</span>
                </button>
              </div>
            )}

            {['resolved', 'disputed', 'validated'].includes(request.status) && (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <div className="text-sm text-gray-400">
                  This request has been {request.status}.
                </div>
              </div>
            )}
          </div>

          {/* AI Validation Logs */}
          {(showAIValidation || aiLogs.length > 0) && (
            <div className="terminal-box p-6">
              <h2 className="text-xl font-bold terminal-glow mb-4 flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>AI VALIDATION LOGS</span>
              </h2>
              
              <div className="space-y-4">
                {aiLogs.map((log, index) => (
                  <div key={log.id} className="border border-gray-600 p-4 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold uppercase text-blue-500">
                        {log.service}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Input:</span>
                        <div className="bg-gray-900 p-2 mt-1 rounded text-xs font-mono">
                          {log.input}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Output:</span>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-bold ml-2 ${
                          log.output === 'VALID' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                        }`}>
                          {log.output}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Confidence:</span>
                        <span className="ml-2 font-bold">
                          {Math.round(log.confidence * 100)}%
                        </span>
                      </div>
                      
                      {log.reasoning && (
                        <div>
                          <span className="text-gray-400">Reasoning:</span>
                          <div className="text-xs text-gray-300 mt-1">
                            {log.reasoning}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && showAIValidation && (
                  <div className="text-center py-4">
                    <Bot className="w-8 h-8 text-blue-500 animate-pulse mx-auto mb-2" />
                    <div className="text-sm text-gray-400 blinking">
                      AI VALIDATION IN PROGRESS...
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="terminal-box p-6">
            <h2 className="text-xl font-bold terminal-glow mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>TIMELINE</span>
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="ml-2">{new Date(request.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {request.resolvedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <span className="text-gray-400">Resolved:</span>
                    <span className="ml-2">{new Date(request.resolvedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}
              
              {request.disputedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <span className="text-gray-400">Disputed:</span>
                    <span className="ml-2">{new Date(request.disputedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}
              
              {request.validatedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <span className="text-gray-400">Validated:</span>
                    <span className="ml-2">{new Date(request.validatedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}