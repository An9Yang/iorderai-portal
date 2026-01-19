import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CallRecord, CallMessage, Order } from '../../types';
import { mockOrders } from '../../mock/data';

interface CallDetailModalProps {
  call: CallRecord;
  onClose: () => void;
}

// 模拟的后续对话（用于演示"通话中"状态）
const simulatedContinuation: CallMessage[] = [
  { id: 'sim1', role: 'customer', content: '我想点一份宫保鸡丁', timestamp: '' },
  { id: 'sim2', role: 'ai', content: '好的，宫保鸡丁一份 $15.99。请问还需要别的吗？', timestamp: '' },
  { id: 'sim3', role: 'customer', content: '再来一份炒饭，少放盐', timestamp: '' },
  { id: 'sim4', role: 'ai', content: '收到，炒饭 $12.99，已备注少放盐。要不要再来点饮料或者小吃？我们的柠檬茶和春卷都挺受欢迎的。', timestamp: '' },
  { id: 'sim5', role: 'customer', content: '那来一杯柠檬茶吧', timestamp: '' },
  { id: 'sim6', role: 'ai', content: '好的，柠檬茶 $3.99。您的订单：宫保鸡丁、炒饭少盐、柠檬茶，小计 $32.97。请问外卖还是自取？', timestamp: '' },
  { id: 'sim7', role: 'customer', content: '外卖，送到 123 Main Street', timestamp: '' },
  { id: 'sim8', role: 'ai', content: '好的，配送到 123 Main Street。加上配送费和税，总计 $42.55。支付方面，您可以用上次绑定的尾号 4567 的卡直接付款，或者绑定一张新卡，您选哪个？', timestamp: '' },
  { id: 'sim9', role: 'customer', content: '绑定新卡吧', timestamp: '' },
  { id: 'sim10', role: 'ai', content: '没问题。我现在给您发一条短信，里面有个链接，点进去就可以绑定新卡了。绑定成功后，下次您报尾号就能直接付款，不用再走一遍这个流程。', timestamp: '' },
  { id: 'sim11', role: 'customer', content: '好的，我看到短信了', timestamp: '' },
  { id: 'sim12', role: 'ai', content: '收到您的新卡绑定成功，尾号 8899。已完成扣款 $42.55，订单已生成。预计 30-40 分钟送达，祝您用餐愉快！', timestamp: '' },
];

const CallDetailModal: React.FC<CallDetailModalProps> = ({ call, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // 动态演示状态
  const [displayedMessages, setDisplayedMessages] = useState<CallMessage[]>([]);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingRole, setTypingRole] = useState<'customer' | 'ai'>('ai');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isLiveDemo, setIsLiveDemo] = useState(false);

  // 查找关联的订单
  const relatedOrder: Order | undefined = call.orderId 
    ? mockOrders.find(o => o.id === call.orderId) 
    : undefined;

  // 初始化显示消息（非通话中状态直接显示所有消息）
  useEffect(() => {
    if (call.status === 'in_progress') {
      // 通话中状态：启用动态演示
      setIsLiveDemo(true);
      setDisplayedMessages(call.transcript.slice(0, -1)); // 先显示除最后一条外的消息
      setMessageIndex(0);
    } else {
      // 其他状态：直接显示所有消息
      setDisplayedMessages(call.transcript);
      setIsLiveDemo(false);
    }
  }, [call]);

  // 动态演示逻辑
  useEffect(() => {
    if (!isLiveDemo) return;

    const allMessages = [...call.transcript.slice(-1), ...simulatedContinuation];
    
    if (messageIndex >= allMessages.length) {
      // 演示完成后循环
      const timer = setTimeout(() => {
        setDisplayedMessages(call.transcript.slice(0, -1));
        setMessageIndex(0);
      }, 3000);
      return () => clearTimeout(timer);
    }

    const currentMessage = allMessages[messageIndex];
    const typingSpeed = currentMessage.role === 'ai' ? 30 : 50; // AI 打字更快
    const pauseBeforeTyping = currentMessage.role === 'customer' ? 1500 : 800;

    // 开始打字前暂停
    const pauseTimer = setTimeout(() => {
      setTypingRole(currentMessage.role);
      setIsTyping(true);
      setCurrentTypingText('');

      let charIndex = 0;
      const typeTimer = setInterval(() => {
        if (charIndex < currentMessage.content.length) {
          setCurrentTypingText(currentMessage.content.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeTimer);
          setIsTyping(false);
          setCurrentTypingText('');
          
          // 添加完整消息到列表
          const newMessage: CallMessage = {
            ...currentMessage,
            id: `${currentMessage.id}-${Date.now()}`,
            timestamp: new Date().toISOString(),
          };
          setDisplayedMessages(prev => [...prev, newMessage]);
          setMessageIndex(prev => prev + 1);
        }
      }, typingSpeed);

      return () => clearInterval(typeTimer);
    }, pauseBeforeTyping);

    return () => clearTimeout(pauseTimer);
  }, [isLiveDemo, messageIndex, call.transcript]);

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedMessages, currentTypingText]);

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'missed':
        return 'bg-red-100 text-red-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending: t('orders.statusPending'),
      completed: t('orders.statusCompleted'),
      cancelled: t('orders.statusCancelled'),
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleOrderClick = () => {
    if (call.orderId) {
      onClose();
      navigate(`/orders?highlight=${call.orderId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full bg-white rounded-2xl shadow-xl transform transition-all ${
          relatedOrder ? 'max-w-6xl' : 'max-w-2xl'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {t('callRecords.callDetail')}
                </h3>
                {isLiveDemo && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    {t('callRecords.liveDemo')}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {call.callerPhone} → {call.receiverPhone}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Call Info Bar */}
          <div className={`px-6 py-3 border-b border-gray-200 ${isLiveDemo ? 'bg-gradient-to-r from-blue-50 to-green-50' : 'bg-gray-50'}`}>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">{new Date(call.startTime).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">{formatDuration(call.duration)}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(call.status)}`}>
                {call.status === 'in_progress' && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                )}
                {t(`callRecords.status.${call.status}`)}
              </span>
              {call.orderId && (
                <button
                  onClick={handleOrderClick}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors group"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-medium">{call.orderId}</span>
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex ${relatedOrder ? 'flex-col lg:flex-row' : ''}`}>
            {/* 左侧：对话记录 */}
            <div className={`${relatedOrder ? 'lg:w-1/2 lg:border-r border-gray-200' : 'w-full'}`}>
              {/* 对话标题 */}
              {relatedOrder && (
                <div className="px-6 py-3 bg-gradient-to-r from-gray-100 to-transparent border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {t('callRecords.conversationTitle')}
                    {isLiveDemo && (
                      <span className="text-xs text-blue-500 font-normal ml-2">
                        ({t('callRecords.realtimeTranscript')})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('callRecords.conversationHint')}</p>
                </div>
              )}
              
              {/* 对话内容 */}
              <div 
                ref={chatContainerRef}
                className="px-6 py-4 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto scroll-smooth"
              >
                {displayedMessages.length === 0 && !isTyping ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="mt-4 text-gray-500">{t('callRecords.noTranscript')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 已显示的消息 */}
                    {displayedMessages.map((message: CallMessage, index: number) => (
                      <div
                        key={`${message.id}-${index}`}
                        className={`flex ${message.role === 'customer' ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                      >
                        <div className="max-w-[85%]">
                          <div className={`text-xs font-medium mb-1 ${
                            message.role === 'customer' 
                              ? 'text-left text-gray-500' 
                              : 'text-right text-blue-500'
                          }`}>
                            {message.role === 'customer' ? t('callRecords.customer') : t('callRecords.ai')}
                          </div>
                          
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              message.role === 'customer'
                                ? 'bg-gray-100 text-gray-800 rounded-tl-md'
                                : 'bg-blue-500 text-white rounded-tr-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          
                          <div className={`text-xs text-gray-400 mt-1 ${
                            message.role === 'customer' ? 'text-left' : 'text-right'
                          }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 正在输入的消息 */}
                    {isTyping && (
                      <div className={`flex ${typingRole === 'customer' ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
                        <div className="max-w-[85%]">
                          <div className={`text-xs font-medium mb-1 ${
                            typingRole === 'customer' 
                              ? 'text-left text-gray-500' 
                              : 'text-right text-blue-500'
                          }`}>
                            {typingRole === 'customer' ? t('callRecords.customer') : t('callRecords.ai')}
                          </div>
                          
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              typingRole === 'customer'
                                ? 'bg-gray-100 text-gray-800 rounded-tl-md'
                                : 'bg-blue-500 text-white rounded-tr-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">
                              {currentTypingText}
                              <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-blink align-middle"></span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 通话中状态的等待指示器 */}
                    {isLiveDemo && !isTyping && (
                      <div className="flex justify-center py-2">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span>{t('callRecords.waitingForResponse')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：订单详情 */}
            {relatedOrder && (
              <div className="lg:w-1/2 border-t lg:border-t-0 border-gray-200">
                <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-transparent border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {t('callRecords.orderGenerated')}
                    </div>
                    {getOrderStatusBadge(relatedOrder.status)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('callRecords.orderVerifyHint')}</p>
                </div>

                <div className="px-6 py-4 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{t('orders.orderType')}</p>
                      <p className="font-medium text-sm mt-1">
                        <span className={`inline-flex items-center gap-1 ${
                          relatedOrder.orderType === 'delivery' ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {relatedOrder.orderType === 'delivery' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          )}
                          {relatedOrder.orderType === 'delivery' ? t('orders.delivery') : t('orders.pickup')}
                        </span>
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{t('orders.paymentMethod')}</p>
                      <p className="font-medium text-sm mt-1">
                        {relatedOrder.paymentMethod === 'card' ? t('orders.card') : t('orders.cash')}
                      </p>
                    </div>
                  </div>

                  {relatedOrder.orderType === 'delivery' && relatedOrder.deliveryAddress && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-xs text-amber-700 font-medium">{t('orders.deliveryAddress')}</p>
                          <p className="text-sm text-amber-900 mt-1">{relatedOrder.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {relatedOrder.notes && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <div>
                          <p className="text-xs text-purple-700 font-medium">{t('orders.orderNotes')}</p>
                          <p className="text-sm text-purple-900 mt-1">{relatedOrder.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{t('orders.items')}</span>
                      <span className="text-xs text-gray-500">({relatedOrder.items.length} {t('callRecords.itemsCount')})</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {relatedOrder.items.map((item) => (
                        <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            {item.notes && (
                              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {t('callRecords.specialNote')}: {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">×{item.quantity}</span>
                            <span className="text-sm font-medium text-gray-800 w-16 text-right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('orders.subtotal')}</span>
                      <span className="text-gray-700">${relatedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {relatedOrder.orderType === 'delivery' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('orders.deliveryFee')}</span>
                        <span className="text-gray-700">${relatedOrder.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('orders.tax')}</span>
                      <span className="text-gray-700">${relatedOrder.tax.toFixed(2)}</span>
                    </div>
                    {relatedOrder.tips > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('orders.tips')}</span>
                        <span className="text-gray-700">${relatedOrder.tips.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-800">{t('orders.total')}</span>
                      <span className="text-blue-600">${relatedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            {relatedOrder && (
              <button
                onClick={handleOrderClick}
                className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t('callRecords.goToOrder')}
              </button>
            )}
            <button
              onClick={onClose}
              className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${
                !relatedOrder ? 'ml-auto' : ''
              }`}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallDetailModal;
